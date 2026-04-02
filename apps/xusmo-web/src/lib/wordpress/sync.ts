// =============================================================================
// WordPress Sync Service
// Pushes design tokens and page content from the local DB to the live
// WordPress installation via WP-CLI.
//
// syncDesignToWordPress(siteId)  — theme.json + custom CSS + Google Fonts
// syncPageToWordPress(siteId, pageSlug) — post content + Yoast meta
//
// Usage: import { syncDesignToWordPress, syncPageToWordPress } from "@/lib/wordpress/sync";
// =============================================================================

import { prisma } from "@/lib/db";
import { getExecutor } from "./ssh";
import { getThemePreset, mergeUserColors } from "./theme-presets";
import { buildThemeJson } from "./fonts";
import type { ThemePreset } from "./theme-presets";

const USE_MULTI_THEME = process.env.USE_MULTI_THEME === "true";

// ---------------------------------------------------------------------------
// Quick-style preset color overrides
// ---------------------------------------------------------------------------

const QUICK_STYLE_OVERRIDES: Record<string, { primary: string; accent: string }> = {
  professional: { primary: "#1e3a8a", accent: "#3b82f6" },
  bold:         { primary: "#09090b", accent: "#dc2626" },
  elegant:      { primary: "#7c2d12", accent: "#b45309" },
  minimal:      { primary: "#18181b", accent: "#3b82f6" },
  warm:         { primary: "#78350f", accent: "#d97706" },
};

// ---------------------------------------------------------------------------
// syncDesignToWordPress
// ---------------------------------------------------------------------------

/**
 * Read the site's design settings from the database and push them to
 * WordPress as theme.json, Google Fonts URL, and custom CSS.
 */
