import { getTheme } from "../theme";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface Props {
  quote?: string;
  name?: string;
  title?: string;
}

export function TestimonialEditorial({
  quote = "An extraordinary experience from start to finish. The attention to detail and commitment to excellence exceeded all expectations.",
  name = "Alexandra Bennett",
  title = "Creative Director",
}: Props) {
  const t = getTheme();
  const { ref: sectionRef, visible } = useScrollReveal(0.15);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      style={{
        background: "#0a0a0a",
        padding: "8rem 2rem",
        fontFamily: t.fonts.body,
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          textAlign: "center",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 1s ease, transform 1s ease",
        }}
      >
        {/* Oversized decorative opening quote */}
        <div
          style={{
            fontSize: "8rem",
            lineHeight: 0.8,
            fontFamily: t.fonts.heading,
            color: `${t.colors.primary}4D`,
            margin: "0 0 1rem 0",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {"\u201C"}
        </div>

        {/* Quote text */}
        <blockquote
          style={{
            fontSize: "1.35rem",
            fontStyle: "italic",
            fontWeight: 400,
            lineHeight: 1.9,
            color: "rgba(255,255,255,0.8)",
            fontFamily: t.fonts.heading,
            margin: 0,
            padding: 0,
            border: "none",
          }}
        >
          {quote}
        </blockquote>

        {/* Attribution */}
        <div style={{ marginTop: "2.5rem" }}>
          {/* Thin accent line */}
          <div
            style={{
              width: "40px",
              height: "1px",
              background: t.colors.primary,
              margin: "0 auto 1.5rem auto",
            }}
          />

          <p
            style={{
              fontSize: "0.85rem",
              fontWeight: 500,
              color: "rgba(255,255,255,0.5)",
              margin: 0,
              fontVariant: "small-caps",
              letterSpacing: "0.1em",
              fontFamily: t.fonts.body,
            }}
          >
            {"\u2014"} {name}, {title}
          </p>
        </div>
      </div>
    </section>
  );
}
