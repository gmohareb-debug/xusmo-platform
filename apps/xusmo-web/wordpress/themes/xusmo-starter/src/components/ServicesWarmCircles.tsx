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

export function ServicesWarmCircles({
  section_title = "How We Help",
  section_subtitle = "Simple, friendly, and always here for you.",
  service_1_name = "Personal Care",
  service_1_desc = "Every customer gets the individual attention they deserve.",
  service_2_name = "Community Focus",
  service_2_desc = "We are proud to be part of the neighborhoods we serve.",
  service_3_name = "Quality Promise",
  service_3_desc = "Only the best materials and practices, guaranteed.",
}: Props) {
  const t = getTheme();
  const { ref, visible } = useScrollReveal(0.1);

  const services = [
    { name: service_1_name, desc: service_1_desc, icon: "shield-check" },
    { name: service_2_name, desc: service_2_desc, icon: "users" },
    { name: service_3_name, desc: service_3_desc, icon: "heart" },
  ];

  const renderIcon = (icon: string) => {
    switch (icon) {
      case "shield-check":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={t.colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        );
      case "users":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={t.colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
        );
      case "heart":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={t.colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{
        padding: "7rem 2rem",
        background: t.colors.background,
        fontFamily: t.fonts.body,
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <p
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: t.colors.primary,
              margin: "0 0 0.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            <span style={{ fontSize: "0.5rem", lineHeight: 1 }}>{"\u25CF"}</span>
            Our Services
          </p>
          <h2
            style={{
              fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
              fontWeight: 700,
              color: t.colors.text,
              fontFamily: t.fonts.heading,
              margin: 0,
            }}
          >
            {section_title}
          </h2>
          <p
            style={{
              fontSize: "1.1rem",
              color: t.colors.textMuted,
              marginTop: "1rem",
              maxWidth: "500px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {section_subtitle}
          </p>
        </div>

        {/* Service circles grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "2.5rem",
          }}
        >
          {services.map((service, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                transition: `all 0.5s ease ${i * 0.15}s`,
              }}
            >
              {/* Circle icon */}
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${t.colors.primary}15, ${t.colors.accent}15)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  transition: "all 0.3s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.1)";
                  e.currentTarget.style.boxShadow = `0 8px 30px ${t.colors.primary}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {renderIcon(service.icon)}
              </div>

              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: t.colors.text,
                  fontFamily: t.fonts.heading,
                  margin: "0 0 0.5rem",
                }}
              >
                {service.name}
              </h3>

              <p
                style={{
                  fontSize: "0.95rem",
                  lineHeight: 1.65,
                  color: t.colors.textMuted,
                  margin: 0,
                  maxWidth: "280px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
