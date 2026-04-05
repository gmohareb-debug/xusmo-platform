// POST /api/billing/checkout
// Creates a Stripe Checkout session for subscription.
// Body: { planType, billingCycle, siteId? }

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";

const schema = z.object({
  planType: z.enum(["BASIC", "PRO", "AGENCY"]),
  billingCycle: z.enum(["MONTHLY", "ANNUAL"]).default("MONTHLY"),
  siteId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Find user by email
    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const result = await createCheckoutSession(
      user.id,
      parsed.data.planType,
      parsed.data.billingCycle,
      parsed.data.siteId
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[billing/checkout]", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
