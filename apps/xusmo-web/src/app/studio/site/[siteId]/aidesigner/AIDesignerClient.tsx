"use client";

// =============================================================================
// AI Designer — Full-featured visual website editor with AI agent chat
// Layout: Left tools panel | Center preview | Bottom AI chat bar
// =============================================================================

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  Layers,
  Palette,
  Type,
  Eye,
  Smartphone,
  Tablet,
  Monitor,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Trash2,
  Plus,
  Send,
  Sparkles,
  Loader2,
  Check,
  AlertCircle,
  ExternalLink,
  Rocket,
  X,
  Search,
  Settings,
  Undo2,
  Image as ImageIcon,
  PenLine,
  Globe,
  Zap,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PageInfo {
  id: string;
  slug: string;
  title: string;
  sortOrder: number;
  heroHeadline: string | null;
  heroSubheadline: string | null;
  ctaLabel: string | null;
  metaTitle: string | null;
  metaDesc: string | null;
  sectionCount: number;
}

interface ThemeData {
  colors: Record<string, string>;
  fonts: Record<string, string>;
  radius: string;
}

interface SiteData {
  id: string;
  businessName: string;
  archetype: string;
  status: string;
  wpUrl: string | null;
  activePreset: string | null;
  customCss: string | null;
  hasDesignDocument: boolean;
  pages: PageInfo[];
  theme: ThemeData | null;
  componentCount: number;
  personality: string;
}

interface ActionResult {
  action: string;
  success: boolean;
  label: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  actions?: ActionResult[];
  ts: number;
}

type DeviceMode = "desktop" | "tablet" | "mobile";
type ToolPanel = "sections" | "theme" | "pages" | "seo" | "publish";

const DEVICE_WIDTHS: Record<DeviceMode, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

const COMPONENT_CATEGORIES: Record<string, string[]> = {
  "Header & Nav": ["announcement-bar", "navbar", "dropdown-nav", "mega-menu", "sticky-header", "search-bar"],
  "Hero": ["hero", "hero-image", "hero-video", "hero-stats", "trust-badges", "scroll-indicator"],
  "Content": ["section-title", "content-card", "featured-content", "about-section", "services-section", "features", "product-grid", "category-showcase"],
  "Media": ["gallery", "carousel", "lightbox", "video-player", "embedded-media", "audio-player", "before-after-comparison"],
  "Forms & Interaction": ["contact", "contact-form", "newsletter-form", "quick-inquiry-form", "feedback-form", "rating-widget", "review-form", "comment-section"],
  "E-commerce": ["pricing", "pricing-table", "product-card", "product-detail", "add-to-cart-button", "wishlist-button", "product-gallery", "product-specs-table"],
  "Social Proof": ["testimonials", "case-studies", "client-logos", "certifications-badges", "faq-accordion", "feature-comparison"],
  "User Account": ["user-dashboard", "profile-page", "edit-profile-form", "order-history", "saved-items", "notifications-center"],
  "Utility": ["breadcrumbs", "pagination", "back-to-top", "cookie-consent", "loading-spinner", "empty-state", "error-message"],
  "Footer": ["footer", "social-media-icons", "footer-newsletter", "contact-details-block", "map-embed", "legal-links", "copyright-notice"],
};

const FONT_OPTIONS = [
  "Inter", "DM Sans", "Lato", "Open Sans", "Nunito", "Work Sans",
  "Playfair Display", "Lora", "Poppins", "Montserrat", "Merriweather",
  "Space Grotesk", "Sora", "Plus Jakarta Sans", "Outfit",
];

