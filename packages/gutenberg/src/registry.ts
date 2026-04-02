// =============================================================================
// Pattern Registry — Maps page types to pattern sequences per archetype.
// Each page is composed of a sequence of patterns that get hydrated with content.
// =============================================================================

import type { Archetype } from "./types";

// All available pattern slugs (matching files in patterns/)
export type PatternSlug =
  | "hero-split-screen"
  | "hero-image-bg"
  | "services-grid"
  | "trust-bar"
  | "testimonials-carousel"
  | "faq-accordion"
  | "cta-banner"
  | "cta-split"
  | "contact-form-section"
  | "hours-widget"
  | "menu-grid"
  | "gallery-masonry"
  | "pricing-table"
  | "team-grid"
  | "portfolio-grid"
  | "map-embed"
  | "booking-cta"
  | "stats-counter"
  | "logo-cloud"
  | "blog-preview"
  // Design-package variants (added by other agents)
  | "hero-centered-minimal"
  | "hero-video-bg"
  | "hero-asymmetric"
  | "hero-cards"
  | "services-alternating"
  | "services-icons"
  | "testimonials-cards"
  | "testimonials-single"
  | "cta-gradient"
  | "cta-minimal"
  | "features-checklist"
  | "features-columns"
  // React component mount-point patterns
  | "hero-cinematic"
  | "services-overlay-cards"
  | "testimonial-editorial"
  | "cta-borderline"
  | "hero-gradient-blob"
  | "features-rounded-cards"
  | "testimonials-avatar-cards"
  | "cta-mesh-banner"
  | "hero-asymmetric-minimal"
  | "services-alternating-rows"
  | "testimonial-centered"
  | "cta-underline-text"
  | "hero-uppercase"
  | "features-numbered-grid"
  | "stats-proof"
  | "cta-bright-border"
  | "hero-warm-split"
  | "services-warm-circles"
  | "testimonials-warm-cards"
  | "cta-warm-gradient"
  // E-commerce patterns
  | "shop-hero"
  | "product-grid"
  | "product-featured"
  | "product-categories";

// Page layout definitions: archetype → page slug → pattern sequence
export const PAGE_LAYOUTS: Record<Archetype, Record<string, PatternSlug[]>> = {
  SERVICE: {
    home: [
      "hero-split-screen",
      "services-grid",
      "stats-counter",
      "testimonials-carousel",
      "faq-accordion",
      "cta-banner",
    ],
    services: ["hero-image-bg", "services-grid", "pricing-table", "cta-split"],
    about: [
      "hero-split-screen",
      "stats-counter",
      "team-grid",
      "testimonials-carousel",
      "cta-banner",
    ],
    contact: ["contact-form-section", "hours-widget", "map-embed"],
    gallery: ["hero-image-bg", "gallery-masonry", "cta-banner"],
    faq: ["hero-image-bg", "faq-accordion", "cta-split"],
    testimonials: ["hero-image-bg", "testimonials-carousel", "cta-banner"],
    service_areas: ["hero-image-bg", "stats-counter", "cta-banner"],
    blog: ["hero-image-bg", "blog-preview", "cta-split"],
  },
  VENUE: {
    home: [
      "hero-image-bg",
      "hours-widget",
      "menu-grid",
      "gallery-masonry",
      "testimonials-carousel",
      "booking-cta",
    ],
    menu: ["hero-image-bg", "menu-grid", "pricing-table", "booking-cta"],
    about: ["hero-split-screen", "team-grid", "stats-counter", "cta-banner"],
    contact: ["contact-form-section", "hours-widget", "map-embed"],
    gallery: ["hero-image-bg", "gallery-masonry", "booking-cta"],
    events: ["hero-image-bg", "blog-preview", "booking-cta"],
    booking: ["hero-image-bg", "booking-cta", "hours-widget"],
    reviews: ["hero-image-bg", "testimonials-carousel", "cta-banner"],
  },
  PORTFOLIO: {
    home: [
      "hero-split-screen",
      "portfolio-grid",
      "stats-counter",
      "testimonials-carousel",
      "cta-split",
    ],
    portfolio: ["hero-image-bg", "portfolio-grid", "cta-banner"],
    about: ["hero-split-screen", "stats-counter", "cta-banner"],
    contact: ["contact-form-section", "map-embed"],
    services: ["hero-image-bg", "services-grid", "pricing-table", "cta-split"],
    testimonials: ["hero-image-bg", "testimonials-carousel", "cta-banner"],
    case_studies: ["hero-image-bg", "portfolio-grid", "cta-split"],
    pricing: ["hero-image-bg", "pricing-table", "faq-accordion", "cta-banner"],
    blog: ["hero-image-bg", "blog-preview", "cta-split"],
  },
  COMMERCE: {
    home: [
      "hero-image-bg",
      "product-featured",
      "testimonials-carousel",
      "faq-accordion",
      "cta-banner",
    ],
    shop: ["shop-hero", "product-grid", "cta-split"],
    about: ["hero-split-screen", "stats-counter", "team-grid", "cta-banner"],
    contact: ["contact-form-section", "hours-widget", "map-embed"],
    faq: ["hero-image-bg", "faq-accordion", "cta-split"],
    categories: ["shop-hero", "product-categories", "cta-banner"],
    policies: ["hero-image-bg", "faq-accordion"],
    blog: ["hero-image-bg", "blog-preview", "cta-split"],
  },
};

/**
 * Get the pattern sequence for a specific page + archetype.
 * Falls back to a sensible default if no layout is defined.
 */
