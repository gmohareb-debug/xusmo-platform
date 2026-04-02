// =============================================================================
// WordPress Content Injection
// Creates pages, injects block content, configures settings via WP-CLI.
// Usage: import { injectContent, updateSiteSettings, createMenu } from "@/lib/wordpress/content";
// =============================================================================

import { getExecutor } from "./ssh";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PageToCreate {
  slug: string;
  title: string;
  content: string; // Gutenberg block HTML
}

// ---------------------------------------------------------------------------
// Inject content — create WordPress pages from Blueprint
// ---------------------------------------------------------------------------

export async function injectContent(
  siteSlug: string,
  pages: PageToCreate[],
  siteId?: string
): Promise<Map<string, number>> {
  const wp = getExecutor(siteId);
  const pageIds = new Map<string, number>();

  for (const page of pages) {
    // Create page
    const createResult = await wp.execute(
      `post create --post_type=page --post_title="${escapeShell(page.title)}" --post_name="${escapeShell(page.slug)}" --post_status=publish --porcelain`
    );
    const pageId = parseInt(createResult.trim(), 10);

    if (isNaN(pageId)) {
      console.error(`[content] Failed to create page "${page.title}": ${createResult}`);
      continue;
    }

    // Inject content via file-based transfer to avoid shell quoting issues
    await wp.writeFile("/tmp/xusmo-page-content.html", page.content);
    await wp.execute(
      `eval "wp_update_post(['ID' => ${pageId}, 'post_content' => file_get_contents('/tmp/xusmo-page-content.html')]);"`
    );

    pageIds.set(page.slug, pageId);

    // Set home page as front page
    if (page.slug === "home") {
      await wp.execute(`option update show_on_front "page"`);
      await wp.execute(`option update page_on_front "${pageId}"`);
    }
  }

  return pageIds;
}

// ---------------------------------------------------------------------------
// Update site settings
// ---------------------------------------------------------------------------

export async function updateSiteSettings(
  siteSlug: string,
  settings: {
    title?: string;
    tagline?: string;
    timezone?: string;
  },
  siteId?: string
): Promise<void> {
  const wp = getExecutor(siteId);

  if (settings.title) {
    await wp.execute(`option update blogname "${escapeShell(settings.title)}"`);
  }
  if (settings.tagline) {
    // Validate tagline — catch incomplete LLM-generated taglines ending with prepositions
    const TRAILING_PREPOSITIONS = /\b(in|for|to|with|from|at|by|of|and|the|a|an)\s*$/i;
    let validTagline = settings.tagline;
    if (validTagline.length < 10 || TRAILING_PREPOSITIONS.test(validTagline.trim())) {
      validTagline = "Quality service you can trust.";
    }
    await wp.execute(`option update blogdescription "${escapeShell(validTagline)}"`);
  }
  if (settings.timezone) {
    await wp.execute(`option update timezone_string "${escapeShell(settings.timezone)}"`);
  }
}

// ---------------------------------------------------------------------------
// Create navigation menu
// ---------------------------------------------------------------------------

export async function createMenu(
  siteSlug: string,
  pageIds: Map<string, number>,
  siteId?: string
): Promise<void> {
  const wp = getExecutor(siteId);

  // Create a navigation menu
  try {
    const menuId = await wp.execute(
      `menu create "Main Navigation" --porcelain`
    );

    // Add pages to menu in order
    const pageOrder = ["home", "services", "about", "portfolio", "menu_or_schedule", "contact"];

    let order = 1;
    for (const slug of pageOrder) {
      const id = pageIds.get(slug);
      if (id) {
        await wp.execute(
          `menu item add-post "Main Navigation" ${id} --position=${order}`
        );
        order++;
      }
    }

    // Also add any pages not in the predefined order
    for (const [slug, id] of pageIds) {
      if (!pageOrder.includes(slug)) {
        await wp.execute(
          `menu item add-post "Main Navigation" ${id} --position=${order}`
        );
        order++;
      }
    }

    // Assign menu to primary location
    await wp.execute(`menu location assign "Main Navigation" primary`).catch(() => {
      // Some themes don't have a "primary" location — try "main"
      return wp.execute(`menu location assign "Main Navigation" main`).catch(() => {
        console.log("[content] No primary menu location found — menu created but not assigned");
      });
    });
  } catch (error) {
    console.error("[content] Menu creation failed:", error);
  }
}

