import { getTheme } from "../theme";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface Props {
  headline?: string;
  description?: string;
  cta_text?: string;
}

export function CtaBrightBorder({
  headline = "Ready to Build?",
  description = "Let's engineer something remarkable together.",
  cta_text = "Launch Project",
}: Props) {
  const t = getTheme();
  const { ref, visible } = useScrollReveal(0.2);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{
        padding: "6rem 2rem",
        background: "#0f0f0f",
        fontFamily: t.fonts.body,
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          border: `2px solid ${t.colors.accent}`,
          borderRadius: 0,
          padding: "4rem",
          textAlign: "center",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        {/* Headline */}
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            color: "#ffffff",
            fontFamily: t.fonts.heading,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            margin: 0,
          }}
        >
          {headline}
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: "1rem",
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.5)",
            fontFamily: t.fonts.body,
            marginTop: "1.25rem",
            marginBottom: 0,
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
              background: t.colors.accent,
              color: "#0f0f0f",
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
              e.currentTarget.style.background = "#0f0f0f";
              e.currentTarget.style.color = t.colors.accent;
              e.currentTarget.style.borderColor = t.colors.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = t.colors.accent;
              e.currentTarget.style.color = "#0f0f0f";
              e.currentTarget.style.borderColor = t.colors.accent;
            }}
          >
            {cta_text}
          </a>
        </div>
      </div>
    </section>
  );
}
