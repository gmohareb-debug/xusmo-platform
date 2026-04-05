"use client";

// =============================================================================
// Section Editor — View, edit, reorder, add, and remove sections from
// a site's designDocument pages. Also includes ThemeEditor for token editing.
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import { C } from "@/lib/studio/colors";
import ThemeEditor from "./ThemeEditor";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Palette,
  Layers,
  X,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  GripVertical,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SectionDef {
  component: string;
  props?: Record<string, unknown>;
  layout?: Record<string, unknown>;
  style?: Record<string, unknown>;
}

interface PagesMap {
  [pageSlug: string]: { sections: SectionDef[] };
}

// ---------------------------------------------------------------------------
// Component registry categories (from XUSMO-ENGINE-DOCS.md)
// ---------------------------------------------------------------------------

const COMPONENT_CATEGORIES: { name: string; components: string[] }[] = [
  {
    name: "Header & Navigation",
    components: [
      "Navbar", "MegaMenu", "DropdownNav", "StickyHeader", "SearchBar",
      "LoginButton", "RegisterButton", "UserAvatarMenu", "NotificationIcon",
      "LanguageSelector", "AnnouncementBar",
    ],
  },
  {
    name: "Hero & Landing",
    components: ["Hero", "HeroVideo", "HeroStats", "TrustBadges", "ScrollIndicator"],
  },
  {
    name: "Content Display",
    components: [
      "SectionTitle", "ContentCard", "FeaturedContent", "AboutSection",
      "ServicesSection", "Features", "ProductGrid", "CategoryShowcase",
      "TagCloud", "RelatedContent", "AuthorProfile",
    ],
  },
  {
    name: "Media",
    components: [
      "Gallery", "Carousel", "Lightbox", "VideoPlayer", "EmbeddedMedia",
      "AudioPlayer", "BeforeAfterComparison",
    ],
  },
  {
    name: "Interaction",
    components: [
      "Contact", "ContactForm", "NewsletterForm", "QuickInquiryForm",
      "FileUploadForm", "LiveChatWidget", "ChatbotAssistant", "FeedbackForm",
      "RatingWidget", "ReviewForm", "CommentSection",
    ],
  },
  {
    name: "Search & Filtering",
    components: [
      "AdvancedSearch", "SearchResults", "FiltersSidebar", "SortControls",
      "PriceFilter", "TagFilters", "CategoryFilters", "ClearFilterButton",
    ],
  },
  {
    name: "Marketplace / Product",
    components: [
      "Pricing", "ProductCard", "ProductDetail", "AddToCartButton",
      "WishlistButton", "CompareButton", "ProductGallery", "ProductSpecsTable",
      "StockIndicator", "PriceDisplay", "DiscountBadge",
    ],
  },
  {
    name: "User Account",
    components: [
      "UserDashboard", "ProfilePage", "EditProfileForm", "OrderHistory",
      "SavedItems", "NotificationsCenter", "MessagesInbox", "ActivityTimeline",
    ],
  },
  {
    name: "Business & Trust",
    components: [
      "Testimonials", "CaseStudies", "ClientLogos", "PricingTable",
      "FeatureComparison", "FaqAccordion", "CertificationsBadges",
    ],
  },
  {
    name: "Utility",
    components: [
      "Breadcrumbs", "Pagination", "BackToTop", "CookieConsent",
      "LoadingSpinner", "EmptyState", "ErrorMessage", "MaintenanceNotice",
    ],
  },
  {
    name: "Footer",
    components: [
      "Footer", "SocialMediaIcons", "FooterNewsletter", "ContactDetailsBlock",
      "MapEmbed", "LegalLinks", "CopyrightNotice",
    ],
  },
];

// ---------------------------------------------------------------------------
// Long-text prop heuristics
// ---------------------------------------------------------------------------

const LONG_TEXT_KEYS = new Set([
  "description", "bodyContent", "body", "content", "text", "summary",
  "bio", "details", "paragraph", "excerpt",
]);

const COLOR_KEYS = new Set([
  "color", "bgColor", "backgroundColor", "textColor", "borderColor",
  "accentColor", "iconColor",
]);

