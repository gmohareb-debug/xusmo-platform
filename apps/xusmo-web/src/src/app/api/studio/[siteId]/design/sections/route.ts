// GET  /api/studio/[siteId]/design/sections — returns designDocument.pages
// PATCH /api/studio/[siteId]/design/sections — updates a specific page's sections

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

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { designDocument: true },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const doc = (site.designDocument as Record<string, unknown>) || {};
    const pages = doc.pages || {};
    const theme = doc.theme || {};

    return NextResponse.json({ pages, theme });
  } catch (error) {
    console.error("[studio/design/sections GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch sections" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    const session = await getServerSession(authOptions);
    const auth = await getStudioAuth(session?.user?.email, siteId, "edit");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { pageSlug, sections } = body;

    if (!pageSlug || typeof pageSlug !== "string") {
      return NextResponse.json(
        { error: "pageSlug is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { error: "sections must be an array" },
        { status: 400 }
      );
    }

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { designDocument: true },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const doc = (site.designDocument as Record<string, unknown>) || {};
    const pages = (doc.pages as Record<string, unknown>) || {};
    const currentPage = (pages[pageSlug] as Record<string, unknown>) || {};

    const updatedPages = {
      ...pages,
      [pageSlug]: {
        ...currentPage,
        sections,
      },
    };

    await prisma.site.update({
      where: { id: siteId },
      data: {
        designDocument: { ...doc, pages: updatedPages },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[studio/design/sections PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update sections" },
      { status: 500 }
    );
  }
}
