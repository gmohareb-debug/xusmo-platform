// POST /api/addons/checkout — Create Stripe Checkout for add-on purchase
// Body: { siteId, addOnSlug, bundleSlug? }

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { siteId, addOnSlug, bundleSlug } = body as {
    siteId: string;
    addOnSlug?: string;
    bundleSlug?: string;
  };

  if (!siteId || (!addOnSlug && !bundleSlug)) {
    return NextResponse.json({ error: "siteId and addOnSlug or bundleSlug required" }, { status: 400 });
  }

  // Verify site belongs to user
  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: token.sub },
  });
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const stripe = getStripe();
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3005";

  if (bundleSlug) {
    // Bundle checkout
    const bundle = await prisma.bundle.findUnique({
      where: { slug: bundleSlug },
      include: { items: { include: { addOn: true } } },
    });
    if (!bundle || !bundle.isActive) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }

    // Check for existing entitlements
    const existingSlugs = (await prisma.entitlement.findMany({
      where: { siteId, status: "ACTIVE" },
      include: { addOn: { select: { slug: true } } },
    })).map(e => e.addOn.slug);

    const newItems = bundle.items.filter(item => !existingSlugs.includes(item.addOn.slug));
    if (newItems.length === 0) {
      return NextResponse.json({ error: "All bundle add-ons already active" }, { status: 409 });
    }

    const totalALaCarte = newItems.reduce((sum, item) => sum + item.addOn.priceInCents, 0);
    const discountedTotal = Math.round(totalALaCarte * (1 - bundle.discountPct / 100));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: token.email as string,
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: bundle.name, description: bundle.description },
          unit_amount: discountedTotal,
        },
        quantity: 1,
      }],
      metadata: {
        type: "addon",
        siteId,
        bundleSlug,
        addOnSlugs: newItems.map(i => i.addOn.slug).join(","),
        userId: token.sub,
      },
      success_url: `${baseUrl}/studio/site/${siteId}/addons?success=true`,
      cancel_url: `${baseUrl}/studio/site/${siteId}/addons?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  }

  // Single add-on checkout
  const addOn = await prisma.addOn.findUnique({ where: { slug: addOnSlug! } });
  if (!addOn || !addOn.isActive) {
    return NextResponse.json({ error: "Add-on not found" }, { status: 404 });
  }

  // Check existing entitlement
  const existing = await prisma.entitlement.findUnique({
    where: { siteId_addOnId: { siteId, addOnId: addOn.id } },
  });
  if (existing && existing.status === "ACTIVE") {
    return NextResponse.json({ error: "Add-on already active" }, { status: 409 });
  }

  const mode = addOn.pricingType === "RECURRING" ? "subscription" : "payment";

  const lineItem: any = addOn.stripePriceId
    ? { price: addOn.stripePriceId, quantity: 1 }
    : {
        price_data: {
          currency: "usd",
          product_data: { name: addOn.name, description: addOn.description },
          unit_amount: addOn.priceInCents,
          ...(addOn.pricingType === "RECURRING" && addOn.interval
            ? { recurring: { interval: addOn.interval } }
            : {}),
        },
        quantity: 1,
      };

  const session = await stripe.checkout.sessions.create({
    mode: mode as "payment" | "subscription",
    customer_email: token.email as string,
    line_items: [lineItem],
    metadata: {
      type: "addon",
      siteId,
      addOnSlug: addOn.slug,
      userId: token.sub,
    },
    success_url: `${baseUrl}/studio/site/${siteId}/addons?success=true`,
    cancel_url: `${baseUrl}/studio/site/${siteId}/addons?canceled=true`,
  });

  return NextResponse.json({ url: session.url });
}