const PRESETS = [
  { id: "professional", label: "Professional", color: "#1e3a8a" },
  { id: "bold", label: "Bold", color: "#dc2626" },
  { id: "elegant", label: "Elegant", color: "#b45309" },
  { id: "minimal", label: "Minimal", color: "#18181b" },
  { id: "warm", label: "Warm", color: "#d97706" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AIDesignerClient({ site }: { site: SiteData }) {
  const router = useRouter();

  // Tool panel state
  const [activePanel, setActivePanel] = useState<ToolPanel>("sections");
  // BUG 11 FIX: Always default to "home", not first page alphabetically
  const [activePage, setActivePage] = useState(
    site.pages.find((p) => p.slug === "home")?.slug || site.pages[0]?.slug || "home"
  );

  // Sections state (fetched from API)
  const [sections, setSections] = useState<Record<string, unknown>[]>([]);
  const [sectionPages, setSectionPages] = useState<Record<string, unknown>>({});
  const [themeData, setThemeData] = useState<ThemeData | null>(site.theme);
  const [loadingSections, setLoadingSections] = useState(true);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSearch, setAddSearch] = useState("");

  // Preview state
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [previewKey, setPreviewKey] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(true);
  const previewPage = activePage;

  // Chat state — BUG 9 FIX: restore from localStorage
  const [chatOpen, setChatOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(`xusmo_chat_${site.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // BUG 9 FIX: Save chat to localStorage on change
  useEffect(() => {
    try {
      // Keep last 50 messages to avoid storage bloat
      const toSave = chatMessages.slice(-50);
      localStorage.setItem(`xusmo_chat_${site.id}`, JSON.stringify(toSave));
    } catch { /* ignore */ }
  }, [chatMessages, site.id]);

  // Saving state
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Publish state
  const [publishing, setPublishing] = useState(false);

  // ---- Fetch sections on mount ----
  useEffect(() => {
    fetchSections();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSections = async () => {
    setLoadingSections(true);
    try {
      const res = await fetch(`/api/studio/${site.id}/design/sections`);
      if (res.ok) {
        const data = await res.json();
        setSectionPages(data.pages || {});
        if (data.theme) setThemeData(data.theme);
        const pageData = data.pages?.[activePage];
        if (pageData?.sections) {
          setSections(pageData.sections);
        }
      }
    } catch { /* ignore */ }
    setLoadingSections(false);
  };

  // When activePage changes, update sections
  useEffect(() => {
    const pageData = sectionPages[activePage] as Record<string, unknown> | undefined;
    if (pageData?.sections && Array.isArray(pageData.sections)) {
      setSections(pageData.sections as Record<string, unknown>[]);
    } else {
      setSections([]);
    }
  }, [activePage, sectionPages]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  const refreshPreview = useCallback(() => {
    setPreviewLoading(true);
    setTimeout(() => setPreviewKey((k) => k + 1), 1500);
  }, []);

  // ---- Section operations ----
  const saveSections = async (newSections: Record<string, unknown>[]) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/studio/${site.id}/design/sections`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageSlug: activePage, sections: newSections }),
      });
      if (res.ok) {
        setSections(newSections);
        setSectionPages((prev) => ({
          ...prev,
          [activePage]: { ...(prev[activePage] as Record<string, unknown> || {}), sections: newSections },
        }));
        setSaveMsg("Saved");
        setTimeout(() => setSaveMsg(null), 2000);
        refreshPreview();
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const moveSection = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[idx], next[target]] = [next[target], next[idx]];
    saveSections(next);
  };

  const deleteSection = (idx: number) => {
    const next = sections.filter((_, i) => i !== idx);
    saveSections(next);
  };

  const addSection = (componentKey: string) => {
    const newSection = {
      id: `section-${Date.now()}`,
      component: componentKey,
      props: {},
      layout: { background: "default", padding: "lg", width: "contained", align: "center" },
      style: {},
    };
    saveSections([...sections, newSection]);
    setShowAddModal(false);
    setAddSearch("");
  };

  const updateSectionProp = (idx: number, key: string, value: unknown) => {
    const next = [...sections];
    const s = { ...next[idx] };
    const props = { ...(s.props as Record<string, unknown> || {}) };
    props[key] = value;
    s.props = props;
    next[idx] = s;
    setSections(next);
  };

  const saveSectionProps = (idx: number) => {
    saveSections(sections);
  };

  // ---- Theme operations ----
  const saveTheme = async (updates: Partial<ThemeData>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/studio/${site.id}/design/theme`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.theme) setThemeData(data.theme);
        refreshPreview();
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  // ---- Preset ----
  const applyPreset = async (preset: string) => {
    setSaving(true);
    try {
      await fetch(`/api/studio/${site.id}/design/apply-preset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preset }),
      });
      refreshPreview();
    } catch { /* ignore */ }
    setSaving(false);
  };

  // ---- Chat / Multi-Agent Pipeline ----
  const sendChat = async (text: string) => {
    if (!text.trim() || chatLoading) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: text.trim(),
      ts: Date.now(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const history = chatMessages.slice(-10).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      // Use the multi-agent pipeline endpoint
      const res = await fetch(`/api/studio/${site.id}/agents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), history }),
      });

      if (!res.ok) {
        // Fallback to old single-agent endpoint
        const fallback = await fetch(`/api/studio/${site.id}/agent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text.trim(), history }),
        });
        if (!fallback.ok) throw new Error(`${fallback.status}`);
        const data = await fallback.json();
        const botMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: data.reply,
          actions: data.actions,
          ts: Date.now(),
        };
        setChatMessages((prev) => [...prev, botMsg]);
        if (data.actions?.some((a: ActionResult) => a.success)) {
          refreshPreview();
          fetchSections();
        }
        setChatLoading(false);
        return;
      }

      const data = await res.json();

      // Show agent name in the response
      const agentLabels: Record<string, string> = {
        builder: "Website Builder",
        editor: "Editor",
        ecommerce: "E-commerce",
        image: "Image",
        seo: "SEO",
        vibe: "Vibe Coder",
      };
      const agentName = agentLabels[data.agent] || data.agent || "";
      const durationSec = data.durationMs ? `${Math.round(data.durationMs / 1000)}s` : "";

      const botMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: `${agentName ? `[${agentName} Agent${durationSec ? ` \u00b7 ${durationSec}` : ""}] ` : ""}${data.reply}`,
        actions: data.actions,
        ts: Date.now(),
      };
      setChatMessages((prev) => [...prev, botMsg]);

      // Refresh preview if any action succeeded
      if (data.actions?.some((a: ActionResult) => a.success)) {
        refreshPreview();
        fetchSections();
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, role: "assistant", text: "Something went wrong. Please try again.", ts: Date.now() },
      ]);
    }
    setChatLoading(false);
  };

  const handleChatSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendChat(chatInput);
  };

  // ---- Publish ----
  const handleApprove = async () => {
    setPublishing(true);
    try {
      await fetch(`/api/studio/${site.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      router.refresh();
    } catch { /* ignore */ }
    setPublishing(false);
  };

  // ---- Preview URL ----
  const previewUrl = site.wpUrl
    ? `${site.wpUrl}${previewPage !== "home" ? `/${previewPage}` : ""}`
    : `/engine-preview/${site.id}${previewPage !== "home" ? `?page=${previewPage}` : ""}`;

  // ===========================================================================
  // RENDER
  // ===========================================================================

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "'Inter',-apple-system,sans-serif", background: C.bg, overflow: "hidden" }}>

      {/* ── Top Bar ── */}
      <div style={{ height: 48, background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 16px", gap: 12, flexShrink: 0 }}>
        <Zap size={18} color={C.accent} />
        <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>AI Designer</span>
        <span style={{ fontSize: 12, color: C.dim, background: C.surfaceAlt, padding: "2px 8px", borderRadius: 6 }}>{site.businessName}</span>

        <div style={{ flex: 1 }} />

        {/* Device switcher */}
        <div style={{ display: "flex", gap: 2, background: C.surfaceAlt, borderRadius: 8, padding: 2 }}>
          {([
            { key: "desktop" as DeviceMode, icon: <Monitor size={14} /> },
            { key: "tablet" as DeviceMode, icon: <Tablet size={14} /> },
            { key: "mobile" as DeviceMode, icon: <Smartphone size={14} /> },
          ]).map((d) => (
            <button
              key={d.key}
              onClick={() => setDevice(d.key)}
              style={{
                padding: "5px 10px",
                border: "none",
                borderRadius: 6,
                background: device === d.key ? C.surface : "transparent",
                color: device === d.key ? C.accent : C.dim,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                boxShadow: device === d.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {d.icon}
            </button>
          ))}
        </div>

        <button onClick={refreshPreview} style={{ background: "none", border: "none", color: C.dim, cursor: "pointer", padding: 4 }} title="Refresh preview">
          <RefreshCw size={14} />
        </button>

        <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ color: C.dim, padding: 4, display: "flex" }} title="Open in new tab">
          <ExternalLink size={14} />
        </a>

        {/* Status badge */}
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          padding: "3px 10px",
          borderRadius: 6,
          background: site.status === "LIVE" ? `${C.green}15` : `${C.amber}15`,
          color: site.status === "LIVE" ? C.green : C.amber,
        }}>
          {site.status}
        </span>

        {/* Publish button */}
        {site.status !== "LIVE" && (
          <button
            onClick={handleApprove}
            disabled={publishing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 16px",
              background: C.accent,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: publishing ? "not-allowed" : "pointer",
              opacity: publishing ? 0.6 : 1,
            }}
          >
            {publishing ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Rocket size={13} />}
            Publish
          </button>
        )}
      </div>

      {/* ── Main Area: Left Panel + Preview ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── Left Tool Panel ── */}
        <div style={{ width: 320, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", background: C.surface, flexShrink: 0 }}>

          {/* Panel tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            {([
              { key: "sections" as ToolPanel, icon: <Layers size={13} />, label: "Sections" },
              { key: "theme" as ToolPanel, icon: <Palette size={13} />, label: "Theme" },
              { key: "pages" as ToolPanel, icon: <Globe size={13} />, label: "Pages" },
              { key: "publish" as ToolPanel, icon: <Rocket size={13} />, label: "Publish" },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActivePanel(tab.key)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  padding: "10px 0",
                  border: "none",
                  borderBottom: activePanel === tab.key ? `2px solid ${C.accent}` : "2px solid transparent",
                  background: "transparent",
                  color: activePanel === tab.key ? C.accent : C.dim,
                  fontSize: 11,
                  fontWeight: activePanel === tab.key ? 600 : 500,
                  cursor: "pointer",
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>

            {/* ── SECTIONS PANEL ── */}
            {activePanel === "sections" && (
              <div>
                {/* Page selector */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.dim, display: "block", marginBottom: 4 }}>PAGE</label>
                  <select
                    value={activePage}
                    onChange={(e) => setActivePage(e.target.value)}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 12 }}
                  >
                    {Object.keys(sectionPages).length > 0
                      ? Object.keys(sectionPages).map((slug) => (
                          <option key={slug} value={slug}>{slug}</option>
                        ))
                      : site.pages.map((p) => (
                          <option key={p.slug} value={p.slug}>{p.title} ({p.slug})</option>
                        ))
                    }
                  </select>
                </div>

                {loadingSections ? (
                  <div style={{ textAlign: "center", padding: 40, color: C.dim }}>
                    <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                  </div>
                ) : sections.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, color: C.dim, fontSize: 12 }}>
                    No sections on this page
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {sections.map((s, idx) => {
                      const component = (s.component as string) || "unknown";
                      const props = (s.props as Record<string, unknown>) || {};
                      const propKeys = Object.keys(props);
                      const isExpanded = expandedSection === idx;

                      return (
                        <div key={idx} style={{ border: `1px solid ${isExpanded ? C.accent : C.border}`, borderRadius: 8, background: C.bg, overflow: "hidden" }}>
                          {/* Section header */}
                          <div
                            onClick={() => setExpandedSection(isExpanded ? null : idx)}
                            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", cursor: "pointer" }}
                          >
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.text, flex: 1 }}>
                              {component}
                            </span>
                            <span style={{ fontSize: 10, color: C.dim }}>{propKeys.length}p</span>
                            <button onClick={(e) => { e.stopPropagation(); moveSection(idx, -1); }} disabled={idx === 0} style={{ background: "none", border: "none", color: idx === 0 ? C.border : C.dim, cursor: "pointer", padding: 2 }}><ChevronUp size={12} /></button>
                            <button onClick={(e) => { e.stopPropagation(); moveSection(idx, 1); }} disabled={idx === sections.length - 1} style={{ background: "none", border: "none", color: idx === sections.length - 1 ? C.border : C.dim, cursor: "pointer", padding: 2 }}><ChevronDown size={12} /></button>
                            <button onClick={(e) => { e.stopPropagation(); if (confirm(`Delete ${component}?`)) deleteSection(idx); }} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", padding: 2 }}><Trash2 size={12} /></button>
                            <ChevronRight size={12} style={{ color: C.dim, transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
                          </div>

                          {/* Expanded: prop editor */}
                          {isExpanded && (
                            <div style={{ padding: "0 10px 10px", borderTop: `1px solid ${C.border}` }}>
                              {propKeys.length === 0 ? (
                                <div style={{ padding: "10px 0", fontSize: 11, color: C.dim }}>No editable props</div>
                              ) : (
                                propKeys.map((key) => {
                                  const val = props[key];
                                  const isLong = typeof val === "string" && val.length > 80;
                                  const isComplex = typeof val === "object";
                                  const isColor = typeof val === "string" && /^#[0-9a-f]{3,8}$/i.test(val);

                                  return (
                                    <div key={key} style={{ marginTop: 8 }}>
                                      <label style={{ fontSize: 10, fontWeight: 600, color: C.dim, display: "block", marginBottom: 2 }}>{key}</label>
                                      {isColor ? (
                                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                          <input type="color" value={val as string} onChange={(e) => updateSectionProp(idx, key, e.target.value)} style={{ width: 28, height: 28, border: "none", cursor: "pointer" }} />
                                          <input type="text" value={val as string} onChange={(e) => updateSectionProp(idx, key, e.target.value)} style={{ flex: 1, padding: "4px 8px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 11, background: C.bg, color: C.text }} />
                                        </div>
                                      ) : isComplex ? (
                                        <textarea
                                          value={JSON.stringify(val, null, 2)}
                                          onChange={(e) => { try { updateSectionProp(idx, key, JSON.parse(e.target.value)); } catch { /* wait for valid JSON */ } }}
                                          style={{ width: "100%", minHeight: 80, padding: "6px 8px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 10, fontFamily: "monospace", background: C.bg, color: C.text, resize: "vertical" }}
                                        />
                                      ) : isLong ? (
                                        <textarea
                                          value={String(val)}
                                          onChange={(e) => updateSectionProp(idx, key, e.target.value)}
                                          style={{ width: "100%", minHeight: 60, padding: "6px 8px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 11, background: C.bg, color: C.text, resize: "vertical" }}
                                        />
                                      ) : (
                                        <input
                                          type="text"
                                          value={String(val ?? "")}
                                          onChange={(e) => updateSectionProp(idx, key, e.target.value)}
                                          style={{ width: "100%", padding: "5px 8px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 11, background: C.bg, color: C.text }}
                                        />
                                      )}
                                    </div>
                                  );
                                })
                              )}
                              <button
                                onClick={() => saveSectionProps(idx)}
                                disabled={saving}
                                style={{ marginTop: 8, padding: "5px 14px", background: C.accent, color: "#fff", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.6 : 1 }}
                              >
                                {saving ? "Saving..." : "Save Props"}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add section button */}
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{ width: "100%", marginTop: 10, padding: "8px 0", border: `1px dashed ${C.border}`, borderRadius: 8, background: "transparent", color: C.dim, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  <Plus size={14} /> Add Section
                </button>
              </div>
            )}

            {/* ── THEME PANEL ── */}
            {activePanel === "theme" && themeData && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }}>Colors</div>
                {Object.entries(themeData.colors).map(([key, val]) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <input type="color" value={val} onChange={(e) => setThemeData((t) => t ? { ...t, colors: { ...t.colors, [key]: e.target.value } } : t)} style={{ width: 28, height: 28, border: "none", cursor: "pointer" }} />
                    <span style={{ fontSize: 11, color: C.dim, width: 70 }}>{key}</span>
                    <input type="text" value={val} onChange={(e) => setThemeData((t) => t ? { ...t, colors: { ...t.colors, [key]: e.target.value } } : t)} style={{ flex: 1, padding: "4px 8px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 11, background: C.bg, color: C.text }} />
                  </div>
                ))}
                <button onClick={() => saveTheme({ colors: themeData.colors })} disabled={saving} style={{ width: "100%", padding: "7px 0", background: C.accent, color: "#fff", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", marginTop: 4, marginBottom: 16, opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Saving..." : "Save Colors"}
                </button>

                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>Fonts</div>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: C.dim, display: "block", marginBottom: 2 }}>Heading</label>
                  <select value={themeData.fonts.heading || ""} onChange={(e) => setThemeData((t) => t ? { ...t, fonts: { ...t.fonts, heading: e.target.value } } : t)} style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 12 }}>
                    {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: C.dim, display: "block", marginBottom: 2 }}>Body</label>
                  <select value={themeData.fonts.body || ""} onChange={(e) => setThemeData((t) => t ? { ...t, fonts: { ...t.fonts, body: e.target.value } } : t)} style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 12 }}>
                    {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <button onClick={() => saveTheme({ fonts: themeData.fonts })} disabled={saving} style={{ width: "100%", padding: "7px 0", background: C.accent, color: "#fff", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", marginBottom: 16, opacity: saving ? 0.6 : 1 }}>
                  Save Fonts
                </button>

                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>Border Radius</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="range" min={0} max={32} value={parseInt(themeData.radius) || 8} onChange={(e) => setThemeData((t) => t ? { ...t, radius: `${e.target.value}px` } : t)} style={{ flex: 1 }} />
                  <span style={{ fontSize: 12, color: C.text, width: 40 }}>{themeData.radius}</span>
                </div>
                <button onClick={() => saveTheme({ radius: themeData.radius })} disabled={saving} style={{ width: "100%", padding: "7px 0", background: C.accent, color: "#fff", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", marginTop: 8, marginBottom: 16, opacity: saving ? 0.6 : 1 }}>
                  Save Radius
                </button>

                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>Quick Presets</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {PRESETS.map((p) => (
                    <button key={p.id} onClick={() => applyPreset(p.id)} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${site.activePreset === p.id ? C.accent : C.border}`, background: site.activePreset === p.id ? `${C.accent}10` : C.bg, color: site.activePreset === p.id ? C.accent : C.text, fontSize: 11, fontWeight: 500, cursor: "pointer" }}>
                      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: p.color, marginRight: 6 }} />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── PAGES PANEL ── */}
            {activePanel === "pages" && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }}>Site Pages</div>
                {site.pages.map((p) => (
                  <div
                    key={p.slug}
                    onClick={() => { setActivePage(p.slug); setActivePanel("sections"); }}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: `1px solid ${activePage === p.slug ? C.accent : C.border}`, borderRadius: 8, marginBottom: 6, background: activePage === p.slug ? `${C.accent}08` : C.bg, cursor: "pointer" }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: C.dim }}>/{p.slug} &middot; {p.sectionCount} sections</div>
                    </div>
                    {p.heroHeadline && (
                      <div style={{ fontSize: 10, color: C.dim, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.heroHeadline}</div>
                    )}
                    <ChevronRight size={14} color={C.dim} />
                  </div>
                ))}
              </div>
            )}

            {/* ── PUBLISH PANEL ── */}
            {activePanel === "publish" && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }}>Site Status</div>
                <div style={{ padding: 16, background: C.bg, borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: site.status === "LIVE" ? C.green : C.amber, marginBottom: 4 }}>{site.status}</div>
                  <div style={{ fontSize: 12, color: C.dim }}>{site.businessName} &middot; {site.archetype}</div>
                  {site.wpUrl && <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>{site.wpUrl}</div>}
                  {!site.wpUrl && site.hasDesignDocument && <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>Engine-rendered (React)</div>}
                </div>

                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>Summary</div>
                <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.8 }}>
                  Pages: {site.pages.length}<br />
                  Components: {site.componentCount || "N/A"}<br />
                  Personality: {site.personality || "N/A"}<br />
                  Preset: {site.activePreset || "none"}<br />
                </div>

                {site.status !== "LIVE" && (
                  <button
                    onClick={handleApprove}
                    disabled={publishing}
                    style={{ width: "100%", marginTop: 20, padding: "12px 0", background: C.green, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: publishing ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: publishing ? 0.6 : 1 }}
                  >
                    {publishing ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Rocket size={16} />}
                    Approve & Publish
                  </button>
                )}
              </div>
            )}
          </div>

          {saving && (
            <div style={{ padding: "6px 12px", background: `${C.green}15`, color: C.green, fontSize: 11, fontWeight: 600, textAlign: "center", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
              <Check size={12} /> {saveMsg || "Saving..."}
            </div>
          )}
        </div>

        {/* ── Center: Preview ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#e5e7eb", overflow: "hidden" }}>
          {/* Preview frame */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: device === "desktop" ? 0 : 20, overflow: "hidden" }}>
            <div style={{ width: DEVICE_WIDTHS[device], maxWidth: "100%", height: "100%", position: "relative", background: "#fff", boxShadow: device !== "desktop" ? "0 4px 40px rgba(0,0,0,0.12)" : "none", borderRadius: device !== "desktop" ? 12 : 0, overflow: "hidden" }}>
              {previewLoading && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", zIndex: 2 }}>
                  <Loader2 size={24} color={C.dim} style={{ animation: "spin 1s linear infinite" }} />
                </div>
              )}
              <iframe
                key={previewKey}
                src={`${previewUrl}${previewUrl.includes("?") ? "&" : "?"}cb=${previewKey}`}
                title="Preview"
                onLoad={() => setPreviewLoading(false)}
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom: AI Chat Bar ── */}
      <div style={{
        borderTop: `1px solid ${C.border}`,
        background: C.surface,
        flexShrink: 0,
        transition: "height 0.2s",
      }}>
        {/* Chat toggle */}
        <div
          onClick={() => setChatOpen(!chatOpen)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", cursor: "pointer", borderBottom: chatOpen ? `1px solid ${C.border}` : "none" }}
        >
          <Sparkles size={14} color={C.accent} />
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text, flex: 1 }}>AI Assistant</span>
          {chatMessages.length > 0 && (
            <span style={{ fontSize: 10, background: C.accent, color: "#fff", borderRadius: 10, padding: "1px 7px", fontWeight: 600 }}>{chatMessages.length}</span>
          )}
          {chatOpen ? <ChevronDown size={14} color={C.dim} /> : <ChevronUp size={14} color={C.dim} />}
        </div>

        {chatOpen && (
          <div style={{ display: "flex", flexDirection: "column", height: 200 }}>
            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              {chatMessages.length === 0 && !chatLoading && (
                <div style={{ textAlign: "center", padding: "16px 0", color: C.dim, fontSize: 12 }}>
                  Tell the AI what to change — headlines, colors, layout, content...
                  <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
                    {["Build me a website for a bakery in NYC", "Change hero image to botanical garden", "Make the design more modern and bold", "Optimize SEO for all pages", "Add a testimonials section", "What sections does my homepage have?"].map((s) => (
                      <button key={s} onClick={() => sendChat(s)} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.dim, fontSize: 11, cursor: "pointer" }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              {chatMessages.map((m) => (
                <div key={m.id} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                  <div style={{
                    padding: "8px 12px",
                    borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                    background: m.role === "user" ? C.accent : C.surfaceAlt,
                    color: m.role === "user" ? "#fff" : C.text,
                    fontSize: 12,
                    lineHeight: 1.5,
                  }}>
                    {m.text}
                  </div>
                  {m.actions && m.actions.filter((a) => a.action !== "INFO").length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                      {m.actions.filter((a) => a.action !== "INFO").map((a, i) => (
                        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 500, background: a.success ? `${C.green}15` : `${C.red}15`, color: a.success ? C.green : C.red }}>
                          {a.success ? <Check size={9} /> : <AlertCircle size={9} />}
                          {a.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {chatLoading && (
                <div style={{ alignSelf: "flex-start", padding: "8px 12px", background: C.surfaceAlt, borderRadius: "12px 12px 12px 4px", fontSize: 12, color: C.dim, display: "flex", alignItems: "center", gap: 6 }}>
                  <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Thinking...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleChatSubmit} style={{ display: "flex", gap: 8, padding: "8px 16px", borderTop: `1px solid ${C.border}` }}>
              <input
                ref={chatInputRef}
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI to change anything..."
                disabled={chatLoading}
                style={{ flex: 1, padding: "8px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12, background: C.bg, color: C.text, outline: "none" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = C.accent; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                style={{ padding: "8px 14px", background: C.accent, color: "#fff", border: "none", borderRadius: 10, cursor: !chatInput.trim() || chatLoading ? "not-allowed" : "pointer", opacity: !chatInput.trim() || chatLoading ? 0.5 : 1, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}
              >
                {chatLoading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={14} />}
                Send
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ── Add Section Modal ── */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }} onClick={() => { setShowAddModal(false); setAddSearch(""); }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 500, maxHeight: "70vh", background: C.surface, borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
              <Plus size={16} color={C.accent} />
              <span style={{ fontSize: 14, fontWeight: 700, color: C.text, flex: 1 }}>Add Section</span>
              <button onClick={() => { setShowAddModal(false); setAddSearch(""); }} style={{ background: "none", border: "none", color: C.dim, cursor: "pointer" }}><X size={16} /></button>
            </div>
            <div style={{ padding: "8px 20px" }}>
              <input
                type="text"
                value={addSearch}
                onChange={(e) => setAddSearch(e.target.value)}
                placeholder="Search components..."
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, background: C.bg, color: C.text }}
                autoFocus
              />
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px 20px" }}>
              {Object.entries(COMPONENT_CATEGORIES).map(([cat, comps]) => {
                const filtered = comps.filter((c) => !addSearch || c.includes(addSearch.toLowerCase()));
                if (filtered.length === 0) return null;
                return (
                  <div key={cat} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{cat}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {filtered.map((comp) => (
                        <button
                          key={comp}
                          onClick={() => addSection(comp)}
                          style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 11, cursor: "pointer" }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.background = `${C.accent}08`; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg; }}
                        >
                          {comp}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
