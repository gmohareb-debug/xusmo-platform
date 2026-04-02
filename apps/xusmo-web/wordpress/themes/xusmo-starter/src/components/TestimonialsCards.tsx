import { useEffect, useRef, useState } from "react";
import { getTheme } from "../theme";

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

export function TestimonialsCards({
  section_title = "What Our Clients Say",
  section_subtitle = "Real stories from real customers who trust us.",
  quote_1 = "Absolutely outstanding service from start to finish.",
  name_1 = "Sarah Johnson",
  title_1 = "Business Owner",
  quote_2 = "Professional, reliable, and incredibly talented.",
  name_2 = "Michael Chen",
  title_2 = "Marketing Director",
  quote_3 = "Every step was handled with care and expertise.",
  name_3 = "Emily Rodriguez",
  title_3 = "Homeowner",
}: Props) {
  const t = getTheme();
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const testimonials = [
    { quote: quote_1, name: name_1, role: title_1 },
    { quote: quote_2, name: name_2, role: title_2 },
    { quote: quote_3, name: name_3, role: title_3 },
  ];

  return (
    <section
      ref={ref}
      style={{
        padding: "7rem 2rem",
        background: "#0f172a",
        fontFamily: t.fonts.body,
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <p style={{ fontSize: "0.85rem", fontWeight: 700, color: t.colors.primary, textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 0.75rem" }}>
            Testimonials
          </p>
          <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)", fontWeight: 800, color: "#ffffff", fontFamily: t.fonts.heading, margin: 0, letterSpacing: "-0.02em" }}>
            {section_title}
          </h2>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.6)", marginTop: "1rem", maxWidth: "560px", marginLeft: "auto", marginRight: "auto" }}>
            {section_subtitle}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {testimonials.map((item, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "20px",
                padding: "2rem",
                transition: `all 0.4s ease ${i * 0.1}s`,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = `${t.colors.primary}60`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              }}
            >
              {/* Stars */}
              <div style={{ display: "flex", gap: "3px", marginBottom: "1.5rem" }}>
                {[...Array(5)].map((_, j) => (
                  <svg key={j} width="18" height="18" viewBox="0 0 20 20" fill="#f59e0b">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p style={{ fontSize: "1.05rem", lineHeight: 1.75, color: "rgba(255,255,255,0.85)", margin: "0 0 2rem", fontStyle: "italic" }}>
                "{item.quote}"
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.secondary})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "1rem",
                    fontFamily: t.fonts.heading,
                  }}
                >
                  {item.name[0]}
                </div>
                <div>
                  <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ffffff", margin: 0, fontFamily: t.fonts.heading }}>
                    {item.name}
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", margin: "0.15rem 0 0" }}>
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
