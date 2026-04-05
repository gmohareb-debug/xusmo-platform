// =============================================================================
// Managed Service Billing Integration
// Handles subscriptions, cancellations, and webhooks for managed website plans.
// Plans: ESSENTIAL ($29/mo), PREMIUM ($79/mo)
// Usage: import { createManagedSubscription, cancelManagedSubscription, handleManagedWebhook } from "@/lib/billing/managed";
// =============================================================================

import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";

// ---------------------------------------------------------------------------
// Plan configuration
// ---------------------------------------------------------------------------

const MANAGED_FEES: Record<"ESSENTIAL" | "PREMIUM", number> = {
  ESSENTIAL: 29,
  PREMIUM: 79,
};

const MANAGED_PRICE_ENV: Record<"ESSENTIAL" | "PREMIUM", string> = {
  ESSENTIAL: "STRIPE_PRICE_MANAGED_ESSENTIAL_MONTHLY",
  PREMIUM: "STRIPE_PRICE_MANAGED_PREMIUM_MONTHLY",
};

// ---------------------------------------------------------------------------
// Helper — check if Stripe is configured
// ---------------------------------------------------------------------------

function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

// ---------------------------------------------------------------------------
// Helper — get a Stripe instance (dynamic import, graceful if not installed)
// ---------------------------------------------------------------------------

async function getStripeInstance() {
  if (!isStripeConfigured()) return null;

  try {
    const { default: Stripe } = await import("stripe");
    return new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-01-28.clover",
    });
  } catch {
    console.warn("[managed] Stripe SDK not available — skipping Stripe API calls");
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helper — get or create Stripe customer for a user
// ---------------------------------------------------------------------------

async function getOrCreateCustomer(
  stripe: import("stripe").default,
  user: { id: string; email: string | null; name: string | null; stripeCustomerId: string | null }
): Promise<string> {
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user.email ?? undefined,
    name: user.name ?? undefined,
    metadata: { userId: user.id },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

// ---------------------------------------------------------------------------
// Helper — resolve all managed price IDs from env
// ---------------------------------------------------------------------------

function getManagedPriceIds(): string[] {
  return [
    process.env.STRIPE_PRICE_MANAGED_ESSENTIAL_MONTHLY,
    process.env.STRIPE_PRICE_MANAGED_PREMIUM_MONTHLY,
  ].filter(Boolean) as string[];
}

// ---------------------------------------------------------------------------
// createManagedSubscription
// ---------------------------------------------------------------------------

export async function createManagedSubscription(
  siteId: string,
  plan: "ESSENTIAL" | "PREMIUM"
): Promise<{ success: true; plan: "ESSENTIAL" | "PREMIUM"; fee: number }> {
  // 1. Load site with user relation
  const site = await prisma.site.findUniqueOrThrow({
    where: { id: siteId },
    include: { user: true },
  });

  // 2. Determine price & fee
  const stripePriceId = process.env[MANAGED_PRICE_ENV[plan]];
  const fee = MANAGED_FEES[plan];

  // 3. Stripe subscription (if configured)
  const stripe = await getStripeInstance();
  let stripeSubscriptionId: string | undefined;

  if (stripe && stripePriceId) {
    const customerId = await getOrCreateCustomer(stripe, site.user);

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: stripePriceId }],
      metadata: {
        siteId,
        type: "managed",
        managedPlan: plan,
      },
    });

    stripeSubscriptionId = subscription.id;
  }

  // 4. Update site record
  await prisma.site.update({
    where: { id: siteId },
    data: {
      managed: true,
      managedPlan: plan,
      managedFee: fee,
      managedStartedAt: new Date(),
      managedCanceledAt: null,
    },
  });

  // 5. Activity log
  await logActivity(
    siteId,
    "managed_subscription_created",
    "billing",
    "info",
    `Managed ${plan} subscription created ($${fee}/mo)${stripeSubscriptionId ? ` — Stripe: ${stripeSubscriptionId}` : ""}`,
    { plan, fee, stripeSubscriptionId },
    site.userId
  );

  return { success: true, plan, fee };
}

// ---------------------------------------------------------------------------
// cancelManagedSubscription
// ---------------------------------------------------------------------------

export async function cancelManagedSubscription(
  siteId: string
): Promise<{ success: true }> {
  // 1. Load site
  const site = await prisma.site.findUniqueOrThrow({
    where: { id: siteId },
    include: { user: true },
  });

  // 2. Cancel Stripe subscription if applicable
  const stripe = await getStripeInstance();

  if (stripe && site.user.stripeCustomerId) {
    try {
      // Find the managed subscription for this customer/site
      const subscriptions = await stripe.subscriptions.list({
        customer: site.user.stripeCustomerId,
        status: "active",
      });

      for (const sub of subscriptions.data) {
        if (sub.metadata?.siteId === siteId && sub.metadata?.type === "managed") {
          await stripe.subscriptions.cancel(sub.id);
          break;
        }
      }
    } catch (error) {
      console.error("[managed] Failed to cancel Stripe subscription:", error);
      // Continue with DB update even if Stripe call fails
    }
  }

  // 3. Update site record
  await prisma.site.update({
    where: { id: siteId },
    data: {
      managed: false,
      managedPlan: null,
      managedFee: 0,
      managedCanceledAt: new Date(),
    },
  });

  // 4. Activity log
  await logActivity(
    siteId,
    "managed_subscription_canceled",
    "billing",
    "info",
    `Managed subscription canceled for site ${siteId}`,
    { previousPlan: site.managedPlan, previousFee: site.managedFee },
    site.userId
  );

  return { success: true };
}

