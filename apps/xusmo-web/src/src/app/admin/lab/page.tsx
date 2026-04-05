"use client";

import { useState } from "react";
import { FlaskConical, Plug, LayoutGrid, Box, CheckCircle2, XCircle, AlertTriangle, Play, Pause, ArrowRight, ArrowUpRight, RefreshCw, Shield, Clock, Zap, Bot, Bell, Eye, Settings2, Globe, Activity, Wrench, Search, ChevronRight, Package, TestTube, Sparkles, Send, CircleDot, HardDrive, GitBranch, Database, Crown } from "lucide-react";

const C = { bg: "#0f1117", surface: "#181b25", alt: "#1e2230", border: "#2a2f3e", red: "#dc2626", amber: "#f59e0b", green: "#22c55e", blue: "#3b82f6", purple: "#a855f7", cyan: "#06b6d4", text: "#e8ecf4", muted: "#a0abbe", dim: "#7a859b" };

// ═══ TOP LEVEL: Two main sections ═══
const SECTIONS = [
  { id: "lab", label: "WordPress Lab", icon: FlaskConical, desc: "Build, test, promote" },
  { id: "agents", label: "Admin Agents", icon: Bot, desc: "Automated site management" },
];

// ═══ LAB DATA ═══
const LAB_PLUGINS = [
  { slug: "wordpress-seo", name: "Yoast SEO", tested: "22.3", latest: "22.3", status: "approved", risk: "MEDIUM", lastTest: "Feb 18", result: "PASS", notes: "Tested with TT5 + child theme" },
  { slug: "contact-form-7", name: "Contact Form 7", tested: "5.9.8", latest: "5.9.8", status: "approved", risk: "MEDIUM", lastTest: "Feb 18", result: "PASS", notes: "Form submission verified" },
  { slug: "safe-svg", name: "Safe SVG", tested: "2.2", latest: "2.2", status: "approved", risk: "LOW", lastTest: "Feb 18", result: "PASS", notes: "" },
  { slug: "wordpress-seo", name: "RankMath SEO", tested: "\u2014", latest: "1.0.22", status: "evaluating", risk: "MEDIUM", lastTest: "\u2014", result: "\u2014", notes: "Alternative to Yoast \u2014 testing feature parity" },
  { slug: "wp-mail-smtp", name: "WP Mail SMTP", tested: "3.9", latest: "3.9", status: "evaluating", risk: "LOW", lastTest: "Feb 19", result: "PASS", notes: "Considering adding to standard stack" },
  { slug: "updraftplus", name: "UpdraftPlus Backup", tested: "2.23", latest: "2.23", status: "evaluating", risk: "MEDIUM", lastTest: "Feb 17", result: "PASS", notes: "For production backup automation" },
  { slug: "wordfence", name: "Wordfence Security", tested: "7.11", latest: "7.11", status: "rejected", risk: "HIGH", lastTest: "Feb 10", result: "FAIL", notes: "BANNED from production. 200ms+ perf penalty, premium nags, FSE conflicts. Lab-only QA tool. Security handled server-side: OLS + Imunify360." },
  { slug: "elementor", name: "Elementor", tested: "\u2014", latest: "3.21", status: "rejected", risk: "HIGH", lastTest: "\u2014", result: "\u2014", notes: "Freemium bloat, conflicts with FSE, vendor lock-in" },
];

const LAB_PATTERNS = [
  { slug: "hero-image-bg", name: "Hero \u2014 Image Background", category: "Heroes", status: "live", version: "1.2", usedBy: 18 },
  { slug: "hero-split", name: "Hero \u2014 Split Screen", category: "Heroes", status: "live", version: "1.1", usedBy: 6 },
  { slug: "services-grid", name: "Services Grid (3-col)", category: "Sections", status: "live", version: "1.3", usedBy: 15 },
  { slug: "trust-bar", name: "Trust Signals Bar", category: "Sections", status: "live", version: "1.0", usedBy: 20 },
  { slug: "testimonials", name: "Testimonials Carousel", category: "Social Proof", status: "live", version: "1.1", usedBy: 14 },
  { slug: "faq-accordion", name: "FAQ Accordion", category: "Content", status: "live", version: "1.0", usedBy: 12 },
  { slug: "cta-banner", name: "CTA Banner", category: "Conversion", status: "live", version: "1.2", usedBy: 20 },
  { slug: "contact-section", name: "Contact Form Section", category: "Forms", status: "live", version: "1.0", usedBy: 20 },
  { slug: "menu-grid", name: "Restaurant Menu Grid", category: "Industry", status: "live", version: "1.0", usedBy: 3 },
  { slug: "gallery-masonry", name: "Gallery Masonry", category: "Media", status: "live", version: "1.1", usedBy: 4 },
  { slug: "pricing-table", name: "Pricing Table", category: "Conversion", status: "draft", version: "0.1", usedBy: 0 },
  { slug: "team-bios", name: "Team Bios Grid", category: "About", status: "testing", version: "0.9", usedBy: 0 },
  { slug: "portfolio-grid", name: "Portfolio Showcase", category: "Media", status: "testing", version: "0.8", usedBy: 0 },
];

