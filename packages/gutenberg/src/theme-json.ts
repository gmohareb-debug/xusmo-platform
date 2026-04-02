// =============================================================================
// Theme JSON Builder — Generates a full WordPress theme.json (v3) from a
// ThemePreset. Covers colors, typography, spacing, layout, elements, and blocks.
// =============================================================================

import type { ThemePreset } from "./presets";

/**
 * Legacy font map — kept for backward compatibility.
 */
const FONT_MAP: Record<string, { heading: string; body: string }> = {
  "clean sans-serif": { heading: "DM Sans", body: "DM Sans" },
  "traditional serif": { heading: "Playfair Display", body: "Source Serif 4" },
  "elegant serif headers + clean sans body": { heading: "Cormorant Garamond", body: "Montserrat" },
  "modern sans with elegant display headers": { heading: "Prata", body: "Nunito Sans" },
  "minimal sans-serif, large type": { heading: "Space Grotesk", body: "Inter" },
  "bold modern sans-serif": { heading: "Oswald", body: "Roboto" },
  modern_sans: { heading: "Inter", body: "Inter" },
};

export function getFontPairForIndustry(fontPreference: string): { heading: string; body: string } {
  return FONT_MAP[fontPreference] || FONT_MAP["clean sans-serif"];
}

/**
 * Build a complete WordPress theme.json v3 object from a ThemePreset.
 */
export function buildThemeJson(preset: ThemePreset): Record<string, unknown> {
  return {
    $schema: "https://schemas.wp.org/wp/6.7/theme.json",
    version: 3,
    settings: {
      color: {
        palette: [
          { slug: "primary", color: preset.colors.primary, name: "Primary" },
          { slug: "secondary", color: preset.colors.secondary, name: "Secondary" },
          { slug: "accent", color: preset.colors.accent, name: "Accent" },
          { slug: "background", color: preset.colors.background, name: "Background" },
          { slug: "surface", color: preset.colors.surface, name: "Surface" },
          { slug: "text", color: preset.colors.text, name: "Text" },
          { slug: "text-muted", color: preset.colors.textMuted, name: "Text Muted" },
          { slug: "border", color: preset.colors.border, name: "Border" },
          { slug: "light", color: preset.colors.light, name: "Light" },
        ],
      },
      typography: {
        fontFamilies: [
          {
            fontFamily: `"${preset.fonts.heading}", sans-serif`,
            name: "Heading",
            slug: "heading",
          },
          {
            fontFamily: `"${preset.fonts.body}", sans-serif`,
            name: "Body",
            slug: "body",
          },
        ],
        fontSizes: [
          { slug: "small", size: "0.875rem", name: "Small" },
          { slug: "medium", size: "1rem", name: "Medium" },
          { slug: "large", size: "1.25rem", name: "Large" },
          { slug: "x-large", size: "1.5rem", name: "Extra Large" },
          { slug: "xx-large", size: "2rem", name: "2XL" },
        ],
      },
      spacing: {
        spacingSizes: [
          { size: "0.5rem", slug: "10", name: "1" },
          { size: "0.75rem", slug: "20", name: "2" },
          { size: "1rem", slug: "30", name: "3" },
          { size: "1.5rem", slug: "40", name: "4" },
          { size: "2rem", slug: "50", name: "5" },
          { size: "2.5rem", slug: "60", name: "6" },
          { size: "3rem", slug: "70", name: "7" },
          { size: preset.sectionPadding, slug: "80", name: "8" },
        ],
      },
      layout: {
        contentSize: preset.layout.contentSize,
        wideSize: preset.layout.wideSize,
      },
      custom: {
        borderRadius: {
          small: preset.borderRadius.small,
          medium: preset.borderRadius.medium,
          large: preset.borderRadius.large,
          pill: preset.borderRadius.pill,
        },
      },
    },
    styles: {
      color: {
        background: "var(--wp--preset--color--background)",
        text: "var(--wp--preset--color--text)",
      },
      typography: {
        fontFamily: "var(--wp--preset--font-family--body)",
        fontSize: "1rem",
        fontWeight: preset.fonts.bodyWeight,
        lineHeight: "1.6",
      },
      spacing: {
        blockGap: "1.5rem",
      },
      elements: {
        heading: {
          typography: {
            fontFamily: "var(--wp--preset--font-family--heading)",
            fontWeight: preset.fonts.headingWeight,
            lineHeight: "1.2",
          },
          color: {
            text: "var(--wp--preset--color--text)",
          },
        },
        h1: {
          typography: { fontSize: preset.headingSizes.h1 },
        },
        h2: {
          typography: { fontSize: preset.headingSizes.h2 },
          spacing: { margin: { top: preset.sectionPadding, bottom: "1rem" } },
        },
        h3: {
          typography: { fontSize: preset.headingSizes.h3 },
        },
        h4: {
          typography: { fontSize: preset.headingSizes.h4 },
        },
        link: {
          color: {
            text: "var(--wp--preset--color--primary)",
          },
          ":hover": {
            color: {
              text: "var(--wp--preset--color--accent)",
            },
          },
        },
        button: {
          typography: {
            fontSize: preset.button.fontSize,
            fontWeight: preset.button.fontWeight,
            textTransform: preset.button.textTransform,
            letterSpacing: preset.button.letterSpacing,
          },
          color: {
            background: "var(--wp--preset--color--primary)",
            text: "var(--wp--preset--color--background)",
          },
          border: {
            radius: preset.button.borderRadius,
          },
          spacing: {
            padding: {
              top: preset.button.paddingVertical,
              bottom: preset.button.paddingVertical,
              left: preset.button.paddingHorizontal,
              right: preset.button.paddingHorizontal,
            },
          },
          ":hover": {
            color: {
              background: "var(--wp--preset--color--accent)",
            },
          },
        },
      },
      blocks: {
        "core/group": {
          spacing: {
            padding: {
              top: preset.sectionPadding,
              bottom: preset.sectionPadding,
            },
          },
        },
        "core/columns": {
          spacing: {
            blockGap: "2rem",
          },
        },
        "core/separator": {
          color: {
            background: "var(--wp--preset--color--border)",
          },
          spacing: {
            margin: {
              top: preset.sectionPadding,
              bottom: preset.sectionPadding,
            },
          },
        },
        "core/quote": {
          typography: {
            fontFamily: "var(--wp--preset--font-family--heading)",
            fontStyle: "italic",
          },
          border: {
            left: {
              color: "var(--wp--preset--color--primary)",
              width: "4px",
            },
          },
        },
      },
    },
  };
}

/**
 * Legacy helper — builds a minimal WP global styles object.
 * @deprecated Use buildThemeJson() with a ThemePreset instead.
 */
export function buildWpGlobalStyles(
  primaryColors: string[],
  fontPreference: string
): Record<string, unknown> {
  const fonts = getFontPairForIndustry(fontPreference);

  return {
    settings: {
      color: {
        palette: [
          { slug: "primary", color: primaryColors[0] ?? "#1e40af", name: "Primary" },
          { slug: "secondary", color: primaryColors[1] ?? "#ffffff", name: "Secondary" },
          { slug: "accent", color: primaryColors[2] ?? "#64748b", name: "Accent" },
        ],
      },
      typography: {
        fontFamilies: [
          { slug: "heading", fontFamily: fonts.heading, name: "Heading" },
          { slug: "body", fontFamily: fonts.body, name: "Body" },
        ],
      },
    },
  };
}
