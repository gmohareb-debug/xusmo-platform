// GET /api/admin/sites/[siteId]/plugins
// Lists site plugins from SitePlugin table.

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

export async function GET(
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

    const plugins = await prisma.sitePlugin.findMany({
      where: { siteId },
      orderBy: { installedAt: "desc" },
      include: {
        plugin: {
          select: {
            name: true,
            status: true,
            riskLevel: true,
            category: true,
            latestVersion: true,
            isBanned: true,
          },
        },
      },
    });

    return NextResponse.json(plugins);
  } catch (error) {
    console.error("[admin/sites/[siteId]/plugins]", error);
    return NextResponse.json(
      { error: "Failed to load plugins" },
      { status: 500 }
    );
  }
}
