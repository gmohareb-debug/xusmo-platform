// POST /api/billing/webhook
// Stripe webhook endpoint — no auth (Stripe signature verification).
// Requires raw body (not parsed JSON).

import { NextRequest, NextResponse } from "next/server";
import { handleWebhook, getStripe } from "@/lib/stripe";
import { handleManagedWebhook } from "@/lib/billing/managed";
import { prisma } from "@/lib/db";

// Managed subscription events that should be forwarded to the managed handler
const MANAGED_EVENTS = new Set([
  "customer.subscription.created",
  "customer.subscription.deleted",
  "invoice.payment_failed",
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    // Run the existing webhook handler (subscription/checkout billing)
    await handleWebhook(body, signature);

    // Also forward relevant events to the managed service webhook handler.
    // Construct the event once more from the verified payload.
    try {
      const stripe = getStripe();
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      if (MANAGED_EVENTS.has(event.type)) {
        await handleManagedWebhook({
          type: event.type,
          data: { object: event.data.object },
        });
      }

      // Handle add-on events
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as { metadata?: Record<string, string> };
        if (session.metadata?.type === "addon") {
          const { siteId, addOnSlug, addOnSlugs } = session.metadata;
          const slugs = addOnSlugs ? addOnSlugs.split(",") : addOnSlug ? [addOnSlug] : [];

          for (const slug of slugs) {
            const addOn = await prisma.addOn.findUnique({ where: { slug } });
            if (addOn && siteId) {
              await prisma.entitlement.upsert({
                where: { siteId_addOnId: { siteId, addOnId: addOn.id } },
                update: { status: "ACTIVE", grantedAt: new Date() },
                create: { siteId, addOnId: addOn.id, status: "ACTIVE" },
              });
              console.log(`[billing/webhook] Entitlement created: ${slug} for site ${siteId}`);
            }
          }
        }
      }

      if (event.type === "customer.subscription.deleted") {
        // Check if this is an add-on subscription cancellation
        const sub = event.data.object as { id: string };
        const entitlement = await prisma.entitlement.findFirst({
          where: { stripeSubItemId: sub.id },
        });
        if (entitlement) {
          await prisma.entitlement.update({
            where: { id: entitlement.id },
            data: { status: "CANCELLED" },
          });
          console.log(`[billing/webhook] Entitlement cancelled: ${entitlement.id}`);
        }
      }
    } catch (managedError) {
      // Log but don't fail the overall webhook — the primary handler already succeeded
      console.error("[billing/webhook] Managed handler error:", managedError);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[billing/webhook]", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
