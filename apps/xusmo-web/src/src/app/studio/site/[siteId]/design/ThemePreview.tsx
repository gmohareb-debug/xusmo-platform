"use client";

// =============================================================================
// ThemePreview — Distinct visual templates matched to theme properties
// Each design style is hand-crafted to look genuinely different
// Uses picsum.photos for real stock imagery, seeded per theme slug
// =============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PreviewTheme {
  name: string;
  slug: string;
  archetype: string;
  industryTags: string[] | null;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    background?: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
    headingWeight?: string;
    bodyWeight?: string;
  };
  borderRadius: Record<string, string>;
  buttonStyle: Record<string, string>;
  designPackage: {
    headerVariant?: string;
    footerVariant?: string;
    homeLayout?: string[];
    [key: string]: unknown;
  } | null;
}

// ---------------------------------------------------------------------------
// Design style classification
// ---------------------------------------------------------------------------

type DesignStyle =
  | "dark-luxury"
  | "clean-corporate"
  | "bold-startup"
  | "elegant-studio"
  | "industrial"
  | "warm-friendly"
  | "creative-portfolio"
  | "modern-gradient";

const SERIF_FONTS = new Set([
  "Playfair Display", "Lora", "Cormorant Garamond", "Libre Baskerville",
  "Merriweather", "Vollkorn", "Alegreya", "DM Serif Display",
  "Crimson Text", "Source Serif Pro", "EB Garamond",
]);

function classifyTheme(t: PreviewTheme): DesignStyle {
  const bg = t.colors.bg || t.colors.background || "#ffffff";
  const isDark = !isLightColor(bg);
  const isSerif = SERIF_FONTS.has(t.fonts.heading);
  const rad = parseInt(t.borderRadius?.medium || "8");
  const isUppercase = t.buttonStyle?.textTransform === "uppercase";
  const hero = t.designPackage?.homeLayout?.[0] || "";

  if (isDark && isSerif) return "dark-luxury";
  if (isDark && rad <= 4) return "industrial";
  if (isDark) return "modern-gradient";
  if (isSerif && rad <= 6) return "elegant-studio";
  if (isSerif) return "warm-friendly";
  if (rad >= 16) return "bold-startup";
  if (isUppercase || rad <= 2) return "industrial";
  if (hero.includes("asymmetric") || hero.includes("video")) return "creative-portfolio";
  if (hero.includes("split") || hero.includes("card")) return "clean-corporate";
  return "clean-corporate";
}

function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length < 6) return true;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 140;
}

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); }

// ---------------------------------------------------------------------------
// Logo mark — inline SVG icon matching the logo agent's industry icons
// ---------------------------------------------------------------------------

const INDUSTRY_ICON_PATHS: Record<string, string> = {
  hvac: "M3 13h2v-2H3v2zm4 0h2V8H7v5zm4 0h2V3h-2v10z",
  plumbing: "M8 1C5.8 1 4 2.8 4 5v2H3v6h3v-6H5V5c0-1.7 1.3-3 3-3s3 1.3 3 3v2h-1v6h3V7h-1V5c0-2.2-1.8-4-4-4z",
  electrical: "M9 1L4 8h3l-1 7 6-8H9l1-6z",
  construction: "M2 14h12L8 3 2 14zm6-2H7v-1h1v1zm0-2H7V8h1v2z",
  roofing: "M8 2L1 9h2v5h4v-3h2v3h4V9h2L8 2z",
  landscaping: "M12 10c0-2.2-1.8-4-4-4S4 7.8 4 10H2v4h12v-4h-2zm-4-2c1.1 0 2 .9 2 2H6c0-1.1.9-2 2-2z",
  cleaning: "M7 1v3H5l1 4H5l3 7 3-7H9L10 4H8V1H7z",
  restaurant: "M3 2v5c0 1.1.9 2 2 2h1v5h2V9h1c1.1 0 2-.9 2-2V2h-1v4H9V2H8v4H7V2H6v4H5V2H3z",
  cafe: "M2 4v2c0 1.7 1.3 3 3 3h5v1H4v2h8V9c1.1 0 2-.9 2-2V4H2zm10 3c0 .6-.4 1-1 1V6h1v1z",
  medical: "M10 2H6v4H2v4h4v4h4v-4h4V6h-4V2z",
  dental: "M8 2C6 2 4 3.5 4 6c0 2 1.5 3 1.5 5.5S7 14 8 14s2.5-0.5 2.5-2.5S12 8 12 6c0-2.5-2-4-4-4z",
  fitness: "M1 6h2v4H1V6zm3-2h1v8H4V4zm2 1h1v6H6V5zm5-1h1v8h-1V4zm2 1h1v6h-1V5zm2-2h2v4h-2V6z",
  spa: "M8 1C5.8 1 4 3 4 5.5c0 3 4 8.5 4 8.5s4-5.5 4-8.5C12 3 10.2 1 8 1z",
  law: "M4 2h8v2H4V2zm1 3h6l1 3H4l1-3zm-1 4h8v1H4V9zm2 2h4v3H6v-3z",
  finance: "M8 2L2 5v1h12V5L8 2zM3 7v4h2V7H3zm4 0v4h2V7H7zm4 0v4h2V7h-2zM2 12v2h12v-2H2z",
  photography: "M9 2H7L6 3H3v9h10V3h-3L9 2zM8 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z",
  design: "M3 11.5V14h2.5l7.4-7.4-2.5-2.5L3 11.5zm11.7-6.8c.3-.3.3-.7 0-1l-1.4-1.4c-.3-.3-.7-.3-1 0l-1.2 1.2 2.5 2.5 1.1-1.3z",
  realestate: "M8 2L1 7h2v7h4v-4h2v4h4V7h2L8 2z",
  automotive: "M3 7l1.5-3h7L13 7h1v4h-2c0 1.1-.9 2-2 2s-2-.9-2-2H6c0 1.1-.9 2-2 2s-2-.9-2-2H1V7h2zm1 1.5a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z",
  education: "M8 1L1 5l7 4 6-3.5V10h1V5L8 1zM4 7.2v3.3l4 2.3 4-2.3V7.2L8 9.5 4 7.2z",
  pets: "M4.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm7 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM8 8c-2.2 0-4 1.3-4 3 0 2 2 3 4 3s4-1 4-3c0-1.7-1.8-3-4-3z",
  tech: "M2 3v8h12V3H2zm10 6H4V5h8v4zm-5 3h2v2H7v-2z",
  developer: "M4 4L1 8l3 4 1.4-1.4L3 8l2.4-2.6L4 4zm8 0l-1.4 1.4L13 8l-2.4 2.6L12 12l3-4-3-4zM7.5 13h1l2-10h-1l-2 10z",
};
const DEFAULT_ICON_PATH = "M8 1L1 8l7 7 7-7-7-7zM8 3.4L12.6 8 8 12.6 3.4 8 8 3.4z";

