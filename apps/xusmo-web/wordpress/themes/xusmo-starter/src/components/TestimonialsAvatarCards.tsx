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

export function TestimonialsAvatarCards({
  section_title = "Loved by Thousands",
  section_subtitle = "See what our customers are saying.",
  quote_1 = "This completely transformed how we work. Incredible product!",
  name_1 = "Sarah Chen",
  title_1 = "Startup Founder",
  quote_2 = "The best decision we made for our business this year.",
  name_2 = "Marcus Johnson",
  title_2 = "Head of Growth",
  quote_3 = "Outstanding support and an even better product.",
  name_3 = "Emily Rodriguez",
  title_3 = "Product Manager",
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
          <p
            style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              color: t.colors.primary,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              margin: "0 0 0.75rem",
            }}
          >
            Testimonials
          </p>
          <h2
            style={{
              fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
              fontWeight: 800,
              color: t.colors.text,
              fontFamily: t.fonts.heading,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            {section_title}
          </h2>
          <p
            style={{
              fontSize: "1.1rem",
              color: t.colors.textMuted,
              marginTop: "1rem",
              maxWidth: "560px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {section_subtitle}
          </p>
        </div>

        {/* Cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
          }}
        >
          {testimonials.map((item, i) => (
            <div
              key={i}
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                borderTop: `4px solid ${t.colors.primary}`,
                padding: "2.5rem 2rem 2rem",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                transition: `all 0.4s ease ${i * 0.1}s`,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)";
              }}
            >
              {/* Avatar circle */}
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.accent})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "1.25rem",
                  fontFamily: t.fonts.heading,
                  marginTop: "-3.5rem",
                  marginBottom: "1.25rem",
                  border: "4px solid #ffffff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                {item.name[0]}
              </div>

              {/* Star rating */}
              <div style={{ marginBottom: "1.25rem" }}>
                <StarRating count={5} size={18} color="#f59e0b" />
              </div>

              {/* Quote */}
              <p
                style={{
                  fontSize: "1.05rem",
                  lineHeight: 1.75,
                  color: t.colors.text,
                  margin: "0 0 1.75rem",
                  fontStyle: "italic",
                }}
              >
                &ldquo;{item.quote}&rdquo;
              </p>

              {/* Name & title */}
              <div>
                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
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
                    margin: "0.25rem 0 0",
                  }}
                >
                  {item.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
