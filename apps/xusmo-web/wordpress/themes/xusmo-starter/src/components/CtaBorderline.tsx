import { getTheme } from "../theme";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface Props {
  headline?: string;
  description?: string;
  cta_text?: string;
}

export function CtaBorderline({
  headline = "Ready to Begin?",
  description = "Let us craft something extraordinary together.",
  cta_text = "Get in Touch",
}: Props) {
  const t = getTheme();
  const { ref: sectionRef, visible } = useScrollReveal(0.15);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      style={{
        background: "#0a0a0a",
        padding: "7rem 2rem",
        fontFamily: t.fonts.body,
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          textAlign: "center",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.9s ease, transform 0.9s ease",
        }}
      >
        {/* Thin top accent line */}
        <div
          style={{
            width: "60px",
            height: "1px",
            background: t.colors.primary,
            margin: "0 auto 3rem auto",
          }}
        />

        {/* Headline */}
        <h2
          style={{
            fontSize: "2.5rem",
            fontWeight: 400,
            lineHeight: 1.15,
            color: "#ffffff",
            fontFamily: t.fonts.heading,
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
            marginTop: "1.25rem",
            fontFamily: t.fonts.body,
          }}
        >
          {description}
        </p>

        {/* CTA button */}
        <div style={{ marginTop: "2.75rem" }}>
          <a
            href="/contact/"
            style={{
              display: "inline-block",
              padding: "1rem 2.5rem",
              border: "1px solid rgba(255,255,255,0.25)",
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
              e.currentTarget.style.borderColor = t.colors.primary;
              e.currentTarget.style.color = t.colors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
              e.currentTarget.style.color = "#ffffff";
            }}
          >
            {cta_text}
          </a>
        </div>
      </div>
    </section>
  );
}
