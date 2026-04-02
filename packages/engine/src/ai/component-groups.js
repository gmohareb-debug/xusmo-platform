/**
 * Component groups organized by purpose.
 * The site planner selects from these groups based on business type.
 */

// ── Components every site MUST have ──
export const CORE = [
  'navbar',
  'footer',
  'section-title',
]

// ── Hero variants (planner picks ONE) ──
export const HEROES = [
  'hero',          // text + gradient — service/professional
  'hero-video',    // background video — immersive/premium/venue
  'hero-image',    // background photo — portfolio/showcase
]

// ── Content & storytelling ──
export const CONTENT = [
  'about-section',
  'featured-content',
  'content-card',
  'related-content',
  'author-profile',
]

// ── Social proof & trust ──
export const TRUST = [
  'testimonials',
  'client-logos',
  'trust-badges',
  'hero-stats',
  'certifications-badges',
  'case-studies',
]

// ── Services & features ──
export const SERVICES = [
  'services-section',
  'features',
  'category-showcase',
  'before-after-comparison',
]

// ── Pricing & plans ──
export const PRICING = [
  'pricing-table',
  'feature-comparison',
  'pricing',
]

// ── E-commerce / products ──
export const ECOMMERCE = [
  'product-grid',
  'product-card',
  'product-detail',
  'product-gallery',
  'product-specs-table',
  'price-display',
  'discount-badge',
  'stock-indicator',
  'add-to-cart-button',
  'wishlist-button',
  'compare-button',
]

// ── Media & gallery ──
export const MEDIA = [
  'gallery',
  'carousel',
  'lightbox',
  'video-player',
  'embedded-media',
  'audio-player',
]

// ── Contact & forms ──
export const CONTACT = [
  'contact',
  'contact-form',
  'contact-details-block',
  'map-embed',
  'quick-inquiry-form',
  'newsletter-form',
]

// ── Search & filtering ──
export const SEARCH = [
  'advanced-search',
  'search-results',
  'filters-sidebar',
  'sort-controls',
  'price-filter',
  'tag-filters',
  'category-filters',
]

// ── Navigation extras ──
export const NAV_EXTRAS = [
  'announcement-bar',
  'sticky-header',
  'dropdown-nav',
  'mega-menu',
  'breadcrumbs',
  'search-bar',
]

// ── Footer extras ──
export const FOOTER_EXTRAS = [
  'social-media-icons',
  'footer-newsletter',
  'legal-links',
  'copyright-notice',
]

// ── Utility / UX ──
export const UTILITY = [
  'faq-accordion',
  'cookie-consent',
  'back-to-top',
  'scroll-indicator',
  'tag-cloud',
]

// ── Interactive / engagement ──
export const ENGAGEMENT = [
  'live-chat-widget',
  'chatbot-assistant',
  'feedback-form',
  'rating-widget',
  'review-form',
  'comment-section',
  'file-upload-form',
]

// ── Auth-only (NEVER on public pages) ──
export const AUTH_ONLY = [
  'user-dashboard',
  'profile-page',
  'edit-profile-form',
  'order-history',
  'saved-items',
  'notifications-center',
  'messages-inbox',
  'activity-timeline',
  'user-avatar-menu',
  'notification-icon',
  'login-button',
  'register-button',
]

// ── Debug-only (NEVER in generated sites) ──
export const DEBUG_ONLY = [
  'loading-spinner',
  'empty-state',
  'error-message',
  'maintenance-notice',
  'language-selector',
  'clear-filter-button',
  'pagination',
  'sort-controls',
]

// ── Visual personality presets ──
// Each personality defines style token defaults and typography guidance
// injected into the generation prompt to ensure distinct visual identities.

