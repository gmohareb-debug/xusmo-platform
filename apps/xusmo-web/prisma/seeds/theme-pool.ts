// =============================================================================
// XUSMO — Theme Pool Seed
// Seeds 20 pre-built themes into the ThemePoolEntry table.
// Idempotent — uses upsert so it can be re-run safely.
// Run: npx tsx prisma/seeds/theme-pool.ts
// =============================================================================

import path from "node:path";
import dotenv from "dotenv";

// Load .env.local first, fall back to .env
dotenv.config({ path: path.join(__dirname, "..", "..", ".env.local") });
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

import { Archetype, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// =============================================================================
// Helper — Build Google Fonts URL
// =============================================================================

function buildGoogleFontsUrl(
  heading: string,
  body: string,
  headingWeights: string[] = ["400", "700"],
  bodyWeights: string[] = ["400", "600"],
): string {
  const encode = (name: string) => name.replace(/ /g, "+");
  const parts: string[] = [];

  const headingPart = `family=${encode(heading)}:wght@${headingWeights.join(";")}`;
  parts.push(headingPart);

  if (heading !== body) {
    const bodyPart = `family=${encode(body)}:wght@${bodyWeights.join(";")}`;
    parts.push(bodyPart);
  }

  return `https://fonts.googleapis.com/css2?${parts.join("&")}&display=swap`;
}

// =============================================================================
// Theme Definitions
// =============================================================================

const themes = [
  // ===========================================================================
  // SERVICE ARCHETYPE (6 themes)
  // ===========================================================================

  // 1. Classic Blue Service
  {
    name: "Classic Blue Service",
    slug: "classic-blue-service",
    archetype: Archetype.SERVICE,
    industryTags: ["plumbing", "hvac", "electrical", "mechanical"],
    colors: {
      primary: "#1e40af",
      secondary: "#475569",
      accent: "#dc2626",
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#0f172a",
      textMuted: "#64748b",
      border: "#e2e8f0",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Inter", "Inter", ["400", "500", "600", "700"]),
    },
    borderRadius: {
      small: "4px",
      medium: "6px",
      large: "12px",
      pill: "9999px",
    },
    buttonStyle: {
      borderRadius: "6px",
      padding: "0.75rem 1.75rem",
      fontSize: "0.9375rem",
      fontWeight: "600",
      textTransform: "none",
      letterSpacing: "0",
    },
    sectionPadding: "4rem",
    contentSize: "768px",
    wideSize: "1200px",
    headingSizes: {
      h1: "clamp(2rem, 4vw, 3rem)",
      h2: "clamp(1.5rem, 3vw, 2.25rem)",
      h3: "clamp(1.25rem, 2vw, 1.75rem)",
      h4: "clamp(1rem, 1.5vw, 1.25rem)",
    },
    previewUrl: null,
    thumbnailUrl: null,
    usageCount: 0,
    rating: 0,
    isSystem: true,
    status: "active",
    createdBy: null,
  },

  // 2. Forest Green Service
  {
    name: "Forest Green Service",
    slug: "forest-green-service",
    archetype: Archetype.SERVICE,
    industryTags: ["landscaping", "tree-service", "gardening"],
    colors: {
      primary: "#166534",
      secondary: "#4d7c0f",
      accent: "#ca8a04",
      background: "#ffffff",
      surface: "#f0fdf4",
      text: "#052e16",
      textMuted: "#6b7280",
      border: "#d1d5db",
    },
    fonts: {
      heading: "Roboto",
      body: "Roboto",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Roboto", "Roboto", ["400", "500", "700"]),
    },
    borderRadius: {
      small: "6px",
      medium: "8px",
      large: "16px",
      pill: "9999px",
    },
    buttonStyle: {
      borderRadius: "8px",
      padding: "0.75rem 1.75rem",
      fontSize: "0.9375rem",
      fontWeight: "600",
      textTransform: "none",
      letterSpacing: "0",
    },
    sectionPadding: "4rem",
    contentSize: "768px",
    wideSize: "1200px",
    headingSizes: {
      h1: "clamp(2rem, 4vw, 3rem)",
      h2: "clamp(1.5rem, 3vw, 2.25rem)",
      h3: "clamp(1.25rem, 2vw, 1.75rem)",
      h4: "clamp(1rem, 1.5vw, 1.25rem)",
    },
    previewUrl: null,
    thumbnailUrl: null,
    usageCount: 0,
    rating: 0,
    isSystem: true,
    status: "active",
    createdBy: null,
  },

  // 3. Steel Gray Service
  {
    name: "Steel Gray Service",
    slug: "steel-gray-service",
    archetype: Archetype.SERVICE,
    industryTags: ["construction", "automotive", "industrial"],
    colors: {
      primary: "#374151",
      secondary: "#6b7280",
      accent: "#ea580c",
      background: "#ffffff",
      surface: "#f9fafb",
      text: "#111827",
      textMuted: "#6b7280",
      border: "#e5e7eb",
    },
    fonts: {
      heading: "Source Sans 3",
      body: "Source Sans 3",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Source Sans 3", "Source Sans 3", ["400", "600", "700"]),
    },
    borderRadius: {
      small: "2px",
      medium: "4px",
      large: "8px",
      pill: "9999px",
    },
    buttonStyle: {
      borderRadius: "4px",
      padding: "0.75rem 1.75rem",
      fontSize: "0.9375rem",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    sectionPadding: "4rem",
    contentSize: "768px",
    wideSize: "1200px",
    headingSizes: {
      h1: "clamp(2rem, 4vw, 3rem)",
      h2: "clamp(1.5rem, 3vw, 2.25rem)",
      h3: "clamp(1.25rem, 2vw, 1.75rem)",
      h4: "clamp(1rem, 1.5vw, 1.25rem)",
    },
    previewUrl: null,
    thumbnailUrl: null,
    usageCount: 0,
    rating: 0,
    isSystem: true,
    status: "active",
    createdBy: null,
  },

  // 4. Trust Navy Service
  {
    name: "Trust Navy Service",
    slug: "trust-navy-service",
    archetype: Archetype.SERVICE,
    industryTags: ["consulting", "legal", "finance", "accounting"],
    colors: {
      primary: "#1e3a5f",
      secondary: "#334155",
      accent: "#b8860b",
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#0f172a",
      textMuted: "#64748b",
      border: "#e2e8f0",
    },
    fonts: {
      heading: "Lato",
      body: "Lato",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Lato", "Lato", ["400", "700", "900"]),
    },
    borderRadius: {
      small: "4px",
      medium: "6px",
      large: "10px",
      pill: "9999px",
    },
    buttonStyle: {
      borderRadius: "6px",
      padding: "0.75rem 2rem",
      fontSize: "0.9375rem",
      fontWeight: "600",
      textTransform: "none",
      letterSpacing: "0.01em",
    },
    sectionPadding: "4.5rem",
    contentSize: "800px",
    wideSize: "1200px",
    headingSizes: {
      h1: "clamp(2rem, 4vw, 3rem)",
      h2: "clamp(1.5rem, 3vw, 2.25rem)",
      h3: "clamp(1.25rem, 2vw, 1.75rem)",
      h4: "clamp(1rem, 1.5vw, 1.25rem)",
    },
    previewUrl: null,
    thumbnailUrl: null,
    usageCount: 0,
    rating: 0,
    isSystem: true,
    status: "active",
    createdBy: null,
  },

  // 5. Clean Teal Service
  {
    name: "Clean Teal Service",
    slug: "clean-teal-service",
    archetype: Archetype.SERVICE,
    industryTags: ["cleaning", "medical", "healthcare", "dental"],
    colors: {
      primary: "#0f766e",
      secondary: "#115e59",
      accent: "#e11d48",
      background: "#ffffff",
      surface: "#f0fdfa",
      text: "#042f2e",
      textMuted: "#6b7280",
      border: "#d1d5db",
    },
    fonts: {
      heading: "Poppins",
      body: "Poppins",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Poppins", "Poppins", ["400", "500", "600", "700"]),
    },
    borderRadius: {
      small: "6px",
      medium: "10px",
      large: "16px",
      pill: "9999px",
    },
    buttonStyle: {
      borderRadius: "10px",
      padding: "0.75rem 1.75rem",
      fontSize: "0.9375rem",
      fontWeight: "600",
      textTransform: "none",
      letterSpacing: "0",
    },
    sectionPadding: "4rem",
    contentSize: "768px",
    wideSize: "1200px",
    headingSizes: {
      h1: "clamp(2rem, 4vw, 3rem)",
      h2: "clamp(1.5rem, 3vw, 2.25rem)",
      h3: "clamp(1.25rem, 2vw, 1.75rem)",
      h4: "clamp(1rem, 1.5vw, 1.25rem)",
    },
    previewUrl: null,
    thumbnailUrl: null,
    usageCount: 0,
    rating: 0,
    isSystem: true,
    status: "active",
    createdBy: null,
  },

  // 6. Warm Earth Service
  {
    name: "Warm Earth Service",
    slug: "warm-earth-service",
    archetype: Archetype.SERVICE,
    industryTags: ["handyman", "carpentry", "renovation"],
    colors: {
      primary: "#78350f",
      secondary: "#92400e",
      accent: "#d97706",
      background: "#fffbeb",
      surface: "#fef3c7",
      text: "#1c1917",
      textMuted: "#78716c",
      border: "#e7e5e4",
    },
    fonts: {
      heading: "Nunito",
      body: "Nunito",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Nunito", "Nunito", ["400", "600", "700"]),
    },
    borderRadius: {
      small: "8px",
      medium: "12px",
      large: "16px",
      pill: "9999px",
    },
    buttonStyle: {
      borderRadius: "12px",
      padding: "0.75rem 1.75rem",
      fontSize: "0.9375rem",
      fontWeight: "700",
      textTransform: "none",
      letterSpacing: "0",
    },
    sectionPadding: "4rem",
    contentSize: "768px",
    wideSize: "1200px",
    headingSizes: {
      h1: "clamp(2rem, 4vw, 3rem)",
      h2: "clamp(1.5rem, 3vw, 2.25rem)",
      h3: "clamp(1.25rem, 2vw, 1.75rem)",
      h4: "clamp(1rem, 1.5vw, 1.25rem)",
    },
    previewUrl: null,
    thumbnailUrl: null,
    usageCount: 0,
    rating: 0,
    isSystem: true,
    status: "active",
    createdBy: null,
  },

  // ===========================================================================
  // VENUE ARCHETYPE (5 themes)
  // ===========================================================================

  // 7. Elegant Wine Venue
  {
    name: "Elegant Wine Venue",
    slug: "elegant-wine-venue",
    archetype: Archetype.VENUE,
    industryTags: ["fine-dining", "steakhouse", "wine-bar"],
    colors: {
      primary: "#7f1d1d",
      secondary: "#78350f",
      accent: "#b8860b",
      background: "#fffbeb",
      surface: "#fef3c7",
      text: "#1c1917",
      textMuted: "#78716c",
      border: "#e7e5e4",
    },
    fonts: {
      heading: "Cormorant Garamond",
      body: "Lato",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl(
        "Cormorant Garamond",
        "Lato",
        ["400", "600", "700"],
        ["400", "700"],
      ),
    },
    borderRadius: {
      small: "2px",
      medium: "4px",
      large: "8px",
      pill: "9999px",
    },
    buttonStyle: {
      borderRadius: "4px",
      padding: "0.875rem 2rem",
      fontSize: "0.875rem",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
    },
    sectionPadding: "5rem",
    contentSize: "900px",
    wideSize: "1400px",
    headingSizes: {
      h1: "clamp(2.25rem, 5vw, 3.5rem)",
      h2: "clamp(1.75rem, 3.5vw, 2.5rem)",
      h3: "clamp(1.25rem, 2vw, 1.75rem)",
      h4: "clamp(1rem, 1.5vw, 1.25rem)",
    },
    previewUrl: null,
    thumbnailUrl: null,
    usageCount: 0,
    rating: 0,
    isSystem: true,
    status: "active",
    createdBy: null,
  },

  // 8. Fresh Modern Venue
  {
    name: "Fresh Modern Venue",
    slug: "fresh-modern-venue",
    archetype: Archetype.VENUE,
    industryTags: ["cafe", "juice-bar", "health-food"],
    colors: {
      primary: "#166534",
      secondary: "#15803d",
      accent: "#fbbf24",
      background: "#ffffff",
      surface: "#f0fdf4",
      text: "#052e16",
      textMuted: "#6b7280",
      border: "#d1d5db",
    },
    fonts: {
      heading: "Josefin Sans",
      body: "Open Sans",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl(
        "Josefin Sans",
        "Open Sans",
        ["400", "600", "700"],
        ["400", "600"],
      ),
    },
    borderRadius: {
      small: "8px",
      medium: "12px",
      large: "20px",
      pill: "9999px",
    },
    buttonStyle: {
      borderRadius: "12px",
      padding: "0.875rem 2rem",
      fontSize: "1rem",
      fontWeight: "600",
      textTransform: "none",
      letterSpacing: "0",
    },
    sectionPadding: "5rem",
    contentSize: "900px",
    wideSize: "1400px",
    headingSizes: {
      h1: "clamp(2.25rem, 5vw, 3.5rem)",
      h2: "clamp(1.75rem, 3.5vw, 2.5rem)",
      h3: "clamp(1.25rem, 2vw, 1.75rem)",
      h4: "clamp(1rem, 1.5vw, 1.25rem)",
    },
    previewUrl: null,
    thumbnailUrl: null,
    usageCount: 0,
    rating: 0,
    isSystem: true,
    status: "active",
    createdBy: null,
  },

  // 9. Luxe Dark Venue
  {
    name: "Luxe Dark Venue",
    slug: "luxe-dark-venue",
    archetype: Archetype.VENUE,
    industryTags: ["lounge", "spa", "luxury-hotel"],
    colors: {
      primary: "#1c1917",
      secondary: "#292524",
      accent: "#eab308",
      background: "#0c0a09",
      surface: "#1c1917",
      text: "#fafaf9",
      textMuted: "#a8a29e",
      border: "#44403c",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Lato",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl(
        "Playfair Display",
        "Lato",
        ["400", "700"],
        ["400", "700"],
      ),
    },
    borderRadius: {
      small: "2px",
      medium: "4px",
      large: "8px",
      pill: "9999px",
    },
    buttonStyle: {
      borderRadius: "2px",
      padding: "0.875rem 2.25rem",
      fontSize: "0.875rem",
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: "0.12em",
    },
    sectionPadding: "5.5rem",
    contentSize: "900px",
    wideSize: "1400px",
    headingSizes: {
      h1: "clamp(2.5rem, 5vw, 4rem)",
      h2: "clamp(1.75rem, 3.5vw, 2.75rem)",
      h3: "clamp(1.25rem, 2vw, 1.75rem)",
      h4: "clamp(1rem, 1.5vw, 1.25rem)",
    },
    previewUrl: null,
    thumbnailUrl: null,
    usageCount: 0,
    rating: 0,
    isSystem: true,
    status: "active",
    createdBy: null,
  },

  // 10. Coastal Light Venue
  {
    name: "Coastal Light Venue",
    slug: "coastal-light-venue",
    archetype: Archetype.VENUE,
    industryTags: ["beach-bar", "seafood", "coastal"],
    colors: {
      primary: "#1d4ed8",
      secondary: "#0369a1",
      accent: "#d4a574",
      background: "#ffffff",
      surface: "#eff6ff",
      text: "#0c1d36",
      textMuted: "#64748b",
      border: "#dbeafe",
    },
    fonts: {
      heading: "Lora",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl(
        "Lora",
        "Inter",
        ["400", "600", "700"],
        ["400", "500", "600"],
      ),
    },
    borderRadius: {
      small: "6px",
      medium: "10px",
      large: "16px",
      pill: "9999px",
    },
    buttonStyle: {
      borderRadius: "10px",
      padding: "0.875rem 2rem",
      fontSize: "1rem",
      fontWeight: "600",
      textTransform: "none",
      letterSpacing: "0.01em",
    },
    sectionPadding: "5rem",
    contentSize: "900px",
    wideSize: "1400px",
    headingSizes: {
      h1: "clamp(2.25rem, 5vw, 3.5rem)",
      h2: "clamp(1.75rem, 3.5vw, 2.5rem)",
      h3: "clamp(1.25rem, 2vw, 1.75rem)",
      h4: "clamp(1rem, 1.5vw, 1.25rem)",
    },
    previewUrl: null,
    thumbnailUrl: null,
    usageCount: 0,
    rating: 0,
    isSystem: true,
    status: "active",
    createdBy: null,
  },

  // 11. Rustic Warm Venue
  {
    name: "Rustic Warm Venue",
    slug: "rustic-warm-venue",
    archetype: Archetype.VENUE,
    industryTags: ["bakery", "bbq", "farm-to-table"],
    colors: {
      primary: "#78350f",
      secondary: "#a16207",
      accent: "#92400e",
      background: "#fffbeb",
      surface: "#fef3c7",
      text: "#1c1917",
      textMuted: "#78716c",
      border: "#e7e5e4",
    },
    fonts: {
      heading: "Libre Baskerville",
      body: "Open Sans",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl(
        "Libre Baskerville",
        "Open Sans",
        ["400", "700"],
        ["400", "600"],
      ),
    },
    borderRadius: {
      small: "4px",
      medium: "8px",
      large: "14px",
      pill: "9999px",
    },
    buttonStyle: {
      borderRadius: "8px",
      padding: "0.875rem 2rem",
      fontSize: "1rem",
      fontWeight: "600",
      textTransform: "none",
      letterSpacing: "0.02em",
    },
    sectionPadding: "5rem",
    contentSize: "900px",
    wideSize: "1400px",
    headingSizes: {
      h1: "clamp(2.25rem, 5vw, 3.5rem)",
      h2: "clamp(1.75rem, 3.5vw, 2.5rem)",
      h3: "clamp(1.25rem, 2vw, 1.75rem)",
      h4: "clamp(1rem, 1.5vw, 1.25rem)",
    },
    previewUrl: null,
    thumbnailUrl: null,
    usageCount: 0,
    rating: 0,
    isSystem: true,
    status: "active",
    createdBy: null,
  },

  // ===========================================================================
  // PORTFOLIO ARCHETYPE (5 themes)
  // ===========================================================================

  // 12. Minimal Mono Portfolio
  {
    name: "Minimal Mono Portfolio",
    slug: "minimal-mono-portfolio",
    archetype: Archetype.PORTFOLIO,
    industryTags: ["photography", "minimalist"],
    colors: {
      primary: "#18181b",
      secondary: "#3f3f46",
      accent: "#71717a",
      background: "#fafafa",
      surface: "#f4f4f5",
      text: "#09090b",
      textMuted: "#71717a",
      border: "#e4e4e7",
    },
    fonts: {
      heading: "DM Sans",
      body: "DM Sans",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("DM Sans", "DM Sans", ["400", "500", "700"]),
    },
    borderRadius: {
      small: "0px",
      medium: "0px",
      large: "0px",
      pill: "9999px",
    },
    buttonStyle: {
      borderRadius: "0px",
      padding: "0.875rem 2rem",
      fontSize: "0.8125rem",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.12em",
    },
    sectionPadding: "5rem",
    contentSize: "1000px",
    wideSize: "1400px",
    headingSizes: {
      h1: "clamp(2.5rem, 5vw, 4rem)",
      h2: "clamp(1.75rem, 3.5vw, 2.75rem)",
      h3: "clamp(1.25rem, 2vw, 1.75rem)",
      h4: "clamp(1rem, 1.5vw, 1.25rem)",
    },
    previewUrl: null,
    thumbnailUrl: null,
    usageCount: 0,
    rating: 0,
    isSystem: true,
    status: "active",
    createdBy: null,
  },

  // 13. Creative Purple Portfolio
  {
    name: "Creative Purple Portfolio",
    slug: "creative-purple-portfolio",
    archetype: Archetype.PORTFOLIO,
    industryTags: ["design-agency", "creative", "branding"],
    colors: {
      primary: "#1e1b4b",
      secondary: "#312e81",
      accent: "#a855f7",
      background: "#fafafa",
      surface: "#f5f3ff",
      text: "#0f0d29",
      textMuted: "#6b7280",
      border: "#e5e7eb",
    },
    fonts: {
      heading: "Syne",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl(
        "Syne",
        "Inter",
        ["400", "600", "700"],
        ["400", "500", "600"],
      ),
    },
    borderRadius: {
      small: "4px",
      medium: "8px",
      large: "16px",
      pill: "9999px",
    },
    buttonStyle: {
      borderRadius: "8px",
      padding: "0.875rem 2rem",
      fontSize: "0.875rem",
      fontWeight: "600",
      textTransform: "none",
      letterSpacing: "0.02em",
    },
    sectionPadding: "5rem",
    contentSize: "1000px",
    wideSize: "1400px",
    headingSizes: {
      h1: "clamp(2.5rem, 5vw, 4rem)",
      h2: "clamp(1.75rem, 3.5vw, 2.75rem)",
      h3: "clamp(1.25rem, 2vw, 1.75rem)",
      h4: "clamp(1rem, 1.5vw, 1.25rem)",
    },
    previewUrl: null,
    thumbnailUrl: null,
    usageCount: 0,
    rating: 0,
    isSystem: true,
    status: "active",
    createdBy: null,
  },

  // 14. Architect Clean Portfolio
  {
    name: "Architect Clean Portfolio",
    slug: "architect-clean-portfolio",
    archetype: Archetype.PORTFOLIO,
    industryTags: ["architecture", "engineering", "interior-design"],
    colors: {
      primary: "#1f2937",
      secondary: "#374151",
      accent: "#3b82f6",
      background: "#ffffff",
      surface: "#f9fafb",
      text: "#111827",
      textMuted: "#6b7280",
      border: "#e5e7eb",
    },
    fonts: {
      heading: "Space Grotesk",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl(
        "Space Grotesk",
        "Inter",
        ["400", "500", "700"],
        ["400", "500", "600"],
      ),
    },
    borderRadius: {
      small: "2px",
      medium: "4px",
      large: "8px",
      pill: "9999px",
    },
    buttonStyle: {
      borderRadius: "4px",
      padding: "0.875rem 2rem",
      fontSize: "0.875rem",
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
    },
    sectionPadding: "5rem",
    contentSize: "1000px",
    wideSize: "1400px",
    headingSizes: {
      h1: "clamp(2.5rem, 5vw, 4rem)",
      h2: "clamp(1.75rem, 3.5vw, 2.75rem)",
      h3: "clamp(1.25rem, 2vw, 1.75rem)",
      h4: "clamp(1rem, 1.5vw, 1.25rem)",
    },
    previewUrl: null,
    thumbnailUrl: null,
    usageCount: 0,
    rating: 0,
    isSystem: true,
    status: "active",
    createdBy: null,
  },

  // 15. Artist Bold Portfolio
  {
    name: "Artist Bold Portfolio",
    slug: "artist-bold-portfolio",
    archetype: Archetype.PORTFOLIO,
    industryTags: ["art", "music", "film", "entertainment"],
    colors: {
      primary: "#0c0a09",
      secondary: "#1c1917",
      accent: "#dc2626",
      background: "#fafaf9",
      surface: "#f5f5f4",
      text: "#0c0a09",
      textMuted: "#78716c",
      border: "#d6d3d1",
    },
    fonts: {
      heading: "Oswald",
      body: "Source Sans 3",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl(
        "Oswald",
        "Source Sans 3",
        ["400", "600", "700"],
        ["400", "600"],
      ),
    },
    borderRadius: {
      small: "0px",
      medium: "0px",
      large: "0px",
      pill: "9999px",
    },
    buttonStyle: {
      borderRadius: "0px",
      padding: "0.875rem 2rem",
      fontSize: "0.875rem",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
    },
    sectionPadding: "5rem",
    contentSize: "1000px",
    wideSize: "1400px",
    headingSizes: {
      h1: "clamp(2.5rem, 5vw, 4rem)",
      h2: "clamp(1.75rem, 3.5vw, 2.75rem)",
      h3: "clamp(1.25rem, 2vw, 1.75rem)",
      h4: "clamp(1rem, 1.5vw, 1.25rem)",
    },
    previewUrl: null,
    thumbnailUrl: null,
    usageCount: 0,
    rating: 0,
    isSystem: true,
    status: "active",
    createdBy: null,
  },

  // 16. Tech Modern Portfolio
  {
    name: "Tech Modern Portfolio",
    slug: "tech-modern-portfolio",
    archetype: Archetype.PORTFOLIO,
    industryTags: ["developer", "tech", "startup", "saas"],
    colors: {
      primary: "#0f172a",
      secondary: "#1e293b",
      accent: "#06b6d4",
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#0f172a",
      textMuted: "#64748b",
      border: "#e2e8f0",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Inter", "Inter", ["400", "500", "600", "700"]),
    },
    borderRadius: {
      small: "6px",
      medium: "8px",
      large: "12px",
      pill: "9999px",
    },
    buttonStyle: {
      borderRadius: "8px",
      padding: "0.75rem 1.75rem",
      fontSize: "0.875rem",
      fontWeight: "600",
      textTransform: "none",
      letterSpacing: "0",
    },
    sectionPadding: "5rem",
    contentSize: "1000px",
    wideSize: "1400px",
    headingSizes: {
      h1: "clamp(2.5rem, 5vw, 4rem)",
      h2: "clamp(1.75rem, 3.5vw, 2.75rem)",
      h3: "clamp(1.25rem, 2vw, 1.75rem)",
      h4: "clamp(1rem, 1.5vw, 1.25rem)",
    },
    previewUrl: null,
    thumbnailUrl: null,
    usageCount: 0,
    rating: 0,
    isSystem: true,
    status: "active",
    createdBy: null,
  },

  // ===========================================================================
  // COMMERCE ARCHETYPE (4 themes)
  // ===========================================================================

  // 17. Shopfront Blue Commerce
  {
    name: "Shopfront Blue Commerce",
    slug: "shopfront-blue-commerce",
    archetype: Archetype.COMMERCE,
    industryTags: ["general-retail", "marketplace"],
    colors: {
      primary: "#2563eb",
      secondary: "#7c3aed",
      accent: "#f59e0b",
      background: "#ffffff",
      surface: "#f5f3ff",
      text: "#1e1b4b",
      textMuted: "#6b7280",
      border: "#e5e7eb",
    },
    fonts: {
      heading: "Montserrat",
      body: "Open Sans",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl(
        "Montserrat",
        "Open Sans",
        ["400", "500", "600", "700"],
        ["400", "600"],
      ),
    },
    borderRadius: {
      small: "6px",
      medium: "8px",
      large: "16px",
      pill: "9999px",
    },
    buttonStyle: {
      borderRadius: "8px",
      padding: "0.75rem 1.5rem",
      fontSize: "0.9375rem",
      fontWeight: "700",
      textTransform: "none",
      letterSpacing: "0",
    },
    sectionPadding: "3.5rem",
    contentSize: "768px",
    wideSize: "1200px",
    headingSizes: {
      h1: "clamp(2rem, 4vw, 3rem)",
      h2: "clamp(1.5rem, 3vw, 2.25rem)",
      h3: "clamp(1.25rem, 2vw, 1.75rem)",
      h4: "clamp(1rem, 1.5vw, 1.25rem)",
    },
    designPackage: { headerVariant: "header-commerce", footerVariant: "footer-commerce", homeLayout: ["shop-hero", "product-featured", "testimonials-carousel", "faq-accordion", "cta-banner"], shopLayout: ["shop-hero", "product-grid", "cta-split"], categoriesLayout: ["shop-hero", "product-categories", "cta-banner"] },
    previewUrl: null,
    thumbnailUrl: null,
    usageCount: 0,
    rating: 0,
    isSystem: true,
    status: "active",
    createdBy: null,
  },

  // 18. Fashion Noir Commerce
  {
    name: "Fashion Noir Commerce",
    slug: "fashion-noir-commerce",
    archetype: Archetype.COMMERCE,
    industryTags: ["fashion", "beauty", "jewelry", "accessories"],
    colors: {
      primary: "#18181b",
      secondary: "#27272a",
      accent: "#f43f5e",
      background: "#ffffff",
      surface: "#fafafa",
      text: "#09090b",
      textMuted: "#71717a",
      border: "#e4e4e7",
    },
    fonts: {
      heading: "Didot",
      body: "Lato",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl(
        "Playfair Display",
        "Lato",
        ["400", "700"],
        ["400", "700"],
      ),
    },
    borderRadius: {
      small: "0px",
      medium: "0px",
      large: "2px",
      pill: "9999px",
    },
    buttonStyle: {
      borderRadius: "0px",
      padding: "0.875rem 2.5rem",
      fontSize: "0.8125rem",
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: "0.15em",
    },
    sectionPadding: "4rem",
    contentSize: "800px",
    wideSize: "1200px",
    headingSizes: {
      h1: "clamp(2rem, 4vw, 3rem)",
      h2: "clamp(1.5rem, 3vw, 2.25rem)",
      h3: "clamp(1.25rem, 2vw, 1.75rem)",
      h4: "clamp(1rem, 1.5vw, 1.25rem)",
    },
    designPackage: { headerVariant: "header-commerce", footerVariant: "footer-commerce", homeLayout: ["shop-hero", "product-featured", "testimonials-carousel", "cta-banner"], shopLayout: ["shop-hero", "product-grid", "cta-split"], categoriesLayout: ["shop-hero", "product-categories", "cta-banner"] },
    previewUrl: null,
    thumbnailUrl: null,
    usageCount: 0,
    rating: 0,
    isSystem: true,
    status: "active",
    createdBy: null,
  },

  // 19. Organic Green Commerce
  {
    name: "Organic Green Commerce",
    slug: "organic-green-commerce",
    archetype: Archetype.COMMERCE,
    industryTags: ["health", "organic", "natural", "supplements"],
    colors: {
      primary: "#166534",
      secondary: "#15803d",
      accent: "#92400e",
      background: "#ffffff",
      surface: "#f0fdf4",
      text: "#052e16",
      textMuted: "#6b7280",
      border: "#d1d5db",
    },
    fonts: {
      heading: "Quicksand",
      body: "Open Sans",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl(
        "Quicksand",
        "Open Sans",
        ["400", "500", "600", "700"],
        ["400", "600"],
      ),
    },
    borderRadius: {
      small: "8px",
      medium: "12px",
      large: "20px",
      pill: "9999px",
    },
    buttonStyle: {
      borderRadius: "12px",
      padding: "0.75rem 1.75rem",
      fontSize: "0.9375rem",
      fontWeight: "600",
      textTransform: "none",
      letterSpacing: "0",
    },
    sectionPadding: "3.5rem",
    contentSize: "768px",
    wideSize: "1200px",
    headingSizes: {
      h1: "clamp(2rem, 4vw, 3rem)",
      h2: "clamp(1.5rem, 3vw, 2.25rem)",
      h3: "clamp(1.25rem, 2vw, 1.75rem)",
      h4: "clamp(1rem, 1.5vw, 1.25rem)",
    },
    designPackage: { headerVariant: "header-commerce", footerVariant: "footer-commerce", homeLayout: ["shop-hero", "product-featured", "product-categories", "testimonials-carousel", "cta-banner"], shopLayout: ["shop-hero", "product-grid", "cta-split"], categoriesLayout: ["shop-hero", "product-categories", "testimonials-carousel", "cta-banner"] },
    previewUrl: null,
    thumbnailUrl: null,
    usageCount: 0,
    rating: 0,
    isSystem: true,
    status: "active",
    createdBy: null,
  },

  // 20. Tech Store Commerce
  {
    name: "Tech Store Commerce",
    slug: "tech-store-commerce",
    archetype: Archetype.COMMERCE,
    industryTags: ["electronics", "gadgets", "tech-accessories"],
    colors: {
      primary: "#312e81",
      secondary: "#3730a3",
      accent: "#f97316",
      background: "#ffffff",
      surface: "#eef2ff",
      text: "#1e1b4b",
      textMuted: "#6b7280",
      border: "#e0e7ff",
    },
    fonts: {
      heading: "Inter",
      body: "Roboto",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl(
        "Inter",
        "Roboto",
        ["400", "500", "600", "700"],
        ["400", "500"],
      ),
    },
    borderRadius: {
      small: "6px",
      medium: "8px",
      large: "12px",
      pill: "9999px",
    },
    buttonStyle: {
      borderRadius: "8px",
      padding: "0.75rem 1.5rem",
      fontSize: "0.9375rem",
      fontWeight: "700",
      textTransform: "none",
      letterSpacing: "0",
    },
    sectionPadding: "3.5rem",
    contentSize: "768px",
    wideSize: "1200px",
    headingSizes: {
      h1: "clamp(2rem, 4vw, 3rem)",
      h2: "clamp(1.5rem, 3vw, 2.25rem)",
      h3: "clamp(1.25rem, 2vw, 1.75rem)",
      h4: "clamp(1rem, 1.5vw, 1.25rem)",
    },
    designPackage: { headerVariant: "header-commerce", footerVariant: "footer-commerce", homeLayout: ["shop-hero", "product-featured", "testimonials-carousel", "faq-accordion", "cta-banner"], shopLayout: ["shop-hero", "product-grid", "cta-split"], categoriesLayout: ["shop-hero", "product-categories", "cta-banner"] },
    previewUrl: null,
    thumbnailUrl: null,
    usageCount: 0,
    rating: 0,
    isSystem: true,
    status: "active",
    createdBy: null,
  },

  // ===========================================================================
  // ADDITIONAL SERVICE THEMES (21–30)
  // ===========================================================================

  // 21. Midnight Pro Service
  {
    name: "Midnight Pro Service",
    slug: "midnight-pro-service",
    archetype: Archetype.SERVICE,
    industryTags: ["security", "it-services", "locksmith", "surveillance"],
    colors: {
      primary: "#0f172a",
      secondary: "#1e293b",
      accent: "#38bdf8",
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#0f172a",
      textMuted: "#64748b",
      border: "#e2e8f0",
    },
    fonts: {
      heading: "Barlow",
      body: "Barlow",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Barlow", "Barlow", ["400", "500", "600", "700"]),
    },
    borderRadius: { small: "4px", medium: "6px", large: "10px", pill: "9999px" },
    buttonStyle: { borderRadius: "6px", padding: "0.75rem 1.75rem", fontSize: "0.9375rem", fontWeight: "600", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "4rem", contentSize: "768px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2rem, 4vw, 3rem)", h2: "clamp(1.5rem, 3vw, 2.25rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 22. Sunrise Orange Service
  {
    name: "Sunrise Orange Service",
    slug: "sunrise-orange-service",
    archetype: Archetype.SERVICE,
    industryTags: ["solar", "energy", "roofing", "insulation"],
    colors: {
      primary: "#c2410c",
      secondary: "#9a3412",
      accent: "#eab308",
      background: "#ffffff",
      surface: "#fff7ed",
      text: "#1c1917",
      textMuted: "#78716c",
      border: "#e7e5e4",
    },
    fonts: {
      heading: "Raleway",
      body: "Open Sans",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Raleway", "Open Sans", ["400", "600", "700"], ["400", "600"]),
    },
    borderRadius: { small: "6px", medium: "10px", large: "16px", pill: "9999px" },
    buttonStyle: { borderRadius: "10px", padding: "0.75rem 1.75rem", fontSize: "0.9375rem", fontWeight: "600", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "4rem", contentSize: "768px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2rem, 4vw, 3rem)", h2: "clamp(1.5rem, 3vw, 2.25rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 23. Royal Purple Service
  {
    name: "Royal Purple Service",
    slug: "royal-purple-service",
    archetype: Archetype.SERVICE,
    industryTags: ["salon", "beauty", "spa", "wellness"],
    colors: {
      primary: "#6b21a8",
      secondary: "#581c87",
      accent: "#e879f9",
      background: "#ffffff",
      surface: "#faf5ff",
      text: "#1e1b4b",
      textMuted: "#6b7280",
      border: "#e9d5ff",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Nunito",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Playfair Display", "Nunito", ["400", "700"], ["400", "600"]),
    },
    borderRadius: { small: "6px", medium: "10px", large: "16px", pill: "9999px" },
    buttonStyle: { borderRadius: "10px", padding: "0.875rem 2rem", fontSize: "0.9375rem", fontWeight: "600", textTransform: "none", letterSpacing: "0.01em" },
    sectionPadding: "4.5rem", contentSize: "800px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2rem, 4vw, 3rem)", h2: "clamp(1.5rem, 3vw, 2.25rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 24. Crimson Bold Service
  {
    name: "Crimson Bold Service",
    slug: "crimson-bold-service",
    archetype: Archetype.SERVICE,
    industryTags: ["firefighting", "emergency", "towing", "roadside"],
    colors: {
      primary: "#991b1b",
      secondary: "#7f1d1d",
      accent: "#fbbf24",
      background: "#ffffff",
      surface: "#fef2f2",
      text: "#1c1917",
      textMuted: "#6b7280",
      border: "#e5e7eb",
    },
    fonts: {
      heading: "Oswald",
      body: "Roboto",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Oswald", "Roboto", ["400", "600", "700"], ["400", "500"]),
    },
    borderRadius: { small: "2px", medium: "4px", large: "6px", pill: "9999px" },
    buttonStyle: { borderRadius: "4px", padding: "0.75rem 2rem", fontSize: "0.9375rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" },
    sectionPadding: "4rem", contentSize: "768px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2rem, 4vw, 3rem)", h2: "clamp(1.5rem, 3vw, 2.25rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 25. Sage Garden Service
  {
    name: "Sage Garden Service",
    slug: "sage-garden-service",
    archetype: Archetype.SERVICE,
    industryTags: ["lawn-care", "pest-control", "pool-service", "irrigation"],
    colors: {
      primary: "#3f6212",
      secondary: "#4d7c0f",
      accent: "#16a34a",
      background: "#ffffff",
      surface: "#f7fee7",
      text: "#1a2e05",
      textMuted: "#6b7280",
      border: "#d9f99d",
    },
    fonts: {
      heading: "Cabin",
      body: "Cabin",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Cabin", "Cabin", ["400", "500", "600", "700"]),
    },
    borderRadius: { small: "8px", medium: "12px", large: "20px", pill: "9999px" },
    buttonStyle: { borderRadius: "12px", padding: "0.75rem 1.75rem", fontSize: "0.9375rem", fontWeight: "600", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "4rem", contentSize: "768px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2rem, 4vw, 3rem)", h2: "clamp(1.5rem, 3vw, 2.25rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 26. Copper Industrial Service
  {
    name: "Copper Industrial Service",
    slug: "copper-industrial-service",
    archetype: Archetype.SERVICE,
    industryTags: ["welding", "fabrication", "machining", "metalwork"],
    colors: {
      primary: "#44403c",
      secondary: "#57534e",
      accent: "#b45309",
      background: "#fafaf9",
      surface: "#f5f5f4",
      text: "#1c1917",
      textMuted: "#78716c",
      border: "#d6d3d1",
    },
    fonts: {
      heading: "Archivo",
      body: "Source Sans 3",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Archivo", "Source Sans 3", ["400", "600", "800"], ["400", "600"]),
    },
    borderRadius: { small: "0px", medium: "2px", large: "4px", pill: "9999px" },
    buttonStyle: { borderRadius: "2px", padding: "0.75rem 2rem", fontSize: "0.875rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em" },
    sectionPadding: "4rem", contentSize: "768px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2rem, 4vw, 3rem)", h2: "clamp(1.5rem, 3vw, 2.25rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 27. Ocean Blue Service
  {
    name: "Ocean Blue Service",
    slug: "ocean-blue-service",
    archetype: Archetype.SERVICE,
    industryTags: ["pool-cleaning", "marine", "boat-repair", "fishing"],
    colors: {
      primary: "#0369a1",
      secondary: "#075985",
      accent: "#06b6d4",
      background: "#ffffff",
      surface: "#ecfeff",
      text: "#0c4a6e",
      textMuted: "#64748b",
      border: "#bae6fd",
    },
    fonts: {
      heading: "Rubik",
      body: "Rubik",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Rubik", "Rubik", ["400", "500", "600", "700"]),
    },
    borderRadius: { small: "6px", medium: "10px", large: "14px", pill: "9999px" },
    buttonStyle: { borderRadius: "10px", padding: "0.75rem 1.75rem", fontSize: "0.9375rem", fontWeight: "600", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "4rem", contentSize: "768px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2rem, 4vw, 3rem)", h2: "clamp(1.5rem, 3vw, 2.25rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 28. Charcoal Minimal Service
  {
    name: "Charcoal Minimal Service",
    slug: "charcoal-minimal-service",
    archetype: Archetype.SERVICE,
    industryTags: ["tutoring", "coaching", "personal-training", "consulting"],
    colors: {
      primary: "#27272a",
      secondary: "#3f3f46",
      accent: "#2563eb",
      background: "#fafafa",
      surface: "#f4f4f5",
      text: "#09090b",
      textMuted: "#71717a",
      border: "#e4e4e7",
    },
    fonts: {
      heading: "Syne",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Syne", "Inter", ["400", "600", "700"], ["400", "500", "600"]),
    },
    borderRadius: { small: "4px", medium: "6px", large: "8px", pill: "9999px" },
    buttonStyle: { borderRadius: "6px", padding: "0.75rem 1.75rem", fontSize: "0.875rem", fontWeight: "600", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "4rem", contentSize: "768px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2rem, 4vw, 3rem)", h2: "clamp(1.5rem, 3vw, 2.25rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 29. Rose Gold Service
  {
    name: "Rose Gold Service",
    slug: "rose-gold-service",
    archetype: Archetype.SERVICE,
    industryTags: ["wedding-planner", "event-coordinator", "florist", "catering"],
    colors: {
      primary: "#9f1239",
      secondary: "#881337",
      accent: "#fda4af",
      background: "#ffffff",
      surface: "#fff1f2",
      text: "#1c1917",
      textMuted: "#6b7280",
      border: "#fecdd3",
    },
    fonts: {
      heading: "Cormorant Garamond",
      body: "Nunito",
      headingWeight: "600",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Cormorant Garamond", "Nunito", ["400", "500", "600"], ["400", "600"]),
    },
    borderRadius: { small: "4px", medium: "8px", large: "14px", pill: "9999px" },
    buttonStyle: { borderRadius: "8px", padding: "0.875rem 2rem", fontSize: "0.9375rem", fontWeight: "600", textTransform: "none", letterSpacing: "0.01em" },
    sectionPadding: "4.5rem", contentSize: "800px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2rem, 4vw, 3rem)", h2: "clamp(1.5rem, 3vw, 2.25rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 30. Slate Professional Service
  {
    name: "Slate Professional Service",
    slug: "slate-professional-service",
    archetype: Archetype.SERVICE,
    industryTags: ["insurance", "real-estate", "mortgage", "tax"],
    colors: {
      primary: "#334155",
      secondary: "#475569",
      accent: "#0ea5e9",
      background: "#ffffff",
      surface: "#f1f5f9",
      text: "#0f172a",
      textMuted: "#64748b",
      border: "#cbd5e1",
    },
    fonts: {
      heading: "Merriweather",
      body: "Open Sans",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Merriweather", "Open Sans", ["400", "700"], ["400", "600"]),
    },
    borderRadius: { small: "4px", medium: "6px", large: "10px", pill: "9999px" },
    buttonStyle: { borderRadius: "6px", padding: "0.75rem 1.75rem", fontSize: "0.9375rem", fontWeight: "600", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "4rem", contentSize: "800px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2rem, 4vw, 3rem)", h2: "clamp(1.5rem, 3vw, 2.25rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // ===========================================================================
  // ADDITIONAL VENUE THEMES (31–40)
  // ===========================================================================

  // 31. Neon Night Venue
  {
    name: "Neon Night Venue",
    slug: "neon-night-venue",
    archetype: Archetype.VENUE,
    industryTags: ["nightclub", "bar", "karaoke", "arcade"],
    colors: {
      primary: "#18181b",
      secondary: "#27272a",
      accent: "#a855f7",
      background: "#09090b",
      surface: "#18181b",
      text: "#fafafa",
      textMuted: "#a1a1aa",
      border: "#3f3f46",
    },
    fonts: {
      heading: "Space Grotesk",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Space Grotesk", "Inter", ["400", "500", "700"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "8px", large: "12px", pill: "9999px" },
    buttonStyle: { borderRadius: "8px", padding: "0.875rem 2rem", fontSize: "0.875rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em" },
    sectionPadding: "5rem", contentSize: "900px", wideSize: "1400px",
    headingSizes: { h1: "clamp(2.5rem, 5vw, 4rem)", h2: "clamp(1.75rem, 3.5vw, 2.75rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 32. Garden Terrace Venue
  {
    name: "Garden Terrace Venue",
    slug: "garden-terrace-venue",
    archetype: Archetype.VENUE,
    industryTags: ["garden-center", "nursery", "botanical", "outdoor-dining"],
    colors: {
      primary: "#15803d",
      secondary: "#166534",
      accent: "#facc15",
      background: "#ffffff",
      surface: "#f0fdf4",
      text: "#14532d",
      textMuted: "#6b7280",
      border: "#bbf7d0",
    },
    fonts: {
      heading: "Vollkorn",
      body: "Nunito",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Vollkorn", "Nunito", ["400", "600", "700"], ["400", "600"]),
    },
    borderRadius: { small: "8px", medium: "12px", large: "20px", pill: "9999px" },
    buttonStyle: { borderRadius: "12px", padding: "0.875rem 2rem", fontSize: "1rem", fontWeight: "600", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "5rem", contentSize: "900px", wideSize: "1400px",
    headingSizes: { h1: "clamp(2.25rem, 5vw, 3.5rem)", h2: "clamp(1.75rem, 3.5vw, 2.5rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 33. Trattoria Warm Venue
  {
    name: "Trattoria Warm Venue",
    slug: "trattoria-warm-venue",
    archetype: Archetype.VENUE,
    industryTags: ["italian", "pizza", "mediterranean", "tapas"],
    colors: {
      primary: "#9a3412",
      secondary: "#c2410c",
      accent: "#16a34a",
      background: "#fffbeb",
      surface: "#fef3c7",
      text: "#1c1917",
      textMuted: "#78716c",
      border: "#fed7aa",
    },
    fonts: {
      heading: "Lora",
      body: "Nunito",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Lora", "Nunito", ["400", "600", "700"], ["400", "600"]),
    },
    borderRadius: { small: "4px", medium: "8px", large: "14px", pill: "9999px" },
    buttonStyle: { borderRadius: "8px", padding: "0.875rem 2rem", fontSize: "1rem", fontWeight: "600", textTransform: "none", letterSpacing: "0.01em" },
    sectionPadding: "5rem", contentSize: "900px", wideSize: "1400px",
    headingSizes: { h1: "clamp(2.25rem, 5vw, 3.5rem)", h2: "clamp(1.75rem, 3.5vw, 2.5rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 34. Zen Minimalist Venue
  {
    name: "Zen Minimalist Venue",
    slug: "zen-minimalist-venue",
    archetype: Archetype.VENUE,
    industryTags: ["yoga-studio", "meditation", "wellness-center", "retreat"],
    colors: {
      primary: "#44403c",
      secondary: "#57534e",
      accent: "#a3e635",
      background: "#fafaf9",
      surface: "#f5f5f4",
      text: "#1c1917",
      textMuted: "#78716c",
      border: "#e7e5e4",
    },
    fonts: {
      heading: "Josefin Sans",
      body: "Lato",
      headingWeight: "400",
      bodyWeight: "300",
      googleFontsUrl: buildGoogleFontsUrl("Josefin Sans", "Lato", ["300", "400", "600"], ["300", "400"]),
    },
    borderRadius: { small: "0px", medium: "2px", large: "4px", pill: "9999px" },
    buttonStyle: { borderRadius: "2px", padding: "0.875rem 2.5rem", fontSize: "0.8125rem", fontWeight: "400", textTransform: "uppercase", letterSpacing: "0.15em" },
    sectionPadding: "6rem", contentSize: "900px", wideSize: "1400px",
    headingSizes: { h1: "clamp(2.5rem, 5vw, 4rem)", h2: "clamp(1.75rem, 3.5vw, 2.75rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 35. Brewery Bold Venue
  {
    name: "Brewery Bold Venue",
    slug: "brewery-bold-venue",
    archetype: Archetype.VENUE,
    industryTags: ["brewery", "pub", "taproom", "craft-beer"],
    colors: {
      primary: "#451a03",
      secondary: "#78350f",
      accent: "#d97706",
      background: "#fafaf9",
      surface: "#f5f5f4",
      text: "#1c1917",
      textMuted: "#78716c",
      border: "#d6d3d1",
    },
    fonts: {
      heading: "Archivo",
      body: "Open Sans",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Archivo", "Open Sans", ["400", "600", "800"], ["400", "600"]),
    },
    borderRadius: { small: "2px", medium: "4px", large: "6px", pill: "9999px" },
    buttonStyle: { borderRadius: "4px", padding: "0.875rem 2rem", fontSize: "0.875rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em" },
    sectionPadding: "5rem", contentSize: "900px", wideSize: "1400px",
    headingSizes: { h1: "clamp(2.5rem, 5vw, 4rem)", h2: "clamp(1.75rem, 3.5vw, 2.75rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 36. Patisserie Elegant Venue
  {
    name: "Patisserie Elegant Venue",
    slug: "patisserie-elegant-venue",
    archetype: Archetype.VENUE,
    industryTags: ["patisserie", "dessert", "chocolate", "tea-room"],
    colors: {
      primary: "#831843",
      secondary: "#9f1239",
      accent: "#f9a8d4",
      background: "#ffffff",
      surface: "#fdf2f8",
      text: "#1c1917",
      textMuted: "#6b7280",
      border: "#fbcfe8",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Nunito",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Playfair Display", "Nunito", ["400", "700"], ["400", "600"]),
    },
    borderRadius: { small: "8px", medium: "12px", large: "20px", pill: "9999px" },
    buttonStyle: { borderRadius: "20px", padding: "0.75rem 2rem", fontSize: "0.9375rem", fontWeight: "600", textTransform: "none", letterSpacing: "0.02em" },
    sectionPadding: "5rem", contentSize: "900px", wideSize: "1400px",
    headingSizes: { h1: "clamp(2.25rem, 5vw, 3.5rem)", h2: "clamp(1.75rem, 3.5vw, 2.5rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 37. Sushi Modern Venue
  {
    name: "Sushi Modern Venue",
    slug: "sushi-modern-venue",
    archetype: Archetype.VENUE,
    industryTags: ["japanese", "sushi", "ramen", "asian-fusion"],
    colors: {
      primary: "#0c0a09",
      secondary: "#1c1917",
      accent: "#ef4444",
      background: "#fafaf9",
      surface: "#f5f5f4",
      text: "#0c0a09",
      textMuted: "#78716c",
      border: "#e7e5e4",
    },
    fonts: {
      heading: "DM Sans",
      body: "DM Sans",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("DM Sans", "DM Sans", ["400", "500", "700"]),
    },
    borderRadius: { small: "2px", medium: "4px", large: "6px", pill: "9999px" },
    buttonStyle: { borderRadius: "4px", padding: "0.875rem 2rem", fontSize: "0.875rem", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.1em" },
    sectionPadding: "5rem", contentSize: "900px", wideSize: "1400px",
    headingSizes: { h1: "clamp(2.25rem, 5vw, 3.5rem)", h2: "clamp(1.75rem, 3.5vw, 2.5rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 38. Bistro Chic Venue
  {
    name: "Bistro Chic Venue",
    slug: "bistro-chic-venue",
    archetype: Archetype.VENUE,
    industryTags: ["french", "bistro", "brunch", "cocktail-bar"],
    colors: {
      primary: "#1e3a5f",
      secondary: "#1e40af",
      accent: "#c2410c",
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#0f172a",
      textMuted: "#64748b",
      border: "#e2e8f0",
    },
    fonts: {
      heading: "Cormorant Garamond",
      body: "Raleway",
      headingWeight: "600",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Cormorant Garamond", "Raleway", ["400", "500", "600"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "6px", large: "10px", pill: "9999px" },
    buttonStyle: { borderRadius: "6px", padding: "0.875rem 2rem", fontSize: "0.9375rem", fontWeight: "500", textTransform: "none", letterSpacing: "0.02em" },
    sectionPadding: "5rem", contentSize: "900px", wideSize: "1400px",
    headingSizes: { h1: "clamp(2.25rem, 5vw, 3.5rem)", h2: "clamp(1.75rem, 3.5vw, 2.5rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 39. Taco Fiesta Venue
  {
    name: "Taco Fiesta Venue",
    slug: "taco-fiesta-venue",
    archetype: Archetype.VENUE,
    industryTags: ["mexican", "taqueria", "latin", "tex-mex"],
    colors: {
      primary: "#b91c1c",
      secondary: "#c2410c",
      accent: "#eab308",
      background: "#fffbeb",
      surface: "#fef3c7",
      text: "#1c1917",
      textMuted: "#78716c",
      border: "#fcd34d",
    },
    fonts: {
      heading: "Fredoka",
      body: "Nunito",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Fredoka", "Nunito", ["400", "600", "700"], ["400", "600"]),
    },
    borderRadius: { small: "10px", medium: "14px", large: "20px", pill: "9999px" },
    buttonStyle: { borderRadius: "14px", padding: "0.875rem 2rem", fontSize: "1rem", fontWeight: "700", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "4.5rem", contentSize: "900px", wideSize: "1400px",
    headingSizes: { h1: "clamp(2.25rem, 5vw, 3.5rem)", h2: "clamp(1.75rem, 3.5vw, 2.5rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 40. Hotel Luxury Venue
  {
    name: "Hotel Luxury Venue",
    slug: "hotel-luxury-venue",
    archetype: Archetype.VENUE,
    industryTags: ["hotel", "resort", "boutique-hotel", "bed-and-breakfast"],
    colors: {
      primary: "#1e3a5f",
      secondary: "#0f172a",
      accent: "#b8860b",
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#0f172a",
      textMuted: "#64748b",
      border: "#e2e8f0",
    },
    fonts: {
      heading: "Libre Baskerville",
      body: "Lato",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Libre Baskerville", "Lato", ["400", "700"], ["400", "700"]),
    },
    borderRadius: { small: "2px", medium: "4px", large: "8px", pill: "9999px" },
    buttonStyle: { borderRadius: "4px", padding: "0.875rem 2.5rem", fontSize: "0.8125rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.1em" },
    sectionPadding: "5.5rem", contentSize: "900px", wideSize: "1400px",
    headingSizes: { h1: "clamp(2.5rem, 5vw, 4rem)", h2: "clamp(1.75rem, 3.5vw, 2.75rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // ===========================================================================
  // ADDITIONAL PORTFOLIO THEMES (41–47)
  // ===========================================================================

  // 41. Gradient Modern Portfolio
  {
    name: "Gradient Modern Portfolio",
    slug: "gradient-modern-portfolio",
    archetype: Archetype.PORTFOLIO,
    industryTags: ["web-design", "ux-ui", "digital-agency"],
    colors: {
      primary: "#4f46e5",
      secondary: "#7c3aed",
      accent: "#ec4899",
      background: "#ffffff",
      surface: "#f5f3ff",
      text: "#1e1b4b",
      textMuted: "#6b7280",
      border: "#e5e7eb",
    },
    fonts: {
      heading: "Plus Jakarta Sans",
      body: "Inter",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Plus Jakarta Sans", "Inter", ["400", "600", "800"], ["400", "500"]),
    },
    borderRadius: { small: "8px", medium: "12px", large: "20px", pill: "9999px" },
    buttonStyle: { borderRadius: "12px", padding: "0.875rem 2rem", fontSize: "0.9375rem", fontWeight: "600", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "5rem", contentSize: "1000px", wideSize: "1400px",
    headingSizes: { h1: "clamp(2.5rem, 5vw, 4rem)", h2: "clamp(1.75rem, 3.5vw, 2.75rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 42. Retro Warm Portfolio
  {
    name: "Retro Warm Portfolio",
    slug: "retro-warm-portfolio",
    archetype: Archetype.PORTFOLIO,
    industryTags: ["illustration", "vintage", "print-design", "hand-lettering"],
    colors: {
      primary: "#92400e",
      secondary: "#78350f",
      accent: "#dc2626",
      background: "#fffbeb",
      surface: "#fef3c7",
      text: "#1c1917",
      textMuted: "#78716c",
      border: "#e7e5e4",
    },
    fonts: {
      heading: "Archivo",
      body: "Lora",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Archivo", "Lora", ["400", "600", "800"], ["400", "600"]),
    },
    borderRadius: { small: "0px", medium: "0px", large: "4px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "0.875rem 2rem", fontSize: "0.875rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em" },
    sectionPadding: "5rem", contentSize: "1000px", wideSize: "1400px",
    headingSizes: { h1: "clamp(2.5rem, 5vw, 4rem)", h2: "clamp(1.75rem, 3.5vw, 2.75rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 43. Dark Mode Portfolio
  {
    name: "Dark Mode Portfolio",
    slug: "dark-mode-portfolio",
    archetype: Archetype.PORTFOLIO,
    industryTags: ["developer", "coding", "cybersecurity", "devops"],
    colors: {
      primary: "#22d3ee",
      secondary: "#818cf8",
      accent: "#34d399",
      background: "#0f172a",
      surface: "#1e293b",
      text: "#f1f5f9",
      textMuted: "#94a3b8",
      border: "#334155",
    },
    fonts: {
      heading: "JetBrains Mono",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("JetBrains Mono", "Inter", ["400", "600", "700"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "8px", large: "12px", pill: "9999px" },
    buttonStyle: { borderRadius: "8px", padding: "0.75rem 1.75rem", fontSize: "0.875rem", fontWeight: "600", textTransform: "none", letterSpacing: "0.02em" },
    sectionPadding: "5rem", contentSize: "1000px", wideSize: "1400px",
    headingSizes: { h1: "clamp(2.5rem, 5vw, 4rem)", h2: "clamp(1.75rem, 3.5vw, 2.75rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 44. Editorial Classic Portfolio
  {
    name: "Editorial Classic Portfolio",
    slug: "editorial-classic-portfolio",
    archetype: Archetype.PORTFOLIO,
    industryTags: ["writer", "journalist", "blogger", "author"],
    colors: {
      primary: "#1c1917",
      secondary: "#44403c",
      accent: "#b91c1c",
      background: "#fafaf9",
      surface: "#f5f5f4",
      text: "#0c0a09",
      textMuted: "#78716c",
      border: "#d6d3d1",
    },
    fonts: {
      heading: "Merriweather",
      body: "Source Serif 4",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Merriweather", "Source Serif 4", ["400", "700"], ["400", "600"]),
    },
    borderRadius: { small: "0px", medium: "0px", large: "0px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "0.875rem 2rem", fontSize: "0.875rem", fontWeight: "600", textTransform: "none", letterSpacing: "0.02em" },
    sectionPadding: "5rem", contentSize: "720px", wideSize: "1000px",
    headingSizes: { h1: "clamp(2rem, 4vw, 3rem)", h2: "clamp(1.5rem, 3vw, 2.25rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 45. Studio Pastel Portfolio
  {
    name: "Studio Pastel Portfolio",
    slug: "studio-pastel-portfolio",
    archetype: Archetype.PORTFOLIO,
    industryTags: ["ceramics", "crafts", "handmade", "stationery"],
    colors: {
      primary: "#7c3aed",
      secondary: "#6d28d9",
      accent: "#f472b6",
      background: "#fefce8",
      surface: "#fdf4ff",
      text: "#1e1b4b",
      textMuted: "#6b7280",
      border: "#ede9fe",
    },
    fonts: {
      heading: "Quicksand",
      body: "Nunito",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Quicksand", "Nunito", ["400", "600", "700"], ["400", "600"]),
    },
    borderRadius: { small: "10px", medium: "14px", large: "24px", pill: "9999px" },
    buttonStyle: { borderRadius: "14px", padding: "0.875rem 2rem", fontSize: "0.9375rem", fontWeight: "600", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "5rem", contentSize: "1000px", wideSize: "1400px",
    headingSizes: { h1: "clamp(2.5rem, 5vw, 4rem)", h2: "clamp(1.75rem, 3.5vw, 2.75rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 46. Motion Studio Portfolio
  {
    name: "Motion Studio Portfolio",
    slug: "motion-studio-portfolio",
    archetype: Archetype.PORTFOLIO,
    industryTags: ["video-production", "animation", "vfx", "filmmaking"],
    colors: {
      primary: "#0f172a",
      secondary: "#1e293b",
      accent: "#f97316",
      background: "#fafafa",
      surface: "#f4f4f5",
      text: "#09090b",
      textMuted: "#71717a",
      border: "#e4e4e7",
    },
    fonts: {
      heading: "Barlow",
      body: "Barlow",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Barlow", "Barlow", ["400", "500", "600", "700"]),
    },
    borderRadius: { small: "6px", medium: "8px", large: "12px", pill: "9999px" },
    buttonStyle: { borderRadius: "8px", padding: "0.875rem 2rem", fontSize: "0.875rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.04em" },
    sectionPadding: "5rem", contentSize: "1000px", wideSize: "1400px",
    headingSizes: { h1: "clamp(2.5rem, 5vw, 4rem)", h2: "clamp(1.75rem, 3.5vw, 2.75rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 47. Fine Art Gallery Portfolio
  {
    name: "Fine Art Gallery Portfolio",
    slug: "fine-art-gallery-portfolio",
    archetype: Archetype.PORTFOLIO,
    industryTags: ["gallery", "fine-art", "sculpture", "exhibitions"],
    colors: {
      primary: "#292524",
      secondary: "#44403c",
      accent: "#a16207",
      background: "#ffffff",
      surface: "#fafaf9",
      text: "#0c0a09",
      textMuted: "#78716c",
      border: "#e7e5e4",
    },
    fonts: {
      heading: "Libre Baskerville",
      body: "Inter",
      headingWeight: "400",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Libre Baskerville", "Inter", ["400", "700"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "0px", large: "0px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "0.875rem 2.5rem", fontSize: "0.75rem", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.2em" },
    sectionPadding: "6rem", contentSize: "1100px", wideSize: "1400px",
    headingSizes: { h1: "clamp(2rem, 4vw, 3rem)", h2: "clamp(1.5rem, 3vw, 2.25rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // ===========================================================================
  // ADDITIONAL COMMERCE THEMES (48–55)
  // ===========================================================================

  // 48. Luxury Boutique Commerce
  {
    name: "Luxury Boutique Commerce",
    slug: "luxury-boutique-commerce",
    archetype: Archetype.COMMERCE,
    industryTags: ["luxury", "watches", "designer", "premium"],
    colors: {
      primary: "#1c1917",
      secondary: "#292524",
      accent: "#b8860b",
      background: "#ffffff",
      surface: "#fafaf9",
      text: "#0c0a09",
      textMuted: "#78716c",
      border: "#e7e5e4",
    },
    fonts: {
      heading: "Cormorant Garamond",
      body: "Lato",
      headingWeight: "600",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Cormorant Garamond", "Lato", ["400", "500", "600"], ["400", "700"]),
    },
    borderRadius: { small: "0px", medium: "2px", large: "4px", pill: "9999px" },
    buttonStyle: { borderRadius: "2px", padding: "0.875rem 2.5rem", fontSize: "0.8125rem", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.15em" },
    sectionPadding: "4rem", contentSize: "800px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2rem, 4vw, 3rem)", h2: "clamp(1.5rem, 3vw, 2.25rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    designPackage: { headerVariant: "header-commerce", footerVariant: "footer-commerce", homeLayout: ["shop-hero", "product-featured", "testimonials-carousel", "cta-banner"], shopLayout: ["shop-hero", "product-grid", "cta-split"], categoriesLayout: ["shop-hero", "product-categories", "cta-banner"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 49. Pet Shop Friendly Commerce
  {
    name: "Pet Shop Friendly Commerce",
    slug: "pet-shop-friendly-commerce",
    archetype: Archetype.COMMERCE,
    industryTags: ["pet-store", "pet-grooming", "veterinary", "pet-supplies"],
    colors: {
      primary: "#0369a1",
      secondary: "#0284c7",
      accent: "#f59e0b",
      background: "#ffffff",
      surface: "#f0f9ff",
      text: "#0c4a6e",
      textMuted: "#64748b",
      border: "#bae6fd",
    },
    fonts: {
      heading: "Fredoka",
      body: "Nunito",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Fredoka", "Nunito", ["400", "600", "700"], ["400", "600"]),
    },
    borderRadius: { small: "10px", medium: "14px", large: "24px", pill: "9999px" },
    buttonStyle: { borderRadius: "14px", padding: "0.75rem 1.75rem", fontSize: "1rem", fontWeight: "700", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "3.5rem", contentSize: "768px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2rem, 4vw, 3rem)", h2: "clamp(1.5rem, 3vw, 2.25rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    designPackage: { headerVariant: "header-commerce", footerVariant: "footer-commerce", homeLayout: ["shop-hero", "product-featured", "product-categories", "testimonials-carousel", "cta-banner"], shopLayout: ["shop-hero", "product-grid", "cta-split"], categoriesLayout: ["shop-hero", "product-categories", "testimonials-carousel", "cta-banner"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 50. Fitness Pro Commerce
  {
    name: "Fitness Pro Commerce",
    slug: "fitness-pro-commerce",
    archetype: Archetype.COMMERCE,
    industryTags: ["gym", "fitness", "sports-equipment", "supplements"],
    colors: {
      primary: "#09090b",
      secondary: "#18181b",
      accent: "#22c55e",
      background: "#ffffff",
      surface: "#f4f4f5",
      text: "#09090b",
      textMuted: "#71717a",
      border: "#e4e4e7",
    },
    fonts: {
      heading: "Archivo",
      body: "Inter",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Archivo", "Inter", ["400", "600", "800"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "6px", large: "8px", pill: "9999px" },
    buttonStyle: { borderRadius: "6px", padding: "0.75rem 2rem", fontSize: "0.875rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em" },
    sectionPadding: "3.5rem", contentSize: "768px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2rem, 4vw, 3rem)", h2: "clamp(1.5rem, 3vw, 2.25rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    designPackage: { headerVariant: "header-commerce", footerVariant: "footer-commerce", homeLayout: ["shop-hero", "product-featured", "testimonials-carousel", "faq-accordion", "cta-banner"], shopLayout: ["shop-hero", "product-grid", "cta-split"], categoriesLayout: ["shop-hero", "product-categories", "cta-banner"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 51. Kids & Toys Commerce
  {
    name: "Kids & Toys Commerce",
    slug: "kids-toys-commerce",
    archetype: Archetype.COMMERCE,
    industryTags: ["toys", "kids", "baby-products", "children"],
    colors: {
      primary: "#2563eb",
      secondary: "#7c3aed",
      accent: "#f97316",
      background: "#ffffff",
      surface: "#eff6ff",
      text: "#1e40af",
      textMuted: "#6b7280",
      border: "#bfdbfe",
    },
    fonts: {
      heading: "Fredoka",
      body: "Poppins",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Fredoka", "Poppins", ["400", "600", "700"], ["400", "500"]),
    },
    borderRadius: { small: "12px", medium: "16px", large: "24px", pill: "9999px" },
    buttonStyle: { borderRadius: "16px", padding: "0.75rem 1.75rem", fontSize: "1rem", fontWeight: "700", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "3.5rem", contentSize: "768px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2rem, 4vw, 3rem)", h2: "clamp(1.5rem, 3vw, 2.25rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    designPackage: { headerVariant: "header-commerce", footerVariant: "footer-commerce", homeLayout: ["shop-hero", "product-featured", "product-categories", "testimonials-carousel", "cta-banner"], shopLayout: ["shop-hero", "product-grid", "cta-split"], categoriesLayout: ["shop-hero", "product-categories", "testimonials-carousel", "cta-banner"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 52. Home & Garden Commerce
  {
    name: "Home & Garden Commerce",
    slug: "home-garden-commerce",
    archetype: Archetype.COMMERCE,
    industryTags: ["furniture", "home-decor", "garden", "diy"],
    colors: {
      primary: "#166534",
      secondary: "#15803d",
      accent: "#78350f",
      background: "#ffffff",
      surface: "#f7fee7",
      text: "#14532d",
      textMuted: "#6b7280",
      border: "#d1d5db",
    },
    fonts: {
      heading: "Vollkorn",
      body: "Open Sans",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Vollkorn", "Open Sans", ["400", "600", "700"], ["400", "600"]),
    },
    borderRadius: { small: "6px", medium: "8px", large: "12px", pill: "9999px" },
    buttonStyle: { borderRadius: "8px", padding: "0.75rem 1.75rem", fontSize: "0.9375rem", fontWeight: "600", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "3.5rem", contentSize: "768px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2rem, 4vw, 3rem)", h2: "clamp(1.5rem, 3vw, 2.25rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    designPackage: { headerVariant: "header-commerce", footerVariant: "footer-commerce", homeLayout: ["shop-hero", "product-featured", "testimonials-carousel", "faq-accordion", "cta-banner"], shopLayout: ["shop-hero", "product-grid", "cta-split"], categoriesLayout: ["shop-hero", "product-categories", "cta-banner"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 53. Bookshop Literary Commerce
  {
    name: "Bookshop Literary Commerce",
    slug: "bookshop-literary-commerce",
    archetype: Archetype.COMMERCE,
    industryTags: ["bookstore", "stationery", "gifts", "antiques"],
    colors: {
      primary: "#78350f",
      secondary: "#92400e",
      accent: "#1e40af",
      background: "#fffbeb",
      surface: "#fef3c7",
      text: "#1c1917",
      textMuted: "#78716c",
      border: "#e7e5e4",
    },
    fonts: {
      heading: "Merriweather",
      body: "Source Serif 4",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Merriweather", "Source Serif 4", ["400", "700"], ["400", "600"]),
    },
    borderRadius: { small: "2px", medium: "4px", large: "6px", pill: "9999px" },
    buttonStyle: { borderRadius: "4px", padding: "0.75rem 1.75rem", fontSize: "0.9375rem", fontWeight: "600", textTransform: "none", letterSpacing: "0.01em" },
    sectionPadding: "3.5rem", contentSize: "768px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2rem, 4vw, 3rem)", h2: "clamp(1.5rem, 3vw, 2.25rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    designPackage: { headerVariant: "header-commerce", footerVariant: "footer-commerce", homeLayout: ["shop-hero", "product-featured", "testimonials-carousel", "faq-accordion", "cta-banner"], shopLayout: ["shop-hero", "product-grid", "cta-split"], categoriesLayout: ["shop-hero", "product-categories", "cta-banner"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 54. Auto Parts Commerce
  {
    name: "Auto Parts Commerce",
    slug: "auto-parts-commerce",
    archetype: Archetype.COMMERCE,
    industryTags: ["auto-parts", "car-accessories", "motorcycle", "tools"],
    colors: {
      primary: "#dc2626",
      secondary: "#b91c1c",
      accent: "#fbbf24",
      background: "#ffffff",
      surface: "#f9fafb",
      text: "#111827",
      textMuted: "#6b7280",
      border: "#e5e7eb",
    },
    fonts: {
      heading: "Oswald",
      body: "Roboto",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Oswald", "Roboto", ["400", "600", "700"], ["400", "500"]),
    },
    borderRadius: { small: "2px", medium: "4px", large: "6px", pill: "9999px" },
    buttonStyle: { borderRadius: "4px", padding: "0.75rem 2rem", fontSize: "0.9375rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.04em" },
    sectionPadding: "3.5rem", contentSize: "768px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2rem, 4vw, 3rem)", h2: "clamp(1.5rem, 3vw, 2.25rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    designPackage: { headerVariant: "header-commerce", footerVariant: "footer-commerce", homeLayout: ["shop-hero", "product-featured", "testimonials-carousel", "cta-banner"], shopLayout: ["shop-hero", "product-grid", "cta-split"], categoriesLayout: ["shop-hero", "product-categories", "cta-banner"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // 55. Pharmacy Care Commerce
  {
    name: "Pharmacy Care Commerce",
    slug: "pharmacy-care-commerce",
    archetype: Archetype.COMMERCE,
    industryTags: ["pharmacy", "medical-supplies", "healthcare", "wellness"],
    colors: {
      primary: "#0f766e",
      secondary: "#115e59",
      accent: "#0284c7",
      background: "#ffffff",
      surface: "#f0fdfa",
      text: "#042f2e",
      textMuted: "#6b7280",
      border: "#ccfbf1",
    },
    fonts: {
      heading: "Poppins",
      body: "Open Sans",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Poppins", "Open Sans", ["400", "600", "700"], ["400", "600"]),
    },
    borderRadius: { small: "6px", medium: "8px", large: "12px", pill: "9999px" },
    buttonStyle: { borderRadius: "8px", padding: "0.75rem 1.75rem", fontSize: "0.9375rem", fontWeight: "600", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "3.5rem", contentSize: "768px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2rem, 4vw, 3rem)", h2: "clamp(1.5rem, 3vw, 2.25rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "clamp(1rem, 1.5vw, 1.25rem)" },
    designPackage: { headerVariant: "header-commerce", footerVariant: "footer-commerce", homeLayout: ["shop-hero", "product-featured", "testimonials-carousel", "faq-accordion", "cta-banner"], shopLayout: ["shop-hero", "product-grid", "cta-split"], categoriesLayout: ["shop-hero", "product-categories", "cta-banner"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // ===========================================================================
  // DESIGN PACKAGE THEMES (20 themes)
  // ===========================================================================

  {
    name: "Clean Slate",
    slug: "clean-slate-service",
    archetype: Archetype.SERVICE,
    industryTags: ["service", "cleaning", "consulting", "local-business"],
    colors: { primary: "#1f2937", secondary: "#6b7280", accent: "#0f766e", background: "#ffffff", surface: "#f8fafc", text: "#111827", textMuted: "#6b7280", border: "#e5e7eb" },
    fonts: { heading: "Manrope", body: "Instrument Sans", headingWeight: "700", bodyWeight: "400", googleFontsUrl: buildGoogleFontsUrl("Manrope", "Instrument Sans", ["400", "700", "800"], ["400", "500", "600"]) },
    borderRadius: { small: "4px", medium: "8px", large: "16px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.8rem 2rem", fontSize: "0.95rem", fontWeight: "600", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "4rem", contentSize: "800px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2.4rem, 5vw, 4.25rem)", h2: "clamp(1.75rem, 3vw, 2.5rem)", h3: "clamp(1.2rem, 2vw, 1.6rem)", h4: "1.1rem" },
    designPackage: { headerVariant: "header-minimal", footerVariant: "footer-minimal", homeLayout: ["hero-centered-minimal", "features-columns", "testimonials-cards", "cta-minimal"], aboutLayout: ["hero-centered-minimal", "features-checklist", "testimonials-single", "cta-minimal"], servicesLayout: ["hero-centered-minimal", "services-icons", "features-checklist", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Bold Impact",
    slug: "bold-impact-service",
    archetype: Archetype.SERVICE,
    industryTags: ["service", "contractor", "hvac", "roofing"],
    colors: { primary: "#991b1b", secondary: "#1f2937", accent: "#f59e0b", background: "#fff7ed", surface: "#1f2937", text: "#111827", textMuted: "#6b7280", border: "#374151" },
    fonts: { heading: "Archivo Black", body: "Inter", headingWeight: "700", bodyWeight: "400", googleFontsUrl: buildGoogleFontsUrl("Archivo Black", "Inter", ["400"], ["400", "500", "600", "700"]) },
    borderRadius: { small: "4px", medium: "8px", large: "18px", pill: "9999px" },
    buttonStyle: { borderRadius: "8px", padding: "0.85rem 2rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.03em" },
    sectionPadding: "4.5rem", contentSize: "820px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2.5rem, 5vw, 4.5rem)", h2: "clamp(1.9rem, 3vw, 2.8rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-dark", homeLayout: ["hero-video-bg", "trust-bar", "services-icons", "testimonials-cards", "cta-gradient"], aboutLayout: ["hero-asymmetric", "stats-counter", "features-checklist", "cta-gradient"], servicesLayout: ["hero-video-bg", "services-alternating", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Professional Edge",
    slug: "professional-edge-service",
    archetype: Archetype.SERVICE,
    industryTags: ["legal", "finance", "consulting", "b2b"],
    colors: { primary: "#1e3a5f", secondary: "#334155", accent: "#c89b3c", background: "#ffffff", surface: "#f8fafc", text: "#0f172a", textMuted: "#64748b", border: "#dbe3ea" },
    fonts: { heading: "DM Serif Display", body: "Source Sans 3", headingWeight: "700", bodyWeight: "400", googleFontsUrl: buildGoogleFontsUrl("DM Serif Display", "Source Sans 3", ["400"], ["400", "600", "700"]) },
    borderRadius: { small: "4px", medium: "8px", large: "14px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.8rem 1.9rem", fontSize: "0.95rem", fontWeight: "600", textTransform: "none", letterSpacing: "0.01em" },
    sectionPadding: "4rem", contentSize: "800px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2.3rem, 4.5vw, 4rem)", h2: "clamp(1.8rem, 3vw, 2.6rem)", h3: "clamp(1.2rem, 2vw, 1.7rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-4col", homeLayout: ["hero-asymmetric", "features-columns", "testimonials-single", "cta-minimal"], aboutLayout: ["hero-image-bg", "team-grid", "stats-counter", "cta-minimal"], servicesLayout: ["hero-asymmetric", "services-alternating", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Warm Welcome",
    slug: "warm-welcome-service",
    archetype: Archetype.SERVICE,
    industryTags: ["home-services", "family-business", "wellness", "community"],
    colors: { primary: "#b45309", secondary: "#92400e", accent: "#6b8e23", background: "#fffaf4", surface: "#fef3e2", text: "#3f2d1f", textMuted: "#7c6757", border: "#ead7c2" },
    fonts: { heading: "Bree Serif", body: "Nunito Sans", headingWeight: "700", bodyWeight: "400", googleFontsUrl: buildGoogleFontsUrl("Bree Serif", "Nunito Sans", ["400"], ["400", "600", "700"]) },
    borderRadius: { small: "6px", medium: "10px", large: "20px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.85rem 2rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "4rem", contentSize: "800px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2.4rem, 5vw, 4rem)", h2: "clamp(1.8rem, 3vw, 2.5rem)", h3: "clamp(1.25rem, 2vw, 1.7rem)", h4: "1.1rem" },
    designPackage: { headerVariant: "header-centered", footerVariant: "footer-centered", homeLayout: ["hero-split-screen", "features-columns", "testimonials-cards", "cta-gradient"], aboutLayout: ["hero-centered-minimal", "features-checklist", "team-grid", "cta-minimal"], servicesLayout: ["hero-split-screen", "services-alternating", "features-checklist", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Tech Forward",
    slug: "tech-forward-service",
    archetype: Archetype.SERVICE,
    industryTags: ["startup", "technology", "agency", "software"],
    colors: { primary: "#1d4ed8", secondary: "#0f172a", accent: "#22d3ee", background: "#f8fbff", surface: "#e0f2fe", text: "#082f49", textMuted: "#475569", border: "#bae6fd" },
    fonts: { heading: "Space Grotesk", body: "IBM Plex Sans", headingWeight: "700", bodyWeight: "400", googleFontsUrl: buildGoogleFontsUrl("Space Grotesk", "IBM Plex Sans", ["400", "500", "700"], ["400", "500", "600"]) },
    borderRadius: { small: "6px", medium: "12px", large: "24px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.85rem 2.1rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "4.5rem", contentSize: "820px", wideSize: "1280px",
    headingSizes: { h1: "clamp(2.6rem, 5vw, 4.8rem)", h2: "clamp(1.9rem, 3vw, 2.7rem)", h3: "clamp(1.2rem, 2vw, 1.7rem)", h4: "1.1rem" },
    designPackage: { headerVariant: "header-minimal", footerVariant: "footer-minimal", homeLayout: ["hero-cards", "services-icons", "logo-cloud", "cta-gradient"], aboutLayout: ["hero-centered-minimal", "stats-counter", "features-columns", "cta-minimal"], servicesLayout: ["hero-cards", "services-icons", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Rustic Charm",
    slug: "rustic-charm-venue",
    archetype: Archetype.VENUE,
    industryTags: ["restaurant", "cafe", "venue", "barn-wedding"],
    colors: { primary: "#7c4a2d", secondary: "#a16207", accent: "#d97706", background: "#fffaf2", surface: "#f5e8d8", text: "#3b2b21", textMuted: "#7b6658", border: "#e7d5c2" },
    fonts: { heading: "Cormorant Garamond", body: "Libre Franklin", headingWeight: "700", bodyWeight: "400", googleFontsUrl: buildGoogleFontsUrl("Cormorant Garamond", "Libre Franklin", ["400", "500", "700"], ["400", "500", "600"]) },
    borderRadius: { small: "6px", medium: "10px", large: "18px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.8rem 2rem", fontSize: "0.95rem", fontWeight: "600", textTransform: "none", letterSpacing: "0.01em" },
    sectionPadding: "4rem", contentSize: "820px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2.5rem, 5vw, 4.4rem)", h2: "clamp(1.9rem, 3vw, 2.8rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "1.1rem" },
    designPackage: { headerVariant: "header-centered", footerVariant: "footer-dark", homeLayout: ["hero-image-bg", "hours-widget", "menu-grid", "testimonials-single", "booking-cta"], aboutLayout: ["hero-centered-minimal", "gallery-masonry", "stats-counter", "cta-minimal"], servicesLayout: ["hero-image-bg", "menu-grid", "pricing-table", "booking-cta"], contactLayout: ["contact-form-section", "hours-widget", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Urban Bistro",
    slug: "urban-bistro-venue",
    archetype: Archetype.VENUE,
    industryTags: ["restaurant", "bistro", "cocktail-bar", "nightlife"],
    colors: { primary: "#111111", secondary: "#2d2d2d", accent: "#d4af37", background: "#fcfbf7", surface: "#f2efe8", text: "#161616", textMuted: "#5f5a55", border: "#d6d0c7" },
    fonts: { heading: "Oswald", body: "Public Sans", headingWeight: "700", bodyWeight: "400", googleFontsUrl: buildGoogleFontsUrl("Oswald", "Public Sans", ["400", "500", "700"], ["400", "500", "600"]) },
    borderRadius: { small: "4px", medium: "8px", large: "14px", pill: "9999px" },
    buttonStyle: { borderRadius: "8px", padding: "0.85rem 2rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.04em" },
    sectionPadding: "4rem", contentSize: "820px", wideSize: "1280px",
    headingSizes: { h1: "clamp(2.7rem, 5vw, 4.8rem)", h2: "clamp(2rem, 3vw, 3rem)", h3: "clamp(1.25rem, 2vw, 1.8rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-minimal", homeLayout: ["hero-video-bg", "hours-widget", "menu-grid", "gallery-masonry", "booking-cta"], aboutLayout: ["hero-asymmetric", "logo-cloud", "testimonials-cards", "cta-gradient"], servicesLayout: ["hero-video-bg", "menu-grid", "pricing-table", "booking-cta"], contactLayout: ["contact-form-section", "hours-widget", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Garden Party",
    slug: "garden-party-venue",
    archetype: Archetype.VENUE,
    industryTags: ["event-venue", "florist", "cafe", "tea-room"],
    colors: { primary: "#4d6b4a", secondary: "#7a8f68", accent: "#eab308", background: "#fffdf8", surface: "#f1f5ec", text: "#233126", textMuted: "#667565", border: "#dbe6d5" },
    fonts: { heading: "Fraunces", body: "Karla", headingWeight: "700", bodyWeight: "400", googleFontsUrl: buildGoogleFontsUrl("Fraunces", "Karla", ["400", "500", "700"], ["400", "500", "700"]) },
    borderRadius: { small: "8px", medium: "14px", large: "26px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.85rem 2.1rem", fontSize: "0.95rem", fontWeight: "600", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "4.5rem", contentSize: "820px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2.6rem, 5vw, 4.5rem)", h2: "clamp(1.9rem, 3vw, 2.8rem)", h3: "clamp(1.2rem, 2vw, 1.75rem)", h4: "1.1rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-centered", homeLayout: ["hero-asymmetric", "hours-widget", "gallery-masonry", "testimonials-single", "booking-cta"], aboutLayout: ["hero-centered-minimal", "gallery-masonry", "team-grid", "cta-minimal"], servicesLayout: ["hero-asymmetric", "menu-grid", "features-columns", "booking-cta"], contactLayout: ["contact-form-section", "hours-widget", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Coastal Breeze",
    slug: "coastal-breeze-venue",
    archetype: Archetype.VENUE,
    industryTags: ["beach-restaurant", "hotel", "retreat", "spa"],
    colors: { primary: "#0f4c81", secondary: "#38bdf8", accent: "#f4c16f", background: "#fffdf7", surface: "#eff8ff", text: "#0f172a", textMuted: "#5b7285", border: "#cfe8f7" },
    fonts: { heading: "Sora", body: "Work Sans", headingWeight: "700", bodyWeight: "400", googleFontsUrl: buildGoogleFontsUrl("Sora", "Work Sans", ["400", "600", "700"], ["400", "500", "600"]) },
    borderRadius: { small: "8px", medium: "12px", large: "24px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.8rem 2rem", fontSize: "0.95rem", fontWeight: "600", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "4rem", contentSize: "800px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2.5rem, 5vw, 4.2rem)", h2: "clamp(1.9rem, 3vw, 2.7rem)", h3: "clamp(1.2rem, 2vw, 1.7rem)", h4: "1.1rem" },
    designPackage: { headerVariant: "header-minimal", footerVariant: "footer-4col", homeLayout: ["hero-centered-minimal", "hours-widget", "gallery-masonry", "testimonials-cards", "booking-cta"], aboutLayout: ["hero-image-bg", "stats-counter", "features-columns", "cta-minimal"], servicesLayout: ["hero-centered-minimal", "menu-grid", "pricing-table", "booking-cta"], contactLayout: ["contact-form-section", "hours-widget", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Night Owl",
    slug: "night-owl-venue",
    archetype: Archetype.VENUE,
    industryTags: ["lounge", "bar", "music-venue", "late-night"],
    colors: { primary: "#6d28d9", secondary: "#111827", accent: "#f59e0b", background: "#111827", surface: "#1f2937", text: "#f9fafb", textMuted: "#cbd5e1", border: "#334155" },
    fonts: { heading: "Bebas Neue", body: "Inter", headingWeight: "700", bodyWeight: "400", googleFontsUrl: buildGoogleFontsUrl("Bebas Neue", "Inter", ["400"], ["400", "500", "600", "700"]) },
    borderRadius: { small: "6px", medium: "10px", large: "20px", pill: "9999px" },
    buttonStyle: { borderRadius: "8px", padding: "0.85rem 2.2rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.04em" },
    sectionPadding: "4.5rem", contentSize: "820px", wideSize: "1280px",
    headingSizes: { h1: "clamp(2.9rem, 6vw, 5rem)", h2: "clamp(2rem, 3vw, 3rem)", h3: "clamp(1.3rem, 2vw, 1.8rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-dark", homeLayout: ["hero-video-bg", "hours-widget", "gallery-masonry", "testimonials-single", "booking-cta"], aboutLayout: ["hero-video-bg", "logo-cloud", "stats-counter", "cta-gradient"], servicesLayout: ["hero-video-bg", "menu-grid", "pricing-table", "booking-cta"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Gallery White",
    slug: "gallery-white-portfolio",
    archetype: Archetype.PORTFOLIO,
    industryTags: ["photography", "design", "creative", "portfolio"],
    colors: { primary: "#111111", secondary: "#6b7280", accent: "#d97706", background: "#ffffff", surface: "#f8fafc", text: "#111111", textMuted: "#6b7280", border: "#e5e7eb" },
    fonts: { heading: "Syne", body: "Inter", headingWeight: "700", bodyWeight: "400", googleFontsUrl: buildGoogleFontsUrl("Syne", "Inter", ["400", "500", "700", "800"], ["400", "500", "600"]) },
    borderRadius: { small: "4px", medium: "8px", large: "16px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.8rem 2rem", fontSize: "0.95rem", fontWeight: "600", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "4rem", contentSize: "800px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2.6rem, 5vw, 4.6rem)", h2: "clamp(1.9rem, 3vw, 2.8rem)", h3: "clamp(1.2rem, 2vw, 1.7rem)", h4: "1.1rem" },
    designPackage: { headerVariant: "header-minimal", footerVariant: "footer-minimal", homeLayout: ["hero-centered-minimal", "portfolio-grid", "testimonials-single", "cta-minimal"], aboutLayout: ["hero-centered-minimal", "stats-counter", "features-columns", "cta-minimal"], servicesLayout: ["hero-centered-minimal", "services-icons", "pricing-table", "cta-minimal"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Creative Studio",
    slug: "creative-studio-portfolio",
    archetype: Archetype.PORTFOLIO,
    industryTags: ["branding", "studio", "illustration", "agency"],
    colors: { primary: "#7c3aed", secondary: "#ec4899", accent: "#fb7185", background: "#fff7fb", surface: "#f5edff", text: "#2e1065", textMuted: "#7e698f", border: "#e9d5ff" },
    fonts: { heading: "Playfair Display", body: "Manrope", headingWeight: "700", bodyWeight: "400", googleFontsUrl: buildGoogleFontsUrl("Playfair Display", "Manrope", ["400", "600", "700", "800"], ["400", "500", "700"]) },
    borderRadius: { small: "8px", medium: "14px", large: "28px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.85rem 2.2rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "4.5rem", contentSize: "820px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2.7rem, 5vw, 4.8rem)", h2: "clamp(2rem, 3vw, 3rem)", h3: "clamp(1.3rem, 2vw, 1.8rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header-centered", footerVariant: "footer-centered", homeLayout: ["hero-asymmetric", "portfolio-grid", "testimonials-cards", "cta-gradient"], aboutLayout: ["hero-asymmetric", "team-grid", "stats-counter", "cta-minimal"], servicesLayout: ["hero-cards", "services-icons", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Monochrome",
    slug: "monochrome-portfolio",
    archetype: Archetype.PORTFOLIO,
    industryTags: ["architecture", "fashion", "editorial", "minimal"],
    colors: { primary: "#1f2937", secondary: "#4b5563", accent: "#9ca3af", background: "#ffffff", surface: "#f3f4f6", text: "#111827", textMuted: "#6b7280", border: "#d1d5db" },
    fonts: { heading: "Libre Baskerville", body: "Work Sans", headingWeight: "700", bodyWeight: "400", googleFontsUrl: buildGoogleFontsUrl("Libre Baskerville", "Work Sans", ["400", "700"], ["400", "500", "600"]) },
    borderRadius: { small: "2px", medium: "6px", large: "10px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.8rem 2rem", fontSize: "0.95rem", fontWeight: "600", textTransform: "none", letterSpacing: "0.01em" },
    sectionPadding: "4rem", contentSize: "800px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2.5rem, 4.5vw, 4.2rem)", h2: "clamp(1.8rem, 3vw, 2.6rem)", h3: "clamp(1.2rem, 2vw, 1.6rem)", h4: "1.1rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-minimal", homeLayout: ["hero-image-bg", "portfolio-grid", "logo-cloud", "cta-minimal"], aboutLayout: ["hero-image-bg", "stats-counter", "testimonials-single", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-alternating", "faq-accordion", "cta-minimal"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Vibrant Showcase",
    slug: "vibrant-showcase-portfolio",
    archetype: Archetype.PORTFOLIO,
    industryTags: ["artist", "creative", "portfolio", "media"],
    colors: { primary: "#ea580c", secondary: "#2563eb", accent: "#22c55e", background: "#fffaf5", surface: "#fff1e6", text: "#1f2937", textMuted: "#64748b", border: "#fed7aa" },
    fonts: { heading: "Syne", body: "Plus Jakarta Sans", headingWeight: "700", bodyWeight: "400", googleFontsUrl: buildGoogleFontsUrl("Syne", "Plus Jakarta Sans", ["400", "700", "800"], ["400", "500", "600", "700"]) },
    borderRadius: { small: "8px", medium: "14px", large: "26px", pill: "9999px" },
    buttonStyle: { borderRadius: "14px", padding: "0.85rem 2rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "4.5rem", contentSize: "820px", wideSize: "1280px",
    headingSizes: { h1: "clamp(2.8rem, 5vw, 4.9rem)", h2: "clamp(2rem, 3vw, 3rem)", h3: "clamp(1.25rem, 2vw, 1.8rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-4col", homeLayout: ["hero-cards", "portfolio-grid", "logo-cloud", "cta-gradient"], aboutLayout: ["hero-asymmetric", "gallery-masonry", "stats-counter", "cta-gradient"], servicesLayout: ["hero-cards", "services-icons", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Elegant Frame",
    slug: "elegant-frame-portfolio",
    archetype: Archetype.PORTFOLIO,
    industryTags: ["luxury", "interior-design", "photography", "events"],
    colors: { primary: "#1c1917", secondary: "#44403c", accent: "#c8a44d", background: "#fffdf8", surface: "#f5f5f4", text: "#1c1917", textMuted: "#78716c", border: "#e7e5e4" },
    fonts: { heading: "Cormorant", body: "Source Sans 3", headingWeight: "700", bodyWeight: "400", googleFontsUrl: buildGoogleFontsUrl("Cormorant", "Source Sans 3", ["400", "500", "700"], ["400", "600"]) },
    borderRadius: { small: "4px", medium: "8px", large: "16px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.8rem 2rem", fontSize: "0.95rem", fontWeight: "600", textTransform: "none", letterSpacing: "0.02em" },
    sectionPadding: "4rem", contentSize: "800px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2.6rem, 5vw, 4.6rem)", h2: "clamp(1.9rem, 3vw, 2.8rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "1.1rem" },
    designPackage: { headerVariant: "header-minimal", footerVariant: "footer-dark", homeLayout: ["hero-split-screen", "portfolio-grid", "testimonials-single", "cta-gradient"], aboutLayout: ["hero-image-bg", "stats-counter", "features-columns", "cta-minimal"], servicesLayout: ["hero-split-screen", "services-alternating", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Market Fresh",
    slug: "market-fresh-commerce",
    archetype: Archetype.COMMERCE,
    industryTags: ["grocery", "farmers-market", "organic", "retail"],
    colors: { primary: "#15803d", secondary: "#65a30d", accent: "#f59e0b", background: "#fffef8", surface: "#f0fdf4", text: "#14532d", textMuted: "#5f6f5e", border: "#d1fae5" },
    fonts: { heading: "Outfit", body: "DM Sans", headingWeight: "700", bodyWeight: "400", googleFontsUrl: buildGoogleFontsUrl("Outfit", "DM Sans", ["400", "500", "700"], ["400", "500", "700"]) },
    borderRadius: { small: "8px", medium: "14px", large: "24px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.85rem 2rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "4rem", contentSize: "820px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2.5rem, 5vw, 4.4rem)", h2: "clamp(1.9rem, 3vw, 2.8rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "1.1rem" },
    designPackage: { headerVariant: "header-commerce", footerVariant: "footer-commerce", homeLayout: ["shop-hero", "product-featured", "product-categories", "testimonials-carousel", "cta-banner"], shopLayout: ["shop-hero", "product-grid", "cta-split"], categoriesLayout: ["shop-hero", "product-categories", "testimonials-carousel", "cta-banner"], aboutLayout: ["hero-image-bg", "stats-counter", "cta-banner"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Luxury Brand",
    slug: "luxury-brand-commerce",
    archetype: Archetype.COMMERCE,
    industryTags: ["fashion", "luxury", "jewelry", "beauty"],
    colors: { primary: "#111111", secondary: "#262626", accent: "#d4af37", background: "#fffdf8", surface: "#f5f5f4", text: "#171717", textMuted: "#737373", border: "#e7e5e4" },
    fonts: { heading: "Prata", body: "Manrope", headingWeight: "700", bodyWeight: "400", googleFontsUrl: buildGoogleFontsUrl("Prata", "Manrope", ["400"], ["400", "500", "600", "700"]) },
    borderRadius: { small: "6px", medium: "10px", large: "18px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.85rem 2.1rem", fontSize: "0.95rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" },
    sectionPadding: "4.5rem", contentSize: "820px", wideSize: "1280px",
    headingSizes: { h1: "clamp(2.7rem, 5vw, 4.8rem)", h2: "clamp(2rem, 3vw, 3rem)", h3: "clamp(1.25rem, 2vw, 1.8rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header-commerce", footerVariant: "footer-commerce", homeLayout: ["shop-hero", "product-featured", "testimonials-carousel", "cta-banner"], shopLayout: ["shop-hero", "product-grid", "cta-split"], categoriesLayout: ["shop-hero", "product-categories", "cta-banner"], aboutLayout: ["hero-image-bg", "stats-counter", "cta-banner"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Pop Shop",
    slug: "pop-shop-commerce",
    archetype: Archetype.COMMERCE,
    industryTags: ["boutique", "gifts", "trendy", "apparel"],
    colors: { primary: "#ec4899", secondary: "#f59e0b", accent: "#2563eb", background: "#fffafc", surface: "#ffe4f1", text: "#831843", textMuted: "#9d6880", border: "#fbcfe8" },
    fonts: { heading: "Baloo 2", body: "Onest", headingWeight: "700", bodyWeight: "400", googleFontsUrl: buildGoogleFontsUrl("Baloo 2", "Onest", ["400", "500", "700"], ["400", "500", "600", "700"]) },
    borderRadius: { small: "10px", medium: "16px", large: "30px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.85rem 2.2rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "4.5rem", contentSize: "820px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2.8rem, 5vw, 5rem)", h2: "clamp(2rem, 3vw, 3rem)", h3: "clamp(1.3rem, 2vw, 1.8rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header-commerce", footerVariant: "footer-commerce", homeLayout: ["shop-hero", "product-featured", "product-categories", "testimonials-carousel", "cta-banner"], shopLayout: ["shop-hero", "product-grid", "cta-split"], categoriesLayout: ["shop-hero", "product-categories", "testimonials-carousel", "cta-banner"], aboutLayout: ["hero-image-bg", "stats-counter", "cta-banner"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Craftsman",
    slug: "craftsman-commerce",
    archetype: Archetype.COMMERCE,
    industryTags: ["handmade", "leather", "artisan", "shop"],
    colors: { primary: "#7c2d12", secondary: "#92400e", accent: "#c2410c", background: "#fffbf5", surface: "#f5ece0", text: "#3f2a1d", textMuted: "#7c6652", border: "#e7d5c4" },
    fonts: { heading: "Alegreya", body: "Alegreya Sans", headingWeight: "700", bodyWeight: "400", googleFontsUrl: buildGoogleFontsUrl("Alegreya", "Alegreya Sans", ["400", "500", "700"], ["400", "500", "700"]) },
    borderRadius: { small: "6px", medium: "10px", large: "18px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.85rem 2rem", fontSize: "0.95rem", fontWeight: "600", textTransform: "none", letterSpacing: "0.01em" },
    sectionPadding: "4rem", contentSize: "800px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2.5rem, 5vw, 4.3rem)", h2: "clamp(1.85rem, 3vw, 2.7rem)", h3: "clamp(1.2rem, 2vw, 1.7rem)", h4: "1.1rem" },
    designPackage: { headerVariant: "header-commerce", footerVariant: "footer-commerce", homeLayout: ["shop-hero", "product-featured", "testimonials-carousel", "faq-accordion", "cta-banner"], shopLayout: ["shop-hero", "product-grid", "cta-split"], categoriesLayout: ["shop-hero", "product-categories", "cta-banner"], aboutLayout: ["hero-image-bg", "stats-counter", "cta-banner"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Modern Store",
    slug: "modern-store-commerce",
    archetype: Archetype.COMMERCE,
    industryTags: ["electronics", "retail", "store", "direct-to-consumer"],
    colors: { primary: "#2563eb", secondary: "#0f172a", accent: "#06b6d4", background: "#ffffff", surface: "#eff6ff", text: "#0f172a", textMuted: "#64748b", border: "#bfdbfe" },
    fonts: { heading: "Urbanist", body: "Inter", headingWeight: "700", bodyWeight: "400", googleFontsUrl: buildGoogleFontsUrl("Urbanist", "Inter", ["400", "500", "700", "800"], ["400", "500", "600", "700"]) },
    borderRadius: { small: "8px", medium: "12px", large: "22px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.85rem 2.1rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "4.5rem", contentSize: "820px", wideSize: "1280px",
    headingSizes: { h1: "clamp(2.7rem, 5vw, 4.8rem)", h2: "clamp(2rem, 3vw, 3rem)", h3: "clamp(1.25rem, 2vw, 1.8rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header-commerce", footerVariant: "footer-commerce", homeLayout: ["shop-hero", "product-featured", "testimonials-carousel", "faq-accordion", "cta-banner"], shopLayout: ["shop-hero", "product-grid", "cta-split"], categoriesLayout: ["shop-hero", "product-categories", "cta-banner"], aboutLayout: ["hero-image-bg", "stats-counter", "cta-banner"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // ===========================================================================
  // ANTIGRAVITY PREMIUM SERIES
  // ===========================================================================

  {
    name: "Midnight Obsidian",
    slug: "antigravity-midnight-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["tech", "ai", "software", "premium"],
    colors: {
      primary: "#6366f1",
      secondary: "#1e1b4b",
      accent: "#00ffff",
      background: "#0a0b0e",
      surface: "#14171d",
      text: "#ffffff",
      textMuted: "#9ca3af",
      border: "#1f2937",
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Inter", ["400", "700", "800"], ["400", "500", "600"]),
    },
    borderRadius: { small: "8px", medium: "16px", large: "24px", pill: "9999px" },
    buttonStyle: {
      borderRadius: "12px",
      padding: "0.85rem 2rem",
      fontSize: "0.95rem",
      fontWeight: "600",
      textTransform: "none",
      letterSpacing: "0",
    },
    sectionPadding: "5rem",
    contentSize: "800px",
    wideSize: "1200px",
    headingSizes: {
      h1: "clamp(2.5rem, 5vw, 4rem)",
      h2: "clamp(2rem, 3vw, 2.75rem)",
      h3: "clamp(1.5rem, 2.5vw, 2rem)",
      h4: "1.25rem",
    },
    designPackage: {
      headerVariant: "header-transparent",
      footerVariant: "footer-dark",
      homeLayout: ["hero-video-bg", "services-grid", "testimonials-cards", "cta-gradient"],
      aboutLayout: ["hero-image-bg", "team-grid", "stats-counter", "cta-minimal"],
      servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"],
      contactLayout: ["contact-form-section", "map-embed"],
    },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Porcelain Minimalist",
    slug: "antigravity-porcelain-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["clean", "minimal", "modern", "lifestyle"],
    colors: {
      primary: "#212529",
      secondary: "#4b5563",
      accent: "#f59e0b",
      background: "#f8fafc",
      surface: "#ffffff",
      text: "#111827",
      textMuted: "#6b7280",
      border: "#e5e7eb",
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Inter", ["400", "700"], ["400", "500", "600"]),
    },
    borderRadius: { small: "4px", medium: "8px", large: "16px", pill: "9999px" },
    buttonStyle: {
      borderRadius: "8px",
      padding: "0.85rem 2rem",
      fontSize: "0.95rem",
      fontWeight: "600",
      textTransform: "none",
      letterSpacing: "0",
    },
    sectionPadding: "4rem",
    contentSize: "800px",
    wideSize: "1200px",
    headingSizes: {
      h1: "clamp(2rem, 4vw, 3rem)",
      h2: "clamp(1.5rem, 3vw, 2.25rem)",
      h3: "clamp(1.25rem, 2.5vw, 1.75rem)",
      h4: "1.125rem",
    },
    designPackage: {
      headerVariant: "header-minimal",
      footerVariant: "footer-minimal",
      homeLayout: ["hero-centered-minimal", "features-columns", "testimonials-carousel", "cta-minimal"],
      aboutLayout: ["hero-centered-minimal", "gallery-masonry", "features-columns", "cta-minimal"],
      servicesLayout: ["hero-centered-minimal", "pricing-table", "faq-accordion", "cta-gradient"],
      contactLayout: ["contact-form-section", "map-embed"],
    },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Cyber Luxe",
    slug: "antigravity-cyber-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["luxury", "gold", "exclusive", "fashion"],
    colors: {
      primary: "#fbbf24",
      secondary: "#1c1917",
      accent: "#ffffff",
      background: "#000000",
      surface: "#0d0d0d",
      text: "#ffffff",
      textMuted: "#a1a1aa",
      border: "#27272a",
    },
    fonts: {
      heading: "Syne",
      body: "Space Grotesk",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Syne", "Space Grotesk", ["400", "700", "800"], ["400", "500"]),
    },
    borderRadius: { small: "2px", medium: "4px", large: "8px", pill: "9999px" },
    buttonStyle: {
      borderRadius: "4px",
      padding: "0.85rem 2.5rem",
      fontSize: "0.9rem",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
    },
    sectionPadding: "6rem",
    contentSize: "900px",
    wideSize: "1400px",
    headingSizes: {
      h1: "clamp(3rem, 6vw, 5rem)",
      h2: "clamp(2rem, 4vw, 3rem)",
      h3: "clamp(1.5rem, 3vw, 2.25rem)",
      h4: "1.25rem",
    },
    designPackage: {
      headerVariant: "header-bold",
      footerVariant: "footer-centered",
      homeLayout: ["hero-asymmetric", "services-alternating", "logo-cloud", "cta-banner"],
      aboutLayout: ["hero-image-bg", "team-grid", "stats-counter", "cta-minimal"],
      servicesLayout: ["hero-image-bg", "services-alternating", "pricing-table", "cta-gradient"],
      contactLayout: ["contact-form-section", "map-embed"],
    },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Emerald Aurora",
    slug: "antigravity-emerald-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["eco", "natural", "premium", "wellness"],
    colors: {
      primary: "#10b981",
      secondary: "#064e3b",
      accent: "#a7f3d0",
      background: "#061012",
      surface: "#0a1c1e",
      text: "#ecfdf5",
      textMuted: "#637381",
      border: "#134e4a",
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Inter", ["400", "700"], ["400", "500", "600"]),
    },
    borderRadius: { small: "8px", medium: "16px", large: "24px", pill: "9999px" },
    buttonStyle: {
      borderRadius: "12px",
      padding: "0.85rem 2rem",
      fontSize: "0.95rem",
      fontWeight: "600",
      textTransform: "none",
      letterSpacing: "0",
    },
    sectionPadding: "5rem",
    contentSize: "800px",
    wideSize: "1200px",
    headingSizes: {
      h1: "clamp(2.5rem, 5vw, 4rem)",
      h2: "clamp(2rem, 3vw, 2.75rem)",
      h3: "clamp(1.5rem, 2.5vw, 2rem)",
      h4: "1.25rem",
    },
    designPackage: {
      headerVariant: "header",
      footerVariant: "footer-dark",
      homeLayout: ["hero-cards", "services-icons", "stats-counter", "cta-split"],
      aboutLayout: ["hero-image-bg", "team-grid", "stats-counter", "cta-minimal"],
      servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"],
      contactLayout: ["contact-form-section", "map-embed"],
    },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // ===========================================================================
  // ANTIGRAVITY ELITE SERIES (10 MASTERPIECES)
  // ===========================================================================

  {
    name: "Tokyo Night Cyber",
    slug: "elite-tokyo-night-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["agency", "tech", "nightlife", "entertainment"],
    colors: {
      primary: "#bc00dd", // Neon Magenta
      secondary: "#2d00f7", // Electric Blue
      accent: "#00f5d4", // Glowing Teal
      background: "#010101", // Deepest Black
      surface: "#0b0b0d", // Dark Obsidian
      text: "#ffffff",
      textMuted: "#a0a0ab",
      border: "#1a1a1e",
    },
    fonts: {
      heading: "Space Grotesk",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Space Grotesk", "Inter", ["700"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "12px", large: "24px", pill: "9999px" },
    buttonStyle: { borderRadius: "12px", padding: "0.85rem 2.25rem", fontSize: "0.95rem", fontWeight: "600", textTransform: "none", letterSpacing: "0.02em" },
    sectionPadding: "6rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3rem, 8vw, 6rem)", h2: "clamp(2rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: {
      headerVariant: "header-transparent",
      footerVariant: "footer-dark",
      homeLayout: ["hero-video-bg", "gallery-masonry", "testimonials-single", "cta-minimal"],
      aboutLayout: ["hero-centered-minimal", "stats-counter", "cta-minimal"],
      servicesLayout: ["hero-centered-minimal", "pricing-table", "cta-gradient"],
      contactLayout: ["contact-form-section", "map-embed"],
    },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // ===========================================================================
  // MEDICAL & HEALTHCARE ELITE SERIES (10 THEMES)
  // ===========================================================================

  {
    name: "Mayo Clinical White",
    slug: "med-mayo-white-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["medical", "clinic", "hospital", "sterile"],
    colors: {
      primary: "#005eb8", // NHS Blue
      secondary: "#002f5d", // Deep Naval
      accent: "#eef7ff", // Sterile Wash
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#001e38",
      textMuted: "#64748b",
      border: "#e2e8f0",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Inter", "Inter", ["400", "700"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "8px", large: "12px", pill: "9999px" },
    buttonStyle: { borderRadius: "6px", padding: "0.85rem 2rem", fontSize: "0.95rem", fontWeight: "600", textTransform: "none", letterSpacing: "0.01em" },
    sectionPadding: "5rem", contentSize: "800px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2.5rem, 5vw, 4rem)", h2: "clamp(1.75rem, 3.5vw, 2.5rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header", footerVariant: "footer-4col", homeLayout: ["hero-image-bg", "services-icons", "trust-bar", "cta-split"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Zen Dental Spa",
    slug: "med-zen-dental-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["dental", "spa", "wellness", "natural"],
    colors: {
      primary: "#4da6a6", // Teal Mist
      secondary: "#2c5d5d", // Deep Pine
      accent: "#f0f9f9", // Fresh Air
      background: "#ffffff",
      surface: "#fafdff",
      text: "#1c3d3d",
      textMuted: "#5c8a8a",
      border: "#d9efef",
    },
    fonts: {
      heading: "Outfit",
      body: "Outfit",
      headingWeight: "600",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Outfit", ["400", "600"], ["400", "500"]),
    },
    borderRadius: { small: "8px", medium: "24px", large: "48px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.9rem 2.5rem", fontSize: "1rem", fontWeight: "600", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "6rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3rem, 7vw, 5rem)", h2: "clamp(2rem, 5vw, 3rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-centered", homeLayout: ["hero-centered-minimal", "services-grid", "testimonials-carousel", "cta-minimal"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Modern Ortho Blue",
    slug: "med-ortho-blue-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["orthodontics", "ortho", "smiles", "modern"],
    colors: {
      primary: "#3b82f6", // Electric Blue
      secondary: "#1e3a8a", // Dark Blue
      accent: "#f0f7ff", // Sky Wash
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#0f172a",
      textMuted: "#64748b",
      border: "#e2e8f0",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      headingWeight: "900",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Inter", "Inter", ["400", "700", "900"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "8px", large: "16px", pill: "9999px" },
    buttonStyle: { borderRadius: "8px", padding: "0.9rem 2.25rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" },
    sectionPadding: "5rem", contentSize: "800px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2.75rem, 6vw, 4.5rem)", h2: "clamp(1.85rem, 4vw, 2.75rem)", h3: "clamp(1.25rem, 2.5vw, 1.75rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-4col", homeLayout: ["hero-split-screen", "services-grid", "stats-counter", "cta-banner"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Pediatric Playful",
    slug: "med-pediatric-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["children", "pediatric", "medical", "friendly"],
    colors: {
      primary: "#ff6b6b", // Coral
      secondary: "#4ecdc4", // Mint
      accent: "#ffe66d", // Sun
      background: "#ffffff",
      surface: "#f7fff7", // Soft Mint
      text: "#1a535c", // Deep Teal
      textMuted: "#4ecdc4", // Mint text
      border: "#ffe66d", // Sun border
    },
    fonts: {
      heading: "Outfit",
      body: "Outfit",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Outfit", ["400", "800"], ["400", "500"]),
    },
    borderRadius: { small: "12px", medium: "24px", large: "40px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "1rem 2.5rem", fontSize: "1rem", fontWeight: "800", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "6rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3.5rem, 10vw, 5.5rem)", h2: "clamp(2.25rem, 6vw, 3.5rem)", h3: "clamp(1.5rem, 3.5vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header", footerVariant: "footer-centered", homeLayout: ["hero-image-bg", "services-icons", "testimonials-carousel", "cta-split"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Bio-Tech Lab Dark",
    slug: "med-biotech-dark-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["bio-tech", "laboratory", "science", "innovation"],
    colors: {
      primary: "#22d3ee", // Cyan 400
      secondary: "#0891b2", // Cyan 600
      accent: "#000000",
      background: "#0c0a09", // Stone 950
      surface: "#1c1917", // Stone 900
      text: "#ffffff",
      textMuted: "#78716c", // Stone 500
      border: "#292524", // Stone 800
    },
    fonts: {
      heading: "Space Grotesk",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "300",
      googleFontsUrl: buildGoogleFontsUrl("Space Grotesk", "Inter", ["700"], ["300", "400"]),
    },
    borderRadius: { small: "2px", medium: "4px", large: "8px", pill: "9999px" },
    buttonStyle: { borderRadius: "4px", padding: "0.85rem 2.25rem", fontSize: "0.9rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.15em" },
    sectionPadding: "6rem", contentSize: "800px", wideSize: "1300px",
    headingSizes: { h1: "clamp(3rem, 8vw, 6rem)", h2: "clamp(2rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-dark", homeLayout: ["hero-video-bg", "features-checklist", "stats-counter", "cta-banner"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Cardiology Red Heart",
    slug: "med-cardiology-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["cardiology", "heart", "medical", "urgent"],
    colors: {
      primary: "#cc0000", // Blood Red
      secondary: "#660000", // Dark Red
      accent: "#fff5f5", // Soft Red wash
      background: "#ffffff",
      surface: "#fafafa",
      text: "#1a1a1a",
      textMuted: "#999999",
      border: "#e5e5e5",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Inter", "Inter", ["400", "800"], ["400", "500"]),
    },
    borderRadius: { small: "2px", medium: "4px", large: "8px", pill: "9999px" },
    buttonStyle: { borderRadius: "4px", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.1em" },
    sectionPadding: "5rem", contentSize: "800px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2.5rem, 6vw, 4.5rem)", h2: "clamp(1.75rem, 4vw, 2.75rem)", h3: "clamp(1.25rem, 2.5vw, 1.75rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-4col", homeLayout: ["hero-image-bg", "services-icons", "stats-counter", "cta-split"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Aesthetic Skin Center",
    slug: "med-skin-aesthetic-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["aesthetic", "skin-care", "dermatology", "luxury"],
    colors: {
      primary: "#d4a373", // Warm Tan
      secondary: "#e9edc9", // Olive wash
      accent: "#fefae0", // Champagne
      background: "#ffffff",
      surface: "#fafaf9",
      text: "#283618", // Moss text
      textMuted: "#606c38", // Fern text
      border: "#ccd5ae", // Willow border
    },
    fonts: {
      heading: "Playfair Display",
      body: "Nunito",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Playfair Display", "Nunito", ["400", "700"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "8px", large: "32px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1.1rem 3rem", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.2em" },
    sectionPadding: "7rem", contentSize: "850px", wideSize: "1400px",
    headingSizes: { h1: "clamp(3rem, 8vw, 5.5rem)", h2: "clamp(2rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-centered", homeLayout: ["hero-centered-minimal", "gallery-masonry", "testimonials-single", "cta-minimal"], aboutLayout: ["hero-centered-minimal", "stats-counter", "cta-minimal"], servicesLayout: ["hero-centered-minimal", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Oncology Care Soft",
    slug: "med-oncology-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["oncology", "cancer-care", "wellness", "support"],
    colors: {
      primary: "#6d597a", // Muted Violet
      secondary: "#355070", // Soft Naval
      accent: "#eaac8b", // Peach Coral
      background: "#ffffff",
      surface: "#fbf8fb",
      text: "#355070", // Naval text
      textMuted: "#b56576", // Rose muted
      border: "#fed9b7", // Peach border
    },
    fonts: {
      heading: "Lora",
      body: "Inter",
      headingWeight: "600",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Lora", "Inter", ["400", "600"], ["400", "500"]),
    },
    borderRadius: { small: "8px", medium: "16px", large: "32px", pill: "9999px" },
    buttonStyle: { borderRadius: "16px", padding: "0.9rem 2.5rem", fontSize: "0.95rem", fontWeight: "600", textTransform: "none", letterSpacing: "0.01em" },
    sectionPadding: "6rem", contentSize: "800px", wideSize: "1300px",
    headingSizes: { h1: "clamp(2.5rem, 5vw, 4rem)", h2: "clamp(1.75rem, 3.5vw, 2.5rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header", footerVariant: "footer-centered", homeLayout: ["hero-image-bg", "features-columns", "testimonials-carousel", "cta-split"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Bio-Genomics Future",
    slug: "med-genomics-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["genomics", "bio-tech", "research", "future"],
    colors: {
      primary: "#7209b7", // Grape
      secondary: "#3a0ca3", // Deep Blue Purple
      accent: "#4cc9f0", // Ice Blue
      background: "#ffffff",
      surface: "#f8f0ff", // Grape wash
      text: "#480ca8", // Purple text
      textMuted: "#4361ee", // Blue text
      border: "#b5179e", // Magenta border
    },
    fonts: {
      heading: "Space Grotesk",
      body: "Space Grotesk",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Space Grotesk", "Space Grotesk", ["400", "700"], ["400", "500"]),
    },
    borderRadius: { small: "2px", medium: "12px", large: "24px", pill: "9999px" },
    buttonStyle: { borderRadius: "12px", padding: "0.9rem 2.5rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "none", letterSpacing: "0.05em" },
    sectionPadding: "6rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3.5rem, 10vw, 6rem)", h2: "clamp(2.25rem, 6vw, 3.5rem)", h3: "clamp(1.5rem, 3.5vw, 2.5rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-dark", homeLayout: ["hero-video-bg", "services-grid", "stats-counter", "cta-gradient"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Eye Care Vision",
    slug: "med-optometry-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["optometry", "medical", "eye-care", "vision"],
    colors: {
      primary: "#0284c7", // Sky 600
      secondary: "#075985", // Sky 800
      accent: "#f0f9ff", // Sky 50
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#0c4a6e", // Sky 950
      textMuted: "#334155", // Slate 700
      border: "#e0f2fe", // Sky 100
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Inter", "Inter", ["400", "800"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "8px", large: "16px", pill: "9999px" },
    buttonStyle: { borderRadius: "4px", padding: "0.85rem 2.25rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "5rem", contentSize: "800px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2.5rem, 5vw, 4rem)", h2: "clamp(1.75rem, 3.5vw, 2.5rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header", footerVariant: "footer-4col", homeLayout: ["hero-image-bg", "services-icons", "stats-counter", "cta-split"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // ===========================================================================
  // REAL ESTATE ELITE SERIES (10 THEMES)
  // ===========================================================================

  {
    name: "Modern Urban Glass",
    slug: "re-urban-glass-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["real-estate", "urban", "condo", "modern"],
    colors: {
      primary: "#0f172a", // Slate 900
      secondary: "#334155", // Slate 700
      accent: "#38bdf8", // Sky 400
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#020617",
      textMuted: "#64748b",
      border: "#e2e8f0",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Inter", "Inter", ["400", "800"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "2px", large: "4px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em" },
    sectionPadding: "6rem", contentSize: "800px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3rem, 10vw, 7rem)", h2: "clamp(2rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-4col", homeLayout: ["hero-split-screen", "features-columns", "logo-cloud", "cta-banner"], aboutLayout: ["hero-image-bg", "stats-counter", "cta-minimal"], servicesLayout: ["hero-image-bg", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Luxury Manor Reserve",
    slug: "re-luxury-manor-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["luxury", "real-estate", "mansion", "elite"],
    colors: {
      primary: "#c5a059", // Gold
      secondary: "#1c1917", // Stone 900
      accent: "#ffffff",
      background: "#0a0a0a", // Pure Dark
      surface: "#171717",
      text: "#ffffff",
      textMuted: "#a8a29e",
      border: "#292524",
    },
    fonts: {
      heading: "Syne",
      body: "Outfit",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Syne", "Outfit", ["800"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "0px", large: "0px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1.2rem 3rem", fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.25em" },
    sectionPadding: "8rem", contentSize: "900px", wideSize: "1450px",
    headingSizes: { h1: "clamp(4rem, 12vw, 9rem)", h2: "clamp(2.5rem, 7vw, 4.5rem)", h3: "clamp(1.75rem, 4vw, 2.75rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-dark", homeLayout: ["hero-video-bg", "gallery-masonry", "testimonials-single", "cta-gradient"], aboutLayout: ["hero-image-bg", "stats-counter", "cta-minimal"], servicesLayout: ["hero-image-bg", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Suburban Warmth Sage",
    slug: "re-suburban-warmth-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["real-estate", "family", "suburban", "warm"],
    colors: {
      primary: "#588157", // Sage Green
      secondary: "#3a5a40", // Deep Forest
      accent: "#dad7cd", // Putty
      background: "#ffffff",
      surface: "#f8f9f8",
      text: "#344e41", // Moss text
      textMuted: "#a3b18a", // Muted leaf
      border: "#dad7cd",
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Inter", ["700"], ["400", "500"]),
    },
    borderRadius: { small: "8px", medium: "16px", large: "32px", pill: "9999px" },
    buttonStyle: { borderRadius: "12px", padding: "0.9rem 2.5rem", fontSize: "1rem", fontWeight: "600", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "6rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3rem, 8vw, 5rem)", h2: "clamp(2rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3.5vw, 2.5rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header", footerVariant: "footer", homeLayout: ["hero-image-bg", "features-columns", "testimonials-carousel", "cta-split"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Coastal Sands Living",
    slug: "re-coastal-living-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["coastal", "real-estate", "travel", "beach"],
    colors: {
      primary: "#00b4d8", // Water
      secondary: "#0077b6", // Deep Water
      accent: "#caf0f8", // Foam
      background: "#fffbf5", // Warm Sand
      surface: "#ffffff",
      text: "#023e8a", // Naval
      textMuted: "#48cae4", // Sky
      border: "#ade8f4", // Shallow
    },
    fonts: {
      heading: "Lora",
      body: "Outfit",
      headingWeight: "600",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Lora", "Outfit", ["400", "600"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "20px", large: "40px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "1rem 2.5rem", fontSize: "1rem", fontWeight: "600", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "7rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3rem, 9vw, 6rem)", h2: "clamp(2rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-centered", homeLayout: ["hero-image-bg", "gallery-masonry", "testimonials-single", "cta-minimal"], aboutLayout: ["hero-image-bg", "stats-counter", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Industrial Loft Brick",
    slug: "re-industrial-loft-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["loft", "industrial", "real-estate", "urban"],
    colors: {
      primary: "#bc4749", // Brick Red
      secondary: "#386641", // Pine Green
      accent: "#a7c957", // Leaf
      background: "#ffffff",
      surface: "#f2e8cf", // Eggshell
      text: "#386641", // Dark Forest
      textMuted: "#6a994e", // Green muted
      border: "#bc4749", // Brick border
    },
    fonts: {
      heading: "Archivo",
      body: "Inter",
      headingWeight: "900",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Archivo", "Inter", ["400", "900"], ["400", "600"]),
    },
    borderRadius: { small: "0px", medium: "0px", large: "0px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.15em" },
    sectionPadding: "5rem", contentSize: "800px", wideSize: "1300px",
    headingSizes: { h1: "clamp(3.5rem, 12vw, 9rem)", h2: "clamp(2.25rem, 6vw, 4rem)", h3: "clamp(1.5rem, 4vw, 2.5rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-dark", homeLayout: ["hero-asymmetric", "features-checklist", "stats-counter", "cta-banner"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Executive Penthouse Noir",
    slug: "re-penthouse-noir-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["luxury", "real-estate", "modern", "black"],
    colors: {
      primary: "#ffffff", // Pure White
      secondary: "#a1a1aa", // Zinc 400
      accent: "#dc2626", // Signal Red
      background: "#09090b", // Zinc 950
      surface: "#18181b", // Zinc 900
      text: "#ffffff",
      textMuted: "#71717a", // Zinc 500
      border: "#27272a", // Zinc 800
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      headingWeight: "900",
      bodyWeight: "300",
      googleFontsUrl: buildGoogleFontsUrl("Inter", "Inter", ["300", "900"], ["300", "400"]),
    },
    borderRadius: { small: "2px", medium: "4px", large: "8px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1rem 3rem", fontSize: "0.95rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.2em" },
    sectionPadding: "8rem", contentSize: "900px", wideSize: "1450px",
    headingSizes: { h1: "clamp(4rem, 15vw, 12rem)", h2: "clamp(2.5rem, 8vw, 5.5rem)", h3: "clamp(1.5rem, 4vw, 3rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-dark", homeLayout: ["hero-video-bg", "gallery-masonry", "logo-cloud", "cta-gradient"], aboutLayout: ["hero-image-bg", "stats-counter", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Minimalist Studio White",
    slug: "re-minimalist-studio-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["studio", "minimalist", "real-estate", "clean"],
    colors: {
      primary: "#000000",
      secondary: "#404040", // Gray 700
      accent: "#a3a3a3", // Gray 400
      background: "#ffffff",
      surface: "#fafafa",
      text: "#000000",
      textMuted: "#737373", // Gray 500
      border: "#e5e5e5",
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
      headingWeight: "400",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Inter", ["400"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "0px", large: "0px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1.2rem 3rem", fontSize: "0.85rem", fontWeight: "400", textTransform: "uppercase", letterSpacing: "0.2em" },
    sectionPadding: "10rem", contentSize: "1000px", wideSize: "1500px",
    headingSizes: { h1: "clamp(3.5rem, 12vw, 8.5rem)", h2: "clamp(2.25rem, 6vw, 4rem)", h3: "clamp(1.5rem, 4vw, 2.5rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-minimal", homeLayout: ["hero-centered-minimal", "gallery-masonry", "testimonials-single", "cta-minimal"], aboutLayout: ["hero-centered-minimal", "stats-counter", "cta-minimal"], servicesLayout: ["hero-centered-minimal", "features-columns", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Sustainable Echo Living",
    slug: "re-sustainable-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["sustainable", "eco", "real-estate", "modern"],
    colors: {
      primary: "#065f46", // Emerald 800
      secondary: "#064e3b", // Emerald 900
      accent: "#a7f3d0", // Emerald 200
      background: "#ffffff",
      surface: "#f0fdf4", // Emerald 50
      text: "#064e3b",
      textMuted: "#10b981", // Emerald 500
      border: "#d1fae5", // Emerald 100
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Inter", ["400", "800"], ["400", "500"]),
    },
    borderRadius: { small: "12px", medium: "24px", large: "48px", pill: "9999px" },
    buttonStyle: { borderRadius: "12px", padding: "0.9rem 2.5rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "none", letterSpacing: "0.01em" },
    sectionPadding: "6rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3.5rem, 10vw, 6rem)", h2: "clamp(2.25rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3.5vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header", footerVariant: "footer-4col", homeLayout: ["hero-image-bg", "services-icons", "testimonials-carousel", "cta-split"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Smart Tech Residences",
    slug: "re-smart-tech-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["tech", "real-estate", "smart-home", "modern"],
    colors: {
      primary: "#6366f1", // Indigo 500
      secondary: "#4338ca", // Indigo 700
      accent: "#818cf8", // Indigo 400
      background: "#020617", // Black Hole Blue
      surface: "#0f172a", // Dark Slate
      text: "#ffffff",
      textMuted: "#94a3b8",
      border: "#1e293b",
    },
    fonts: {
      heading: "Space Grotesk",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Space Grotesk", "Inter", ["400", "700"], ["400", "500"]),
    },
    borderRadius: { small: "6px", medium: "12px", large: "24px", pill: "9999px" },
    buttonStyle: { borderRadius: "12px", padding: "0.85rem 2.25rem", fontSize: "0.95rem", fontWeight: "600", textTransform: "none", letterSpacing: "0.02em" },
    sectionPadding: "6rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3.5rem, 10vw, 7rem)", h2: "clamp(2rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-dark", homeLayout: ["hero-video-bg", "services-grid", "stats-counter", "cta-gradient"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Estate Legacy Gold",
    slug: "re-legacy-gold-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["real-estate", "heritage", "legacy", "classic"],
    colors: {
      primary: "#634832", // Deep Oak
      secondary: "#3d2b1f", // Dark Walnut
      accent: "#d4af37", // Metallic Gold
      background: "#ffffff",
      surface: "#fdf8f5", // Cream wash
      text: "#3d2b1f",
      textMuted: "#9c816c", // Muted Tan
      border: "#eee2d5", // Soft border
    },
    fonts: {
      heading: "Playfair Display",
      body: "Lora",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Playfair Display", "Lora", ["400", "700"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "2px", large: "4px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.15em" },
    sectionPadding: "7rem", contentSize: "900px", wideSize: "1400px",
    headingSizes: { h1: "clamp(3rem, 7vw, 5.5rem)", h2: "clamp(2rem, 4.5vw, 3.5rem)", h3: "clamp(1.5rem, 2.5vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header", footerVariant: "footer-4col", homeLayout: ["hero-image-bg", "features-columns", "logo-cloud", "cta-split"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // ===========================================================================
  // HVAC & CLIMATE CONTROL ELITE SERIES (10 THEMES)
  // ===========================================================================

  {
    name: "Arctic Blue HVAC",
    slug: "hvac-arctic-blue-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["hvac", "cooling", "air-conditioning", "modern"],
    colors: {
      primary: "#0ea5e9", // Cooling Blue
      secondary: "#0c4a6e", // Deep Naval
      accent: "#f97316", // Heater Orange
      background: "#ffffff",
      surface: "#f0f9ff",
      text: "#0c4a6e",
      textMuted: "#64748b",
      border: "#bae6fd",
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Inter", ["400", "800"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "8px", large: "16px", pill: "9999px" },
    buttonStyle: { borderRadius: "8px", padding: "0.9rem 2.25rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "none", letterSpacing: "0.01em" },
    sectionPadding: "5rem", contentSize: "800px", wideSize: "1250px",
    headingSizes: { h1: "clamp(2.75rem, 6vw, 4.5rem)", h2: "clamp(2rem, 4vw, 3rem)", h3: "clamp(1.5rem, 2.5vw, 1.75rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header", footerVariant: "footer-4col", homeLayout: ["hero-image-bg", "services-icons", "stats-counter", "cta-split"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Frost & Flame Elite",
    slug: "hvac-frost-flame-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["hvac", "heating", "ventilation", "strong"],
    colors: {
      primary: "#ef4444", // Flame Red
      secondary: "#3b82f6", // Frost Blue
      accent: "#ffffff",
      background: "#0f172a", // Slate 900
      surface: "#1e293b", // Slate 800
      text: "#ffffff",
      textMuted: "#94a3b8",
      border: "#334155",
    },
    fonts: {
      heading: "Archivo",
      body: "Inter",
      headingWeight: "900",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Archivo", "Inter", ["400", "900"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "4px", large: "8px", pill: "9999px" },
    buttonStyle: { borderRadius: "4px", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.1em" },
    sectionPadding: "6rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3.5rem, 10vw, 7rem)", h2: "clamp(2.25rem, 6vw, 3.5rem)", h3: "clamp(1.5rem, 3.5vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-dark", homeLayout: ["hero-video-bg", "services-grid", "stats-counter", "cta-banner"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Pure Air Purifier",
    slug: "hvac-pure-air-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["hvac", "air-quality", "purification", "clean"],
    colors: {
      primary: "#34d399", // Air Mint
      secondary: "#065f46", // Deep Emerald
      accent: "#f0fdf4", // Soft Mint Wash
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#064e3b",
      textMuted: "#10b981",
      border: "#d1fae5",
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
      headingWeight: "600",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Inter", ["400", "600"], ["400", "500"]),
    },
    borderRadius: { small: "12px", medium: "24px", large: "48px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.9rem 2.5rem", fontSize: "0.95rem", fontWeight: "600", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "6.5rem", contentSize: "850px", wideSize: "1300px",
    headingSizes: { h1: "clamp(3rem, 8vw, 5rem)", h2: "clamp(2rem, 5vw, 3rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-centered", homeLayout: ["hero-centered-minimal", "features-columns", "testimonials-carousel", "cta-split"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Industrial Chiller",
    slug: "hvac-industrial-chiller-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["hvac", "commercial", "industrial", "strong"],
    colors: {
      primary: "#2563eb", // Commercial Blue
      secondary: "#1e3a8a", // Dark Blue
      accent: "#facc15", // Caution Yellow
      background: "#f1f5f9", // Light Steel
      surface: "#ffffff",
      text: "#0f172a",
      textMuted: "#475569",
      border: "#cbd5e1",
    },
    fonts: {
      heading: "Archivo",
      body: "Roboto",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Archivo", "Roboto", ["400", "800"], ["400", "500", "700"]),
    },
    borderRadius: { small: "0px", medium: "2px", large: "4px", pill: "9999px" },
    buttonStyle: { borderRadius: "2px", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em" },
    sectionPadding: "5rem", contentSize: "800px", wideSize: "1200px",
    headingSizes: { h1: "clamp(3rem, 10vw, 7.5rem)", h2: "clamp(2rem, 6vw, 4rem)", h3: "clamp(1.5rem, 4vw, 2.5rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-4col", homeLayout: ["hero-image-bg", "features-checklist", "stats-counter", "cta-banner"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-icons", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Thermal Shield Dark",
    slug: "hvac-thermal-shield-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["hvac", "insulation", "energy", "modern"],
    colors: {
      primary: "#8b5cf6", // Ultraviolet
      secondary: "#4c1d95", // Deep Purple
      accent: "#f472b6", // Infrared
      background: "#0a0a0a",
      surface: "#171717",
      text: "#ffffff",
      textMuted: "#a3a3a3",
      border: "#262626",
    },
    fonts: {
      heading: "Syne",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Syne", "Inter", ["400", "700"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "12px", large: "24px", pill: "9999px" },
    buttonStyle: { borderRadius: "12px", padding: "0.85rem 2.25rem", fontSize: "0.95rem", fontWeight: "600", textTransform: "none", letterSpacing: "0.02em" },
    sectionPadding: "6rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3rem, 8vw, 6rem)", h2: "clamp(2rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-dark", homeLayout: ["hero-video-bg", "services-grid", "testimonials-carousel", "cta-gradient"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Eco Breeze Green",
    slug: "hvac-eco-breeze-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["hvac", "sustainable", "eco", "green"],
    colors: {
      primary: "#10b981", // Emerald 500
      secondary: "#064e3b", // Emerald 900
      accent: "#d1fae5", // Emerald 100
      background: "#ffffff",
      surface: "#f0fdf4",
      text: "#064e3b",
      textMuted: "#10b981",
      border: "#d1fae5",
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Inter", ["400", "800"], ["400", "500"]),
    },
    borderRadius: { small: "8px", medium: "16px", large: "32px", pill: "9999px" },
    buttonStyle: { borderRadius: "12px", padding: "0.9rem 2.5rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "none", letterSpacing: "0.01em" },
    sectionPadding: "6rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3.5rem, 10vw, 6rem)", h2: "clamp(2.25rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3.5vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header", footerVariant: "footer-4col", homeLayout: ["hero-image-bg", "services-icons", "testimonials-carousel", "cta-split"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Classic Heating Red",
    slug: "hvac-classic-heating-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["hvac", "heating", "furnace", "classic"],
    colors: {
      primary: "#dc2626", // Red 600
      secondary: "#450a0a", // Red 950
      accent: "#fca5a5", // Red 300
      background: "#ffffff",
      surface: "#fef2f2",
      text: "#1a1a1a",
      textMuted: "#7f1d1d",
      border: "#fee2e2",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      headingWeight: "900",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Inter", "Inter", ["400", "900"], ["400", "500"]),
    },
    borderRadius: { small: "2px", medium: "4px", large: "8px", pill: "9999px" },
    buttonStyle: { borderRadius: "4px", padding: "0.85rem 2.25rem", fontSize: "0.95rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em" },
    sectionPadding: "5rem", contentSize: "800px", wideSize: "1200px",
    headingSizes: { h1: "clamp(3rem, 10vw, 7.5rem)", h2: "clamp(2.25rem, 6vw, 4rem)", h3: "clamp(1.5rem, 4vw, 2.5rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-4col", homeLayout: ["hero-image-bg", "services-icons", "stats-counter", "cta-banner"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Vantage Air Modern",
    slug: "hvac-vantage-air-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["hvac", "luxury", "condo", "modern"],
    colors: {
      primary: "#2dd4bf", // Teal 400
      secondary: "#134e4a", // Teal 900
      accent: "#99f6e4", // Teal 200
      background: "#ffffff",
      surface: "#f0fdffa",
      text: "#0f172a",
      textMuted: "#14b8a6",
      border: "#ccfbf1",
    },
    fonts: {
      heading: "Space Grotesk",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Space Grotesk", "Inter", ["400", "700"], ["400", "500"]),
    },
    borderRadius: { small: "6px", medium: "12px", large: "24px", pill: "9999px" },
    buttonStyle: { borderRadius: "12px", padding: "0.85rem 2.25rem", fontSize: "0.95rem", fontWeight: "600", textTransform: "none", letterSpacing: "0.02em" },
    sectionPadding: "6rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3.5rem, 10vw, 7rem)", h2: "clamp(2rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-dark", homeLayout: ["hero-image-bg", "services-grid", "stats-counter", "cta-gradient"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Titan HVAC Industrial",
    slug: "hvac-titan-industrial-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["hvac", "heavy-industrial", "commercial", "strong"],
    colors: {
      primary: "#ea580c", // Orange 600
      secondary: "#1c1917", // Stone 900
      accent: "#ffffff",
      background: "#1c1917",
      surface: "#292524",
      text: "#ffffff",
      textMuted: "#a8a29e",
      border: "#44403c",
    },
    fonts: {
      heading: "Archivo",
      body: "Roboto",
      headingWeight: "900",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Archivo", "Roboto", ["400", "900"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "2px", large: "4px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.15em" },
    sectionPadding: "6rem", contentSize: "800px", wideSize: "1300px",
    headingSizes: { h1: "clamp(4rem, 12vw, 9rem)", h2: "clamp(2.5rem, 7vw, 4.5rem)", h3: "clamp(1.75rem, 4vw, 2.75rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-dark", homeLayout: ["hero-video-bg", "features-checklist", "stats-counter", "cta-banner"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-icons", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Aero Comfort Luxe",
    slug: "hvac-aero-comfort-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["hvac", "luxury", "lifestyle", "clean"],
    colors: {
      primary: "#14b8a6", // Teal 500
      secondary: "#0f172a", // Slate 900
      accent: "#99f6e4", // Teal 200
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#0f172a",
      textMuted: "#475569",
      border: "#e2e8f0",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Playfair Display", "Inter", ["400", "700"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "4px", large: "12px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1.1rem 3rem", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.2em" },
    sectionPadding: "7rem", contentSize: "900px", wideSize: "1400px",
    headingSizes: { h1: "clamp(3rem, 8vw, 6rem)", h2: "clamp(2rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-centered", homeLayout: ["hero-image-bg", "gallery-masonry", "testimonials-single", "cta-minimal"], aboutLayout: ["hero-image-bg", "stats-counter", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // ===========================================================================
  // PLUMBING ELITE SERIES (10 THEMES)
  // ===========================================================================

  {
    name: "Pure Water Plumber",
    slug: "plumb-pure-water-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["plumbing", "water", "service", "clean"],
    colors: {
      primary: "#2563eb", // Water Blue
      secondary: "#1e3a8a", // Deep Blue
      accent: "#fbd38d", // Golden Faucet
      background: "#ffffff",
      surface: "#f0f7ff", // Bubble wash
      text: "#0f172a",
      textMuted: "#3b82f6",
      border: "#dbeafe",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Inter", "Inter", ["400", "800"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "8px", large: "16px", pill: "9999px" },
    buttonStyle: { borderRadius: "4px", padding: "0.85rem 2rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "5rem", contentSize: "800px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2.5rem, 5vw, 4rem)", h2: "clamp(1.75rem, 3.5vw, 2.5rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header", footerVariant: "footer-4col", homeLayout: ["hero-image-bg", "services-icons", "stats-counter", "cta-split"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Copper Pipe Elite",
    slug: "plumb-copper-pipe-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["plumbing", "industrial", "contractor", "strong"],
    colors: {
      primary: "#b45309", // Copper
      secondary: "#78350f", // Dark Copper
      accent: "#1e1b4b", // Midnight Pipe
      background: "#ffffff",
      surface: "#fffbeb", // Copper Glow
      text: "#451a03", // Deep Brown
      textMuted: "#92400e", // Muted Bronze
      border: "#fde68a", // Gold border
    },
    fonts: {
      heading: "Archivo",
      body: "Roboto",
      headingWeight: "900",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Archivo", "Roboto", ["400", "900"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "2px", large: "4px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.15em" },
    sectionPadding: "6rem", contentSize: "850px", wideSize: "1300px",
    headingSizes: { h1: "clamp(3.5rem, 12vw, 9rem)", h2: "clamp(2.5rem, 7vw, 4.5rem)", h3: "clamp(1.75rem, 4vw, 2.75rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-dark", homeLayout: ["hero-asymmetric", "features-checklist", "stats-counter", "cta-banner"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-icons", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Hydro Tech Modern",
    slug: "plumb-hydro-tech-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["plumbing", "tech", "modern", "service"],
    colors: {
      primary: "#06b6d4", // Hydro Cyan
      secondary: "#083344", // Naval Blue
      accent: "#ecfeff", // Ice Wash
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#0f172a",
      textMuted: "#0891b2",
      border: "#cffafe",
    },
    fonts: {
      heading: "Space Grotesk",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Space Grotesk", "Inter", ["400", "700"], ["400", "500"]),
    },
    borderRadius: { small: "6px", medium: "12px", large: "24px", pill: "9999px" },
    buttonStyle: { borderRadius: "12px", padding: "0.85rem 2.25rem", fontSize: "0.95rem", fontWeight: "600", textTransform: "none", letterSpacing: "0.02em" },
    sectionPadding: "6.5rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3rem, 8vw, 6.5rem)", h2: "clamp(2.25rem, 6vw, 4rem)", h3: "clamp(1.5rem, 3.5vw, 2.5rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-dark", homeLayout: ["hero-video-bg", "services-grid", "testimonials-carousel", "cta-gradient"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Master Flow Classic",
    slug: "plumb-master-flow-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["plumbing", "contractor", "classic", "trusted"],
    colors: {
      primary: "#1d4ed8", // Classic Blue
      secondary: "#1e1b4b", // Naval
      accent: "#f59e0b", // Brass Gold
      background: "#ffffff",
      surface: "#fffaf0", // Warm Ivory
      text: "#1e1b4b",
      textMuted: "#4b5563",
      border: "#fde68a",
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Inter", ["400", "800"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "8px", large: "12px", pill: "9999px" },
    buttonStyle: { borderRadius: "8px", padding: "0.95rem 2.25rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "none", letterSpacing: "0.01em" },
    sectionPadding: "5rem", contentSize: "800px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2.5rem, 6vw, 4rem)", h2: "clamp(1.75rem, 4vw, 2.5rem)", h3: "clamp(1.25rem, 2.5vw, 1.75rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header", footerVariant: "footer-4col", homeLayout: ["hero-image-bg", "services-icons", "trust-bar", "cta-split"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Aqua Blue Wellness",
    slug: "plumb-aqua-wellness-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["plumbing", "bathroom", "remodel", "luxury"],
    colors: {
      primary: "#0f766e", // Teal 700
      secondary: "#134e4a", // Teal 900
      accent: "#f0fdfa", // Teal 50
      background: "#ffffff",
      surface: "#ccfbf1", // Teal 100
      text: "#134e4a",
      textMuted: "#14b8a6",
      border: "#99f6e4",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Outfit",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Playfair Display", "Outfit", ["400", "700"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "4px", large: "24px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1.1rem 3rem", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.2em" },
    sectionPadding: "7rem", contentSize: "900px", wideSize: "1400px",
    headingSizes: { h1: "clamp(3rem, 8vw, 6rem)", h2: "clamp(2rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-centered", homeLayout: ["hero-centered-minimal", "gallery-masonry", "testimonials-single", "cta-minimal"], aboutLayout: ["hero-image-bg", "stats-counter", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Emergency 24/7 Red",
    slug: "plumb-emergency-red-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["plumbing", "emergency", "urgent", "strong"],
    colors: {
      primary: "#b91c1c", // Urgent Red
      secondary: "#450a0a", // Blood Red
      accent: "#ffffff",
      background: "#fef2f2", // Red wash
      surface: "#ffffff",
      text: "#1a1a1a",
      textMuted: "#991b1b",
      border: "#fca5a5",
    },
    fonts: {
      heading: "Archivo",
      body: "Inter",
      headingWeight: "900",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Archivo", "Inter", ["400", "900"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "2px", large: "4px", pill: "9999px" },
    buttonStyle: { borderRadius: "2px", padding: "1rem 2.5rem", fontSize: "0.95rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.1em" },
    sectionPadding: "5rem", contentSize: "800px", wideSize: "1200px",
    headingSizes: { h1: "clamp(3.5rem, 12vw, 8rem)", h2: "clamp(2.25rem, 6vw, 4rem)", h3: "clamp(1.5rem, 4vw, 2.5rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-4col", homeLayout: ["hero-image-bg", "features-checklist", "stats-counter", "cta-banner"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-icons", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Industrial Drain Master",
    slug: "plumb-industrial-drain-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["plumbing", "commercial", "drain", "strong"],
    colors: {
      primary: "#3f3f46", // Steel Gray
      secondary: "#18181b", // Midnight Carbon
      accent: "#fbbf24", // Caution Amber
      background: "#09090b", // Deep Black
      surface: "#18181b", // Matte Carbon
      text: "#ffffff",
      textMuted: "#a1a1aa",
      border: "#27272a",
    },
    fonts: {
      heading: "Archivo",
      body: "JetBrains Mono",
      headingWeight: "900",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Archivo", "JetBrains Mono", ["400", "900"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "2px", large: "4px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.15em" },
    sectionPadding: "6rem", contentSize: "800px", wideSize: "1350px",
    headingSizes: { h1: "clamp(4rem, 12vw, 9rem)", h2: "clamp(2.5rem, 7vw, 4.5rem)", h3: "clamp(1.75rem, 4vw, 2.75rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-dark", homeLayout: ["hero-video-bg", "features-checklist", "stats-counter", "cta-banner"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-icons", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Eco Flush Future",
    slug: "plumb-eco-flush-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["plumbing", "sustainable", "future", "clean"],
    colors: {
      primary: "#10b981", // Emerald 500
      secondary: "#064e3b", // Emerald 900
      accent: "#d1fae5", // Emerald 100
      background: "#ffffff",
      surface: "#f0fdf4",
      text: "#064e3b",
      textMuted: "#10b981",
      border: "#d1fae5",
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Inter", ["400", "800"], ["400", "500"]),
    },
    borderRadius: { small: "8px", medium: "16px", large: "32px", pill: "9999px" },
    buttonStyle: { borderRadius: "12px", padding: "0.9rem 2.5rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "none", letterSpacing: "0.01em" },
    sectionPadding: "6rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3.5rem, 10vw, 6rem)", h2: "clamp(2.25rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3.5vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header", footerVariant: "footer-4col", homeLayout: ["hero-image-bg", "services-icons", "testimonials-carousel", "cta-split"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Crystal Flow Luxe",
    slug: "plumb-crystal-flow-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["plumbing", "luxury", "condo", "modern"],
    colors: {
      primary: "#3b82f6", // Crystal Blue
      secondary: "#1d4ed8", // Deep Blue
      accent: "#ffffff",
      background: "#ffffff",
      surface: "#eff6ff", // Crystal Wash
      text: "#1e3a8a",
      textMuted: "#60a5fa",
      border: "#dbeafe",
    },
    fonts: {
      heading: "Syne",
      body: "Inter",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Syne", "Inter", ["400", "800"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "12px", large: "32px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.95rem 2.5rem", fontSize: "0.95rem", fontWeight: "800", textTransform: "none", letterSpacing: "0.05em" },
    sectionPadding: "6.5rem", contentSize: "900px", wideSize: "1400px",
    headingSizes: { h1: "clamp(3rem, 10vw, 7rem)", h2: "clamp(2rem, 6vw, 4rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-dark", homeLayout: ["hero-video-bg", "services-grid", "testimonials-carousel", "cta-gradient"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Slab Master Industrial",
    slug: "plumb-slab-master-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["plumbing", "commercial", "slab", "strong"],
    colors: {
      primary: "#71717a", // Slate 500
      secondary: "#27272a", // Slate 800
      accent: "#f43f5e", // Rose 500
      background: "#fafafa",
      surface: "#f4f4f5",
      text: "#18181b",
      textMuted: "#52525b",
      border: "#e4e4e7",
    },
    fonts: {
      heading: "Archivo",
      body: "Inter",
      headingWeight: "900",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Archivo", "Inter", ["400", "900"], ["400", "600"]),
    },
    borderRadius: { small: "0px", medium: "2px", large: "4px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.05em" },
    sectionPadding: "5rem", contentSize: "800px", wideSize: "1400px",
    headingSizes: { h1: "clamp(3.5rem, 12vw, 9rem)", h2: "clamp(2.25rem, 6vw, 4rem)", h3: "clamp(1.5rem, 4vw, 2.5rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-4col", homeLayout: ["hero-asymmetric", "features-checklist", "stats-counter", "cta-banner"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  {
    name: "Desert Mirage",
    slug: "elite-desert-mirage-archetype",
    archetype: Archetype.VENUE,
    industryTags: ["retreat", "resort", "lifestyle", "nature"],
    colors: {
      primary: "#e76f51", // Burnt Sienna
      secondary: "#264653", // Dark Teal
      accent: "#2a9d8f", // Persian Green
      background: "#fffcf2", // Warm Parchment
      surface: "#f8f1e5", // Soft Sand
      text: "#252422", // Charcoal
      textMuted: "#403d39", // Muted Gray
      border: "#ccc5b9", // Dust
    },
    fonts: {
      heading: "Syne",
      body: "Outfit",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Syne", "Outfit", ["400", "800"], ["400", "500"]),
    },
    borderRadius: { small: "2px", medium: "8px", large: "48px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em" },
    sectionPadding: "8rem", contentSize: "900px", wideSize: "1400px",
    headingSizes: { h1: "clamp(3.5rem, 10vw, 7rem)", h2: "clamp(2rem, 6vw, 4rem)", h3: "clamp(1.5rem, 4vw, 2.5rem)", h4: "1.25rem" },
    designPackage: {
      headerVariant: "header-minimal",
      footerVariant: "footer-centered",
      homeLayout: ["hero-asymmetric", "gallery-masonry", "testimonials-single", "cta-minimal"],
      aboutLayout: ["hero-centered-minimal", "stats-counter", "cta-minimal"],
      servicesLayout: ["hero-centered-minimal", "features-columns", "cta-gradient"],
      contactLayout: ["contact-form-section", "map-embed"],
    },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Deep Sea Biolume",
    slug: "elite-deep-sea-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["innovation", "tech", "deep-sea", "exploration"],
    colors: {
      primary: "#0077b6", // Ocean Blue
      secondary: "#03045e", // Deep Naval
      accent: "#90e0ef", // Bio-Luminescent Cyan
      background: "#000b14", // Near-Void Blue
      surface: "#001219", // Dark Current
      text: "#caf0f8", // Ice Blue
      textMuted: "#48cae4", // Glowing Aura
      border: "#002855", // Deep Ridge
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
      headingWeight: "900",
      bodyWeight: "300",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Inter", ["300", "900"], ["300", "400"]),
    },
    borderRadius: { small: "6px", medium: "20px", large: "40px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.85rem 2.5rem", fontSize: "0.95rem", fontWeight: "600", textTransform: "none", letterSpacing: "0.05em" },
    sectionPadding: "6rem", contentSize: "800px", wideSize: "1200px",
    headingSizes: { h1: "clamp(3rem, 8vw, 6rem)", h2: "clamp(2rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: {
      headerVariant: "header-transparent",
      footerVariant: "footer-dark",
      homeLayout: ["hero-video-bg", "services-icons", "stats-counter", "cta-gradient"],
      aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"],
      servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"],
      contactLayout: ["contact-form-section", "map-embed"],
    },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Rose Gold Quartz",
    slug: "elite-rose-quartz-archetype",
    archetype: Archetype.COMMERCE,
    industryTags: ["jewelry", "cosmetics", "fashion", "luxury"],
    colors: {
      primary: "#d4af37", // Metallic Gold
      secondary: "#8b5e34", // Bronze
      accent: "#f8ad9d", // Soft Quartz
      background: "#ffffff",
      surface: "#fff4f1", // Pale Rose
      text: "#3c2f2f", // Espresso
      textMuted: "#8e7d7d", // Muted Rose
      border: "#ffe5d9", // Blush
    },
    fonts: {
      heading: "Playfair Display",
      body: "Montserrat",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Playfair Display", "Montserrat", ["400", "700"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "4px", large: "12px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1rem 2.8rem", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.2em" },
    sectionPadding: "7rem", contentSize: "850px", wideSize: "1400px",
    headingSizes: { h1: "clamp(3rem, 7vw, 5rem)", h2: "clamp(2rem, 4vw, 3rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.125rem" },
    designPackage: {
      headerVariant: "header-commerce",
      footerVariant: "footer-commerce",
      homeLayout: ["shop-hero", "product-featured", "testimonials-carousel", "cta-banner"],
      shopLayout: ["shop-hero", "product-grid", "cta-split"],
      categoriesLayout: ["shop-hero", "product-categories", "cta-banner"],
      aboutLayout: ["hero-image-bg", "stats-counter", "cta-banner"],
      contactLayout: ["contact-form-section", "map-embed"],
    },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Obsidian Slate",
    slug: "elite-obsidian-slate-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["law", "finance", "executive", "consulting"],
    colors: {
      primary: "#0f172a", // Slate 900
      secondary: "#334155", // Slate 700
      accent: "#94a3b8", // Slate 400
      background: "#f8fafc", // Slate 50
      surface: "#ffffff",
      text: "#020617", // Slate 950
      textMuted: "#64748b", // Slate 500
      border: "#e2e8f0", // Slate 200
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Inter", "Inter", ["400", "800"], ["400", "500", "600"]),
    },
    borderRadius: { small: "2px", medium: "4px", large: "8px", pill: "9999px" },
    buttonStyle: { borderRadius: "4px", padding: "0.85rem 2.1rem", fontSize: "0.9rem", fontWeight: "700", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "6rem", contentSize: "768px", wideSize: "1200px",
    headingSizes: { h1: "clamp(2.5rem, 5vw, 4rem)", h2: "clamp(1.75rem, 3.5vw, 2.5rem)", h3: "clamp(1.25rem, 2vw, 1.75rem)", h4: "1.125rem" },
    designPackage: {
      headerVariant: "header",
      footerVariant: "footer-4col",
      homeLayout: ["hero-centered-minimal", "trust-bar", "features-columns", "cta-minimal"],
      aboutLayout: ["hero-image-bg", "team-grid", "stats-counter", "cta-minimal"],
      servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"],
      contactLayout: ["contact-form-section", "map-embed"],
    },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Alpine Frost",
    slug: "elite-alpine-frost-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["wellness", "health", "tech", "modern"],
    colors: {
      primary: "#4cc9f0", // Frost Blue
      secondary: "#4895ef", // Deep Frost
      accent: "#f72585", // Neon Pulse
      background: "#ffffff",
      surface: "#f0f7f9", // Glacial Mist
      text: "#3f37c9", // Arctic Indigo
      textMuted: "#4361ee", // Alpine Royal
      border: "#d9e8ef", // Snow Line
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Inter", ["400", "700"], ["400", "500", "600"]),
    },
    borderRadius: { small: "12px", medium: "24px", large: "48px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.85rem 2rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "none", letterSpacing: "0.02em" },
    sectionPadding: "6rem", contentSize: "820px", wideSize: "1300px",
    headingSizes: { h1: "clamp(3rem, 7vw, 5rem)", h2: "clamp(2rem, 4.5vw, 3rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: {
      headerVariant: "header-minimal",
      footerVariant: "footer-centered",
      homeLayout: ["hero-split-screen", "services-icons", "testimonials-carousel", "cta-gradient"],
      aboutLayout: ["hero-image-bg", "stats-counter", "cta-minimal"],
      servicesLayout: ["hero-image-bg", "pricing-table", "faq-accordion", "cta-gradient"],
      contactLayout: ["contact-form-section", "map-embed"],
    },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Emerald Forest Elite",
    slug: "elite-emerald-forest-archetype",
    archetype: Archetype.VENUE,
    industryTags: ["eco", "luxury", "botanical", "architecture"],
    colors: {
      primary: "#132a13", // Deep Moss
      secondary: "#31572c", // Forest Floor
      accent: "#ecf39e", // Bright Lime
      background: "#ffffff",
      surface: "#fcfefc", // Pale Leaf
      text: "#132a13", // Dark Pine
      textMuted: "#4f772d", // Fern
      border: "#dfebdf", // Willow
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Inter", ["400", "800"], ["400", "500"]),
    },
    borderRadius: { small: "8px", medium: "24px", large: "64px", pill: "9999px" },
    buttonStyle: { borderRadius: "12px", padding: "0.85rem 2rem", fontSize: "0.95rem", fontWeight: "600", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "7rem", contentSize: "900px", wideSize: "1400px",
    headingSizes: { h1: "clamp(3.5rem, 9vw, 6rem)", h2: "clamp(2rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: {
      headerVariant: "header",
      footerVariant: "footer-4col",
      homeLayout: ["hero-image-bg", "services-alternating", "testimonials-cards", "cta-split"],
      aboutLayout: ["hero-image-bg", "gallery-masonry", "cta-minimal"],
      servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"],
      contactLayout: ["contact-form-section", "map-embed"],
    },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Carbon Flux",
    slug: "elite-carbon-flux-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["engineering", "aerospace", "high-performance", "defense"],
    colors: {
      primary: "#f0131e", // High-Viz Red
      secondary: "#1a1a1a", // Carbon
      accent: "#ffffff", // Stark White
      background: "#050505", // Technical Black
      surface: "#111111", // Matte Graphite
      text: "#ffffff",
      textMuted: "#808080", // Gunmetal
      border: "#262626", // Sealed Joint
    },
    fonts: {
      heading: "Archivo",
      body: "JetBrains Mono",
      headingWeight: "900",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Archivo", "JetBrains Mono", ["400", "900"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "2px", large: "4px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "0.9rem 2.5rem", fontSize: "0.85rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.15em" },
    sectionPadding: "5rem", contentSize: "800px", wideSize: "1250px",
    headingSizes: { h1: "clamp(3rem, 10vw, 8rem)", h2: "clamp(2rem, 6vw, 4rem)", h3: "clamp(1.5rem, 3vw, 2rem)", h4: "1.25rem" },
    designPackage: {
      headerVariant: "header-bold",
      footerVariant: "footer-dark",
      homeLayout: ["hero-video-bg", "features-checklist", "stats-counter", "cta-minimal"],
      aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"],
      servicesLayout: ["hero-image-bg", "services-icons", "pricing-table", "cta-gradient"],
      contactLayout: ["contact-form-section", "map-embed"],
    },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Lunar Minimal",
    slug: "elite-lunar-minimal-archetype",
    archetype: Archetype.PORTFOLIO,
    industryTags: ["photography", "minimalist", "art", "clean"],
    colors: {
      primary: "#000000",
      secondary: "#1a1a1a",
      accent: "#ffffff",
      background: "#fafafa",
      surface: "#f0f0f0",
      text: "#000000",
      textMuted: "#666666",
      border: "#e0e0e0",
    },
    fonts: {
      heading: "Syne",
      body: "Inter",
      headingWeight: "400",
      bodyWeight: "300",
      googleFontsUrl: buildGoogleFontsUrl("Syne", "Inter", ["400", "600"], ["300", "400"]),
    },
    borderRadius: { small: "0px", medium: "0px", large: "0px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1.2rem 3rem", fontSize: "0.8rem", fontWeight: "400", textTransform: "uppercase", letterSpacing: "0.25em" },
    sectionPadding: "10rem", contentSize: "1100px", wideSize: "1500px",
    headingSizes: { h1: "clamp(4rem, 15vw, 12rem)", h2: "clamp(3rem, 8vw, 6rem)", h3: "clamp(1.5rem, 4vw, 2.5rem)", h4: "1.125rem" },
    designPackage: {
      headerVariant: "header-transparent",
      footerVariant: "footer-minimal",
      homeLayout: ["hero-centered-minimal", "gallery-masonry", "testimonials-single", "cta-minimal"],
      aboutLayout: ["hero-centered-minimal", "stats-counter", "cta-minimal"],
      servicesLayout: ["hero-centered-minimal", "features-columns", "cta-gradient"],
      contactLayout: ["contact-form-section", "map-embed"],
    },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Industrial Monolith",
    slug: "elite-monolith-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["construction", "manufacturing", "heavy-industry"],
    colors: {
      primary: "#ff4d00", // Molten Orange
      secondary: "#1c1c1c", // Steel
      accent: "#f0f0f0", // Oxide
      background: "#0a0a0a", // Raw Iron
      surface: "#141414", // Cold Slab
      text: "#ffffff",
      textMuted: "#999999", // Slag
      border: "#1f1f1f", // Rivet
    },
    fonts: {
      heading: "Archivo",
      body: "Space Grotesk",
      headingWeight: "900",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Archivo", "Space Grotesk", ["900"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "2px", large: "4px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.1em" },
    sectionPadding: "6rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(4rem, 12vw, 9rem)", h2: "clamp(2.5rem, 7vw, 5rem)", h3: "clamp(1.5rem, 4vw, 3rem)", h4: "1.25rem" },
    designPackage: {
      headerVariant: "header-bold",
      footerVariant: "footer-dark",
      homeLayout: ["hero-video-bg", "services-grid", "stats-counter", "cta-banner"],
      aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"],
      servicesLayout: ["hero-image-bg", "services-icons", "pricing-table", "cta-gradient"],
      contactLayout: ["contact-form-section", "map-embed"],
    },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // ===========================================================================
  // ANTIGRAVITY ELITE SERIES — WAVE II (10 MASTERPIECES)
  // ===========================================================================

  {
    name: "Velvet Midnight",
    slug: "elite-velvet-midnight-archetype",
    archetype: Archetype.VENUE,
    industryTags: ["lounge", "club", "luxury", "bar"],
    colors: {
      primary: "#7b2cbf", // Royal Purple
      secondary: "#3c096c", // Deep Indigo
      accent: "#ff9100", // Vibrant Amber
      background: "#0a0908", // Black Coffee
      surface: "#100e0b", // Dark Roasted
      text: "#ffffff",
      textMuted: "#9d4edd", // Muted Lavender
      border: "#240046", // Night Shadow
    },
    fonts: {
      heading: "Syne",
      body: "Inter",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Syne", "Inter", ["800"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "12px", large: "32px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em" },
    sectionPadding: "6.5rem", contentSize: "900px", wideSize: "1400px",
    headingSizes: { h1: "clamp(3rem, 9vw, 6.5rem)", h2: "clamp(2.25rem, 6vw, 4rem)", h3: "clamp(1.5rem, 3.5vw, 2.5rem)", h4: "1.25rem" },
    designPackage: {
      headerVariant: "header-transparent",
      footerVariant: "footer-dark",
      homeLayout: ["hero-video-bg", "gallery-masonry", "testimonials-single", "cta-gradient"],
      aboutLayout: ["hero-image-bg", "stats-counter", "cta-minimal"],
      servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"],
      contactLayout: ["contact-form-section", "map-embed"],
    },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Solar Flare",
    slug: "elite-solar-flare-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["energy", "innovation", "startup", "tech"],
    colors: {
      primary: "#ff4d00", // Molten Orange
      secondary: "#ffae00", // Sun Yellow
      accent: "#ffffff",
      background: "#080808",
      surface: "#121212",
      text: "#ffffff",
      textMuted: "#a1a1aa",
      border: "#262626",
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
      headingWeight: "900",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Inter", ["900"], ["400", "500"]),
    },
    borderRadius: { small: "6px", medium: "14px", large: "28px", pill: "9999px" },
    buttonStyle: { borderRadius: "14px", padding: "0.85rem 2.25rem", fontSize: "0.95rem", fontWeight: "600", textTransform: "none", letterSpacing: "0.02em" },
    sectionPadding: "6rem", contentSize: "850px", wideSize: "1300px",
    headingSizes: { h1: "clamp(3.5rem, 10vw, 7rem)", h2: "clamp(2rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: {
      headerVariant: "header-bold",
      footerVariant: "footer-dark",
      homeLayout: ["hero-image-bg", "services-icons", "stats-counter", "cta-gradient"],
      aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"],
      servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"],
      contactLayout: ["contact-form-section", "map-embed"],
    },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Bordeaux Classic",
    slug: "elite-bordeaux-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["legal", "finance", "executive", "premium"],
    colors: {
      primary: "#600000", // Deep Bordeaux
      secondary: "#2c0000", // Burnt Merlot
      accent: "#d4af37", // Antique Gold
      background: "#fffcf9", // Cream Parchment
      surface: "#ffffff",
      text: "#1a0000", // Darkest Oak
      textMuted: "#664d4d", // Muted Clay
      border: "#e5d5d5", // Soft Dust
    },
    fonts: {
      heading: "Playfair Display",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Playfair Display", "Inter", ["700"], ["400", "600"]),
    },
    borderRadius: { small: "0px", medium: "2px", large: "4px", pill: "9999px" },
    buttonStyle: { borderRadius: "2px", padding: "0.9rem 2.5rem", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.15em" },
    sectionPadding: "7rem", contentSize: "800px", wideSize: "1250px",
    headingSizes: { h1: "clamp(3rem, 6vw, 4.5rem)", h2: "clamp(2rem, 4vw, 3rem)", h3: "clamp(1.5rem, 2.5vw, 2rem)", h4: "1.125rem" },
    designPackage: {
      headerVariant: "header",
      footerVariant: "footer-minimal",
      homeLayout: ["hero-centered-minimal", "trust-bar", "features-checklist", "cta-minimal"],
      aboutLayout: ["hero-centered-minimal", "stats-counter", "cta-minimal"],
      servicesLayout: ["hero-centered-minimal", "pricing-table", "cta-gradient"],
      contactLayout: ["contact-form-section", "map-embed"],
    },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Cyber Punk 2077",
    slug: "elite-cyberpunk-archetype",
    archetype: Archetype.PORTFOLIO,
    industryTags: ["gaming", "creative", "media", "tech"],
    colors: {
      primary: "#fcee0a", // Neon Yellow
      secondary: "#000000",
      accent: "#00f0ff", // Ice Cyan
      background: "#000000",
      surface: "#0d0d0d",
      text: "#ffffff",
      textMuted: "#666666",
      border: "#333333",
    },
    fonts: {
      heading: "Archivo",
      body: "Space Grotesk",
      headingWeight: "900",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Archivo", "Space Grotesk", ["900"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "0px", large: "0px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1rem 3rem", fontSize: "1rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.2em" },
    sectionPadding: "6rem", contentSize: "950px", wideSize: "1450px",
    headingSizes: { h1: "clamp(4rem, 15vw, 12rem)", h2: "clamp(2.5rem, 8vw, 5rem)", h3: "clamp(1.75rem, 4vw, 3rem)", h4: "1.25rem" },
    designPackage: {
      headerVariant: "header-bold",
      footerVariant: "footer-dark",
      homeLayout: ["hero-video-bg", "services-grid", "logo-cloud", "cta-banner"],
      aboutLayout: ["hero-image-bg", "stats-counter", "cta-minimal"],
      servicesLayout: ["hero-image-bg", "pricing-table", "cta-gradient"],
      contactLayout: ["contact-form-section", "map-embed"],
    },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Malibu Surf",
    slug: "elite-malibu-archetype",
    archetype: Archetype.VENUE,
    industryTags: ["hotel", "travel", "lifestyle", "nature"],
    colors: {
      primary: "#00b4d8", // Sky Blue
      secondary: "#0077b6", // Pacific Blue
      accent: "#ff9f1c", // Sunset Coral
      background: "#ffffff",
      surface: "#f0f9ff", // Ocean Foam
      text: "#03045e", // Deep Naval
      textMuted: "#0096c7", // Bright Reef
      border: "#caf0f8", // Shallow Sands
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Inter", ["400", "700"], ["400", "500", "600"]),
    },
    borderRadius: { small: "12px", medium: "24px", large: "64px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "1rem 2.5rem", fontSize: "1rem", fontWeight: "600", textTransform: "none", letterSpacing: "0.01em" },
    sectionPadding: "8rem", contentSize: "900px", wideSize: "1400px",
    headingSizes: { h1: "clamp(3.5rem, 10vw, 6rem)", h2: "clamp(2rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: {
      headerVariant: "header-transparent",
      footerVariant: "footer-centered",
      homeLayout: ["hero-image-bg", "gallery-masonry", "testimonials-carousel", "cta-split"],
      aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"],
      servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"],
      contactLayout: ["contact-form-section", "map-embed"],
    },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Concrete Jungle",
    slug: "elite-concrete-jungle-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["real-estate", "urban", "architecture", "modern"],
    colors: {
      primary: "#3f3f46", // Concrete Gray
      secondary: "#18181b", // Midnight Carbon
      accent: "#f97316", // Safety Orange
      background: "#ffffff",
      surface: "#f4f4f5", // Light Cement
      text: "#09090b", // Deep Graphite
      textMuted: "#71717a", // Muted Mortar
      border: "#e4e4e7", // Steel Lining
    },
    fonts: {
      heading: "Archivo",
      body: "Inter",
      headingWeight: "900",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Archivo", "Inter", ["400", "900"], ["400", "600"]),
    },
    borderRadius: { small: "0px", medium: "2px", large: "4px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em" },
    sectionPadding: "6rem", contentSize: "800px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3.5rem, 12vw, 8rem)", h2: "clamp(2rem, 6vw, 4rem)", h3: "clamp(1.5rem, 3vw, 2.5rem)", h4: "1.125rem" },
    designPackage: {
      headerVariant: "header-bold",
      footerVariant: "footer-4col",
      homeLayout: ["hero-asymmetric", "features-columns", "logo-cloud", "cta-banner"],
      aboutLayout: ["hero-image-bg", "stats-counter", "cta-minimal"],
      servicesLayout: ["hero-image-bg", "pricing-table", "cta-gradient"],
      contactLayout: ["contact-form-section", "map-embed"],
    },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Kyoto Zen",
    slug: "elite-kyoto-zen-archetype",
    archetype: Archetype.VENUE,
    industryTags: ["spa", "wellness", "natural", "oriental"],
    colors: {
      primary: "#283618", // Bamboo Green
      secondary: "#588157", // Moss Stone
      accent: "#dda15e", // Japanese Silk
      background: "#fefae0", // Rice Paper
      surface: "#ffffff",
      text: "#283618", // Dark Pine
      textMuted: "#606c38", // Muted Fern
      border: "#ccd5ae", // Tatami
    },
    fonts: {
      heading: "Lora",
      body: "Outfit",
      headingWeight: "600",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Lora", "Outfit", ["400", "600"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "16px", large: "48px", pill: "9999px" },
    buttonStyle: { borderRadius: "48px", padding: "0.85rem 2.5rem", fontSize: "0.95rem", fontWeight: "600", textTransform: "none", letterSpacing: "0.02em" },
    sectionPadding: "10rem", contentSize: "850px", wideSize: "1300px",
    headingSizes: { h1: "clamp(3.5rem, 10vw, 6rem)", h2: "clamp(2rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: {
      headerVariant: "header-minimal",
      footerVariant: "footer-centered",
      homeLayout: ["hero-centered-minimal", "features-checklist", "testimonials-carousel", "cta-minimal"],
      aboutLayout: ["hero-centered-minimal", "gallery-masonry", "cta-minimal"],
      servicesLayout: ["hero-centered-minimal", "pricing-table", "cta-gradient"],
      contactLayout: ["contact-form-section", "map-embed"],
    },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Champagne Toast",
    slug: "elite-champagne-archetype",
    archetype: Archetype.VENUE,
    industryTags: ["wedding", "celebration", "luxury", "events"],
    colors: {
      primary: "#d4af37", // Gold Leaf
      secondary: "#e6be8a", // Champagne
      accent: "#f4d03f", // Radiant Gold
      background: "#ffffff",
      surface: "#fffcf2", // Ivore Stone
      text: "#2b2a2a", // Charcoal Silk
      textMuted: "#8e8d8d", // Muted Taupe
      border: "#eee6d3", // Gilded Edge
    },
    fonts: {
      heading: "Playfair Display",
      body: "Outfit",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Playfair Display", "Outfit", ["400", "700"], ["400", "500", "600"]),
    },
    borderRadius: { small: "0px", medium: "4px", large: "12px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1.1rem 3rem", fontSize: "0.9rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.2em" },
    sectionPadding: "7rem", contentSize: "900px", wideSize: "1400px",
    headingSizes: { h1: "clamp(3rem, 8vw, 6rem)", h2: "clamp(2rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: {
      headerVariant: "header-transparent",
      footerVariant: "footer-centered",
      homeLayout: ["hero-centered-minimal", "logo-cloud", "testimonials-single", "cta-minimal"],
      aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"],
      servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"],
      contactLayout: ["contact-form-section", "map-embed"],
    },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Midnight Racing",
    slug: "elite-midnight-racing-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["automotive", "luxury", "racing", "high-end"],
    colors: {
      primary: "#1e1b4b", // Deep Indigo
      secondary: "#312e81", // Indigo 800
      accent: "#38bdf8", // Sky Blue
      background: "#020617", // Black Hole Blue
      surface: "#0f172a", // Dark Slate
      text: "#ffffff",
      textMuted: "#94a3b8", // Muted Star Blue
      border: "#1e293b", // Deep Space border
    },
    fonts: {
      heading: "Syne",
      body: "Inter",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Syne", "Inter", ["400", "800"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "8px", large: "16px", pill: "9999px" },
    buttonStyle: { borderRadius: "8px", padding: "0.95rem 2.5rem", fontSize: "0.95rem", fontWeight: "800", textTransform: "none", letterSpacing: "0.05em" },
    sectionPadding: "6rem", contentSize: "800px", wideSize: "1200px",
    headingSizes: { h1: "clamp(3rem, 10vw, 7rem)", h2: "clamp(2rem, 6vw, 4rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: {
      headerVariant: "header-bold",
      footerVariant: "footer-dark",
      homeLayout: ["hero-video-bg", "features-columns", "stats-counter", "cta-gradient"],
      aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"],
      servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"],
      contactLayout: ["contact-form-section", "map-embed"],
    },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Astra Nova",
    slug: "elite-astra-nova-archetype",
    archetype: Archetype.PORTFOLIO,
    industryTags: ["space", "science", "creative", "media"],
    colors: {
      primary: "#9d4edd", // Space Purple
      secondary: "#5a189a", // Deep Violet
      accent: "#ff0054", // Nova Pink
      background: "#000000",
      surface: "#0b0b0d",
      text: "#ffffff",
      textMuted: "#c19ee0", // Muted Nebula
      border: "#240046", // Gravity Void
    },
    fonts: {
      heading: "Space Grotesk",
      body: "Roboto",
      headingWeight: "700",
      bodyWeight: "300",
      googleFontsUrl: buildGoogleFontsUrl("Space Grotesk", "Roboto", ["400", "700"], ["300", "400"]),
    },
    borderRadius: { small: "8px", medium: "24px", large: "48px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.85rem 2.5rem", fontSize: "1rem", fontWeight: "600", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "10rem", contentSize: "1000px", wideSize: "1500px",
    headingSizes: { h1: "clamp(3.5rem, 15vw, 10rem)", h2: "clamp(2.5rem, 7vw, 5rem)", h3: "clamp(1.5rem, 4vw, 3rem)", h4: "1.125rem" },
    designPackage: {
      headerVariant: "header-transparent",
      footerVariant: "footer-dark",
      homeLayout: ["hero-video-bg", "gallery-masonry", "testimonials-single", "cta-minimal"],
      aboutLayout: ["hero-centered-minimal", "stats-counter", "cta-minimal"],
      servicesLayout: ["hero-centered-minimal", "pricing-table", "cta-gradient"],
      contactLayout: ["contact-form-section", "map-embed"],
    },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // ===========================================================================
  // ELECTRICAL & POWER ELITE SERIES (10 THEMES)
  // ===========================================================================

  {
    name: "Voltage Neon Dark",
    slug: "elec-voltage-neon-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["electrical", "electrician", "power", "modern"],
    colors: {
      primary: "#facc15", // Electric Yellow
      secondary: "#1e1b4b", // Midnight Indigo
      accent: "#fef08a", // Soft Glow
      background: "#020617",
      surface: "#0f172a",
      text: "#ffffff",
      textMuted: "#94a3b8",
      border: "#1e293b",
    },
    fonts: {
      heading: "Space Grotesk",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Space Grotesk", "Inter", ["400", "700"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "4px", large: "12px", pill: "9999px" },
    buttonStyle: { borderRadius: "4px", padding: "0.9rem 2.5rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em" },
    sectionPadding: "6rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3rem, 10vw, 7rem)", h2: "clamp(2rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-dark", homeLayout: ["hero-video-bg", "services-grid", "stats-counter", "cta-gradient"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Industrial Grid Power",
    slug: "elec-industrial-grid-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["electrical", "industrial", "commercial", "strong"],
    colors: {
      primary: "#ea580c", // Safety Orange
      secondary: "#1c1917", // Stone 900
      accent: "#ffffff",
      background: "#f5f5f4", // Stone 100
      surface: "#ffffff",
      text: "#1c1917",
      textMuted: "#57534e",
      border: "#d6d3d1",
    },
    fonts: {
      heading: "Archivo",
      body: "Roboto",
      headingWeight: "900",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Archivo", "Roboto", ["400", "900"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "2px", large: "4px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.15em" },
    sectionPadding: "5rem", contentSize: "800px", wideSize: "1250px",
    headingSizes: { h1: "clamp(3.5rem, 12vw, 9.5rem)", h2: "clamp(2.5rem, 7vw, 4.5rem)", h3: "clamp(1.75rem, 4vw, 2.75rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-4col", homeLayout: ["hero-image-bg", "features-checklist", "stats-counter", "cta-banner"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-icons", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Eco Volt Solar",
    slug: "elec-eco-volt-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["solar", "energy", "sustainable", "clean"],
    colors: {
      primary: "#10b981", // Emerald 500
      secondary: "#064e3b", // Emerald 900
      accent: "#fbbf24", // Amber Sun
      background: "#ffffff",
      surface: "#f0fdf4",
      text: "#064e3b",
      textMuted: "#10b981",
      border: "#d1fae5",
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Inter", ["400", "800"], ["400", "500"]),
    },
    borderRadius: { small: "12px", medium: "24px", large: "48px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "1rem 2.5rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "none", letterSpacing: "0.01em" },
    sectionPadding: "6.5rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3.5rem, 10vw, 6.5rem)", h2: "clamp(2.25rem, 6vw, 4rem)", h3: "clamp(1.5rem, 3.5vw, 2.5rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-centered", homeLayout: ["hero-image-bg", "features-columns", "testimonials-carousel", "cta-split"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Classic Circuit Board",
    slug: "elec-classic-circuit-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["electrical", "residential", "classic", "trusted"],
    colors: {
      primary: "#1d4ed8", // Classic Blue
      secondary: "#1e1b4b", // Naval
      accent: "#facc15", // Flash Yellow
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#1e1b4b",
      textMuted: "#4b5563",
      border: "#e2e8f0",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      headingWeight: "900",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Inter", "Inter", ["400", "900"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "8px", large: "12px", pill: "9999px" },
    buttonStyle: { borderRadius: "4px", padding: "0.9rem 2.25rem", fontSize: "0.95rem", fontWeight: "800", textTransform: "none", letterSpacing: "0.02em" },
    sectionPadding: "5rem", contentSize: "800px", wideSize: "1250px",
    headingSizes: { h1: "clamp(2.75rem, 6vw, 4.5rem)", h2: "clamp(2rem, 4vw, 3rem)", h3: "clamp(1.5rem, 2.5vw, 1.75rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header", footerVariant: "footer-4col", homeLayout: ["hero-image-bg", "services-icons", "stats-counter", "cta-split"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Titan Power Heavy",
    slug: "elec-titan-power-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["heavy-industrial", "electrical", "high-voltage", "strong"],
    colors: {
      primary: "#dc2626", // Danger Red
      secondary: "#171717", // Neutral 900
      accent: "#ffffff",
      background: "#0a0a0a",
      surface: "#171717",
      text: "#ffffff",
      textMuted: "#737373",
      border: "#262626",
    },
    fonts: {
      heading: "Archivo",
      body: "Roboto Mono",
      headingWeight: "900",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Archivo", "Roboto Mono", ["400", "900"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "0px", large: "0px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1rem 3rem", fontSize: "1rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.2em" },
    sectionPadding: "6rem", contentSize: "800px", wideSize: "1400px",
    headingSizes: { h1: "clamp(4rem, 15vw, 10rem)", h2: "clamp(2.5rem, 8vw, 5.5rem)", h3: "clamp(1.75rem, 4vw, 3rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-dark", homeLayout: ["hero-video-bg", "features-checklist", "stats-counter", "cta-banner"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-icons", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Cyber Pulse Electric",
    slug: "elec-cyber-pulse-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["electrical", "innovation", "tech", "modern"],
    colors: {
      primary: "#a855f7", // Purple 500
      secondary: "#3b0764", // Purple 950
      accent: "#f472b6", // Pink 400
      background: "#000000",
      surface: "#0f0f12",
      text: "#ffffff",
      textMuted: "#a1a1aa",
      border: "#27272a",
    },
    fonts: {
      heading: "Syne",
      body: "Space Grotesk",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Syne", "Space Grotesk", ["400", "800"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "12px", large: "24px", pill: "9999px" },
    buttonStyle: { borderRadius: "12px", padding: "0.85rem 2.5rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "none", letterSpacing: "0.05em" },
    sectionPadding: "6.5rem", contentSize: "900px", wideSize: "1400px",
    headingSizes: { h1: "clamp(3.5rem, 12vw, 8rem)", h2: "clamp(2.25rem, 8vw, 4.5rem)", h3: "clamp(1.5rem, 4vw, 2.75rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-dark", homeLayout: ["hero-video-bg", "services-grid", "testimonials-carousel", "cta-gradient"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Copper Wire Luxe",
    slug: "elec-copper-wire-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["electrical", "luxury", "residential", "modern"],
    colors: {
      primary: "#b45309", // Copper
      secondary: "#450a0a", // Deep Brown
      accent: "#fde68a", // Gold Flush
      background: "#ffffff",
      surface: "#fefaf3", // Warm Cream
      text: "#451a03",
      textMuted: "#92400e",
      border: "#fde68a",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Outfit",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Playfair Display", "Outfit", ["400", "700"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "4px", large: "12px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1.1rem 3rem", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.2em" },
    sectionPadding: "7rem", contentSize: "850px", wideSize: "1450px",
    headingSizes: { h1: "clamp(3rem, 8vw, 6rem)", h2: "clamp(2rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-centered", homeLayout: ["hero-centered-minimal", "gallery-masonry", "testimonials-single", "cta-minimal"], aboutLayout: ["hero-image-bg", "stats-counter", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Pure Current Master",
    slug: "elec-pure-current-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["electrical", "service", "clean", "trusted"],
    colors: {
      primary: "#3b82f6", // Electric Blue
      secondary: "#1e3a8a", // Deep Naval
      accent: "#ffffff",
      background: "#ffffff",
      surface: "#f0f9ff",
      text: "#1e3a8a",
      textMuted: "#60a5fa",
      border: "#dbeafe",
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Inter", ["400", "800"], ["400", "500"]),
    },
    borderRadius: { small: "6px", medium: "12px", large: "24px", pill: "9999px" },
    buttonStyle: { borderRadius: "12px", padding: "0.9rem 2.5rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "5rem", contentSize: "800px", wideSize: "1250px",
    headingSizes: { h1: "clamp(2.75rem, 7vw, 4.5rem)", h2: "clamp(1.9rem, 4vw, 2.75rem)", h3: "clamp(1.25rem, 2.5vw, 1.75rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header", footerVariant: "footer-4col", homeLayout: ["hero-image-bg", "services-icons", "trust-bar", "cta-split"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Amped Up Modern",
    slug: "elec-amped-up-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["electrical", "electrician", "dynamic", "young"],
    colors: {
      primary: "#f97316", // Orange 500
      secondary: "#27272a", // Zinc 800
      accent: "#fde047", // Yellow 300
      background: "#ffffff",
      surface: "#fff7ed", // Orange 50
      text: "#18181b",
      textMuted: "#ea580c",
      border: "#fed7aa",
    },
    fonts: {
      heading: "Archivo",
      body: "Inter",
      headingWeight: "900",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Archivo", "Inter", ["400", "900"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "8px", large: "32px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.95rem 2.5rem", fontSize: "0.95rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em" },
    sectionPadding: "6rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3.5rem, 10vw, 7rem)", h2: "clamp(2rem, 6vw, 4rem)", h3: "clamp(1.5rem, 3.5vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-4col", homeLayout: ["hero-asymmetric", "services-grid", "testimonials-carousel", "cta-banner"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Grid Master Industrial",
    slug: "elec-grid-master-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["electrical", "industrial", "maintenance", "strong"],
    colors: {
      primary: "#4b5563", // Gray 600
      secondary: "#111827", // Gray 900
      accent: "#eab308", // Yellow 500
      background: "#111827",
      surface: "#1f2937",
      text: "#ffffff",
      textMuted: "#9ca3af",
      border: "#374151",
    },
    fonts: {
      heading: "Archivo",
      body: "JetBrains Mono",
      headingWeight: "900",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Archivo", "JetBrains Mono", ["400", "900"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "2px", large: "4px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.15em" },
    sectionPadding: "6rem", contentSize: "800px", wideSize: "1350px",
    headingSizes: { h1: "clamp(4rem, 12vw, 9rem)", h2: "clamp(2.5rem, 7vw, 4.5rem)", h3: "clamp(1.75rem, 4vw, 2.75rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-dark", homeLayout: ["hero-video-bg", "features-checklist", "stats-counter", "cta-banner"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-icons", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // ===========================================================================
  // LANDSCAPING & OUTDOOR ELITE SERIES (10 THEMES)
  // ===========================================================================

  {
    name: "Emerald Lawn Luxe",
    slug: "land-emerald-lawn-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["landscaping", "garden", "lawn", "premium"],
    colors: {
      primary: "#15803d", // Emerald 700
      secondary: "#14532d", // Emerald 900
      accent: "#facc15", // Sun Yellow
      background: "#ffffff",
      surface: "#f0fdf4", // Emerald 50
      text: "#14532d",
      textMuted: "#16a34a",
      border: "#bcf0bc",
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Inter", ["400", "800"], ["400", "500"]),
    },
    borderRadius: { small: "8px", medium: "16px", large: "32px", pill: "9999px" },
    buttonStyle: { borderRadius: "12px", padding: "0.9rem 2.5rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "none", letterSpacing: "0.01em" },
    sectionPadding: "6rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3.5rem, 10vw, 6rem)", h2: "clamp(2.25rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3.5vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header", footerVariant: "footer-4col", homeLayout: ["hero-image-bg", "services-icons", "stats-counter", "cta-split"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Modern Stone & Leaf",
    slug: "land-stone-leaf-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["landscaping", "hardscape", "architecture", "modern"],
    colors: {
      primary: "#3f3f46", // Stone 600
      secondary: "#18181b", // Stone 900
      accent: "#a3e635", // Lime 400
      background: "#ffffff",
      surface: "#f4f4f5", // Stone 50
      text: "#09090b",
      textMuted: "#71717a",
      border: "#e4e4e7",
    },
    fonts: {
      heading: "Archivo",
      body: "Inter",
      headingWeight: "900",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Archivo", "Inter", ["400", "900"], ["400", "600"]),
    },
    borderRadius: { small: "0px", medium: "4px", large: "12px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em" },
    sectionPadding: "6rem", contentSize: "800px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3.5rem, 12vw, 8rem)", h2: "clamp(2.25rem, 6vw, 4rem)", h3: "clamp(1.5rem, 3vw, 2.5rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-4col", homeLayout: ["hero-asymmetric", "features-columns", "logo-cloud", "cta-banner"], aboutLayout: ["hero-image-bg", "stats-counter", "cta-minimal"], servicesLayout: ["hero-image-bg", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Zen Garden Retreat",
    slug: "land-zen-garden-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["landscaping", "japanese-garden", "spa", "peaceful"],
    colors: {
      primary: "#3d5a80", // Slate Blue
      secondary: "#293241", // Deep Naval
      accent: "#ee6c4d", // Burnt Orange
      background: "#ffffff",
      surface: "#e0fbfc", // Ice wash
      text: "#293241",
      textMuted: "#3d5a80",
      border: "#98c1d9",
    },
    fonts: {
      heading: "Lora",
      body: "Outfit",
      headingWeight: "600",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Lora", "Outfit", ["400", "600"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "24px", large: "64px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.9rem 2.5rem", fontSize: "1rem", fontWeight: "600", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "8rem", contentSize: "850px", wideSize: "1400px",
    headingSizes: { h1: "clamp(3.5rem, 10vw, 6.5rem)", h2: "clamp(2.25rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-centered", homeLayout: ["hero-centered-minimal", "gallery-masonry", "testimonials-single", "cta-minimal"], aboutLayout: ["hero-centered-minimal", "stats-counter", "cta-minimal"], servicesLayout: ["hero-centered-minimal", "features-columns", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Organic Roots Green",
    slug: "land-organic-roots-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["landscaping", "organic", "native-plants", "eco"],
    colors: {
      primary: "#4d7c0f", // Lime 700
      secondary: "#365314", // Lime 900
      accent: "#f7fee7", // Lime 50
      background: "#ffffff",
      surface: "#ecfccb", // Lime 100
      text: "#365314",
      textMuted: "#65a30d", // Lime 600
      border: "#bef264", // Lime 300
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Inter", ["400", "800"], ["400", "500"]),
    },
    borderRadius: { small: "8px", medium: "20px", large: "40px", pill: "9999px" },
    buttonStyle: { borderRadius: "12px", padding: "0.95rem 2.5rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "none", letterSpacing: "0.01em" },
    sectionPadding: "6rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3rem, 10vw, 6rem)", h2: "clamp(2rem, 6vw, 3.5rem)", h3: "clamp(1.5rem, 3.5vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header", footerVariant: "footer-4col", homeLayout: ["hero-image-bg", "services-icons", "stats-counter", "cta-split"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Tuscan Garden Estate",
    slug: "land-tuscan-garden-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["landscape", "luxury", "estate", "mediterranean"],
    colors: {
      primary: "#6b705c", // Moss
      secondary: "#3f4238", // Dark Moss
      accent: "#b7b7a4", // Sage
      background: "#ffffff",
      surface: "#f0ead2", // Warm Paper
      text: "#3f4238",
      textMuted: "#6b705c",
      border: "#a5a58d",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Lora",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Playfair Display", "Lora", ["400", "700"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "2px", large: "4px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1.1rem 3rem", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.2em" },
    sectionPadding: "7rem", contentSize: "900px", wideSize: "1450px",
    headingSizes: { h1: "clamp(3.5rem, 8vw, 6rem)", h2: "clamp(2.25rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-centered", homeLayout: ["hero-image-bg", "gallery-masonry", "testimonials-single", "cta-minimal"], aboutLayout: ["hero-centered-minimal", "stats-counter", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Wildflower Meadows",
    slug: "land-wildflower-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["landscaping", "creative", "floral", "natural"],
    colors: {
      primary: "#9333ea", // Purple 600
      secondary: "#581c87", // Purple 900
      accent: "#facc15", // Sun Yellow
      background: "#ffffff",
      surface: "#faf5ff", // Purple 50
      text: "#581c87",
      textMuted: "#a855f7", // Purple 500
      border: "#e9d5ff", // Purple 200
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Inter", ["400", "800"], ["400", "500"]),
    },
    borderRadius: { small: "12px", medium: "24px", large: "48px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.95rem 2.5rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "6rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3.5rem, 10vw, 6.5rem)", h2: "clamp(2.25rem, 6vw, 4rem)", h3: "clamp(1.5rem, 3.5vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header", footerVariant: "footer-centered", homeLayout: ["hero-image-bg", "services-icons", "testimonials-carousel", "cta-split"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Desert Oasis Luxe",
    slug: "land-desert-oasis-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["xeriscape", "desert", "luxury", "landscape"],
    colors: {
      primary: "#cc7d3b", // Ochre
      secondary: "#5e503f", // Deep Earth
      accent: "#76c893", // Cactus Green
      background: "#ffffff",
      surface: "#f4f1de", // Soft Parchment
      text: "#5e503f",
      textMuted: "#cc7d3b",
      border: "#e07a5f",
    },
    fonts: {
      heading: "Syne",
      body: "Outfit",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Syne", "Outfit", ["400", "800"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "12px", large: "32px", pill: "9999px" },
    buttonStyle: { borderRadius: "4px", padding: "1rem 2.5rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em" },
    sectionPadding: "7rem", contentSize: "850px", wideSize: "1400px",
    headingSizes: { h1: "clamp(3.5rem, 10vw, 7rem)", h2: "clamp(2.25rem, 6vw, 4rem)", h3: "clamp(1.5rem, 4vw, 2.5rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-dark", homeLayout: ["hero-video-bg", "gallery-masonry", "testimonials-single", "cta-gradient"], aboutLayout: ["hero-image-bg", "stats-counter", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Evergreen Forest Way",
    slug: "land-evergreen-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["landscape", "forest", "native", "strong"],
    colors: {
      primary: "#2d6a4f", // Deep Green
      secondary: "#081c15", // Darkest Green
      accent: "#d8f3dc", // Mint wash
      background: "#ffffff",
      surface: "#f8faf8",
      text: "#1b4332",
      textMuted: "#40916c",
      border: "#b7e4c7",
    },
    fonts: {
      heading: "Archivo",
      body: "Inter",
      headingWeight: "900",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Archivo", "Inter", ["400", "900"], ["400", "600"]),
    },
    borderRadius: { small: "0px", medium: "4px", large: "8px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.1em" },
    sectionPadding: "6rem", contentSize: "800px", wideSize: "1300px",
    headingSizes: { h1: "clamp(3.5rem, 12vw, 9rem)", h2: "clamp(2.5rem, 7vw, 4.5rem)", h3: "clamp(1.75rem, 4vw, 2.75rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-dark", homeLayout: ["hero-image-bg", "features-checklist", "stats-counter", "cta-banner"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-icons", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Pacific Modern Scape",
    slug: "land-pacific-modern-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["landscape", "modern", "pacific-northwest", "minimal"],
    colors: {
      primary: "#457b9d", // Steel Blue
      secondary: "#1d3557", // Deep Naval
      accent: "#a8dadc", // Ice wash
      background: "#ffffff",
      surface: "#f1faee", // Mint wash
      text: "#1d3557",
      textMuted: "#457b9d",
      border: "#a8dadc",
    },
    fonts: {
      heading: "Space Grotesk",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Space Grotesk", "Inter", ["400", "700"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "12px", large: "24px", pill: "9999px" },
    buttonStyle: { borderRadius: "12px", padding: "0.85rem 2.25rem", fontSize: "0.95rem", fontWeight: "600", textTransform: "none", letterSpacing: "0.02em" },
    sectionPadding: "6rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3.5rem, 10vw, 7rem)", h2: "clamp(2rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-dark", homeLayout: ["hero-image-bg", "services-grid", "stats-counter", "cta-gradient"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Azure Coast Gardens",
    slug: "land-azure-coast-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["landscape", "coastal", "luxury", "lifestyle"],
    colors: {
      primary: "#00b4d8", // Sky
      secondary: "#0077b6", // Deep Sky
      accent: "#fbd38d", // Golden Sands
      background: "#ffffff",
      surface: "#f0f9ff", // Sky wash
      text: "#03045e", // Naval
      textMuted: "#00b4d8",
      border: "#caf0f8",
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Inter", ["400", "700"], ["400", "500"]),
    },
    borderRadius: { small: "8px", medium: "24px", large: "64px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "1rem 2.5rem", fontSize: "1rem", fontWeight: "600", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "7rem", contentSize: "900px", wideSize: "1400px",
    headingSizes: { h1: "clamp(3.5rem, 9vw, 6.5rem)", h2: "clamp(2.25rem, 6vw, 4rem)", h3: "clamp(1.5rem, 3.5vw, 2.5rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-centered", homeLayout: ["hero-image-bg", "gallery-masonry", "testimonials-single", "cta-minimal"], aboutLayout: ["hero-image-bg", "stats-counter", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },

  // ===========================================================================
  // CLEANING & JANITORIAL ELITE SERIES (10 THEMES)
  // ===========================================================================

  {
    name: "Pure Clean Mint",
    slug: "clean-pure-mint-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["cleaning", "janitorial", "maid", "clean"],
    colors: {
      primary: "#06b6d4", // Clean Cyan
      secondary: "#083344", // Deep Naval
      accent: "#ecfeff", // Ice Wash
      background: "#ffffff",
      surface: "#f0fdfa", // Mint wash
      text: "#083344",
      textMuted: "#0891b2",
      border: "#cffafe",
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Inter", ["400", "800"], ["400", "500"]),
    },
    borderRadius: { small: "8px", medium: "16px", large: "32px", pill: "9999px" },
    buttonStyle: { borderRadius: "12px", padding: "0.9rem 2.5rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "none", letterSpacing: "0.01em" },
    sectionPadding: "6rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3.5rem, 10vw, 6rem)", h2: "clamp(2.25rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3.5vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header", footerVariant: "footer-4col", homeLayout: ["hero-image-bg", "services-icons", "stats-counter", "cta-split"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Pristine White Janitorial",
    slug: "clean-pristine-white-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["janitorial", "commercial-cleaning", "sterile", "strong"],
    colors: {
      primary: "#3b82f6", // Royal Blue
      secondary: "#1d4ed8", // Deep Blue
      accent: "#ffffff",
      background: "#f8fafc", // Sterile Gray
      surface: "#ffffff",
      text: "#0f172a",
      textMuted: "#64748b",
      border: "#e2e8f0",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      headingWeight: "900",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Inter", "Inter", ["400", "900"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "4px", large: "8px", pill: "9999px" },
    buttonStyle: { borderRadius: "4px", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em" },
    sectionPadding: "5rem", contentSize: "800px", wideSize: "1250px",
    headingSizes: { h1: "clamp(3rem, 10vw, 7.5rem)", h2: "clamp(2rem, 6vw, 4rem)", h3: "clamp(1.5rem, 4vw, 2.5rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-4col", homeLayout: ["hero-image-bg", "features-checklist", "stats-counter", "cta-banner"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-icons", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Eco Scrub Green",
    slug: "clean-eco-scrub-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["cleaning", "eco-friendly", "sustainable", "clean"],
    colors: {
      primary: "#10b981", // Emerald 500
      secondary: "#064e3b", // Emerald 900
      accent: "#d1fae5", // Emerald 100
      background: "#ffffff",
      surface: "#f0fdf4",
      text: "#064e3b",
      textMuted: "#10b981",
      border: "#d1fae5",
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Inter", ["400", "800"], ["400", "500"]),
    },
    borderRadius: { small: "12px", medium: "24px", large: "48px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "1rem 2.5rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "none", letterSpacing: "0.01em" },
    sectionPadding: "6.5rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3.5rem, 10vw, 6.5rem)", h2: "clamp(2.25rem, 6vw, 4rem)", h3: "clamp(1.5rem, 3.5vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-centered", homeLayout: ["hero-image-bg", "features-columns", "testimonials-carousel", "cta-split"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Sparkle & Shine Modern",
    slug: "clean-sparkle-shine-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["cleaning", "residential", "modern", "dynamic"],
    colors: {
      primary: "#f43f5e", // Rose 500
      secondary: "#881337", // Rose 900
      accent: "#fff1f2", // Rose 50
      background: "#ffffff",
      surface: "#fff1f2",
      text: "#4c0519",
      textMuted: "#fb7185",
      border: "#fecdd3",
    },
    fonts: {
      heading: "Space Grotesk",
      body: "Inter",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Space Grotesk", "Inter", ["400", "700"], ["400", "500"]),
    },
    borderRadius: { small: "6px", medium: "12px", large: "24px", pill: "9999px" },
    buttonStyle: { borderRadius: "12px", padding: "0.85rem 2.25rem", fontSize: "0.95rem", fontWeight: "600", textTransform: "none", letterSpacing: "0.02em" },
    sectionPadding: "6.5rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3rem, 8vw, 6.5rem)", h2: "clamp(2.25rem, 6vw, 4rem)", h3: "clamp(1.5rem, 3.5vw, 2.5rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-dark", homeLayout: ["hero-video-bg", "services-grid", "testimonials-carousel", "cta-gradient"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Industrial Scrub Master",
    slug: "clean-industrial-scrub-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["commercial-cleaning", "industrial", "janitorial", "strong"],
    colors: {
      primary: "#4b5563", // Gray 600
      secondary: "#111827", // Gray 900
      accent: "#eab308", // Yellow 500
      background: "#f1f5f9",
      surface: "#ffffff",
      text: "#111827",
      textMuted: "#6b7280",
      border: "#e2e8f0",
    },
    fonts: {
      heading: "Archivo",
      body: "Roboto",
      headingWeight: "900",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Archivo", "Roboto", ["400", "900"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "2px", large: "4px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.15em" },
    sectionPadding: "5rem", contentSize: "800px", wideSize: "1250px",
    headingSizes: { h1: "clamp(3.5rem, 12vw, 9.5rem)", h2: "clamp(2.5rem, 7vw, 5rem)", h3: "clamp(1.75rem, 4vw, 2.75rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-4col", homeLayout: ["hero-image-bg", "features-checklist", "stats-counter", "cta-banner"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-icons", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Luxury Maid Velvet",
    slug: "clean-luxury-maid-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["cleaning", "luxury", "maid", "premium"],
    colors: {
      primary: "#4f46e5", // Indigo 600
      secondary: "#312e81", // Indigo 900
      accent: "#e0e7ff", // Indigo 100
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#1e1b4b",
      textMuted: "#6366f1",
      border: "#e2e8f0",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Outfit",
      headingWeight: "700",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Playfair Display", "Outfit", ["400", "700"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "4px", large: "12px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1.1rem 3rem", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.2em" },
    sectionPadding: "7rem", contentSize: "850px", wideSize: "1450px",
    headingSizes: { h1: "clamp(3rem, 8vw, 6rem)", h2: "clamp(2rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-centered", homeLayout: ["hero-centered-minimal", "gallery-masonry", "testimonials-single", "cta-minimal"], aboutLayout: ["hero-image-bg", "stats-counter", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Arctic Frost Cleaning",
    slug: "clean-arctic-frost-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["cleaning", "janitorial", "sterile", "modern"],
    colors: {
      primary: "#38bdf8", // Sky 400
      secondary: "#0c4a6e", // Deep Naval
      accent: "#f0f9ff", // Sky 50
      background: "#ffffff",
      surface: "#f0f9ff",
      text: "#0c4a6e",
      textMuted: "#0ea5e9",
      border: "#bae6fd",
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
      headingWeight: "800",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Outfit", "Inter", ["400", "800"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "12px", large: "24px", pill: "9999px" },
    buttonStyle: { borderRadius: "12px", padding: "0.9rem 2.5rem", fontSize: "0.95rem", fontWeight: "700", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "6rem", contentSize: "850px", wideSize: "1350px",
    headingSizes: { h1: "clamp(3rem, 10vw, 6.5rem)", h2: "clamp(2.25rem, 6vw, 4rem)", h3: "clamp(1.5rem, 3.5vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-dark", homeLayout: ["hero-image-bg", "services-icons", "stats-counter", "cta-gradient"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Golden Glow Housekeepers",
    slug: "clean-golden-glow-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["cleaning", "housekeeping", "maid", "trusted"],
    colors: {
      primary: "#d97706", // Amber 600
      secondary: "#78350f", // Dark Amber
      accent: "#fef3c7", // Amber 100
      background: "#ffffff",
      surface: "#fffaf0", // Warm Glow
      text: "#451a03",
      textMuted: "#b45309",
      border: "#fde68a",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      headingWeight: "900",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Inter", "Inter", ["400", "900"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "8px", large: "16px", pill: "9999px" },
    buttonStyle: { borderRadius: "4px", padding: "0.9rem 2.25rem", fontSize: "0.95rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em" },
    sectionPadding: "5rem", contentSize: "800px", wideSize: "1250px",
    headingSizes: { h1: "clamp(2.75rem, 7vw, 4.5rem)", h2: "clamp(1.9rem, 4.5vw, 2.75rem)", h3: "clamp(1.25rem, 2.5vw, 1.75rem)", h4: "1.125rem" },
    designPackage: { headerVariant: "header", footerVariant: "footer-4col", homeLayout: ["hero-image-bg", "services-icons", "trust-bar", "cta-split"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-grid", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Deep Clean Carbon",
    slug: "clean-deep-carbon-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["commercial-cleaning", "heavy-duty", "industrial", "strong"],
    colors: {
      primary: "#18181b", // Zinc 900
      secondary: "#09090b", // Deep Black
      accent: "#f43f5e", // Rose Highlight
      background: "#0a0a0a",
      surface: "#18181b",
      text: "#ffffff",
      textMuted: "#a1a1aa",
      border: "#27272a",
    },
    fonts: {
      heading: "Archivo",
      body: "JetBrains Mono",
      headingWeight: "900",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Archivo", "JetBrains Mono", ["400", "900"], ["400", "500"]),
    },
    borderRadius: { small: "0px", medium: "0px", large: "0px", pill: "9999px" },
    buttonStyle: { borderRadius: "0px", padding: "1rem 3rem", fontSize: "1rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.2em" },
    sectionPadding: "6rem", contentSize: "800px", wideSize: "1350px",
    headingSizes: { h1: "clamp(4rem, 12vw, 9rem)", h2: "clamp(2.5rem, 7vw, 4.5rem)", h3: "clamp(1.75rem, 4vw, 2.75rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-bold", footerVariant: "footer-dark", homeLayout: ["hero-video-bg", "features-checklist", "stats-counter", "cta-banner"], aboutLayout: ["hero-image-bg", "team-grid", "cta-minimal"], servicesLayout: ["hero-image-bg", "services-icons", "pricing-table", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  {
    name: "Zen Maid Minimal",
    slug: "clean-zen-maid-archetype",
    archetype: Archetype.SERVICE,
    industryTags: ["cleaning", "minimalist", "maid", "peaceful"],
    colors: {
      primary: "#3d5a80", // Slate Blue
      secondary: "#293241", // Deep Naval
      accent: "#e0fbfc", // Ice wash
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#293241",
      textMuted: "#3d5a80",
      border: "#98c1d9",
    },
    fonts: {
      heading: "Lora",
      body: "Outfit",
      headingWeight: "600",
      bodyWeight: "400",
      googleFontsUrl: buildGoogleFontsUrl("Lora", "Outfit", ["400", "600"], ["400", "500"]),
    },
    borderRadius: { small: "4px", medium: "24px", large: "64px", pill: "9999px" },
    buttonStyle: { borderRadius: "9999px", padding: "0.9rem 2.5rem", fontSize: "1rem", fontWeight: "600", textTransform: "none", letterSpacing: "0" },
    sectionPadding: "8rem", contentSize: "850px", wideSize: "1400px",
    headingSizes: { h1: "clamp(3.5rem, 10vw, 6.5rem)", h2: "clamp(2.25rem, 5vw, 3.5rem)", h3: "clamp(1.5rem, 3vw, 2.25rem)", h4: "1.25rem" },
    designPackage: { headerVariant: "header-transparent", footerVariant: "footer-centered", homeLayout: ["hero-centered-minimal", "gallery-masonry", "testimonials-single", "cta-minimal"], aboutLayout: ["hero-centered-minimal", "stats-counter", "cta-minimal"], servicesLayout: ["hero-centered-minimal", "features-columns", "cta-gradient"], contactLayout: ["contact-form-section", "map-embed"] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: "active", createdBy: null,
  },
  // ===========================================================================
  // CODEX 20 NEW THEMES (WITH PREMIUM ENHANCEMENTS)
  // ===========================================================================

  // 1. Clean Slate (SERVICE)
  {
    name: 'Clean Slate', slug: 'clean-slate-service', archetype: 'SERVICE',
    industryTags: ['consulting', 'cleaning', 'professional'],
    colors: { primary: '#18181b', secondary: '#27272a', accent: '#3b82f6', background: '#ffffff', surface: '#f4f4f5', text: '#09090b', textMuted: '#71717a', border: '#e4e4e7' },
    fonts: { heading: 'Syne', body: 'Inter', headingWeight: '700', bodyWeight: '400', googleFontsUrl: buildGoogleFontsUrl('Syne', 'Inter', ['400','600','700'], ['400','500']) },
    borderRadius: { small: '8px', medium: '16px', large: '24px', pill: '9999px' },
    buttonStyle: { borderRadius: '24px', padding: '0.875rem 2.25rem', fontSize: '0.95rem', fontWeight: '600', textTransform: 'none', letterSpacing: '0.01em' },
    sectionPadding: '5rem', contentSize: '900px', wideSize: '1350px',
    headingSizes: { h1: 'clamp(3rem, 7vw, 4.5rem)', h2: 'clamp(2rem, 5vw, 3.5rem)', h3: 'clamp(1.5rem, 3vw, 2.5rem)', h4: '1.25rem' },
    designPackage: { headerVariant: 'header-minimal', footerVariant: 'footer-minimal', homeLayout: ['hero-centered-minimal', 'features-columns', 'testimonials-cards', 'cta-gradient'], aboutLayout: ['hero-image-bg', 'team-grid', 'stats-counter', 'cta-minimal'], servicesLayout: ['hero-image-bg', 'services-alternating', 'pricing-table', 'cta-gradient'], contactLayout: ['contact-form-section', 'map-embed'] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: 'active', createdBy: null,
  },
  // 2. Bold Impact (SERVICE)
  {
    name: 'Bold Impact', slug: 'bold-impact-service', archetype: 'SERVICE',
    industryTags: ['marketing', 'fitness', 'agency'],
    colors: { primary: '#0f172a', secondary: '#1e293b', accent: '#f59e0b', background: '#020617', surface: '#0f172a', text: '#f8fafc', textMuted: '#94a3b8', border: '#334155' },
    fonts: { heading: 'Playfair Display', body: 'Libre Franklin', headingWeight: '800', bodyWeight: '400', googleFontsUrl: buildGoogleFontsUrl('Playfair Display', 'Libre Franklin', ['400','800'], ['400','500']) },
    borderRadius: { small: '0px', medium: '4px', large: '12px', pill: '9999px' },
    buttonStyle: { borderRadius: '4px', padding: '1rem 2.5rem', fontSize: '1rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' },
    sectionPadding: '6rem', contentSize: '1000px', wideSize: '1400px',
    headingSizes: { h1: 'clamp(3.5rem, 8vw, 5rem)', h2: 'clamp(2.5rem, 6vw, 4rem)', h3: 'clamp(1.75rem, 4vw, 2.75rem)', h4: '1.25rem' },
    designPackage: { headerVariant: 'header-bold', footerVariant: 'footer-dark', homeLayout: ['hero-video-bg', 'features-columns', 'testimonials-single', 'cta-gradient'], aboutLayout: ['hero-image-bg', 'team-grid', 'cta-minimal'], servicesLayout: ['hero-image-bg', 'services-alternating', 'pricing-table', 'cta-gradient'], contactLayout: ['contact-form-section', 'map-embed'] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: 'active', createdBy: null,
  },
  // 3. Professional Edge (SERVICE)
  {
    name: 'Professional Edge', slug: 'professional-edge-service', archetype: 'SERVICE',
    industryTags: ['law', 'finance', 'consulting'],
    colors: { primary: '#1e3a8a', secondary: '#1e40af', accent: '#fbbf24', background: '#ffffff', surface: '#f8fafc', text: '#0f172a', textMuted: '#64748b', border: '#cbd5e1' },
    fonts: { heading: 'Manrope', body: 'Manrope', headingWeight: '700', bodyWeight: '400', googleFontsUrl: buildGoogleFontsUrl('Manrope', 'Manrope', ['400','600','700'], ['400','500']) },
    borderRadius: { small: '4px', medium: '8px', large: '24px', pill: '9999px' },
    buttonStyle: { borderRadius: '8px', padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: '600', textTransform: 'none', letterSpacing: '0' },
    sectionPadding: '5.5rem', contentSize: '850px', wideSize: '1250px',
    headingSizes: { h1: 'clamp(3rem, 6vw, 4.5rem)', h2: 'clamp(2.25rem, 5vw, 3.5rem)', h3: 'clamp(1.5rem, 3vw, 2.25rem)', h4: '1.25rem' },
    designPackage: { headerVariant: 'header-transparent', footerVariant: 'footer-4col', homeLayout: ['hero-asymmetric', 'features-checklist', 'testimonials-cards', 'cta-gradient'], aboutLayout: ['hero-image-bg', 'team-grid', 'stats-counter', 'cta-minimal'], servicesLayout: ['hero-image-bg', 'services-alternating', 'pricing-table', 'cta-gradient'], contactLayout: ['contact-form-section', 'map-embed'] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: 'active', createdBy: null,
  },
  // 4. Warm Welcome (SERVICE)
  {
    name: 'Warm Welcome', slug: 'warm-welcome-service', archetype: 'SERVICE',
    industryTags: ['therapy', 'wellness', 'childcare'],
    colors: { primary: '#9a3412', secondary: '#78350f', accent: '#14b8a6', background: '#fffbeb', surface: '#fef3c7', text: '#451a03', textMuted: '#92400e', border: '#fde68a' },
    fonts: { heading: 'Outfit', body: 'Outfit', headingWeight: '700', bodyWeight: '400', googleFontsUrl: buildGoogleFontsUrl('Outfit', 'Outfit', ['400','600','700'], ['400','500']) },
    borderRadius: { small: '8px', medium: '16px', large: '32px', pill: '9999px' },
    buttonStyle: { borderRadius: '32px', padding: '0.875rem 2.5rem', fontSize: '1rem', fontWeight: '600', textTransform: 'none', letterSpacing: '0' },
    sectionPadding: '5rem', contentSize: '800px', wideSize: '1300px',
    headingSizes: { h1: 'clamp(3.5rem, 7vw, 4.5rem)', h2: 'clamp(2.5rem, 5vw, 3.5rem)', h3: 'clamp(1.75rem, 3.5vw, 2.5rem)', h4: '1.25rem' },
    designPackage: { headerVariant: 'header-centered', footerVariant: 'footer-centered', homeLayout: ['hero-split-screen', 'services-icons', 'testimonials-carousel', 'cta-banner'], aboutLayout: ['hero-image-bg', 'team-grid', 'cta-minimal'], servicesLayout: ['hero-split-screen', 'services-alternating', 'pricing-table', 'cta-gradient'], contactLayout: ['contact-form-section', 'map-embed'] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: 'active', createdBy: null,
  },
  // 5. Tech Forward (SERVICE)
  {
    name: 'Tech Forward', slug: 'tech-forward-service', archetype: 'SERVICE',
    industryTags: ['saas', 'it-services', 'startup'],
    colors: { primary: '#4f46e5', secondary: '#4338ca', accent: '#06b6d4', background: '#ffffff', surface: '#f1f5f9', text: '#0f172a', textMuted: '#64748b', border: '#e2e8f0' },
    fonts: { heading: 'Syne', body: 'Inter', headingWeight: '700', bodyWeight: '400', googleFontsUrl: buildGoogleFontsUrl('Syne', 'Inter', ['400','600','700'], ['400','500']) },
    borderRadius: { small: '6px', medium: '12px', large: '24px', pill: '9999px' },
    buttonStyle: { borderRadius: '12px', padding: '0.9rem 2.25rem', fontSize: '0.95rem', fontWeight: '600', textTransform: 'none', letterSpacing: '0.01em' },
    sectionPadding: '5.5rem', contentSize: '950px', wideSize: '1400px',
    headingSizes: { h1: 'clamp(3.5rem, 8vw, 5.5rem)', h2: 'clamp(2.5rem, 6vw, 4rem)', h3: 'clamp(1.75rem, 4vw, 2.5rem)', h4: '1.25rem' },
    designPackage: { headerVariant: 'header-minimal', footerVariant: 'footer-minimal', homeLayout: ['hero-cards', 'features-columns', 'logo-cloud', 'cta-gradient'], aboutLayout: ['hero-image-bg', 'team-grid', 'stats-counter', 'cta-minimal'], servicesLayout: ['hero-cards', 'services-icons', 'pricing-table', 'cta-gradient'], contactLayout: ['contact-form-section', 'map-embed'] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: 'active', createdBy: null,
  },
  // 6. Rustic Charm (VENUE)
  {
    name: 'Rustic Charm', slug: 'rustic-charm-venue', archetype: 'VENUE',
    industryTags: ['event-venue', 'ranch', 'farm'],
    colors: { primary: '#78350f', secondary: '#92400e', accent: '#b45309', background: '#fffbeb', surface: '#fef3c7', text: '#451a03', textMuted: '#78350f', border: '#fde68a' },
    fonts: { heading: 'Cormorant Garamond', body: 'Cabin', headingWeight: '700', bodyWeight: '400', googleFontsUrl: buildGoogleFontsUrl('Cormorant Garamond', 'Cabin', ['400','700'], ['400','500']) },
    borderRadius: { small: '4px', medium: '8px', large: '16px', pill: '9999px' },
    buttonStyle: { borderRadius: '8px', padding: '0.85rem 2.5rem', fontSize: '1rem', fontWeight: '600', textTransform: 'none', letterSpacing: '0.02em' },
    sectionPadding: '5rem', contentSize: '900px', wideSize: '1300px',
    headingSizes: { h1: 'clamp(3.5rem, 8vw, 5rem)', h2: 'clamp(2.5rem, 6vw, 4rem)', h3: 'clamp(1.75rem, 4vw, 3rem)', h4: '1.5rem' },
    designPackage: { headerVariant: 'header-centered', footerVariant: 'footer-dark', homeLayout: ['hero-image-bg', 'gallery-masonry', 'testimonials-single', 'cta-banner'], aboutLayout: ['hero-image-bg', 'team-grid', 'cta-minimal'], servicesLayout: ['hero-image-bg', 'services-grid', 'pricing-table', 'cta-gradient'], contactLayout: ['contact-form-section', 'map-embed'] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: 'active', createdBy: null,
  },
  // 7. Urban Bistro (VENUE)
  {
    name: 'Urban Bistro', slug: 'urban-bistro-venue', archetype: 'VENUE',
    industryTags: ['restaurant', 'cafe', 'bar'],
    colors: { primary: '#18181b', secondary: '#27272a', accent: '#eab308', background: '#09090b', surface: '#18181b', text: '#fafafa', textMuted: '#a1a1aa', border: '#3f3f46' },
    fonts: { heading: 'Playfair Display', body: 'Outfit', headingWeight: '700', bodyWeight: '400', googleFontsUrl: buildGoogleFontsUrl('Playfair Display', 'Outfit', ['400','700'], ['400','500']) },
    borderRadius: { small: '0px', medium: '2px', large: '8px', pill: '9999px' },
    buttonStyle: { borderRadius: '2px', padding: '1rem 2.5rem', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em' },
    sectionPadding: '6rem', contentSize: '950px', wideSize: '1400px',
    headingSizes: { h1: 'clamp(3.5rem, 9vw, 5.5rem)', h2: 'clamp(2.5rem, 7vw, 4.5rem)', h3: 'clamp(1.75rem, 4vw, 3rem)', h4: '1.25rem' },
    designPackage: { headerVariant: 'header-bold', footerVariant: 'footer-minimal', homeLayout: ['hero-video-bg', 'menu-grid', 'testimonials-carousel', 'cta-gradient'], aboutLayout: ['hero-video-bg', 'team-grid', 'cta-minimal'], servicesLayout: ['hero-video-bg', 'services-grid', 'pricing-table', 'cta-gradient'], contactLayout: ['contact-form-section', 'map-embed'] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: 'active', createdBy: null,
  },
  // 8. Garden Party (VENUE)
  {
    name: 'Garden Party', slug: 'garden-party-venue', archetype: 'VENUE',
    industryTags: ['wedding', 'botanical', 'outdoor'],
    colors: { primary: '#166534', secondary: '#14532d', accent: '#f43f5e', background: '#f0fdf4', surface: '#ffffff', text: '#052e16', textMuted: '#15803d', border: '#bcf0da' },
    fonts: { heading: 'Manrope', body: 'Manrope', headingWeight: '700', bodyWeight: '400', googleFontsUrl: buildGoogleFontsUrl('Manrope', 'Manrope', ['400','700'], ['400','500']) },
    borderRadius: { small: '12px', medium: '24px', large: '32px', pill: '9999px' },
    buttonStyle: { borderRadius: '32px', padding: '1rem 2.5rem', fontSize: '1rem', fontWeight: '600', textTransform: 'none', letterSpacing: '0' },
    sectionPadding: '5rem', contentSize: '900px', wideSize: '1350px',
    headingSizes: { h1: 'clamp(3rem, 7vw, 4.5rem)', h2: 'clamp(2rem, 5vw, 3.5rem)', h3: 'clamp(1.5rem, 3.5vw, 2.5rem)', h4: '1.25rem' },
    designPackage: { headerVariant: 'header-transparent', footerVariant: 'footer-centered', homeLayout: ['hero-asymmetric', 'gallery-masonry', 'testimonials-cards', 'cta-gradient'], aboutLayout: ['hero-image-bg', 'team-grid', 'cta-minimal'], servicesLayout: ['hero-image-bg', 'services-alternating', 'pricing-table', 'cta-gradient'], contactLayout: ['contact-form-section', 'map-embed'] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: 'active', createdBy: null,
  },
  // 9. Coastal Breeze (VENUE)
  {
    name: 'Coastal Breeze', slug: 'coastal-breeze-venue', archetype: 'VENUE',
    industryTags: ['beach-resort', 'marina', 'seafood'],
    colors: { primary: '#0369a1', secondary: '#075985', accent: '#f59e0b', background: '#f0f9ff', surface: '#ffffff', text: '#082f49', textMuted: '#0284c7', border: '#bae6fd' },
    fonts: { heading: 'Syne', body: 'Outfit', headingWeight: '700', bodyWeight: '400', googleFontsUrl: buildGoogleFontsUrl('Syne', 'Outfit', ['400','700'], ['400','500']) },
    borderRadius: { small: '8px', medium: '16px', large: '24px', pill: '9999px' },
    buttonStyle: { borderRadius: '24px', padding: '0.9rem 2.25rem', fontSize: '1rem', fontWeight: '600', textTransform: 'none', letterSpacing: '0' },
    sectionPadding: '5.5rem', contentSize: '1000px', wideSize: '1400px',
    headingSizes: { h1: 'clamp(3.5rem, 8vw, 5.5rem)', h2: 'clamp(2.5rem, 6vw, 4rem)', h3: 'clamp(1.75rem, 4vw, 2.75rem)', h4: '1.25rem' },
    designPackage: { headerVariant: 'header-minimal', footerVariant: 'footer-4col', homeLayout: ['hero-centered-minimal', 'features-columns', 'testimonials-carousel', 'cta-split'], aboutLayout: ['hero-centered-minimal', 'team-grid', 'cta-minimal'], servicesLayout: ['hero-centered-minimal', 'services-grid', 'pricing-table', 'cta-gradient'], contactLayout: ['contact-form-section', 'map-embed'] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: 'active', createdBy: null,
  },
  // 10. Night Owl (VENUE)
  {
    name: 'Night Owl', slug: 'night-owl-venue', archetype: 'VENUE',
    industryTags: ['nightclub', 'lounge', 'concert'],
    colors: { primary: '#4c1d95', secondary: '#5b21b6', accent: '#ec4899', background: '#0f172a', surface: '#1e293b', text: '#f8fafc', textMuted: '#94a3b8', border: '#334155' },
    fonts: { heading: 'Outfit', body: 'Inter', headingWeight: '800', bodyWeight: '400', googleFontsUrl: buildGoogleFontsUrl('Outfit', 'Inter', ['400','800'], ['400','500']) },
    borderRadius: { small: '8px', medium: '16px', large: '24px', pill: '9999px' },
    buttonStyle: { borderRadius: '16px', padding: '1rem 2.5rem', fontSize: '1rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' },
    sectionPadding: '6rem', contentSize: '950px', wideSize: '1350px',
    headingSizes: { h1: 'clamp(3.5rem, 9vw, 6rem)', h2: 'clamp(2.5rem, 7vw, 4.5rem)', h3: 'clamp(1.75rem, 4vw, 3rem)', h4: '1.25rem' },
    designPackage: { headerVariant: 'header-bold', footerVariant: 'footer-dark', homeLayout: ['hero-video-bg', 'gallery-masonry', 'testimonials-single', 'cta-gradient'], aboutLayout: ['hero-video-bg', 'team-grid', 'cta-minimal'], servicesLayout: ['hero-video-bg', 'services-grid', 'pricing-table', 'cta-gradient'], contactLayout: ['contact-form-section', 'map-embed'] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: 'active', createdBy: null,
  },
  // 11. Gallery White (PORTFOLIO)
  {
    name: 'Gallery White', slug: 'gallery-white-portfolio', archetype: 'PORTFOLIO',
    industryTags: ['photography', 'art-gallery', 'minimalist'],
    colors: { primary: '#18181b', secondary: '#27272a', accent: '#a1a1aa', background: '#ffffff', surface: '#f4f4f5', text: '#09090b', textMuted: '#71717a', border: '#e4e4e7' },
    fonts: { heading: 'Manrope', body: 'Manrope', headingWeight: '800', bodyWeight: '400', googleFontsUrl: buildGoogleFontsUrl('Manrope', 'Manrope', ['400','800'], ['400','500']) },
    borderRadius: { small: '0px', medium: '0px', large: '0px', pill: '9999px' },
    buttonStyle: { borderRadius: '0px', padding: '1rem 2.25rem', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' },
    sectionPadding: '6rem', contentSize: '1000px', wideSize: '1400px',
    headingSizes: { h1: 'clamp(3rem, 8vw, 5.5rem)', h2: 'clamp(2rem, 6vw, 4rem)', h3: 'clamp(1.5rem, 3.5vw, 2.5rem)', h4: '1.25rem' },
    designPackage: { headerVariant: 'header-minimal', footerVariant: 'footer-minimal', homeLayout: ['hero-centered-minimal', 'portfolio-grid', 'testimonials-single', 'cta-gradient'], aboutLayout: ['hero-centered-minimal', 'team-grid', 'cta-minimal'], servicesLayout: ['hero-centered-minimal', 'services-grid', 'pricing-table', 'cta-gradient'], contactLayout: ['contact-form-section', 'map-embed'] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: 'active', createdBy: null,
  },
  // 12. Creative Studio (PORTFOLIO)
  {
    name: 'Creative Studio', slug: 'creative-studio-portfolio', archetype: 'PORTFOLIO',
    industryTags: ['design-agency', 'branding', 'creative'],
    colors: { primary: '#6d28d9', secondary: '#5b21b6', accent: '#fb923c', background: '#ffffff', surface: '#f5f3ff', text: '#1e1b4b', textMuted: '#6b7280', border: '#ddd6fe' },
    fonts: { heading: 'Syne', body: 'Inter', headingWeight: '800', bodyWeight: '400', googleFontsUrl: buildGoogleFontsUrl('Syne', 'Inter', ['400','800'], ['400','500']) },
    borderRadius: { small: '8px', medium: '16px', large: '24px', pill: '9999px' },
    buttonStyle: { borderRadius: '24px', padding: '0.9rem 2.25rem', fontSize: '1rem', fontWeight: '600', textTransform: 'none', letterSpacing: '0' },
    sectionPadding: '5rem', contentSize: '950px', wideSize: '1350px',
    headingSizes: { h1: 'clamp(3.5rem, 9vw, 6rem)', h2: 'clamp(2.5rem, 7vw, 4.5rem)', h3: 'clamp(1.75rem, 4vw, 3rem)', h4: '1.25rem' },
    designPackage: { headerVariant: 'header-centered', footerVariant: 'footer-centered', homeLayout: ['hero-asymmetric', 'portfolio-grid', 'testimonials-cards', 'cta-gradient'], aboutLayout: ['hero-image-bg', 'team-grid', 'cta-minimal'], servicesLayout: ['hero-asymmetric', 'services-icons', 'pricing-table', 'cta-gradient'], contactLayout: ['contact-form-section', 'map-embed'] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: 'active', createdBy: null,
  },
  // 13. Monochrome (PORTFOLIO)
  {
    name: 'Monochrome', slug: 'monochrome-portfolio', archetype: 'PORTFOLIO',
    industryTags: ['architecture', 'photography'],
    colors: { primary: '#09090b', secondary: '#18181b', accent: '#71717a', background: '#ffffff', surface: '#f4f4f5', text: '#09090b', textMuted: '#71717a', border: '#e4e4e7' },
    fonts: { heading: 'Playfair Display', body: 'Outfit', headingWeight: '700', bodyWeight: '400', googleFontsUrl: buildGoogleFontsUrl('Playfair Display', 'Outfit', ['400','700'], ['400','500']) },
    borderRadius: { small: '0px', medium: '0px', large: '0px', pill: '9999px' },
    buttonStyle: { borderRadius: '0px', padding: '1rem 2.5rem', fontSize: '0.95rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em' },
    sectionPadding: '6rem', contentSize: '900px', wideSize: '1400px',
    headingSizes: { h1: 'clamp(3.5rem, 8vw, 5.5rem)', h2: 'clamp(2.5rem, 6vw, 4rem)', h3: 'clamp(1.75rem, 4vw, 2.75rem)', h4: '1.25rem' },
    designPackage: { headerVariant: 'header-transparent', footerVariant: 'footer-minimal', homeLayout: ['hero-image-bg', 'portfolio-grid', 'testimonials-single', 'cta-minimal'], aboutLayout: ['hero-image-bg', 'team-grid', 'cta-minimal'], servicesLayout: ['hero-image-bg', 'services-grid', 'pricing-table', 'cta-gradient'], contactLayout: ['contact-form-section', 'map-embed'] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: 'active', createdBy: null,
  },
  // 14. Vibrant Showcase (PORTFOLIO)
  {
    name: 'Vibrant Showcase', slug: 'vibrant-showcase-portfolio', archetype: 'PORTFOLIO',
    industryTags: ['illustration', 'animation', 'colorful'],
    colors: { primary: '#db2777', secondary: '#be185d', accent: '#eab308', background: '#fdf2f8', surface: '#ffffff', text: '#831843', textMuted: '#db2777', border: '#fbcfe8' },
    fonts: { heading: 'Syne', body: 'Syne', headingWeight: '800', bodyWeight: '400', googleFontsUrl: buildGoogleFontsUrl('Syne', 'Syne', ['400','800'], ['400','600']) },
    borderRadius: { small: '16px', medium: '24px', large: '32px', pill: '9999px' },
    buttonStyle: { borderRadius: '32px', padding: '1rem 2.5rem', fontSize: '1rem', fontWeight: '800', textTransform: 'none', letterSpacing: '0' },
    sectionPadding: '5rem', contentSize: '1000px', wideSize: '1350px',
    headingSizes: { h1: 'clamp(3.5rem, 9vw, 6rem)', h2: 'clamp(2.5rem, 7vw, 4.5rem)', h3: 'clamp(1.75rem, 4vw, 3rem)', h4: '1.5rem' },
    designPackage: { headerVariant: 'header-bold', footerVariant: 'footer-4col', homeLayout: ['hero-cards', 'portfolio-grid', 'testimonials-cards', 'cta-gradient'], aboutLayout: ['hero-cards', 'team-grid', 'cta-minimal'], servicesLayout: ['hero-cards', 'services-alternating', 'pricing-table', 'cta-gradient'], contactLayout: ['contact-form-section', 'map-embed'] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: 'active', createdBy: null,
  },
  // 15. Elegant Frame (PORTFOLIO)
  {
    name: 'Elegant Frame', slug: 'elegant-frame-portfolio', archetype: 'PORTFOLIO',
    industryTags: ['interior-design', 'fashion', 'luxury'],
    colors: { primary: '#1c1917', secondary: '#292524', accent: '#ca8a04', background: '#fafaf9', surface: '#ffffff', text: '#1c1917', textMuted: '#78716c', border: '#e7e5e4' },
    fonts: { heading: 'Cormorant Garamond', body: 'Outfit', headingWeight: '700', bodyWeight: '400', googleFontsUrl: buildGoogleFontsUrl('Cormorant Garamond', 'Outfit', ['400','700'], ['400','500']) },
    borderRadius: { small: '0px', medium: '4px', large: '8px', pill: '9999px' },
    buttonStyle: { borderRadius: '4px', padding: '0.9rem 2.5rem', fontSize: '0.95rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' },
    sectionPadding: '6rem', contentSize: '950px', wideSize: '1400px',
    headingSizes: { h1: 'clamp(3.5rem, 8vw, 5.5rem)', h2: 'clamp(2.5rem, 6vw, 4rem)', h3: 'clamp(1.75rem, 4vw, 2.75rem)', h4: '1.25rem' },
    designPackage: { headerVariant: 'header-minimal', footerVariant: 'footer-dark', homeLayout: ['hero-split-screen', 'portfolio-grid', 'testimonials-single', 'cta-minimal'], aboutLayout: ['hero-image-bg', 'team-grid', 'cta-minimal'], servicesLayout: ['hero-split-screen', 'services-grid', 'pricing-table', 'cta-gradient'], contactLayout: ['contact-form-section', 'map-embed'] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: 'active', createdBy: null,
  },
  // 16. Market Fresh (COMMERCE)
  {
    name: 'Market Fresh', slug: 'market-fresh-commerce', archetype: 'COMMERCE',
    industryTags: ['grocery', 'organic', 'farm'],
    colors: { primary: '#15803d', secondary: '#166534', accent: '#f59e0b', background: '#ffffff', surface: '#f0fdf4', text: '#14532d', textMuted: '#15803d', border: '#bbf7d0' },
    fonts: { heading: 'Outfit', body: 'Inter', headingWeight: '800', bodyWeight: '400', googleFontsUrl: buildGoogleFontsUrl('Outfit', 'Inter', ['400','800'], ['400','500']) },
    borderRadius: { small: '8px', medium: '16px', large: '24px', pill: '9999px' },
    buttonStyle: { borderRadius: '24px', padding: '0.9rem 2rem', fontSize: '1rem', fontWeight: '700', textTransform: 'none', letterSpacing: '0' },
    sectionPadding: '5rem', contentSize: '1000px', wideSize: '1400px',
    headingSizes: { h1: 'clamp(3rem, 8vw, 5.5rem)', h2: 'clamp(2rem, 6vw, 4rem)', h3: 'clamp(1.5rem, 3.5vw, 2.5rem)', h4: '1.25rem' },
    designPackage: { headerVariant: 'header-centered', footerVariant: 'footer-4col', homeLayout: ['hero-cards', 'gallery-masonry', 'testimonials-cards', 'cta-banner'], aboutLayout: ['hero-cards', 'team-grid', 'cta-minimal'], servicesLayout: ['hero-cards', 'services-grid', 'pricing-table', 'cta-gradient'], contactLayout: ['contact-form-section', 'map-embed'] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: 'active', createdBy: null,
  },
  // 17. Luxury Brand (COMMERCE)
  {
    name: 'Luxury Brand', slug: 'luxury-brand-commerce', archetype: 'COMMERCE',
    industryTags: ['jewelry', 'fashion', 'boutique'],
    colors: { primary: '#18181b', secondary: '#09090b', accent: '#d4af37', background: '#fafafa', surface: '#ffffff', text: '#09090b', textMuted: '#71717a', border: '#e4e4e7' },
    fonts: { heading: 'Playfair Display', body: 'Outfit', headingWeight: '700', bodyWeight: '400', googleFontsUrl: buildGoogleFontsUrl('Playfair Display', 'Outfit', ['400','700'], ['400','500']) },
    borderRadius: { small: '0px', medium: '0px', large: '0px', pill: '9999px' },
    buttonStyle: { borderRadius: '0px', padding: '1rem 3rem', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.15em' },
    sectionPadding: '6.5rem', contentSize: '950px', wideSize: '1450px',
    headingSizes: { h1: 'clamp(3.5rem, 9vw, 6rem)', h2: 'clamp(2.5rem, 7vw, 4.5rem)', h3: 'clamp(1.75rem, 4vw, 3rem)', h4: '1.25rem' },
    designPackage: { headerVariant: 'header-transparent', footerVariant: 'footer-dark', homeLayout: ['hero-video-bg', 'features-columns', 'testimonials-single', 'cta-minimal'], aboutLayout: ['hero-video-bg', 'team-grid', 'cta-minimal'], servicesLayout: ['hero-video-bg', 'services-alternating', 'pricing-table', 'cta-gradient'], contactLayout: ['contact-form-section', 'map-embed'] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: 'active', createdBy: null,
  },
  // 18. Pop Shop (COMMERCE)
  {
    name: 'Pop Shop', slug: 'pop-shop-commerce', archetype: 'COMMERCE',
    industryTags: ['toys', 'candy', 'kids'],
    colors: { primary: '#ec4899', secondary: '#db2777', accent: '#fde047', background: '#fdf2f8', surface: '#ffffff', text: '#831843', textMuted: '#db2777', border: '#fbcfe8' },
    fonts: { heading: 'Syne', body: 'Syne', headingWeight: '800', bodyWeight: '500', googleFontsUrl: buildGoogleFontsUrl('Syne', 'Syne', ['400','800'], ['500','600']) },
    borderRadius: { small: '16px', medium: '24px', large: '48px', pill: '9999px' },
    buttonStyle: { borderRadius: '48px', padding: '1rem 2.5rem', fontSize: '1rem', fontWeight: '800', textTransform: 'none', letterSpacing: '0' },
    sectionPadding: '5rem', contentSize: '1000px', wideSize: '1350px',
    headingSizes: { h1: 'clamp(3.5rem, 10vw, 6.5rem)', h2: 'clamp(2.5rem, 8vw, 5rem)', h3: 'clamp(1.75rem, 5vw, 3.5rem)', h4: '1.5rem' },
    designPackage: { headerVariant: 'header-bold', footerVariant: 'footer-centered', homeLayout: ['hero-asymmetric', 'features-checklist', 'testimonials-cards', 'cta-gradient'], aboutLayout: ['hero-asymmetric', 'team-grid', 'cta-minimal'], servicesLayout: ['hero-asymmetric', 'services-icons', 'pricing-table', 'cta-gradient'], contactLayout: ['contact-form-section', 'map-embed'] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: 'active', createdBy: null,
  },
  // 19. Craftsman (COMMERCE)
  {
    name: 'Craftsman', slug: 'craftsman-commerce', archetype: 'COMMERCE',
    industryTags: ['handmade', 'leather', 'woodworking'],
    colors: { primary: '#78350f', secondary: '#92400e', accent: '#b45309', background: '#fffbeb', surface: '#fef3c7', text: '#451a03', textMuted: '#92400e', border: '#fde68a' },
    fonts: { heading: 'Cormorant Garamond', body: 'Outfit', headingWeight: '700', bodyWeight: '400', googleFontsUrl: buildGoogleFontsUrl('Cormorant Garamond', 'Outfit', ['400','700'], ['400','500']) },
    borderRadius: { small: '4px', medium: '8px', large: '12px', pill: '9999px' },
    buttonStyle: { borderRadius: '8px', padding: '0.9rem 2.25rem', fontSize: '0.95rem', fontWeight: '600', textTransform: 'none', letterSpacing: '0.02em' },
    sectionPadding: '5.5rem', contentSize: '900px', wideSize: '1350px',
    headingSizes: { h1: 'clamp(3rem, 8vw, 5rem)', h2: 'clamp(2.25rem, 6vw, 3.5rem)', h3: 'clamp(1.5rem, 3.5vw, 2.5rem)', h4: '1.25rem' },
    designPackage: { headerVariant: 'header-minimal', footerVariant: 'footer-minimal', homeLayout: ['hero-centered-minimal', 'features-columns', 'testimonials-single', 'cta-minimal'], aboutLayout: ['hero-centered-minimal', 'team-grid', 'cta-minimal'], servicesLayout: ['hero-centered-minimal', 'services-alternating', 'pricing-table', 'cta-gradient'], contactLayout: ['contact-form-section', 'map-embed'] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: 'active', createdBy: null,
  },
  // 20. Modern Store (COMMERCE)
  {
    name: 'Modern Store', slug: 'modern-store-commerce', archetype: 'COMMERCE',
    industryTags: ['retail', 'electronics', 'apparel'],
    colors: { primary: '#2563eb', secondary: '#1d4ed8', accent: '#f59e0b', background: '#ffffff', surface: '#f8fafc', text: '#0f172a', textMuted: '#64748b', border: '#e2e8f0' },
    fonts: { heading: 'Manrope', body: 'Inter', headingWeight: '800', bodyWeight: '400', googleFontsUrl: buildGoogleFontsUrl('Manrope', 'Inter', ['400','800'], ['400','500']) },
    borderRadius: { small: '8px', medium: '16px', large: '24px', pill: '9999px' },
    buttonStyle: { borderRadius: '24px', padding: '0.9rem 2.5rem', fontSize: '1rem', fontWeight: '700', textTransform: 'none', letterSpacing: '0' },
    sectionPadding: '5rem', contentSize: '1000px', wideSize: '1400px',
    headingSizes: { h1: 'clamp(3.5rem, 8vw, 5.5rem)', h2: 'clamp(2.5rem, 6vw, 4rem)', h3: 'clamp(1.75rem, 4vw, 2.75rem)', h4: '1.25rem' },
    designPackage: { headerVariant: 'header-centered', footerVariant: 'footer-4col', homeLayout: ['hero-image-bg', 'gallery-masonry', 'testimonials-cards', 'cta-gradient'], aboutLayout: ['hero-image-bg', 'team-grid', 'cta-minimal'], servicesLayout: ['hero-image-bg', 'services-grid', 'pricing-table', 'cta-gradient'], contactLayout: ['contact-form-section', 'map-embed'] },
    previewUrl: null, thumbnailUrl: null, usageCount: 0, rating: 0, isSystem: true, status: 'active', createdBy: null,
  },

];

// =============================================================================
// Multi-Theme Mapping — Compute baseTheme + styleVariation per entry
// =============================================================================

const THEME_MAP: Record<string, string> = {
  SERVICE: "xusmo-service",
  COMMERCE: "xusmo-commerce",
  VENUE: "xusmo-venue",
  PORTFOLIO: "xusmo-portfolio",
};

const SERIF_FONTS = new Set([
  "Playfair Display", "Lora", "Cormorant Garamond", "Libre Baskerville",
  "Merriweather", "Vollkorn", "Alegreya", "DM Serif Display",
  "Crimson Text", "Source Serif Pro", "EB Garamond",
]);

function isLightHex(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length < 6) return true;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 140;
}

function classifyDesignStyle(theme: {
  colors: Record<string, string>;
  fonts: { heading: string };
  borderRadius?: { medium?: string };
  buttonStyle?: { textTransform?: string };
  designPackage?: { homeLayout?: string[] } | null;
}): string {
  const bg = theme.colors.background || "#ffffff";
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

// =============================================================================
// Exported seed function
// =============================================================================

export async function seedThemePool() {
  console.log("Seeding theme pool...");

  for (const theme of themes) {
    const baseTheme = THEME_MAP[theme.archetype] || "xusmo-service";
    const styleVariation = classifyDesignStyle(theme as any);
    const data = { ...theme, baseTheme, styleVariation };

    await prisma.themePoolEntry.upsert({
      where: { slug: theme.slug },
      update: data,
      create: data,
    });
    console.log(`  + ${theme.name} (${theme.archetype}) → ${baseTheme}/${styleVariation}`);
  }

  console.log(`\n[seed] Seeded ${themes.length} themes into ThemePoolEntry`);

  // Summary by archetype
  const counts: Record<string, number> = {};
  const styleCounts: Record<string, number> = {};
  for (const t of themes) {
    counts[t.archetype] = (counts[t.archetype] || 0) + 1;
    const sv = classifyDesignStyle(t as any);
    styleCounts[sv] = (styleCounts[sv] || 0) + 1;
  }
  console.log("  Archetype breakdown:");
  for (const [arch, count] of Object.entries(counts).sort()) {
    console.log(`    ${arch}: ${count}`);
  }
  console.log("  Style variation breakdown:");
  for (const [style, count] of Object.entries(styleCounts).sort()) {
    console.log(`    ${style}: ${count}`);
  }
}

// =============================================================================
// Standalone execution
// =============================================================================

if (require.main === module) {
  seedThemePool()
    .catch((e) => {
      console.error("Theme pool seed failed:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
