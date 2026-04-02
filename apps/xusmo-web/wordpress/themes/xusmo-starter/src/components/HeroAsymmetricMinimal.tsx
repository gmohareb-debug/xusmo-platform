import { useEffect, useState } from "react";
import { getTheme } from "../theme";

interface Props {
  headline?: string;
  description?: string;
  cta_primary?: string;
  stat_1_number?: string;
  stat_1_label?: string;
  stat_2_number?: string;
  stat_2_label?: string;
  imageUrl?: string;
}

export function HeroAsymmetricMinimal({
  headline = "Crafted With Intention",
  description = "A thoughtful approach to design that values simplicity, purpose, and timeless beauty in every detail.",
  cta_primary = "View Our Work",
  stat_1_number = "500+",
  stat_1_label = "Projects Completed",
  stat_2_number = "10+",
  stat_2_label = "Years of Practice",
  imageUrl,
}: Props) {
  const t = getTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const hasImage = imageUrl && imageUrl.length > 0;

  return (
    <section
      style={{
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        background: t.colors.background,
        padding: "5rem 3rem",
        fontFamily: t.fonts.body,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          gap: "4rem",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 1s ease, transform 1s ease",
        }}
      >
        {/* Left side — 45% text */}
        <div style={{ flex: "0 0 45%", maxWidth: "45%" }}>
          {/* Small uppercase tracking label */}
          <p
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: t.colors.textMuted,
              fontFamily: t.fonts.body,
              margin: "0 0 1.5rem 0",
            }}
          >
            Studio
          </p>

          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 400,
              lineHeight: 1.1,
              color: t.colors.text,
              fontFamily: t.fonts.heading,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            {headline}
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: "1.05rem",
              lineHeight: 1.8,
              color: t.colors.textMuted,
              fontFamily: t.fonts.body,
              marginTop: "1.75rem",
              maxWidth: "420px",
            }}
          >
            {description}
          </p>

          {/* CTA text link */}
          <div style={{ marginTop: "2.5rem" }}>
            <a
              href="/contact/"
              style={{
                color: t.colors.text,
                fontSize: "0.95rem",
                fontFamily: t.fonts.body,
                textDecoration: "underline",
                textUnderlineOffset: "6px",
                textDecorationThickness: "1px",
                textDecorationColor: t.colors.text,
                cursor: "pointer",
                transition: "color 0.3s ease, text-decoration-color 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = t.colors.primary;
                e.currentTarget.style.textDecorationColor = t.colors.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = t.colors.text;
                e.currentTarget.style.textDecorationColor = t.colors.text;
              }}
            >
              {cta_primary}
            </a>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: "3rem",
              marginTop: "4rem",
              alignItems: "baseline",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: 400,
                  color: t.colors.text,
                  fontFamily: t.fonts.heading,
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                {stat_1_number}
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: t.colors.textMuted,
                  marginTop: "0.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontFamily: t.fonts.body,
                }}
              >
                {stat_1_label}
              </p>
            </div>

            {/* Thin separator */}
            <div
              style={{
                width: "1px",
                height: "36px",
                background: t.colors.border,
              }}
            />

            <div>
              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: 400,
                  color: t.colors.text,
                  fontFamily: t.fonts.heading,
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                {stat_2_number}
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: t.colors.textMuted,
                  marginTop: "0.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontFamily: t.fonts.body,
                }}
              >
                {stat_2_label}
              </p>
            </div>
          </div>
        </div>

        {/* Right side — 55% image */}
        <div style={{ flex: "0 0 55%", maxWidth: "55%" }}>
          {hasImage ? (
            <img
              fetchPriority="high"
              src={imageUrl}
              alt={headline}
              style={{
                width: "100%",
                height: "70vh",
                objectFit: "cover",
                borderRadius: "4px",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "70vh",
                background: t.colors.surface,
                borderRadius: "4px",
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
