import { useEffect, useState } from "react";
import { getTheme } from "../theme";

interface Props {
  headline?: string;
  description?: string;
  cta_primary?: string;
  cta_secondary?: string;
  stat_1_number?: string;
  stat_1_label?: string;
  stat_2_number?: string;
  stat_2_label?: string;
  imageUrl?: string;
}

export function HeroWarmSplit({
  headline = "Welcome to a Better Experience",
  description = "We believe in creating warm, lasting relationships with every customer we serve.",
  cta_primary = "Get Started",
  cta_secondary = "Learn More",
  stat_1_number = "500+",
  stat_1_label = "Happy Families",
  stat_2_number = "10+",
  stat_2_label = "Years Serving You",
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
        position: "relative",
        overflow: "hidden",
        fontFamily: t.fonts.body,
        background: t.colors.surface || "#fdf8f4",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "5rem 3rem",
          display: "flex",
          alignItems: "center",
          gap: "4rem",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 1s ease, transform 1s ease",
        }}
      >
        {/* Left content — 55% */}
        <div style={{ flex: "1 1 55%" }}>
          {/* Friendly badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.4rem 1rem",
              borderRadius: "9999px",
              background: `${t.colors.primary}12`,
              color: t.colors.primary,
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: "1.5rem",
            }}
          >
            <span style={{ fontSize: "0.6rem", lineHeight: 1 }}>{"\u25CF"}</span>
            Welcome
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
              fontWeight: 700,
              lineHeight: 1.15,
              color: t.colors.text,
              fontFamily: t.fonts.heading,
              margin: 0,
            }}
          >
            {headline}
          </h1>

          <p
            style={{
              fontSize: "1.1rem",
              lineHeight: 1.8,
              color: t.colors.textMuted,
              marginTop: "1.5rem",
              maxWidth: "500px",
            }}
          >
            {description}
          </p>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "2.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <a
              href="/contact/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "1rem 2.25rem",
                background: t.colors.primary,
                color: "#ffffff",
                borderRadius: "9999px",
                fontSize: "1rem",
                fontWeight: 700,
                textDecoration: "none",
                transition: "all 0.3s ease",
                cursor: "pointer",
                boxShadow: `0 4px 20px ${t.colors.primary}40`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 8px 30px ${t.colors.primary}60`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 4px 20px ${t.colors.primary}40`;
              }}
            >
              {cta_primary}
            </a>
            <a
              href="#services"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "1rem 1.5rem",
                background: "transparent",
                color: t.colors.text,
                fontSize: "1rem",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.3s ease",
                cursor: "pointer",
                border: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = t.colors.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = t.colors.text;
              }}
            >
              {cta_secondary} <span style={{ fontSize: "1.1rem" }}>{"\u2192"}</span>
            </a>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "3rem", marginTop: "3.5rem" }}>
            <div>
              <p
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  color: t.colors.primary,
                  fontFamily: t.fonts.heading,
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                {stat_1_number}
              </p>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: t.colors.textMuted,
                  margin: "0.35rem 0 0",
                }}
              >
                {stat_1_label}
              </p>
            </div>
            <div
              style={{
                width: "1px",
                background: t.colors.border,
              }}
            />
            <div>
              <p
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  color: t.colors.primary,
                  fontFamily: t.fonts.heading,
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                {stat_2_number}
              </p>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: t.colors.textMuted,
                  margin: "0.35rem 0 0",
                }}
              >
                {stat_2_label}
              </p>
            </div>
          </div>
        </div>

        {/* Right — Image with organic blob — 45% */}
        {hasImage && (
          <div style={{ flex: "1 1 45%", position: "relative", display: "flex", justifyContent: "center" }}>
            {/* Organic blob behind image */}
            <div
              style={{
                position: "absolute",
                width: "300px",
                height: "300px",
                borderRadius: "50%",
                background: `${t.colors.primary}1A`,
                top: "-40px",
                right: "-40px",
                zIndex: 0,
              }}
            />

            <img
              fetchPriority="high"
              src={imageUrl}
              alt={headline}
              style={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                maxHeight: "500px",
                objectFit: "cover",
                borderRadius: "32px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
                display: "block",
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
