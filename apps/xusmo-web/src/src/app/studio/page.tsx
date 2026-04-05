"use client";

// =============================================================================
// Studio Home — Lists user's sites with status-based CTAs
// =============================================================================

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Globe,
  Plus,
  Loader2,
  Eye,
  CheckCircle2,
  Clock,
  CreditCard,
  Settings,
  Hammer,
  ArrowRight,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

interface SiteSummary {
  id: string;
  businessName: string;
  status: string;
  wpUrl: string | null;
  tier: string;
  archetype: string;
  createdAt: string;
  pages: { slug: string; title: string }[];
  buildId: string | null;
  buildStatus: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<{ size?: number; color?: string }>; cta: string }> = {
  STAGING:        { label: "Building",       color: C.blue,   icon: Hammer,        cta: "View Progress" },
  LIVE:           { label: "Published",      color: C.green,  icon: Globe,         cta: "Manage" },
  SUSPENDED:      { label: "Suspended",      color: C.red,    icon: Clock,         cta: "Contact Support" },
  MAINTENANCE:    { label: "Maintenance",    color: C.amber,  icon: Settings,      cta: "View Details" },
};

// Build statuses from BuildStatus enum that map to user-facing states
const BUILD_STATUS_MAP: Record<string, { label: string; color: string; icon: React.ComponentType<{ size?: number; color?: string }>; cta: string }> = {
  BUILDING:       { label: "Building",       color: C.blue,   icon: Hammer,        cta: "View Progress" },
  PREVIEW_READY:  { label: "Preview Ready",  color: C.purple, icon: Eye,           cta: "Review Your Site" },
  IN_REVIEW:      { label: "In Review",      color: C.amber,  icon: CheckCircle2,  cta: "Continue Review" },
  APPROVED:       { label: "Approved",       color: C.green,  icon: CreditCard,    cta: "Complete Payment" },
  PUBLISHED:      { label: "Published",      color: C.green,  icon: Globe,         cta: "Manage" },
};

function getStatusInfo(siteStatus: string, buildStatus: string | null) {
  // Prefer build status for more granular info (e.g. PREVIEW_READY vs generic STAGING)
  if (buildStatus && BUILD_STATUS_MAP[buildStatus]) {
    return BUILD_STATUS_MAP[buildStatus];
  }
  return STATUS_CONFIG[siteStatus] || { label: siteStatus, color: C.dim, icon: Clock, cta: "View" };
}

export default function StudioHomePage() {
  const router = useRouter();
  const [sites, setSites] = useState<SiteSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/sites")
      .then((r) => r.json())
      .then((data) => {
        setSites(Array.isArray(data) ? data : []);
      })
      .catch(() => setSites([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, color: C.muted, fontFamily: "'Inter',-apple-system,sans-serif" }}>
        <Loader2 size={24} style={{ animation: "spin 1s linear infinite", marginRight: 10 }} />
        <span style={{ fontSize: 14 }}>Loading your sites...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Empty state
  if (sites.length === 0) {
    return (
      <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", fontSize: 14 }}>
        <div style={{ maxWidth: 480, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
          <div
            style={{
              width: 72, height: 72, borderRadius: "50%", margin: "0 auto 24px",
              background: `${C.red}15`, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Globe size={32} color={C.red} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: "0 0 8px" }}>Welcome to Xusmo Studio</h1>
          <p style={{ color: C.muted, fontSize: 14, margin: "0 0 32px", lineHeight: 1.6 }}>
            Build a professional website for your business in minutes. Our AI-powered builder creates a custom site tailored to your industry.
          </p>
          <Link
            href="/interview"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 28px", borderRadius: 10,
              background: C.red, color: "#fff",
              fontSize: 15, fontWeight: 600, textDecoration: "none",
              transition: "opacity 0.15s",
            }}
          >
            <Plus size={18} /> Start Building Your Website
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", fontSize: 14 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>My Sites</h1>
            <p style={{ color: C.dim, fontSize: 12, margin: 0 }}>{sites.length} site{sites.length !== 1 ? "s" : ""}</p>
          </div>
          <Link
            href="/interview"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "9px 18px", borderRadius: 8,
              background: C.red, color: "#fff",
              fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}
          >
            <Plus size={15} /> New Site
          </Link>
        </div>

        {/* Site Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {sites.map((site) => {
            const info = getStatusInfo(site.status, site.buildStatus);
            const Icon = info.icon;
            return (
              <div
                key={site.id}
                style={{
                  background: C.surface,
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  transition: "border-color 0.15s",
                }}
              >
                {/* Top row: Name + Status */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{site.businessName}</div>
                    {site.wpUrl && (
                      <div style={{ fontSize: 11, color: C.dim, marginTop: 2, fontFamily: "monospace" }}>{site.wpUrl}</div>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "4px 10px", borderRadius: 6,
                      background: `${info.color}15`, color: info.color,
                      fontSize: 11, fontWeight: 600,
                    }}
                  >
                    <Icon size={12} color={info.color} />
                    {info.label}
                  </div>
                </div>

                {/* Badges */}
                <div style={{ display: "flex", gap: 6 }}>
                  {site.archetype && (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: `${C.blue}18`, color: C.blue }}>
                      {site.archetype}
                    </span>
                  )}
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: `${C.purple}18`, color: C.purple }}>
                    {site.tier}
                  </span>
                  <span style={{ fontSize: 10, color: C.dim }}>
                    Created {new Date(site.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* CTA Button — STAGING sites with a build go to the build page */}
                <Link
                  href={
                    site.status === "STAGING" && site.buildId &&
                    site.buildStatus && ["QUEUED", "BUILDING", "IN_PROGRESS", "CONTENT_DONE"].includes(site.buildStatus)
                      ? `/studio/build/${site.buildId}`
                      : `/studio/site/${site.id}`
                  }
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "10px 16px", borderRadius: 8,
                    background: `${info.color}12`, border: `1px solid ${info.color}30`,
                    color: info.color, fontSize: 13, fontWeight: 600,
                    textDecoration: "none", marginTop: "auto",
                    transition: "background 0.15s",
                  }}
                >
                  {info.cta}
                  <ArrowRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
