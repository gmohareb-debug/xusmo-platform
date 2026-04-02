// POST /api/admin/sites/[siteId]/plugins/install
// Installs a plugin on a site.
// Body: { slug, activate? }

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { installPlugin } from "@/lib/wordpress/plugins";

// Check admin auth
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;
    const body = await req.json();
    const { slug, activate } = body;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { error: "Plugin slug is required" },
        { status: 400 }
      );
    }

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true, wpUrl: true },
    });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const result = await installPlugin(siteId, slug, activate ?? false);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[admin/sites/[siteId]/plugins/install]", error);
    return NextResponse.json(
      { error: "Failed to install plugin" },
      { status: 500 }
    );
  }
}