function isJsonValue(val: unknown): boolean {
  return Array.isArray(val) || (typeof val === "object" && val !== null);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PropsEditor({
  props,
  onChange,
}: {
  props: Record<string, unknown>;
  onChange: (updated: Record<string, unknown>) => void;
}) {
  const keys = Object.keys(props);
  if (keys.length === 0) {
    return (
      <div style={{ fontSize: 12, color: C.dim, padding: "8px 0" }}>
        No props defined. Click to add via JSON editor.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {keys.map((key) => {
        const val = props[key];

        // JSON (arrays / objects)
        if (isJsonValue(val)) {
          return (
            <div key={key}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4, display: "block" }}>
                {key} <span style={{ color: C.dim, fontWeight: 400 }}>(JSON)</span>
              </label>
              <textarea
                value={JSON.stringify(val, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    onChange({ ...props, [key]: parsed });
                  } catch {
                    // keep raw text but don't update props until valid JSON
                  }
                }}
                rows={5}
                style={{
                  width: "100%",
                  padding: 10,
                  background: "#0d1117",
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  color: "#e6edf3",
                  fontSize: 12,
                  fontFamily: "'Fira Code', 'Consolas', monospace",
                  lineHeight: 1.5,
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>
          );
        }

        // Color
        if (COLOR_KEYS.has(key) || (typeof val === "string" && /^#[0-9a-fA-F]{3,8}$/.test(val))) {
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, minWidth: 90 }}>{key}</label>
              <input
                type="color"
                value={typeof val === "string" ? val : "#000000"}
                onChange={(e) => onChange({ ...props, [key]: e.target.value })}
                style={{
                  width: 28,
                  height: 28,
                  border: `1px solid ${C.border}`,
                  borderRadius: 4,
                  cursor: "pointer",
                  padding: 0,
                }}
              />
              <span style={{ fontSize: 11, color: C.dim, fontFamily: "monospace" }}>{String(val)}</span>
            </div>
          );
        }

        // Long text
        if (LONG_TEXT_KEYS.has(key) || (typeof val === "string" && (val as string).length > 100)) {
          return (
            <div key={key}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4, display: "block" }}>{key}</label>
              <textarea
                value={String(val || "")}
                onChange={(e) => onChange({ ...props, [key]: e.target.value })}
                rows={3}
                style={{
                  width: "100%",
                  padding: 8,
                  background: C.surfaceAlt,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  color: C.text,
                  fontSize: 12,
                  lineHeight: 1.5,
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>
          );
        }

        // Short text / number / boolean (default: text input)
        return (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, minWidth: 90 }}>{key}</label>
            <input
              type="text"
              value={String(val ?? "")}
              onChange={(e) => {
                let newVal: unknown = e.target.value;
                // Preserve numbers/booleans
                if (typeof val === "number") {
                  const n = Number(e.target.value);
                  if (!isNaN(n)) newVal = n;
                } else if (typeof val === "boolean") {
                  newVal = e.target.value === "true";
                }
                onChange({ ...props, [key]: newVal });
              }}
              style={{
                flex: 1,
                padding: "6px 10px",
                background: C.surfaceAlt,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: C.text,
                fontSize: 12,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add Section Modal
// ---------------------------------------------------------------------------

function AddSectionModal({
  onAdd,
  onClose,
}: {
  onAdd: (component: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const lower = search.toLowerCase();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 560,
          maxHeight: "80vh",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Plus size={18} color={C.accent} />
            <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Add Section</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "12px 20px 0" }}>
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            style={{
              width: "100%",
              padding: "8px 12px",
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              color: C.text,
              fontSize: 13,
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Component list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px 20px" }}>
          {COMPONENT_CATEGORIES.map((cat) => {
            const filtered = cat.components.filter((c) =>
              c.toLowerCase().includes(lower)
            );
            if (filtered.length === 0) return null;
            return (
              <div key={cat.name} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.dim,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 8,
                  }}
                >
                  {cat.name}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {filtered.map((comp) => (
                    <button
                      key={comp}
                      onClick={() => {
                        onAdd(comp);
                        onClose();
                      }}
                      style={{
                        padding: "6px 12px",
                        background: C.surfaceAlt,
                        border: `1px solid ${C.border}`,
                        borderRadius: 6,
                        color: C.text,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.1s",
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.borderColor = C.accent;
                        (e.target as HTMLElement).style.color = C.accent;
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.borderColor = C.border;
                        (e.target as HTMLElement).style.color = C.text;
                      }}
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
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function SectionEditor({ siteId }: { siteId: string }) {
  const [pages, setPages] = useState<PagesMap>({});
  const [selectedPage, setSelectedPage] = useState<string>("");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [noDesignDoc, setNoDesignDoc] = useState(false);
  const [activePanel, setActivePanel] = useState<"sections" | "theme">("sections");

  // Fetch pages
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/studio/${siteId}/design/sections`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (!cancelled) {
          const pagesData = data.pages || {};
          // Check if there's any content
          const pageKeys = Object.keys(pagesData);
          if (pageKeys.length === 0) {
            setNoDesignDoc(true);
          } else {
            setPages(pagesData);
            setSelectedPage(pageKeys[0]);
          }
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setNoDesignDoc(true);
          setLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [siteId]);

  const currentSections: SectionDef[] =
    selectedPage && pages[selectedPage]?.sections
      ? pages[selectedPage].sections
      : [];

  // Save sections
  const saveSections = useCallback(
    async (updatedSections: SectionDef[]) => {
      setSaving(true);
      setToast(null);
      try {
        const res = await fetch(`/api/studio/${siteId}/design/sections`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageSlug: selectedPage, sections: updatedSections }),
        });
        if (res.ok) {
          setPages((prev) => ({
            ...prev,
            [selectedPage]: { ...prev[selectedPage], sections: updatedSections },
          }));
          setToast({ type: "success", msg: "Sections saved" });
          window.dispatchEvent(new Event("xusmo-design-refresh"));
          setTimeout(() => setToast(null), 2500);
        } else {
          setToast({ type: "error", msg: "Failed to save" });
          setTimeout(() => setToast(null), 4000);
        }
      } catch {
        setToast({ type: "error", msg: "Network error" });
        setTimeout(() => setToast(null), 4000);
      }
      setSaving(false);
    },
    [siteId, selectedPage]
  );

  // Reorder
  const moveSection = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= currentSections.length) return;
    const updated = [...currentSections];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    saveSections(updated);
    // Adjust expanded index if needed
    if (expandedIdx === index) setExpandedIdx(target);
    else if (expandedIdx === target) setExpandedIdx(index);
  };

  // Delete
  const deleteSection = (index: number) => {
    const updated = currentSections.filter((_, i) => i !== index);
    saveSections(updated);
    setConfirmDelete(null);
    if (expandedIdx === index) setExpandedIdx(null);
    else if (expandedIdx !== null && expandedIdx > index) setExpandedIdx(expandedIdx - 1);
  };

  // Add
  const addSection = (component: string) => {
    const newSection: SectionDef = {
      component,
      props: {},
      layout: {},
      style: {},
    };
    const updated = [...currentSections, newSection];
    saveSections(updated);
  };

  // Update props
  const updateSectionProps = (index: number, newProps: Record<string, unknown>) => {
    const updated = currentSections.map((s, i) =>
      i === index ? { ...s, props: newProps } : s
    );
    // Update local state immediately, save is debounced via button
    setPages((prev) => ({
      ...prev,
      [selectedPage]: { ...prev[selectedPage], sections: updated },
    }));
  };

  const saveSectionProps = (index: number) => {
    saveSections(currentSections);
  };

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 60,
          color: C.muted,
          flexDirection: "column",
          gap: 8,
        }}
      >
        <RefreshCw size={20} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 13 }}>Loading sections...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // No design document
  if (noDesignDoc) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 60,
          color: C.muted,
          flexDirection: "column",
          gap: 12,
        }}
      >
        <Layers size={32} color={C.dim} />
        <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>No design document</span>
        <span style={{ fontSize: 13, color: C.dim, textAlign: "center", maxWidth: 360 }}>
          This site uses the WordPress path and does not have an Engine design document.
          Section editing is available for Engine-built sites only.
        </span>
      </div>
    );
  }

  const pageKeys = Object.keys(pages);

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Left panel */}
      <div
        style={{
          flex: "0 0 480px",
          maxWidth: 520,
          overflowY: "auto",
          padding: 24,
          borderRight: `1px solid ${C.border}`,
        }}
      >
        {/* Panel toggle: Sections / Theme */}
        <div
          style={{
            display: "flex",
            gap: 4,
            background: C.surfaceAlt,
            borderRadius: 10,
            padding: 3,
            marginBottom: 20,
          }}
        >
          {(
            [
              { id: "sections" as const, label: "Sections", icon: <Layers size={14} /> },
              { id: "theme" as const, label: "Theme Tokens", icon: <Palette size={14} /> },
            ] as const
          ).map((panel) => {
            const isActive = activePanel === panel.id;
            return (
              <button
                key={panel.id}
                onClick={() => setActivePanel(panel.id)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "7px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: isActive ? C.surface : "transparent",
                  color: isActive ? C.text : C.dim,
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  cursor: "pointer",
                  boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s",
                }}
              >
                {panel.icon}
                {panel.label}
              </button>
            );
          })}
        </div>

        {/* Toast */}
        {toast && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 12px",
              background: toast.type === "success" ? `${C.green}15` : `${C.red}15`,
              border: `1px solid ${toast.type === "success" ? C.green : C.red}30`,
              borderRadius: 6,
              marginBottom: 16,
              fontSize: 12,
              color: toast.type === "success" ? C.green : C.red,
            }}
          >
            {toast.type === "success" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
            {toast.msg}
          </div>
        )}

        {/* ── THEME PANEL ── */}
        {activePanel === "theme" && <ThemeEditor siteId={siteId} />}

        {/* ── SECTIONS PANEL ── */}
        {activePanel === "sections" && (
          <>
            {/* Page selector */}
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.muted,
                  marginBottom: 6,
                  display: "block",
                }}
              >
                Page
              </label>
              <select
                value={selectedPage}
                onChange={(e) => {
                  setSelectedPage(e.target.value);
                  setExpandedIdx(null);
                }}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: C.surfaceAlt,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  color: C.text,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {pageKeys.map((slug) => (
                  <option key={slug} value={slug}>
                    {slug.charAt(0).toUpperCase() + slug.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Section list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {currentSections.length === 0 && (
                <div
                  style={{
                    padding: 32,
                    textAlign: "center",
                    color: C.dim,
                    fontSize: 13,
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                  }}
                >
                  No sections on this page yet.
                </div>
              )}

              {currentSections.map((section, idx) => {
                const isExpanded = expandedIdx === idx;
                const isConfirmingDelete = confirmDelete === idx;

                return (
                  <div
                    key={`${selectedPage}-${idx}`}
                    style={{
                      background: C.surface,
                      border: `1px solid ${isExpanded ? C.accent : C.border}`,
                      borderRadius: 12,
                      overflow: "hidden",
                      transition: "border-color 0.15s",
                    }}
                  >
                    {/* Section header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "12px 16px",
                        cursor: "pointer",
                      }}
                      onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                    >
                      <GripVertical size={14} color={C.dim} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                          {section.component}
                        </div>
                        <div style={{ fontSize: 11, color: C.dim }}>
                          {Object.keys(section.props || {}).length} props
                        </div>
                      </div>

                      {/* Reorder buttons */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSection(idx, "up");
                        }}
                        disabled={idx === 0}
                        title="Move up"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: idx === 0 ? `${C.dim}50` : C.muted,
                          cursor: idx === 0 ? "default" : "pointer",
                          padding: 4,
                          borderRadius: 4,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSection(idx, "down");
                        }}
                        disabled={idx === currentSections.length - 1}
                        title="Move down"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: idx === currentSections.length - 1 ? `${C.dim}50` : C.muted,
                          cursor: idx === currentSections.length - 1 ? "default" : "pointer",
                          padding: 4,
                          borderRadius: 4,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <ChevronDown size={16} />
                      </button>

                      {/* Delete button */}
                      {isConfirmingDelete ? (
                        <div style={{ display: "flex", gap: 4 }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => deleteSection(idx)}
                            style={{
                              padding: "4px 10px",
                              background: C.red,
                              border: "none",
                              borderRadius: 4,
                              color: "#fff",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            style={{
                              padding: "4px 8px",
                              background: C.surfaceAlt,
                              border: `1px solid ${C.border}`,
                              borderRadius: 4,
                              color: C.muted,
                              fontSize: 11,
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(idx);
                          }}
                          title="Delete section"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: C.dim,
                            cursor: "pointer",
                            padding: 4,
                            borderRadius: 4,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {/* Expanded props editor */}
                    {isExpanded && (
                      <div
                        style={{
                          padding: "0 16px 16px",
                          borderTop: `1px solid ${C.border}`,
                        }}
                      >
                        <div style={{ paddingTop: 12 }}>
                          <PropsEditor
                            props={(section.props || {}) as Record<string, unknown>}
                            onChange={(updated) => updateSectionProps(idx, updated)}
                          />
                          <button
                            onClick={() => saveSectionProps(idx)}
                            disabled={saving}
                            style={{
                              marginTop: 12,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "8px 16px",
                              background: C.accent,
                              border: "none",
                              borderRadius: 8,
                              color: "#fff",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            <Save size={13} />
                            {saving ? "Saving..." : "Save Props"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add section button */}
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                width: "100%",
                marginTop: 16,
                padding: "12px 0",
                background: "transparent",
                border: `2px dashed ${C.border}`,
                borderRadius: 12,
                color: C.muted,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = C.accent;
                (e.currentTarget as HTMLElement).style.color = C.accent;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = C.border;
                (e.currentTarget as HTMLElement).style.color = C.muted;
              }}
            >
              <Plus size={16} />
              Add Section
            </button>
          </>
        )}
      </div>

      {/* Right: placeholder / instructions */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 12,
          color: C.dim,
          padding: 40,
        }}
      >
        <Layers size={40} color={`${C.dim}40`} />
        <span style={{ fontSize: 15, fontWeight: 600, color: C.muted }}>Section Editor</span>
        <span style={{ fontSize: 13, color: C.dim, textAlign: "center", maxWidth: 320, lineHeight: 1.6 }}>
          Use the panel on the left to view, reorder, edit, and manage the sections on each page of your site.
          Click Save to apply changes to the design document.
        </span>
      </div>

      {/* Add section modal */}
      {showAddModal && (
        <AddSectionModal
          onAdd={addSection}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
