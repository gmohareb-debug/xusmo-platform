// =============================================================================
// Flywheel Hooks — Fire-and-forget triggers for the data flywheel
// Called at key lifecycle moments to enrich the shared theme/asset pools.
// =============================================================================

import { prisma } from "@/lib/db";
import {
  enrichThemeFromSite,
  enrichAssetsFromSite,
} from "@/lib/flywheel/enrich";

/**
 * Called when a site goes live (status → LIVE).
 * Triggers theme and asset enrichment, updates usage counts.
 */
export function onSitePublished(siteId: string): void {
  // Fire-and-forget — don't block the publish flow
  (async () => {
    try {
      console.log(`[flywheel/hook] Site published: ${siteId}`);

      // 1. Try to extract and save the site's theme to the pool
      await enrichThemeFromSite(siteId);

      // 2. Extract unique images and add to the asset pool
      await enrichAssetsFromSite(siteId);

      // 3. Update the theme usage count if it uses a pool theme
      const site = await prisma.site.findUnique({
        where: { id: siteId },
        select: { themePoolEntryId: true },
      });

      if (site?.themePoolEntryId) {
        await prisma.themePoolEntry.update({
          where: { id: site.themePoolEntryId },
          data: { usageCount: { increment: 1 } },
        });
        console.log(
          `[flywheel/hook] Incremented usage count for theme ${site.themePoolEntryId}`
        );
      }

      console.log(`[flywheel/hook] Enrichment complete for site ${siteId}`);
    } catch (err) {
      console.error(`[flywheel/hook] Error in onSitePublished for ${siteId}:`, err);
    }
  })();
}

/**
 * Called when a theme from the pool is applied to a site.
 * Increments the theme's usage count.
 */
export function onThemeApplied(themeId: string): void {
  // Fire-and-forget
  (async () => {
    try {
      await prisma.themePoolEntry.update({
        where: { id: themeId },
        data: { usageCount: { increment: 1 } },
      });
      console.log(`[flywheel/hook] Theme applied: ${themeId} — usage count incremented`);
    } catch (err) {
      console.error(`[flywheel/hook] Error in onThemeApplied for ${themeId}:`, err);
    }
  })();
}