// ---------------------------------------------------------------------------
// handleManagedWebhook
// ---------------------------------------------------------------------------

export async function handleManagedWebhook(
  event: { type: string; data: { object: any } } // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<{ handled: boolean }> {
  const managedPriceIds = getManagedPriceIds();

  switch (event.type) {
    // ----- subscription created -----
    case "customer.subscription.created": {
      const subscription = event.data.object;
      const priceId = subscription?.items?.data?.[0]?.price?.id;

      if (!priceId || !managedPriceIds.includes(priceId)) {
        return { handled: false };
      }

      const siteId = subscription.metadata?.siteId;
      if (!siteId) return { handled: false };

      // Determine which plan based on price
      const plan: "ESSENTIAL" | "PREMIUM" =
        priceId === process.env.STRIPE_PRICE_MANAGED_ESSENTIAL_MONTHLY
          ? "ESSENTIAL"
          : "PREMIUM";

      await prisma.site.update({
        where: { id: siteId },
        data: {
          managed: true,
          managedPlan: plan,
          managedFee: MANAGED_FEES[plan],
          managedStartedAt: new Date(),
          managedCanceledAt: null,
        },
      });

      await logActivity(
        siteId,
        "managed_subscription_confirmed",
        "billing",
        "info",
        `Managed ${plan} subscription confirmed via Stripe webhook`,
        { stripeSubscriptionId: subscription.id, priceId }
      );

      return { handled: true };
    }

    // ----- subscription deleted -----
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const siteId = subscription.metadata?.siteId;

      if (!siteId) return { handled: false };

      // Verify this is a managed subscription
      const priceId = subscription?.items?.data?.[0]?.price?.id;
      const isManagedSub =
        (priceId && managedPriceIds.includes(priceId)) ||
        subscription.metadata?.type === "managed";

      if (!isManagedSub) return { handled: false };

      await prisma.site.update({
        where: { id: siteId },
        data: {
          managed: false,
          managedPlan: null,
          managedFee: 0,
          managedCanceledAt: new Date(),
        },
      });

      await logActivity(
        siteId,
        "managed_subscription_deleted",
        "billing",
        "warning",
        `Managed subscription deleted via Stripe webhook`,
        { stripeSubscriptionId: subscription.id }
      );

      return { handled: true };
    }

    // ----- payment failed -----
    case "invoice.payment_failed": {
      const invoice = event.data.object;

      // Resolve subscription from invoice
      const subscriptionId =
        invoice?.parent?.subscription_details?.subscription ??
        invoice?.subscription;

      if (!subscriptionId) return { handled: false };

      // Look up site by checking subscription metadata (need Stripe)
      // Fall back: try to find site by matching subscription in our metadata
      const stripe = await getStripeInstance();
      let siteId: string | null = null;

      if (stripe) {
        try {
          const subId =
            typeof subscriptionId === "string" ? subscriptionId : subscriptionId.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          siteId = sub.metadata?.siteId ?? null;

          // Only handle managed subscriptions
          if (sub.metadata?.type !== "managed") {
            const priceId = sub.items?.data?.[0]?.price?.id;
            if (!priceId || !managedPriceIds.includes(priceId)) {
              return { handled: false };
            }
          }
        } catch {
          console.error("[managed] Could not retrieve subscription for payment failure");
          return { handled: false };
        }
      }

      // Log critical activity
      await logActivity(
        siteId,
        "managed_payment_failed",
        "billing",
        "critical",
        `Managed service payment failed — invoice ${invoice.id ?? "unknown"}`,
        {
          invoiceId: invoice.id,
          subscriptionId,
          amountDue: invoice.amount_due,
          currency: invoice.currency,
        }
      );

      // Create AgentApproval for admin review
      // Find or use a billing-related agent; fall back to first available agent
      let agentId: string | null = null;
      try {
        const billingAgent = await prisma.adminAgent.findFirst({
          where: {
            OR: [
              { name: "billing" },
              { name: "billing-monitor" },
              { name: { contains: "billing" } },
            ],
          },
        });

        if (billingAgent) {
          agentId = billingAgent.id;
        } else {
          // Create a placeholder agent for billing approvals
          const created = await prisma.adminAgent.create({
            data: {
              name: "billing-monitor",
              displayName: "Billing Monitor",
              description: "Monitors billing events and escalates payment failures for admin review.",
              isEnabled: true,
              managedOnly: true,
            },
          });
          agentId = created.id;
        }

        await prisma.agentApproval.create({
          data: {
            agentId,
            action: "review_managed_payment_failure",
            reason: `Payment failed for managed service — invoice ${invoice.id ?? "unknown"}, site ${siteId ?? "unknown"}. Requires admin review to determine next steps (retry, contact customer, suspend service).`,
            priority: "URGENT",
            metadata: {
              invoiceId: invoice.id,
              subscriptionId,
              siteId,
              amountDue: invoice.amount_due,
              currency: invoice.currency,
            },
          },
        });
      } catch (error) {
        console.error("[managed] Failed to create AgentApproval for payment failure:", error);
      }

      return { handled: true };
    }

    default:
      return { handled: false };
  }
}
