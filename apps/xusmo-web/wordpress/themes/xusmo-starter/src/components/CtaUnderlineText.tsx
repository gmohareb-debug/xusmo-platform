import { getTheme } from "../theme";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface Props {
  headline?: string;
  description?: string;
  cta_text?: string;
}

export function CtaUnderlineText({
  headline = "Let's Create Together",
  description = "We would love to hear about your next project.",
  cta_text = "Start a Conversation",
}: Props) {
  const t = getTheme();
  const { ref, visible } = useScrollReveal(0.15);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{
        background: t.colors.background,
        padding: "4rem 2rem",
        fontFamily: t.fonts.body,
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          textAlign: "center",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        {/* Headline */}
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 400,
            color: t.colors.text,
            fontFamily: t.fonts.heading,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {headline}
        </h2>

        {/* CTA text link with arrow */}
        <div style={{ marginTop: "2rem" }}>
          <a
            href="/contact/"
            style={{
              color: t.colors.text,
              fontSize: "1rem",
              fontFamily: t.fonts.body,
              textDecoration: "underline",
              textUnderlineOffset: "8px",
              textDecorationColor: t.colors.primary,
              textDecorationThickness: "2px",
              cursor: "pointer",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = t.colors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = t.colors.text;
            }}
          >
            {cta_text} {"\u2192"}
          </a>
        </div>
      </div>
    </section>
  );
}
