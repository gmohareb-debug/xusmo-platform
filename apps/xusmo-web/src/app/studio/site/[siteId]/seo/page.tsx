"use client";

// =============================================================================
// SEO Panel — Per-page SEO settings + Social Media OG Preview
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Search,
  Globe,
  Facebook,
  Twitter,
  Loader2,
  Save,
  ImagePlus,
  Sparkles,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

interface PageSeo {
  slug: string;
  title: string;
  metaTitle: string;
  metaDesc: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  twitterTitle: string;
  twitterDescription: string;
}

type PreviewTab = "google" | "facebook" | "twitter" | "linkedin";

export default function SeoPage() {
  const params = useParams();
  const siteId = params.siteId as string;

  const [pages, setPages] = useState<PageSeo[]>([]);
  const [activePage, setActivePage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewTab, setPreviewTab] = useState<PreviewTab>("google");
  const [editData, setEditData] = useState<PageSeo | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/portal/sites`)
      .then((r) => r.json())
      .then((sites) => {
        const site = (Array.isArray(sites) ? sites : []).find(
          (s: { id: string }) => s.id === siteId
        );
        const sitePages = (site?.pages || []).map((p: Record<string, string>) => ({
          slug: p.slug,
          title: p.title,
          metaTitle: p.metaTitle || "",
          metaDesc: p.metaDesc || "",
          ogTitle: p.ogTitle || "",
          ogDescription: p.ogDescription || "",
          ogImageUrl: p.ogImageUrl || "",
          twitterTitle: p.twitterTitle || "",
          twitterDescription: p.twitterDescription || "",
        }));
        setPages(sitePages);
        if (sitePages.length > 0) {
          setActivePage(sitePages[0].slug);
          setEditData(sitePages[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [siteId]);

  useEffect(() => {
    if (activePage) {
      const page = pages.find((p) => p.slug === activePage);
      if (page) setEditData({ ...page });
    }
  }, [activePage, pages]);

  const saveSeo = async () => {
    if (!editData) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/studio/${siteId}/seo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pages: [editData] }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("SEO save failed:", data.error);
      } else {
        // Update local state with saved values
        setPages((prev) =>
          prev.map((p) => (p.slug === editData.slug ? { ...editData } : p))
        );
      }
    } catch (err) {
      console.error("SEO save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const generateOgImage = async () => {
    const res = await fetch(`/api/studio/${siteId}/seo/generate-og-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageSlug: activePage }),
    });
    const data = await res.json();
    alert(data.message || "OG image generation initiated.");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, color: C.muted }}>
        <Loader2 size={20} style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
        Loading SEO data...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: "'Inter',-apple-system,sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Search size={22} color={C.accent} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>SEO Settings</h1>
        </div>
        <button
          onClick={saveSeo}
          disabled={saving}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
            background: C.accent, border: "none", borderRadius: 8,
            color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Page Selector */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
        {pages.map((p) => (
          <button
            key={p.slug}
            onClick={() => setActivePage(p.slug)}
            style={{
              padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 500,
              cursor: "pointer", border: "none",
              background: activePage === p.slug ? C.accent : C.surfaceAlt,
              color: activePage === p.slug ? "#fff" : C.muted,
            }}
          >
            {p.title || p.slug}
          </button>
        ))}
      </div>

      {editData && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Left: SEO Fields */}
          <div>
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
              padding: 20,
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 16 }}>
                Search Engine Optimization
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: C.dim, display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span>Meta Title</span>
                  <span>{editData.metaTitle.length}/60</span>
                </label>
                <input
                  type="text"
                  value={editData.metaTitle}
                  onChange={(e) => setEditData({ ...editData, metaTitle: e.target.value })}
                  maxLength={60}
                  style={{
                    width: "100%", padding: "8px 12px", background: C.surfaceAlt,
                    border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: C.dim, display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span>Meta Description</span>
                  <span>{editData.metaDesc.length}/160</span>
                </label>
                <textarea
                  value={editData.metaDesc}
                  onChange={(e) => setEditData({ ...editData, metaDesc: e.target.value })}
                  maxLength={160}
                  rows={3}
                  style={{
                    width: "100%", padding: "8px 12px", background: C.surfaceAlt,
                    border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13,
                    resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
                  }}
                />
              </div>

              {/* SERP Preview */}
              <div style={{
                background: "#fff", borderRadius: 8, padding: 16, marginTop: 16,
              }}>
                <div style={{ fontSize: 11, color: "#70757a", marginBottom: 4 }}>
                  yourdomain.com &gt; {editData.slug}
                </div>
                <div style={{ fontSize: 18, color: "#1a0dab", marginBottom: 4, fontFamily: "Arial, sans-serif" }}>
                  {editData.metaTitle || editData.title || "Page Title"}
                </div>
                <div style={{ fontSize: 13, color: "#4d5156", lineHeight: 1.4, fontFamily: "Arial, sans-serif" }}>
                  {editData.metaDesc || "No meta description set."}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Social Preview */}
          <div>
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
              padding: 20,
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 16 }}>
                Social Preview
              </div>

              {/* Tab Switcher */}
              <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                {(["google", "facebook", "twitter", "linkedin"] as PreviewTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPreviewTab(tab)}
                    style={{
                      padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 500,
                      cursor: "pointer", border: "none", textTransform: "capitalize",
                      background: previewTab === tab ? C.accent : C.surfaceAlt,
                      color: previewTab === tab ? "#fff" : C.muted,
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* OG Image */}
              <div style={{
                background: C.surfaceAlt, border: `1px dashed ${C.border}`, borderRadius: 8,
                height: 180, display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 12, overflow: "hidden", position: "relative",
              }}>
                {editData.ogImageUrl ? (
                  <img src={editData.ogImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <ImagePlus size={24} color={C.dim} />
                    <div style={{ fontSize: 11, color: C.dim, marginTop: 6 }}>1200 x 630 — Click to upload</div>
                  </div>
                )}
              </div>

              <button
                onClick={generateOgImage}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                  background: `${C.amber}20`, border: `1px solid ${C.amber}40`, borderRadius: 6,
                  color: C.amber, fontSize: 12, cursor: "pointer", marginBottom: 16,
                }}
              >
                <Sparkles size={12} /> Generate OG Image
              </button>

              {/* OG Fields */}
              {(previewTab === "facebook" || previewTab === "linkedin") && (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, color: C.dim, display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span>OG Title</span>
                      <span>{editData.ogTitle.length}/60</span>
                    </label>
                    <input
                      type="text"
                      value={editData.ogTitle}
                      onChange={(e) => setEditData({ ...editData, ogTitle: e.target.value })}
                      maxLength={60}
                      placeholder={editData.metaTitle || "Use meta title"}
                      style={{
                        width: "100%", padding: "8px 12px", background: C.surfaceAlt,
                        border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, color: C.dim, display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span>OG Description</span>
                      <span>{editData.ogDescription.length}/90</span>
                    </label>
                    <textarea
                      value={editData.ogDescription}
                      onChange={(e) => setEditData({ ...editData, ogDescription: e.target.value })}
                      maxLength={90}
                      rows={2}
                      placeholder={editData.metaDesc || "Use meta description"}
                      style={{
                        width: "100%", padding: "8px 12px", background: C.surfaceAlt,
                        border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13,
                        resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
                      }}
                    />
                  </div>
                </>
              )}

              {previewTab === "twitter" && (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, color: C.dim, display: "block", marginBottom: 4 }}>
                      Twitter Title
                    </label>
                    <input
                      type="text"
                      value={editData.twitterTitle}
                      onChange={(e) => setEditData({ ...editData, twitterTitle: e.target.value })}
                      placeholder={editData.ogTitle || editData.metaTitle || "Use OG title"}
                      style={{
                        width: "100%", padding: "8px 12px", background: C.surfaceAlt,
                        border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, color: C.dim, display: "block", marginBottom: 4 }}>
                      Twitter Description
                    </label>
                    <textarea
                      value={editData.twitterDescription}
                      onChange={(e) => setEditData({ ...editData, twitterDescription: e.target.value })}
                      rows={2}
                      placeholder={editData.ogDescription || editData.metaDesc || "Use OG description"}
                      style={{
                        width: "100%", padding: "8px 12px", background: C.surfaceAlt,
                        border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13,
                        resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
                      }}
                    />
                  </div>
                </>
              )}

              {/* Preview Card */}
              <div style={{
                background: "#e4e6ea", borderRadius: 8, overflow: "hidden", marginTop: 12,
              }}>
                {editData.ogImageUrl && (
                  <img src={editData.ogImageUrl} alt="" style={{ width: "100%", height: 160, objectFit: "cover" }} />
                )}
                <div style={{ padding: 12, background: "#f0f2f5" }}>
                  <div style={{ fontSize: 10, color: "#606770", textTransform: "uppercase" }}>
                    YOURDOMAIN.COM
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1c1e21", marginTop: 4 }}>
                    {(previewTab === "twitter" ? editData.twitterTitle : editData.ogTitle) || editData.metaTitle || editData.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#606770", marginTop: 2 }}>
                    {(previewTab === "twitter" ? editData.twitterDescription : editData.ogDescription) || editData.metaDesc}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
