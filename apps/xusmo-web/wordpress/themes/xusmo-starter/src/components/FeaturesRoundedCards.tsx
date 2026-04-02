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

const ICON_PATHS = [
  "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
  "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
];

export function FeaturesRoundedCards({
  section_title = "Why Teams Choose Us",
  section_subtitle = "Everything you need to grow faster.",
  feature_1_title = "Lightning Fast",
  feature_1_desc = "Optimized for speed so you never keep your customers waiting.",
  feature_2_title = "Reliable & Secure",
  feature_2_desc = "Enterprise-grade security with 99.9% uptime guarantee.",
  feature_3_title = "Easy to Use",
  feature_3_desc = "Intuitive interface that your whole team will love from day one.",
  feature_4_title = "24/7 Support",
  feature_4_desc = "Our team is always here to help whenever you need us.",
}: Props) {
  const t = getTheme();
  const { ref, visible } = useScrollReveal(0.1);

  const features = [
    { title: feature_1_title, desc: feature_1_desc, icon: ICON_PATHS[0] },
    { title: feature_2_title, desc: feature_2_desc, icon: ICON_PATHS[1] },
    { title: feature_3_title, desc: feature_3_desc, icon: ICON_PATHS[2] },
    { title: feature_4_title, desc: feature_4_desc, icon: ICON_PATHS[3] },
  ];

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{
        padding: "7rem 2rem",
        background: "#ffffff",
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
            Features
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
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                padding: "2.25rem",
                borderRadius: "24px",
                background: t.colors.surface,
                boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
                transition: `all 0.4s ease ${i * 0.08}s`,
                cursor: "default",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
                border: "2px solid transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.1)";
                e.currentTarget.style.borderColor = `${t.colors.primary}33`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.06)";
                e.currentTarget.style.borderColor = "transparent";
              }}
            >
              {/* Icon circle */}
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.accent})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={f.icon} />
                </svg>
              </div>

              <h3
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: t.colors.text,
                  fontFamily: t.fonts.heading,
                  margin: "0 0 0.6rem",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: "0.95rem",
                  lineHeight: 1.65,
                  color: t.colors.textMuted,
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
