// POST /api/studio/[siteId]/content/[pageSlug]/rollback — restore a content version

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";
import { syncPageToWordPress } from "@/lib/wordpress/sync";

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

    const body = await req.json();
    const { versionId } = body;

    if (!versionId) {
      return NextResponse.json(
        { error: "versionId is required" },
        { status: 400 }
      );
    }

    const page = await prisma.page.findUnique({
      where: { siteId_slug: { siteId, slug: pageSlug } },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const version = await prisma.contentVersion.findFirst({
      where: { id: versionId, pageId: page.id, siteId },
    });

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    // Save current page state as a new ContentVersion before rolling back
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
        savedBy: auth.userId,
        saveReason: "pre-rollback",
      },
    });

    // Replace Page content with the version snapshot fields
    const updatedPage = await prisma.page.update({
      where: { id: page.id },
      data: {
        heroHeadline: version.heroHeadline,
        heroSubheadline: version.heroSubheadline,
        ctaLabel: version.ctaLabel,
        bodyContent: version.bodyContent ?? undefined,
        metaTitle: version.metaTitle,
        metaDesc: version.metaDescription,
      },
    });

    // Fire-and-forget sync to WordPress
    syncPageToWordPress(siteId, pageSlug).catch((err) => {
      console.error("[studio/content/rollback] WP sync failed:", err);
    });

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error("[studio/content/rollback POST]", error);
    return NextResponse.json(
      { error: "Failed to rollback content" },
      { status: 500 }
    );
  }
}
