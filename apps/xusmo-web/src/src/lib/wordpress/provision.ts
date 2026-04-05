/**
 * FACTORY ISOLATION CONTRACT (see FACTORY_PROVISION_SPEC.md)
 *
 * Every customer site is its own WordPress installation:
 * - Own filesystem path, own database, own salts, own credentials, own SSL
 * - Sites share VPS but NEVER share WP runtime state
 * - NO WordPress Multisite. NO shared wp-content. NO shared DB tables.
 * - Docker dev mode uses a single WP container for convenience only —
 *   production ALWAYS creates a fully isolated RunCloud web app per site.
 */

// =============================================================================
// Full Provisioning Pipeline
// Orchestrates WordPress site creation:
//   1. Clone Golden Image (dev: reuse existing WP)
//   2. Update site settings (title, tagline)
//   3. Inject page content
//   4. Create navigation menu
//   5. Create Site record in DB
//   6. Record Golden Image lineage
// Usage: import { provisionSite } from "@/lib/wordpress/provision";
// =============================================================================

import { prisma } from "@/lib/db";
import { cloneSite } from "./clone";
import {
  injectContent,
  updateSiteSettings,
  createMenu,
  createBlockNavigation,
  customizeFooter,
  type PageToCreate,
} from "./content";
import { getExecutor } from "./ssh";

// ---------------------------------------------------------------------------
// Main provisioning pipeline
// ---------------------------------------------------------------------------

export async function provisionSite(blueprintId: string) {
  // 1. Load Blueprint
  const blueprint = await prisma.blueprint.findUniqueOrThrow({
    where: { id: blueprintId },
    include: { lead: true },
  });

  const businessInfo = blueprint.businessInfo as {
    name: string;
    tagline: string;
    description: string;
    location?: string;
    phone?: string;
    email?: string;
  };

  const pages = blueprint.pages as Array<{
    slug: string;
    title: string;
    content?: string;
    blocks?: Array<{ type: string; data: Record<string, unknown>; order: number }>;
  }>;

  // 2. Clone/setup WordPress instance
  const siteMetadata = await cloneSite(blueprintId, businessInfo.name);

  // 3. Update site settings
  await updateSiteSettings(siteMetadata.siteSlug, {
    title: businessInfo.name,
    tagline: businessInfo.tagline,
  });

  // 4. Inject page content
  const pagesToCreate: PageToCreate[] = pages
    .filter((p) => p.content) // Only pages with generated content
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      content: p.content!,
    }));

  const pageIds = await injectContent(siteMetadata.siteSlug, pagesToCreate);

  // 5. Create navigation menu (classic + FSE block navigation)
  await createMenu(siteMetadata.siteSlug, pageIds);
  await createBlockNavigation(siteMetadata.siteSlug, pageIds);

  // 5b. Set pretty permalinks
  const wp = getExecutor();
  try {
    await wp.execute('rewrite structure "/%postname%/" --hard');
    await wp.execute("rewrite flush --hard");
  } catch {
    console.warn("[provision] Permalink setup failed (non-fatal)");
  }

  // 5c. Customize footer with business data
  try {
    await customizeFooter(siteMetadata.siteSlug, {
      name: businessInfo.name,
      address: businessInfo.location || undefined,
      phone: businessInfo.phone || undefined,
      email: businessInfo.email || undefined,
      tagline: businessInfo.tagline || undefined,
    });
  } catch {
    console.warn("[provision] Footer customization failed (non-fatal)");
  }

  // 6. Auto-select a matching theme from the pool
  const siteArchetype = blueprint.lead.archetype ?? "SERVICE";
  const matchingTheme = await prisma.themePoolEntry.findFirst({
    where: { archetype: siteArchetype },
    orderBy: { usageCount: "asc" },
    select: { id: true },
  });

  // Create Site record in DB
  const site = await prisma.site.create({
    data: {
      userId: blueprint.lead.userId,
      businessName: businessInfo.name,
      archetype: siteArchetype,
      industryId: blueprint.lead.industryId,
      wpUrl: siteMetadata.siteUrl,
      wpAdminUrl: siteMetadata.adminUrl,
      wpAdminUser: siteMetadata.adminUser,
      themePoolEntryId: matchingTheme?.id ?? null,
    },
  });

  // 7. Record Golden Image lineage (Factory Provision Spec §4)
  const activeGI = await prisma.goldenImage.findFirst({
    where: { archetype: blueprint.lead.archetype ?? "SERVICE", status: "ACTIVE" },
  });

  await prisma.site.update({
    where: { id: site.id },
    data: { goldenImageVersion: activeGI?.version ?? `GI-${blueprint.lead.archetype ?? "SERVICE"}-UNKNOWN` },
  });

  // Also record on the Build if one exists for this site
  const existingBuild = await prisma.build.findFirst({
    where: { siteId: site.id },
  });
  if (existingBuild && activeGI) {
    await prisma.build.update({
      where: { id: existingBuild.id },
      data: { goldenImageId: activeGI.version },
    });
  }

  // 8. Create Page records in DB for tracking
  let order = 0;
  for (const [slug, wpPostId] of pageIds) {
    const blueprintPage = pages.find((p) => p.slug === slug);
    await prisma.page.create({
      data: {
        siteId: site.id,
        slug,
        title: blueprintPage?.title ?? slug,
        content: blueprintPage?.content ?? null,
        isRequired: true,
        sortOrder: order++,
        wpPostId,
      },
    });
  }

  return {
    site,
    pageIds,
    siteUrl: siteMetadata.siteUrl,
  };
}
