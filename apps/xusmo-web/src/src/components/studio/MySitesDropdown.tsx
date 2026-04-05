"use client";

// =============================================================================
// My Sites Dropdown — Shows user's sites in a hoverable dropdown
// =============================================================================

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ChevronDown, Plus, ExternalLink, Loader2 } from "lucide-react";
import { C } from "@/lib/studio/colors";

interface SiteInfo {
  id: string;
  businessName: string;
  status: string;
  updatedAt: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  LIVE: { bg: `${C.green}18`, text: C.green },
  STAGING: { bg: `${C.amber}18`, text: C.amber },
  SUSPENDED: { bg: `${C.red}18`, text: C.red },
  MAINTENANCE: { bg: `${C.blue}18`, text: C.blue },
};

export default function MySitesDropdown() {
  const [sites, setSites] = useState<SiteInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch sites on first open
  const fetchSites = () => {
    if (fetched) return;
    setLoading(true);
    fetch("/api/portal/sites")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setSites(list.map((s: SiteInfo) => ({
          id: s.id,
          businessName: s.businessName,
          status: s.status,
          updatedAt: s.updatedAt,
        })));
        setFetched(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setOpen(true);
    fetchSites();
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => setOpen(false), 200);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <div
      ref={ref}
      style={{ position: "relative" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button
        onClick={() => { setOpen(!open); fetchSites(); }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 13,
          fontWeight: 500,
          color: open ? C.accent : C.muted,
          padding: "6px 12px",
          borderRadius: 6,
          border: "none",
          background: open ? `${C.accent}10` : "transparent",
          cursor: "pointer",
          transition: "all 0.15s",
          fontFamily: "'Inter',-apple-system,sans-serif",
        }}
      >
        My Sites
        <ChevronDown
          size={14}
          style={{
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            width: 320,
            maxHeight: 440,
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            boxShadow: "0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
            fontFamily: "'Inter',-apple-system,sans-serif",
            overflow: "hidden",
            zIndex: 50,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: `1px solid ${C.border}`,
              fontSize: 13,
              fontWeight: 600,
              color: C.text,
            }}
          >
            Your Sites
          </div>

          {/* Sites List */}
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "28px 16px",
                  gap: 8,
                  color: C.dim,
                  fontSize: 13,
                }}
              >
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                Loading sites...
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : sites.length === 0 ? (
              <div
                style={{
                  padding: "28px 16px",
                  textAlign: "center",
                  color: C.dim,
                  fontSize: 13,
                }}
              >
                No sites yet. Create your first one!
              </div>
            ) : (
              sites.map((site) => {
                const statusStyle = STATUS_COLORS[site.status] || {
                  bg: `${C.dim}18`,
                  text: C.dim,
                };
                return (
                  <Link
                    key={site.id}
                    href={`/studio/site/${site.id}`}
                    onClick={() => setOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 16px",
                      textDecoration: "none",
                      borderBottom: `1px solid ${C.border}`,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = C.surfaceAlt;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: C.text,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {site.businessName}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginTop: 3,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            padding: "1px 6px",
                            borderRadius: 4,
                            background: statusStyle.bg,
                            color: statusStyle.text,
                          }}
                        >
                          {site.status}
                        </span>
                        <span style={{ fontSize: 11, color: C.dim }}>
                          {timeAgo(site.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          <div
            style={{
              borderTop: `1px solid ${C.border}`,
              padding: "6px 8px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Link
              href="/studio"
              onClick={() => setOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                color: C.muted,
                textDecoration: "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = C.surfaceAlt;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <ExternalLink size={14} />
              View All Sites
            </Link>
            <Link
              href="/studio?new=1"
              onClick={() => setOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                color: C.accent,
                textDecoration: "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = `${C.accent}08`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <Plus size={14} />
              Create New Site
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