export const VISUAL_PERSONALITIES = {
  minimal: {
    description: 'Clean, flat, whitespace-driven — no shadows, hairline borders, monochromatic palette. Best for: tech, agency, SaaS, portfolio.',
    bestFor: ['tech', 'agency', 'saas', 'portfolio', 'software', 'design studio'],
  },
  bold: {
    description: 'High contrast, solid colors, strong typography, energetic. Best for: fitness, sports, brand, food, startup.',
    bestFor: ['fitness', 'gym', 'sports', 'food delivery', 'startup', 'nightclub', 'entertainment'],
  },
  editorial: {
    description: 'Magazine-style, full-bleed imagery, dramatic typography, asymmetric sections. Best for: fashion, media, architecture, photography.',
    bestFor: ['fashion', 'magazine', 'architecture', 'photography', 'luxury brand', 'art gallery', 'jewelry'],
  },
  'warm-organic': {
    description: 'Rounded shapes, earthy palette, friendly elevated cards, warm serif headings. Best for: food, cafe, wellness, community.',
    bestFor: ['restaurant', 'cafe', 'coffee shop', 'wellness', 'yoga', 'bakery', 'organic', 'community'],
  },
  'dark-luxury': {
    description: 'Dark backgrounds, subtle glow shadows, glass-morphism cards, premium serif typography. Best for: hospitality, premium services, nightlife.',
    bestFor: ['hotel', 'luxury', 'premium', 'nightclub', 'fine dining', 'wedding', 'executive'],
  },
  geometric: {
    description: 'Grid-based layouts, sharp angles, systematic borders, monospace or geometric type. Best for: fintech, data, corporate, industrial.',
    bestFor: ['fintech', 'finance', 'data', 'corporate', 'manufacturing', 'logistics', 'industrial'],
  },
  playful: {
    description: 'Colorful, high-saturation, large rounded corners, bubbly typography, fun. Best for: kids, creative, casual consumer.',
    bestFor: ['kids', 'toy store', 'children', 'pet', 'casual', 'hobby', 'craft', 'fun'],
  },
  corporate: {
    description: 'Professional, structured, conservative palette, trust-focused, clean grid. Best for: consulting, legal, finance, medical.',
    bestFor: ['consulting', 'legal', 'law firm', 'medical', 'dental', 'accounting', 'insurance', 'b2b'],
  },
}

// Token sets injected into the generation prompt per personality.
// These override the default style token guidance.
export const PERSONALITY_TOKENS = {
  minimal: {
    radius: '6px',
    shadow: 'none',
    shadowHover: '0 2px 12px rgba(0,0,0,0.08)',
    cardBorder: '1px solid #e5e7eb',
    cardBg: '#ffffff',
    gap: '32px',
    cardPadding: '24px',
    headingFont: 'Space Grotesk or Inter (geometric sans-serif)',
    bodyFont: 'Inter or DM Sans',
    radiusRange: '4–8px',
    heroHeight: '540px',
    headingSize: '52px',
  },
  bold: {
    radius: '10px',
    shadow: '0 6px 32px rgba(0,0,0,0.15)',
    shadowHover: '0 16px 48px rgba(0,0,0,0.2)',
    cardBg: 'accent color (use accent for primary cards)',
    gap: '24px',
    cardPadding: '28px',
    headingFont: 'Sora or Space Grotesk (strong display sans)',
    bodyFont: 'DM Sans or Outfit',
    radiusRange: '8–12px',
    heroHeight: '600px',
    headingSize: '60px',
    extraNote: 'Use large, punchy headlines. High contrast between background and text. Bold CTA buttons.',
  },
  editorial: {
    radius: '2px',
    shadow: '0 20px 60px rgba(0,0,0,0.2)',
    shadowHover: '0 30px 80px rgba(0,0,0,0.3)',
    cardBg: '#ffffff',
    gap: '40px',
    cardPadding: '0',
    headingFont: 'Playfair Display or Cormorant Garamond (dramatic serif)',
    bodyFont: 'Lato or Plus Jakarta Sans',
    radiusRange: '0–4px',
    heroHeight: '100vh',
    headingSize: '72px',
    extraNote: 'Full-bleed images on many sections. Dramatic contrast. Mix very large and very small type. Asymmetric layouts where possible.',
  },
  'warm-organic': {
    radius: '24px',
    shadow: '0 4px 24px rgba(0,0,0,0.06)',
    shadowHover: '0 12px 40px rgba(0,0,0,0.12)',
    cardBg: '#ffffff',
    gap: '28px',
    cardPadding: '32px',
    headingFont: 'Merriweather or Lora (warm rounded serif)',
    bodyFont: 'Nunito Sans or Outfit',
    radiusRange: '20–28px',
    heroHeight: '560px',
    headingSize: '52px',
    extraNote: 'Use warm, earthy tones. Generous padding everywhere. Cards feel lifted and friendly.',
  },
  'dark-luxury': {
    radius: '14px',
    shadow: '0 4px 32px rgba(0,0,0,0.4)',
    shadowHover: '0 12px 48px rgba(0,0,0,0.5)',
    cardBg: 'rgba(255,255,255,0.06)',
    cardBorder: '1px solid rgba(255,255,255,0.12)',
    gap: '28px',
    cardPadding: '36px',
    headingFont: 'Playfair Display or DM Serif Display (elegant serif)',
    bodyFont: 'Lato or Inter',
    radiusRange: '12–16px',
    heroHeight: '100vh',
    headingSize: '64px',
    extraNote: 'Dark backgrounds (#0f0f0f to #1a1a2e). Gold or champagne accent colors. Glass-morphism cards with low opacity background. Glow shadows using accent color.',
  },
  geometric: {
    radius: '4px',
    shadow: 'none',
    shadowHover: '0 0 0 2px var(--color-accent)',
    cardBg: '#ffffff',
    cardBorder: '1px solid #d1d5db',
    gap: '24px',
    cardPadding: '28px',
    headingFont: 'Space Grotesk or IBM Plex Sans (geometric/technical)',
    bodyFont: 'Inter or IBM Plex Sans',
    radiusRange: '0–6px',
    heroHeight: '520px',
    headingSize: '48px',
    extraNote: 'Strict grid alignment. Use ruled lines as dividers instead of spacing. Tables and data visualization preferred over narrative cards.',
  },
  playful: {
    radius: '28px',
    shadow: '4px 4px 0 0 rgba(0,0,0,0.15)',
    shadowHover: '6px 6px 0 0 rgba(0,0,0,0.2)',
    cardBg: '#ffffff',
    gap: '24px',
    cardPadding: '28px',
    headingFont: 'Nunito or Fredoka One (rounded, bubbly)',
    bodyFont: 'Nunito Sans or Outfit',
    radiusRange: '24–32px',
    heroHeight: '540px',
    headingSize: '52px',
    extraNote: 'High-saturation colors. Flat drop shadows (offset, not blurred). Fun emoji icons. Bright, cheerful CTAs.',
  },
  corporate: {
    radius: '8px',
    shadow: '0 2px 16px rgba(0,0,0,0.06)',
    shadowHover: '0 8px 32px rgba(0,0,0,0.10)',
    cardBg: '#ffffff',
    gap: '24px',
    cardPadding: '28px',
    headingFont: 'DM Serif Display or Merriweather (trustworthy)',
    bodyFont: 'Plus Jakarta Sans or Inter',
    radiusRange: '6–10px',
    heroHeight: '520px',
    headingSize: '48px',
    extraNote: 'Conservative, muted palette. Trust is the primary visual goal. No gimmicks. Clear hierarchy, lots of whitespace.',
  },
}