const GOLDEN_IMAGES = [
  { id: "gi-service",     version: "GI-SERVICE-2026Q1-001",    type: "Service Business", status: "active",     wp: "6.7.2", plugins: 3, patterns: 8,  sites: 14, lighthouse: 88, tested: "Feb 18", gen: 5, prev: "GI-SERVICE-2025Q4-003",    deprecated: false },
  { id: "gi-venue",       version: "GI-VENUE-2026Q1-001",      type: "Venue / Location", status: "active",     wp: "6.7.2", plugins: 3, patterns: 10, sites: 4,  lighthouse: 85, tested: "Feb 18", gen: 3, prev: "GI-VENUE-2025Q4-002",      deprecated: false },
  { id: "gi-portfolio",   version: "GI-PORTFOLIO-2026Q1-001",  type: "Portfolio",        status: "active",     wp: "6.7.2", plugins: 3, patterns: 8,  sites: 2,  lighthouse: 90, tested: "Feb 18", gen: 2, prev: "GI-PORTFOLIO-2025Q4-001",  deprecated: false },
  { id: "gi-service-old", version: "GI-SERVICE-2025Q4-003",    type: "Service Business", status: "deprecated", wp: "6.7.0", plugins: 2, patterns: 6,  sites: 0,  lighthouse: 78, tested: "Dec 15", gen: 4, prev: "GI-SERVICE-2025Q4-002",    deprecated: true  },
];

