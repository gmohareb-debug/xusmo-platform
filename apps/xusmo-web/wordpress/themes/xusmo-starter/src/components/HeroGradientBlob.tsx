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

export function HeroGradientBlob({
  headline = "Build Something Amazing Today",
  description = "We help ambitious businesses grow with cutting-edge solutions and creative strategies.",
  cta_primary = "Get Started Free",
  cta_secondary = "Watch Demo",
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

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: t.fonts.body,
        background: t.colors.background,
      }}
    >
      {/* Floating blob 1 — top-left */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          left: "-60px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: t.colors.primary,
          opacity: 0.15,
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      {/* Floating blob 2 — bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: "-100px",
          right: "-40px",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: t.colors.accent,
          opacity: 0.12,
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      {/* Floating blob 3 — center-right */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          right: "15%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: t.colors.primary,
          opacity: 0.08,
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          padding: "6rem 2rem",
          textAlign: "center",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.95)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        {/* Pill badge */}
        <div
          style={{
            display: "inline-block",
            padding: "0.4rem 1.25rem",
            borderRadius: "9999px",
            background: `${t.colors.primary}1a`,
            color: t.colors.primary,
            fontSize: "0.85rem",
            fontWeight: 600,
            marginBottom: "2rem",
            letterSpacing: "0.03em",
          }}
        >
          Welcome
        </div>

        {/* Gradient headline */}
        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 800,
            lineHeight: 1.08,
            fontFamily: t.fonts.heading,
            margin: 0,
            letterSpacing: "-0.02em",
            background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.accent})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          {headline}
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: "1.15rem",
            lineHeight: 1.7,
            color: t.colors.textMuted,
            marginTop: "1.5rem",
            maxWidth: "560px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {description}
        </p>

        {/* CTA buttons */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginTop: "2.5rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href="/contact/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.9rem 2rem",
              background: t.colors.primary,
              color: "#ffffff",
              borderRadius: "9999px",
              fontSize: "1rem",
              fontWeight: 700,
              textDecoration: "none",
              transition: "all 0.3s ease",
              cursor: "pointer",
              boxShadow: `0 4px 24px ${t.colors.primary}50`,
              border: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 8px 32px ${t.colors.primary}70`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = `0 4px 24px ${t.colors.primary}50`;
            }}
          >
            {cta_primary}
            <span style={{ fontSize: "1.1rem" }}>→</span>
          </a>
          <a
            href="#services"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.9rem 2rem",
              background: "transparent",
              color: t.colors.primary,
              border: `2px solid ${t.colors.primary}`,
              borderRadius: "9999px",
              fontSize: "1rem",
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${t.colors.primary}0d`;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {cta_secondary}
          </a>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "3rem",
            marginTop: "4rem",
            justifyContent: "center",
          }}
        >
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
    </section>
  );
}
