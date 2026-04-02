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

export function HeroUppercase({
  headline = "Built to Perform",
  description = "Engineered solutions that deliver results. No compromises, no shortcuts.",
  cta_primary = "Get Started",
  stat_1_number = "500+",
  stat_1_label = "Projects Delivered",
  stat_2_number = "99.9%",
  stat_2_label = "Uptime",
  imageUrl,
}: Props) {
  const t = getTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const hasImage = imageUrl && imageUrl.length > 0;
  const mono = "JetBrains Mono, Fira Code, monospace";

  return (
    <section
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: t.fonts.body,
        background: "#0f0f0f",
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

      {/* Dark overlay */}
      {hasImage && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 1,
          }}
        />
      )}

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "4rem 2rem",
          textAlign: "center",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 1s ease, transform 1s ease",
        }}
      >
        {/* Monospace tagline */}
        <p
          style={{
            fontFamily: mono,
            fontSize: "0.8rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: t.colors.accent,
            margin: "0 0 2rem 0",
          }}
        >
          // precision engineering
        </p>

        {/* Massive uppercase headline */}
        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            fontWeight: 900,
            lineHeight: 1.05,
            color: "#ffffff",
            fontFamily: t.fonts.heading,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            margin: 0,
          }}
        >
          {headline}
        </h1>

        {/* Accent line */}
        <div
          style={{
            width: "80px",
            height: "3px",
            background: t.colors.accent,
            margin: "2rem auto",
          }}
        />

        {/* Description */}
        <p
          style={{
            fontSize: "1rem",
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.5)",
            fontFamily: t.fonts.body,
            maxWidth: "500px",
            margin: "0 auto",
          }}
        >
          {description}
        </p>

        {/* CTA button */}
        <div style={{ marginTop: "2.5rem" }}>
          <a
            href="/contact/"
            style={{
              display: "inline-block",
              padding: "1rem 2.5rem",
              borderRadius: 0,
              border: `2px solid ${t.colors.accent}`,
              background: "rgba(255,255,255,0.05)",
              color: t.colors.accent,
              fontSize: "0.85rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              textDecoration: "none",
              fontFamily: t.fonts.body,
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = t.colors.accent;
              e.currentTarget.style.color = "#0f0f0f";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = t.colors.accent;
            }}
          >
            {cta_primary}
          </a>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "4rem",
            marginTop: "5rem",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: "2.5rem",
                fontWeight: 900,
                color: t.colors.accent,
                fontFamily: mono,
                margin: 0,
                lineHeight: 1,
              }}
            >
              {stat_1_number}
            </p>
            <p
              style={{
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.4)",
                marginTop: "0.5rem",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                fontFamily: mono,
              }}
            >
              {stat_1_label}
            </p>
          </div>

          {/* Separator */}
          <div
            style={{
              width: "1px",
              height: "50px",
              background: "rgba(255,255,255,0.1)",
            }}
          />

          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: "2.5rem",
                fontWeight: 900,
                color: t.colors.accent,
                fontFamily: mono,
                margin: 0,
                lineHeight: 1,
              }}
            >
              {stat_2_number}
            </p>
            <p
              style={{
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.4)",
                marginTop: "0.5rem",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                fontFamily: mono,
              }}
            >
              {stat_2_label}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