export async function syncDesignToWordPress(siteId: string): Promise<void> {
  // 1. Fetch site record with design-relevant fields
  const site = await prisma.site.findUniqueOrThrow({
    where: { id: siteId },
    select: {
      archetype: true,
      activePreset: true,
      customCss: true,
      themePoolEntryId: true,
      themePoolEntry: true,
    },
  });

  // 2. Build the ThemePreset
  let preset: ThemePreset;

  if (site.themePoolEntry) {
    // Build preset from the ThemePoolEntry JSON fields
    const entry = site.themePoolEntry as unknown as {
      colors: ThemePreset["colors"];
      fonts: {
        heading: string;
        body: string;
        headingWeight: string;
        bodyWeight: string;
        googleFontsUrl?: string;
      };
      borderRadius: ThemePreset["borderRadius"];
      buttonStyle: Record<string, string>;
      headingSizes?: ThemePreset["headingSizes"];
      sectionPadding?: string;
      contentSize?: string;
      wideSize?: string;
    };

    // Normalize buttonStyle — DB may store `padding` shorthand or separate fields
    const bs = entry.buttonStyle ?? {};
    let paddingV = bs.paddingVertical ?? "0.75rem";
    let paddingH = bs.paddingHorizontal ?? "1.75rem";
    if (bs.padding && !bs.paddingVertical) {
      const parts = bs.padding.split(/\s+/);
      paddingV = parts[0] ?? "0.75rem";
      paddingH = parts[1] ?? parts[0] ?? "1.75rem";
    }

    preset = {
      colors: entry.colors,
      fonts: {
        heading: entry.fonts.heading,
        headingWeight: entry.fonts.headingWeight,
        body: entry.fonts.body,
        bodyWeight: entry.fonts.bodyWeight,
      },
      borderRadius: entry.borderRadius,
      button: {
        borderRadius: bs.borderRadius ?? "6px",
        paddingVertical: paddingV,
        paddingHorizontal: paddingH,
        fontSize: bs.fontSize ?? "0.9375rem",
        fontWeight: bs.fontWeight ?? "600",
        textTransform: bs.textTransform ?? "none",
        letterSpacing: bs.letterSpacing ?? "0",
      },
      headingSizes: entry.headingSizes ?? {
        h1: "clamp(2rem, 4vw, 3rem)",
        h2: "clamp(1.5rem, 3vw, 2.25rem)",
        h3: "clamp(1.25rem, 2.5vw, 1.75rem)",
        h4: "1.125rem",
      },
      sectionPadding: entry.sectionPadding ?? "4rem",
      layout: {
        contentSize: entry.contentSize ?? "800px",
        wideSize: entry.wideSize ?? "1200px",
      },
      googleFontsUrl: entry.fonts.googleFontsUrl ?? "",
    };
  } else {
    // Fall back to archetype-based preset
    preset = getThemePreset(site.archetype);
  }

  // 3. Apply quick-style color overrides if activePreset is set
  if (site.activePreset && QUICK_STYLE_OVERRIDES[site.activePreset]) {
    const overrides = QUICK_STYLE_OVERRIDES[site.activePreset];
    preset = mergeUserColors(preset, [overrides.primary, "", overrides.accent]);
  }

  // 4. Build theme.json
  const themeJson = buildThemeJson(preset);
  const themeJsonStr = JSON.stringify(themeJson, null, 2);

  // 5. Push to WordPress
  const wp = USE_MULTI_THEME ? getExecutor(siteId) : getExecutor();

  // 5a. Write theme.json — use writeFile (docker cp) to bypass shell quoting
  const themeDir = await wp.execute(`eval "echo get_stylesheet_directory();"`);
  await wp.writeFile(`${themeDir}/theme.json`, themeJsonStr);

  // 5b. Update Google Fonts URL — write to temp file, then set option via eval
  const fontsUrl = preset.googleFontsUrl;
  if (fontsUrl) {
    await wp.writeFile("/tmp/xusmo-fonts-url.txt", fontsUrl);
    await wp.execute(
      `eval "update_option('xusmo_google_fonts_url', trim(file_get_contents('/tmp/xusmo-fonts-url.txt')));"`
    );
  }

  // 5b2. Push theme tokens for React components (window.xusmoTheme)
  const themeTokens = JSON.stringify({
    colors: preset.colors,
    fonts: { heading: preset.fonts.heading, body: preset.fonts.body },
    borderRadius: preset.borderRadius,
    button: preset.button,
  });
  await wp.writeFile("/tmp/xusmo-theme-tokens.json", themeTokens);
  await wp.execute(
    `eval "update_option('xusmo_theme_tokens', file_get_contents('/tmp/xusmo-theme-tokens.json'));"`
  );

  // 5c. Build CSS variables from preset colors + append custom CSS
  const cssVars = Object.entries(preset.colors)
    .map(([key, value]) => `  --sf-${key}: ${value};`)
    .join("\n");

  let fullCss = `:root {\n${cssVars}\n}`;

  // Design polish CSS — card shadows, button hover, transitions
  fullCss += `

/* Card polish — subtle shadow + hover lift */
.wp-block-group[style*="border-radius"] {
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.wp-block-group[style*="border-radius"]:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  transform: translateY(-2px);
}

/* Button hover */
.wp-block-button__link {
  transition: opacity 0.2s ease, transform 0.15s ease;
}
.wp-block-button__link:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* ===== Premium Transparent Header ===== */

/* Kill the global 4rem group padding on header inner groups only */
.xusmo-header > .wp-block-group,
.xusmo-header .wp-block-group .wp-block-group {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

/* Fixed glass header */
.xusmo-header-transparent {
  position: fixed !important;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 9999;
  background: rgba(10, 10, 10, 0.5) !important;
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  transition: background 0.3s ease, box-shadow 0.3s ease;
  padding-top: 1.25rem !important;
  padding-bottom: 1.25rem !important;
}

/* Logo area */
.xusmo-logo-area.wp-block-group {
  flex-shrink: 0;
}

/* Site title — premium text logo with accent dot */
.xusmo-header-transparent .wp-block-site-title {
  margin: 0 !important;
  line-height: 1 !important;
}
.xusmo-header-transparent .wp-block-site-title a {
  color: #ffffff !important;
  text-decoration: none !important;
  font-size: 1.75rem !important;
  font-weight: 800 !important;
  letter-spacing: -0.03em !important;
  transition: color 0.2s ease;
  white-space: nowrap;
}
.xusmo-header-transparent .wp-block-site-title a:hover {
  color: var(--wp--preset--color--primary) !important;
}

/* Nav container — ensure horizontal with good spacing */
.xusmo-header-transparent .wp-block-navigation {
  flex-shrink: 0;
}
.xusmo-header-transparent .wp-block-navigation .wp-block-navigation__container {
  gap: 2.5rem !important;
}

/* Nav links — white on transparent header */
.xusmo-header-transparent .wp-block-navigation a,
.xusmo-header-transparent .wp-block-navigation .wp-block-navigation-item__content {
  color: rgba(255, 255, 255, 0.85) !important;
  text-decoration: none !important;
  font-weight: 500;
  font-size: 0.95rem !important;
  transition: color 0.2s ease;
  position: relative;
  padding: 0.5rem 0 !important;
}
.xusmo-header-transparent .wp-block-navigation a:hover,
.xusmo-header-transparent .wp-block-navigation .wp-block-navigation-item__content:hover {
  color: #ffffff !important;
}

/* Animated underline on hover */
.xusmo-header-transparent .wp-block-navigation .wp-block-navigation-item a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--wp--preset--color--primary);
  transition: width 0.25s ease;
  border-radius: 1px;
}
.xusmo-header-transparent .wp-block-navigation .wp-block-navigation-item a:hover::after {
  width: 100%;
}

/* Hamburger/menu icon — white */
.xusmo-header-transparent .wp-block-navigation__responsive-container-open svg,
.xusmo-header-transparent .wp-block-navigation button svg {
  fill: #ffffff;
}

/* Mobile overlay polish */
.wp-block-navigation__responsive-container.is-menu-open {
  animation: xusmoFadeIn 0.25s ease;
}
@keyframes xusmoFadeIn { from { opacity: 0; } to { opacity: 1; } }

/* Footer link styling */
.wp-block-group.has-surface-background-color a {
  transition: color 0.2s ease;
}

/* Better separator styling */
.wp-block-separator.is-style-dots::before {
  font-size: 0.5em;
}

/* ===== Broken image fallback ===== */
/* Hide empty src images, show gradient placeholder instead */
.xusmo-service-img img[src=""] { display: none; }
.xusmo-service-img:has(img[src=""]) {
  background: linear-gradient(135deg, var(--wp--preset--color--surface, #f5f5f5), var(--wp--preset--color--border, #e0e0e0));
  aspect-ratio: 16/10;
  border-radius: 12px;
}

/* ===== Premium component polish ===== */

/* Card hover lift + enhanced shadow */
.wp-block-group.has-border-color {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.wp-block-group.has-border-color:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.08);
}

/* Outline button fill on hover */
.wp-block-button.is-style-outline .wp-block-button__link:hover {
  background: var(--wp--preset--color--primary) !important;
  color: var(--wp--preset--color--background) !important;
}

/* Section heading accent underline */
h2.wp-block-heading.has-text-align-center::after {
  content: '';
  display: block;
  width: 48px;
  height: 3px;
  background: var(--wp--preset--color--primary);
  margin: 0.75rem auto 0;
  border-radius: 2px;
}

/* Stats gradient text */
.wp-block-group p[style*="font-size:3"] {
  background: linear-gradient(135deg, var(--wp--preset--color--primary), var(--wp--preset--color--accent, var(--wp--preset--color--primary)));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* FAQ accordion polish */
details.wp-block-details {
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}
details.wp-block-details[open] {
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
details.wp-block-details summary {
  cursor: pointer;
  padding: 1rem 1.25rem;
  list-style: none;
  position: relative;
  padding-right: 2.5rem;
}
details.wp-block-details summary::-webkit-details-marker { display: none; }
details.wp-block-details summary::after {
  content: '+';
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.25rem;
  font-weight: 300;
  color: var(--wp--preset--color--text-muted);
  transition: transform 0.2s ease;
}
details.wp-block-details[open] summary::after {
  content: '\\2212';
}

/* Trust bar dot separator opacity */
.wp-block-separator.is-style-dots { opacity: 0.3; }

/* Service card learn-more link */
.xusmo-learn-more {
  display: inline-block;
  margin-top: 0.75rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--wp--preset--color--primary);
  text-decoration: none;
  transition: gap 0.2s ease;
}
.xusmo-learn-more:hover { text-decoration: underline; }
.xusmo-learn-more a { color: inherit; text-decoration: none; }
.xusmo-learn-more a:hover { text-decoration: underline; }

/* ===== Header-Hero Gap Fix ===== */
.entry-content { margin-top: 0 !important; }
.entry-content > .wp-block-cover:first-child { margin-top: 0 !important; }
.wp-site-blocks > .entry-content > *:first-child { margin-top: 0 !important; }

/* ===== Hero & CTA Contrast Hardening ===== */
.wp-block-cover .wp-block-cover__inner-container h1,
.wp-block-cover .wp-block-cover__inner-container h2 {
  color: #ffffff !important;
}
.wp-block-cover .wp-block-cover__inner-container p:not(.xusmo-learn-more) {
  color: rgba(255,255,255,0.85) !important;
}
.wp-block-cover .wp-block-cover__inner-container .wp-block-button__link {
  color: #ffffff;
}
/* CTA banner on primary bg — force white text */
.wp-block-group.has-primary-background-color > h2,
.wp-block-group.has-primary-background-color > .wp-block-heading {
  color: #ffffff !important;
}
.wp-block-group.has-primary-background-color > p {
  color: rgba(255,255,255,0.9) !important;
}

/* ===== WooCommerce Store Styling ===== */

/* Product grid */
.woocommerce ul.products li.product {
  border: 1px solid var(--wp--preset--color--border, #e5e7eb);
  border-radius: var(--wp--custom--border-radius--medium, 8px);
  padding: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background: var(--wp--preset--color--background, #fff);
}
.woocommerce ul.products li.product:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.1);
}

/* Product titles */
.woocommerce ul.products li.product .woocommerce-loop-product__title {
  font-family: var(--wp--preset--font-family--heading, sans-serif);
  font-weight: 600;
  font-size: 1rem;
  color: var(--wp--preset--color--text, #1e1b4b);
  padding: 0.75rem 0 0.25rem;
}

/* Prices */
.woocommerce ul.products li.product .price {
  color: var(--wp--preset--color--text, #1e1b4b);
  font-weight: 700;
  font-size: 1.1rem;
}
.woocommerce ul.products li.product .price del {
  color: var(--wp--preset--color--text-muted, #6b7280);
  font-weight: 400;
}
.woocommerce ul.products li.product .price ins {
  color: var(--wp--preset--color--accent, #f59e0b);
  text-decoration: none;
  font-weight: 700;
}

/* Add to cart button */
.woocommerce ul.products li.product .button,
.woocommerce .single-product .single_add_to_cart_button,
.woocommerce .cart .button,
.woocommerce .checkout .button {
  background: var(--wp--preset--color--primary, #2563eb) !important;
  color: #ffffff !important;
  border: none;
  border-radius: var(--wp--custom--border-radius--medium, 8px);
  padding: 0.65rem 1.5rem;
  font-family: var(--wp--preset--font-family--body, sans-serif);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.15s ease;
  text-transform: none;
  letter-spacing: 0;
}
.woocommerce ul.products li.product .button:hover,
.woocommerce .single-product .single_add_to_cart_button:hover,
.woocommerce .cart .button:hover,
.woocommerce .checkout .button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Sale badge */
.woocommerce span.onsale {
  background: var(--wp--preset--color--accent, #f59e0b);
  color: #ffffff;
  border-radius: var(--wp--custom--border-radius--small, 6px);
  font-weight: 600;
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  min-height: auto;
  min-width: auto;
  line-height: 1.5;
}

/* Star ratings */
.woocommerce .star-rating span::before,
.woocommerce .star-rating::before {
  color: var(--wp--preset--color--accent, #f59e0b);
}

/* Product images */
.woocommerce ul.products li.product a img {
  border-radius: var(--wp--custom--border-radius--medium, 8px);
  margin-bottom: 0.5rem;
}

/* Breadcrumbs */
.woocommerce .woocommerce-breadcrumb {
  color: var(--wp--preset--color--text-muted, #6b7280);
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}
.woocommerce .woocommerce-breadcrumb a {
  color: var(--wp--preset--color--primary, #2563eb);
  text-decoration: none;
}
.woocommerce .woocommerce-breadcrumb a:hover {
  text-decoration: underline;
}

/* Cart page */
.woocommerce-cart .woocommerce table.cart {
  border-collapse: collapse;
}
.woocommerce-cart .woocommerce table.cart td,
.woocommerce-cart .woocommerce table.cart th {
  border-bottom: 1px solid var(--wp--preset--color--border, #e5e7eb);
  padding: 1rem 0.75rem;
}
.woocommerce-cart .woocommerce table.cart th {
  font-family: var(--wp--preset--font-family--heading, sans-serif);
  font-weight: 600;
  color: var(--wp--preset--color--text, #1e1b4b);
}

/* Checkout form */
.woocommerce-checkout .woocommerce form .form-row input.input-text,
.woocommerce-checkout .woocommerce form .form-row textarea,
.woocommerce-checkout .woocommerce form .form-row select {
  border: 1px solid var(--wp--preset--color--border, #e5e7eb);
  border-radius: var(--wp--custom--border-radius--small, 6px);
  padding: 0.65rem 0.85rem;
  font-family: var(--wp--preset--font-family--body, sans-serif);
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}
.woocommerce-checkout .woocommerce form .form-row input.input-text:focus,
.woocommerce-checkout .woocommerce form .form-row select:focus {
  border-color: var(--wp--preset--color--primary, #2563eb);
  outline: none;
  box-shadow: 0 0 0 2px rgba(37,99,235,0.1);
}

/* Single product tabs */
.woocommerce div.product .woocommerce-tabs ul.tabs li {
  border-radius: var(--wp--custom--border-radius--small, 6px) var(--wp--custom--border-radius--small, 6px) 0 0;
}
.woocommerce div.product .woocommerce-tabs ul.tabs li.active {
  border-bottom-color: var(--wp--preset--color--background, #fff);
}
.woocommerce div.product .woocommerce-tabs ul.tabs li a {
  font-family: var(--wp--preset--font-family--body, sans-serif);
  font-weight: 600;
  color: var(--wp--preset--color--text, #1e1b4b);
}

/* Quantity input */
.woocommerce .quantity .qty {
  border: 1px solid var(--wp--preset--color--border, #e5e7eb);
  border-radius: var(--wp--custom--border-radius--small, 6px);
  padding: 0.5rem;
  width: 4rem;
  text-align: center;
}

/* Notices */
.woocommerce .woocommerce-message,
.woocommerce .woocommerce-info {
  border-top-color: var(--wp--preset--color--primary, #2563eb);
}
.woocommerce .woocommerce-message::before,
.woocommerce .woocommerce-info::before {
  color: var(--wp--preset--color--primary, #2563eb);
}

/* My Account */
.woocommerce-MyAccount-navigation ul {
  list-style: none;
  padding: 0;
}
.woocommerce-MyAccount-navigation ul li {
  border-bottom: 1px solid var(--wp--preset--color--border, #e5e7eb);
}
.woocommerce-MyAccount-navigation ul li a {
  display: block;
  padding: 0.75rem 1rem;
  color: var(--wp--preset--color--text, #1e1b4b);
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s ease;
}
.woocommerce-MyAccount-navigation ul li a:hover {
  background: var(--wp--preset--color--surface, #f5f3ff);
}
.woocommerce-MyAccount-navigation ul li.is-active a {
  color: var(--wp--preset--color--primary, #2563eb);
  font-weight: 600;
  background: var(--wp--preset--color--surface, #f5f3ff);
}

/* ===== Button Consistency ===== */

/* Uniform border-radius on all buttons */
.wp-block-button__link {
  border-radius: var(--wp--custom--border-radius--medium, 8px) !important;
}

/* Primary (filled) button — darken on hover instead of just opacity */
.wp-block-button:not(.is-style-outline) .wp-block-button__link:hover {
  filter: brightness(0.9);
  opacity: 1;
}

/* Ghost/outline button on hero covers — ensure visible border */
.wp-block-cover .wp-block-button.is-style-outline .wp-block-button__link {
  border-color: rgba(255,255,255,0.6) !important;
  color: #ffffff !important;
}
.wp-block-cover .wp-block-button.is-style-outline .wp-block-button__link:hover {
  background: rgba(255,255,255,0.15) !important;
  border-color: #ffffff !important;
  color: #ffffff !important;
}

/* ===== Contact Page Spacing Fix ===== */

/* Compact contact info items — reduce excessive padding between ADDRESS/PHONE/EMAIL/HOURS */
.wp-block-group[style*="blockGap"] > .wp-block-group[style*="blockGap"] {
  margin-bottom: 0 !important;
}

/* Learn-more links — pointer cursor */
.xusmo-learn-more { cursor: pointer; }
.xusmo-learn-more a { cursor: pointer; }

/* ===== Typography Hierarchy ===== */

/* Section headings — differentiate from FAQ/detail headings */
.wp-block-group > .wp-block-heading:first-child {
  letter-spacing: -0.01em;
}

/* FAQ question text — visually subordinate to section headings */
.wp-block-details summary {
  font-size: 1rem;
  font-weight: 600;
}

/* Section subtitles — use muted color consistently */
.wp-block-group > .wp-block-heading + p.has-text-muted-color {
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Stats bar numbers — accent color for visual pop */
.has-primary-background-color .wp-block-heading {
  color: #ffffff !important;
}

/* ===== CTA Contrast + Color Consistency ===== */

/* CTA section buttons on primary bg */
.wp-block-group.has-primary-background-color .wp-block-button__link {
  color: var(--wp--preset--color--primary, #1e1b4b) !important;
  background: var(--wp--preset--color--background, #ffffff) !important;
}
.wp-block-group.has-primary-background-color .wp-block-button__link:hover {
  opacity: 0.92;
}

/* Ensure all paragraphs in CTA sections on primary bg have readable text */
.wp-block-group.has-primary-background-color p {
  color: rgba(255,255,255,0.9) !important;
}
.wp-block-group.has-primary-background-color .wp-block-heading {
  color: #ffffff !important;
}

/* ===== Team Member Cards ===== */

/* Placeholder avatar when no photo uploaded */
.wp-block-image img[src=""] {
  display: none;
}
.wp-block-image:has(img[src=""]) {
  background: linear-gradient(135deg, var(--wp--preset--color--surface, #f5f5f5), var(--wp--preset--color--border, #e0e0e0));
  border-radius: 100%;
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

/* Smooth scroll */
html { scroll-behavior: smooth; }`;

  if (site.customCss) {
    fullCss += `\n\n/* === Custom CSS === */\n${site.customCss}`;
  }

  await wp.writeFile("/tmp/xusmo-custom-css.txt", fullCss);
  await wp.execute(
    `eval "update_option('xusmo_custom_css', file_get_contents('/tmp/xusmo-custom-css.txt'));"`
  );

  // 5d. Flush WordPress theme.json cache so changes take effect immediately
  //     WP_Theme_JSON_Resolver caches the parsed theme.json in transients;
  //     without flushing, the old colors/fonts/spacing persist until cache expires.
  await wp.execute(
    `eval "WP_Theme_JSON_Resolver::clean_cached_data(); wp_cache_flush();"`
  );

  // 6. Update themeVersion timestamp in the database
  await prisma.site.update({
    where: { id: siteId },
    data: { themeVersion: new Date().toISOString() },
  });

  console.log(`[sync] Design synced to WordPress for site ${siteId}`);
}

