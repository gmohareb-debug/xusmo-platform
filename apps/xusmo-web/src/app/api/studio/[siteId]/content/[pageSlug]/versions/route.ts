// GET/POST /api/studio/[siteId]/content/[pageSlug]/versions
// GET: list ContentVersions for a page
// POST: save current page content (creates a version snapshot + updates live page)

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";
import { syncPageToWordPress } from "@/lib/wordpress/sync";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string; pageSlug: string }> }
) {
  try {
    const { siteId, pageSlug } = await params;

    const session = await getServerSession(authOptions);
    const auth = await getStudioAuth(session?.user?.email, siteId, "view");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const page = await prisma.page.findUnique({
      where: { siteId_slug: { siteId, slug: pageSlug } },
      select: { id: true },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const versions = await prisma.contentVersion.findMany({
      where: { pageId: page.id, siteId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(versions);
  } catch (error) {
    console.error("[studio/content/versions GET]", error);
    return NextResponse.json(
      { error: "Failed to load content versions" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST: Save content — creates a version snapshot and updates the live page
// ---------------------------------------------------------------------------

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string; pageSlug: string }> }
) {
  try {
    const { siteId, pageSlug } = await params;

    const session = await getServerSession(authOptions);
    const auth = await getStudioAuth(session?.user?.email, siteId, "edit");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const page = await prisma.page.findUnique({
      where: { siteId_slug: { siteId, slug: pageSlug } },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      heroHeadline,
      heroSubheadline,
      ctaLabel,
      bodyContent,
      metaTitle,
      metaDescription,
      saveReason,
    } = body;

    // 1. Create a version snapshot of the current content
    await prisma.contentVersion.create({
      data: {
        pageId: page.id,
        siteId,
        heroHeadline: page.heroHeadline,
        heroSubheadline: page.heroSubheadline,
        ctaLabel: page.ctaLabel,
        bodyContent: page.bodyContent ?? undefined,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDesc,
        savedBy: session?.user?.email ?? "unknown",
        saveReason: saveReason ?? "manual save",
      },
    });

    // 2. Update the live page with new content
    await prisma.page.update({
      where: { id: page.id },
      data: {
        heroHeadline: heroHeadline ?? page.heroHeadline,
        heroSubheadline: heroSubheadline ?? page.heroSubheadline,
        ctaLabel: ctaLabel ?? page.ctaLabel,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        bodyContent: bodyContent !== undefined ? (bodyContent as any) : page.bodyContent,
        metaTitle: metaTitle ?? page.metaTitle,
        metaDesc: metaDescription ?? page.metaDesc,
      },
    });

    // Fire-and-forget sync to WordPress
    syncPageToWordPress(siteId, pageSlug).catch((err) => {
      console.error("[studio/content/versions] WP sync failed:", err);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[studio/content/versions POST]", error);
    return NextResponse.json(
      { error: "Failed to save content" },
      { status: 500 }
    );
  }
}
