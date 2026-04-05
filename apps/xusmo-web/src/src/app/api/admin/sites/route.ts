// GET /api/admin/sites
// Lists all sites with managed status, healthScore, managedPlan, user email.
// Supports ?managed=true filter.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Check admin auth
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const managedFilter = searchParams.get("managed");

    const where: Record<string, unknown> = {};
    if (managedFilter === "true") {
      where.managed = true;
    } else if (managedFilter === "false") {
      where.managed = false;
    }

    const sites = await prisma.site.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, name: true } },
      },
    });

    return NextResponse.json(
      sites.map((s) => ({
        id: s.id,
        businessName: s.businessName,
        status: s.status,
        tier: s.tier,
        wpUrl: s.wpUrl,
        managed: s.managed,
        managedPlan: s.managedPlan,
        managedFee: s.managedFee,
        managedStartedAt: s.managedStartedAt,
        managedCanceledAt: s.managedCanceledAt,
        healthScore: s.healthScore,
        responseTimeMs: s.responseTimeMs,
        lighthouseScore: s.lighthouseScore,
        sslActive: s.sslActive,
        lastHealthCheck: s.lastHealthCheck,
        userEmail: s.user.email,
        userName: s.user.name,
        createdAt: s.createdAt,
        publishedAt: s.publishedAt,
      }))
    );
  } catch (error) {
    console.error("[admin/sites]", error);
    return NextResponse.json(
      { error: "Failed to load sites" },
      { status: 500 }
    );
  }
}
