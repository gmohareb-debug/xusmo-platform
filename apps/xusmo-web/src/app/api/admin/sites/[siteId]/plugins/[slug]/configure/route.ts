// POST /api/admin/sites/[siteId]/plugins/[slug]/configure
// Configures a plugin with the provided config object.
// Body: config object

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { configurePlugin } from "@/lib/wordpress/plugins";

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
  { params }: { params: Promise<{ siteId: string; slug: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId, slug } = await params;
    const config = await req.json();

    if (!config || typeof config !== "object") {
      return NextResponse.json(
        { error: "Config object is required" },
        { status: 400 }
      );
    }

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true },
    });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const result = await configurePlugin(siteId, slug, config);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[admin/sites/[siteId]/plugins/[slug]/configure]", error);
    return NextResponse.json(
      { error: "Failed to configure plugin" },
      { status: 500 }
    );
  }
}
