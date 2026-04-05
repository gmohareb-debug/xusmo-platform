// GET /api/admin/stats
// Returns dashboard metrics for the admin panel.

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

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalSites,
      sitesByStatus,
      activeSubscriptions,
      buildsToday,
      failedBuilds,
      recentBuilds,
      recentUsers,
      llmCostToday,
      avgBuildTime,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.site.count(),
      prisma.site.groupBy({ by: ["status"], _count: true }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.build.count({ where: { createdAt: { gte: last24h } } }),
      prisma.build.count({ where: { status: { in: ["FAILED", "QA_FAILED"] } } }),
      prisma.build.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          blueprint: { select: { lead: { select: { businessName: true, industryName: true } } } },
        },
      }),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      prisma.build.aggregate({
        where: { createdAt: { gte: last24h } },
        _sum: { totalLlmCost: true },
      }),
      prisma.build.aggregate({
        where: { status: { in: ["PREVIEW_READY", "APPROVED", "PUBLISHED"] } },
        _avg: { totalBuildTime: true },
      }),
    ]);

    // Calculate MRR
    const activeSubs = await prisma.subscription.findMany({
      where: { status: "ACTIVE" },
      select: { amount: true, billingCycle: true },
    });
    const mrr = activeSubs.reduce((sum, s) => {
      return sum + (s.billingCycle === "ANNUAL" ? s.amount / 12 : s.amount);
    }, 0);

    return NextResponse.json({
      totalUsers,
      totalSites,
      sitesByStatus: Object.fromEntries(
        sitesByStatus.map((s) => [s.status, s._count])
      ),
      activeSubscriptions,
      mrr: Math.round(mrr * 100) / 100,
      buildsToday,
      failedBuilds,
      llmCostToday: llmCostToday._sum.totalLlmCost ?? 0,
      avgBuildTime: avgBuildTime._avg.totalBuildTime ?? 0,
      recentBuilds: recentBuilds.map((b) => ({
        id: b.id,
        status: b.status,
        businessName: b.blueprint?.lead?.businessName ?? "Unknown",
        industry: b.blueprint?.lead?.industryName ?? "Unknown",
        archetype: b.archetype,
        progress: b.progress,
        currentAgent: b.currentAgent,
        totalLlmCost: b.totalLlmCost,
        totalBuildTime: b.totalBuildTime,
        createdAt: b.createdAt,
      })),
      recentUsers,
    });
  } catch (error) {
    console.error("[admin/stats]", error);
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    );
  }
}
