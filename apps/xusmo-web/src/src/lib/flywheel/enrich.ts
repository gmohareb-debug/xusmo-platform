// =============================================================================
// Flywheel Enrichment Service
// Extracts themes and assets from completed sites to enrich the shared pools.
// This powers the data flywheel: every site built makes the next one better.
// =============================================================================

import { prisma } from "@/lib/db";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ThemeColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  bg?: string;
  surface?: string;
  text?: string;
  textMuted?: string;
  border?: string;
  [key: string]: string | undefined;
}

// ---------------------------------------------------------------------------
// Color Distance (Euclidean in RGB space)
// ---------------------------------------------------------------------------

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return [r, g, b];
}

/**
 * Calculate Euclidean distance between two hex colors.
 */
function colorDistance(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

/**
 * Calculate a "palette distance" — average Euclidean distance across
 * all paired color slots (primary-primary, secondary-secondary, etc.)
 */
function paletteDistance(a: ThemeColors, b: ThemeColors): number {
  const keys = ["primary", "secondary", "accent", "bg", "surface", "text"];
  let total = 0;
  let count = 0;
  for (const key of keys) {
    const c1 = a[key];
    const c2 = b[key];
    if (c1 && c2) {
      total += colorDistance(c1, c2);
      count++;
    }
  }
  return count > 0 ? total / count : 0;
}

// Threshold: color palettes with avg distance > 60 are considered "different enough"
const PALETTE_DISTANCE_THRESHOLD = 60;

// ---------------------------------------------------------------------------
// Enrich Theme from Site
// ---------------------------------------------------------------------------

/**
 * After a site is built and customized, extract its theme as a new
 * ThemePoolEntry if it's sufficiently different from existing themes.
 */
export async function enrichThemeFromSite(siteId: string): Promise<string | null> {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      themePoolEntry: true,
    },
  });

  if (!site) {
    console.log(`[flywheel/enrich] Site ${siteId} not found`);
    return null;
  }

  // If the site is using a pool theme, skip extraction (it's already in the pool)
  if (site.themePoolEntryId && site.themePoolEntry) {
    console.log(`[flywheel/enrich] Site ${siteId} uses pool theme ${site.themePoolEntryId}, skipping`);
    return null;
  }

  // We need to build a theme from the site's custom CSS / active preset
  // For now, we look at the site's current theme pool entry or active preset
  // If no theme pool entry is set, we can't extract meaningful theme data
  if (!site.activePreset) {
    console.log(`[flywheel/enrich] Site ${siteId} has no active preset or theme to extract`);
    return null;
  }

  // Look up the preset colors from the design system
  // For a real implementation, we'd parse the site's custom CSS or read from WP
  // MVP: We skip sites that already use a pool theme
  console.log(`[flywheel/enrich] Site ${siteId} has preset "${site.activePreset}" — evaluating for pool`);

  // Get all existing themes to check for uniqueness
  const existingThemes = await prisma.themePoolEntry.findMany({
    where: { status: "active" },
    select: { id: true, colors: true },
  });

  // For MVP, we need some color data to compare
  // In production, this would be read from the site's actual rendered styles
  // Placeholder: log and return null until we have color extraction from WP
  console.log(`[flywheel/enrich] Checked against ${existingThemes.length} existing themes`);

  return null; // Will be enhanced when we add color extraction from live sites
}

/**
 * Full theme extraction with explicit colors (used by the save-to-pool API).
 * Compares the provided theme against existing pool entries and saves
 * if sufficiently different.
 */
export async function extractAndSaveTheme(params: {
  name: string;
  archetype: "SERVICE" | "VENUE" | "PORTFOLIO" | "COMMERCE";
  industryTags: string[];
  colors: ThemeColors;
  fonts: Record<string, string>;
  borderRadius: Record<string, string>;
  buttonStyle: Record<string, string>;
  sectionPadding?: string;
  contentSize?: string;
  wideSize?: string;
  headingSizes?: Record<string, string>;
  createdBy: string;
}): Promise<{ saved: boolean; themeId?: string; reason?: string }> {
  // Get all existing active themes
  const existingThemes = await prisma.themePoolEntry.findMany({
    where: { status: "active" },
    select: { id: true, colors: true, name: true },
  });

  // Check if a theme with identical name already exists
  const nameMatch = existingThemes.find(
    (t) => t.name.toLowerCase() === params.name.toLowerCase()
  );
  if (nameMatch) {
    return { saved: false, reason: "A theme with this name already exists" };
  }

  // Check color distance against all existing themes
  for (const existing of existingThemes) {
    const existingColors = existing.colors as ThemeColors;
    const distance = paletteDistance(params.colors, existingColors);
    if (distance < PALETTE_DISTANCE_THRESHOLD) {
      return {
        saved: false,
        reason: `Too similar to existing theme "${existing.name}" (distance: ${Math.round(distance)})`,
      };
    }
  }

  // Generate slug
  const slug = params.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Check slug uniqueness
  const existingSlug = await prisma.themePoolEntry.findUnique({
    where: { slug },
  });
  const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

  // Save the new theme
  const theme = await prisma.themePoolEntry.create({
    data: {
      name: params.name,
      slug: finalSlug,
      archetype: params.archetype,
      industryTags: params.industryTags,
      colors: params.colors as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      fonts: params.fonts as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      borderRadius: params.borderRadius as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      buttonStyle: params.buttonStyle as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      sectionPadding: params.sectionPadding ?? "4rem",
      contentSize: params.contentSize ?? "800px",
      wideSize: params.wideSize ?? "1200px",
      headingSizes: params.headingSizes as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      isSystem: false,
      status: "active",
      createdBy: params.createdBy,
    },
  });

  console.log(`[flywheel/enrich] Saved new theme: ${theme.name} (${theme.id})`);

  return { saved: true, themeId: theme.id };
}

