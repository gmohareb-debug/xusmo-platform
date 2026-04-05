"use client";

// =============================================================================
// Preview Client — 3-column layout with page selector, iframe, and right panel
// =============================================================================

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  RefreshCw,
  MessageSquare,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Send,
  Rocket,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

interface QaReport {
  id: string;
  lighthouseScore: number | null;
  performanceScore: number | null;
  accessibilityScore: number | null;
  bestPracticesScore: number | null;
  seoScore: number | null;
  mobileResponsive: boolean;
  formsWorking: boolean;
  linksValid: boolean;
  imagesLoaded: boolean;
  sslValid: boolean;
  securityScanPass: boolean;
  passed: boolean;
  createdAt: string;
}

interface ContentBlock {
  type: string;
  content: string;
}

interface SitePage {
  id: string;
  slug: string;
  title: string;
  sortOrder: number;
  heroHeadline: string | null;
  heroSubheadline: string | null;
  ctaLabel: string | null;
  bodyContent: ContentBlock[] | null;
}

interface SiteRevision {
  id: string;
  status: string;
  description: string;
  requestType: string | null;
  requestedAt: string;
}

interface SiteData {
  id: string;
  businessName: string;
  wpUrl: string | null;
  status: string;
  pages: SitePage[];
  build: {
    id: string;
    status: string;
    qaReports: QaReport[];
  } | null;
  revisions: SiteRevision[];
}

type ViewMode = "desktop" | "tablet" | "mobile";

const VIEW_WIDTHS: Record<ViewMode, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

