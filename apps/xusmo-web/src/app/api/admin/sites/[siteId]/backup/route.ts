// POST /api/admin/sites/[siteId]/backup
// Triggers a backup for a specific site.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getExecutor } from "@/lib/wordpress/ssh";

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
      select: { id: true, businessName: true, wpDirectory: true },
    });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const wp = getExecutor(siteId);

    // Export database
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupName = `backup-${siteId}-${timestamp}`;
    const dbExport = await wp.execute(`db export /tmp/${backupName}.sql`);

    // Update site lastBackupAt
    await prisma.site.update({
      where: { id: siteId },
      data: { lastBackupAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      siteId,
      backupName,
      timestamp: new Date().toISOString(),
      dbExport: dbExport.trim(),
    });
  } catch (error) {
    console.error("[admin/sites/[siteId]/backup]", error);
    return NextResponse.json(
      { error: "Backup failed" },
      { status: 500 }
    );
  }
}
