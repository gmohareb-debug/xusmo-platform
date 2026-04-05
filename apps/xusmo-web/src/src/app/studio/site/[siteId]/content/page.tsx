"use client";

// =============================================================================
// Content Editor — Page content editor with AI regeneration + version history
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  PenLine,
  Sparkles,
  History,
  Save,
  Check,
  X,
  RotateCcw,
  Loader2,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

interface PageData {
  id: string;
  slug: string;
  title: string;
  heroHeadline: string | null;
  heroSubheadline: string | null;
  ctaLabel: string | null;
  bodyContent: ContentBlock[] | null;
  metaTitle: string | null;
  metaDesc: string | null;
}

interface ContentBlock {
  type: string;
  content: string;
}

interface ContentVersion {
  id: string;
  savedBy: string;
  saveReason: string | null;
  createdAt: string;
}

export default function ContentEditorPage() {
  const params = useParams();
  const siteId = params.siteId as string;

  const [pages, setPages] = useState<PageData[]>([]);
  const [activePage, setActivePage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<PageData | null>(null);

  // AI regeneration state
  const [aiBlockIndex, setAiBlockIndex] = useState<number | null>(null);
  const [aiInstruction, setAiInstruction] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<{ original: string; regenerated: string } | null>(null);
  const [aiRewriteAll, setAiRewriteAll] = useState(false);
  const [aiTone, setAiTone] = useState("Professional");

  // Version history state
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // Fetch pages
  const fetchPages = useCallback(() => {
    setLoading(true);
    fetch(`/api/portal/sites`)
      .then((r) => r.json())
      .then((sites) => {
        const site = (Array.isArray(sites) ? sites : []).find(
          (s: { id: string }) => s.id === siteId
        );
        const sitePages = site?.pages || [];
        setPages(sitePages);
        if (sitePages.length > 0) {
          setActivePage((prev) => prev ?? sitePages[0].slug);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [siteId]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // When active page changes, load content
  useEffect(() => {
    if (!activePage) return;
    const page = pages.find((p) => p.slug === activePage);
    if (page) {
      setEditData({ ...page });
    }
  }, [activePage, pages]);

  // Fetch versions
  const fetchVersions = useCallback(() => {
    if (!activePage) return;
    setLoadingVersions(true);
    fetch(`/api/studio/${siteId}/content/${activePage}/versions`)
      .then((r) => r.json())
      .then((d) => setVersions(Array.isArray(d) ? d : []))
      .catch(() => setVersions([]))
      .finally(() => setLoadingVersions(false));
  }, [siteId, activePage]);

  useEffect(() => {
    if (showHistory) fetchVersions();
  }, [showHistory, fetchVersions]);

  // Save content
  const saveContent = async () => {
    if (!editData) return;
    setSaving(true);
    await fetch(`/api/studio/${siteId}/content/${activePage}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        heroHeadline: editData.heroHeadline,
        heroSubheadline: editData.heroSubheadline,
        ctaLabel: editData.ctaLabel,
        bodyContent: editData.bodyContent,
        metaTitle: editData.metaTitle,
        metaDescription: editData.metaDesc,
        saveReason: "manual save",
      }),
    }).catch(() => {});
    setSaving(false);
    fetchPages();
  };

  // AI regenerate a block
  const regenerateBlock = async (blockIndex: number) => {
    if (!editData?.bodyContent?.[blockIndex]) return;
    setAiBlockIndex(blockIndex);
    setAiGenerating(true);
    try {
      const res = await fetch(`/api/studio/${siteId}/content/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageSlug: activePage,
          blockIndex,
          currentContent: editData.bodyContent[blockIndex].content,
          instruction: aiInstruction || "Improve this section",
        }),
      });
      const data = await res.json();
      setAiResult(data);
    } catch {
      // handle error
    }
    setAiGenerating(false);
  };

  // Accept AI result
  const acceptAiResult = () => {
    if (!editData?.bodyContent || aiBlockIndex === null || !aiResult) return;
    const blocks = [...editData.bodyContent];
    blocks[aiBlockIndex] = { ...blocks[aiBlockIndex], content: aiResult.regenerated };
    setEditData({ ...editData, bodyContent: blocks });
    setAiResult(null);
    setAiBlockIndex(null);
    setAiInstruction("");
  };

  // Rollback to version
  const rollbackToVersion = async (versionId: string) => {
    if (!confirm("Restore this version? Current content will be saved first.")) return;
    await fetch(`/api/studio/${siteId}/content/${activePage}/rollback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionId }),
    });
    fetchPages();
    fetchVersions();
    setShowHistory(false);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, color: C.muted }}>
        <Loader2 size={20} style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
        Loading content...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", display: "flex", minHeight: "calc(100vh - 170px)" }}>
      {/* Main Editor */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 24px", borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <PenLine size={18} color={C.accent} />
            <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Content Editor</span>

            {/* Page Selector */}
            <select
              value={activePage || ""}
              onChange={(e) => setActivePage(e.target.value)}
              style={{
                padding: "6px 10px", background: C.surfaceAlt, border: `1px solid ${C.border}`,
                borderRadius: 6, color: C.text, fontSize: 13,
              }}
            >
              {pages.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.title || p.slug}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {/* AI Rewrite All */}
            <button
              onClick={() => setAiRewriteAll(!aiRewriteAll)}
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                background: `${C.amber}20`, border: `1px solid ${C.amber}40`, borderRadius: 6,
                color: C.amber, fontSize: 12, cursor: "pointer",
              }}
            >
              <Sparkles size={14} /> Rewrite Page
            </button>

            {/* Version History */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                background: showHistory ? `${C.accent}20` : C.surfaceAlt,
                border: `1px solid ${showHistory ? C.accent : C.border}`, borderRadius: 6,
                color: showHistory ? C.accent : C.muted, fontSize: 12, cursor: "pointer",
              }}
            >
              <History size={14} /> History
            </button>

            {/* Save */}
            <button
              onClick={saveContent}
              disabled={saving}
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "6px 14px",
                background: C.accent, border: "none", borderRadius: 6,
                color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
            >
              <Save size={14} /> {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* AI Rewrite All Panel */}
        {aiRewriteAll && (
          <div style={{
            padding: "12px 24px", background: `${C.amber}08`, borderBottom: `1px solid ${C.amber}30`,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 12, color: C.amber }}>Tone:</span>
            {["Professional", "Conversational", "Urgent", "Friendly"].map((t) => (
              <button
                key={t}
                onClick={() => setAiTone(t)}
                style={{
                  padding: "4px 10px", borderRadius: 4, fontSize: 11, border: "none",
                  background: aiTone === t ? C.amber : C.surfaceAlt,
                  color: aiTone === t ? "#000" : C.muted, cursor: "pointer",
                }}
              >
                {t}
              </button>
            ))}
            <button
              onClick={async () => {
                if (!editData?.bodyContent) return;
                for (let i = 0; i < editData.bodyContent.length; i++) {
                  await regenerateBlock(i);
                }
                setAiRewriteAll(false);
              }}
              style={{
                marginLeft: "auto", padding: "6px 14px", background: C.amber,
                border: "none", borderRadius: 6, color: "#000", fontSize: 12,
                fontWeight: 600, cursor: "pointer",
              }}
            >
              Rewrite All Blocks
            </button>
          </div>
        )}

        {/* Content Area */}
        <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          {!editData ? (
            <div style={{ textAlign: "center", color: C.dim, padding: 40 }}>
              Select a page to edit its content.
            </div>
          ) : (
            <>
              {/* Hero Section */}
              <div style={{
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
                padding: 20, marginBottom: 16,
              }}>
                <div style={{ fontSize: 11, color: C.dim, marginBottom: 8 }}>HERO SECTION</div>
                <input
                  type="text"
                  value={editData.heroHeadline || ""}
                  onChange={(e) => setEditData({ ...editData, heroHeadline: e.target.value })}
                  placeholder="Hero headline..."
                  style={{
                    width: "100%", fontSize: 22, fontWeight: 700, color: C.text,
                    background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6,
                    padding: "8px 12px", marginBottom: 8, boxSizing: "border-box",
                  }}
                />
                <input
                  type="text"
                  value={editData.heroSubheadline || ""}
                  onChange={(e) => setEditData({ ...editData, heroSubheadline: e.target.value })}
                  placeholder="Hero subheadline..."
                  style={{
                    width: "100%", fontSize: 15, color: C.muted,
                    background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6,
                    padding: "8px 12px", marginBottom: 8, boxSizing: "border-box",
                  }}
                />
                <input
                  type="text"
                  value={editData.ctaLabel || ""}
                  onChange={(e) => setEditData({ ...editData, ctaLabel: e.target.value })}
                  placeholder="CTA button label..."
                  style={{
                    width: 200, fontSize: 13, color: C.text,
                    background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 6,
                    padding: "6px 12px", boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Body Content Blocks */}
              {editData.bodyContent?.map((block, i) => (
                <div
                  key={i}
                  style={{
                    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
                    padding: 16, marginBottom: 8, position: "relative",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 10, color: C.dim, textTransform: "uppercase" }}>
                      {block.type} block
                    </span>
                    <button
                      onClick={() => {
                        setAiBlockIndex(i);
                        setAiInstruction("");
                        setAiResult(null);
                      }}
                      style={{
                        padding: "3px 8px", background: `${C.amber}20`, border: `1px solid ${C.amber}40`,
                        borderRadius: 4, color: C.amber, fontSize: 11, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 4,
                      }}
                    >
                      <Sparkles size={11} /> AI
                    </button>
                  </div>

                  {/* AI Instruction Popover */}
                  {aiBlockIndex === i && !aiResult && (
                    <div style={{
                      background: `${C.amber}10`, border: `1px solid ${C.amber}30`, borderRadius: 8,
                      padding: 12, marginBottom: 8,
                    }}>
                      <input
                        type="text"
                        value={aiInstruction}
                        onChange={(e) => setAiInstruction(e.target.value)}
                        placeholder="e.g. Make it more urgent, Focus on plumbing..."
                        style={{
                          width: "100%", padding: "6px 10px", background: C.surface,
                          border: `1px solid ${C.border}`, borderRadius: 4, color: C.text,
                          fontSize: 12, marginBottom: 8, boxSizing: "border-box",
                        }}
                      />
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => regenerateBlock(i)}
                          disabled={aiGenerating}
                          style={{
                            padding: "4px 12px", background: C.amber, border: "none",
                            borderRadius: 4, color: "#000", fontSize: 11, fontWeight: 600, cursor: "pointer",
                          }}
                        >
                          {aiGenerating ? "Generating..." : "Generate"}
                        </button>
                        <button
                          onClick={() => { setAiBlockIndex(null); setAiInstruction(""); }}
                          style={{
                            padding: "4px 10px", background: C.surfaceAlt, border: `1px solid ${C.border}`,
                            borderRadius: 4, color: C.dim, fontSize: 11, cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* AI Diff View */}
                  {aiBlockIndex === i && aiResult && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{
                        background: `${C.red}10`, border: `1px solid ${C.red}30`, borderRadius: 6,
                        padding: 10, marginBottom: 6,
                      }}>
                        <div style={{ fontSize: 10, color: C.red, marginBottom: 4 }}>BEFORE</div>
                        <div style={{ fontSize: 13, color: C.muted, textDecoration: "line-through" }}>
                          {aiResult.original}
                        </div>
                      </div>
                      <div style={{
                        background: `${C.green}10`, border: `1px solid ${C.green}30`, borderRadius: 6,
                        padding: 10, marginBottom: 8,
                      }}>
                        <div style={{ fontSize: 10, color: C.green, marginBottom: 4 }}>AFTER</div>
                        <div style={{ fontSize: 13, color: C.text }}>
                          {aiResult.regenerated}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={acceptAiResult}
                          style={{
                            display: "flex", alignItems: "center", gap: 4, padding: "4px 12px",
                            background: C.green, border: "none", borderRadius: 4,
                            color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer",
                          }}
                        >
                          <Check size={12} /> Accept
                        </button>
                        <button
                          onClick={() => regenerateBlock(i)}
                          style={{
                            display: "flex", alignItems: "center", gap: 4, padding: "4px 12px",
                            background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 4,
                            color: C.muted, fontSize: 11, cursor: "pointer",
                          }}
                        >
                          <RefreshCw size={12} /> Try Again
                        </button>
                        <button
                          onClick={() => { setAiResult(null); setAiBlockIndex(null); }}
                          style={{
                            display: "flex", alignItems: "center", gap: 4, padding: "4px 12px",
                            background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 4,
                            color: C.dim, fontSize: 11, cursor: "pointer",
                          }}
                        >
                          <X size={12} /> Dismiss
                        </button>
                      </div>
                    </div>
                  )}

                  <textarea
                    value={block.content}
                    onChange={(e) => {
                      const blocks = [...(editData.bodyContent || [])];
                      blocks[i] = { ...blocks[i], content: e.target.value };
                      setEditData({ ...editData, bodyContent: blocks });
                    }}
                    style={{
                      width: "100%", minHeight: 80, padding: "8px 12px",
                      background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 6,
                      color: C.text, fontSize: 14, resize: "vertical", fontFamily: "inherit",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              ))}

              {/* No content blocks */}
              {(!editData.bodyContent || editData.bodyContent.length === 0) && (
                <div style={{
                  background: C.surface, border: `1px dashed ${C.border}`, borderRadius: 10,
                  padding: 40, textAlign: "center", color: C.dim,
                }}>
                  No content blocks yet. Content will appear here after the site is built.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Version History Drawer */}
      {showHistory && (
        <div style={{
          width: 320, borderLeft: `1px solid ${C.border}`, background: C.surface,
          padding: 20, overflowY: "auto",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, display: "flex", alignItems: "center", gap: 6 }}>
              <History size={16} /> Version History
            </div>
            <button
              onClick={() => setShowHistory(false)}
              style={{ background: "transparent", border: "none", color: C.dim, cursor: "pointer" }}
            >
              <X size={18} />
            </button>
          </div>

          {loadingVersions ? (
            <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 20 }}>
              Loading versions...
            </div>
          ) : versions.length === 0 ? (
            <div style={{ color: C.dim, fontSize: 13, textAlign: "center", padding: 20 }}>
              No versions saved yet. Versions are created when you save changes.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {versions.map((v) => (
                <div
                  key={v.id}
                  style={{
                    background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 8,
                    padding: 12, cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 2 }}>
                    {timeAgo(v.createdAt)}
                  </div>
                  <div style={{ fontSize: 11, color: C.dim, marginBottom: 8 }}>
                    {v.saveReason || "Manual save"}
                  </div>
                  <button
                    onClick={() => rollbackToVersion(v.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 4, padding: "4px 10px",
                      background: `${C.accent}20`, border: `1px solid ${C.accent}40`, borderRadius: 4,
                      color: C.accent, fontSize: 11, cursor: "pointer",
                    }}
                  >
                    <RotateCcw size={11} /> Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
