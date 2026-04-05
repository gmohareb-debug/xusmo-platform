// POST /api/admin/sites/[siteId]/plugins/[slug]/remove
// Removes a specific plugin from a site.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { removePlugin } from "@/lib/wordpress/plugins";

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
  { params }: { params: Promise<{ siteId: string; slug: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId, slug } = await params;

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true },
    });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const result = await removePlugin(siteId, slug);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[admin/sites/[siteId]/plugins/[slug]/remove]", error);
    return NextResponse.json(
      { error: "Failed to remove plugin" },
      { status: 500 }
    );
  }
}
