"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ThemeColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  bg?: string;
  surface?: string;
  text?: string;
  textMuted?: string;
  border?: string;
}

interface ThemeFonts {
  heading?: string;
  body?: string;
  headingWeight?: string;
  bodyWeight?: string;
  googleFontsUrl?: string;
}

export interface ThemePreviewData {
  id: string;
  name: string;
  slug: string;
  archetype: string;
  industryTags: string[];
  colors: ThemeColors;
  fonts: ThemeFonts;
  usageCount: number;
  rating: number;
}

interface ThemePreviewModalProps {
  theme: ThemePreviewData;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ThemePreviewModal({
  theme,
  onClose,
}: ThemePreviewModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const c = theme.colors;
  const f = theme.fonts;

  const headingFont = f.heading ?? "Inter";
  const bodyFont = f.body ?? "Inter";
  const primaryColor = c.primary ?? "#6366f1";
  const bgColor = c.bg ?? "#ffffff";
  const surfaceColor = c.surface ?? "#f9fafb";
  const textColor = c.text ?? "#111827";
  const mutedColor = c.textMuted ?? "#6b7280";
  const borderColor = c.border ?? "#e5e7eb";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] mx-4 rounded-2xl overflow-hidden shadow-2xl flex flex-col bg-white">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border bg-white">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-neutral-900">{theme.name}</h2>
            <Badge variant="outline">{theme.archetype}</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/interview?theme=${theme.id}`}>
              <Button size="sm">Use This Theme</Button>
            </Link>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              aria-label="Close preview"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Load Google Fonts */}
        {f.googleFontsUrl && (
          // eslint-disable-next-line @next/next/no-page-custom-font
          <link rel="stylesheet" href={f.googleFontsUrl} />
        )}

        {/* Preview content */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ backgroundColor: bgColor, color: textColor }}
        >
          {/* Navigation Bar */}
          <nav
            className="px-8 py-4 flex items-center justify-between border-b"
            style={{
              backgroundColor: surfaceColor,
              borderColor,
              fontFamily: bodyFont,
            }}
          >
            <span
              className="text-xl font-bold"
              style={{ fontFamily: headingFont, color: primaryColor }}
            >
              Sample Business
            </span>
            <div className="hidden sm:flex items-center gap-6 text-sm" style={{ color: mutedColor }}>
              <span className="hover:opacity-80 cursor-pointer">Home</span>
              <span className="hover:opacity-80 cursor-pointer">Services</span>
              <span className="hover:opacity-80 cursor-pointer">About</span>
              <span className="hover:opacity-80 cursor-pointer">Contact</span>
            </div>
            <span
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              Get a Quote
            </span>
          </nav>

          {/* Hero Section */}
          <section
            className="px-8 py-20 text-center"
            style={{ fontFamily: bodyFont }}
          >
            <h1
              className="text-4xl sm:text-5xl font-bold mb-4"
              style={{
                fontFamily: headingFont,
                fontWeight: f.headingWeight ?? "700",
                color: textColor,
              }}
            >
              Professional Services You Can Trust
            </h1>
            <p
              className="text-lg max-w-2xl mx-auto mb-8"
              style={{ color: mutedColor }}
            >
              We deliver exceptional results for your business. Let us help you
              succeed with our industry-leading expertise and dedicated team.
            </p>
            <div className="flex items-center justify-center gap-4">
              <span
                className="px-6 py-3 rounded-lg text-white font-semibold cursor-pointer text-sm"
                style={{ backgroundColor: primaryColor }}
              >
                Get Started Today
              </span>
              <span
                className="px-6 py-3 rounded-lg font-semibold cursor-pointer text-sm border-2"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                Learn More
              </span>
            </div>
          </section>

          {/* Services Grid */}
          <section
            className="px-8 py-16"
            style={{ backgroundColor: surfaceColor, fontFamily: bodyFont }}
          >
            <h2
              className="text-2xl font-bold text-center mb-10"
              style={{ fontFamily: headingFont, color: textColor }}
            >
              Our Services
            </h2>
            <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {["Service One", "Service Two", "Service Three"].map((svc) => (
                <div
                  key={svc}
                  className="rounded-xl p-6 text-center"
                  style={{
                    backgroundColor: bgColor,
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                    style={{
                      backgroundColor: `${primaryColor}15`,
                      color: primaryColor,
                    }}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3
                    className="font-semibold mb-2"
                    style={{ fontFamily: headingFont, color: textColor }}
                  >
                    {svc}
                  </h3>
                  <p className="text-sm" style={{ color: mutedColor }}>
                    Professional quality service delivered on time and on budget
                    every time.
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Testimonial */}
          <section
            className="px-8 py-16 text-center"
            style={{ fontFamily: bodyFont }}
          >
            <div
              className="max-w-2xl mx-auto rounded-2xl p-8"
              style={{
                backgroundColor: surfaceColor,
                border: `1px solid ${borderColor}`,
              }}
            >
              <p
                className="text-lg italic mb-4"
                style={{ color: textColor }}
              >
                &quot;Absolutely outstanding service! They exceeded our expectations
                and delivered incredible results. Highly recommended.&quot;
              </p>
              <p className="text-sm font-semibold" style={{ color: primaryColor }}>
                Jane Doe, Happy Customer
              </p>
            </div>
          </section>

          {/* Footer */}
          <footer
            className="px-8 py-8 text-center text-sm border-t"
            style={{
              backgroundColor: surfaceColor,
              borderColor,
              color: mutedColor,
              fontFamily: bodyFont,
            }}
          >
            <p>
              &copy; 2026 Sample Business. All rights reserved. Built with{" "}
              <span style={{ color: primaryColor, fontWeight: 600 }}>Xusmo</span>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
