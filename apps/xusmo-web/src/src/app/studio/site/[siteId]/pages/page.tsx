"use client";

// =============================================================================
// Pages Manager — View and manage site pages
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  LayoutGrid,
  Plus,
  GripVertical,
  FileText,
  Loader2,
  Eye,
  Lock,
  Pencil,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

interface SitePage {
  id: string;
  slug: string;
  title: string;
  sortOrder: number;
  isRequired: boolean;
  metaTitle: string | null;
  metaDesc: string | null;
  updatedAt: string;
}

export default function PagesPage() {
  const params = useParams();
  const siteId = params.siteId as string;

  const [pages, setPages] = useState<SitePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/portal/sites`);
      if (!res.ok) throw new Error("Failed to load");
      const sites = await res.json();
      const site = Array.isArray(sites)
        ? sites.find((s: { id: string }) => s.id === siteId)
        : null;
      if (site?.pages) {
        setPages(site.pages);
      } else {
        setPages([]);
      }
    } catch {
      setError("Failed to load pages");
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  return (
    <div style={{ padding: "2rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: C.text,
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <LayoutGrid size={24} /> Pages
          </h1>
          <p style={{ color: C.muted, marginTop: "0.25rem" }}>
            Manage the pages on your website.
          </p>
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            background: C.accent,
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          <Plus size={16} /> Add Page
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "1rem",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            color: "#b91c1c",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "3rem",
          }}
        >
          <Loader2
            size={32}
            style={{ animation: "spin 1s linear infinite" }}
            color={C.accent}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : pages.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            background: C.surface,
            borderRadius: "12px",
            border: `1px solid ${C.border}`,
          }}
        >
          <FileText
            size={48}
            color={C.muted}
            style={{ margin: "0 auto 1rem" }}
          />
          <h3 style={{ color: C.text, marginBottom: "0.5rem" }}>
            No pages yet
          </h3>
          <p style={{ color: C.muted }}>
            Pages will be created automatically when your site is built, or you
            can add them manually.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {/* Column header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "28px 1fr 120px 100px 60px",
              alignItems: "center",
              padding: "0.5rem 1rem",
              fontSize: "0.6875rem",
              fontWeight: 700,
              color: C.dim,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            <span />
            <span>Page</span>
            <span>Slug</span>
            <span>Status</span>
            <span />
          </div>

          {pages.map((page, idx) => (
            <div
              key={page.id}
              style={{
                display: "grid",
                gridTemplateColumns: "28px 1fr 120px 100px 60px",
                alignItems: "center",
                padding: "0.75rem 1rem",
                background: "#fff",
                border: `1px solid ${C.border}`,
                borderRadius: "8px",
              }}
            >
              {/* Drag handle */}
              <GripVertical size={14} color={C.dim} style={{ cursor: "grab" }} />

              {/* Title */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FileText size={14} color={C.accent} />
                <span style={{ fontWeight: 600, color: C.text }}>
                  {page.title}
                </span>
                {page.isRequired && (
                  <Lock size={10} color={C.dim} />
                )}
              </div>

              {/* Slug */}
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: C.muted,
                  fontFamily: "monospace",
                }}
              >
                /{page.slug}
              </span>

              {/* Status */}
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: `${C.green}15`,
                  color: C.green,
                  justifySelf: "start",
                }}
              >
                Published
              </span>

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.5rem", justifySelf: "end" }}>
                <button
                  title="Preview"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: C.muted,
                    padding: 4,
                  }}
                >
                  <Eye size={14} />
                </button>
                <button
                  title="Edit"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: C.muted,
                    padding: 4,
                  }}
                >
                  <Pencil size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
