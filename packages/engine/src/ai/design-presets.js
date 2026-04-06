// =============================================================================
// Design Presets — 5 hardcoded website templates that use ALL 95 components.
// These bypass the LLM planner and force specific component + layout structures.
// The LLM only fills content — not structure.
// =============================================================================

/**
 * Get a design preset by name.
 * Returns the full page structure with components, layouts, and default props.
 */
export function getDesignPreset(presetName) {
  return PRESETS[presetName] || null
}

export function listPresetNames() {
  return Object.keys(PRESETS)
}

// Helper: create section def
function s(component, layout = {}, props = {}, style = {}) {
  return { component, layout, props, style }
}

const PRESETS = {

  // =========================================================================
  // DESIGN 1: AURORA MARKETPLACE — Full E-commerce
  // =========================================================================
  "aurora-marketplace": {
    personality: "dark-luxury",
    archetype: "COMMERCE",
    theme: {
      name: "Aurora Dark Commerce",
      colors: { accent: "#C9A96E", accentLight: "rgba(201,169,110,0.1)", background: "#0A0A0A", surface: "#141414", text: "#F5F5F5", muted: "#94A3B8", border: "rgba(255,255,255,0.1)" },
      fonts: { heading: "Playfair Display", body: "Inter" },
      radius: "12px",
    },
    pages: {
      home: {
        sections: [
          s("announcement-bar", { background: "accent", padding: "sm", width: "full" }, { text: "Free shipping on orders over $150", link: { label: "Shop Now", href: "/shop" } }),
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("hero-image", { background: "dark", padding: "xl", width: "full" }, { layout: "split" }),
          s("hero-stats", { background: "default", padding: "lg" }, { layout: "banner" }),
          s("category-showcase", { background: "default", padding: "lg" }),
          s("product-grid", { background: "surface", padding: "lg" }),
          s("featured-content", { background: "default", padding: "lg" }, { layout: "fullbleed" }),
          s("carousel", { background: "default", padding: "lg" }),
          s("testimonials", { background: "accent-light", padding: "lg" }, { layout: "marquee" }),
          s("before-after-comparison", { background: "default", padding: "lg" }),
          s("client-logos", { background: "surface", padding: "md" }),
          s("newsletter-form", { background: "accent-light", padding: "lg" }),
          s("trust-badges", { background: "default", padding: "md" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }, { layout: "columns" }),
          s("cookie-consent", { background: "none", padding: "none" }),
          s("back-to-top", { background: "none", padding: "none" }),
        ],
      },
      shop: {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("breadcrumbs", { background: "default", padding: "sm" }),
          s("section-title", { background: "default", padding: "md" }, { layout: "split" }),
          s("advanced-search", { background: "surface", padding: "md" }),
          s("filters-sidebar", { background: "surface", padding: "md" }),
          s("product-grid", { background: "default", padding: "lg" }),
          s("pagination", { background: "default", padding: "md" }),
          s("related-content", { background: "surface", padding: "lg" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }),
        ],
      },
      "product-detail": {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("breadcrumbs", { background: "default", padding: "sm" }),
          s("product-detail", { background: "default", padding: "lg" }),
          s("product-gallery", { background: "default", padding: "lg" }),
          s("product-specs-table", { background: "surface", padding: "lg" }),
          s("rating-widget", { background: "default", padding: "md" }),
          s("review-form", { background: "surface", padding: "lg" }),
          s("comment-section", { background: "default", padding: "lg" }),
          s("related-content", { background: "surface", padding: "lg" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }),
        ],
      },
      account: {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("user-dashboard", { background: "default", padding: "lg" }),
          s("order-history", { background: "surface", padding: "lg" }),
          s("saved-items", { background: "default", padding: "lg" }),
          s("notifications-center", { background: "surface", padding: "lg" }),
          s("messages-inbox", { background: "default", padding: "lg" }),
          s("profile-page", { background: "surface", padding: "lg" }),
          s("edit-profile-form", { background: "default", padding: "lg" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }),
        ],
      },
      contact: {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("breadcrumbs", { background: "default", padding: "sm" }),
          s("contact", { background: "default", padding: "lg" }),
          s("contact-form", { background: "surface", padding: "lg" }),
          s("contact-details-block", { background: "default", padding: "lg" }),
          s("social-media-icons", { background: "default", padding: "md" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }),
        ],
      },
    },
  },

  // =========================================================================
  // DESIGN 2: VANGUARD SAAS — Enterprise Platform
  // =========================================================================
  "vanguard-saas": {
    personality: "geometric",
    archetype: "SERVICE",
    theme: {
      name: "Vanguard Geometric",
      colors: { accent: "#6D28D9", accentLight: "#EDE9FE", background: "#FAFAFA", surface: "#FFFFFF", text: "#0F172A", muted: "#64748B", border: "#E2E8F0" },
      fonts: { heading: "Space Grotesk", body: "Inter" },
      radius: "8px",
    },
    pages: {
      home: {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("hero", { background: "default", padding: "xl", width: "full" }, { layout: "center" }),
          s("scroll-indicator", { background: "none", padding: "sm" }),
          s("hero-stats", { background: "surface", padding: "lg" }, { layout: "cards" }),
          s("features", { background: "default", padding: "lg" }),
          s("section-title", { background: "default", padding: "md" }, { layout: "left" }),
          s("embedded-media", { background: "surface", padding: "lg" }),
          s("services-section", { background: "default", padding: "lg" }, { layout: "list" }),
          s("pricing-table", { background: "surface", padding: "lg" }),
          s("feature-comparison", { background: "default", padding: "lg" }),
          s("case-studies", { background: "surface", padding: "lg" }),
          s("testimonials", { background: "accent-light", padding: "lg" }, { layout: "single" }),
          s("contact-form", { background: "default", padding: "lg" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }, { layout: "simple" }),
        ],
      },
      pricing: {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("breadcrumbs", { background: "default", padding: "sm" }),
          s("section-title", { background: "default", padding: "lg" }, { layout: "center" }),
          s("pricing", { background: "default", padding: "lg" }),
          s("pricing-table", { background: "surface", padding: "lg" }),
          s("feature-comparison", { background: "default", padding: "lg" }),
          s("faq-accordion", { background: "surface", padding: "lg" }),
          s("contact", { background: "accent-light", padding: "lg" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }),
        ],
      },
      features: {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("breadcrumbs", { background: "default", padding: "sm" }),
          s("hero-video", { background: "dark", padding: "xl", width: "full" }),
          s("features", { background: "default", padding: "lg" }),
          s("video-player", { background: "surface", padding: "lg" }),
          s("before-after-comparison", { background: "default", padding: "lg" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }),
        ],
      },
      blog: {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("breadcrumbs", { background: "default", padding: "sm" }),
          s("section-title", { background: "default", padding: "md" }),
          s("search-bar", { background: "surface", padding: "md" }),
          s("content-card", { background: "default", padding: "lg" }),
          s("author-profile", { background: "surface", padding: "lg" }),
          s("tag-cloud", { background: "default", padding: "md" }),
          s("pagination", { background: "default", padding: "md" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }),
        ],
      },
      about: {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("breadcrumbs", { background: "default", padding: "sm" }),
          s("about-section", { background: "default", padding: "lg" }),
          s("gallery", { background: "surface", padding: "lg" }, { layout: "masonry" }),
          s("certifications-badges", { background: "default", padding: "lg" }),
          s("activity-timeline", { background: "surface", padding: "lg" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }),
        ],
      },
    },
  },

  // =========================================================================
  // DESIGN 3: PARALLAX CREATIVE — Portfolio Agency
  // =========================================================================
  "parallax-creative": {
    personality: "editorial",
    archetype: "PORTFOLIO",
    theme: {
      name: "Parallax Editorial",
      colors: { accent: "#DC2626", accentLight: "#FEE2E2", background: "#FFFFFF", surface: "#FAFAFA", text: "#111827", muted: "#6B7280", border: "#E5E7EB" },
      fonts: { heading: "Playfair Display", body: "Plus Jakarta Sans" },
      radius: "4px",
    },
    pages: {
      home: {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("hero-image", { background: "dark", padding: "xl", width: "full" }, { layout: "split" }),
          s("section-title", { background: "default", padding: "md" }, { layout: "split" }),
          s("gallery", { background: "default", padding: "lg" }, { layout: "masonry" }),
          s("lightbox", { background: "none", padding: "none" }),
          s("featured-content", { background: "surface", padding: "lg" }, { layout: "overlap" }),
          s("case-studies", { background: "default", padding: "lg" }),
          s("client-logos", { background: "surface", padding: "md" }),
          s("testimonials", { background: "default", padding: "lg" }, { layout: "grid" }),
          s("audio-player", { background: "surface", padding: "lg" }),
          s("quick-inquiry-form", { background: "accent-light", padding: "lg" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }, { layout: "centered" }),
        ],
      },
      work: {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("breadcrumbs", { background: "default", padding: "sm" }),
          s("section-title", { background: "default", padding: "md" }),
          s("gallery", { background: "default", padding: "lg" }, { layout: "grid" }),
          s("category-filters", { background: "surface", padding: "md" }),
          s("tag-filters", { background: "surface", padding: "sm" }),
          s("pagination", { background: "default", padding: "md" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }),
        ],
      },
      "case-study": {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("breadcrumbs", { background: "default", padding: "sm" }),
          s("hero-image", { background: "dark", padding: "xl", width: "full" }),
          s("about-section", { background: "default", padding: "lg" }),
          s("embedded-media", { background: "surface", padding: "lg" }),
          s("before-after-comparison", { background: "default", padding: "lg" }),
          s("product-gallery", { background: "surface", padding: "lg" }),
          s("related-content", { background: "default", padding: "lg" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }),
        ],
      },
      about: {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("breadcrumbs", { background: "default", padding: "sm" }),
          s("section-title", { background: "default", padding: "md" }),
          s("about-section", { background: "default", padding: "lg" }),
          s("gallery", { background: "surface", padding: "lg" }),
          s("activity-timeline", { background: "default", padding: "lg" }),
          s("map-embed", { background: "surface", padding: "lg" }),
          s("social-media-icons", { background: "default", padding: "md" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }),
        ],
      },
      contact: {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("breadcrumbs", { background: "default", padding: "sm" }),
          s("section-title", { background: "default", padding: "md" }),
          s("contact", { background: "default", padding: "lg" }),
          s("contact-form", { background: "surface", padding: "lg" }),
          s("contact-details-block", { background: "default", padding: "lg" }),
          s("language-selector", { background: "default", padding: "sm" }),
          s("legal-links", { background: "surface", padding: "sm" }),
          s("copyright-notice", { background: "surface", padding: "sm" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }),
        ],
      },
    },
  },

  // =========================================================================
  // DESIGN 4: HOMESTEAD FARM — Community Venue
  // =========================================================================
  "homestead-farm": {
    personality: "warm-organic",
    archetype: "VENUE",
    theme: {
      name: "Homestead Warm",
      colors: { accent: "#92400E", accentLight: "#FEF3C7", background: "#FEFCE8", surface: "#FFFFFF", text: "#1C1917", muted: "#78716C", border: "#E7E5E4" },
      fonts: { heading: "Merriweather", body: "Nunito Sans" },
      radius: "16px",
    },
    pages: {
      home: {
        sections: [
          s("announcement-bar", { background: "accent", padding: "sm", width: "full" }, { text: "Strawberry U-Pick Now Open!" }),
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("hero-image", { background: "dark", padding: "xl", width: "full" }, { layout: "center" }),
          s("hero-stats", { background: "default", padding: "lg" }, { layout: "row" }),
          s("services-section", { background: "default", padding: "lg" }, { layout: "cards" }),
          s("carousel", { background: "surface", padding: "lg" }),
          s("featured-content", { background: "default", padding: "lg" }, { layout: "side" }),
          s("gallery", { background: "surface", padding: "lg" }, { layout: "masonry" }),
          s("testimonials", { background: "accent-light", padding: "lg" }, { layout: "grid" }),
          s("section-title", { background: "default", padding: "md" }, { layout: "center" }),
          s("map-embed", { background: "surface", padding: "lg" }),
          s("contact-details-block", { background: "default", padding: "lg" }),
          s("newsletter-form", { background: "accent-light", padding: "lg" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }, { layout: "columns" }),
          s("cookie-consent", { background: "none", padding: "none" }),
          s("back-to-top", { background: "none", padding: "none" }),
        ],
      },
      events: {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("breadcrumbs", { background: "default", padding: "sm" }),
          s("section-title", { background: "default", padding: "md" }),
          s("activity-timeline", { background: "default", padding: "lg" }),
          s("content-card", { background: "surface", padding: "lg" }),
          s("category-showcase", { background: "default", padding: "lg" }),
          s("quick-inquiry-form", { background: "accent-light", padding: "lg" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }),
        ],
      },
      store: {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("breadcrumbs", { background: "default", padding: "sm" }),
          s("section-title", { background: "default", padding: "md" }),
          s("product-grid", { background: "default", padding: "lg" }),
          s("product-card", { background: "surface", padding: "lg" }),
          s("category-filters", { background: "surface", padding: "md" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }),
        ],
      },
      weddings: {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("breadcrumbs", { background: "default", padding: "sm" }),
          s("hero-image", { background: "dark", padding: "xl", width: "full" }),
          s("about-section", { background: "default", padding: "lg" }),
          s("gallery", { background: "surface", padding: "lg" }),
          s("pricing", { background: "default", padding: "lg" }),
          s("faq-accordion", { background: "surface", padding: "lg" }),
          s("feedback-form", { background: "default", padding: "lg" }),
          s("file-upload-form", { background: "surface", padding: "lg" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }),
        ],
      },
      csa: {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("breadcrumbs", { background: "default", padding: "sm" }),
          s("featured-content", { background: "default", padding: "lg" }),
          s("pricing-table", { background: "surface", padding: "lg" }),
          s("feature-comparison", { background: "default", padding: "lg" }),
          s("review-form", { background: "surface", padding: "lg" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }),
        ],
      },
      about: {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("breadcrumbs", { background: "default", padding: "sm" }),
          s("about-section", { background: "default", padding: "lg" }),
          s("video-player", { background: "surface", padding: "lg" }),
          s("certifications-badges", { background: "default", padding: "lg" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }),
        ],
      },
      contact: {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("breadcrumbs", { background: "default", padding: "sm" }),
          s("contact", { background: "default", padding: "lg" }),
          s("contact-form", { background: "surface", padding: "lg" }),
          s("map-embed", { background: "default", padding: "lg" }),
          s("live-chat-widget", { background: "none", padding: "none" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }),
        ],
      },
    },
  },

  // =========================================================================
  // DESIGN 5: CLARITY MEDICAL — Healthcare Practice
  // =========================================================================
  "clarity-medical": {
    personality: "minimal",
    archetype: "SERVICE",
    theme: {
      name: "Clarity Clinical",
      colors: { accent: "#0284C7", accentLight: "#E0F2FE", background: "#FFFFFF", surface: "#F8FAFC", text: "#0F172A", muted: "#64748B", border: "#E2E8F0" },
      fonts: { heading: "DM Serif Display", body: "Inter" },
      radius: "8px",
    },
    pages: {
      home: {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("hero-image", { background: "dark", padding: "xl", width: "full" }, { layout: "split" }),
          s("hero-stats", { background: "accent-light", padding: "lg" }, { layout: "banner" }),
          s("services-section", { background: "default", padding: "lg" }, { layout: "minimal" }),
          s("featured-content", { background: "surface", padding: "lg" }, { layout: "side" }),
          s("section-title", { background: "default", padding: "md" }, { layout: "center" }),
          s("features", { background: "default", padding: "lg" }),
          s("testimonials", { background: "surface", padding: "lg" }, { layout: "grid" }),
          s("trust-badges", { background: "default", padding: "md" }),
          s("certifications-badges", { background: "surface", padding: "md" }),
          s("faq-accordion", { background: "default", padding: "lg" }),
          s("contact", { background: "accent-light", padding: "lg" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }, { layout: "columns" }),
          s("cookie-consent", { background: "none", padding: "none" }),
          s("back-to-top", { background: "none", padding: "none" }),
        ],
      },
      services: {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("breadcrumbs", { background: "default", padding: "sm" }),
          s("section-title", { background: "default", padding: "md" }),
          s("services-section", { background: "default", padding: "lg" }, { layout: "list" }),
          s("before-after-comparison", { background: "surface", padding: "lg" }),
          s("pricing", { background: "default", padding: "lg" }),
          s("quick-inquiry-form", { background: "surface", padding: "lg" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }),
        ],
      },
      team: {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("breadcrumbs", { background: "default", padding: "sm" }),
          s("section-title", { background: "default", padding: "md" }),
          s("author-profile", { background: "default", padding: "lg" }),
          s("gallery", { background: "surface", padding: "lg" }),
          s("embedded-media", { background: "default", padding: "lg" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }),
        ],
      },
      portal: {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("login-button", { background: "default", padding: "md" }),
          s("register-button", { background: "default", padding: "md" }),
          s("user-dashboard", { background: "default", padding: "lg" }),
          s("order-history", { background: "surface", padding: "lg" }),
          s("notifications-center", { background: "default", padding: "lg" }),
          s("messages-inbox", { background: "surface", padding: "lg" }),
          s("edit-profile-form", { background: "default", padding: "lg" }),
          s("file-upload-form", { background: "surface", padding: "lg" }),
          s("empty-state", { background: "default", padding: "lg" }),
          s("loading-spinner", { background: "default", padding: "md" }),
          s("error-message", { background: "default", padding: "lg" }),
          s("maintenance-notice", { background: "surface", padding: "lg" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }),
        ],
      },
      conditions: {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("breadcrumbs", { background: "default", padding: "sm" }),
          s("section-title", { background: "default", padding: "md" }),
          s("search-bar", { background: "surface", padding: "md" }),
          s("search-results", { background: "default", padding: "lg" }),
          s("content-card", { background: "default", padding: "lg" }),
          s("tag-cloud", { background: "surface", padding: "md" }),
          s("tag-filters", { background: "surface", padding: "sm" }),
          s("pagination", { background: "default", padding: "md" }),
          s("related-content", { background: "surface", padding: "lg" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }),
        ],
      },
      results: {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("breadcrumbs", { background: "default", padding: "sm" }),
          s("section-title", { background: "default", padding: "md" }),
          s("before-after-comparison", { background: "default", padding: "lg" }),
          s("gallery", { background: "surface", padding: "lg" }),
          s("lightbox", { background: "none", padding: "none" }),
          s("rating-widget", { background: "default", padding: "md" }),
          s("review-form", { background: "surface", padding: "lg" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }),
        ],
      },
      booking: {
        sections: [
          s("navbar", { background: "none", padding: "none", width: "full" }),
          s("breadcrumbs", { background: "default", padding: "sm" }),
          s("section-title", { background: "default", padding: "md" }),
          s("contact-form", { background: "default", padding: "lg" }),
          s("contact-details-block", { background: "surface", padding: "lg" }),
          s("map-embed", { background: "default", padding: "lg" }),
          s("dropdown-nav", { background: "surface", padding: "md" }),
          s("language-selector", { background: "default", padding: "sm" }),
          s("chatbot-assistant", { background: "none", padding: "none" }),
          s("social-media-icons", { background: "default", padding: "md" }),
          s("legal-links", { background: "surface", padding: "sm" }),
          s("copyright-notice", { background: "surface", padding: "sm" }),
          s("footer", { background: "dark", padding: "lg", width: "full" }),
        ],
      },
    },
  },
}
