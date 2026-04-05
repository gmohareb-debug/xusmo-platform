// =============================================================================
// Studio Backup API — Create backups and list backup history
// POST /api/studio/[siteId]/backup — trigger backup
// GET  /api/studio/[siteId]/backup — get backup status
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";
import { createBackup } from "@/lib/backup/backup";

// ---------------------------------------------------------------------------
// GET — get backup status and recent health checks with backup info
// ---------------------------------------------------------------------------

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

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { lastBackupAt: true, businessName: true },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Get recent health checks that contain backup info
    const recentChecks = await prisma.siteHealthCheck.findMany({
      where: { siteId },
      orderBy: { checkedAt: "desc" },
      take: 10,
      select: {
        id: true,
        backupOk: true,
        checkedAt: true,
        issues: true,
      },
    });

    // Check if backup is overdue (older than 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const backupOverdue = !site.lastBackupAt || site.lastBackupAt < sevenDaysAgo;

    return NextResponse.json({
      lastBackupAt: site.lastBackupAt,
      backupOverdue,
      recentChecks,
    });
  } catch (error) {
    console.error("[studio/backup GET]", error);
    return NextResponse.json(
      { error: "Failed to load backup status" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST — trigger a new backup
// ---------------------------------------------------------------------------

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    const session = await getServerSession(authOptions);
    const auth = await getStudioAuth(session?.user?.email, siteId, "manage");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true, businessName: true },
    });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const result = await createBackup(siteId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Backup failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      backupId: result.backupId,
      timestamp: result.timestamp,
    }, { status: 201 });
  } catch (error) {
    console.error("[studio/backup POST]", error);
    return NextResponse.json(
      { error: "Failed to create backup" },
      { status: 500 }
    );
  }
}
