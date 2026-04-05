// =============================================================================
// Archetype Definitions
// Full metadata for each of the 4 archetypes: pages, navigation, CTA
// placement, conversion elements, and component libraries.
// Usage: import { archetypeMetadata, getArchetypeMetadata } from "@/lib/classification/archetypes";
// =============================================================================

export type Archetype = "SERVICE" | "VENUE" | "PORTFOLIO" | "COMMERCE";

export interface ArchetypeMetadata {
  requiredPages: string[];
  optionalPages: string[];
  defaultNavigation: string[];
  ctaPlacement: string;
  conversionElements: string[];
  componentLibrary: string[];
}

export const archetypeMetadata: Record<Archetype, ArchetypeMetadata> = {
  SERVICE: {
    requiredPages: ["home", "services", "contact"],
    optionalPages: ["about", "gallery", "faq", "blog", "service-areas", "testimonials"],
    defaultNavigation: ["Home", "Services", "About", "Contact"],
    ctaPlacement: "header_sticky",
    conversionElements: ["phone_button", "quote_form", "contact_form"],
    componentLibrary: [
      "hero_with_cta",
      "trust_bar",
      "services_grid",
      "testimonials_carousel",
      "contact_section",
      "map_embed",
      "faq_accordion",
      "gallery_grid",
      "before_after_slider",
      "license_badges",
    ],
  },
  VENUE: {
    requiredPages: ["home", "menu_or_schedule", "contact"],
    optionalPages: ["about", "gallery", "events", "booking", "catering", "reviews"],
    defaultNavigation: ["Home", "Menu", "Gallery", "Contact"],
    ctaPlacement: "header_and_hero",
    conversionElements: ["reservation_button", "order_online", "call_button"],
    componentLibrary: [
      "hero_fullwidth",
      "hours_location_bar",
      "menu_display",
      "reservation_cta",
      "gallery_masonry",
      "events_calendar",
      "social_feed",
      "specials_banner",
      "delivery_links",
    ],
  },
  PORTFOLIO: {
    requiredPages: ["home", "portfolio", "contact"],
    optionalPages: ["about", "services", "testimonials", "case_studies", "blog", "pricing"],
    defaultNavigation: ["Home", "Portfolio", "About", "Contact"],
    ctaPlacement: "subtle_header",
    conversionElements: ["inquiry_form", "booking_calendar", "email_cta"],
    componentLibrary: [
      "hero_minimal",
      "portfolio_grid",
      "portfolio_lightbox",
      "bio_section",
      "credentials_bar",
      "testimonials_minimal",
      "case_study_layout",
      "inquiry_form",
    ],
  },
  COMMERCE: {
    requiredPages: ["home", "shop", "contact"],
    optionalPages: ["about", "categories", "faq", "blog", "policies"],
    defaultNavigation: ["Home", "Shop", "About", "Contact"],
    ctaPlacement: "header_cart",
    conversionElements: ["add_to_cart", "checkout_button", "product_search"],
    componentLibrary: [
      "hero_product",
      "featured_products",
      "category_grid",
      "product_card",
      "cart_sidebar",
      "checkout_flow",
      "reviews_section",
    ],
  },
};

export function getArchetypeMetadata(archetype: Archetype): ArchetypeMetadata {
  return archetypeMetadata[archetype];
}