// ---------------------------------------------------------------------------
// Enrich Assets from Site
// ---------------------------------------------------------------------------

/**
 * After a site is built, save any unique images to the AssetPoolEntry table.
 * Checks for duplicates by URL to avoid storing the same image twice.
 */
export async function enrichAssetsFromSite(siteId: string): Promise<number> {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      pages: {
        select: { blocks: true, slug: true },
      },
    },
  });

  if (!site) {
    console.log(`[flywheel/enrich] Site ${siteId} not found for asset extraction`);
    return 0;
  }

  // Extract image URLs from page blocks
  const imageUrls: string[] = [];

  for (const page of site.pages) {
    if (!page.blocks) continue;
    const blocks = page.blocks as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    for (const block of blocks) {
      // Look for image URLs in block data
      if (block.data?.imageUrl) imageUrls.push(block.data.imageUrl);
      if (block.data?.backgroundImage) imageUrls.push(block.data.backgroundImage);
      if (block.data?.images && Array.isArray(block.data.images)) {
        for (const img of block.data.images) {
          if (typeof img === "string") imageUrls.push(img);
          else if (img?.url) imageUrls.push(img.url);
        }
      }
    }
  }

  if (imageUrls.length === 0) {
    console.log(`[flywheel/enrich] No images found in site ${siteId}`);
    return 0;
  }

  // Check for existing assets by URL
  const existingAssets = await prisma.assetPoolEntry.findMany({
    where: { url: { in: imageUrls } },
    select: { url: true },
  });
  const existingUrls = new Set(existingAssets.map((a) => a.url));

  // Filter to only new unique URLs
  const newUrls = [...new Set(imageUrls)].filter((url) => !existingUrls.has(url));

  if (newUrls.length === 0) {
    console.log(`[flywheel/enrich] All images from site ${siteId} already in pool`);
    return 0;
  }

  // Save new assets
  const assets = newUrls.map((url) => ({
    type: "hero_image" as const,
    industryTags: site.industryId ? [site.industryId] : [],
    archetypeTags: [site.archetype],
    moodTags: [],
    url,
    isSystem: false,
    status: "active",
    createdBy: site.userId,
  }));

  const created = await prisma.assetPoolEntry.createMany({
    data: assets,
    skipDuplicates: true,
  });

  console.log(
    `[flywheel/enrich] Saved ${created.count} new assets from site ${siteId}`
  );

  return created.count;
}

// ---------------------------------------------------------------------------
// Update Theme Ratings
// ---------------------------------------------------------------------------

/**
 * Recalculate theme ratings based on usage signals:
 * - Themes used by sites that go LIVE: +1
 * - Themes used by sites with revisions (user edited): -0.5
 * - Normalized to 0-5 scale
 */
export async function updateThemeRatings(): Promise<number> {
  const themes = await prisma.themePoolEntry.findMany({
    where: { status: "active" },
    select: {
      id: true,
      usageCount: true,
      sites: {
        select: {
          id: true,
          status: true,
          revisions: {
            select: { id: true },
          },
        },
      },
    },
  });

  let updated = 0;

  for (const theme of themes) {
    if (theme.sites.length === 0) continue;

    let score = 0;

    for (const site of theme.sites) {
      // Sites that go live boost the rating
      if (site.status === "LIVE") {
        score += 1;
      }

      // Sites with revisions (user wasn't happy) reduce rating
      if (site.revisions.length > 0) {
        score -= 0.5;
      }
    }

    // Normalize: divide by number of sites, scale to 0-5
    const rawRating = theme.sites.length > 0 ? score / theme.sites.length : 0;
    // Map from [-0.5, 1] range to [0, 5] range
    const normalizedRating = Math.min(5, Math.max(0, ((rawRating + 0.5) / 1.5) * 5));
    const finalRating = Math.round(normalizedRating * 10) / 10;

    await prisma.themePoolEntry.update({
      where: { id: theme.id },
      data: { rating: finalRating },
    });

    updated++;
  }

  console.log(`[flywheel/enrich] Updated ratings for ${updated} themes`);
  return updated;
}