export function getPageLayout(
  archetype: Archetype,
  pageSlug: string
): PatternSlug[] {
  const archetypeLayouts = PAGE_LAYOUTS[archetype];
  if (archetypeLayouts && archetypeLayouts[pageSlug]) {
    return archetypeLayouts[pageSlug];
  }

  // Default fallback for unknown pages
  return ["hero-image-bg", "cta-banner"];
}

/**
 * Design package — optional structural overrides from ThemePoolEntry.
 */
export interface DesignPackage {
  headerVariant?: string;
  footerVariant?: string;
  [key: string]: unknown; // e.g. homeLayout, aboutLayout, contactLayout
}

/**
 * Get the pattern sequence for a page, checking designPackage first.
 * If the designPackage defines a `<pageSlug>Layout` array, use that.
 * Otherwise fall back to archetype defaults.
 */
export function getPageLayoutWithDesignPackage(
  archetype: Archetype,
  pageSlug: string,
  designPackage?: DesignPackage | null
): PatternSlug[] {
  if (designPackage) {
    const layoutKey = `${pageSlug}Layout`;
    const customLayout = designPackage[layoutKey];
    if (Array.isArray(customLayout) && customLayout.length > 0) {
      return customLayout as PatternSlug[];
    }
  }
  return getPageLayout(archetype, pageSlug);
}

/**
 * Get all pattern slugs used across an entire site.
 */
export function getAllPatternsForSite(
  archetype: Archetype,
  pageSlugs: string[]
): Set<PatternSlug> {
  const patterns = new Set<PatternSlug>();
  for (const slug of pageSlugs) {
    const layout = getPageLayout(archetype, slug);
    layout.forEach((p) => patterns.add(p));
  }
  return patterns;
}

// ---------------------------------------------------------------------------
// Design Style — classification + layout mappings
// ---------------------------------------------------------------------------

export type DesignStyle =
  | "dark-luxury"
  | "clean-corporate"
  | "bold-startup"
  | "elegant-studio"
  | "industrial"
  | "warm-friendly"
  | "creative-portfolio"
  | "modern-gradient";

const SERIF_FONTS = new Set([
  "Playfair Display", "Lora", "Cormorant Garamond", "Libre Baskerville",
  "Merriweather", "Vollkorn", "Alegreya", "DM Serif Display",
  "Crimson Text", "Source Serif Pro", "EB Garamond",
]);

/**
 * Classify a theme into one of 8 design styles based on its properties.
 * Server-side mirror of ThemePreview.classifyTheme().
 */
export function classifyDesignStyle(theme: {
  colors: Record<string, string>;
  fonts: { heading: string };
  borderRadius?: { medium?: string };
  buttonStyle?: { textTransform?: string };
  designPackage?: { homeLayout?: string[] } | null;
}): DesignStyle {
  const bg = theme.colors.bg || theme.colors.background || "#ffffff";
  const isDark = !isLightHex(bg);
  const isSerif = SERIF_FONTS.has(theme.fonts.heading);
  const rad = parseInt(theme.borderRadius?.medium || "8");
  const isUppercase = theme.buttonStyle?.textTransform === "uppercase";
  const hero = theme.designPackage?.homeLayout?.[0] || "";

  if (isDark && isSerif) return "dark-luxury";
  if (isDark && rad <= 4) return "industrial";
  if (isDark) return "modern-gradient";
  if (isSerif && rad <= 6) return "elegant-studio";
  if (isSerif) return "warm-friendly";
  if (rad >= 16) return "bold-startup";
  if (isUppercase || rad <= 2) return "industrial";
  if (hero.includes("asymmetric") || hero.includes("video")) return "creative-portfolio";
  if (hero.includes("split") || hero.includes("card")) return "clean-corporate";
  return "clean-corporate";
}

function isLightHex(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length < 6) return true;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 140;
}

/**
 * Home page pattern layouts for each design style.
 * Each style uses a distinct combination of patterns to create a unique page structure.
 */
export const DESIGN_STYLE_HOME_LAYOUTS: Record<DesignStyle, PatternSlug[]> = {
  "dark-luxury": [
    "hero-cinematic",
    "services-overlay-cards",
    "testimonial-editorial",
    "cta-borderline",
  ],
  "clean-corporate": [
    "hero-split-screen",
    "features-columns",
    "testimonials-cards",
    "cta-gradient",
  ],
  "bold-startup": [
    "hero-gradient-blob",
    "features-rounded-cards",
    "testimonials-avatar-cards",
    "cta-mesh-banner",
  ],
  "elegant-studio": [
    "hero-asymmetric-minimal",
    "services-alternating-rows",
    "testimonial-centered",
    "cta-underline-text",
  ],
  "industrial": [
    "hero-uppercase",
    "features-numbered-grid",
    "stats-proof",
    "cta-bright-border",
  ],
  "warm-friendly": [
    "hero-warm-split",
    "services-warm-circles",
    "testimonials-warm-cards",
    "cta-warm-gradient",
  ],
  "creative-portfolio": [
    "hero-asymmetric",
    "portfolio-grid",
    "services-icons",
    "testimonials-single",
    "cta-gradient",
  ],
  "modern-gradient": [
    "hero-cards",
    "features-columns",
    "services-grid",
    "testimonials-carousel",
    "stats-counter",
    "cta-gradient",
  ],
};

/**
 * Get the home page layout for a design style.
 * Used when applying a theme to re-assemble page content.
 */
export function getDesignStyleLayout(style: DesignStyle): PatternSlug[] {
  return DESIGN_STYLE_HOME_LAYOUTS[style];
}
