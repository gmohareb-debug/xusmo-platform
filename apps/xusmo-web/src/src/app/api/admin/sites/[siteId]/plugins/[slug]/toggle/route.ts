// POST /api/admin/sites/[siteId]/plugins/[slug]/toggle
// Toggles a plugin active/inactive.
// Body: { activate }

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { togglePlugin } from "@/lib/wordpress/plugins";

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
    const body = await req.json();
    const { activate } = body;

    if (typeof activate !== "boolean") {
      return NextResponse.json(
        { error: "activate must be a boolean" },
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

    const result = await togglePlugin(siteId, slug, activate);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[admin/sites/[siteId]/plugins/[slug]/toggle]", error);
    return NextResponse.json(
      { error: "Failed to toggle plugin" },
      { status: 500 }
    );
  }
}
