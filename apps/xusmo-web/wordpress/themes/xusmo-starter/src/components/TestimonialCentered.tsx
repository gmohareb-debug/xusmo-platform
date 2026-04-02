import { getTheme } from "../theme";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface Props {
  quote?: string;
  name?: string;
  title?: string;
}

export function TestimonialCentered({
  quote = "Their thoughtful approach transformed our brand into something we are truly proud of. Every detail was considered with care.",
  name = "Catherine Mercer",
  title = "Studio Director",
}: Props) {
  const t = getTheme();
  const { ref, visible } = useScrollReveal(0.15);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{
        background: t.colors.background,
        padding: "5rem 2rem",
        fontFamily: t.fonts.body,
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          textAlign: "center",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        {/* Thin horizontal line above */}
        <div
          style={{
            width: "60px",
            height: "1px",
            background: t.colors.border,
            margin: "0 auto 3rem auto",
          }}
        />

        {/* Quote */}
        <blockquote
          style={{
            fontSize: "1.25rem",
            fontWeight: 400,
            fontStyle: "italic",
            lineHeight: 1.9,
            color: t.colors.text,
            fontFamily: t.fonts.heading,
            margin: 0,
            padding: 0,
            border: "none",
          }}
        >
          {"\u201C"}{quote}{"\u201D"}
        </blockquote>

        {/* Attribution */}
        <p
          style={{
            fontSize: "0.9rem",
            color: t.colors.textMuted,
            fontFamily: t.fonts.body,
            marginTop: "2rem",
            fontStyle: "normal",
          }}
        >
          {"\u2014"} {name}, {title}
        </p>

        {/* Thin horizontal line below */}
        <div
          style={{
            width: "60px",
            height: "1px",
            background: t.colors.border,
            margin: "3rem auto 0 auto",
          }}
        />
      </div>
    </section>
  );
}
