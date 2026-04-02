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

export function HeroCinematic({
  headline = "Transform Your Vision Into Reality",
  description = "We craft exceptional experiences with meticulous attention to detail and an unwavering commitment to excellence.",
  cta_primary = "Discover More",
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
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        fontFamily: t.fonts.body,
        background: "#000000",
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

      {/* Dark gradient overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 3rem 6rem 3rem",
          textAlign: "center",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 1.2s ease, transform 1.2s ease",
        }}
      >
        {/* Thin accent line */}
        <div
          style={{
            width: "60px",
            height: "1px",
            background: t.colors.primary,
            margin: "0 auto 2.5rem auto",
          }}
        />

        {/* Headline */}
        <h1
          style={{
            fontSize: "clamp(3rem, 7vw, 5.5rem)",
            fontWeight: 400,
            lineHeight: 1.05,
            color: "#ffffff",
            fontFamily: t.fonts.heading,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {headline}
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: "1.05rem",
            lineHeight: 1.8,
            color: "rgba(255,255,255,0.55)",
            marginTop: "1.75rem",
            maxWidth: "550px",
            marginLeft: "auto",
            marginRight: "auto",
            fontFamily: t.fonts.body,
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
              border: "1px solid rgba(255,255,255,0.3)",
              background: "transparent",
              color: "#ffffff",
              fontSize: "0.85rem",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              textDecoration: "none",
              fontFamily: t.fonts.body,
              transition: "all 0.4s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${t.colors.primary}`;
              e.currentTarget.style.color = t.colors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
              e.currentTarget.style.color = "#ffffff";
            }}
          >
            {cta_primary}
          </a>
        </div>

        {/* Stats at bottom */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "3rem",
            marginTop: "4.5rem",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: "2.5rem",
                fontWeight: 400,
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
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.4)",
                marginTop: "0.5rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: t.fonts.body,
              }}
            >
              {stat_1_label}
            </p>
          </div>

          {/* Thin separator line */}
          <div
            style={{
              width: "1px",
              height: "40px",
              background: "rgba(255,255,255,0.15)",
            }}
          />

          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: "2.5rem",
                fontWeight: 400,
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
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.4)",
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
    </section>
  );
}
