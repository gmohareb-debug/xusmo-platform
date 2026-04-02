import { getTheme } from "../theme";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface Props {
  headline?: string;
  description?: string;
  cta_text?: string;
}

export function CtaWarmGradient({
  headline = "Ready to Join Our Family?",
  description = "We would love to welcome you and show you what makes us special.",
  cta_text = "Get in Touch",
}: Props) {
  const t = getTheme();
  const { ref, visible } = useScrollReveal(0.1);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{
        padding: "6rem 2rem",
        textAlign: "center",
        fontFamily: t.fonts.body,
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.accent})`,
      }}
    >
      {/* Decorative organic blobs */}
      <div
        style={{
          position: "absolute",
          top: "-60px",
          left: "-60px",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-50px",
          right: "-50px",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "800px",
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
            fontSize: "clamp(2rem, 4vw, 2.75rem)",
            fontWeight: 700,
            lineHeight: 1.15,
            color: "#ffffff",
            fontFamily: t.fonts.heading,
            margin: 0,
          }}
        >
          {headline}
        </h2>

        <p
          style={{
            fontSize: "1.05rem",
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
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.2)";
          }}
        >
          {cta_text} <span style={{ fontSize: "1.2rem" }}>{"\u2192"}</span>
        </a>
      </div>
    </section>
  );
}
