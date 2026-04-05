"use client";

// =============================================================================
// Theme Gallery — Scrollable list + live preview panel
// =============================================================================

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Check,
  Loader2,
  Search,
  Sparkles,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
} from "lucide-react";
import { C } from "@/lib/studio/colors";
import ThemePreview from "./ThemePreview";
import type { PreviewTheme } from "./ThemePreview";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ThemeEntry {
  id: string;
  name: string;
  slug: string;
  archetype: string;
  industryTags: string[] | null;
  colors: Record<string, string>;
  fonts: Record<string, string>;
  borderRadius: Record<string, string>;
  buttonStyle: Record<string, string>;
  designPackage: Record<string, unknown> | null;
  usageCount: number;
  rating: number;
  previewUrl: string | null;
  thumbnailUrl: string | null;
  status: string;
}

interface ThemeGalleryProps {
  siteId: string;
  currentArchetype: string;
  activeThemeId: string | null;
  onThemeApplied: () => void;
}

const ARCHETYPE_TABS = [
  { id: "", label: "All" },
  { id: "SERVICE", label: "Service" },
  { id: "VENUE", label: "Venue" },
  { id: "PORTFOLIO", label: "Portfolio" },
  { id: "COMMERCE", label: "Commerce" },
];

const PAGE_SIZE = 12;

// ---------------------------------------------------------------------------
// ThemeGallery
// ---------------------------------------------------------------------------

