"use client";

// =============================================================================
// Preview Page — Build progress + site preview + approval (Redesigned)
// Light theme with indigo/amber accent
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AgentLog {
  agentName: string;
  status: string;
  durationMs: number | null;
  startedAt: string;
  completedAt: string | null;
}

interface DemoAnswers {
  business_name?: string;
  business_description?: string;
  location?: string;
  phone?: string;
  email?: string;
  primary_goal?: string;
  tone?: string;
  selected_services?: string[];
  additional_services?: string;
  [key: string]: unknown;
}

interface BuildStatus {
  buildId: string;
  siteId: string | null;
  status: string;
  progress: number;
  currentAgent: string | null;
  startedAt: string | null;
  completedAt: string | null;
  failureReason: string | null;
  siteUrl: string | null;
  businessName: string | null;
  agents: AgentLog[];
  qaReport: { passed: boolean; notes: string | null } | null;
  demoAnswers?: DemoAnswers | null;
}

const AGENT_LABELS: Record<string, string> = {
  content: "Writing your content",
  build: "Building your pages",
  seo: "Optimizing for SEO",
  asset: "Creating images",
  qa: "Running quality checks",
};

const PIPELINE_AGENTS = ["content", "build", "seo", "asset", "qa"];

const TIPS = [
  "Sites with a clear CTA get 3x more leads.",
  "70% of web traffic comes from mobile devices.",
  "Adding customer reviews boosts trust by 72%.",
  "Pages that load under 2s have 50% lower bounce rates.",
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PreviewPage() {
  const params = useParams();
  const buildId = params.buildId as string;
  const isDemo = buildId.startsWith("demo-");

  const [buildStatus, setBuildStatus] = useState<BuildStatus | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceView, setDeviceView] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [tipIdx, setTipIdx] = useState(0);

  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIdx((prev) => (prev + 1) % TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Poll build status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/builds/${buildId}/status`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setBuildStatus(data);
    } catch {
      setError("Failed to load build status");
    }
  }, [buildId]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const isDone =
    buildStatus?.status === "PREVIEW_READY" ||
    buildStatus?.status === "APPROVED" ||
    buildStatus?.status === "FAILED" ||
    buildStatus?.status === "QA_FAILED";

  useEffect(() => {
    if (!isDone) return;
  }, [isDone]);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const res = await fetch(`/api/builds/${buildId}/approve`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to approve");
      }
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setIsApproving(false);
    }
  };

  function getAgentStatus(agentName: string) {
    const log = buildStatus?.agents.find((a) => a.agentName === agentName);
    if (log?.status === "COMPLETED") return "completed";
    if (log?.status === "FAILED") return "failed";
    if (buildStatus?.currentAgent === agentName) return "running";
    return "pending";
  }

  const isReady = buildStatus?.status === "PREVIEW_READY";
  const isApproved = buildStatus?.status === "APPROVED";
  const isFailed =
    buildStatus?.status === "FAILED" ||
    buildStatus?.status === "QA_FAILED";
  const isBuilding = !isReady && !isApproved && !isFailed;

  const iframeWidth =
    deviceView === "tablet" ? "768px" : deviceView === "mobile" ? "375px" : "100%";

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#FAF9F7" }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-display text-lg font-bold text-neutral-900 tracking-tight"
          >
            Xus<span style={{ color: "#4F46E5" }}>mo</span>
          </Link>
          <span style={{ color: "#E2E8F0" }}>|</span>
          <span className="text-sm" style={{ color: "#64748B" }}>
            {isReady
              ? "Your website is ready for review!"
              : isApproved
                ? "Website approved!"
                : isFailed
                  ? "Build failed"
                  : "Building your website..."}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Device switcher (only when preview ready) */}
          {(isReady || isApproved) && (
            <div
              className="flex rounded-lg overflow-hidden"
              style={{ border: "1px solid #E2E8F0" }}
            >
              {(["desktop", "tablet", "mobile"] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setDeviceView(view)}
                  className="px-3 py-1.5 text-xs font-medium capitalize transition-colors"
                  style={{
                    backgroundColor:
                      deviceView === view ? "#4F46E5" : "#ffffff",
                    color: deviceView === view ? "#ffffff" : "#64748B",
                  }}
                >
                  {view}
                </button>
              ))}
            </div>
          )}

          {buildStatus?.businessName && (
            <span className="text-sm" style={{ color: "#94A3B8" }}>
              {buildStatus.businessName}
            </span>
          )}

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #E2E8F0",
              color: "#64748B",
            }}
          >
            {showSidebar ? "Hide Details" : "Show Details"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main area */}
        <div className="flex-1">
          {/* Building state */}
          {isBuilding && (
            <div className="flex h-full flex-col items-center justify-center gap-8 p-8 bg-gradient-hero">
              <div className="text-center">
                <h2 className="mb-2 font-display text-3xl font-bold text-neutral-900">
                  Building Your Website
                </h2>
                <p className="text-neutral-500">
                  Our AI agents are crafting your site. This usually takes
                  under a minute.
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-md">
                <div className="mb-2 flex justify-between text-sm">
                  <span style={{ color: "#64748B" }}>
                    {buildStatus?.currentAgent
                      ? AGENT_LABELS[buildStatus.currentAgent] ??
                        buildStatus.currentAgent
                      : "Starting..."}
                  </span>
                  <span style={{ color: "#4F46E5" }} className="font-semibold">
                    {buildStatus?.progress ?? 0}%
                  </span>
                </div>
                <div
                  className="h-3 w-full overflow-hidden rounded-full"
                  style={{ backgroundColor: "#E0E7FF" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${buildStatus?.progress ?? 0}%`,
                      backgroundColor: "#4F46E5",
                    }}
                  />
                </div>
              </div>

              {/* Agent pipeline */}
              <div className="flex gap-6 flex-wrap justify-center">
                {PIPELINE_AGENTS.map((agent) => {
                  const status = getAgentStatus(agent);
                  return (
                    <div
                      key={agent}
                      className="flex flex-col items-center gap-2 w-20"
                    >
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300"
                        style={
                          status === "completed"
                            ? {
                                backgroundColor: "#F0FDF4",
                                border: "2px solid #22C55E",
                                color: "#22C55E",
                              }
                            : status === "running"
                              ? {
                                  backgroundColor: "#EEF2FF",
                                  border: "2px solid #4F46E5",
                                  color: "#4F46E5",
                                  animation: "pulse 2s infinite",
                                }
                              : status === "failed"
                                ? {
                                    backgroundColor: "#FEF2F2",
                                    border: "2px solid #EF4444",
                                    color: "#EF4444",
                                  }
                                : {
                                    backgroundColor: "#F8FAFC",
                                    border: "2px solid #E2E8F0",
                                    color: "#CBD5E1",
                                  }
                        }
                      >
                        {status === "completed" ? (
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : status === "running" ? (
                          <div
                            className="h-3 w-3 rounded-full animate-pulse"
                            style={{ backgroundColor: "#4F46E5" }}
                          />
                        ) : status === "failed" ? (
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        ) : (
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: "#CBD5E1" }}
                          />
                        )}
                      </div>
                      <span
                        className="text-xs text-center leading-tight"
                        style={{
                          color:
                            status === "completed"
                              ? "#22C55E"
                              : status === "running"
                                ? "#4F46E5"
                                : "#94A3B8",
                        }}
                      >
                        {AGENT_LABELS[agent]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Fun tip */}
              <div
                className="mt-4 rounded-xl px-6 py-3 text-sm transition-all"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #E0E7FF",
                  color: "#64748B",
                }}
              >
                <span style={{ color: "#F59E0B" }}>💡</span> {TIPS[tipIdx]}
              </div>
            </div>
          )}

          {/* Preview iframe or demo mock */}
          {(isReady || isApproved) && buildStatus?.siteUrl && (() => {
            const da = buildStatus.demoAnswers;
            const bName = buildStatus.businessName ?? "Your Business";
            const bDesc = (da?.business_description as string) || `Professional services tailored to your needs. We help you grow your business with reliable, high-quality solutions.`;
            const bLocation = (da?.location as string) || "";
            const bPhone = (da?.phone as string) || "(555) 123-4567";
            const bEmail = (da?.email as string) || "hello@yourbusiness.com";
            const services = Array.isArray(da?.selected_services) && da.selected_services.length > 0
              ? (da.selected_services as string[]).map((s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()))
              : ["Consulting", "Development", "Support"];
            const goalMap: Record<string, string> = {
              phone_calls: "Call Us Today",
              form_leads: "Get a Free Quote",
              book_appointments: "Book an Appointment",
              showcase_work: "View Our Work",
              sell_products: "Shop Now",
              provide_info: "Learn More",
            };
            const ctaText = goalMap[(da?.primary_goal as string) ?? ""] ?? "Get Started";

            return (
              <div className="flex h-full justify-center bg-neutral-100 p-4">
                {buildStatus.siteUrl === "demo-preview" ? (
                  <div
                    className="h-full overflow-y-auto rounded-lg shadow-lg transition-all duration-300"
                    style={{
                      width: iframeWidth,
                      maxWidth: "100%",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <div style={{ backgroundColor: "#ffffff" }}>
                      {/* Nav */}
                      <nav
                        className="flex items-center justify-between px-8 py-4"
                        style={{ borderBottom: "1px solid #E2E8F0" }}
                      >
                        <span className="font-bold text-lg text-neutral-900">{bName}</span>
                        <div className="flex gap-6 text-sm" style={{ color: "#64748B" }}>
                          <span>Home</span>
                          <span>Services</span>
                          <span>About</span>
                          <span>Contact</span>
                        </div>
                      </nav>

                      {/* Hero */}
                      <div className="px-8 py-20 text-center" style={{ backgroundColor: "#F8FAFC" }}>
                        <h1 className="text-4xl font-bold text-neutral-900 mb-4">
                          Welcome to {bName}
                        </h1>
                        <p className="text-lg mb-2 max-w-xl mx-auto" style={{ color: "#64748B" }}>
                          {bDesc}
                        </p>
                        {bLocation && (
                          <p className="text-sm mb-8" style={{ color: "#94A3B8" }}>
                            Serving {bLocation}
                          </p>
                        )}
                        <div
                          className="inline-block rounded-xl px-8 py-3 text-sm font-semibold text-white"
                          style={{ backgroundColor: "#4F46E5" }}
                        >
                          {ctaText}
                        </div>
                      </div>

                      {/* Services */}
                      <div className="px-8 py-16">
                        <h2 className="text-2xl font-bold text-neutral-900 text-center mb-10">
                          Our Services
                        </h2>
                        <div
                          className="grid gap-6 max-w-3xl mx-auto"
                          style={{
                            gridTemplateColumns: `repeat(${Math.min(services.length, 3)}, minmax(0, 1fr))`,
                          }}
                        >
                          {services.map((svc: string) => (
                            <div
                              key={svc}
                              className="rounded-xl p-6 text-center"
                              style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}
                            >
                              <div
                                className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full"
                                style={{ backgroundColor: "#EEF2FF" }}
                              >
                                <div className="h-4 w-4 rounded" style={{ backgroundColor: "#4F46E5" }} />
                              </div>
                              <h3 className="font-semibold text-neutral-900 mb-2">{svc}</h3>
                              <p className="text-xs" style={{ color: "#94A3B8" }}>
                                Professional {svc.toLowerCase()} services tailored to your needs.
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* About */}
                      <div className="px-8 py-16" style={{ backgroundColor: "#F8FAFC" }}>
                        <div className="max-w-3xl mx-auto flex gap-10 items-center">
                          <div
                            className="w-48 h-32 shrink-0 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: "#E0E7FF" }}
                          >
                            <span className="text-3xl font-bold" style={{ color: "#4F46E5" }}>
                              {bName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-neutral-900 mb-3">About {bName}</h2>
                            <p className="text-sm" style={{ color: "#64748B" }}>
                              {bDesc}
                            </p>
                            {bLocation && (
                              <p className="text-sm mt-2" style={{ color: "#94A3B8" }}>
                                Located in {bLocation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="px-8 py-16 text-center" style={{ backgroundColor: "#4F46E5" }}>
                        <h2 className="text-2xl font-bold text-white mb-3">Ready to Get Started?</h2>
                        <p className="text-sm text-white/70 mb-6">
                          Contact us today — {bPhone} | {bEmail}
                        </p>
                        <div
                          className="inline-block rounded-xl px-8 py-3 text-sm font-semibold"
                          style={{ backgroundColor: "#ffffff", color: "#4F46E5" }}
                        >
                          {ctaText}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="px-8 py-8 text-center text-xs" style={{ color: "#94A3B8" }}>
                        &copy; 2026 {bName}. Built with Xusmo.
                      </div>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={buildStatus.siteUrl}
                    className="h-full border-0 rounded-lg shadow-lg transition-all duration-300"
                    style={{
                      width: iframeWidth,
                      maxWidth: "100%",
                      backgroundColor: "#ffffff",
                    }}
                    title="Website Preview"
                  />
                )}
              </div>
            );
          })()}

          {/* Failed state */}
          {isFailed && (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8 bg-gradient-hero">
              <div
                className="rounded-2xl p-8 text-center max-w-md"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #FCA5A5",
                }}
              >
                <div
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: "#FEF2F2" }}
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#EF4444"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="mb-2 font-display text-xl font-bold text-neutral-900">
                  Build Failed
                </h2>
                <p className="text-sm text-neutral-500">
                  {buildStatus?.failureReason ??
                    "An unexpected error occurred during the build process."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        {showSidebar && (
          <div
            className="w-80 overflow-y-auto p-5"
            style={{
              backgroundColor: "#ffffff",
              borderLeft: "1px solid #E2E8F0",
            }}
          >
            <h3 className="mb-4 font-display font-semibold text-neutral-900">
              Build Details
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "#94A3B8" }}>Status</span>
                <span
                  className="font-medium"
                  style={{
                    color: isReady
                      ? "#22C55E"
                      : isApproved
                        ? "#4F46E5"
                        : isFailed
                          ? "#EF4444"
                          : "#F59E0B",
                  }}
                >
                  {buildStatus?.status ?? "Loading..."}
                </span>
              </div>

              <div className="flex justify-between">
                <span style={{ color: "#94A3B8" }}>Progress</span>
                <span className="text-neutral-900 font-medium">
                  {buildStatus?.progress ?? 0}%
                </span>
              </div>

              {buildStatus?.startedAt && (
                <div className="flex justify-between">
                  <span style={{ color: "#94A3B8" }}>Started</span>
                  <span className="text-neutral-700">
                    {new Date(buildStatus.startedAt).toLocaleTimeString()}
                  </span>
                </div>
              )}

              {buildStatus?.completedAt && (
                <div className="flex justify-between">
                  <span style={{ color: "#94A3B8" }}>Completed</span>
                  <span className="text-neutral-700">
                    {new Date(buildStatus.completedAt).toLocaleTimeString()}
                  </span>
                </div>
              )}

              {/* Agent logs */}
              <div
                className="mt-4 pt-4"
                style={{ borderTop: "1px solid #E2E8F0" }}
              >
                <h4 className="mb-3 font-medium text-neutral-900">
                  Agent Pipeline
                </h4>
                {PIPELINE_AGENTS.map((agent) => {
                  const log = buildStatus?.agents.find(
                    (a) => a.agentName === agent
                  );
                  const status = getAgentStatus(agent);
                  return (
                    <div
                      key={agent}
                      className="mb-2 flex items-center justify-between"
                    >
                      <span style={{ color: "#64748B" }}>
                        {AGENT_LABELS[agent]}
                      </span>
                      <span
                        className="text-xs font-medium"
                        style={{
                          color:
                            status === "completed"
                              ? "#22C55E"
                              : status === "running"
                                ? "#F59E0B"
                                : status === "failed"
                                  ? "#EF4444"
                                  : "#CBD5E1",
                        }}
                      >
                        {status === "completed" && log?.durationMs
                          ? `${(log.durationMs / 1000).toFixed(1)}s`
                          : status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* QA Report */}
              {buildStatus?.qaReport && (
                <div
                  className="pt-4"
                  style={{ borderTop: "1px solid #E2E8F0" }}
                >
                  <h4 className="mb-2 font-medium text-neutral-900">
                    QA Report
                  </h4>
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: buildStatus.qaReport.passed
                        ? "#22C55E"
                        : "#EF4444",
                    }}
                  >
                    {buildStatus.qaReport.passed
                      ? "All checks passed"
                      : "Some checks failed"}
                  </span>
                  {buildStatus.qaReport.notes && (
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-neutral-400">
                      {buildStatus.qaReport.notes}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      {(isReady || isApproved) && (
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            backgroundColor: "#ffffff",
            borderTop: "1px solid #E2E8F0",
          }}
        >
          <div>
            {showRevisionInput ? (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="Describe the changes you'd like..."
                  className="w-96 rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1.5px solid #E2E8F0",
                    color: "#1E293B",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#818CF8";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                  }}
                />
                <button
                  onClick={() => {
                    setShowRevisionInput(false);
                    setRevisionNotes("");
                  }}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-white"
                  style={{ backgroundColor: "#4F46E5" }}
                >
                  Submit
                </button>
                <button
                  onClick={() => setShowRevisionInput(false)}
                  className="text-sm"
                  style={{ color: "#94A3B8" }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowRevisionInput(true)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1.5px solid #E0E7FF",
                  color: "#4F46E5",
                }}
              >
                Request Changes
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {(isReady || isApproved) && buildStatus?.siteId && (
              <Link
                href={`/studio/site/${buildStatus.siteId}`}
                className="rounded-xl px-5 py-2.5 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1.5px solid #E0E7FF",
                  color: "#4F46E5",
                }}
              >
                Manage in Studio
              </Link>
            )}

            {isReady && (
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
                style={{ backgroundColor: "#22C55E" }}
              >
                {isApproving ? "Approving..." : "Approve & Go Live →"}
              </button>
            )}

            {isApproved && (
              <Link
                href={`/go-live/${buildId}`}
                className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{ backgroundColor: "#22C55E" }}
              >
                Continue to Go Live →
              </Link>
            )}
          </div>

          {error && (
            <p className="text-sm" style={{ color: "#EF4444" }}>
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