// ═══ AGENTS DATA ═══
const AGENTS = [
  {
    id: "patrol",
    name: "Patrol Agent",
    icon: Shield,
    color: C.green,
    desc: "Runs health checks on all sites every 6 hours. Detects SSL expiry, downtime, slow response, outdated plugins.",
    status: "running",
    lastRun: "14 min ago",
    nextRun: "5h 46m",
    schedule: "Every 6 hours",
    stats: { checksToday: 80, issuesFound: 4, autoFixed: 2 },
    recentActions: [
      { time: "14 min ago", action: "Checked all 20 sites", result: "17 healthy, 3 issues", severity: "info" },
      { time: "6h ago", action: "Checked all 20 sites", result: "18 healthy, 2 issues", severity: "info" },
      { time: "12h ago", action: "Detected Downtown Legal SSL expired", result: "Escalated to you", severity: "critical" },
      { time: "18h ago", action: "Detected Peak Fitness slow response (720ms)", result: "Logged warning", severity: "warning" },
    ],
  },
  {
    id: "updater",
    name: "Plugin Updater Agent",
    icon: Plug,
    color: C.blue,
    desc: "Monitors plugin updates. Auto-updates LOW risk plugins. Stages MEDIUM risk for your approval. Blocks HIGH risk.",
    status: "running",
    lastRun: "2h ago",
    nextRun: "4h",
    schedule: "Every 6 hours",
    stats: { updatesToday: 3, autoUpdated: 2, pendingApproval: 1 },
    recentActions: [
      { time: "2h ago", action: "Auto-updated Safe SVG 2.1.9 \u2192 2.2 on 20 sites", result: "All successful", severity: "info" },
      { time: "2h ago", action: "Detected Yoast SEO 22.3 available", result: "Queued for staging test", severity: "info" },
      { time: "1d ago", action: "Staged CF7 5.9.8 on lab sandbox", result: "Tests passed, awaiting your approval", severity: "warning" },
      { time: "3d ago", action: "Blocked Elementor auto-install attempt on Joe's Auto", result: "Plugin is banned", severity: "critical" },
    ],
  },
  {
    id: "backup",
    name: "Backup Agent",
    icon: HardDrive,
    color: C.purple,
    desc: "Runs daily backups on all sites. Alerts if a backup fails or is overdue. Verifies backup integrity weekly.",
    status: "running",
    lastRun: "3h ago",
    nextRun: "21h",
    schedule: "Daily at 3am",
    stats: { backupsToday: 20, successful: 19, failed: 1 },
    recentActions: [
      { time: "3h ago", action: "Backed up 20 sites", result: "19 success, 1 failed (Downtown Legal)", severity: "warning" },
      { time: "1d ago", action: "Backed up 20 sites", result: "All successful", severity: "info" },
      { time: "3d ago", action: "Weekly integrity check", result: "All backups restorable", severity: "info" },
    ],
  },
  {
    id: "ssl",
    name: "SSL & Security Agent",
    icon: Shield,
    color: C.cyan,
    desc: "Monitors SSL certificates, auto-renews via Let's Encrypt 14 days before expiry. Checks security headers.",
    status: "running",
    lastRun: "1h ago",
    nextRun: "23h",
    schedule: "Daily",
    stats: { renewalsThisMonth: 2, expiringSoon: 1, securityIssues: 1 },
    recentActions: [
      { time: "1h ago", action: "Scanned all 20 SSL certificates", result: "1 expired (Downtown Legal), 1 expiring in 30d", severity: "warning" },
      { time: "5d ago", action: "Auto-renewed SSL for Mario's Plumbing", result: "New cert valid 90 days", severity: "info" },
      { time: "7d ago", action: "Detected Downtown Legal default 'admin' username", result: "Escalated to you", severity: "critical" },
    ],
  },
  {
    id: "performance",
    name: "Performance Agent",
    icon: Zap,
    color: C.amber,
    desc: "Runs Lighthouse audits weekly. Flags sites dropping below 85. Suggests optimizations.",
    status: "running",
    lastRun: "2d ago",
    nextRun: "5d",
    schedule: "Weekly (Sunday 2am)",
    stats: { auditsThisWeek: 20, below85: 2, avgScore: 84 },
    recentActions: [
      { time: "2d ago", action: "Lighthouse audit on 20 sites", result: "18 above 85, 2 below (Downtown Legal: 35, Peak Fitness: 62)", severity: "warning" },
      { time: "2d ago", action: "Peak Fitness: identified 720ms TTFB", result: "Suggested: flush cache, check server load", severity: "info" },
    ],
  },
];

const PENDING_APPROVALS = [
  { id: 1, agent: "Plugin Updater", action: "Roll out Contact Form 7 v5.9.8 to all 20 sites", reason: "MEDIUM risk plugin \u2014 staged and tested, all tests passed", priority: "normal", time: "1d ago" },
  { id: 2, agent: "SSL Agent", action: "Force-renew SSL on Downtown Legal", reason: "Certificate expired 3 days ago \u2014 site showing security warning to visitors", priority: "urgent", time: "12h ago" },
  { id: 3, agent: "Patrol Agent", action: "Suspend Downtown Legal for maintenance", reason: "Critical: expired SSL, outdated WP/plugins, banned plugin, 2100ms response. Site is hurting your brand.", priority: "urgent", time: "14 min ago" },
  { id: 4, agent: "Plugin Updater", action: "Add WP Mail SMTP to standard plugin stack", reason: "Tested in lab, all sites currently rely on PHP mail() which has deliverability issues", priority: "normal", time: "3d ago" },
];

const svColor: Record<string, string> = { info: C.dim, warning: C.amber, critical: C.red };

