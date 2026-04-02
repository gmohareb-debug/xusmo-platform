// =============================================================================
// Page Reassembly — Re-builds page content with different pattern layouts
// Called when a theme is applied to change the structural design.
//
// reassemblePagesForTheme(siteId) — Reads blueprint data, hydrates new patterns,
//   updates Page records, and syncs to WordPress.
// =============================================================================

import { prisma } from "@/lib/db";
import {
  classifyDesignStyle,
  getPageLayoutWithDesignPackage,
  type DesignPackage,
  type DesignStyle,
  type PatternSlug,
} from "./pattern-registry";
import { hydratePattern } from "./pattern-hydrator";
import { buildFallbackSlots } from "@/agents/content.agent";
import { syncPageToWordPress } from "./sync";
import { getExecutor } from "./ssh";
import { searchSectionImages, type SectionImageResult } from "@/lib/images/pexels";
import { uploadHeroImage } from "./content";
import type { Archetype } from "@/lib/classification/archetypes";

const USE_MULTI_THEME = process.env.USE_MULTI_THEME === "true";

// Design style → header/footer variant file mappings
const STYLE_TEMPLATE_PARTS: Record<DesignStyle, { header: string; footer: string }> = {
  "dark-luxury":        { header: "header-transparent", footer: "footer-dark" },
  "clean-corporate":    { header: "header",             footer: "footer" },
  "bold-startup":       { header: "header-bold",        footer: "footer-centered" },
  "elegant-studio":     { header: "header-minimal",     footer: "footer-minimal" },
  "industrial":         { header: "header-bold",         footer: "footer-dark" },
  "warm-friendly":      { header: "header",             footer: "footer-4col" },
  "creative-portfolio": { header: "header-transparent", footer: "footer-centered" },
  "modern-gradient":    { header: "header-centered",    footer: "footer-centered" },
};

/**
 * Re-assemble ALL pages for a site after a theme change.
 * Uses fallback slots only (no LLM) for instant results.
 * Reads per-page layouts from the theme's designPackage (homeLayout,
 * aboutLayout, servicesLayout, contactLayout), falling back to
 * archetype defaults when not specified.
 */
