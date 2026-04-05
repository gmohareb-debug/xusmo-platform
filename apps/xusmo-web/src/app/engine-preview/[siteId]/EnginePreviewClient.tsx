"use client";

// =============================================================================
// Engine Preview Client — Renders engine-generated site sections using
// the 104 React components from @xusmo/engine's componentRegistry.
// Runs inside an iframe so component CSS is isolated from the studio.
// =============================================================================

import { useMemo, useEffect } from "react";
// @ts-expect-error — componentRegistry is a JS module with default export
import componentRegistry from "@xusmo/engine/components";

// ── Types for the engine's SiteDocument JSON ──

interface SectionDef {
  component: string;
  props: Record<string, unknown>;
  layout?: {
    background?: string;
    padding?: string;
    width?: string;
    align?: string;
  };
  style?: Record<string, string>;
}

interface PageData {
  page?: string;
  sections: SectionDef[];
}

interface ThemeDef {
  name?: string;
  colors?: {
    accent?: string;
    accentLight?: string;
    surface?: string;
    background?: string;
    text?: string;
    border?: string;
    muted?: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
  radius?: string;
}

interface DesignDocument {
  pages: Record<string, PageData>;
  theme?: ThemeDef;
  _plan?: Record<string, unknown>;
}

// ── Unicode decoder (same as PageRenderer.jsx) ──

function decodeUnicode(obj: unknown): unknown {
  if (typeof obj === "string") {
    let decoded = obj;
    decoded = decoded.replace(
      /\\u(D[89ABab][0-9a-fA-F]{2})\\u(D[C-Fc-f][0-9a-fA-F]{2})/g,
      (_, hi, lo) => {
        try {
          const code =
            (parseInt(hi, 16) - 0xd800) * 0x400 +
            (parseInt(lo, 16) - 0xdc00) +
            0x10000;
          return String.fromCodePoint(code);
        } catch {
          return _;
        }
      }
    );
    decoded = decoded.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );
    return decoded;
  }
  if (Array.isArray(obj)) return obj.map(decodeUnicode);
  if (obj && typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = decodeUnicode(v);
    }
    return out;
  }
  return obj;
}

// ── Build CSS custom properties from theme ──

function buildThemeCSS(theme?: ThemeDef): string {
  if (!theme) return "";
  const vars: string[] = [];
  if (theme.colors) {
    const map: Record<string, string> = {
      accent: "--accent",
      accentLight: "--accent-light",
      surface: "--surface",
      background: "--bg",
      text: "--text",
      border: "--border",
      muted: "--muted",
    };
    for (const [key, cssVar] of Object.entries(map)) {
      const val = theme.colors[key as keyof typeof theme.colors];
      if (val) vars.push(`${cssVar}: ${val}`);
    }
  }
  if (theme.radius) vars.push(`--radius: ${theme.radius}`);

  const fontRules: string[] = [];
  const googleFonts: string[] = [];
  if (theme.fonts?.heading) {
    fontRules.push(`--font-heading: '${theme.fonts.heading}', serif`);
    googleFonts.push(
      theme.fonts.heading.replace(/ /g, "+") + ":wght@400;600;700"
    );
  }
  if (theme.fonts?.body) {
    fontRules.push(`--font-body: '${theme.fonts.body}', system-ui, sans-serif`);
    fontRules.push(`font-family: var(--font-body)`);
    googleFonts.push(
      theme.fonts.body.replace(/ /g, "+") + ":wght@400;500;600;700"
    );
  }
  if (theme.colors?.background) {
    fontRules.push(`background-color: ${theme.colors.background}`);
  }
  // Don't set color: directly on :root — it overrides component-level Tailwind classes.
  // The --text CSS variable is already set above; components use text-[var(--text,...)]

  // Vibe compiler variables — heading sizes, button styles, section padding
  const vibeVars: string[] = [];
  const t = theme as Record<string, unknown>;
  const headingSizes = t.headingSizes as Record<string, string> | undefined;
  if (headingSizes) {
    if (headingSizes.h1) vibeVars.push(`--vibe-h1-size: ${headingSizes.h1}`);
    if (headingSizes.h2) vibeVars.push(`--vibe-h2-size: ${headingSizes.h2}`);
    if (headingSizes.h3) vibeVars.push(`--vibe-h3-size: ${headingSizes.h3}`);
    if (headingSizes.h4) vibeVars.push(`--vibe-h4-size: ${headingSizes.h4}`);
  }
  const buttonStyle = t.buttonStyle as Record<string, string> | undefined;
  if (buttonStyle) {
    if (buttonStyle.borderRadius) vibeVars.push(`--vibe-button-radius: ${buttonStyle.borderRadius}`);
    if (buttonStyle.padding) vibeVars.push(`--vibe-button-padding: ${buttonStyle.padding}`);
    if (buttonStyle.fontWeight) vibeVars.push(`--vibe-button-weight: ${buttonStyle.fontWeight}`);
  }
  const borderRadius = t.borderRadius as Record<string, string> | undefined;
  if (borderRadius) {
    if (borderRadius.small) vibeVars.push(`--vibe-radius-sm: ${borderRadius.small}`);
    if (borderRadius.medium) vibeVars.push(`--vibe-radius-md: ${borderRadius.medium}`);
    if (borderRadius.large) vibeVars.push(`--vibe-radius-lg: ${borderRadius.large}`);
  }
  if (t.sectionPadding) vibeVars.push(`--vibe-section-padding: ${t.sectionPadding as string}`);
  if (t.contentSize) vibeVars.push(`--vibe-content-max-width: ${t.contentSize as string}`);

  const allVars = [...vars, ...fontRules, ...vibeVars].join(";\n  ");
  const googleLink = googleFonts.length
    ? `@import url('https://fonts.googleapis.com/css2?family=${googleFonts.join("&family=")}&display=swap');`
    : "";

  return `${googleLink}\n:root {\n  ${allVars};\n}\nh1,h2,h3,h4,h5,h6 { font-family: var(--font-heading, inherit); }`;
}

