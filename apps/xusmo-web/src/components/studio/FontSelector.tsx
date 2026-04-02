"use client";

// =============================================================================
// FontSelector — Grid of Google Font pairs for heading + body selection
// Loads font previews via Google Fonts link tags, saves via API
// =============================================================================

import { useState, useEffect } from "react";
import {
  Type,
  Check,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FontSelectorProps {
  siteId: string;
  currentFonts: { heading: string; body: string };
}

interface FontPair {
  id: string;
  heading: string;
  headingWeight: string;
  body: string;
  bodyWeight: string;
  label: string;
  googleFontsUrl: string;
}

// ---------------------------------------------------------------------------
// Pre-defined font combinations
// ---------------------------------------------------------------------------

const FONT_PAIRS: FontPair[] = [
  {
    id: "inter-inter",
    heading: "Inter",
    headingWeight: "700",
    body: "Inter",
    bodyWeight: "400",
    label: "Modern Clean",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  },
  {
    id: "playfair-lato",
    heading: "Playfair Display",
    headingWeight: "700",
    body: "Lato",
    bodyWeight: "400",
    label: "Elegant",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lato:wght@400;700&display=swap",
  },
  {
    id: "oswald-roboto",
    heading: "Oswald",
    headingWeight: "600",
    body: "Roboto",
    bodyWeight: "400",
    label: "Bold Industrial",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Roboto:wght@400;500&display=swap",
  },
  {
    id: "syne-dmsans",
    heading: "Syne",
    headingWeight: "700",
    body: "DM Sans",
    bodyWeight: "400",
    label: "Creative",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap",
  },
  {
    id: "spacegrotesk-inter",
    heading: "Space Grotesk",
    headingWeight: "700",
    body: "Inter",
    bodyWeight: "400",
    label: "Tech",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500&display=swap",
  },
  {
    id: "cormorant-nunito",
    heading: "Cormorant Garamond",
    headingWeight: "600",
    body: "Nunito",
    bodyWeight: "400",
    label: "Classic",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Nunito:wght@400;600&display=swap",
  },
  {
    id: "montserrat-opensans",
    heading: "Montserrat",
    headingWeight: "700",
    body: "Open Sans",
    bodyWeight: "400",
    label: "Professional",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Open+Sans:wght@400;600&display=swap",
  },
  {
    id: "poppins-inter",
    heading: "Poppins",
    headingWeight: "600",
    body: "Inter",
    bodyWeight: "400",
    label: "Friendly",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500&display=swap",
  },
  {
    id: "baskerville-sourcesans",
    heading: "Libre Baskerville",
    headingWeight: "700",
    body: "Source Sans 3",
    bodyWeight: "400",
    label: "Literary",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;600&display=swap",
  },
  {
    id: "josefin-quicksand",
    heading: "Josefin Sans",
    headingWeight: "600",
    body: "Quicksand",
    bodyWeight: "400",
    label: "Playful",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600;700&family=Quicksand:wght@400;500;600&display=swap",
  },
  {
    id: "dmserif-dmsans",
    heading: "DM Serif Display",
    headingWeight: "400",
    body: "DM Sans",
    bodyWeight: "400",
    label: "Modern Serif",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500&display=swap",
  },
  {
    id: "archivo-inter",
    heading: "Archivo",
    headingWeight: "700",
    body: "Inter",
    bodyWeight: "400",
    label: "Geometric",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700&family=Inter:wght@400;500&display=swap",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FontSelector({
  siteId,
  currentFonts,
}: FontSelectorProps) {
  const [activePair, setActivePair] = useState<string | null>(() => {
    const match = FONT_PAIRS.find(
      (p) =>
        p.heading === currentFonts.heading && p.body === currentFonts.body
    );
    return match?.id ?? null;
  });
  const [applying, setApplying] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load Google Fonts link tags dynamically
  useEffect(() => {
    const loadedUrls = new Set<string>();
    FONT_PAIRS.forEach((pair) => {
      if (loadedUrls.has(pair.googleFontsUrl)) return;
      loadedUrls.add(pair.googleFontsUrl);

      const existingLink = document.querySelector(
        `link[href="${pair.googleFontsUrl}"]`
      );
      if (existingLink) return;

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = pair.googleFontsUrl;
      document.head.appendChild(link);
    });
  }, []);

  const applyFontPair = async (pair: FontPair) => {
    if (applying) return;
    setApplying(pair.id);
    setError(null);
    setToast(null);

    try {
      const res = await fetch(`/api/studio/${siteId}/design/fonts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heading: pair.heading,
          headingWeight: pair.headingWeight,
          body: pair.body,
          bodyWeight: pair.bodyWeight,
          googleFontsUrl: pair.googleFontsUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to apply fonts.");
      } else {
        setActivePair(pair.id);
        setToast(
          `"${pair.label}" fonts applied. Changes will appear within 60 seconds.`
        );
        setTimeout(() => setToast(null), 5000);
      }
    } catch {
      setError("Failed to apply fonts.");
    }

    setApplying(null);
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 12px",
            background: `${C.green}15`,
            border: `1px solid ${C.green}30`,
            borderRadius: 6,
            marginBottom: 14,
            fontSize: 12,
            color: C.green,
          }}
        >
          <Check size={14} /> {toast}
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 12px",
            background: `${C.red}15`,
            border: `1px solid ${C.red}30`,
            borderRadius: 6,
            marginBottom: 14,
            fontSize: 12,
            color: C.red,
          }}
        >
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* Font pair grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
        }}
      >
        {FONT_PAIRS.map((pair) => {
          const isActive = activePair === pair.id;
          const isApplying = applying === pair.id;

          return (
            <div
              key={pair.id}
              style={{
                background: C.surfaceAlt,
                border: `1px solid ${isActive ? C.accent : C.border}`,
                borderRadius: 8,
                padding: 12,
                position: "relative",
                transition: "border-color 0.15s",
              }}
            >
              {/* Active badge */}
              {isActive && (
                <span
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    fontSize: 8,
                    fontWeight: 700,
                    padding: "2px 5px",
                    borderRadius: 3,
                    background: `${C.accent}18`,
                    color: C.accent,
                  }}
                >
                  Active
                </span>
              )}

              {/* Style label */}
              <div
                style={{
                  fontSize: 10,
                  color: C.dim,
                  fontWeight: 600,
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {pair.label}
              </div>

              {/* Heading preview */}
              <div
                style={{
                  fontFamily: `"${pair.heading}", sans-serif`,
                  fontWeight: Number(pair.headingWeight),
                  fontSize: 16,
                  color: C.text,
                  lineHeight: 1.2,
                  marginBottom: 4,
                }}
              >
                {pair.heading}
              </div>

              {/* Body preview */}
              <div
                style={{
                  fontFamily: `"${pair.body}", sans-serif`,
                  fontWeight: Number(pair.bodyWeight),
                  fontSize: 11,
                  color: C.muted,
                  lineHeight: 1.4,
                  marginBottom: 10,
                }}
              >
                The quick brown fox jumps over the lazy dog.
              </div>

              {/* Font names */}
              <div
                style={{
                  fontSize: 9,
                  color: C.dim,
                  fontFamily: "monospace",
                  marginBottom: 8,
                }}
              >
                {pair.heading}
                {pair.body !== pair.heading ? ` / ${pair.body}` : ""}
              </div>

              {/* Apply button */}
              <button
                onClick={() => !isActive && applyFontPair(pair)}
                disabled={isActive || isApplying}
                style={{
                  width: "100%",
                  padding: "5px 0",
                  background: isActive ? "transparent" : C.accent,
                  border: isActive ? `1px solid ${C.accent}` : "none",
                  borderRadius: 5,
                  color: isActive ? C.accent : "#fff",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: isActive ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                {isActive ? (
                  <>
                    <Check size={11} /> Applied
                  </>
                ) : isApplying ? (
                  <>
                    <Loader2
                      size={11}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    Applying...
                  </>
                ) : (
                  <>
                    <Type size={11} /> Apply
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
