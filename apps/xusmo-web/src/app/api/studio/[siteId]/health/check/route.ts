// POST /api/studio/[siteId]/health/check — trigger fresh health check
// Enhanced: includes live site probe when wpUrl is available

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";
import { checkSiteHealth } from "@/lib/monitoring/health";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    const session = await getServerSession(authOptions);
    const auth = await getStudioAuth(session?.user?.email, siteId, "edit");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: {
        wpUrl: true,
        sslActive: true,
        sslExpiresAt: true,
        wpVersion: true,
        themeVersion: true,
        lastBackupAt: true,
      },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Check plugin status
    const plugins = await prisma.sitePlugin.findMany({
      where: { siteId },
      select: { updateAvailable: true },
    });
    const pluginsOk = plugins.every((p) => p.updateAvailable === null);

    // Check SSL validity
    const sslOk =
      site.sslActive &&
      (site.sslExpiresAt ? site.sslExpiresAt > new Date() : true);

    // Check backup recency (within 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const backupOk = site.lastBackupAt ? site.lastBackupAt > sevenDaysAgo : false;

    // Calculate health score (internal checks)
    let score = 100;
    if (!sslOk) score -= 25;
    if (!backupOk) score -= 20;
    if (!pluginsOk) score -= 15;
    if (!site.wpVersion) score -= 10;
    if (!site.themeVersion) score -= 10;

    // Live site probe (if wpUrl is available)
    let liveHealth = null;
    let uptimeOk = true;
    let responseTimeMs: number | null = null;

    if (site.wpUrl) {
      liveHealth = await checkSiteHealth(site.wpUrl);
      uptimeOk = liveHealth.status !== "down";
      responseTimeMs = liveHealth.responseTime;

      // Factor live health into score
      if (liveHealth.status === "down") {
        score -= 30;
      } else if (liveHealth.status === "degraded") {
        score -= 15;
      }
    }

    const finalScore = Math.max(0, Math.min(100, score));

    const healthCheck = await prisma.siteHealthCheck.create({
      data: {
        siteId,
        healthScore: finalScore,
        responseTimeMs,
        wpVersionOk: !!site.wpVersion,
        themeVersionOk: !!site.themeVersion,
        pluginsOk,
        sslOk,
        backupOk,
        uptimeOk,
        issues: {
          sslExpired: !sslOk,
          backupOutdated: !backupOk,
          pluginsOutdated: !pluginsOk,
          wpVersionMissing: !site.wpVersion,
          themeVersionMissing: !site.themeVersion,
          siteDown: !uptimeOk,
          ...(liveHealth
            ? {
                liveChecks: liveHealth.checks.map((c) => ({
                  name: c.name,
                  status: c.status,
                  detail: c.detail ?? null,
                })),
              }
            : {}),
        },
      },
    });

    // Update site-level health fields
    await prisma.site.update({
      where: { id: siteId },
      data: {
        healthScore: finalScore,
        lastHealthCheck: new Date(),
        ...(responseTimeMs !== null ? { responseTimeMs } : {}),
      },
    });

    return NextResponse.json(
      {
        ...healthCheck,
        liveHealth: liveHealth
          ? {
              status: liveHealth.status,
              responseTime: liveHealth.responseTime,
              checks: liveHealth.checks,
            }
          : null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[studio/health/check POST]", error);
    return NextResponse.json(
      { error: "Failed to run health check" },
      { status: 500 }
    );
  }
}