// ── Main component ──

export default function EnginePreviewClient({
  designDocument,
  businessName,
  activePageSlug,
}: {
  designDocument: Record<string, unknown>;
  businessName: string;
  activePageSlug: string;
}) {
  const doc = designDocument as unknown as DesignDocument;
  const theme = doc.theme;

  const pageData = useMemo(() => {
    if (!doc.pages) return null;
    const page = doc.pages[activePageSlug]; if (page) return page; if (activePageSlug === "home" && doc.pages.home) return doc.pages.home; return null;
  }, [doc.pages, activePageSlug]);

  const themeCSS = useMemo(() => buildThemeCSS(theme), [theme]);

  if (!pageData?.sections?.length) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontFamily: "system-ui, sans-serif",
          color: "#94A3B8",
          fontSize: 16,
        }}
      >
        No content for page &ldquo;{activePageSlug}&rdquo;
      </div>
    );
  }

  // Intercept all internal link clicks — navigate within preview, not to xusmo.com
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href) return;
      // Skip external links, anchors, mailto, tel
      if (href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      // Internal link like /about, /services, /contact
      e.preventDefault();
      const slug = href.replace(/^\//, "").split("/")[0] || "home";
      // Update URL with ?page= parameter to switch pages within the preview
      const url = new URL(window.location.href);
      url.searchParams.set("page", slug);
      window.history.pushState({}, "", url.toString());
      // Reload the page to re-render with the new page
      window.location.reload();
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeCSS }} />

      <div className="page">
        {pageData.sections.map((section, index) => {
          const Component =
            componentRegistry[section.component] as React.ComponentType<
              Record<string, unknown>
            > | undefined;

          if (!Component) {
            return (
              <div
                key={`missing-${index}`}
                style={{
                  padding: "16px 32px",
                  background: "#FEF3C7",
                  color: "#92400E",
                  fontSize: 13,
                  fontFamily: "monospace",
                }}
              >
                Unknown component: {section.component}
              </div>
            );
          }

          const l = section.layout || {};

          // Theme-aware background classes — use CSS variables, not hardcoded colors
          const bgClasses: Record<string, string> = {
            default: "",
            surface: "",
            muted: "",
            accent: "",
            "accent-light": "",
            dark: "",
            gradient: "",
            none: "",
          };
          // Use inline styles for backgrounds to properly reference CSS variables
          const bgStyles: Record<string, React.CSSProperties> = {
            default: { background: "var(--bg, #fff)" },
            surface: { background: "var(--surface, #fff)" },
            muted: { background: "color-mix(in srgb, var(--surface, #f8f9fa) 80%, var(--text, #000) 8%)" },
            accent: { background: "color-mix(in srgb, var(--accent, #3b82f6) 6%, var(--bg, #fff) 94%)" },
            "accent-light": { background: "color-mix(in srgb, var(--accent, #3b82f6) 10%, var(--bg, #fff) 90%)" },
            dark: { background: "color-mix(in srgb, var(--bg, #000) 95%, var(--text, #fff) 5%)", color: "var(--text, #fff)" },
            gradient: { background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 8%, var(--bg) 92%), var(--bg))" },
            none: {},
          };
          const padClasses: Record<string, string> = {
            none: "",
            sm: "py-4",
            md: "py-8 md:py-12",
            lg: "py-12 md:py-16",
            xl: "py-16 md:py-20",
          };
          const alignClasses: Record<string, string> = {
            center: "text-center",
            left: "text-left",
            right: "text-right",
          };

          const twBg = bgClasses[l.background || ""] || "";
          const sectionBgStyle = bgStyles[l.background || "default"] || bgStyles.default;
          const twPad = padClasses[l.padding || ""] || "";
          const twAlign = alignClasses[l.align || ""] || "";
          const isFullBleed = l.width === "full" || l.width === "fullbleed";
          const twFull = isFullBleed
            ? ""
            : "max-w-[1200px] mx-auto px-5 md:px-8 lg:px-12";

          const styleTokens = { ...sectionBgStyle, ...(section.style || {}) };

          return (
            <div
              className={`${twBg} ${twPad} ${twAlign}`.trim()}
              style={styleTokens}
              key={`${section.component}-${index}`}
            >
              {isFullBleed ? (
                <Component
                  {...(decodeUnicode(section.props) as Record<string, unknown>)}
                />
              ) : (
                <div className="max-w-[1200px] mx-auto px-5 md:px-8 lg:px-12">
                  <Component
                    {...(decodeUnicode(section.props) as Record<string, unknown>)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