// ---------------------------------------------------------------------------
// Create FSE block navigation (wp_navigation post type)
// ---------------------------------------------------------------------------

/**
 * Create a `wp_navigation` post with proper navigation-link blocks.
 * FSE themes use this post type instead of classic menus for the
 * `wp:navigation` block in header templates.
 */
export async function createBlockNavigation(
  siteSlug: string,
  pageIds: Map<string, number>,
  siteId?: string
): Promise<number | null> {
  const wp = getExecutor(siteId);

  try {
    // Build navigation-link blocks — only KEY pages for a clean nav bar.
    // Utility pages (policies, categories, blog, faq) go in the footer, not here.
    const navPageOrder = [
      "home", "services", "products", "shop", "about",
      "portfolio", "gallery", "contact",
    ];
    const navLinks: string[] = [];

    // Friendly labels for page slugs
    const labels: Record<string, string> = {
      home: "Home",
      services: "Services",
      products: "Products",
      shop: "Shop",
      about: "About",
      portfolio: "Portfolio",
      gallery: "Gallery",
      contact: "Contact",
    };

    // Only add pages that exist AND are in the curated nav list (max ~5)
    for (const slug of navPageOrder) {
      if (!pageIds.has(slug)) continue;
      const label = labels[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1);
      const url = slug === "home" ? "/" : `/${slug}/`;
      navLinks.push(
        `<!-- wp:navigation-link {"label":"${label}","url":"${url}","kind":"custom","isTopLevelLink":true} /-->`
      );
    }

    // DO NOT add remaining pages — keeps nav clean and focused

    const navContent = navLinks.join("\n");

    // Delete any existing wp_navigation posts to avoid duplicates
    try {
      await wp.execute(
        `post list --post_type=wp_navigation --format=ids`
      ).then(async (ids) => {
        const trimmed = ids.trim();
        if (trimmed) {
          for (const id of trimmed.split(/\s+/)) {
            await wp.execute(`post delete ${id} --force`);
          }
        }
      });
    } catch {
      // No existing navigation posts — that's fine
    }

    // Create wp_navigation post
    const navPostIdStr = await wp.execute(
      `post create --post_type=wp_navigation --post_title="Main Navigation" --post_status=publish --porcelain`
    );
    const navId = parseInt(navPostIdStr.trim(), 10);

    if (isNaN(navId)) {
      console.error("[content] Failed to create wp_navigation post:", navPostIdStr);
      return null;
    }

    // Set navigation content via file-based transfer
    await wp.writeFile("/tmp/xusmo-nav-content.html", navContent);
    await wp.execute(
      `eval "wp_update_post(['ID' => ${navId}, 'post_content' => file_get_contents('/tmp/xusmo-nav-content.html')]);"`
    );

    console.log(`[content] Block navigation created (post ID ${navId}) with ${navLinks.length} links.`);
    return navId;
  } catch (error) {
    console.error("[content] Block navigation creation failed:", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Customize footer with real business data
// ---------------------------------------------------------------------------

/**
 * Create a `wp_template_part` DB override for the footer with real business
 * data. WordPress uses DB entries over on-disk template parts.
 */
export async function customizeFooter(
  siteSlug: string,
  businessInfo: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    tagline?: string;
    socialMedia?: { facebook?: string; instagram?: string };
    businessHours?: string;
  },
  siteId?: string,
  themeName?: string
): Promise<void> {
  const wp = getExecutor(siteId);

  try {
    // Build contact info paragraph
    const contactLines: string[] = [];
    if (businessInfo.address) contactLines.push(businessInfo.address);
    if (businessInfo.phone) contactLines.push(`Phone: ${businessInfo.phone}`);
    if (businessInfo.email) contactLines.push(`Email: ${businessInfo.email}`);

    const contactText = contactLines.length > 0
      ? contactLines.join("<br>")
      : "Contact us for more information.";

    // Validate tagline — catch incomplete LLM-generated taglines
    const TRAILING_PREPOSITIONS = /\b(in|for|to|with|from|at|by|of|and|the|a|an)\s*$/i;
    let tagline = businessInfo.tagline ?? "";
    if (!tagline || tagline.length < 10 || TRAILING_PREPOSITIONS.test(tagline.trim())) {
      tagline = "Quality service you can trust.";
    }

    const currentYear = new Date().getFullYear();

    // Build social links column if social media is provided
    const hasSocial = businessInfo.socialMedia?.facebook || businessInfo.socialMedia?.instagram;
    let socialColumn = "";
    if (hasSocial) {
      const socialLinks: string[] = [];
      if (businessInfo.socialMedia?.facebook) {
        socialLinks.push(`<a href="${escapeHtml(businessInfo.socialMedia.facebook)}" target="_blank" rel="noopener">Facebook</a>`);
      }
      if (businessInfo.socialMedia?.instagram) {
        socialLinks.push(`<a href="${escapeHtml(businessInfo.socialMedia.instagram)}" target="_blank" rel="noopener">Instagram</a>`);
      }
      socialColumn = `\t\t<!-- wp:column -->
\t\t<div class="wp-block-column">
\t\t\t<!-- wp:heading {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"600","fontSize":"1rem"}},"textColor":"text","fontFamily":"heading"} -->
\t\t\t<h3 class="wp-block-heading has-text-color has-text-color has-heading-font-family" style="font-size:1rem;font-style:normal;font-weight:600">Follow Us</h3>
\t\t\t<!-- /wp:heading -->

\t\t\t<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem"}},"textColor":"text-muted","fontFamily":"body"} -->
\t\t\t<p class="has-text-muted-color has-text-color has-body-font-family" style="font-size:0.9rem">${socialLinks.join("<br>")}</p>
\t\t\t<!-- /wp:paragraph -->
\t\t</div>
\t\t<!-- /wp:column -->`;
    }

    // Build hours column if business hours provided
    let hoursColumn = "";
    if (businessInfo.businessHours) {
      hoursColumn = `\t\t<!-- wp:column -->
\t\t<div class="wp-block-column">
\t\t\t<!-- wp:heading {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"600","fontSize":"1rem"}},"textColor":"text","fontFamily":"heading"} -->
\t\t\t<h3 class="wp-block-heading has-text-color has-text-color has-heading-font-family" style="font-size:1rem;font-style:normal;font-weight:600">Hours</h3>
\t\t\t<!-- /wp:heading -->

\t\t\t<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem"}},"textColor":"text-muted","fontFamily":"body"} -->
\t\t\t<p class="has-text-muted-color has-text-color has-body-font-family" style="font-size:0.9rem">${escapeHtml(businessInfo.businessHours)}</p>
\t\t\t<!-- /wp:paragraph -->
\t\t</div>
\t\t<!-- /wp:column -->`;
    }

    // Build the footer block HTML with real business data
    const footerContent = `<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|50","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}},"border":{"top":{"color":"var:preset|color|border","width":"1px"}}},"backgroundColor":"surface","layout":{"type":"constrained","contentSize":"1200px"}} -->
<div class="wp-block-group has-surface-background-color has-background" style="border-top-color:var(--wp--preset--color--border);border-top-width:1px;padding-top:var(--wp--preset--spacing--70);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--40)">
\t<!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"var:preset|spacing|60"}}}} -->
\t<div class="wp-block-columns">
\t\t<!-- wp:column -->
\t\t<div class="wp-block-column">
\t\t\t<!-- wp:site-title {"level":0,"style":{"typography":{"fontStyle":"normal","fontWeight":"700","fontSize":"1.25rem"},"elements":{"link":{"color":{"text":"var:preset|color|text"}}}},"fontFamily":"heading"} /-->

\t\t\t<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem"}},"textColor":"text-muted","fontFamily":"body"} -->
\t\t\t<p class="has-text-muted-color has-text-color has-body-font-family" style="font-size:0.9rem">${escapeHtml(tagline)}</p>
\t\t\t<!-- /wp:paragraph -->
\t\t</div>
\t\t<!-- /wp:column -->

\t\t<!-- wp:column -->
\t\t<div class="wp-block-column">
\t\t\t<!-- wp:heading {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"600","fontSize":"1rem"}},"textColor":"text","fontFamily":"heading"} -->
\t\t\t<h3 class="wp-block-heading has-text-color has-text-color has-heading-font-family" style="font-size:1rem;font-style:normal;font-weight:600">Contact Info</h3>
\t\t\t<!-- /wp:heading -->

\t\t\t<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem"}},"textColor":"text-muted","fontFamily":"body"} -->
\t\t\t<p class="has-text-muted-color has-text-color has-body-font-family" style="font-size:0.9rem">${contactText}</p>
\t\t\t<!-- /wp:paragraph -->
\t\t</div>
\t\t<!-- /wp:column -->

\t\t<!-- wp:column -->
\t\t<div class="wp-block-column">
\t\t\t<!-- wp:heading {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"600","fontSize":"1rem"}},"textColor":"text","fontFamily":"heading"} -->
\t\t\t<h3 class="wp-block-heading has-text-color has-text-color has-heading-font-family" style="font-size:1rem;font-style:normal;font-weight:600">Quick Links</h3>
\t\t\t<!-- /wp:heading -->

\t\t\t<!-- wp:navigation {"overlayMenu":"never","style":{"typography":{"fontSize":"0.9rem"},"spacing":{"blockGap":"var:preset|spacing|10"}},"textColor":"text-muted","fontFamily":"body","layout":{"type":"flex","orientation":"vertical"}} /-->
\t\t</div>
\t\t<!-- /wp:column -->
${socialColumn}
${hoursColumn}
\t</div>
\t<!-- /wp:columns -->

\t<!-- wp:separator {"backgroundColor":"border"} -->
\t<hr class="wp-block-separator has-text-color has-border-color has-border-background-color has-background"/>
\t<!-- /wp:separator -->

\t<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"0.85rem"},"spacing":{"margin":{"top":"var:preset|spacing|30"}}},"textColor":"text-muted","fontFamily":"body"} -->
\t<p class="has-text-align-center has-text-muted-color has-text-color has-body-font-family" style="margin-top:var(--wp--preset--spacing--30);font-size:0.85rem">&copy; ${currentYear} ${escapeHtml(businessInfo.name)}. All rights reserved. Powered by <a href="https://xusmo.com" target="_blank" rel="noopener">Xusmo</a></p>
\t<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->`;

    // Delete any existing footer template part override
    try {
      const existingIds = await wp.execute(
        `post list --post_type=wp_template_part --name=footer --format=ids`
      );
      const trimmed = existingIds.trim();
      if (trimmed) {
        for (const id of trimmed.split(/\s+/)) {
          await wp.execute(`post delete ${id} --force`);
        }
      }
    } catch {
      // No existing override — that's fine
    }

    // Create the template part override in the database
    const postIdStr = await wp.execute(
      `post create --post_type=wp_template_part --post_name=footer --post_title="Footer" --post_status=publish --porcelain`
    );
    const postId = parseInt(postIdStr.trim(), 10);

    if (isNaN(postId)) {
      console.error("[content] Failed to create footer template part:", postIdStr);
      return;
    }

    // Set the theme taxonomy so WP associates this with the active theme
    const activeTheme = themeName || "xusmo-starter";
    await wp.execute(
      `eval "wp_set_object_terms(${postId}, '${activeTheme}', 'wp_theme');"`
    );

    // Set the area taxonomy so WP knows this is a footer
    await wp.execute(
      `eval "update_post_meta(${postId}, 'wp_pattern_sync_status', 'unsynced');"`
    );

    // Write the footer content
    await wp.writeFile("/tmp/xusmo-footer-content.html", footerContent);
    await wp.execute(
      `eval "wp_update_post(['ID' => ${postId}, 'post_content' => file_get_contents('/tmp/xusmo-footer-content.html')]);"`
    );

    console.log(`[content] Footer customized with business data (post ID ${postId}).`);
  } catch (error) {
    console.error("[content] Footer customization failed:", error);
  }
}

// ---------------------------------------------------------------------------
// Inject Template Part Variant (header/footer from design package)
// ---------------------------------------------------------------------------

/**
 * Inject a template part variant (e.g. header-transparent, footer-minimal)
 * by reading the HTML file from wordpress/themes/xusmo-starter/parts/ and
 * creating a wp_template_part DB override in WordPress.
 *
 * @param siteSlug  - The WP site slug for WP-CLI context
 * @param partSlug  - The template part slug ("header" or "footer")
 * @param variantFile - The variant filename without .html (e.g. "header-transparent")
 * @param title     - Display title for the template part
 */
export async function injectTemplatePart(
  siteSlug: string,
  partSlug: "header" | "footer",
  variantFile: string,
  title: string,
  siteId?: string,
  themeName?: string
): Promise<void> {
  const { readFile } = await import("fs/promises");
  const { join } = await import("path");

  // Try theme-specific parts first, then fall back to legacy xusmo-starter
  const theme = themeName || "xusmo-starter";
  const themeFilePath = join(process.cwd(), "wordpress", "themes", theme, "parts", `${variantFile}.html`);
  const legacyFilePath = join(process.cwd(), "wordpress", "themes", "xusmo-starter", "parts", `${variantFile}.html`);

  let content: string;
  try {
    content = await readFile(themeFilePath, "utf-8");
  } catch {
    try {
      content = await readFile(legacyFilePath, "utf-8");
    } catch {
      console.warn(`[content] Template part file not found: ${themeFilePath} or ${legacyFilePath}`);
      return;
    }
  }

  const wp = getExecutor(siteId);

  // Delete any existing override for this part
  try {
    const existingIds = await wp.execute(
      `post list --post_type=wp_template_part --name=${partSlug} --format=ids`
    );
    const trimmed = existingIds.trim();
    if (trimmed) {
      for (const id of trimmed.split(/\s+/)) {
        await wp.execute(`post delete ${id} --force`);
      }
    }
  } catch {
    // No existing override — fine
  }

  // Create the template part override
  const postIdStr = await wp.execute(
    `post create --post_type=wp_template_part --post_name=${partSlug} --post_title="${escapeShell(title)}" --post_status=publish --porcelain`
  );
  const postId = parseInt(postIdStr.trim(), 10);

  if (isNaN(postId)) {
    console.error(`[content] Failed to create ${partSlug} template part:`, postIdStr);
    return;
  }

  // Associate with theme
  const activeTheme = themeName || "xusmo-starter";
  await wp.execute(
    `eval "wp_set_object_terms(${postId}, '${activeTheme}', 'wp_theme');"`
  );
  await wp.execute(
    `eval "update_post_meta(${postId}, 'wp_pattern_sync_status', 'unsynced');"`
  );

  // Write content via file to avoid shell escaping issues
  const tmpFile = `/tmp/xusmo-${partSlug}-variant.html`;
  await wp.writeFile(tmpFile, content);
  await wp.execute(
    `eval "wp_update_post(['ID' => ${postId}, 'post_content' => file_get_contents('${tmpFile}')]);"`
  );

  console.log(`[content] Injected ${partSlug} variant "${variantFile}" (post ID ${postId}).`);
}

// ---------------------------------------------------------------------------
// Shell escape helper
// ---------------------------------------------------------------------------

function escapeShell(str: string): string {
  return str.replace(/"/g, '\\"').replace(/\$/g, "\\$").replace(/`/g, "\\`");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Hero Image — Upload + Inject into Cover Block
// ---------------------------------------------------------------------------

/**
 * Upload an image URL to the WordPress media library via WP-CLI.
 * Returns the attachment ID and local WordPress URL.
 */
/**
 * Upload any image to WordPress media library.
 * Generic version used by the Image Agent for all section images.
 */
export async function uploadSiteImage(
  siteSlug: string,
  imageUrl: string,
  title: string,
  alt: string,
  siteId?: string
): Promise<{ attachmentId: number; wpUrl: string } | null> {
  const wp = getExecutor(siteId);

  try {
    const safeAlt = escapeShell(alt.slice(0, 200));
    const safeTitle = escapeShell(title.slice(0, 200));
    const result = await wp.execute(
      `media import "${escapeShell(imageUrl)}" --title="${safeTitle}" --alt="${safeAlt}" --porcelain`,
      30000
    );

    const attachmentId = parseInt(result.trim(), 10);
    if (isNaN(attachmentId)) {
      console.warn("[content] Media import returned non-numeric ID:", result);
      return null;
    }

    const wpUrl = await wp.execute(
      `eval "echo wp_get_attachment_url(${attachmentId});"`
    );
    const trimmedUrl = wpUrl.trim();

    if (!trimmedUrl || trimmedUrl === "false") {
      return null;
    }

    return { attachmentId, wpUrl: trimmedUrl };
  } catch (error) {
    console.warn(`[content] Image upload failed (${title}):`, error instanceof Error ? error.message : error);
    return null;
  }
}

export async function uploadHeroImage(
  siteSlug: string,
  imageUrl: string,
  alt: string,
  pageSlug = "home",
  siteId?: string
): Promise<{ attachmentId: number; wpUrl: string } | null> {
  const wp = getExecutor(siteId);
  const mediaTitle = pageSlug === "home" ? "Hero Background" : `Hero Background ${pageSlug}`;

  try {
    // Check if this page's hero attachment already exists — avoid duplicates
    const existingCheck = await wp.execute(
      `post list --post_type=attachment --s="${mediaTitle}" --field=ID --format=csv`
    );
    const existingIds = existingCheck.trim().split(/\s+/).filter((id) => /^\d+$/.test(id));

    if (existingIds.length > 0) {
      const latestId = parseInt(existingIds[0], 10);
      const wpUrl = await wp.execute(
        `eval "echo wp_get_attachment_url(${latestId});"`
      );
      const trimmedUrl = wpUrl.trim();

      if (trimmedUrl && trimmedUrl !== "false") {
        console.log(`[content] Hero image reused (${pageSlug}): attachment ${latestId} → ${trimmedUrl}`);
        return { attachmentId: latestId, wpUrl: trimmedUrl };
      }
    }

    // No existing hero for this page — upload new one
    const safeAlt = escapeShell(alt.slice(0, 200));
    const result = await wp.execute(
      `media import "${escapeShell(imageUrl)}" --title="${mediaTitle}" --alt="${safeAlt}" --porcelain`,
      30000 // 30s timeout for download
    );

    const attachmentId = parseInt(result.trim(), 10);
    if (isNaN(attachmentId)) {
      console.warn("[content] Media import returned non-numeric ID:", result);
      return null;
    }

    // Get the WordPress URL for the uploaded image
    const wpUrl = await wp.execute(
      `eval "echo wp_get_attachment_url(${attachmentId});"`
    );
    const trimmedUrl = wpUrl.trim();

    if (!trimmedUrl || trimmedUrl === "false") {
      console.warn("[content] Could not get attachment URL for ID:", attachmentId);
      return null;
    }

    console.log(`[content] Hero image uploaded (${pageSlug}): attachment ${attachmentId} → ${trimmedUrl}`);
    return { attachmentId, wpUrl: trimmedUrl };
  } catch (error) {
    console.warn("[content] Hero image upload failed:", error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Inject a background image into the first wp:cover block on a page.
 * Transforms the cover block attributes to include the image URL and attachment ID.
 */
export async function setHeroCoverImage(
  siteSlug: string,
  pageWpId: number,
  imageUrl: string,
  attachmentId: number,
  altText = "Hero background image",
  siteId?: string
): Promise<void> {
  const wp = getExecutor(siteId);

  try {
    // Get existing page content
    const content = await wp.execute(`post get ${pageWpId} --field=post_content`);

    if (!content.includes("wp:cover")) {
      console.warn("[content] No wp:cover block found on page", pageWpId);
      return;
    }

    // Transform the first wp:cover block to include the background image
    // Match: <!-- wp:cover {JSON} --> (JSON may contain nested objects like "style")
    // Add: "url":"<imageUrl>","id":<attachmentId> to the JSON attributes
    let replaced = false;
    let targetDimRatio = 55;
    const updatedContent = content.replace(
      /<!-- wp:cover (\{.*?\}) -->/,
      (match: string, jsonStr: string) => {
        if (replaced) return match; // Only replace the first cover block
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
          // JSON parse failed — inject url/id at the start of the JSON
          const injected = `{"url":"${imageUrl}","id":${attachmentId},` + jsonStr.slice(1);
          return `<!-- wp:cover ${injected} -->`;
        }
      }
    );

    // Also update the cover div to include the background-image style
    let finalContent = updatedContent.replace(
      /(<div class="wp-block-cover"[^>]*style=")/,
      `$1background-image:url(${imageUrl});`
    );

    // Update the span overlay class to match dimRatio (frontend uses CSS class, not JSON)
    let spanFixed = false;
    finalContent = finalContent.replace(
      /(<span[^>]*class="wp-block-cover__background[^"]*has-background-dim)-(\d+)( has-background-dim"[^>]*><\/span>)/,
      (match: string, prefix: string, _oldDim: string, suffix: string) => {
        if (spanFixed) return match;
        spanFixed = true;
        return `${prefix}-${targetDimRatio}${suffix}`;
      }
    );

    // Add <img> tag after the <span> overlay — required for WP 6.x frontend rendering
    const safeAltText = altText.replace(/"/g, "&quot;");
    const imgTag = `<img class="wp-block-cover__image-background wp-image-${attachmentId}" alt="${safeAltText}" src="${imageUrl}" style="object-fit:cover" data-object-fit="cover"/>`;
    let imgInserted = false;
    finalContent = finalContent.replace(
      /(<span[^>]*class="wp-block-cover__background[^"]*"[^>]*><\/span>)/,
      (match: string) => {
        if (imgInserted) return match;
        imgInserted = true;
        return `${match}\n\t\t\t${imgTag}`;
      }
    );

    // Write updated content back to the page
    await wp.writeFile("/tmp/xusmo-hero-content.html", finalContent);
    await wp.execute(
      `eval "wp_update_post(['ID' => ${pageWpId}, 'post_content' => file_get_contents('/tmp/xusmo-hero-content.html')]);"`
    );

    console.log(`[content] Hero cover image set on page ${pageWpId}: ${imageUrl}`);
  } catch (error) {
    console.warn("[content] Hero cover image injection failed:", error instanceof Error ? error.message : error);
  }
}
