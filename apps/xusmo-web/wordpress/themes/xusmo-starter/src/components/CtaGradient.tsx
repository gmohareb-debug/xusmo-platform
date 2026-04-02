import { useEffect, useState } from "react";
import { getTheme } from "../theme";

interface Props {
  headline?: string;
  description?: string;
  cta_text?: string;
}

export function CtaGradient({
  headline = "Ready to Transform Your Business?",
  description = "Join hundreds of satisfied customers who have taken their business to the next level.",
  cta_text = "Get Started Today",
}: Props) {
  const t = getTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    const el = document.getElementById("xusmo-cta-gradient");
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="xusmo-cta-gradient"
      style={{
        padding: "7rem 2rem",
        textAlign: "center",
        fontFamily: t.fonts.body,
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${t.colors.primary} 0%, ${t.colors.secondary} 100%)`,
      }}
    >
      {/* Decorative shapes */}
      <div style={{ position: "absolute", top: "-100px", left: "-100px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
      <div style={{ position: "absolute", bottom: "-80px", right: "-60px", width: "250px", height: "250px", borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.7s ease",
        }}
      >
        <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", fontWeight: 800, lineHeight: 1.1, color: "#ffffff", fontFamily: t.fonts.heading, margin: 0 }}>
          {headline}
        </h2>
        <p style={{ fontSize: "1.15rem", lineHeight: 1.7, color: "rgba(255,255,255,0.85)", marginTop: "1.25rem" }}>
          {description}
        </p>
        <a
          href="/contact/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "2.5rem",
            padding: "1rem 2.5rem",
            background: "#ffffff",
            color: t.colors.primary,
            borderRadius: "12px",
            fontSize: "1.05rem",
            fontWeight: 700,
            textDecoration: "none",
            transition: "all 0.3s ease",
            cursor: "pointer",
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
            e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.2)";
          }}
        >
          {cta_text}
          <span style={{ fontSize: "1.2rem" }}>→</span>
        </a>
      </div>
    </section>
  );
}
