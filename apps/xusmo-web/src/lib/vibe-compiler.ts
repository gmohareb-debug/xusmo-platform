/**
 * VibeCompiler
 *
 * Bridges Xusmo AI Theme specs to WordPress theme.json and React CSS variables.
 * Translates padding, typography, colors, borders into native configurations.
 */

interface VibeTheme {
  colors: Record<string, string>;
  fonts: Record<string, string> & { headingWeight?: string; bodyWeight?: string };
  headingSizes?: Record<string, string>;
  buttonStyle?: Record<string, string>;
  borderRadius?: Record<string, string>;
  sectionPadding?: string;
  contentSize?: string;
  wideSize?: string;
}

/**
 * Compiles a Xusmo Theme into a WordPress FSE theme.json object.
 */
export function compileVibeToWordPressThemeJson(theme: VibeTheme): Record<string, unknown> {
  return {
    version: 2,
    settings: {
      color: {
        palette: [
          { slug: "primary", color: theme.colors.primary || theme.colors.accent, name: "Primary" },
          { slug: "secondary", color: theme.colors.secondary || theme.colors.muted, name: "Secondary" },
          { slug: "accent", color: theme.colors.accent, name: "Accent" },
          { slug: "background", color: theme.colors.background, name: "Background" },
          { slug: "surface", color: theme.colors.surface, name: "Surface" },
          { slug: "text", color: theme.colors.text, name: "Text" },
          { slug: "text-muted", color: theme.colors.textMuted || theme.colors.muted, name: "Text Muted" },
          { slug: "border", color: theme.colors.border, name: "Border" },
        ],
        background: true,
        text: true,
      },
      typography: {
        fontFamilies: [
          {
            fontFamily: `"${theme.fonts.heading}", sans-serif`,
            slug: "heading",
            name: "Heading",
          },
          {
            fontFamily: `"${theme.fonts.body}", sans-serif`,
            slug: "body",
            name: "Body",
          },
        ],
        fluid: true,
      },
      spacing: {
        units: ["%", "px", "em", "rem", "vh", "vw"],
        padding: true,
        margin: true,
        customSpacingSize: true,
      },
      appearanceTools: true,
      layout: {
        contentSize: theme.contentSize || "1000px",
        wideSize: theme.wideSize || "1400px",
      },
    },
    styles: {
      color: {
        background: "var(--wp--preset--color--background)",
        text: "var(--wp--preset--color--text)",
      },
      typography: {
        fontFamily: "var(--wp--preset--font-family--body)",
        fontWeight: theme.fonts.bodyWeight || "400",
      },
      elements: {
        link: { color: { text: "var(--wp--preset--color--primary)" } },
        button: {
          border: { radius: theme.buttonStyle?.borderRadius || "8px" },
          typography: {
            textTransform: theme.buttonStyle?.textTransform || "none",
            letterSpacing: theme.buttonStyle?.letterSpacing || "0",
            fontWeight: theme.buttonStyle?.fontWeight || "600",
            fontSize: theme.buttonStyle?.fontSize || "1rem",
          },
          spacing: { padding: theme.buttonStyle?.padding || "0.75rem 2rem" },
          color: {
            background: "var(--wp--preset--color--primary)",
            text: "var(--wp--preset--color--background)",
          },
        },
        h1: {
          typography: {
            fontFamily: "var(--wp--preset--font-family--heading)",
            fontSize: theme.headingSizes?.h1 || "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: theme.fonts.headingWeight || "700",
          },
        },
        h2: {
          typography: {
            fontFamily: "var(--wp--preset--font-family--heading)",
            fontSize: theme.headingSizes?.h2 || "clamp(2rem, 4vw, 3rem)",
            fontWeight: theme.fonts.headingWeight || "700",
          },
        },
        h3: {
          typography: {
            fontFamily: "var(--wp--preset--font-family--heading)",
            fontSize: theme.headingSizes?.h3 || "clamp(1.5rem, 3vw, 2.25rem)",
            fontWeight: theme.fonts.headingWeight || "700",
          },
        },
        h4: {
          typography: {
            fontFamily: "var(--wp--preset--font-family--heading)",
            fontSize: theme.headingSizes?.h4 || "clamp(1.125rem, 2vw, 1.5rem)",
            fontWeight: theme.fonts.headingWeight || "700",
          },
        },
      },
      blocks: {
        "core/group": {
          spacing: {
            padding: {
              top: theme.sectionPadding || "4rem",
              bottom: theme.sectionPadding || "4rem",
            },
          },
        },
      },
    },
  };
}

/**
 * Compiles a Xusmo Theme into CSS variables for React/Next.js injection.
 */
export function compileVibeToReactCSS(theme: VibeTheme, scope = ":root"): string {
  return `
${scope} {
  /* Colors */
  --vibe-primary: ${theme.colors.primary || theme.colors.accent};
  --vibe-secondary: ${theme.colors.secondary || theme.colors.muted};
  --vibe-accent: ${theme.colors.accent};
  --vibe-background: ${theme.colors.background};
  --vibe-surface: ${theme.colors.surface};
  --vibe-text: ${theme.colors.text};
  --vibe-text-muted: ${theme.colors.textMuted || theme.colors.muted};
  --vibe-border: ${theme.colors.border};

  /* Typography */
  --vibe-font-heading: '${theme.fonts.heading}', sans-serif;
  --vibe-font-body: '${theme.fonts.body}', sans-serif;
  --vibe-font-weight-heading: ${theme.fonts.headingWeight || "700"};
  --vibe-font-weight-body: ${theme.fonts.bodyWeight || "400"};

  /* Heading Sizes */
  --vibe-h1-size: ${theme.headingSizes?.h1 || "clamp(2.5rem, 5vw, 4rem)"};
  --vibe-h2-size: ${theme.headingSizes?.h2 || "clamp(2rem, 4vw, 3rem)"};
  --vibe-h3-size: ${theme.headingSizes?.h3 || "clamp(1.5rem, 3vw, 2.25rem)"};
  --vibe-h4-size: ${theme.headingSizes?.h4 || "clamp(1.125rem, 2vw, 1.5rem)"};

  /* Layout */
  --vibe-content-max-width: ${theme.contentSize || "1000px"};
  --vibe-content-wide-width: ${theme.wideSize || "1400px"};
  --vibe-section-padding: ${theme.sectionPadding || "4rem"};

  /* Radius */
  --vibe-radius-sm: ${theme.borderRadius?.small || "4px"};
  --vibe-radius-md: ${theme.borderRadius?.medium || "8px"};
  --vibe-radius-lg: ${theme.borderRadius?.large || "16px"};

  /* Buttons */
  --vibe-button-radius: ${theme.buttonStyle?.borderRadius || "8px"};
  --vibe-button-padding: ${theme.buttonStyle?.padding || "0.75rem 2rem"};
  --vibe-button-weight: ${theme.buttonStyle?.fontWeight || "600"};
}
`;
}