// ── Archetype presets: recommended groups per business type ──
export const ARCHETYPE_PRESETS = {
  SERVICE: {
    description: 'Service businesses (landscaping, HVAC, dental, legal, consulting, cleaning, plumbing)',
    groups: [CORE, HEROES, CONTENT, TRUST, SERVICES, PRICING, CONTACT, FOOTER_EXTRAS, UTILITY],
    extraComponents: ['announcement-bar'],
  },
  COMMERCE: {
    description: 'E-commerce & retail (online stores, product catalogs, marketplaces)',
    groups: [CORE, HEROES, CONTENT, TRUST, ECOMMERCE, PRICING, CONTACT, SEARCH, FOOTER_EXTRAS, UTILITY],
    extraComponents: ['announcement-bar', 'services-section', 'features'],
  },
  VENUE: {
    description: 'Venues & hospitality (restaurants, cafes, bars, hotels, event spaces, gyms)',
    groups: [CORE, HEROES, CONTENT, TRUST, SERVICES, MEDIA, CONTACT, FOOTER_EXTRAS, UTILITY],
    extraComponents: ['announcement-bar', 'features', 'pricing-table'],
  },
  PORTFOLIO: {
    description: 'Portfolio & creative (photography, design, art, agencies, freelancers)',
    groups: [CORE, HEROES, CONTENT, TRUST, MEDIA, CONTACT, FOOTER_EXTRAS, UTILITY],
    extraComponents: ['announcement-bar', 'services-section', 'features', 'pricing-table', 'tag-cloud'],
  },
  INFORMATIONAL: {
    description: 'Informational & educational (schools, nonprofits, blogs, community orgs)',
    groups: [CORE, HEROES, CONTENT, TRUST, SERVICES, CONTACT, FOOTER_EXTRAS, UTILITY, ENGAGEMENT],
    extraComponents: ['announcement-bar', 'features', 'gallery'],
  },
}

/**
 * Get all component keys for an archetype, deduplicated.
 */
export function getArchetypeComponents(archetype) {
  const preset = ARCHETYPE_PRESETS[archetype] || ARCHETYPE_PRESETS.SERVICE
  const allKeys = new Set()

  for (const group of preset.groups) {
    for (const key of group) {
      allKeys.add(key)
    }
  }

  if (preset.extraComponents) {
    for (const key of preset.extraComponents) {
      allKeys.add(key)
    }
  }

  return [...allKeys]
}
