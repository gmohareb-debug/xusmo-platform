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
  if (theme.colors?.text) {
    fontRules.push(`color: ${theme.colors.text}`);
  }

  const allVars = [...vars, ...fontRules].join(";\n  ");
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

          // Tailwind-based background classes
          const bgClasses: Record<string, string> = {
            default: "bg-[var(--bg,var(--surface,#fff))]",
            surface: "bg-[var(--surface,#fff)]",
            muted: "bg-gray-50",
            accent: "bg-[var(--accent)]/5",
            "accent-light": "bg-[var(--accent-light,var(--accent))]/10",
            dark: "bg-gray-900 text-white",
            gradient:
              "bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent)]/[0.02]",
            none: "",
          };
          const padClasses: Record<string, string> = {
            none: "",
            sm: "py-6",
            md: "py-12 md:py-16",
            lg: "py-16 md:py-20",
            xl: "py-20 md:py-24",
          };
          const alignClasses: Record<string, string> = {
            center: "text-center",
            left: "text-left",
            right: "text-right",
          };

          const twBg = bgClasses[l.background || ""] || "";
          const twPad = padClasses[l.padding || ""] || "";
          const twAlign = alignClasses[l.align || ""] || "";
          const twFull =
            l.width === "full" ? "" : "max-w-[1200px] mx-auto px-5 md:px-8 lg:px-12";

          // Keep legacy classes for backwards compat with styles.css
          const legacyCls = [
            "site-section",
            l.background ? `site-section--bg-${l.background}` : "",
            l.padding ? `site-section--pad-${l.padding}` : "",
            l.width === "full" ? "site-section--full" : "",
            l.align ? `site-section--align-${l.align}` : "",
          ]
            .filter(Boolean)
            .join(" ");

          const styleTokens = { ...(section.style || {}) };

          return (
            <div
              className={`${legacyCls} ${twBg} ${twPad} ${twAlign}`.trim()}
              style={styleTokens}
              key={`${section.component}-${index}`}
            >
              <div className={`site-section__inner ${twFull}`.trim()}>
                <Component
                  {...(decodeUnicode(section.props) as Record<string, unknown>)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