export default function ThemeGallery({
  siteId,
  currentArchetype,
  activeThemeId,
  onThemeApplied,
}: ThemeGalleryProps) {
  const [themes, setThemes] = useState<ThemeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(activeThemeId);
  const [toast, setToast] = useState<string | null>(null);
  const [showOnlyWithDesign, setShowOnlyWithDesign] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchThemes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab) params.set("archetype", activeTab);
      if (searchTerm) params.set("search", searchTerm);
      const res = await fetch(`/api/themes/pool?${params.toString()}`);
      if (res.ok) {
        setThemes(await res.json());
        setPage(0);
      }
    } catch { /* silent */ }
    setLoading(false);
  }, [activeTab, searchTerm]);

  useEffect(() => { fetchThemes(); }, [fetchThemes]);

  // Auto-select the applied theme initially
  useEffect(() => {
    if (themes.length > 0 && !selectedId) {
      const applied = themes.find((t) => t.id === appliedId);
      if (applied) setSelectedId(applied.id);
      else setSelectedId(themes[0].id);
    }
  }, [themes, appliedId, selectedId]);

  const filteredThemes = useMemo(() => {
    if (!showOnlyWithDesign) return themes;
    return themes.filter((t) => t.designPackage != null);
  }, [themes, showOnlyWithDesign]);

  const totalPages = Math.ceil(filteredThemes.length / PAGE_SIZE);
  const paginatedThemes = filteredThemes.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const selectedTheme = themes.find((t) => t.id === selectedId) || null;

  const applyTheme = async (themeId: string) => {
    setApplyingId(themeId);
    setToast(null);
    try {
      const res = await fetch(`/api/themes/pool/${themeId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId }),
      });
      if (res.ok) {
        const data = await res.json();
        setAppliedId(themeId);
        if (data.syncWarning) {
          setToast(`"${data.theme}" saved but WP sync issue: ${data.syncWarning}`);
        } else {
          setToast(`"${data.theme}" applied successfully`);
        }
        setTimeout(() => setToast(null), 6000);
        onThemeApplied();
      }
    } catch { /* silent */ }
    setApplyingId(null);
  };

  return (
    <div style={{ display: "flex", height: "100%" }}>

      {/* ── LEFT PANEL: Theme List ── */}
      <div style={{
        flex: "0 0 420px",
        display: "flex",
        flexDirection: "column",
        borderRight: `1px solid ${C.border}`,
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 20px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Theme Gallery</div>
              <div style={{ fontSize: 12, color: C.dim }}>{filteredThemes.length} designs</div>
            </div>
          </div>

          {/* Search + Filter */}
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8 }}>
              <Search size={13} color={C.dim} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 12, color: C.text, fontFamily: "'Inter',-apple-system,sans-serif" }}
              />
            </div>
            <button
              onClick={() => setShowOnlyWithDesign(!showOnlyWithDesign)}
              style={{
                padding: "7px 10px", borderRadius: 8,
                border: `1px solid ${showOnlyWithDesign ? C.accent : C.border}`,
                background: showOnlyWithDesign ? `${C.accent}10` : C.surface,
                color: showOnlyWithDesign ? C.accent : C.dim,
                fontSize: 11, fontWeight: 500, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap",
              }}
            >
              <Filter size={12} /> Full
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
            {ARCHETYPE_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  padding: "5px 12px", borderRadius: 14, border: "none",
                  background: isActive ? C.text : C.surface,
                  color: isActive ? "#fff" : C.muted,
                  fontSize: 11, fontWeight: 600, cursor: "pointer",
                  boxShadow: isActive ? "none" : `inset 0 0 0 1px ${C.border}`,
                }}>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{ margin: "0 20px 10px", display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: `${C.green}12`, border: `1px solid ${C.green}30`, borderRadius: 8, fontSize: 12, fontWeight: 500, color: C.green }}>
            <Check size={14} /> {toast}
          </div>
        )}

        {/* Scrollable theme list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
          {loading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "60px 0", color: C.dim, fontSize: 13 }}>
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
              Loading...
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {!loading && filteredThemes.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: C.dim }}>
              <Sparkles size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
              <div style={{ fontSize: 13 }}>No themes found</div>
            </div>
          )}

          {!loading && paginatedThemes.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {paginatedThemes.map((theme) => {
                const isApplied = appliedId === theme.id;
                const isApplying = applyingId === theme.id;
                const isSelected = selectedId === theme.id;
                const hasDesign = theme.designPackage != null;

                return (
                  <div
                    key={theme.id}
                    onClick={() => setSelectedId(theme.id)}
                    style={{
                      background: isSelected ? `${C.accent}08` : C.surface,
                      border: `1px solid ${isSelected ? C.accent : isApplied ? C.green : C.border}`,
                      borderRadius: 10,
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "border-color 0.15s",
                      boxShadow: isSelected ? `0 0 0 2px ${C.accent}15` : "none",
                    }}
                  >
                    {/* Mini preview — scaled way down */}
                    <div style={{
                      height: 120,
                      overflow: "hidden",
                      position: "relative",
                      borderBottom: `1px solid ${C.border}`,
                    }}>
                      {/* Badges */}
                      <div style={{ position: "absolute", top: 6, right: 6, zIndex: 3, display: "flex", gap: 3 }}>
                        {isApplied && <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: `${C.green}e0`, color: "#fff" }}>Active</span>}
                        {hasDesign && <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: `${C.accent}e0`, color: "#fff" }}>Full</span>}
                      </div>
                      {isSelected && (
                        <div style={{ position: "absolute", top: 6, left: 6, zIndex: 3 }}>
                          <Eye size={14} color={C.accent} />
                        </div>
                      )}

                      <div style={{
                        transform: "scale(0.475)",
                        transformOrigin: "top left",
                        width: 800,
                        position: "absolute",
                        top: 0,
                        left: 0,
                      }}>
                        <ThemePreview theme={theme as unknown as PreviewTheme} />
                      </div>
                    </div>

                    {/* Info row */}
                    <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{theme.name}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>
                          {theme.fonts.heading} · {theme.archetype}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 0, borderRadius: 3, overflow: "hidden", height: 12, width: 48, border: `1px solid ${C.border}`, flexShrink: 0, marginLeft: 8 }}>
                        {[theme.colors.primary, theme.colors.accent, theme.colors.bg || theme.colors.background || "#fff"].filter(Boolean).map((hex, i) => (
                          <div key={i} style={{ flex: 1, background: hex }} />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: page === 0 ? C.surfaceAlt : C.surface, color: page === 0 ? C.dim : C.text, fontSize: 11, fontWeight: 600, cursor: page === 0 ? "default" : "pointer", display: "flex", alignItems: "center", gap: 3 }}
              >
                <ChevronLeft size={12} /> Prev
              </button>
              <span style={{ fontSize: 11, color: C.muted, fontWeight: 500, padding: "0 6px" }}>
                {page + 1}/{totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: page >= totalPages - 1 ? C.surfaceAlt : C.surface, color: page >= totalPages - 1 ? C.dim : C.text, fontSize: 11, fontWeight: 600, cursor: page >= totalPages - 1 ? "default" : "pointer", display: "flex", alignItems: "center", gap: 3 }}
              >
                Next <ChevronRight size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: Full Preview ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: C.bg }}>
        {selectedTheme ? (
          <>
            {/* Preview header bar */}
            <div style={{
              height: 48,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 20px",
              borderBottom: `1px solid ${C.border}`,
              background: C.surface,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Eye size={15} color={C.accent} />
                <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{selectedTheme.name}</span>
                <span style={{ fontSize: 11, color: C.muted, padding: "2px 8px", borderRadius: 4, background: C.surfaceAlt }}>{selectedTheme.archetype}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {appliedId === selectedTheme.id ? (
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.green, display: "flex", alignItems: "center", gap: 4 }}>
                    <Check size={14} /> Applied
                  </span>
                ) : (
                  <button
                    onClick={() => applyTheme(selectedTheme.id)}
                    disabled={applyingId === selectedTheme.id}
                    style={{
                      padding: "6px 20px",
                      borderRadius: 8,
                      border: "none",
                      background: C.accent,
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    {applyingId === selectedTheme.id ? (
                      <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Applying...</>
                    ) : (
                      "Apply This Theme"
                    )}
                  </button>
                )}
                <button
                  onClick={() => setSelectedId(null)}
                  style={{ background: "transparent", border: "none", color: C.dim, cursor: "pointer", padding: 4, borderRadius: 4, display: "flex" }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable full-size preview */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", justifyContent: "center", padding: "24px 20px" }}>
              <div style={{
                width: 800,
                flexShrink: 0,
                boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
                borderRadius: 12,
                overflow: "hidden",
                border: `1px solid ${C.border}`,
              }}>
                <ThemePreview theme={selectedTheme as unknown as PreviewTheme} />
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, color: C.dim }}>
            <Eye size={36} style={{ opacity: 0.2 }} />
            <span style={{ fontSize: 14 }}>Select a theme to preview</span>
          </div>
        )}
      </div>
    </div>
  );
}
