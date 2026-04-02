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

export function ServicesOverlayCards({
  section_title = "Our Services",
  section_subtitle = "Crafted with care and delivered with excellence.",
  service_1_name = "Premium Consulting",
  service_1_desc = "Strategic guidance tailored to elevate your business to new heights.",
  service_2_name = "Creative Design",
  service_2_desc = "Bespoke visual solutions that capture the essence of your brand.",
  service_3_name = "Expert Execution",
  service_3_desc = "Flawless delivery that transforms your vision into reality.",
}: Props) {
  const t = getTheme();
  const { ref: sectionRef, visible } = useScrollReveal(0.1);

  const services = [
    { name: service_1_name, desc: service_1_desc, number: "01" },
    { name: service_2_name, desc: service_2_desc, number: "02" },
    { name: service_3_name, desc: service_3_desc, number: "03" },
  ];

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
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Section header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "4rem",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 400,
              color: "#ffffff",
              fontFamily: t.fonts.heading,
              margin: 0,
              lineHeight: 1.15,
            }}
          >
            {section_title}
          </h2>

          {/* Thin accent line below title */}
          <div
            style={{
              width: "50px",
              height: "1px",
              background: t.colors.primary,
              margin: "1.5rem auto",
            }}
          />

          <p
            style={{
              fontSize: "1rem",
              color: "rgba(255,255,255,0.5)",
              margin: 0,
              fontFamily: t.fonts.body,
            }}
          >
            {section_subtitle}
          </p>
        </div>

        {/* Cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {services.map((service, index) => (
            <div
              key={index}
              style={{
                position: "relative",
                minHeight: "400px",
                padding: "2.5rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                overflow: "hidden",
                transition: "all 0.5s ease",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(40px)",
                transitionDelay: `${index * 0.15}s`,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${t.colors.primary}66`;
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              }}
            >
              {/* Large number overlay */}
              <span
                style={{
                  position: "absolute",
                  top: "1.5rem",
                  right: "1.5rem",
                  fontSize: "6rem",
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.04)",
                  fontFamily: t.fonts.heading,
                  lineHeight: 1,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                {service.number}
              </span>

              {/* Service content */}
              <div style={{ position: "relative", zIndex: 1 }}>
                <h3
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 400,
                    color: "#ffffff",
                    fontFamily: t.fonts.heading,
                    margin: "0 0 1rem 0",
                    lineHeight: 1.3,
                  }}
                >
                  {service.name}
                </h3>
                <p
                  style={{
                    fontSize: "0.95rem",
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.5)",
                    margin: 0,
                    fontFamily: t.fonts.body,
                  }}
                >
                  {service.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