function getIconPath(industry: string): string {
  const key = industry.toLowerCase().replace(/[\s\-_]+/g, "");
  if (INDUSTRY_ICON_PATHS[key]) return INDUSTRY_ICON_PATHS[key];
  for (const [k, v] of Object.entries(INDUSTRY_ICON_PATHS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return DEFAULT_ICON_PATH;
}

/** Inline SVG logo mark — icon in a colored shape */
function LogoMark({ industry, color, size = 28, rounded = false }: {
  industry: string;
  color: string;
  size?: number;
  rounded?: boolean;
}) {
  const iconPath = getIconPath(industry);
  const scale = size / 16;
  const pad = size * 0.2;
  const total = size + pad * 2;
  return (
    <svg width={total} height={total} viewBox={`0 0 ${total} ${total}`} style={{ display: "block", flexShrink: 0 }}>
      {rounded
        ? <circle cx={total / 2} cy={total / 2} r={total / 2} fill={color} />
        : <rect width={total} height={total} rx={total * 0.2} fill={color} />
      }
      <g transform={`translate(${pad},${pad}) scale(${scale})`}>
        <path d={iconPath} fill="white" fillRule="evenodd" />
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Image helpers — Pexels API serves industry-relevant stock photos
// ---------------------------------------------------------------------------

/** Build a context-aware search query from industry + archetype */
function imgQuery(industry: string, extra?: string) {
  const q = extra ? `${industry} ${extra}` : industry;
  return encodeURIComponent(q);
}

/** Hero image — wide landscape, industry-relevant */
function heroImg(industry: string, w = 800, h = 400) {
  return `/api/images/preview?q=${imgQuery(industry, "professional")}&idx=0&w=${w}&h=${h}`;
}
/** Secondary content image — different idx picks a different photo */
function contentImg(industry: string, idx: number, w = 400, h = 300) {
  return `/api/images/preview?q=${imgQuery(industry)}&idx=${idx + 1}&w=${w}&h=${h}`;
}
/** Avatar for testimonials — searches for portraits */
function avatarImg(idx: number) {
  return `/api/images/preview?q=person+portrait+professional&idx=${idx}&w=100&h=100`;
}

/** Image box — uses background-image with fallback color. Never shows broken image. */
function ImgBox({ src, fallback, style, filter }: {
  src: string;
  fallback: string;
  style?: React.CSSProperties;
  filter?: string;
}) {
  return (
    <div style={{
      backgroundColor: fallback,
      backgroundImage: `url(${src})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      filter: filter || undefined,
      ...style,
    }} />
  );
}

/** Avatar — circular image with fallback initial */
function AvatarBox({ src, size, border, fallback }: {
  src: string;
  size: number;
  border?: string;
  fallback: string;
}) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: fallback,
      backgroundImage: `url(${src})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      border: border || undefined,
      flexShrink: 0,
    }} />
  );
}

// ---------------------------------------------------------------------------
// Main Preview Component
// ---------------------------------------------------------------------------

export default function ThemePreview({ theme }: { theme: PreviewTheme }) {
  const style = classifyTheme(theme);
  const industry = (theme.industryTags as string[])?.[0] || "Business";

  switch (style) {
    case "dark-luxury": return <DarkLuxury t={theme} industry={industry} />;
    case "industrial": return <Industrial t={theme} industry={industry} />;
    case "modern-gradient": return <ModernGradient t={theme} industry={industry} />;
    case "elegant-studio": return <ElegantStudio t={theme} industry={industry} />;
    case "warm-friendly": return <WarmFriendly t={theme} industry={industry} />;
    case "bold-startup": return <BoldStartup t={theme} industry={industry} />;
    case "creative-portfolio": return <CreativePortfolio t={theme} industry={industry} />;
    case "clean-corporate": return <CleanCorporate t={theme} industry={industry} />;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLE 1: Dark Luxury — Editorial, serif, dark backgrounds, gold-ish accents
// ═══════════════════════════════════════════════════════════════════════════

function DarkLuxury({ t, industry }: { t: PreviewTheme; industry: string }) {
  const c = t.colors;
  const bg = c.bg || c.background || "#0a0a0a";
  const f = t.fonts;


  return (
    <div style={{ width: 800, background: bg, color: "#fff", fontFamily: `'${f.body}', sans-serif`, fontSize: 14 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 50px", borderBottom: `1px solid ${c.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LogoMark industry={industry} color={c.accent} size={24} rounded />
          <span style={{ fontFamily: `'${f.heading}', serif`, fontSize: 18, fontWeight: 400, letterSpacing: "0.12em", textTransform: "uppercase", color: c.accent }}>{cap(industry)}</span>
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          {["About", "Services", "Gallery", "Contact"].map((n) => (
            <span key={n} style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 400 }}>{n}</span>
          ))}
        </div>
      </div>

      {/* Hero — large serif + image */}
      <div style={{ display: "flex", minHeight: 280 }}>
        <div style={{ flex: 1, padding: "60px 50px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: c.accent, marginBottom: 16, fontWeight: 500 }}>Established 2010</div>
          <h1 style={{ fontFamily: `'${f.heading}', serif`, fontSize: 40, fontWeight: 300, lineHeight: 1.1, margin: "0 0 16px", letterSpacing: "-0.01em" }}>
            Refined {cap(industry)} for the Discerning
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", maxWidth: 340, lineHeight: 1.7, margin: "0 0 24px" }}>
            Where craftsmanship meets elegance. Experience the difference that attention to detail makes.
          </p>
          <span style={{ alignSelf: "flex-start", padding: "12px 32px", border: `1px solid ${c.accent}`, color: c.accent, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}>Discover More</span>
        </div>
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <ImgBox src={heroImg(industry)} fallback={c.primary} style={{ width: "100%", height: "100%" }} filter="brightness(0.7)" />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${bg} 0%, transparent 40%)` }} />
        </div>
      </div>

      {/* Services — numbered with images */}
      <div style={{ display: "flex", borderTop: `1px solid ${c.border}` }}>
        {["Bespoke Design", "Premium Materials", "Expert Craft"].map((s, i) => (
          <div key={i} style={{ flex: 1, borderRight: i < 2 ? `1px solid ${c.border}` : "none" }}>
            <ImgBox src={contentImg(industry, i, 300, 200)} fallback={c.primary} style={{ height: 100 }} filter="brightness(0.6)" />
            <div style={{ padding: "20px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 26, color: c.accent, marginBottom: 8, fontFamily: `'${f.heading}', serif`, fontWeight: 300 }}>0{i + 1}</div>
              <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 6 }}>{s}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>Meticulous attention to every detail.</div>
            </div>
          </div>
        ))}
      </div>

      {/* Testimonial */}
      <div style={{ padding: "40px 80px", textAlign: "center", borderTop: `1px solid ${c.border}`, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <AvatarBox src={avatarImg(0)} size={48} border={`2px solid ${c.accent}`} fallback={c.accent} />
        <div style={{ fontFamily: `'${f.heading}', serif`, fontSize: 18, fontWeight: 300, fontStyle: "italic", lineHeight: 1.5, color: "rgba(255,255,255,0.8)", maxWidth: 440, margin: "0 auto" }}>
          &ldquo;An extraordinary experience from beginning to end.&rdquo;
        </div>
        <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: c.accent, marginTop: 12 }}>— Victoria S.</div>
      </div>

      {/* Footer */}
      <div style={{ padding: "18px 50px", borderTop: `1px solid ${c.border}`, textAlign: "center" }}>
        <span style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>&copy; 2026 {cap(industry)} — All Rights Reserved</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLE 2: Clean Corporate — Blue tones, structured, professional
// ═══════════════════════════════════════════════════════════════════════════

function CleanCorporate({ t, industry }: { t: PreviewTheme; industry: string }) {
  const c = t.colors;
  const bg = c.bg || c.background || "#ffffff";
  const f = t.fonts;
  const rad = t.borderRadius?.medium || "8px";


  return (
    <div style={{ width: 800, background: bg, color: c.text, fontFamily: `'${f.body}', sans-serif`, fontSize: 14 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 48px", background: bg, borderBottom: `1px solid ${c.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LogoMark industry={industry} color={c.primary} size={24} />
          <span style={{ fontFamily: `'${f.heading}', sans-serif`, fontSize: 16, fontWeight: 800, color: c.primary }}>{cap(industry)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {["Home", "Services", "About", "Contact"].map((n) => (
            <span key={n} style={{ fontSize: 12, color: c.textMuted, fontWeight: 500 }}>{n}</span>
          ))}
          <span style={{ padding: "8px 20px", borderRadius: rad, background: c.primary, color: "#fff", fontSize: 12, fontWeight: 600 }}>Free Quote</span>
        </div>
      </div>

      {/* Hero — split with real image */}
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1, padding: "60px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: c.primary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Trusted Professionals</div>
          <h1 style={{ fontFamily: `'${f.heading}', sans-serif`, fontSize: 34, fontWeight: 800, lineHeight: 1.12, margin: "0 0 14px", color: c.text }}>
            Expert {cap(industry)} Services for Your Home
          </h1>
          <p style={{ fontSize: 14, color: c.textMuted, lineHeight: 1.6, margin: "0 0 24px", maxWidth: 360 }}>
            Licensed, insured, and committed to delivering exceptional results on every project.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <span style={{ padding: "11px 26px", borderRadius: rad, background: c.primary, color: "#fff", fontSize: 13, fontWeight: 600 }}>Get Started</span>
            <span style={{ padding: "11px 26px", borderRadius: rad, border: `2px solid ${c.border}`, color: c.text, fontSize: 13, fontWeight: 600 }}>Our Work</span>
          </div>
        </div>
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <ImgBox src={heroImg(industry)} fallback={c.primary} style={{ width: "100%", height: "100%" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${bg} 0%, transparent 30%)` }} />
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", background: c.primary, padding: "22px 48px", justifyContent: "space-around" }}>
        {[{ n: "500+", l: "Happy Clients" }, { n: "15+", l: "Years" }, { n: "1,200+", l: "Projects" }, { n: "4.9★", l: "Rating" }].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: `'${f.heading}', sans-serif` }}>{s.n}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Services grid with images */}
      <div style={{ padding: "48px", textAlign: "center" }}>
        <h2 style={{ fontFamily: `'${f.heading}', sans-serif`, fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>What We Offer</h2>
        <p style={{ fontSize: 13, color: c.textMuted, margin: "0 0 28px" }}>Comprehensive solutions for every need</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {["Installation", "Repair", "Maintenance"].map((s, i) => (
            <div key={i} style={{ background: c.surface, borderRadius: rad, border: `1px solid ${c.border}`, overflow: "hidden" }}>
              <ImgBox src={contentImg(industry, i, 300, 200)} fallback={c.surface} style={{ height: 90 }} />
              <div style={{ padding: "18px 16px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{s}</div>
                <div style={{ fontSize: 12, color: c.textMuted, lineHeight: 1.5 }}>Reliable solutions delivered by certified experts.</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA with background image */}
      <div style={{ position: "relative", padding: "44px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <ImgBox src={contentImg(industry, 4, 800, 200)} fallback={c.primary} style={{ position: "absolute", inset: 0 }} filter="brightness(0.25)" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: `'${f.heading}', sans-serif`, color: "#fff" }}>Ready to get started?</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Contact us for a free, no-obligation quote.</div>
        </div>
        <span style={{ position: "relative", zIndex: 1, padding: "10px 24px", borderRadius: rad, background: c.primary, color: "#fff", fontSize: 13, fontWeight: 600 }}>Contact Us</span>
      </div>

      {/* Footer */}
      <div style={{ padding: "28px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: `'${f.heading}', sans-serif`, fontWeight: 700, color: c.primary }}>{cap(industry)}</span>
        <span style={{ fontSize: 10, color: c.textMuted }}>&copy; 2026 All rights reserved</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLE 3: Bold Startup — Large radius, bright colors, playful
// ═══════════════════════════════════════════════════════════════════════════

function BoldStartup({ t, industry }: { t: PreviewTheme; industry: string }) {
  const c = t.colors;
  const bg = c.bg || c.background || "#ffffff";
  const f = t.fonts;
  const rad = t.borderRadius?.large || "16px";


  return (
    <div style={{ width: 800, background: bg, color: c.text, fontFamily: `'${f.body}', sans-serif`, fontSize: 14 }}>
      {/* Header — pill nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LogoMark industry={industry} color={c.primary} size={22} rounded />
          <span style={{ fontFamily: `'${f.heading}', sans-serif`, fontSize: 18, fontWeight: 800 }}>
            <span style={{ color: c.primary }}>{cap(industry)}</span><span style={{ color: c.accent }}>.</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 6px", background: c.surface, borderRadius: "999px", border: `1px solid ${c.border}` }}>
          {["Home", "Services", "About"].map((n) => (
            <span key={n} style={{ padding: "6px 14px", borderRadius: "999px", fontSize: 11, fontWeight: 500, color: c.textMuted }}>{n}</span>
          ))}
          <span style={{ padding: "6px 16px", borderRadius: "999px", background: c.primary, color: "#fff", fontSize: 11, fontWeight: 600 }}>Contact</span>
        </div>
      </div>

      {/* Hero — full-width image with overlay text */}
      <div style={{ position: "relative", margin: "0 20px", borderRadius: rad, overflow: "hidden", height: 240 }}>
        <ImgBox src={heroImg(industry, 800, 400)} fallback={c.primary} style={{ position: "absolute", inset: 0 }} filter="brightness(0.45)" />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 60px" }}>
          <div style={{ display: "inline-block", padding: "5px 14px", borderRadius: "999px", background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 11, fontWeight: 600, marginBottom: 16, backdropFilter: "blur(4px)" }}>
            Trusted by 500+ happy clients
          </div>
          <h1 style={{ fontFamily: `'${f.heading}', sans-serif`, fontSize: 38, fontWeight: 800, lineHeight: 1.08, margin: "0 0 14px", letterSpacing: "-0.03em", color: "#fff" }}>
            {cap(industry)} Made<br /><span style={{ color: c.accent }}>Simple & Easy</span>
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", maxWidth: 420, margin: "0 auto 20px", lineHeight: 1.6 }}>
            Modern solutions, transparent pricing, and a team that genuinely cares.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <span style={{ padding: "11px 26px", borderRadius: "999px", background: c.primary, color: "#fff", fontSize: 13, fontWeight: 700 }}>Start Now</span>
            <span style={{ padding: "11px 26px", borderRadius: "999px", background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 13, fontWeight: 600, backdropFilter: "blur(4px)" }}>See Pricing</span>
          </div>
        </div>
      </div>

      {/* Feature cards with images */}
      <div style={{ padding: "32px 48px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
        {[
          { title: "Fast Service" },
          { title: "Licensed" },
          { title: "Fair Prices" },
          { title: "5-Star Rated" },
        ].map((item, i) => (
          <div key={i} style={{ background: c.surface, borderRadius: rad, overflow: "hidden", border: `1px solid ${c.border}` }}>
            <ImgBox src={contentImg(industry, i, 200, 150)} fallback={c.surface} style={{ height: 70 }} />
            <div style={{ padding: "12px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: c.textMuted }}>Quality guaranteed</div>
            </div>
          </div>
        ))}
      </div>

      {/* Social proof bar */}
      <div style={{ padding: "28px 48px", background: c.primary, borderRadius: `${rad} ${rad} 0 0`, margin: "0 20px", display: "flex", justifyContent: "space-around", alignItems: "center" }}>
        {["500+ Clients", "4.9★ Rating", "Same Day Service", "Licensed & Insured"].map((s, i) => (
          <span key={i} style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{s}</span>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: "20px 48px", textAlign: "center" }}>
        <span style={{ fontSize: 11, color: c.textMuted }}>&copy; 2026 {cap(industry)}. Made with care.</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLE 4: Elegant Studio — Serif, refined spacing, muted palette
// ═══════════════════════════════════════════════════════════════════════════

function ElegantStudio({ t, industry }: { t: PreviewTheme; industry: string }) {
  const c = t.colors;
  const bg = c.bg || c.background || "#ffffff";
  const f = t.fonts;
  const rad = t.borderRadius?.small || "4px";


  return (
    <div style={{ width: 800, background: bg, color: c.text, fontFamily: `'${f.body}', sans-serif`, fontSize: 14 }}>
      {/* Header — centered, delicate */}
      <div style={{ textAlign: "center", padding: "24px 48px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
          <LogoMark industry={industry} color={c.primary} size={22} />
          <span style={{ fontFamily: `'${f.heading}', serif`, fontSize: 22, fontWeight: 400, letterSpacing: "0.02em", color: c.text }}>{cap(industry)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 32 }}>
          {["Home", "About", "Portfolio", "Contact"].map((n) => (
            <span key={n} style={{ fontSize: 11, color: c.textMuted, fontWeight: 400, letterSpacing: "0.04em" }}>{n}</span>
          ))}
        </div>
        <div style={{ width: 40, height: 1, background: c.border, margin: "16px auto 0" }} />
      </div>

      {/* Hero — editorial with real photograph */}
      <div style={{ display: "flex", padding: "30px 48px 50px" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingRight: 40 }}>
          <h1 style={{ fontFamily: `'${f.heading}', serif`, fontSize: 38, fontWeight: 400, lineHeight: 1.15, margin: "0 0 16px", letterSpacing: "-0.01em" }}>
            The Art of {cap(industry)}
          </h1>
          <p style={{ fontSize: 14, color: c.textMuted, lineHeight: 1.8, margin: "0 0 24px" }}>
            A thoughtful approach to design, where every element serves a purpose and beauty emerges from simplicity.
          </p>
          <span style={{ alignSelf: "flex-start", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: c.primary, borderBottom: `1px solid ${c.primary}`, paddingBottom: 3 }}>View Our Work →</span>
        </div>
        <div style={{ flex: 1, overflow: "hidden", borderRadius: rad }}>
          <ImgBox src={heroImg(industry, 400, 500)} fallback={c.primary} style={{ width: "100%", height: 280 }} />
        </div>
      </div>

      {/* Three columns with images + dividers */}
      <div style={{ display: "flex", borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}` }}>
        {["Design", "Craft", "Detail"].map((s, i) => (
          <div key={i} style={{ flex: 1, borderRight: i < 2 ? `1px solid ${c.border}` : "none" }}>
            <ImgBox src={contentImg(industry, i, 300, 160)} fallback={c.surface} style={{ height: 80 }} />
            <div style={{ padding: "20px 28px", textAlign: "center" }}>
              <div style={{ fontFamily: `'${f.heading}', serif`, fontSize: 20, fontWeight: 400, marginBottom: 8 }}>{s}</div>
              <div style={{ fontSize: 12, color: c.textMuted, lineHeight: 1.6 }}>Every piece reflects our commitment to timeless quality.</div>
            </div>
          </div>
        ))}
      </div>

      {/* Testimonial with avatar */}
      <div style={{ padding: "36px 80px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <AvatarBox src={avatarImg(0)} size={44} border={`1px solid ${c.border}`} fallback={c.primary} />
        <div style={{ fontFamily: `'${f.heading}', serif`, fontSize: 20, fontWeight: 400, fontStyle: "italic", lineHeight: 1.6, color: c.text }}>
          &ldquo;An experience that exceeded every expectation. Truly remarkable.&rdquo;
        </div>
        <div style={{ width: 30, height: 1, background: c.border, margin: "12px auto" }} />
        <div style={{ fontSize: 11, color: c.textMuted }}>Alexandra M. — Art Director</div>
      </div>

      {/* Footer */}
      <div style={{ padding: "18px 48px", borderTop: `1px solid ${c.border}`, textAlign: "center" }}>
        <span style={{ fontSize: 10, color: c.textMuted, letterSpacing: "0.05em" }}>&copy; 2026 {cap(industry)}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLE 5: Industrial — Sharp edges, dark accents, structured
// ═══════════════════════════════════════════════════════════════════════════

function Industrial({ t, industry }: { t: PreviewTheme; industry: string }) {
  const c = t.colors;
  const bg = c.bg || c.background || "#ffffff";
  const isDark = !isLightColor(bg);
  const f = t.fonts;
  const textCol = isDark ? "#fff" : c.text;
  const mutedCol = isDark ? "rgba(255,255,255,0.5)" : c.textMuted;


  return (
    <div style={{ width: 800, background: bg, color: textCol, fontFamily: `'${f.body}', sans-serif`, fontSize: 14 }}>
      {/* Header — aggressive, uppercase */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 48px", borderBottom: `2px solid ${c.primary}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LogoMark industry={industry} color={c.primary} size={24} />
          <span style={{ fontFamily: `'${f.heading}', sans-serif`, fontSize: 16, fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase" }}>{cap(industry)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {["Services", "Work", "About", "Contact"].map((n) => (
            <span key={n} style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: mutedCol, fontWeight: 600 }}>{n}</span>
          ))}
          <span style={{ padding: "8px 18px", background: c.primary, color: isDark ? "#000" : "#fff", fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>Get Quote</span>
        </div>
      </div>

      {/* Hero — full-width image with bold overlay */}
      <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
        <ImgBox src={heroImg(industry, 800, 400)} fallback={c.primary} style={{ position: "absolute", inset: 0 }} filter={isDark ? "brightness(0.4)" : "brightness(0.3)"} />
        <div style={{ position: "absolute", inset: 0, padding: "40px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 40, height: 2, background: c.primary }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: c.primary }}>Since 2008</span>
          </div>
          <h1 style={{ fontFamily: `'${f.heading}', sans-serif`, fontSize: 40, fontWeight: 900, lineHeight: 1.05, margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "-0.02em", color: "#fff" }}>
            Built Tough.<br />Built Right.
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", maxWidth: 400, lineHeight: 1.6, margin: "0 0 20px" }}>
            No shortcuts. No compromises. Just professional work.
          </p>
          <span style={{ display: "inline-block", alignSelf: "flex-start", padding: "10px 24px", background: c.primary, color: isDark ? "#000" : "#fff", fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>View Our Work →</span>
        </div>
      </div>

      {/* Numbers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", borderBottom: `1px solid ${c.border}` }}>
        {[{ n: "500+", l: "PROJECTS" }, { n: "15", l: "YEARS" }, { n: "98%", l: "ON TIME" }, { n: "24/7", l: "SUPPORT" }].map((s, i) => (
          <div key={i} style={{ padding: "28px 20px", textAlign: "center", borderRight: i < 3 ? `1px solid ${c.border}` : "none" }}>
            <div style={{ fontFamily: `'${f.heading}', sans-serif`, fontSize: 28, fontWeight: 900, color: c.primary }}>{s.n}</div>
            <div style={{ fontSize: 9, letterSpacing: "0.12em", color: mutedCol, fontWeight: 600, marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Services — grid with images */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${c.border}` }}>
        {["Installation", "Repair & Service", "Custom Projects", "Maintenance Plans"].map((s, i) => (
          <div key={i} style={{ display: "flex", borderRight: i % 2 === 0 ? `1px solid ${c.border}` : "none", borderBottom: i < 2 ? `1px solid ${c.border}` : "none" }}>
            <ImgBox src={contentImg(industry, i, 160, 120)} fallback={c.primary} style={{ width: 80, flexShrink: 0 }} filter={isDark ? "brightness(0.5)" : "brightness(0.8)"} />
            <div style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 6 }}>{s}</div>
              <div style={{ fontSize: 11, color: mutedCol, lineHeight: 1.5 }}>Professional-grade work with full warranty.</div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 48px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: mutedCol, fontWeight: 600 }}>&copy; 2026 {cap(industry)}</span>
        <span style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: mutedCol, fontWeight: 600 }}>Built to Last</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLE 6: Warm & Friendly — Rounded, warm tones, approachable
// ═══════════════════════════════════════════════════════════════════════════

function WarmFriendly({ t, industry }: { t: PreviewTheme; industry: string }) {
  const c = t.colors;
  const bg = c.bg || c.background || "#ffffff";
  const f = t.fonts;
  const rad = t.borderRadius?.medium || "12px";


  return (
    <div style={{ width: 800, background: bg, color: c.text, fontFamily: `'${f.body}', sans-serif`, fontSize: 14 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LogoMark industry={industry} color={c.primary} size={24} rounded />
          <span style={{ fontFamily: `'${f.heading}', serif`, fontSize: 20, fontWeight: 700, color: c.primary }}>{cap(industry)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {["Home", "About", "Services", "Blog"].map((n) => (
            <span key={n} style={{ fontSize: 12, color: c.textMuted, fontWeight: 500 }}>{n}</span>
          ))}
          <span style={{ padding: "8px 20px", borderRadius: rad, background: c.accent, color: isLightColor(c.accent) ? c.text : "#fff", fontSize: 12, fontWeight: 600 }}>Book Now</span>
        </div>
      </div>

      {/* Hero — warm, centered with image below */}
      <div style={{ padding: "40px 48px 20px", textAlign: "center" }}>
        <h1 style={{ fontFamily: `'${f.heading}', serif`, fontSize: 36, fontWeight: 700, lineHeight: 1.15, margin: "0 0 12px" }}>
          Welcome to {cap(industry)}
        </h1>
        <p style={{ fontSize: 15, color: c.textMuted, maxWidth: 440, margin: "0 auto 24px", lineHeight: 1.7 }}>
          A warm, personalized approach to {industry.toLowerCase()}. Because you deserve service that feels like home.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <span style={{ padding: "11px 28px", borderRadius: rad, background: c.primary, color: "#fff", fontSize: 13, fontWeight: 600 }}>Get Started</span>
          <span style={{ padding: "11px 28px", borderRadius: rad, background: `${c.accent}12`, color: c.accent, fontSize: 13, fontWeight: 600 }}>Learn More</span>
        </div>
      </div>

      {/* Hero image strip — real photo */}
      <div style={{ margin: "16px 48px 30px", borderRadius: rad, overflow: "hidden" }}>
        <ImgBox src={heroImg(industry, 800, 300)} fallback={c.primary} style={{ height: 130 }} />
      </div>

      {/* Features — image + text cards */}
      <div style={{ padding: "0 48px 40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[
          { title: "Personal Touch", desc: "Every client gets individual attention and care." },
          { title: "Trusted Quality", desc: "Proven results backed by years of experience." },
          { title: "Fair & Honest", desc: "Transparent pricing with no hidden surprises." },
          { title: "Always Available", desc: "Flexible scheduling that works for your life." },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 0, background: c.surface, borderRadius: rad, border: `1px solid ${c.border}`, overflow: "hidden" }}>
            <ImgBox src={contentImg(industry, i, 160, 160)} fallback={c.primary} style={{ width: 80, flexShrink: 0 }} />
            <div style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: c.textMuted, lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Testimonial banner with avatar */}
      <div style={{ padding: "28px 60px", background: c.surface, textAlign: "center", borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}`, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          {[0, 1, 2].map((i) => (
            <AvatarBox key={i} src={avatarImg(i)} size={32} border={`2px solid ${bg}`} fallback={c.accent} />
          ))}
        </div>
        <div style={{ fontFamily: `'${f.heading}', serif`, fontSize: 18, fontWeight: 400, fontStyle: "italic", lineHeight: 1.6, color: c.text }}>
          &ldquo;They treated us like family. Absolutely wonderful experience!&rdquo;
        </div>
        <div style={{ fontSize: 12, color: c.textMuted, marginTop: 8 }}>— Maria & José R.</div>
      </div>

      {/* Footer */}
      <div style={{ padding: "20px 48px", textAlign: "center" }}>
        <span style={{ fontFamily: `'${f.heading}', serif`, fontSize: 14, color: c.primary }}>{cap(industry)}</span>
        <div style={{ fontSize: 10, color: c.textMuted, marginTop: 4 }}>&copy; 2026 — Serving our community with love</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLE 7: Creative Portfolio — Asymmetric, dynamic, expressive
// ═══════════════════════════════════════════════════════════════════════════

function CreativePortfolio({ t, industry }: { t: PreviewTheme; industry: string }) {
  const c = t.colors;
  const bg = c.bg || c.background || "#ffffff";
  const f = t.fonts;
  const rad = t.borderRadius?.medium || "8px";


  return (
    <div style={{ width: 800, background: bg, color: c.text, fontFamily: `'${f.body}', sans-serif`, fontSize: 14 }}>
      {/* Header — minimal, left-aligned */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <LogoMark industry={industry} color={c.primary} size={20} />
          <span style={{ fontFamily: `'${f.heading}', sans-serif`, fontSize: 14, fontWeight: 800, letterSpacing: "0.04em" }}>{cap(industry)}*</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {["Work", "About", "Process"].map((n) => (
            <span key={n} style={{ fontSize: 11, color: c.textMuted, fontWeight: 500 }}>{n}</span>
          ))}
          <span style={{ width: 28, height: 14, display: "flex", flexDirection: "column", gap: 3, justifyContent: "center" }}>
            <div style={{ height: 2, background: c.text, width: "100%" }} />
            <div style={{ height: 2, background: c.text, width: "60%" }} />
          </span>
        </div>
      </div>

      {/* Hero — massive type with floating image */}
      <div style={{ padding: "40px 48px 30px", position: "relative" }}>
        <h1 style={{ fontFamily: `'${f.heading}', sans-serif`, fontSize: 56, fontWeight: 800, lineHeight: 0.95, margin: 0, letterSpacing: "-0.04em" }}>
          We Create<br />
          <span style={{ color: c.primary }}>Bold</span> {cap(industry)}
        </h1>
        <div style={{ position: "absolute", right: 48, top: 30, width: 220, height: 160, borderRadius: rad, overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>
          <ImgBox src={heroImg(industry, 440, 320)} fallback={c.primary} style={{ width: "100%", height: "100%" }} />
        </div>
        <p style={{ fontSize: 14, color: c.textMuted, maxWidth: 320, lineHeight: 1.6, marginTop: 20 }}>
          Award-winning creative studio specializing in innovative solutions that push boundaries.
        </p>
        <span style={{ display: "inline-block", marginTop: 20, fontSize: 12, color: c.primary, borderBottom: `2px solid ${c.primary}`, paddingBottom: 2, fontWeight: 600 }}>View Our Work →</span>
      </div>

      {/* Project grid — asymmetric with real images */}
      <div style={{ padding: "0 48px 30px", display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <div style={{ borderRadius: rad, overflow: "hidden" }}>
          <ImgBox src={contentImg(industry, 0, 500, 260)} fallback={c.primary} style={{ height: 130 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <ImgBox src={contentImg(industry, 1, 240, 120)} fallback={c.accent} style={{ flex: 1, borderRadius: rad, minHeight: 55 }} />
          <ImgBox src={contentImg(industry, 2, 240, 120)} fallback={c.primary} style={{ flex: 1, borderRadius: rad, minHeight: 55 }} />
        </div>
      </div>

      {/* Marquee-style text */}
      <div style={{ padding: "20px 0", borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}`, overflow: "hidden" }}>
        <div style={{ fontFamily: `'${f.heading}', sans-serif`, fontSize: 24, fontWeight: 800, color: `${c.text}15`, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
          DESIGN • STRATEGY • BRANDING • {cap(industry).toUpperCase()} • INNOVATION • CREATIVITY
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: "32px 48px", display: "flex", gap: 40 }}>
        {[{ n: "150+", l: "Projects" }, { n: "12", l: "Awards" }, { n: "8+", l: "Years" }].map((s, i) => (
          <div key={i}>
            <div style={{ fontFamily: `'${f.heading}', sans-serif`, fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>{s.n}</div>
            <div style={{ fontSize: 11, color: c.textMuted }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 48px", borderTop: `1px solid ${c.border}`, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, color: c.textMuted }}>&copy; 2026</span>
        <span style={{ fontSize: 10, color: c.textMuted }}>Made with passion</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLE 8: Modern Gradient — Dark mode, gradient accents, sleek
// ═══════════════════════════════════════════════════════════════════════════

function ModernGradient({ t, industry }: { t: PreviewTheme; industry: string }) {
  const c = t.colors;
  const bg = c.bg || c.background || "#0a0a0a";
  const f = t.fonts;
  const rad = t.borderRadius?.medium || "8px";


  return (
    <div style={{ width: 800, background: bg, color: "#fff", fontFamily: `'${f.body}', sans-serif`, fontSize: 14 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LogoMark industry={industry} color={c.primary} size={22} rounded />
          <span style={{ fontFamily: `'${f.heading}', sans-serif`, fontSize: 16, fontWeight: 800, background: `linear-gradient(135deg, ${c.primary}, ${c.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{cap(industry)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {["Features", "Pricing", "About"].map((n) => (
            <span key={n} style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{n}</span>
          ))}
          <span style={{ padding: "7px 18px", borderRadius: rad, background: `linear-gradient(135deg, ${c.primary}, ${c.accent})`, color: "#fff", fontSize: 12, fontWeight: 600 }}>Get Started</span>
        </div>
      </div>

      {/* Hero — gradient text + background image with glow */}
      <div style={{ position: "relative", padding: "60px 48px 50px", textAlign: "center", overflow: "hidden" }}>
        {/* Background image, very dark */}
        <div style={{ position: "absolute", inset: 0 }}>
          <ImgBox src={heroImg(industry, 800, 400)} fallback="#111" style={{ width: "100%", height: "100%" }} filter="brightness(0.15) saturate(0.5)" />
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at center, transparent 20%, ${bg} 70%)` }} />
        </div>
        {/* Glow effect */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 300, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${c.primary}20, transparent 70%)` }} />
        <h1 style={{ fontFamily: `'${f.heading}', sans-serif`, fontSize: 42, fontWeight: 800, lineHeight: 1.1, margin: "0 0 14px", position: "relative", letterSpacing: "-0.02em" }}>
          Next-Level<br /><span style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{cap(industry)} Solutions</span>
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", maxWidth: 420, margin: "0 auto 28px", lineHeight: 1.6, position: "relative" }}>
          Cutting-edge technology meets expert service. Experience the future of {industry.toLowerCase()}.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", position: "relative" }}>
          <span style={{ padding: "11px 28px", borderRadius: rad, background: `linear-gradient(135deg, ${c.primary}, ${c.accent})`, color: "#fff", fontSize: 13, fontWeight: 700 }}>Get Started</span>
          <span style={{ padding: "11px 28px", borderRadius: rad, border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500 }}>Watch Demo</span>
        </div>
      </div>

      {/* Feature cards — glass effect with images */}
      <div style={{ padding: "40px 48px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {["Smart Service", "24/7 Monitoring", "Expert Support"].map((s, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: rad, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ height: 80, position: "relative" }}>
              <ImgBox src={contentImg(industry, i, 300, 160)} fallback={c.primary} style={{ position: "absolute", inset: 0 }} filter="brightness(0.5) saturate(0.7)" />
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 40%, ${bg} 100%)` }} />
            </div>
            <div style={{ padding: "14px 18px", textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{s}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>Powered by the latest technology.</div>
            </div>
          </div>
        ))}
      </div>

      {/* Social proof */}
      <div style={{ padding: "28px 48px", display: "flex", justifyContent: "center", gap: 40, borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {[{ n: "10K+", l: "Users" }, { n: "99.9%", l: "Uptime" }, { n: "4.9★", l: "Rating" }].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: `'${f.heading}', sans-serif`, background: `linear-gradient(135deg, ${c.primary}, ${c.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.n}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: "20px 48px", textAlign: "center" }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>&copy; 2026 {cap(industry)}</span>
      </div>
    </div>
  );
}
