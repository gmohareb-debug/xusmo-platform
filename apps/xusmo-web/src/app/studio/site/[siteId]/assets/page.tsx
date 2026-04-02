"use client";

// =============================================================================
// Assets Manager — Media library for site images and files
// =============================================================================

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  ImagePlus,
  Upload,
  Search,
  Grid3X3,
  List,
  Loader2,
  Image as ImageIcon,
  FileVideo,
  FileText,
  ExternalLink,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

type ViewMode = "grid" | "list";

export default function AssetsPage() {
  const params = useParams();
  const siteId = params.siteId as string;

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);

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
            <ImagePlus size={24} /> Assets
          </h1>
          <p style={{ color: C.muted, marginTop: "0.25rem" }}>
            Manage images, videos, and files for your website.
          </p>
        </div>
        <button
          onClick={() => setUploading(true)}
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
          <Upload size={16} /> Upload
        </button>
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        {/* Search */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 0.75rem",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "6px",
          }}
        >
          <Search size={14} color={C.dim} />
          <input
            type="text"
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              color: C.text,
              fontSize: "0.875rem",
              outline: "none",
            }}
          />
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", border: `1px solid ${C.border}`, borderRadius: "6px", overflow: "hidden" }}>
          <button
            onClick={() => setViewMode("grid")}
            style={{
              padding: "0.5rem",
              background: viewMode === "grid" ? `${C.accent}15` : C.surface,
              border: "none",
              color: viewMode === "grid" ? C.accent : C.dim,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            style={{
              padding: "0.5rem",
              background: viewMode === "list" ? `${C.accent}15` : C.surface,
              border: "none",
              color: viewMode === "list" ? C.accent : C.dim,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              borderLeft: `1px solid ${C.border}`,
            }}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Upload drop zone */}
      <div
        style={{
          border: `2px dashed ${C.border}`,
          borderRadius: "12px",
          padding: "3rem 2rem",
          textAlign: "center",
          background: C.surface,
          marginBottom: "2rem",
        }}
      >
        <Upload size={40} color={C.dim} style={{ margin: "0 auto 1rem" }} />
        <h3
          style={{
            color: C.text,
            margin: "0 0 0.5rem",
            fontSize: "1rem",
            fontWeight: 600,
          }}
        >
          Drop files here or click to upload
        </h3>
        <p style={{ color: C.muted, fontSize: "0.8125rem", margin: 0 }}>
          Supports JPG, PNG, SVG, GIF, WebP, MP4, PDF — max 10MB per file
        </p>
      </div>

      {/* Empty state */}
      <div
        style={{
          textAlign: "center",
          padding: "2rem",
          background: C.surface,
          borderRadius: "12px",
          border: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "12px",
              background: `${C.blue}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ImageIcon size={24} color={C.blue} />
          </div>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "12px",
              background: `${C.purple}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileVideo size={24} color={C.purple} />
          </div>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "12px",
              background: `${C.green}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileText size={24} color={C.green} />
          </div>
        </div>
        <h3 style={{ color: C.text, marginBottom: "0.5rem" }}>
          No assets yet
        </h3>
        <p style={{ color: C.muted, fontSize: "0.875rem" }}>
          Upload images, videos, or documents to use across your site pages.
          Assets are synced with your WordPress media library.
        </p>
      </div>
    </div>
  );
}