// ---------------------------------------------------------------------------
// syncPageToWordPress
// ---------------------------------------------------------------------------

/**
 * Push a single page's content from the local DB to the live WordPress
 * installation. Updates the post content and optional Yoast SEO meta.
 */
export async function syncPageToWordPress(
  siteId: string,
  pageSlug: string
): Promise<void> {
  // 1. Fetch the page record
  const page = await prisma.page.findUnique({
    where: { siteId_slug: { siteId, slug: pageSlug } },
    select: {
      wpPostId: true,
      content: true,
      metaTitle: true,
      metaDesc: true,
    },
  });

  if (!page) {
    console.warn(`[sync] Page "${pageSlug}" not found for site ${siteId}`);
    return;
  }

  // 2. Validate wpPostId
  if (!page.wpPostId) {
    console.warn(
      `[sync] Page "${pageSlug}" (site ${siteId}) has no wpPostId — skipping WP sync`
    );
    return;
  }

  // 3. Validate content
  if (!page.content) {
    console.warn(
      `[sync] Page "${pageSlug}" (site ${siteId}) has no content — skipping WP sync`
    );
    return;
  }

  // 4. Push content to WordPress via file-based transfer
  const wp = USE_MULTI_THEME ? getExecutor(siteId) : getExecutor();

  await wp.writeFile("/tmp/xusmo-page-content.html", page.content);
  await wp.execute(
    `eval "wp_update_post(['ID' => ${page.wpPostId}, 'post_content' => file_get_contents('/tmp/xusmo-page-content.html')]);"`
  );

  // 5. Update Yoast SEO meta (if available — fail silently)
  if (page.metaTitle) {
    try {
      await wp.writeFile("/tmp/xusmo-meta-title.txt", page.metaTitle);
      await wp.execute(
        `eval "update_post_meta(${page.wpPostId}, '_yoast_wpseo_title', trim(file_get_contents('/tmp/xusmo-meta-title.txt')));"`
      );
    } catch {
      // Yoast may not be installed — ignore
    }
  }

  if (page.metaDesc) {
    try {
      await wp.writeFile("/tmp/xusmo-meta-desc.txt", page.metaDesc);
      await wp.execute(
        `eval "update_post_meta(${page.wpPostId}, '_yoast_wpseo_metadesc', trim(file_get_contents('/tmp/xusmo-meta-desc.txt')));"`
      );
    } catch {
      // Yoast may not be installed — ignore
    }
  }

  console.log(
    `[sync] Page "${pageSlug}" (wpPostId=${page.wpPostId}) synced for site ${siteId}`
  );
}
