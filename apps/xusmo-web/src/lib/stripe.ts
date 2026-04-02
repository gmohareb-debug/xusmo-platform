// =============================================================================
// Stripe Billing Integration
// Handles subscriptions, checkout sessions, webhooks, and customer management.
// Usage: import { stripe, createCheckoutSession, handleWebhook } from "@/lib/stripe";
// =============================================================================

import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { sendNotification } from "@/lib/notifications/email";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-01-28.clover",
    });
  }
  return _stripe;
}

// Backwards-compatible export
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop]; // eslint-disable-line @typescript-eslint/no-explicit-any
  },
});

// ---------------------------------------------------------------------------
// Pricing configuration
// ---------------------------------------------------------------------------

const PLANS: Record<
  string,
  { monthly: number; annual: number; tierAmount: number; hostingAmount: number }
> = {
  BASIC: { monthly: 11.99, annual: 143.88, tierAmount: 0, hostingAmount: 11.99 },
  PRO: { monthly: 21.98, annual: 263.76, tierAmount: 9.99, hostingAmount: 11.99 },
  AGENCY: { monthly: 41.98, annual: 503.76, tierAmount: 29.99, hostingAmount: 11.99 },
};

// ---------------------------------------------------------------------------
// createCustomer — creates Stripe customer, saves to User
// ---------------------------------------------------------------------------

export async function createCustomer(
  userId: string,
  email: string,
  name?: string
) {
  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: { userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

// ---------------------------------------------------------------------------
// createCheckoutSession — creates Stripe Checkout for subscription
// ---------------------------------------------------------------------------

export async function createCheckoutSession(
  userId: string,
  planType: "BASIC" | "PRO" | "AGENCY",
  billingCycle: "MONTHLY" | "ANNUAL",
  siteId?: string
) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  // Create Stripe customer if not exists
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    customerId = await createCustomer(userId, user.email!, user.name ?? undefined);
  }

  const plan = PLANS[planType];
  if (!plan) throw new Error(`Invalid plan: ${planType}`);

  const amount = billingCycle === "ANNUAL" ? plan.annual : plan.monthly;
  const interval = billingCycle === "ANNUAL" ? "year" : "month";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Xusmo ${planType} Plan`,
            description:
              billingCycle === "ANNUAL"
                ? `${planType} plan — annual billing (includes free domain)`
                : `${planType} plan — monthly billing`,
          },
          unit_amount: Math.round(amount * 100),
          recurring: { interval: interval as "month" | "year" },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      planType,
      billingCycle,
      ...(siteId ? { siteId } : {}),
    },
    success_url: `${process.env.NEXT_PUBLIC_URL}/portal?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
  });

  return { url: session.url, sessionId: session.id };
}

// ---------------------------------------------------------------------------
// createPortalSession — Stripe Customer Portal
// ---------------------------------------------------------------------------

export async function createPortalSession(stripeCustomerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_URL}/portal/billing`,
  });

  return { url: session.url };
}

// ---------------------------------------------------------------------------
// handleWebhook — processes Stripe webhook events
// ---------------------------------------------------------------------------

export async function handleWebhook(payload: string | Buffer, signature: string) {
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaid(invoice);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(invoice);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(subscription);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(subscription);
      break;
    }

    default:
      console.log(`[stripe] Unhandled event: ${event.type}`);
  }

  return { received: true };
}

// ---------------------------------------------------------------------------
// Webhook handlers
// ---------------------------------------------------------------------------

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planType = session.metadata?.planType as string;
  const billingCycle = session.metadata?.billingCycle as string;
  const siteId = session.metadata?.siteId;
  const subscriptionId = session.subscription as string;

  if (!userId || !planType || !subscriptionId) return;

  const plan = PLANS[planType];
  if (!plan) return;

  // Fetch full subscription from Stripe
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const subItem = sub.items.data[0];

  await prisma.subscription.create({
    data: {
      userId,
      siteId: siteId ?? null,
      status: "ACTIVE",
      stripeSubscriptionId: subscriptionId,
      stripePriceId: subItem?.price?.id ?? "",
      planType: planType as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      billingCycle: (billingCycle as any) ?? "MONTHLY", // eslint-disable-line @typescript-eslint/no-explicit-any
      amount: billingCycle === "ANNUAL" ? plan.annual : plan.monthly,
      hostingAmount: plan.hostingAmount,
      tierAmount: plan.tierAmount,
      currentPeriodStart: subItem ? new Date(subItem.current_period_start * 1000) : new Date(),
      currentPeriodEnd: subItem ? new Date(subItem.current_period_end * 1000) : new Date(),
    },
  });

  // Activate site if linked
  if (siteId) {
    await prisma.site.update({
      where: { id: siteId },
      data: {
        status: "LIVE",
        tier: planType as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      },
    });
  }

  console.log(`[stripe] Subscription created: ${subscriptionId} for user ${userId}`);

  // Send payment success notification
  sendNotification(userId, "PAYMENT_SUCCESS", {
    planName: planType,
    amount: `$${billingCycle === "ANNUAL" ? plan.annual.toFixed(2) : plan.monthly.toFixed(2)}`,
    nextBillingDate: "See dashboard for details",
  }).catch((err) => console.error("[stripe] Notification error:", err));
}

function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const sub = invoice.parent?.subscription_details?.subscription;
  if (!sub) return null;
  return typeof sub === "string" ? sub : sub.id;
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = getSubscriptionIdFromInvoice(invoice);
  if (!subscriptionId) return;

  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const subItem = sub.items.data[0];

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      status: "ACTIVE",
      currentPeriodStart: subItem ? new Date(subItem.current_period_start * 1000) : undefined,
      currentPeriodEnd: subItem ? new Date(subItem.current_period_end * 1000) : undefined,
    },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = getSubscriptionIdFromInvoice(invoice);
  if (!subscriptionId) return;

  const dbSub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: "PAST_DUE" },
  });

  if (dbSub) {
    sendNotification(dbSub.userId, "PAYMENT_FAILED", {
      planName: dbSub.planType,
    }).catch((err) => console.error("[stripe] Notification error:", err));
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const status = subscription.status === "active" ? "ACTIVE" : "PAST_DUE";
  const subItem = subscription.items.data[0];

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: status as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      currentPeriodStart: subItem ? new Date(subItem.current_period_start * 1000) : undefined,
      currentPeriodEnd: subItem ? new Date(subItem.current_period_end * 1000) : undefined,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const dbSub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!dbSub) return;

  await prisma.subscription.update({
    where: { id: dbSub.id },
    data: {
      status: "CANCELED",
      canceledAt: new Date(),
    },
  });

  // Suspend site
  if (dbSub.siteId) {
    await prisma.site.update({
      where: { id: dbSub.siteId },
      data: { status: "SUSPENDED" },
    });
  }

  console.log(`[stripe] Subscription canceled: ${subscription.id}`);

  // Send cancellation notification
  sendNotification(dbSub.userId, "SUBSCRIPTION_CANCELED", {
    planName: dbSub.planType,
    businessName: dbSub.siteId ? "your site" : "",
  }).catch((err) => console.error("[stripe] Notification error:", err));
}
