import { useEffect } from "react";
import { getTheme } from "../theme";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface Props {
  headline?: string;
  description?: string;
  cta_text?: string;
}

const MESH_STYLE_ID = "xusmo-mesh-keyframes";

export function CtaMeshBanner({
  headline = "Ready to Get Started?",
  description = "Join thousands of happy customers building something great.",
  cta_text = "Start Free Trial",
}: Props) {
  const t = getTheme();
  const { ref, visible } = useScrollReveal(0.2);

  useEffect(() => {
    if (document.getElementById(MESH_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = MESH_STYLE_ID;
    style.textContent = `
      @keyframes xusmoMesh {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      const existing = document.getElementById(MESH_STYLE_ID);
      if (existing) existing.remove();
    };
  }, []);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{
        padding: "7rem 2rem",
        textAlign: "center",
        fontFamily: t.fonts.body,
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(-45deg, ${t.colors.primary}, ${t.colors.secondary}, ${t.colors.accent}, ${t.colors.primary})`,
        backgroundSize: "400% 400%",
        animation: "xusmoMesh 12s ease infinite",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.7s ease",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            color: "#ffffff",
            fontFamily: t.fonts.heading,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          {headline}
        </h2>
        <p
          style={{
            fontSize: "1.15rem",
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.85)",
            marginTop: "1.25rem",
          }}
        >
          {description}
        </p>
        <a
          href="/contact/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "2.5rem",
            padding: "1rem 2.5rem",
            background: "#ffffff",
            color: t.colors.primary,
            borderRadius: "9999px",
            fontSize: "1.05rem",
            fontWeight: 700,
            textDecoration: "none",
            transition: "all 0.3s ease",
            cursor: "pointer",
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
            border: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 8px 36px rgba(0,0,0,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.2)";
          }}
        >
          {cta_text}
          <span style={{ fontSize: "1.1rem" }}>→</span>
        </a>
      </div>
    </section>
  );
}
