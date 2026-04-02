"use client";

import { useState } from "react";
import {
  Plug,
  Palette,
  Type,
  LayoutGrid,
  ChevronRight,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Shield,
  ToggleRight,
  ToggleLeft,
  Lock,
  Upload,
  Code,
  GitBranch,
  Database,
  Info,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Color tokens                                                      */
/* ------------------------------------------------------------------ */

const C: Record<string, string> = {
  bg: "#0f1117",
  surface: "#181b25",
  surfaceAlt: "#1e2230",
  border: "#2a2f3e",
  red: "#dc2626",
  amber: "#f59e0b",
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#a855f7",
  cyan: "#06b6d4",
  text: "#e8ecf4",
  muted: "#a0abbe",
  dim: "#7a859b",
};

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                   */
/* ------------------------------------------------------------------ */

interface TabDef {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

const TABS: TabDef[] = [
  { id: "site-plugins", label: "Per-Site Plugins", icon: Plug },
  { id: "theme", label: "Theme & Tokens", icon: Palette },
  { id: "fonts", label: "Font Pairs", icon: Type },
  { id: "patterns", label: "Block Patterns", icon: LayoutGrid },
];

/* ------------------------------------------------------------------ */
/*  Mock data                                                         */
/* ------------------------------------------------------------------ */

interface SiteDef {
  id: string;
  name: string;
  url: string;
  industry: string;
  arch: string;
  tier: "managed" | "hosting";
}

const SITES: SiteDef[] = [
  { id: "s1", name: "Mario\u2019s Plumbing", url: "marios.xusmo.io", industry: "Plumbing", arch: "SERVICE", tier: "managed" },
  { id: "s2", name: "Sakura Sushi", url: "sakura.xusmo.io", industry: "Restaurant", arch: "VENUE", tier: "managed" },
  { id: "s3", name: "Downtown Legal", url: "downtown.xusmo.io", industry: "Legal", arch: "SERVICE", tier: "managed" },
  { id: "s4", name: "Elena Photography", url: "elena.xusmo.io", industry: "Photography", arch: "PORTFOLIO", tier: "hosting" },
];

interface PluginDef {
  slug: string;
  name: string;
  version: string;
  status: "active" | "inactive";
  update: string | null;
  catalog: "REQUIRED" | "ALLOWED" | "BANNED";
  category: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
  banReason?: string;
}

const SITE_PLUGINS: Record<string, PluginDef[]> = {
  s1: [
    { slug: "wordpress-seo", name: "Yoast SEO", version: "22.1", status: "active", update: null, catalog: "REQUIRED", category: "SEO", risk: "MEDIUM" },
    { slug: "contact-form-7", name: "Contact Form 7", version: "5.9", status: "active", update: "5.9.8", catalog: "REQUIRED", category: "FORMS", risk: "MEDIUM" },
    { slug: "safe-svg", name: "Safe SVG", version: "2.2", status: "active", update: null, catalog: "ALLOWED", category: "MEDIA", risk: "LOW" },
  ],
  s2: [
    { slug: "wordpress-seo", name: "Yoast SEO", version: "22.1", status: "active", update: null, catalog: "REQUIRED", category: "SEO", risk: "MEDIUM" },
    { slug: "contact-form-7", name: "Contact Form 7", version: "5.9", status: "active", update: "5.9.8", catalog: "REQUIRED", category: "FORMS", risk: "MEDIUM" },
    { slug: "safe-svg", name: "Safe SVG", version: "2.2", status: "active", update: null, catalog: "ALLOWED", category: "MEDIA", risk: "LOW" },
    { slug: "flavor", name: "flavor", version: "1.2", status: "active", update: null, catalog: "ALLOWED", category: "UTILITY", risk: "LOW" },
  ],
  s3: [
    { slug: "wordpress-seo", name: "Yoast SEO", version: "21.8", status: "active", update: "22.3", catalog: "REQUIRED", category: "SEO", risk: "MEDIUM" },
    { slug: "contact-form-7", name: "Contact Form 7", version: "5.8", status: "active", update: "5.9.8", catalog: "REQUIRED", category: "FORMS", risk: "MEDIUM" },
    { slug: "safe-svg", name: "Safe SVG", version: "2.2", status: "active", update: null, catalog: "ALLOWED", category: "MEDIA", risk: "LOW" },
    { slug: "wordfence", name: "Wordfence Security", version: "7.11", status: "active", update: null, catalog: "BANNED", category: "SECURITY", risk: "HIGH", banReason: "Performance penalty (200ms+), premium nags, FSE conflicts. Security handled at server level: OLS + Imunify360." },
    { slug: "cookie-notice", name: "Cookie Notice", version: "2.4", status: "inactive", update: "2.5", catalog: "ALLOWED", category: "UTILITY", risk: "LOW" },
  ],
  s4: [
    { slug: "wordpress-seo", name: "Yoast SEO", version: "22.1", status: "active", update: null, catalog: "REQUIRED", category: "SEO", risk: "MEDIUM" },
    { slug: "contact-form-7", name: "Contact Form 7", version: "5.9", status: "active", update: null, catalog: "REQUIRED", category: "FORMS", risk: "MEDIUM" },
    { slug: "safe-svg", name: "Safe SVG", version: "2.2", status: "active", update: null, catalog: "ALLOWED", category: "MEDIA", risk: "LOW" },
  ],
};

const THEME_TOKENS = {
  colors: [
    { slug: "primary", value: "#1e40af", name: "Primary" },
    { slug: "secondary", value: "#64748b", name: "Secondary" },
    { slug: "accent", value: "#f59e0b", name: "Accent" },
    { slug: "background", value: "#ffffff", name: "Background" },
    { slug: "surface", value: "#f8fafc", name: "Surface" },
    { slug: "text", value: "#0f172a", name: "Text" },
    { slug: "text-muted", value: "#64748b", name: "Text Muted" },
    { slug: "border", value: "#e2e8f0", name: "Border" },
  ],
};

interface FontPairDef {
  id: string;
  heading: string;
  body: string;
  use: string;
  industries: string[];
  sample: string;
}

const FONT_PAIRS: FontPairDef[] = [
  { id: "modern-clean", heading: "Inter", body: "Inter", use: "Default \u2014 modern, tech, clean businesses", industries: ["Plumbing", "HVAC", "Electrical", "Cleaning"], sample: "The quick brown fox jumps" },
  { id: "professional", heading: "Playfair Display", body: "Inter", use: "Consulting, coaching, professional services", industries: ["Consulting", "Coaching", "Real Estate"], sample: "The quick brown fox jumps" },
  { id: "bold-energetic", heading: "Montserrat", body: "Open Sans", use: "Gym, fitness, martial arts, bold brands", industries: ["Gym", "Martial Arts", "Sports"], sample: "The quick brown fox jumps" },
  { id: "elegant", heading: "Cormorant Garamond", body: "Lato", use: "Restaurant, salon, spa, fine-dining, luxury", industries: ["Restaurant", "Salon", "Spa", "Bakery"], sample: "The quick brown fox jumps" },
  { id: "friendly", heading: "Nunito", body: "Nunito Sans", use: "Daycare, pet care, family-friendly businesses", industries: ["Daycare", "Pet Care", "Tutoring"], sample: "The quick brown fox jumps" },
  { id: "authoritative", heading: "Merriweather", body: "Source Sans Pro", use: "Legal, accounting, medical, finance", industries: ["Legal", "Accounting", "Medical", "Finance"], sample: "The quick brown fox jumps" },
  { id: "minimal", heading: "DM Sans", body: "DM Sans", use: "Photography, design, architecture, minimal brands", industries: ["Photography", "Design", "Architecture"], sample: "The quick brown fox jumps" },
];

interface PatternDef {
  slug: string;
  name: string;
  category: string;
  archetypes: string[];
  lines: number;
  enabled: boolean;
}

const PATTERNS: PatternDef[] = [
  { slug: "hero-image-bg", name: "Hero \u2014 Image Background", category: "Heroes", archetypes: ["SERVICE", "VENUE", "COMMERCE"], lines: 28, enabled: true },
  { slug: "hero-split-screen", name: "Hero \u2014 Split Screen", category: "Heroes", archetypes: ["PORTFOLIO", "SERVICE"], lines: 22, enabled: true },
  { slug: "hero-video", name: "Hero \u2014 Video Background", category: "Heroes", archetypes: ["VENUE"], lines: 18, enabled: false },
  { slug: "services-grid", name: "Services Grid (3-col)", category: "Services", archetypes: ["SERVICE", "COMMERCE"], lines: 34, enabled: true },
  { slug: "services-list", name: "Services List", category: "Services", archetypes: ["SERVICE"], lines: 26, enabled: true },
  { slug: "trust-bar", name: "Trust Signals Bar", category: "Trust", archetypes: ["SERVICE", "VENUE", "PORTFOLIO"], lines: 15, enabled: true },
  { slug: "testimonials-carousel", name: "Testimonials Carousel", category: "Social Proof", archetypes: ["SERVICE", "VENUE"], lines: 30, enabled: true },
  { slug: "testimonials-grid", name: "Testimonials Grid", category: "Social Proof", archetypes: ["PORTFOLIO"], lines: 24, enabled: true },
  { slug: "faq-accordion", name: "FAQ Accordion", category: "Content", archetypes: ["SERVICE", "COMMERCE"], lines: 20, enabled: true },
  { slug: "cta-banner", name: "CTA Banner", category: "Conversion", archetypes: ["SERVICE", "VENUE", "PORTFOLIO", "COMMERCE"], lines: 12, enabled: true },
  { slug: "contact-form-section", name: "Contact Form Section", category: "Forms", archetypes: ["SERVICE", "VENUE", "PORTFOLIO"], lines: 18, enabled: true },
  { slug: "hours-widget", name: "Business Hours", category: "Info", archetypes: ["VENUE", "SERVICE"], lines: 16, enabled: true },
  { slug: "portfolio-grid", name: "Portfolio Grid", category: "Gallery", archetypes: ["PORTFOLIO"], lines: 22, enabled: true },
  { slug: "gallery-masonry", name: "Gallery Masonry", category: "Gallery", archetypes: ["VENUE", "PORTFOLIO"], lines: 20, enabled: true },
  { slug: "menu-grid", name: "Restaurant Menu Grid", category: "Menu", archetypes: ["VENUE"], lines: 28, enabled: true },
  { slug: "pricing-table", name: "Pricing Table", category: "Conversion", archetypes: ["COMMERCE", "SERVICE"], lines: 32, enabled: true },
  { slug: "map-embed", name: "Google Map Embed", category: "Info", archetypes: ["SERVICE", "VENUE"], lines: 8, enabled: true },
  { slug: "team-grid", name: "Team Members Grid", category: "About", archetypes: ["PORTFOLIO", "SERVICE"], lines: 20, enabled: true },
  { slug: "booking-cta", name: "Booking CTA", category: "Conversion", archetypes: ["VENUE"], lines: 14, enabled: true },
  { slug: "stats-counter", name: "Stats Counter", category: "Social Proof", archetypes: ["SERVICE", "PORTFOLIO"], lines: 16, enabled: true },
];

const catColor: Record<string, string> = { REQUIRED: C.blue, ALLOWED: C.green, BANNED: C.red };
const riskColor: Record<string, string> = { LOW: C.green, MEDIUM: C.amber, HIGH: C.red };

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export default function PluginsThemePanel() {
  const [tab, setTab] = useState("site-plugins");
  const [selectedSite, setSelectedSite] = useState("s3");
  const [configOpen, setConfigOpen] = useState<string | null>(null);
  const [tokenColors, setTokenColors] = useState(THEME_TOKENS.colors.map(c => ({ ...c })));
  const [patternFilter, setPatternFilter] = useState("All");

  const sitePlugins = SITE_PLUGINS[selectedSite] || [];
  const site = SITES.find(s => s.id === selectedSite);
  const hasBanned = sitePlugins.some(p => p.catalog === "BANNED");
  const updateCount = sitePlugins.filter(p => p.update).length;

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "'Inter',-apple-system,sans-serif", fontSize: 14 }}>

      {/* FACTORY_PROVISION_SPEC Banner */}
      <div style={{ background: `${C.cyan}06`, borderBottom: `1px solid ${C.cyan}15`, padding: "9px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <GitBranch size={14} color={C.cyan} />
        <span style={{ fontSize: 11, color: C.muted }}>
          <span style={{ color: C.cyan, fontWeight: 600 }}>FACTORY_PROVISION_SPEC</span>
          <span style={{ color: C.dim, margin: "0 6px" }}>&middot;</span>
          <span style={{ color: C.text }}>Golden Image</span>
          <ChevronRight size={10} color={C.dim} style={{ display: "inline", verticalAlign: "middle", margin: "0 3px" }} />
          <span style={{ color: C.text }}>Industry Defaults</span>
          <ChevronRight size={10} color={C.dim} style={{ display: "inline", verticalAlign: "middle", margin: "0 3px" }} />
          <span style={{ color: C.text }}>Site-specific Overrides</span>
          <ChevronRight size={10} color={C.dim} style={{ display: "inline", verticalAlign: "middle", margin: "0 3px" }} />
          <span style={{ color: C.cyan }}>Published Site</span>
          <span style={{ color: C.dim, margin: "0 12px" }}>|</span>
          Colors &amp; fonts applied via <span style={{ color: C.purple, fontWeight: 600 }}>wp_global_styles</span> DB post &mdash; not file edits
        </span>
      </div>

      {/* Horizontal Tab Bar */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "0 24px" }}>
        <div style={{ display: "flex", gap: 0 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: 7, padding: "11px 18px", border: "none", cursor: "pointer", fontSize: 13,
              borderBottom: tab === t.id ? `2px solid ${C.red}` : "2px solid transparent",
              color: tab === t.id ? C.red : C.muted, background: "transparent", fontWeight: tab === t.id ? 600 : 400,
            }}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>

        {/* ════ PER-SITE PLUGINS ════ */}
        {tab === "site-plugins" && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
              <span style={{ color: C.dim, fontSize: 12, fontWeight: 600 }}>SELECT SITE:</span>
              {SITES.map(s => (
                <button key={s.id} onClick={() => { setSelectedSite(s.id); setConfigOpen(null); }} style={{
                  padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: selectedSite === s.id ? 600 : 400,
                  border: `1px solid ${selectedSite === s.id ? C.red : C.border}`,
                  background: selectedSite === s.id ? `${C.red}15` : C.surface,
                  color: selectedSite === s.id ? C.red : C.muted,
                }}>
                  {s.name}
                  {SITE_PLUGINS[s.id]?.some(p => p.catalog === "BANNED") && <span style={{ marginLeft: 6, color: C.red }}>&#x26D4;</span>}
                </button>
              ))}
            </div>

            {/* Site Info Bar */}
            <div style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "12px 18px", marginBottom: 16, display: "flex", gap: 24, alignItems: "center" }}>
              <div><span style={{ color: C.dim, fontSize: 11 }}>SITE</span><div style={{ color: "#fff", fontWeight: 600 }}>{site?.name}</div></div>
              <div><span style={{ color: C.dim, fontSize: 11 }}>URL</span><div style={{ color: C.blue }}>{site?.url}</div></div>
              <div><span style={{ color: C.dim, fontSize: 11 }}>INDUSTRY</span><div style={{ color: C.muted }}>{site?.industry}</div></div>
              <div><span style={{ color: C.dim, fontSize: 11 }}>ARCHETYPE</span><div><Badge label={site?.arch} color={C.blue} /></div></div>
              <div><span style={{ color: C.dim, fontSize: 11 }}>TIER</span><div><Badge label={site?.tier === "managed" ? "\u2605 Managed" : "Hosting-only"} color={site?.tier === "managed" ? C.purple : C.blue} /></div></div>
              <div><span style={{ color: C.dim, fontSize: 11 }}>PLUGINS</span><div style={{ color: "#fff", fontWeight: 600 }}>{sitePlugins.length}</div></div>
              <div><span style={{ color: C.dim, fontSize: 11 }}>UPDATES</span><div style={{ color: updateCount > 0 ? C.amber : C.green, fontWeight: 600 }}>{updateCount}</div></div>
            </div>

            {/* Banned Alert */}
            {hasBanned && (
              <div style={{ background: `${C.red}10`, border: `1px solid ${C.red}30`, borderRadius: 8, padding: 12, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <Shield size={16} color={C.red} />
                <div>
                  <span style={{ color: C.red, fontWeight: 600, fontSize: 12 }}>BANNED plugin on production site &mdash; remove immediately</span>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Wordfence is banned from all production sites. Performance penalty (200ms+), premium nags, FSE conflicts. Security handled at server level: OLS + Imunify360.</div>
                </div>
              </div>
            )}

            <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 20 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ background: C.surfaceAlt }}>
                  {["Plugin", "Version", "Status", "Update", "Catalog", "Category", "Risk", "Actions"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "9px 12px", fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {sitePlugins.map(p => (
                    <>
                      <tr key={p.slug} style={{ borderBottom: `1px solid ${C.border}`, background: p.catalog === "BANNED" ? `${C.red}05` : "transparent" }}>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontWeight: 600, color: p.catalog === "BANNED" ? C.red : "#fff" }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: C.dim, fontFamily: "monospace" }}>{p.slug}</div>
                          {p.banReason && <div style={{ fontSize: 11, color: C.red, marginTop: 2, maxWidth: 220 }}>{p.banReason}</div>}
                        </td>
                        <td style={{ padding: "12px 14px", fontFamily: "monospace", color: C.muted }}>{p.version}</td>
                        <td style={{ padding: "12px 14px" }}>
                          {p.status === "active" ? (
                            <span style={{ display: "flex", alignItems: "center", gap: 4, color: C.green, fontSize: 12 }}><CheckCircle2 size={13} /> Active</span>
                          ) : (
                            <span style={{ display: "flex", alignItems: "center", gap: 4, color: C.dim, fontSize: 12 }}><XCircle size={13} /> Inactive</span>
                          )}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {p.update ? (
                            <span style={{ color: C.amber, fontWeight: 600, fontSize: 12 }}>{"\u2B06"} {p.update}</span>
                          ) : (
                            <span style={{ color: C.green, fontSize: 12 }}>{"\u2713"} Current</span>
                          )}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <Badge label={p.catalog} color={catColor[p.catalog]} />
                          {p.catalog === "REQUIRED" && <Lock size={10} color={C.blue} style={{ marginLeft: 4 }} />}
                        </td>
                        <td style={{ padding: "12px 14px" }}><Badge label={p.category} color={C.purple} /></td>
                        <td style={{ padding: "12px 14px" }}><Badge label={p.risk} color={riskColor[p.risk]} /></td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {p.catalog === "BANNED" && <SmBtn label="Remove Now" danger />}
                            {p.update && p.catalog !== "BANNED" && <SmBtn label="Update" />}
                            {p.status === "active" && p.catalog !== "REQUIRED" && p.catalog !== "BANNED" && <SmBtn label="Deactivate" />}
                            {p.status === "inactive" && p.catalog !== "BANNED" && <SmBtn label="Activate" />}
                            {p.catalog !== "BANNED" && <SmBtn label="Configure" onClick={() => setConfigOpen(configOpen === p.slug ? null : p.slug)} />}
                            {p.catalog !== "REQUIRED" && p.catalog !== "BANNED" && <SmBtn label="Remove" danger />}
                          </div>
                        </td>
                      </tr>
                      {configOpen === p.slug && (
                        <tr><td colSpan={8} style={{ background: C.surfaceAlt, padding: 16, borderBottom: `1px solid ${C.border}` }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", marginBottom: 16 }}>Configure: {p.name}</div>
                          {p.slug === "wordpress-seo" && (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                              <Field label="Company Name" value={site?.name || ""} />
                              <Field label="Company Type" value="company" type="select" options={["company", "person"]} />
                              <Field label="Title Separator" value="-" type="select" options={["-", "|", "\u2014", "\u00b7", ">"]} />
                              <Field label="Schema Type" value="LocalBusiness" type="select" options={["LocalBusiness", "Restaurant", "LegalService", "PhotographAction"]} />
                            </div>
                          )}
                          {p.slug === "contact-form-7" && (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                              <Field label="Recipient Email" value="owner@business.com" />
                              <Field label="Form Subject" value="New website enquiry" />
                            </div>
                          )}
                          {!["wordpress-seo", "contact-form-7"].includes(p.slug) && (
                            <div style={{ color: C.dim, fontSize: 12 }}>Generic option editor &mdash; set WordPress options key/value pairs for this plugin.</div>
                          )}
                          <div style={{ marginTop: 12 }}><SmBtn label="Save Configuration" /></div>
                        </td></tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <Plus size={14} color={C.green} /> Install New Plugin
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 12px" }}>
                  <Search size={14} color={C.dim} />
                  <input placeholder="Search wordpress.org plugins..." style={{ background: "transparent", border: "none", color: C.text, outline: "none", fontSize: 12, width: "100%" }} />
                </div>
                <button style={{ padding: "8px 16px", borderRadius: 6, background: C.green, color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Search</button>
              </div>
              <div style={{ color: C.dim, fontSize: 11 }}>BANNED plugins (Wordfence, Elementor, WPBakery) will be flagged and blocked from installation.</div>
            </div>
          </div>
        )}

        {/* ════ THEME & TOKENS ════ */}
        {tab === "theme" && (
          <div>
            <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>xusmo-starter v1.2.0</h2>
                  <p style={{ color: C.dim, fontSize: 12, margin: 0 }}>Child theme of Twenty Twenty-Five (WordPress 6.7 default block theme)</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn icon={Upload} label="Deploy to All Sites" />
                  <Btn icon={Code} label="Edit theme.json" />
                </div>
              </div>
              <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
                <MS label="Base Theme" value="twentytwentyfive" />
                <MS label="WP Version" value="6.7.2" />
                <MS label="Patterns" value={`${PATTERNS.length}`} />
                <MS label="Font Pairs" value={`${FONT_PAIRS.length}`} />
                <MS label="Sites Using" value="142" />
                <MS label="Last Deploy" value="Feb 18" />
              </div>
            </div>

            {/* wp_global_styles canonical rule */}
            <div style={{ background: `${C.purple}08`, border: `1px solid ${C.purple}25`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Database size={16} color={C.purple} />
                <span style={{ fontSize: 14, fontWeight: 700, color: C.purple }}>wp_global_styles &mdash; Canonical Color &amp; Font Storage</span>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: `${C.purple}20`, color: C.purple, fontWeight: 600 }}>FACTORY_PROVISION_SPEC Rule</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", marginBottom: 8 }}>How it works</div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.8 }}>
                    Per-site colors and font pairs are <strong>never applied by editing theme files</strong>. Instead, the Builder Agent writes a <code style={{ background: C.surfaceAlt, padding: "1px 5px", borderRadius: 3, fontFamily: "monospace", color: C.purple }}>wp_global_styles</code> post to the site&apos;s database after provisioning.
                    This overrides <code style={{ background: C.surfaceAlt, padding: "1px 5px", borderRadius: 3, fontFamily: "monospace", color: C.cyan }}>theme.json</code> for that site without touching any files, and every block pattern picks up the new palette automatically.
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Override chain</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      { label: "theme.json in xusmo-child", color: C.green, note: "Default tokens \u2014 used if no override" },
                      { label: "wp_global_styles (site DB)", color: C.purple, note: "Builder Agent writes per-site colors + fonts here \u2190 CANONICAL" },
                    ].map((r, i) => (
                      <div key={i} style={{ background: C.surfaceAlt, borderRadius: 8, padding: "10px 12px", border: `1px solid ${r.color}25` }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: r.color, fontFamily: "monospace" }}>{r.label}</div>
                        <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{r.note}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 11, color: C.dim, padding: "8px 10px", background: `${C.cyan}08`, borderRadius: 6, border: `1px solid ${C.cyan}15` }}>
                    <Info size={11} color={C.cyan} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                    Pattern uses <code style={{ fontFamily: "monospace" }}>has-primary-background-color</code> CSS classes &mdash; all patterns inherit palette automatically.
                  </div>
                </div>
              </div>
            </div>

            {/* Theme Architecture */}
            <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 16 }}>Theme Stack Architecture</div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ background: `${C.blue}12`, border: `1px solid ${C.blue}30`, borderRadius: 10, padding: "14px 40px", width: 480, textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.blue }}>twentytwentyfive</div>
                  <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>WordPress default block theme (FSE) &mdash; never modified, auto-updated</div>
                </div>
                <div style={{ width: 2, height: 16, background: C.border }} />
                <div style={{ fontSize: 11, color: C.dim }}>{"\u2191"} inherits from</div>
                <div style={{ width: 2, height: 16, background: C.border }} />
                <div style={{ background: `${C.green}12`, border: `1px solid ${C.green}30`, borderRadius: 10, padding: "14px 40px", width: 480, textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.green }}>xusmo-starter (child theme)</div>
                  <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>theme.json design tokens &middot; block patterns &middot; templates &middot; local fonts</div>
                </div>
                <div style={{ width: 2, height: 16, background: C.border }} />
                <div style={{ fontSize: 11, color: C.dim }}>{"\u2191"} overridden per-site by</div>
                <div style={{ width: 2, height: 16, background: C.border }} />
                <div style={{ background: `${C.purple}12`, border: `1px solid ${C.purple}30`, borderRadius: 10, padding: "14px 40px", width: 480, textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.purple }}>wp_global_styles (site DB post)</div>
                  <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>Builder Agent writes custom colors + font from Blueprint.designPrefs {"\u2192"} CANONICAL per-site override</div>
                </div>
              </div>
            </div>

            {/* Color Tokens */}
            <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4 }}>Default Design Tokens (theme.json)</div>
              <div style={{ fontSize: 11, color: C.dim, marginBottom: 16 }}>Fallback colors for new sites. Builder Agent overrides per-site using Blueprint.designPrefs by writing to <code style={{ color: C.purple, fontFamily: "monospace" }}>wp_global_styles</code>.</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {tokenColors.map((t, i) => (
                  <div key={t.slug} style={{ background: C.surfaceAlt, borderRadius: 8, padding: 12, border: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 6, background: t.value, border: `1px solid ${C.border}` }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{t.name}</div>
                        <div style={{ fontSize: 11, color: C.dim, fontFamily: "monospace" }}>{t.slug}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input type="color" value={t.value} onChange={e => {
                        const u = [...tokenColors];
                        u[i] = { ...t, value: e.target.value };
                        setTokenColors(u);
                      }} style={{ width: 28, height: 24, border: "none", borderRadius: 4, cursor: "pointer", background: "transparent" }} />
                      <input value={t.value} onChange={e => {
                        const u = [...tokenColors];
                        u[i] = { ...t, value: e.target.value };
                        setTokenColors(u);
                      }} style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 8px", color: C.text, fontFamily: "monospace", fontSize: 11, outline: "none" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                <button style={{ padding: "8px 20px", borderRadius: 6, background: C.red, color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>Save Default Tokens</button>
                <button style={{ padding: "8px 20px", borderRadius: 6, background: "transparent", color: C.muted, border: `1px solid ${C.border}`, cursor: "pointer", fontSize: 12 }}>Reset to Defaults</button>
              </div>
            </div>

            {/* Theme Files */}
            <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 12 }}>Theme File Structure</div>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: C.muted, lineHeight: 2, background: C.bg, borderRadius: 8, padding: 16 }}>
                <div style={{ color: C.amber }}>wordpress/themes/xusmo-starter/</div>
                <div>{"\u251C\u2500\u2500"} style.css <span style={{ color: C.dim }}>{"\u2190"} theme header (name, version, parent)</span></div>
                <div>{"\u251C\u2500\u2500"} <span style={{ color: C.green }}>theme.json</span> <span style={{ color: C.dim }}>{"\u2190"} design tokens (colors, fonts, spacing) &mdash; default only</span></div>
                <div>{"\u251C\u2500\u2500"} functions.php <span style={{ color: C.dim }}>{"\u2190"} pattern registration, hooks</span></div>
                <div>{"\u251C\u2500\u2500"} parts/ <span style={{ color: C.dim }}>{"\u2190"} header.html, footer.html</span></div>
                <div>{"\u251C\u2500\u2500"} templates/ <span style={{ color: C.dim }}>{"\u2190"} front-page.html, page.html, 404.html</span></div>
                <div>{"\u251C\u2500\u2500"} <span style={{ color: C.purple }}>patterns/</span> <span style={{ color: C.dim }}>{"\u2190"} {PATTERNS.length} block patterns (all use has-primary-background-color CSS classes)</span></div>
                <div>{"\u2514\u2500\u2500"} assets/fonts/ <span style={{ color: C.dim }}>{"\u2190"} {FONT_PAIRS.length} locally hosted font families (GDPR compliant)</span></div>
                <div style={{ marginTop: 10, color: C.purple }}>wordpress/database/wp_global_styles (per-site DB post)</div>
                <div style={{ color: C.dim }}>{"\u2514\u2500\u2500"} {"\u2190"} Builder Agent writes per-site colors + font pair here after provisioning</div>
              </div>
            </div>
          </div>
        )}

        {/* ════ FONT PAIRS ════ */}
        {tab === "fonts" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: C.dim }}>{FONT_PAIRS.length} font pairs &mdash; all locally hosted (no CDN calls, GDPR compliant)</div>
              <Btn icon={Plus} label="Add Font Pair" />
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {FONT_PAIRS.map(fp => (
                <div key={fp.id} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{fp.id}</span>
                        <span style={{ fontSize: 11, color: C.dim }}>{"\u2014"}</span>
                        <span style={{ fontSize: 12, color: C.muted }}>{fp.use}</span>
                      </div>
                      <div style={{ display: "flex", gap: 24, marginBottom: 10 }}>
                        <div><span style={{ fontSize: 11, color: C.dim }}>HEADING</span><div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{fp.heading}</div></div>
                        <div><span style={{ fontSize: 11, color: C.dim }}>BODY</span><div style={{ fontSize: 15, color: C.muted }}>{fp.body}</div></div>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {fp.industries.map(ind => <Badge key={ind} label={ind} color={C.cyan} />)}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <SmBtn label="Edit" /><SmBtn label="Duplicate" /><SmBtn label="Remove" danger />
                    </div>
                  </div>
                  <div style={{ marginTop: 14, background: "#fff", borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{fp.heading}: {fp.sample}</div>
                    <div style={{ fontSize: 14, color: "#475569" }}>{fp.body}: The quick brown fox jumps over the lazy dog. Professional web design for your business.</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ BLOCK PATTERNS ════ */}
        {tab === "patterns" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {["All", "Heroes", "Services", "Trust", "Social Proof", "Content", "Conversion", "Forms", "Info", "Gallery", "Menu", "About"].map(f => (
                <button key={f} onClick={() => setPatternFilter(f)} style={{
                  padding: "5px 12px", borderRadius: 6, border: `1px solid ${patternFilter === f ? C.red : C.border}`,
                  background: patternFilter === f ? `${C.red}15` : "transparent",
                  color: patternFilter === f ? C.red : C.muted, cursor: "pointer", fontSize: 11,
                }}>{f}</button>
              ))}
              <div style={{ flex: 1 }} /><Btn icon={Plus} label="Create Pattern" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
              {PATTERNS.filter(p => patternFilter === "All" || p.category === patternFilter).map(p => (
                <div key={p.slug} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${!p.enabled ? `${C.dim}30` : C.border}`, padding: 16, opacity: p.enabled ? 1 : 0.6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: C.dim, fontFamily: "monospace" }}>xusmo/{p.slug}</div>
                    </div>
                    <div style={{ cursor: "pointer" }}>{p.enabled ? <ToggleRight size={22} color={C.green} /> : <ToggleLeft size={22} color={C.dim} />}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                    <Badge label={p.category} color={C.purple} />
                    {p.archetypes.map(a => <Badge key={a} label={a} color={C.blue} />)}
                  </div>
                  <div style={{ background: C.bg, borderRadius: 6, height: 80, display: "flex", alignItems: "center", justifyContent: "center", color: C.dim, fontSize: 11, border: `1px solid ${C.border}`, marginBottom: 10 }}>
                    <LayoutGrid size={16} style={{ marginRight: 6 }} /> Pattern preview ({p.lines} lines)
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <SmBtn label="Edit Code" /><SmBtn label="Preview" /><SmBtn label="Duplicate" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

function Badge({ label, color }: { label: string | undefined; color: string }) {
  return <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: `${color}18`, color }}>{label}</span>;
}

function Btn({ icon: Icon, label }: { icon: React.ComponentType<{ size?: number }>; label: string }) {
  return <button style={{ display: "flex", alignItems: "center", gap: 6, background: `${C.red}12`, color: C.red, border: `1px solid ${C.red}30`, borderRadius: 6, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>{Icon && <Icon size={14} />} {label}</button>;
}

function SmBtn({ label, danger, onClick }: { label: string; danger?: boolean; onClick?: () => void }) {
  const col = danger ? C.red : C.blue;
  return <button onClick={onClick} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 4, border: `1px solid ${col}30`, background: `${col}10`, color: col, cursor: "pointer" }}>{label}</button>;
}

function MS({ label, value }: { label: string; value: string }) {
  return <div><span style={{ fontSize: 11, color: C.dim }}>{label}</span><div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{value}</div></div>;
}

function Field({ label, value, type, options }: { label: string; value: string; type?: string; options?: string[] }) {
  return (
    <div>
      <label style={{ fontSize: 11, color: C.dim, display: "block", marginBottom: 4 }}>{label}</label>
      {type === "select" ? (
        <select defaultValue={value} style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 12, outline: "none" }}>
          {options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input defaultValue={value} style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 12, outline: "none", boxSizing: "border-box" }} />
      )}
    </div>
  );
}
