// GET /api/studio/[siteId]/health — aggregated health data

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    const session = await getServerSession(authOptions);
    const auth = await getStudioAuth(session?.user?.email, siteId, "view");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get latest health check
    const latestCheck = await prisma.siteHealthCheck.findFirst({
      where: { siteId },
      orderBy: { checkedAt: "desc" },
    });

    // Get site details for SSL and general info
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: {
        sslActive: true,
        sslExpiresAt: true,
        wpVersion: true,
        themeVersion: true,
        lastBackupAt: true,
        lastHealthCheck: true,
        healthScore: true,
        responseTimeMs: true,
        lighthouseScore: true,
        lastCheckedAt: true,
      },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Get plugin info
    const plugins = await prisma.sitePlugin.findMany({
      where: { siteId },
      select: {
        id: true,
        slug: true,
        version: true,
        isActive: true,
        updateAvailable: true,
        lastCheckedAt: true,
      },
    });

    const pluginsNeedingUpdate = plugins.filter((p) => p.updateAvailable !== null);

    return NextResponse.json({
      latestCheck,
      ssl: {
        active: site.sslActive,
        expiresAt: site.sslExpiresAt,
      },
      wordpress: {
        version: site.wpVersion,
        themeVersion: site.themeVersion,
      },
      backup: {
        lastBackupAt: site.lastBackupAt,
      },
      performance: {
        healthScore: site.healthScore,
        responseTimeMs: site.responseTimeMs,
        lighthouseScore: site.lighthouseScore,
        lastCheckedAt: site.lastCheckedAt,
      },
      plugins: {
        total: plugins.length,
        active: plugins.filter((p) => p.isActive).length,
        needingUpdate: pluginsNeedingUpdate.length,
        list: plugins,
      },
    });
  } catch (error) {
    console.error("[studio/health GET]", error);
    return NextResponse.json(
      { error: "Failed to load health data" },
      { status: 500 }
    );
  }
}
