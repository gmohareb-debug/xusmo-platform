import { getTheme } from "../theme";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface Props {
  section_title?: string;
  section_subtitle?: string;
  service_1_name?: string;
  service_1_desc?: string;
  service_2_name?: string;
  service_2_desc?: string;
  service_3_name?: string;
  service_3_desc?: string;
}

function ServiceRow({
  index,
  number,
  name,
  description,
  delay,
}: {
  index: number;
  number: string;
  name: string;
  description: string;
  delay: number;
}) {
  const t = getTheme();
  const { ref, visible } = useScrollReveal(0.15);

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        display: "flex",
        flexDirection: index % 2 === 0 ? "row" : "row-reverse",
        alignItems: "center",
        gap: "3rem",
        padding: "3rem 0",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {/* Number + text side */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        {/* Large faint number */}
        <span
          style={{
            fontSize: "4rem",
            fontWeight: 300,
            color: t.colors.border,
            fontFamily: t.fonts.heading,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          {number}
        </span>

        <div>
          <h3
            style={{
              fontSize: "1.3rem",
              fontWeight: 400,
              color: t.colors.text,
              fontFamily: t.fonts.heading,
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {name}
          </h3>
          <p
            style={{
              fontSize: "0.95rem",
              lineHeight: 1.7,
              color: t.colors.textMuted,
              fontFamily: t.fonts.body,
              margin: "0.75rem 0 0 0",
            }}
          >
            {description}
          </p>
        </div>
      </div>

      {/* Empty spacer for the other side */}
      <div style={{ flex: 1 }} />
    </div>
  );
}

export function ServicesAlternatingRows({
  section_title = "What We Do",
  section_subtitle = "Services designed with care and delivered with precision.",
  service_1_name = "Brand Strategy",
  service_1_desc = "Defining your unique position in the market with clarity and purpose.",
  service_2_name = "Visual Identity",
  service_2_desc = "Crafting cohesive visual systems that tell your story beautifully.",
  service_3_name = "Digital Experience",
  service_3_desc = "Building thoughtful digital touchpoints that connect and inspire.",
}: Props) {
  const t = getTheme();

  const services = [
    { name: service_1_name, desc: service_1_desc },
    { name: service_2_name, desc: service_2_desc },
    { name: service_3_name, desc: service_3_desc },
  ];

  return (
    <section
      style={{
        background: t.colors.background,
        padding: "5rem 2rem",
        fontFamily: t.fonts.body,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Section header */}
        <div style={{ marginBottom: "4rem" }}>
          {/* Thin accent line */}
          <div
            style={{
              width: "40px",
              height: "1px",
              background: t.colors.primary,
              marginBottom: "1.5rem",
            }}
          />

          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 400,
              color: t.colors.text,
              fontFamily: t.fonts.heading,
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            {section_title}
          </h2>

          <p
            style={{
              fontSize: "1rem",
              lineHeight: 1.7,
              color: t.colors.textMuted,
              fontFamily: t.fonts.body,
              marginTop: "1rem",
              maxWidth: "450px",
            }}
          >
            {section_subtitle}
          </p>
        </div>

        {/* Service rows */}
        {services.map((service, i) => (
          <div key={i}>
            {/* Divider above each row (including the first) */}
            <div
              style={{
                width: "100%",
                height: "1px",
                background: t.colors.border,
              }}
            />

            <ServiceRow
              index={i}
              number={String(i + 1).padStart(2, "0")}
              name={service.name}
              description={service.desc}
              delay={i * 0.15}
            />
          </div>
        ))}

        {/* Final divider after the last row */}
        <div
          style={{
            width: "100%",
            height: "1px",
            background: t.colors.border,
          }}
        />
      </div>
    </section>
  );
}