export async function reassemblePagesForTheme(siteId: string): Promise<{
  pagesUpdated: number;
  designStyle: DesignStyle;
}> {
  // 1. Load the site + theme + blueprint data
  const site = await prisma.site.findUniqueOrThrow({
    where: { id: siteId },
    include: {
      themePoolEntry: true,
      build: {
        include: {
          blueprint: true,
        },
      },
      pages: true,
    },
  });

  // For multi-theme, resolve which theme this site uses
  const siteWpTheme = site.wpTheme || "xusmo-starter";

  if (!site.themePoolEntry) {
    throw new Error("No theme applied to site");
  }

  if (!site.build?.blueprint) {
    throw new Error("No blueprint found for site");
  }

  const bp = site.build.blueprint;
  const archetype = (site.archetype ?? "SERVICE") as Archetype;

  // 2. Classify the theme's design style
  const themeEntry = site.themePoolEntry;
  const theme = {
    colors: themeEntry.colors as Record<string, string>,
    fonts: themeEntry.fonts as { heading: string },
    borderRadius: themeEntry.borderRadius as { medium?: string } | undefined,
    buttonStyle: themeEntry.buttonStyle as { textTransform?: string } | undefined,
    designPackage: themeEntry.designPackage as { homeLayout?: string[] } | null,
  };

  const designStyle = classifyDesignStyle(theme);
  const designPackage = themeEntry.designPackage as DesignPackage | null;

  console.log(`[reassemble] Style: ${designStyle}, pages: ${site.pages.length}, designPackage: ${designPackage ? "yes" : "no"}`);

  // 3. Extract blueprint data
  const businessInfo = bp.businessInfo as unknown as {
    name: string; description: string; tagline: string;
    phone: string; email: string; location: string; yearsInBusiness: string;
  };
  const services = (bp.services as unknown as Array<{ name: string; description: string; featured: boolean }>) ?? [];
  const story = (bp.story as unknown as {
    foundingStory: string; differentiator: string; targetAudience: string;
    uniqueSellingPoint: string; certifications: string; serviceAreas: string;
  }) ?? { foundingStory: "", differentiator: "", targetAudience: "", uniqueSellingPoint: "", certifications: "", serviceAreas: "" };
  const team = (bp.team as unknown as Array<{ name: string; role: string; bio: string }>) ?? [];
  const testimonials = (bp.testimonials as unknown as Array<{ quote: string; name: string; title: string }>) ?? [];
  const faqs = (bp.faqs as unknown as Array<{ question: string; answer: string }>) ?? [];
  const trustSignals = (bp.trustSignals as unknown as Array<{ type: string; value: string }>) ?? [];
  const contactPrefs = (bp.contactPrefs as unknown as { phone: string; email: string; formType: string; showMap: boolean }) ?? { phone: "", email: "", formType: "form", showMap: false };
  const businessHours = (bp.businessHours as string) ?? "";

  // 4. Batch-fetch fresh images from Pexels (once, reused across all pages)
  let heroImageUrl: string | null = null;
  let heroImageId = 0;

  const designPrefs = bp.designPrefs as unknown as { imageryThemes?: string[] } | null;
  const imageryThemes = designPrefs?.imageryThemes ?? [];

  let sectionImages: SectionImageResult = { hero: null, services: [], cta: null };
  try {
    sectionImages = await searchSectionImages(
      imageryThemes,
      businessInfo.name,
      businessInfo.description,
      businessInfo.tagline,
      archetype
    );
  } catch (err) {
    console.warn(`[reassemble] Section image fetch failed: ${err instanceof Error ? err.message : "unknown"}`);
  }

  // 4a. Upload hero to WP media once (cover blocks need attachment ID)
  const hasWpPages = site.pages.some((p) => p.wpPostId);
  if (sectionImages.hero && hasWpPages) {
    try {
      const uploaded = await uploadHeroImage(
        siteId,
        sectionImages.hero.url,
        sectionImages.hero.alt,
        "home",
        USE_MULTI_THEME ? siteId : undefined
      );
      if (uploaded) {
        heroImageUrl = uploaded.wpUrl;
        heroImageId = uploaded.attachmentId;
        console.log(`[reassemble] Hero uploaded: ID=${heroImageId}`);
      } else {
        heroImageUrl = sectionImages.hero.url;
        console.log(`[reassemble] Hero using CDN URL`);
      }
    } catch (err) {
      heroImageUrl = sectionImages.hero.url;
      console.warn(`[reassemble] Hero upload failed, using CDN: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }

  // 5. Loop ALL pages — hydrate, inject images, save, sync
  let pagesUpdated = 0;

  for (const page of site.pages) {
    // 5a. Get the layout for this specific page from designPackage (or archetype fallback)
    const pageLayout = getPageLayoutWithDesignPackage(archetype, page.slug, designPackage);
    console.log(`[reassemble] Page "${page.slug}": [${pageLayout.join(", ")}]`);

    // 5b. Hydrate each pattern in this page's layout
    const hydratedPatterns: string[] = [];
    for (const patternSlug of pageLayout) {
      const fallbackSlots = buildFallbackSlots(
        patternSlug,
        businessInfo,
        services,
        story,
        team,
        testimonials,
        faqs,
        trustSignals,
        businessHours,
        contactPrefs,
        archetype
      );

      try {
        const hydrated = await hydratePattern(patternSlug, fallbackSlots);
        hydratedPatterns.push(hydrated);
      } catch (err) {
        console.warn(`[reassemble] Failed to hydrate "${patternSlug}" for "${page.slug}": ${err instanceof Error ? err.message : "unknown"}`);
      }
    }

    // 5c. Inject section images (services, CTA)
    const patternsWithImages = injectSectionImages(hydratedPatterns, sectionImages, pageLayout);

    // 5d. Inject hero image into first wp:cover block or React mount point
    let newContent = patternsWithImages.join("\n\n");
    if (heroImageUrl && newContent.includes("wp:cover")) {
      newContent = injectHeroImage(newContent, heroImageUrl, heroImageId);
    }
    if (heroImageUrl) {
      newContent = injectReactHeroImage(newContent, heroImageUrl);
    }

    // 5e. Update page in database
    await prisma.page.update({
      where: { id: page.id },
      data: { content: newContent },
    });
    pagesUpdated++;

    // 5f. Sync to WordPress
    if (page.wpPostId) {
      try {
        await syncPageToWordPress(siteId, page.slug);
        console.log(`[reassemble] "${page.slug}" synced to WordPress`);
      } catch (err) {
        console.warn(`[reassemble] WP sync failed for "${page.slug}": ${err instanceof Error ? err.message : "unknown"}`);
      }
    }
  }

  // 6. Swap header and footer template parts
  try {
    await swapTemplateParts(designStyle, designPackage, siteId, siteWpTheme);
    console.log(`[reassemble] Header/footer swapped for style: ${designStyle}`);
  } catch (err) {
    console.warn(`[reassemble] Template part swap failed: ${err instanceof Error ? err.message : "unknown"}`);
  }

  console.log(`[reassemble] Done — ${pagesUpdated} pages updated, style: ${designStyle}`);
  return { pagesUpdated, designStyle };
}

/**
 * Swap header and footer template parts in WordPress by writing the
 * variant file content as a wp_template_part DB override.
 *
 * Uses writeFile() (docker cp) for all data to avoid Windows WP-CLI
 * shell quoting issues — see MEMORY.md "WP-CLI Quoting on Windows".
 */
async function swapTemplateParts(
  style: DesignStyle,
  designPackage?: { headerVariant?: string; footerVariant?: string } | null,
  siteId?: string,
  wpTheme?: string
): Promise<void> {
  const styleVariants = STYLE_TEMPLATE_PARTS[style];
  // Theme's own designPackage variants take priority over style defaults
  const variants = {
    header: designPackage?.headerVariant || styleVariants.header,
    footer: designPackage?.footerVariant || styleVariants.footer,
  };
  const activeTheme = wpTheme || "xusmo-starter";
  console.log(`[reassemble] Template parts: header=${variants.header}, footer=${variants.footer} (source: ${designPackage?.headerVariant ? "designPackage" : "styleDefault"}, theme: ${activeTheme})`);
  const wp = USE_MULTI_THEME ? getExecutor(siteId) : getExecutor();
  const themeDir = await wp.execute(`eval "echo get_stylesheet_directory();"`);

  for (const [partSlug, variantFile] of [
    ["header", variants.header],
    ["footer", variants.footer],
  ] as const) {
    // Read the variant file content from the theme parts/ directory
    const filePath = `${themeDir}/parts/${variantFile}.html`;
    let content: string;
    try {
      content = await wp.execute(`eval "echo file_get_contents('${filePath}');"`);
    } catch {
      console.warn(`[reassemble] Template part file not found: ${filePath}`);
      continue;
    }

    if (!content.trim()) {
      console.warn(`[reassemble] Template part file empty: ${filePath}`);
      continue;
    }

    // Write content to a temp file via docker cp
    await wp.writeFile("/tmp/xusmo-template-part.html", content);

    // Write the PHP upsert script to a temp file, then include() it.
    // This avoids shell quoting issues with complex PHP in wp eval.
    const phpScript = `<?php
$content = file_get_contents('/tmp/xusmo-template-part.html');
$existing = get_posts([
  'post_type' => 'wp_template_part',
  'post_name__in' => ['${partSlug}'],
  'posts_per_page' => 1,
  'post_status' => 'any',
  'tax_query' => [[
    'taxonomy' => 'wp_theme',
    'field' => 'name',
    'terms' => '${activeTheme}',
  ]],
]);
if (!empty($existing)) {
  wp_update_post([
    'ID' => $existing[0]->ID,
    'post_content' => $content,
    'post_status' => 'publish',
  ]);
  echo '${partSlug}: updated ID=' . $existing[0]->ID;
} else {
  $id = wp_insert_post([
    'post_type' => 'wp_template_part',
    'post_name' => '${partSlug}',
    'post_title' => '${partSlug}',
    'post_content' => $content,
    'post_status' => 'publish',
    'post_excerpt' => '',
  ]);
  wp_set_object_terms($id, '${activeTheme}', 'wp_theme');
  echo '${partSlug}: created ID=' . $id;
}
`;
    await wp.writeFile("/tmp/xusmo-swap-part.php", phpScript);
    const result = await wp.execute(`eval "include('/tmp/xusmo-swap-part.php');"`);
    console.log(`[reassemble] Template part ${partSlug}: ${result.trim()}`);
  }

  // Flush caches so WP picks up the new template parts
  await wp.execute(`eval "WP_Theme_JSON_Resolver::clean_cached_data(); wp_cache_flush();"`);
}

/**
 * Inject Pexels CDN image URLs into hydrated pattern HTML.
 * Targets: xusmo-service-img class (services), empty wp:image in cta-split.
 * Uses CDN URLs directly — no WP upload needed for wp:image blocks.
 */
function injectSectionImages(
  hydratedPatterns: string[],
  sectionImages: SectionImageResult,
  pageLayout: PatternSlug[]
): string[] {
  const result = [...hydratedPatterns];
  let serviceImgIdx = 0;

  for (let i = 0; i < result.length; i++) {
    const slug = pageLayout[i];
    if (!slug) continue;
    let html = result[i];

    // Services patterns: fill xusmo-service-img blocks with Pexels CDN URLs
    if (
      (slug === "services-grid" || slug === "services-alternating") &&
      sectionImages.services.length > 0
    ) {
      html = html.replace(
        /(<figure[^>]*xusmo-service-img[^>]*><img) src="" alt="Service image"/g,
        (_match, prefix) => {
          const img = sectionImages.services[serviceImgIdx % sectionImages.services.length];
          serviceImgIdx++;
          return `${prefix} src="${img.url}" alt="${img.alt.replace(/"/g, "&quot;")}"`;
        }
      );
    }

    // CTA-split: fill the empty wp:image with CTA image
    if (slug === "cta-split" && sectionImages.cta) {
      html = html.replace(
        /(<figure[^>]*wp-block-image[^>]*><img) src="" alt="Why choose us"/,
        `$1 src="${sectionImages.cta.url}" alt="${sectionImages.cta.alt.replace(/"/g, "&quot;")}"`
      );
    }

    result[i] = html;
  }

  const filled = serviceImgIdx + (sectionImages.cta ? 1 : 0);
  if (filled > 0) {
    console.log(`[reassemble] Injected ${filled} section images (${serviceImgIdx} services)`);
  }

  return result;
}