export default function PreviewClient({ site }: { site: SiteData }) {
  const router = useRouter();

  const [activePage, setActivePage] = useState(site.pages[0]?.slug || "");
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [rightTab, setRightTab] = useState<"comments" | "qa">("qa");
  const [iframeKey, setIframeKey] = useState(0);

  // Revision request state
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionText, setRevisionText] = useState("");
  const [submittingRevision, setSubmittingRevision] = useState(false);
  const [revisionSuccess, setRevisionSuccess] = useState(false);
  const [revisionError, setRevisionError] = useState<string | null>(null);

  // Approve state
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  // QA state
  const [runningQa, setRunningQa] = useState(false);
  const [qaMessage, setQaMessage] = useState<string | null>(null);

  const iframeSrc = `/engine-preview/${site.id}${activePage && activePage !== "home" ? `?page=${activePage}` : ""}`;

  const submitRevision = async () => {
    if (!revisionText.trim()) return;
    setSubmittingRevision(true);
    setRevisionError(null);
    try {
      const res = await fetch(`/api/studio/${site.id}/revisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: revisionText,
          requestType: "content",
          pagesAffected: [activePage],
        }),
      });
      if (res.ok) {
        setRevisionSuccess(true);
        setRevisionText("");
        setShowRevisionForm(false);
        router.refresh();
        setTimeout(() => setRevisionSuccess(false), 4000);
      } else {
        const data = await res.json().catch(() => ({}));
        setRevisionError(data.error || "Failed to submit revision request.");
      }
    } catch {
      setRevisionError("Network error. Please try again.");
    }
    setSubmittingRevision(false);
  };

  const approveSite = async () => {
    setApproving(true);
    setApproveError(null);
    try {
      const res = await fetch(`/api/studio/${site.id}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        router.push(`/studio/site/${site.id}`);
      } else {
        const data = await res.json();
        setApproveError(data.error || "Failed to approve");
        setTimeout(() => setApproveError(null), 8000);
      }
    } catch {
      setApproveError("Network error");
      setTimeout(() => setApproveError(null), 8000);
    }
    setApproving(false);
  };

  const triggerQa = async () => {
    setRunningQa(true);
    setQaMessage(null);
    try {
      const res = await fetch(`/api/studio/${site.id}/qa`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setQaMessage(data.error || "Failed to trigger QA check.");
      } else {
        setQaMessage(data.message || "QA check queued. Results will appear shortly.");
        await new Promise((r) => setTimeout(r, 3000));
        router.refresh();
      }
    } catch {
      setQaMessage("Network error. Please try again.");
    }
    setRunningQa(false);
  };

  const qaReport = site.build?.qaReports?.[0] || null;

  const viewModes: {
    mode: ViewMode;
    icon: React.ComponentType<{ size?: number }>;
    label: string;
  }[] = [
    { mode: "desktop", icon: Monitor, label: "Desktop" },
    { mode: "tablet", icon: Tablet, label: "Tablet" },
    { mode: "mobile", icon: Smartphone, label: "Mobile" },
  ];

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        fontFamily: "'Inter',-apple-system,sans-serif",
        fontSize: 14,
      }}
    >
      {/* ── LEFT PANEL: Page Selector ── */}
      <div
        style={{
          width: 192,
          flexShrink: 0,
          background: C.surface,
          borderRight: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        <div
          style={{
            padding: "12px 14px 8px",
            fontSize: 10,
            fontWeight: 700,
            color: C.dim,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          Pages
        </div>
        {site.pages.map((page) => (
          <button
            key={page.id}
            onClick={() => setActivePage(page.slug)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              margin: "1px 6px",
              borderRadius: 6,
              border: "none",
              background:
                activePage === page.slug ? `${C.accent}15` : "transparent",
              color: activePage === page.slug ? C.text : C.muted,
              fontWeight: activePage === page.slug ? 600 : 400,
              fontSize: 13,
              cursor: "pointer",
              textAlign: "left",
              width: "calc(100% - 12px)",
            }}
          >
            <ChevronRight
              size={12}
              style={{
                opacity: activePage === page.slug ? 1 : 0.4,
              }}
            />
            {page.title}
          </button>
        ))}

        {site.pages.length === 0 && (
          <div style={{ padding: "12px 14px", fontSize: 12, color: C.dim }}>
            No pages yet
          </div>
        )}

        {/* Divider */}
        <div
          style={{
            margin: "12px 14px",
            borderTop: `1px solid ${C.border}`,
          }}
        />

        {/* Viewport selector */}
        <div
          style={{
            padding: "0 14px 8px",
            fontSize: 10,
            fontWeight: 700,
            color: C.dim,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          Viewport
        </div>
        <div
          style={{
            display: "flex",
            gap: 4,
            padding: "0 10px 14px",
          }}
        >
          {viewModes.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              title={label}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                padding: "6px 4px",
                borderRadius: 6,
                border: `1px solid ${viewMode === mode ? C.blue : "transparent"}`,
                background:
                  viewMode === mode ? `${C.blue}15` : "transparent",
                color: viewMode === mode ? C.blue : C.dim,
                cursor: "pointer",
                fontSize: 10,
              }}
            >
              <Icon size={13} />
            </button>
          ))}
        </div>
      </div>

      {/* ── CENTER: Iframe ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div
          style={{
            height: 40,
            background: C.surface,
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => setIframeKey((k) => k + 1)}
              title="Refresh"
              style={{
                background: "transparent",
                border: "none",
                color: C.muted,
                cursor: "pointer",
                padding: 4,
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
              }}
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div
            style={{
              fontSize: 11,
              color: C.dim,
              fontFamily: "monospace",
              maxWidth: 400,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {iframeSrc || "Not yet deployed"}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {false && (
              <a
                href={iframeSrc}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in new tab"
                style={{
                  background: "transparent",
                  border: "none",
                  color: C.muted,
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        {/* Iframe */}
        <div
          style={{
            flex: 1,
            background: C.bg,
            display: "flex",
            justifyContent: "center",
            padding: viewMode === "desktop" ? 0 : 20,
            overflow: "auto",
          }}
        >
          {iframeSrc ? (
            <div
              style={{
                width: VIEW_WIDTHS[viewMode],
                maxWidth: "100%",
                height:
                  viewMode === "desktop" ? "100%" : "calc(100vh - 180px)",
                borderRadius: viewMode === "desktop" ? 0 : 12,
                overflow: "hidden",
                border:
                  viewMode === "desktop"
                    ? "none"
                    : `1px solid ${C.border}`,
                boxShadow:
                  viewMode === "desktop"
                    ? "none"
                    : "0 8px 32px rgba(0,0,0,0.12)",
                transition: "width 0.2s ease",
              }}
            >
              <iframe
                key={iframeKey}
                src={iframeSrc}
                title={`Preview of ${site.businessName}`}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  background: "#fff",
                }}
              />
            </div>
          ) : site.status === "LIVE" || site.status === "STAGING" || site.status === "APPROVED" ? (
            /* Content preview — shows generated page content when WP isn't provisioned */
            <div
              style={{
                width: VIEW_WIDTHS[viewMode],
                maxWidth: "100%",
                height: viewMode === "desktop" ? "100%" : "calc(100vh - 180px)",
                borderRadius: viewMode === "desktop" ? 0 : 12,
                overflow: "auto",
                border: viewMode === "desktop" ? "none" : `1px solid ${C.border}`,
                background: "#ffffff",
                transition: "width 0.2s ease",
              }}
            >
              {(() => {
                const currentPage = site.pages.find((p) => p.slug === activePage) || site.pages[0];
                if (!currentPage) {
                  return (
                    <div style={{ padding: 60, textAlign: "center", color: "#94A3B8" }}>
                      No pages generated yet.
                    </div>
                  );
                }
                return (
                  <>
                    {/* Nav */}
                    <nav style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "16px 32px", borderBottom: "1px solid #E2E8F0",
                    }}>
                      <span style={{ fontWeight: 700, fontSize: 18, color: "#1E293B" }}>
                        {site.businessName}
                      </span>
                      <div style={{ display: "flex", gap: 24, fontSize: 14, color: "#64748B" }}>
                        {site.pages.slice(0, 5).map((p) => (
                          <span
                            key={p.slug}
                            style={{
                              cursor: "pointer",
                              fontWeight: activePage === p.slug ? 600 : 400,
                              color: activePage === p.slug ? "#4F46E5" : "#64748B",
                            }}
                            onClick={() => setActivePage(p.slug)}
                          >
                            {p.title}
                          </span>
                        ))}
                      </div>
                    </nav>

                    {/* Hero */}
                    {(currentPage.heroHeadline || currentPage.heroSubheadline) && (
                      <div style={{ padding: "80px 32px", textAlign: "center", backgroundColor: "#F8FAFC" }}>
                        {currentPage.heroHeadline && (
                          <h1 style={{ fontSize: 36, fontWeight: 700, color: "#1E293B", marginBottom: 16 }}>
                            {currentPage.heroHeadline}
                          </h1>
                        )}
                        {currentPage.heroSubheadline && (
                          <p style={{ fontSize: 18, color: "#64748B", maxWidth: 600, margin: "0 auto 32px" }}>
                            {currentPage.heroSubheadline}
                          </p>
                        )}
                        {currentPage.ctaLabel && (
                          <span style={{
                            display: "inline-block", padding: "12px 32px", borderRadius: 12,
                            backgroundColor: "#4F46E5", color: "#fff", fontSize: 14, fontWeight: 600,
                          }}>
                            {currentPage.ctaLabel}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Body Content */}
                    {currentPage.bodyContent && currentPage.bodyContent.length > 0 && (
                      <div style={{ padding: "48px 32px", maxWidth: 800, margin: "0 auto" }}>
                        {currentPage.bodyContent.map((block, i) => (
                          <div key={i} style={{ marginBottom: 32 }}>
                            {block.type === "service" ? (
                              <div style={{
                                padding: 20, borderRadius: 12, backgroundColor: "#F8FAFC",
                                border: "1px solid #E2E8F0",
                              }}>
                                <p style={{ fontSize: 15, color: "#1E293B", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                                  {block.content}
                                </p>
                              </div>
                            ) : block.type === "testimonial" ? (
                              <div style={{
                                padding: 24, borderLeft: "4px solid #4F46E5",
                                backgroundColor: "#EEF2FF", borderRadius: "0 12px 12px 0",
                              }}>
                                <p style={{ fontSize: 14, color: "#1E293B", lineHeight: 1.7, fontStyle: "italic", whiteSpace: "pre-line" }}>
                                  {block.content}
                                </p>
                              </div>
                            ) : block.type === "faq" ? (
                              <div style={{
                                padding: 20, borderRadius: 8,
                                border: "1px solid #E2E8F0",
                              }}>
                                <p style={{ fontSize: 14, color: "#1E293B", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                                  {block.content}
                                </p>
                              </div>
                            ) : (
                              <p style={{ fontSize: 15, color: "#334155", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                                {block.content}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div style={{ padding: 32, textAlign: "center", fontSize: 12, color: "#94A3B8", borderTop: "1px solid #E2E8F0" }}>
                      &copy; {new Date().getFullYear()} {site.businessName}. Built with Xusmo.
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                color: C.dim,
              }}
            >
              <Loader2
                size={32}
                style={{ animation: "spin 1s linear infinite" }}
              />
              <div
                style={{ fontSize: 16, fontWeight: 600, color: C.text }}
              >
                Your site is still being built.
              </div>
              <div style={{ fontSize: 13, color: C.muted }}>
                The preview will appear once the build completes.
              </div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div
        style={{
          width: 280,
          flexShrink: 0,
          background: C.surface,
          borderLeft: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          {(["qa", "comments"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setRightTab(tab)}
              style={{
                flex: 1,
                padding: "10px 0",
                border: "none",
                borderBottom:
                  rightTab === tab
                    ? `2px solid ${C.accent}`
                    : "2px solid transparent",
                background: "transparent",
                color: rightTab === tab ? C.text : C.dim,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {tab === "qa" ? "QA Report" : "Revisions"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {rightTab === "qa" ? (
            <QaTab
              report={qaReport}
              running={runningQa}
              onRunCheck={triggerQa}
              hasBuild={!!site.build}
              message={qaMessage}
            />
          ) : (
            <RevisionsTab revisions={site.revisions} />
          )}
        </div>

        {/* Success toast */}
        {revisionSuccess && (
          <div
            style={{
              padding: "10px 14px",
              background: `${C.green}15`,
              borderTop: `1px solid ${C.green}40`,
              fontSize: 12,
              color: C.green,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <CheckCircle2 size={14} />
            Revision request submitted.
          </div>
        )}

        {/* Bottom Actions */}
        <div
          style={{
            borderTop: `1px solid ${C.border}`,
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {/* Request Changes */}
          {showRevisionForm ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {revisionError && (
                <div style={{ fontSize: 11, color: C.red, display: "flex", alignItems: "center", gap: 4 }}>
                  <AlertCircle size={12} /> {revisionError}
                </div>
              )}
              <textarea
                value={revisionText}
                onChange={(e) => { setRevisionText(e.target.value); setRevisionError(null); }}
                placeholder="Describe what you'd like changed..."
                style={{
                  width: "100%",
                  minHeight: 80,
                  padding: 10,
                  background: C.surfaceAlt,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  color: C.text,
                  fontSize: 12,
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={submitRevision}
                  disabled={submittingRevision || !revisionText.trim()}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    padding: "8px 12px",
                    background: C.accent,
                    border: "none",
                    borderRadius: 6,
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor:
                      submittingRevision || !revisionText.trim()
                        ? "default"
                        : "pointer",
                    opacity:
                      submittingRevision || !revisionText.trim() ? 0.5 : 1,
                  }}
                >
                  <Send size={12} />
                  {submittingRevision ? "Submitting..." : "Submit Request"}
                </button>
                <button
                  onClick={() => setShowRevisionForm(false)}
                  style={{
                    padding: "8px 12px",
                    background: C.surfaceAlt,
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    color: C.muted,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { setShowRevisionForm(true); setApproveError(null); setRevisionError(null); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
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
              <MessageSquare size={14} /> Request Changes
            </button>
          )}

          {/* Approve & Go Live */}
          {approveError && (
            <div
              style={{
                fontSize: 11,
                color: C.red,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <AlertCircle size={12} /> {approveError}
            </div>
          )}
          <button
            onClick={approveSite}
            disabled={approving || site.status === "LIVE"}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "10px 12px",
              background:
                site.status === "LIVE" ? C.surfaceAlt : C.green,
              border: "none",
              borderRadius: 8,
              color: site.status === "LIVE" ? C.dim : "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor:
                site.status === "LIVE" ? "default" : "pointer",
            }}
          >
            <Rocket size={14} />
            {site.status === "LIVE"
              ? "Site is Live"
              : site.status === "APPROVED"
                ? "Approved — Pending Deploy"
                : approving
                  ? "Approving..."
                  : "Approve & Go Live"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── QA Tab ─────────────────────────────────────────────────────────────────

function QaTab({
  report,
  running,
  onRunCheck,
  hasBuild,
  message,
}: {
  report: QaReport | null;
  running: boolean;
  onRunCheck: () => void;
  hasBuild: boolean;
  message?: string | null;
}) {
  if (!report) {
    return (
      <div
        style={{
          padding: "40px 20px",
          textAlign: "center",
          color: C.dim,
        }}
      >
        <AlertCircle
          size={32}
          color={C.dim}
          style={{ marginBottom: 10 }}
        />
        <div
          style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6 }}
        >
          No QA report yet
        </div>
        <div style={{ fontSize: 12, marginBottom: 16 }}>
          {hasBuild
            ? "Run a QA check to analyze your site."
            : "A QA report will be generated after the build."}
        </div>
        {hasBuild && (
          <>
            <button
              onClick={onRunCheck}
              disabled={running}
              style={{
                padding: "8px 16px",
                background: C.accent,
                border: "none",
                borderRadius: 6,
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                cursor: running ? "default" : "pointer",
                opacity: running ? 0.6 : 1,
              }}
            >
              {running ? "Queued..." : "Run QA Check"}
            </button>
            {message && (
              <div style={{ marginTop: 10, fontSize: 11, color: message.includes("error") || message.includes("Failed") ? C.red : C.green, textAlign: "center" }}>
                {message}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  const scores = [
    { label: "Performance", value: report.performanceScore },
    { label: "Accessibility", value: report.accessibilityScore },
    { label: "SEO", value: report.seoScore },
    { label: "Best Practices", value: report.bestPracticesScore },
  ];

  const checks = [
    { label: "Mobile Responsive", ok: report.mobileResponsive },
    { label: "Forms Working", ok: report.formsWorking },
    { label: "Links Valid", ok: report.linksValid },
    { label: "Images Loaded", ok: report.imagesLoaded },
    { label: "SSL Valid", ok: report.sslValid },
    { label: "Security Scan", ok: report.securityScanPass },
  ];

  return (
    <div style={{ padding: 14 }}>
      {/* Score circles */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {scores.map((s) => (
          <div
            key={s.label}
            style={{
              textAlign: "center",
              padding: "12px 8px",
              background: C.surfaceAlt,
              borderRadius: 8,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: `3px solid ${scoreColor(s.value)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 6px",
                fontSize: 16,
                fontWeight: 700,
                color: scoreColor(s.value),
              }}
            >
              {s.value ?? "—"}
            </div>
            <div style={{ fontSize: 10, color: C.muted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Check rows */}
      <div style={{ marginBottom: 14 }}>
        {checks.map((c) => (
          <div
            key={c.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 0",
              borderBottom: `1px solid ${C.border}`,
              fontSize: 12,
              color: C.text,
            }}
          >
            <span>{c.label}</span>
            {c.ok ? (
              <CheckCircle2 size={14} color={C.green} />
            ) : (
              <XCircle size={14} color={C.red} />
            )}
          </div>
        ))}
      </div>

      {/* Run new check */}
      <button
        onClick={onRunCheck}
        disabled={running}
        style={{
          width: "100%",
          padding: "8px 0",
          background: C.surfaceAlt,
          border: `1px solid ${C.border}`,
          borderRadius: 6,
          color: C.muted,
          fontSize: 12,
          fontWeight: 600,
          cursor: running ? "default" : "pointer",
        }}
      >
        {running ? "Queued..." : "Run New Check"}
      </button>

      {message && (
        <div style={{ marginTop: 6, fontSize: 11, color: message.includes("error") || message.includes("Failed") ? C.red : C.green, textAlign: "center" }}>
          {message}
        </div>
      )}

      <div style={{ fontSize: 10, color: C.dim, marginTop: 8 }}>
        Last checked:{" "}
        {new Date(report.createdAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}

function scoreColor(value: number | null): string {
  if (value === null) return C.dim;
  if (value >= 90) return C.green;
  if (value >= 50) return C.amber;
  return C.red;
}

// ─── Revisions Tab ──────────────────────────────────────────────────────────

function RevisionsTab({ revisions }: { revisions: SiteRevision[] }) {
  if (!revisions.length) {
    return (
      <div
        style={{
          padding: "40px 20px",
          textAlign: "center",
          color: C.dim,
        }}
      >
        <MessageSquare
          size={32}
          color={C.dim}
          style={{ marginBottom: 10 }}
        />
        <div
          style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6 }}
        >
          No revision requests
        </div>
        <div style={{ fontSize: 12 }}>
          Use &quot;Request Changes&quot; below to submit feedback.
        </div>
      </div>
    );
  }

  const STATUS_COLORS: Record<string, string> = {
    PENDING: C.amber,
    IN_PROGRESS: C.blue,
    COMPLETED: C.green,
    REJECTED: C.red,
  };

  return (
    <div style={{ padding: 10 }}>
      {revisions.map((rev) => (
        <div
          key={rev.id}
          style={{
            padding: "10px 12px",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: 4,
                background: `${STATUS_COLORS[rev.status] || C.dim}20`,
                color: STATUS_COLORS[rev.status] || C.dim,
              }}
            >
              {rev.status}
            </span>
            <span style={{ fontSize: 10, color: C.dim }}>
              {timeAgo(rev.requestedAt)}
            </span>
          </div>
          <div
            style={{
              fontSize: 12,
              color: C.text,
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {rev.description}
          </div>
        </div>
      ))}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
