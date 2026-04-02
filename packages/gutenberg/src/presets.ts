// =============================================================================
// Theme Presets — Each archetype gets a full visual personality
// Defines colors, fonts, spacing, border radii, layout, and button styles.
// =============================================================================

import type { Archetype } from "./types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ThemePreset {
  // Color palette (9 colors — "light" is always #fff for text on dark overlays)
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    light: string;
  };
  // Font pair + weights
  fonts: {
    heading: string;
    headingWeight: string;
    body: string;
    bodyWeight: string;
  };
  // Layout sizes
  layout: {
    contentSize: string;
    wideSize: string;
  };
  // Border radii
  borderRadius: {
    small: string;
    medium: string;
    large: string;
    pill: string;
  };
  // Section padding
  sectionPadding: string;
  // Heading styles
  headingSizes: {
    h1: string;
    h2: string;
    h3: string;
    h4: string;
  };
  // Button styling
  button: {
    borderRadius: string;
    paddingVertical: string;
    paddingHorizontal: string;
    fontSize: string;
    fontWeight: string;
    textTransform: string;
    letterSpacing: string;
  };
  // Google Fonts URL
  googleFontsUrl: string;
}

// ---------------------------------------------------------------------------
// Preset definitions
// ---------------------------------------------------------------------------

const SERVICE_PRESET: ThemePreset = {
  colors: {
    primary: "#1e40af",
    secondary: "#475569",
    accent: "#dc2626",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#0f172a",
    textMuted: "#64748b",
    border: "#e2e8f0",
    light: "#ffffff",
  },
  fonts: {
    heading: "Inter",
    headingWeight: "700",
    body: "Inter",
    bodyWeight: "400",
  },
  layout: {
    contentSize: "768px",
    wideSize: "1200px",
  },
  borderRadius: {
    small: "4px",
    medium: "6px",
    large: "12px",
    pill: "9999px",
  },
  sectionPadding: "4rem",
  headingSizes: {
    h1: "clamp(2rem, 4vw, 3rem)",
    h2: "clamp(1.5rem, 3vw, 2.25rem)",
    h3: "clamp(1.25rem, 2.5vw, 1.75rem)",
    h4: "1.125rem",
  },
  button: {
    borderRadius: "6px",
    paddingVertical: "0.75rem",
    paddingHorizontal: "1.75rem",
    fontSize: "0.9375rem",
    fontWeight: "600",
    textTransform: "none",
    letterSpacing: "0",
  },
  googleFontsUrl:
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
};

const VENUE_PRESET: ThemePreset = {
  colors: {
    primary: "#7c2d12",
    secondary: "#a16207",
    accent: "#b45309",
    background: "#fffbeb",
    surface: "#fef3c7",
    text: "#1c1917",
    textMuted: "#78716c",
    border: "#e7e5e4",
    light: "#ffffff",
  },
  fonts: {
    heading: "Cormorant Garamond",
    headingWeight: "600",
    body: "Lato",
    bodyWeight: "400",
  },
  layout: {
    contentSize: "900px",
    wideSize: "1400px",
  },
  borderRadius: {
    small: "8px",
    medium: "12px",
    large: "20px",
    pill: "9999px",
  },
  sectionPadding: "5rem",
  headingSizes: {
    h1: "clamp(2.25rem, 5vw, 3.5rem)",
    h2: "clamp(1.75rem, 3.5vw, 2.5rem)",
    h3: "clamp(1.375rem, 2.5vw, 1.875rem)",
    h4: "1.25rem",
  },
  button: {
    borderRadius: "12px",
    paddingVertical: "0.875rem",
    paddingHorizontal: "2rem",
    fontSize: "1rem",
    fontWeight: "500",
    textTransform: "none",
    letterSpacing: "0.02em",
  },
  googleFontsUrl:
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Lato:wght@400;700&display=swap",
};

const PORTFOLIO_PRESET: ThemePreset = {
  colors: {
    primary: "#18181b",
    secondary: "#3f3f46",
    accent: "#a855f7",
    background: "#fafafa",
    surface: "#f4f4f5",
    text: "#09090b",
    textMuted: "#71717a",
    border: "#e4e4e7",
    light: "#ffffff",
  },
  fonts: {
    heading: "DM Sans",
    headingWeight: "700",
    body: "DM Sans",
    bodyWeight: "400",
  },
  layout: {
    contentSize: "1000px",
    wideSize: "1400px",
  },
  borderRadius: {
    small: "0px",
    medium: "0px",
    large: "0px",
    pill: "9999px",
  },
  sectionPadding: "5rem",
  headingSizes: {
    h1: "clamp(2.5rem, 5vw, 4rem)",
    h2: "clamp(1.75rem, 3.5vw, 2.75rem)",
    h3: "clamp(1.25rem, 2.5vw, 1.75rem)",
    h4: "1.125rem",
  },
  button: {
    borderRadius: "0px",
    paddingVertical: "0.875rem",
    paddingHorizontal: "2rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },
  googleFontsUrl:
    "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap",
};

const COMMERCE_PRESET: ThemePreset = {
  colors: {
    primary: "#2563eb",
    secondary: "#7c3aed",
    accent: "#f59e0b",
    background: "#ffffff",
    surface: "#f5f3ff",
    text: "#1e1b4b",
    textMuted: "#6b7280",
    border: "#e5e7eb",
    light: "#ffffff",
  },
  fonts: {
    heading: "Montserrat",
    headingWeight: "700",
    body: "Open Sans",
    bodyWeight: "400",
  },
  layout: {
    contentSize: "768px",
    wideSize: "1200px",
  },
  borderRadius: {
    small: "6px",
    medium: "8px",
    large: "16px",
    pill: "9999px",
  },
  sectionPadding: "3.5rem",
  headingSizes: {
    h1: "clamp(2rem, 4vw, 3rem)",
    h2: "clamp(1.5rem, 3vw, 2.25rem)",
    h3: "clamp(1.25rem, 2.5vw, 1.75rem)",
    h4: "1.125rem",
  },
  button: {
    borderRadius: "8px",
    paddingVertical: "0.75rem",
    paddingHorizontal: "1.5rem",
    fontSize: "0.9375rem",
    fontWeight: "700",
    textTransform: "none",
    letterSpacing: "0",
  },
  googleFontsUrl:
    "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@400;600;700&display=swap",
};

// ---------------------------------------------------------------------------
// Preset map
// ---------------------------------------------------------------------------

const PRESETS: Record<Archetype, ThemePreset> = {
  SERVICE: SERVICE_PRESET,
  VENUE: VENUE_PRESET,
  PORTFOLIO: PORTFOLIO_PRESET,
  COMMERCE: COMMERCE_PRESET,
};

/**
 * Get the theme preset for an archetype. Falls back to SERVICE.
 */
export function getThemePreset(archetype: Archetype): ThemePreset {
  return PRESETS[archetype] ?? SERVICE_PRESET;
}

/**
 * Merge user color preferences into a preset.
 * If the user chose specific colors in the interview, override the preset defaults.
 */
export function mergeUserColors(
  preset: ThemePreset,
  userColors: string[]
): ThemePreset {
  if (!userColors || userColors.length === 0) return preset;

  const merged = { ...preset, colors: { ...preset.colors } };
  if (userColors[0]) merged.colors.primary = userColors[0];
  if (userColors[1]) merged.colors.secondary = userColors[1];
  if (userColors[2]) merged.colors.accent = userColors[2];

  return merged;
}
