// POST /api/admin/sites/[siteId]/plugins/refresh
// Syncs plugin list from WordPress for this site.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSitePlugins } from "@/lib/wordpress/plugins";

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

    const result = await getSitePlugins(siteId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[admin/sites/[siteId]/plugins/refresh]", error);
    return NextResponse.json(
      { error: "Failed to refresh plugins" },
      { status: 500 }
    );
  }
}