export default function LabAgents() {
  const [section, setSection] = useState("lab");
  const [labTab, setLabTab] = useState("plugins");
  const [agentOpen, setAgentOpen] = useState("patrol");
  const [approvals, setApprovals] = useState(PENDING_APPROVALS);

  const LAB_TABS = [
    { id: "plugins", label: "Plugin Testing", icon: Plug, count: LAB_PLUGINS.length },
    { id: "patterns", label: "Block Patterns", icon: LayoutGrid, count: LAB_PATTERNS.length },
    { id: "golden", label: "Golden Images", icon: Box, count: GOLDEN_IMAGES.length },
    { id: "tests", label: "Test Results", icon: TestTube, count: undefined as number | undefined },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100%", color: C.text, fontFamily: "'Inter',-apple-system,sans-serif", fontSize: 14 }}>
      {/* Top Bar */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Zap size={16} color={C.red} /><span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Xusmo Admin</span>
          </div>
          <div style={{ display: "flex", gap: 2, background: C.surface, borderRadius: 8, padding: 3 }}>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setSection(s.id)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12,
                background: section === s.id ? C.alt : "transparent",
                color: section === s.id ? "#fff" : C.muted, fontWeight: section === s.id ? 600 : 400,
              }}><s.icon size={14} /> {s.label}</button>
            ))}
          </div>
        </div>
        {approvals.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: `${C.amber}12`, border: `1px solid ${C.amber}30`, borderRadius: 7, padding: "6px 12px" }}>
            <Bell size={14} color={C.amber} />
            <span style={{ fontSize: 12, color: C.amber, fontWeight: 600 }}>{approvals.filter(a => a.priority === "urgent").length} urgent · {approvals.length} pending approvals</span>
          </div>
        )}
      </div>

      {/* ─── FACTORY_PROVISION_SPEC Banner ─── */}
      <div style={{ background:`${C.cyan}06`, borderBottom:`1px solid ${C.cyan}15`, padding:"8px 20px", display:"flex", alignItems:"center", gap:12 }}>
        <GitBranch size={13} color={C.cyan}/>
        <span style={{ fontSize:11, color:C.muted }}>
          <span style={{ color:C.cyan, fontWeight:600 }}>FACTORY_PROVISION_SPEC</span>
          <span style={{ color:C.dim, margin:"0 6px" }}>·</span>
          <span style={{ color:C.text }}>Golden Image</span>
          <ChevronRight size={10} color={C.dim} style={{ display:"inline",verticalAlign:"middle",margin:"0 3px" }}/>
          <span style={{ color:C.text }}>Industry Defaults</span>
          <ChevronRight size={10} color={C.dim} style={{ display:"inline",verticalAlign:"middle",margin:"0 3px" }}/>
          <span style={{ color:C.text }}>Site-specific Overrides</span>
          <ChevronRight size={10} color={C.dim} style={{ display:"inline",verticalAlign:"middle",margin:"0 3px" }}/>
          <span style={{ color:C.cyan }}>Published Site</span>
          <span style={{ color:C.dim, margin:"0 12px" }}>|</span>
          Lab tests here before <strong>any</strong> changes enter a GI &mdash; No Multisite, no shortcuts
        </span>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* WORDPRESS LAB                          */}
      {/* ═══════════════════════════════════════ */}
      {section === "lab" && (
        <div>
          {/* Lab Horizontal Tab Bar */}
          <div style={{ borderBottom: `1px solid ${C.border}`, padding: "0 24px", display: "flex", alignItems: "center", gap: 8, overflowX: "auto" }}>
            {/* Sandbox Status Indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 12px 10px 0", borderRight: `1px solid ${C.border}`, marginRight: 4, flexShrink: 0 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} />
              <span style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>Running</span>
              <span style={{ fontSize: 11, color: C.dim, whiteSpace: "nowrap" }}>localhost:8080 · WP 6.7.2 · PHP 8.3</span>
            </div>
            {/* Tabs */}
            {LAB_TABS.map(t => (
              <button key={t.id} onClick={() => setLabTab(t.id)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "12px 14px", border: "none", cursor: "pointer", fontSize: 12,
                background: "transparent",
                color: labTab === t.id ? "#fff" : C.muted,
                fontWeight: labTab === t.id ? 600 : 400,
                borderBottom: labTab === t.id ? `2px solid ${C.red}` : "2px solid transparent",
                flexShrink: 0,
              }}>
                <t.icon size={14} color={labTab === t.id ? C.red : C.dim} />
                {t.label}
                {t.count != null && <span style={{ fontSize: 11, color: C.dim, marginLeft: 2 }}>{t.count}</span>}
              </button>
            ))}
          </div>

          {/* Lab Content */}
          <div style={{ padding: 24 }}>

            {/* ─── PLUGIN TESTING ─── */}
            {labTab === "plugins" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Plugin Testing Lab</h2>
                    <p style={{ fontSize: 12, color: C.dim, margin: 0 }}>Test plugins here before they touch any client site. Approved plugins go into Golden Images.</p>
                  </div>
                  <button style={{ display: "flex", alignItems: "center", gap: 6, background: `${C.blue}12`, color: C.blue, border: `1px solid ${C.blue}30`, borderRadius: 7, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>
                    <Plug size={13} /> Test New Plugin
                  </button>
                </div>

                {/* Pipeline columns */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  {/* Evaluating */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.amber, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                      <TestTube size={13} /> EVALUATING ({LAB_PLUGINS.filter(p => p.status === "evaluating").length})
                    </div>
                    {LAB_PLUGINS.filter(p => p.status === "evaluating").map(p => (
                      <PluginCard key={p.slug + p.name} p={p} />
                    ))}
                  </div>
                  {/* Approved */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircle2 size={13} /> APPROVED ({LAB_PLUGINS.filter(p => p.status === "approved").length})
                    </div>
                    {LAB_PLUGINS.filter(p => p.status === "approved").map(p => (
                      <PluginCard key={p.slug + p.name} p={p} />
                    ))}
                  </div>
                  {/* Rejected */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.red, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                      <XCircle size={13} /> REJECTED ({LAB_PLUGINS.filter(p => p.status === "rejected").length})
                    </div>
                    {LAB_PLUGINS.filter(p => p.status === "rejected").map(p => (
                      <PluginCard key={p.slug + p.name} p={p} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── BLOCK PATTERNS ─── */}
            {labTab === "patterns" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Block Patterns</h2>
                    <p style={{ fontSize: 12, color: C.dim, margin: 0 }}>Reusable sections that the Builder Agent assembles into client sites. Build and test here, promote to live when ready.</p>
                  </div>
                  <button style={{ display: "flex", alignItems: "center", gap: 6, background: `${C.purple}12`, color: C.purple, border: `1px solid ${C.purple}30`, borderRadius: 7, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>
                    <LayoutGrid size={13} /> Create Pattern
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  {/* Live */}
                  <div style={{ gridColumn: "1 / 3" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 10 }}>LIVE &mdash; In production ({LAB_PATTERNS.filter(p => p.status === "live").length})</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {LAB_PATTERNS.filter(p => p.status === "live").map(p => (
                        <div key={p.slug} style={{ background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`, padding: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, color: "#fff", fontSize: 12 }}>{p.name}</span>
                            <span style={{ fontSize: 11, color: C.dim }}>v{p.version}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.dim }}>
                            <span>{p.category}</span>
                            <span>Used by {p.usedBy} sites</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Testing + Draft */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.amber, marginBottom: 10 }}>TESTING ({LAB_PATTERNS.filter(p => p.status === "testing").length})</div>
                    {LAB_PATTERNS.filter(p => p.status === "testing").map(p => (
                      <div key={p.slug} style={{ background: C.surface, borderRadius: 8, border: `1px solid ${C.amber}20`, padding: 12, marginBottom: 8 }}>
                        <div style={{ fontWeight: 600, color: "#fff", fontSize: 12 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: C.dim, marginBottom: 6 }}>{p.category} · v{p.version}</div>
                        <div style={{ display: "flex", gap: 4 }}>
                          <SmBtn label="Preview" color={C.blue} />
                          <SmBtn label="Promote to Live" color={C.green} />
                        </div>
                      </div>
                    ))}
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, marginBottom: 10, marginTop: 16 }}>DRAFT ({LAB_PATTERNS.filter(p => p.status === "draft").length})</div>
                    {LAB_PATTERNS.filter(p => p.status === "draft").map(p => (
                      <div key={p.slug} style={{ background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`, padding: 12, marginBottom: 8, opacity: 0.7 }}>
                        <div style={{ fontWeight: 600, color: "#fff", fontSize: 12 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: C.dim, marginBottom: 6 }}>{p.category} · v{p.version}</div>
                        <div style={{ display: "flex", gap: 4 }}>
                          <SmBtn label="Edit" color={C.blue} />
                          <SmBtn label="Start Testing" color={C.amber} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── GOLDEN IMAGES ─── */}
            {labTab === "golden" && (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Golden Images</h2>
                  <p style={{ fontSize: 12, color: C.dim, margin: 0 }}>Pre-configured WordPress snapshots. New client sites are cloned from these. Build &amp; test here, promote to production.</p>
                </div>

                {/* Archetype Coverage */}
                <div style={{ background:`${C.cyan}06`, border:`1px solid ${C.cyan}15`, borderRadius:10, padding:"12px 16px", marginBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <Database size={13} color={C.cyan}/>
                    <span style={{ fontSize:11, fontWeight:600, color:C.cyan }}>FACTORY_PROVISION_SPEC &mdash; Active GI Coverage</span>
                  </div>
                  <div style={{ display:"flex", gap:12 }}>
                    {GOLDEN_IMAGES.filter(g=>g.status==="active").map(g=>(
                      <div key={g.id} style={{ background:C.surface, borderRadius:8, padding:"8px 14px", border:`1px solid ${C.green}20` }}>
                        <div style={{ fontSize:11, fontWeight:700, color:C.green }}>{g.version.split("-")[1]}</div>
                        <div style={{ fontSize:11, color:C.dim }}>{g.sites} sites · gen {g.gen}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  {GOLDEN_IMAGES.map(gi => (
                    <div key={gi.id} style={{
                      background: C.surface, borderRadius: 10, border: `1px solid ${gi.status === "active" ? `${C.green}25` : C.border}`, padding: 20,
                      opacity: gi.status === "deprecated" ? 0.6 : 1,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <Box size={18} color={gi.status === "active" ? C.green : C.dim} />
                          <div>
                            <div style={{ fontWeight: 700, color: "#fff", fontFamily:"monospace" }}>{gi.version}</div>
                            <div style={{ fontSize: 11, color: C.dim }}>{gi.type}</div>
                            {/* Lineage */}
                            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
                              <span style={{ fontSize:11, color:C.dim }}>gen {gi.gen}</span>
                              {gi.prev && <>
                                <ChevronRight size={9} color={C.dim}/>
                                <span style={{ fontSize:11, color:C.dim, fontFamily:"monospace" }}>&larr; {gi.prev}</span>
                              </>}
                              {gi.deprecated && <span style={{ fontSize:11, padding:"2px 8px", borderRadius:3, background:`${C.amber}18`, color:C.amber, fontWeight:600 }}>DEPRECATED</span>}
                            </div>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: gi.status === "active" ? `${C.green}18` : `${C.dim}18`, color: gi.status === "active" ? C.green : C.dim }}>{gi.status.toUpperCase()}</span>
                        </div>
                        <div style={{ display: "flex", gap: 20 }}>
                          <MS label="WP" value={gi.wp} />
                          <MS label="Plugins" value={gi.plugins} />
                          <MS label="Patterns" value={gi.patterns} />
                          <MS label="Client Sites" value={gi.sites} />
                          <MS label="Lighthouse" value={gi.lighthouse} color={gi.lighthouse >= 85 ? C.green : C.amber} />
                          <MS label="Tested" value={gi.tested} />
                        </div>
                      </div>
                      {gi.status === "active" && (
                        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                          <SmBtn label="Clone & Modify" color={C.blue} />
                          <SmBtn label="Run Test Suite" color={C.green} />
                          <SmBtn label="View Contents" color={C.dim} />
                          <SmBtn label={"Promote \u2192 Production"} color={C.purple} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── TEST RESULTS ─── */}
            {labTab === "tests" && (
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Test Suite Results</h2>
                <p style={{ fontSize: 12, color: C.dim, margin: "0 0 20px" }}>Automated QA that runs before anything goes to production.</p>
                {[
                  { name: "Golden Image Smoke Test", ran: "Feb 18, 14:22", duration: "3m 12s", pass: 12, fail: 0, tests: ["Provision new site", "WP login works", "Homepage renders", "Contact form submits", "Lighthouse \u2265 85", "All plugins active", "Theme loads correctly", "SSL installs", "Mobile responsive", "404 page styled", "Sitemap generated", "No PHP errors"] },
                  { name: "Plugin Compatibility Test", ran: "Feb 19, 09:15", duration: "1m 48s", pass: 6, fail: 0, tests: ["Yoast + CF7 no conflicts", "Safe SVG upload works", "WP Mail SMTP delivers", "No JS console errors", "No PHP deprecation warnings", "Page load < 3s"] },
                  { name: "Pattern Rendering Test", ran: "Feb 18, 14:30", duration: "2m 05s", pass: 10, fail: 0, tests: ["Hero image-bg renders", "Hero split renders", "Services grid 3-col", "Trust bar", "Testimonials carousel", "FAQ accordion opens/closes", "CTA banner", "Contact form section", "Menu grid (restaurant)", "Gallery masonry"] },
                ].map(t => (
                  <div key={t.name} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${t.fail > 0 ? `${C.red}25` : `${C.green}20`}`, padding: 20, marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: "#fff" }}>{t.name}</div>
                        <div style={{ fontSize: 11, color: C.dim }}>{t.ran} · {t.duration}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>{t.pass} passed</span>
                        {t.fail > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: C.red }}>{t.fail} failed</span>}
                        {t.fail === 0 && <CheckCircle2 size={16} color={C.green} />}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {t.tests.map((test, i) => (
                        <span key={i} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: `${C.green}10`, color: C.green, border: `1px solid ${C.green}15` }}>{"\u2713"} {test}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* ADMIN AGENTS                           */}
      {/* ═══════════════════════════════════════ */}
      {section === "agents" && (
        <div>
          {/* Agent Horizontal Tab Bar */}
          <div style={{ borderBottom: `1px solid ${C.border}`, padding: "0 24px", display: "flex", alignItems: "center", gap: 2, overflowX: "auto" }}>
            {/* Managed tier badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 12px 10px 0", borderRight: `1px solid ${C.border}`, marginRight: 4, flexShrink: 0 }}>
              <Crown size={11} color={C.purple}/>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.purple }}>Managed tier only ($49/mo)</span>
            </div>

            {/* Pending Approvals Tab */}
            <button onClick={() => setAgentOpen("approvals")} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "12px 14px", border: "none", cursor: "pointer", fontSize: 12,
              background: "transparent",
              color: agentOpen === "approvals" ? C.amber : C.muted,
              fontWeight: agentOpen === "approvals" ? 600 : 400,
              borderBottom: agentOpen === "approvals" ? `2px solid ${C.amber}` : "2px solid transparent",
              flexShrink: 0,
            }}>
              <Bell size={14} color={agentOpen === "approvals" ? C.amber : C.dim} />
              Pending Approvals
              <span style={{ fontSize: 11, fontWeight: 700, color: C.amber, background: `${C.amber}20`, padding: "2px 8px", borderRadius: 10 }}>{approvals.length}</span>
            </button>

            {/* Divider */}
            <div style={{ width: 1, height: 20, background: C.border, margin: "0 6px", flexShrink: 0 }} />

            {/* Agent Tabs */}
            {AGENTS.map(a => (
              <button key={a.id} onClick={() => setAgentOpen(a.id)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "12px 14px", border: "none", cursor: "pointer", fontSize: 12,
                background: "transparent",
                color: agentOpen === a.id ? "#fff" : C.muted,
                fontWeight: agentOpen === a.id ? 600 : 400,
                borderBottom: agentOpen === a.id ? `2px solid ${C.red}` : "2px solid transparent",
                flexShrink: 0,
              }}>
                <a.icon size={14} color={agentOpen === a.id ? a.color : C.dim} />
                {a.name}
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, flexShrink: 0 }} />
              </button>
            ))}
          </div>

          {/* Agent Content */}
          <div style={{ padding: 24 }}>
            {/* ─── PENDING APPROVALS ─── */}
            {agentOpen === "approvals" && (
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Pending Approvals</h2>
                <p style={{ fontSize: 12, color: C.dim, margin: "0 0 20px" }}>Agents found these issues but need your OK before acting. Urgent items are highlighted.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {approvals.map(a => (
                    <div key={a.id} style={{
                      background: C.surface, borderRadius: 10, padding: 18,
                      border: `1px solid ${a.priority === "urgent" ? `${C.red}35` : C.border}`,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div>
                          {a.priority === "urgent" && <span style={{ fontSize: 11, fontWeight: 700, color: C.red, background: `${C.red}18`, padding: "2px 8px", borderRadius: 4, marginBottom: 6, display: "inline-block" }}>URGENT</span>}
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginTop: 4 }}>{a.action}</div>
                          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{a.reason}</div>
                          <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>Requested by {a.agent} · {a.time}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <button onClick={() => setApprovals(prev => prev.filter(x => x.id !== a.id))} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 20px", borderRadius: 7, background: C.green, color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                          <CheckCircle2 size={14} /> Approve
                        </button>
                        <button onClick={() => setApprovals(prev => prev.filter(x => x.id !== a.id))} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 20px", borderRadius: 7, background: "transparent", color: C.muted, border: `1px solid ${C.border}`, cursor: "pointer", fontSize: 12 }}>
                          <XCircle size={14} /> Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                  {approvals.length === 0 && (
                    <div style={{ textAlign: "center", padding: 40, color: C.dim }}>
                      <CheckCircle2 size={32} color={C.green} style={{ marginBottom: 10 }} />
                      <div style={{ fontSize: 14, color: C.green }}>All clear &mdash; no pending approvals</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── AGENT DETAIL ─── */}
            {agentOpen !== "approvals" && (() => {
              const agent = AGENTS.find(a => a.id === agentOpen);
              if (!agent) return null;
              return (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <agent.icon size={20} color={agent.color} />
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>{agent.name}</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, background: `${C.green}15`, borderRadius: 5, padding: "3px 10px" }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} />
                          <span style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>Running</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>{agent.desc}</p>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 7, background: `${C.green}12`, border: `1px solid ${C.green}25`, color: C.green, cursor: "pointer", fontSize: 12 }}>
                        <Play size={12} /> Run Now
                      </button>
                      <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 7, background: `${C.dim}12`, border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", fontSize: 12 }}>
                        <Settings2 size={12} /> Configure
                      </button>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                    <StatCard label="Schedule" value={agent.schedule} color={C.text} />
                    <StatCard label="Last Run" value={agent.lastRun} color={C.text} />
                    <StatCard label="Next Run" value={agent.nextRun} color={C.blue} />
                    {Object.entries(agent.stats).map(([k, v]) => (
                      <StatCard key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, (s: string) => s.toUpperCase())} value={v} color={k.includes("fail") || k.includes("issue") ? (v > 0 ? C.amber : C.green) : C.text} />
                    ))}
                  </div>

                  {/* Activity Log */}
                  <div style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Recent Activity</div>
                    {agent.recentActions.map((a, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < agent.recentActions.length - 1 ? `1px solid ${C.border}08` : "none" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: svColor[a.severity], marginTop: 5, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, color: "#fff" }}>{a.action}</div>
                          <div style={{ fontSize: 11, color: a.severity === "critical" ? C.red : a.severity === "warning" ? C.amber : C.dim }}>{a.result}</div>
                        </div>
                        <span style={{ fontSize: 11, color: C.dim, flexShrink: 0 }}>{a.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

function PluginCard({ p }: { p: typeof LAB_PLUGINS[number] }) {
  const stColor: Record<string, string> = { approved: C.green, evaluating: C.amber, rejected: C.red };
  return (
    <div style={{ background: C.surface, borderRadius: 8, border: `1px solid ${stColor[p.status]}15`, padding: 12, marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontWeight: 600, color: "#fff", fontSize: 12 }}>{p.name}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: stColor[p.status] }}>{p.result !== "\u2014" ? p.result : ""}</span>
      </div>
      <div style={{ fontSize: 11, color: C.dim, marginBottom: 6 }}>v{p.tested !== "\u2014" ? p.tested : p.latest} · {p.risk} risk · Tested {p.lastTest}</div>
      {p.notes && <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>{p.notes}</div>}
      <div style={{ display: "flex", gap: 4 }}>
        {p.status === "evaluating" && <SmBtn label="Run Tests" color={C.blue} />}
        {p.status === "evaluating" && <SmBtn label="Approve" color={C.green} />}
        {p.status === "evaluating" && <SmBtn label="Reject" color={C.red} />}
        {p.status === "approved" && <SmBtn label={"In Golden Image \u2713"} color={C.green} />}
        {p.status === "rejected" && <SmBtn label="Re-evaluate" color={C.amber} />}
      </div>
    </div>
  );
}

function SmBtn({ label, color }: { label: string; color: string }) {
  return <button style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: `${color}12`, border: `1px solid ${color}20`, color, cursor: "pointer" }}>{label}</button>;
}

function MS({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: C.dim }}>{label}</div><div style={{ fontSize: 13, fontWeight: 600, color: color || C.text }}>{value}</div></div>;
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`, padding: "16px 20px" }}>
      <div style={{ fontSize: 12, color: C.dim, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, marginTop: 2 }}>{value}</div>
    </div>
  );
}
