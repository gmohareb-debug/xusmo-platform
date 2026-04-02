// GET /api/portal/dashboard
// Returns dashboard data: user info, stats, site summaries.

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
        sites: {
          select: {
            id: true,
            businessName: true,
            status: true,
            wpUrl: true,
            tier: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        subscriptions: {
          where: { status: { in: ["ACTIVE", "PAST_DUE", "TRIALING"] } },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { planType: true, currentPeriodEnd: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const sub = user.subscriptions[0];

    return NextResponse.json({
      userName: user.name,
      totalSites: user.sites.length,
      currentPlan: sub?.planType ?? null,
      nextBillingDate: sub?.currentPeriodEnd ?? null,
      sites: user.sites,
    });
  } catch (error) {
    console.error("[portal/dashboard]", error);
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
