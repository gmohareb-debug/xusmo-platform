import { getTheme } from "../theme";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface Props {
  section_title?: string;
  section_subtitle?: string;
  feature_1_title?: string;
  feature_1_desc?: string;
  feature_2_title?: string;
  feature_2_desc?: string;
  feature_3_title?: string;
  feature_3_desc?: string;
  feature_4_title?: string;
  feature_4_desc?: string;
}

export function FeaturesNumberedGrid({
  section_title = "Our Capabilities",
  section_subtitle = "Precision-engineered solutions for every challenge.",
  feature_1_title = "Performance First",
  feature_1_desc = "Every solution optimized for maximum speed and efficiency.",
  feature_2_title = "Rock Solid",
  feature_2_desc = "Built on battle-tested foundations that never let you down.",
  feature_3_title = "Scalable Systems",
  feature_3_desc = "Architecture that grows with your business without breaking.",
  feature_4_title = "Data Driven",
  feature_4_desc = "Every decision backed by analytics and real-world metrics.",
}: Props) {
  const t = getTheme();
  const { ref, visible } = useScrollReveal(0.1);
  const mono = "JetBrains Mono, Fira Code, monospace";

  const features = [
    { title: feature_1_title, desc: feature_1_desc, num: "01" },
    { title: feature_2_title, desc: feature_2_desc, num: "02" },
    { title: feature_3_title, desc: feature_3_desc, num: "03" },
    { title: feature_4_title, desc: feature_4_desc, num: "04" },
  ];

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{
        padding: "7rem 2rem",
        background: "#0f0f0f",
        fontFamily: t.fonts.body,
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Section header */}
        <div
          style={{
            marginBottom: "4rem",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <p
            style={{
              fontFamily: mono,
              fontSize: "0.8rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: t.colors.accent,
              margin: "0 0 1rem 0",
            }}
          >
            Capabilities
          </p>
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              color: "#ffffff",
              fontFamily: t.fonts.heading,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              margin: 0,
            }}
          >
            {section_title}
          </h2>
          <p
            style={{
              fontSize: "1rem",
              color: "rgba(255,255,255,0.5)",
              marginTop: "1rem",
              maxWidth: "500px",
              fontFamily: t.fonts.body,
            }}
          >
            {section_subtitle}
          </p>
        </div>

        {/* Feature grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                padding: "2rem",
                borderRadius: 0,
                background: "rgba(255,255,255,0.03)",
                borderLeft: `3px solid ${t.colors.accent}`,
                transition: `all 0.5s ease ${i * 0.1}s`,
                cursor: "default",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              }}
            >
              {/* Large number */}
              <p
                style={{
                  fontFamily: mono,
                  fontSize: "3.5rem",
                  fontWeight: 900,
                  color: t.colors.accent,
                  opacity: 0.25,
                  margin: "0 0 1rem 0",
                  lineHeight: 1,
                }}
              >
                {f.num}
              </p>

              {/* Feature title */}
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  fontFamily: t.fonts.heading,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  margin: "0 0 0.75rem 0",
                }}
              >
                {f.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontSize: "0.9rem",
                  lineHeight: 1.65,
                  color: "rgba(255,255,255,0.5)",
                  fontFamily: t.fonts.body,
                  margin: 0,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
