// GET /api/billing/status
// Returns current subscription status, plan, next billing date.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: {
          where: { status: { in: ["ACTIVE", "PAST_DUE", "TRIALING"] } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const subscription = user.subscriptions[0] ?? null;

    return NextResponse.json({
      hasSubscription: !!subscription,
      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status,
            planType: subscription.planType,
            billingCycle: subscription.billingCycle,
            amount: subscription.amount,
            currentPeriodEnd: subscription.currentPeriodEnd,
            canceledAt: subscription.canceledAt,
          }
        : null,
    });
  } catch (error) {
    console.error("[billing/status]", error);
    return NextResponse.json(
      { error: "Failed to get billing status" },
      { status: 500 }
    );
  }
}