/**
 * Inject a hero image URL into the first wp:cover block in a content string.
 * Updates the block JSON attributes, adds an <img> tag for WordPress frontend
 * rendering, and sets the background-image inline style as a fallback.
 *
 * WordPress 6.x cover blocks need an <img class="wp-block-cover__image-background">
 * inside the markup for the frontend to render the background image.
 */
function injectHeroImage(
  content: string,
  imageUrl: string,
  attachmentId: number
): string {
  let replaced = false;

  // 1. Add url + id to the first wp:cover block's JSON attributes
  let targetDimRatio = 55;
  let result = content.replace(
    /<!-- wp:cover (\{.*?\}) -->/,
    (match: string, jsonStr: string) => {
      if (replaced) return match;
      replaced = true;
      try {
        const attrs = JSON.parse(jsonStr);
        attrs.url = imageUrl;
        attrs.id = attachmentId;
        // Clamp dimRatio: too low = unreadable text, too high = image invisible
        if (!attrs.dimRatio || attrs.dimRatio < 40) {
          attrs.dimRatio = 55;
        } else if (attrs.dimRatio > 75) {
          attrs.dimRatio = 60;
        }
        targetDimRatio = attrs.dimRatio;
        return `<!-- wp:cover ${JSON.stringify(attrs)} -->`;
      } catch {
        return match;
      }
    }
  );

  if (!replaced) return result;

  // 2. Add background-image inline style to the cover div
  let bgReplaced = false;
  result = result.replace(
    /(<div class="wp-block-cover"[^>]*style=")/,
    (match: string) => {
      if (bgReplaced) return match;
      bgReplaced = true;
      return `${match}background-image:url(${imageUrl});`;
    }
  );

  // 3. Update the span overlay class to match the dimRatio (frontend uses CSS class, not JSON)
  let spanFixed = false;
  result = result.replace(
    /(<span[^>]*class="wp-block-cover__background[^"]*has-background-dim)-(\d+)( has-background-dim"[^>]*><\/span>)/,
    (match: string, prefix: string, _oldDim: string, suffix: string) => {
      if (spanFixed) return match;
      spanFixed = true;
      return `${prefix}-${targetDimRatio}${suffix}`;
    }
  );

  // 4. Add <img> tag after the <span> overlay — required for WP 6.x frontend rendering
  const imgTag = `<img class="wp-block-cover__image-background wp-image-${attachmentId}" alt="" src="${imageUrl}" style="object-fit:cover" data-object-fit="cover"/>`;
  let imgInserted = false;
  result = result.replace(
    /(<span[^>]*class="wp-block-cover__background[^"]*"[^>]*><\/span>)/,
    (match: string) => {
      if (imgInserted) return match;
      imgInserted = true;
      return `${match}\n\t\t\t${imgTag}`;
    }
  );

  return result;
}

/**
 * Inject hero image URL into React mount-point patterns.
 * Finds the first data-xusmo-props JSON with an imageUrl field
 * and sets the imageUrl to the uploaded hero image URL.
 */
function injectReactHeroImage(content: string, imageUrl: string): string {
  return content.replace(
    /data-xusmo-props='(\{[^']*"imageUrl"\s*:\s*"[^"]*"[^']*\})'/g,
    (_match, json: string) => {
      try {
        const props = JSON.parse(json);
        props.imageUrl = imageUrl;
        const escaped = JSON.stringify(props).replace(/'/g, "&#39;");
        return `data-xusmo-props='${escaped}'`;
      } catch {
        return _match;
      }
    }
  );
}
