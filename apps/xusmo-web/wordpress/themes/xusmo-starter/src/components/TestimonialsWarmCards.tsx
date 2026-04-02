import { getTheme } from "../theme";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { StarRating } from "./shared/StarRating";

interface Props {
  section_title?: string;
  section_subtitle?: string;
  quote_1?: string;
  name_1?: string;
  title_1?: string;
  quote_2?: string;
  name_2?: string;
  title_2?: string;
  quote_3?: string;
  name_3?: string;
  title_3?: string;
}

export function TestimonialsWarmCards({
  section_title = "What Our Customers Say",
  section_subtitle = "Real stories from real people.",
  quote_1 = "They made us feel like family from the very first visit.",
  name_1 = "Maria Gonzalez",
  title_1 = "Local Resident",
  quote_2 = "Reliable, friendly, and always go the extra mile.",
  name_2 = "David Thompson",
  title_2 = "Small Business Owner",
  quote_3 = "I recommend them to everyone I know. Truly wonderful.",
  name_3 = "Jennifer Park",
  title_3 = "Community Member",
}: Props) {
  const t = getTheme();
  const { ref, visible } = useScrollReveal(0.1);

  const testimonials = [
    { quote: quote_1, name: name_1, role: title_1 },
    { quote: quote_2, name: name_2, role: title_2 },
    { quote: quote_3, name: name_3, role: title_3 },
  ];

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{
        padding: "7rem 2rem",
        background: t.colors.surface,
        fontFamily: t.fonts.body,
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
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

        {/* Testimonial cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {testimonials.map((item, i) => (
            <div
              key={i}
              style={{
                background: t.colors.background,
                borderRadius: "20px",
                borderLeft: `4px solid ${t.colors.primary}`,
                padding: "2rem",
                boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                transition: `all 0.4s ease ${i * 0.12}s`,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.04)";
              }}
            >
              {/* Star rating */}
              <div style={{ marginBottom: "1.25rem" }}>
                <StarRating count={5} size={18} color="#d97706" />
              </div>

              {/* Quote */}
              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: 1.75,
                  color: t.colors.text,
                  fontStyle: "italic",
                  margin: "0 0 1.75rem",
                }}
              >
                &ldquo;{item.quote}&rdquo;
              </p>

              {/* Author */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.accent})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "1rem",
                    fontFamily: t.fonts.heading,
                    flexShrink: 0,
                  }}
                >
                  {item.name[0]}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      color: t.colors.text,
                      margin: 0,
                      fontFamily: t.fonts.heading,
                    }}
                  >
                    {item.name}
                  </p>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: t.colors.textMuted,
                      margin: "0.15rem 0 0",
                    }}
                  >
                    {item.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
