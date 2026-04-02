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

export function HeroSplitScreen({
  headline = "Grow Your Business With Confidence",
  description = "Our proven strategies and dedicated team will help you reach new heights.",
  cta_primary = "Get a Free Quote",
  cta_secondary = "Our Services",
  stat_1_number = "500+",
  stat_1_label = "Happy Clients",
  stat_2_number = "10+",
  stat_2_label = "Years Experience",
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
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: t.fonts.body,
        background: "#0a0a0a",
      }}
    >
      {/* Background image */}
      {hasImage && (
        <img
          fetchPriority="high"
          src={imageUrl}
          alt={headline}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            zIndex: 0,
          }}
        />
      )}

      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          background: hasImage
            ? "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.3) 100%)"
            : "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "6rem 3rem",
          display: "flex",
          alignItems: "center",
          gap: "4rem",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 1s ease, transform 1s ease",
        }}
      >
        {/* Left content */}
        <div style={{ flex: "1 1 60%" }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-block",
              padding: "0.4rem 1rem",
              borderRadius: "9999px",
              background: `${t.colors.primary}25`,
              border: `1px solid ${t.colors.primary}50`,
              color: t.colors.primary,
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: "1.5rem",
              letterSpacing: "0.05em",
            }}
          >
            {headline.split(" ").slice(0, 3).join(" ")}
          </div>

          <h1
            style={{
              fontSize: "clamp(2.75rem, 6vw, 4.5rem)",
              fontWeight: 800,
              lineHeight: 1.05,
              color: "#ffffff",
              fontFamily: t.fonts.heading,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            {headline}
          </h1>

          <p
            style={{
              fontSize: "1.2rem",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.7)",
              marginTop: "1.75rem",
              maxWidth: "520px",
            }}
          >
            {description}
          </p>

          <div style={{ display: "flex", gap: "1rem", marginTop: "2.5rem", flexWrap: "wrap" }}>
            <a
              href="/contact/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "1rem 2rem",
                background: t.colors.primary,
                color: "#ffffff",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: 700,
                textDecoration: "none",
                transition: "all 0.3s ease",
                cursor: "pointer",
                boxShadow: `0 4px 24px ${t.colors.primary}60`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 8px 32px ${t.colors.primary}80`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 4px 24px ${t.colors.primary}60`;
              }}
            >
              {cta_primary}
              <span style={{ fontSize: "1.2rem" }}>→</span>
            </a>
            <a
              href="#services"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "1rem 2rem",
                background: "rgba(255,255,255,0.08)",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
              }}
            >
              {cta_secondary}
            </a>
          </div>

          {/* Inline stats */}
          <div style={{ display: "flex", gap: "3rem", marginTop: "4rem" }}>
            <div>
              <p
                style={{
                  fontSize: "2.75rem",
                  fontWeight: 800,
                  color: t.colors.primary,
                  fontFamily: t.fonts.heading,
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                {stat_1_number}
              </p>
              <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", marginTop: "0.35rem" }}>
                {stat_1_label}
              </p>
            </div>
            <div style={{ width: "1px", background: "rgba(255,255,255,0.15)" }} />
            <div>
              <p
                style={{
                  fontSize: "2.75rem",
                  fontWeight: 800,
                  color: t.colors.primary,
                  fontFamily: t.fonts.heading,
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                {stat_2_number}
              </p>
              <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", marginTop: "0.35rem" }}>
                {stat_2_label}
              </p>
            </div>
          </div>
        </div>

        {/* Right — Image card */}
        {hasImage && (
          <div style={{ flex: "0 0 400px", position: "relative" }}>
            <div
              style={{
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <img
                loading="lazy"
                src={imageUrl}
                alt={headline}
                style={{ width: "100%", height: "480px", objectFit: "cover", display: "block" }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
