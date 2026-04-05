// POST /api/admin/sites/[siteId]/health-check
// Triggers a health check for a specific site and returns the result.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkSiteHealth } from "@/lib/monitoring/checker";

// Check admin auth
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true },
    });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const report = await checkSiteHealth(siteId);

    // Store health check result
    const healthScore = Math.round(
      (report.checks.filter((c) => c.passed).length / report.checks.length) *
        100
    );

    await prisma.siteHealthCheck.create({
      data: {
        siteId,
        healthScore,
        wpVersionOk: report.checks.find((c) => c.name === "core_update")?.passed ?? true,
        pluginsOk: report.checks.find((c) => c.name === "plugin_updates")?.passed ?? true,
        uptimeOk: report.checks.find((c) => c.name === "responsive")?.passed ?? true,
        issues: report.checks.filter((c) => !c.passed) as any,
      },
    });

    // Update site healthScore
    await prisma.site.update({
      where: { id: siteId },
      data: {
        healthScore,
        lastHealthCheck: new Date(),
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error("[admin/sites/[siteId]/health-check]", error);
    return NextResponse.json(
      { error: "Health check failed" },
      { status: 500 }
    );
  }
}
