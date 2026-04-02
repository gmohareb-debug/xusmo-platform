// PUT /api/studio/[siteId]/seo
// Saves SEO meta data for site pages and syncs to WordPress Yoast meta.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getExecutor } from "@/lib/wordpress/ssh";

interface PageSeoUpdate {
  slug: string;
  metaTitle: string;
  metaDesc: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;
    const body = await req.json();
    const { pages: pageUpdates } = body as { pages: PageSeoUpdate[] };

    if (!Array.isArray(pageUpdates) || pageUpdates.length === 0) {
      return NextResponse.json({ error: "No page SEO data provided" }, { status: 400 });
    }

    // Verify site ownership
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { userId: true, wpUrl: true },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Update each page's SEO data in the database
    let pagesUpdated = 0;
    for (const update of pageUpdates) {
      const page = await prisma.page.findFirst({
        where: { siteId, slug: update.slug },
      });
      if (!page) continue;

      await prisma.page.update({
        where: { id: page.id },
        data: {
          metaTitle: update.metaTitle || null,
          metaDesc: update.metaDesc || null,
        },
      });

      // Sync to WordPress Yoast meta if the page has a WP post ID
      if (page.wpPostId) {
        try {
          const wp = getExecutor(siteId);
          if (update.metaTitle) {
            await wp.execute(
              `post meta update ${page.wpPostId} _yoast_wpseo_title "${escapeShell(update.metaTitle)}"`
            );
          }
          if (update.metaDesc) {
            await wp.execute(
              `post meta update ${page.wpPostId} _yoast_wpseo_metadesc "${escapeShell(update.metaDesc.slice(0, 160))}"`
            );
          }
          // OG meta
          if (update.ogTitle) {
            await wp.execute(
              `post meta update ${page.wpPostId} _yoast_wpseo_opengraph-title "${escapeShell(update.ogTitle)}"`
            );
          }
          if (update.ogDescription) {
            await wp.execute(
              `post meta update ${page.wpPostId} _yoast_wpseo_opengraph-description "${escapeShell(update.ogDescription)}"`
            );
          }
          // Twitter meta
          if (update.twitterTitle) {
            await wp.execute(
              `post meta update ${page.wpPostId} _yoast_wpseo_twitter-title "${escapeShell(update.twitterTitle)}"`
            );
          }
          if (update.twitterDescription) {
            await wp.execute(
              `post meta update ${page.wpPostId} _yoast_wpseo_twitter-description "${escapeShell(update.twitterDescription)}"`
            );
          }
        } catch (wpErr) {
          console.warn(`[seo-api] WP sync failed for "${update.slug}":`, wpErr);
        }
      }

      pagesUpdated++;
    }

    return NextResponse.json({ success: true, pagesUpdated });
  } catch (err) {
    console.error("[seo-api] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save SEO data" },
      { status: 500 }
    );
  }
}

function escapeShell(str: string): string {
  return str.replace(/"/g, '\\"').replace(/\$/g, "\\$").replace(/`/g, "\\`");
}
