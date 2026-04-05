"use client";

// =============================================================================
// Admin Builds — Build queue table with filters, expandable logs, retry
// =============================================================================

import { useEffect, useState, useCallback } from "react";

interface Build {
  id: string;
  status: string;
  businessName: string;
  industry: string;
  archetype: string;
  currentAgent: string | null;
  progress: number;
  totalLlmCost: number;
  totalBuildTime: number;
  siteUrl: string | null;
  failureReason: string | null;
  agentLogCount: number;
  createdAt: string;
  completedAt: string | null;
}

interface AgentLog {
  id: string;
  agentName: string;
  status: string;
  durationMs: number | null;
  tokensUsed: number | null;
  llmModel: string | null;
  llmCost: number | null;
  error: string | null;
  startedAt: string;
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  QUEUED: { bg: "#F1F5F9", color: "#64748B" },
  IN_PROGRESS: { bg: "#EEF2FF", color: "#4F46E5" },
  PREVIEW_READY: { bg: "#F0FDF4", color: "#16A34A" },
  APPROVED: { bg: "#ECFDF5", color: "#059669" },
  PUBLISHED: { bg: "#F0FDF4", color: "#16A34A" },
  FAILED: { bg: "#FEF2F2", color: "#DC2626" },
  QA_FAILED: { bg: "#FFFBEB", color: "#D97706" },
};

function getStatusStyle(status: string) {
  return STATUS_STYLES[status] ?? STATUS_STYLES.QUEUED;
}

const LOG_DOT: Record<string, string> = {
  COMPLETED: "#22C55E",
  FAILED: "#EF4444",
  IN_PROGRESS: "#F59E0B",
};

export default function AdminBuilds() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedBuild, setExpandedBuild] = useState<string | null>(null);
  const [logs, setLogs] = useState<AgentLog[]>([]);

  const loadBuilds = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);

    fetch(`/api/admin/builds?${params}`)
      .then((r) => r.json())
      .then((data) => setBuilds(data.builds))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    loadBuilds();
  }, [loadBuilds]);

  async function loadLogs(buildId: string) {
    if (expandedBuild === buildId) {
      setExpandedBuild(null);
      return;
    }
    const res = await fetch(`/api/admin/builds/${buildId}/logs`);
    const data = await res.json();
    setLogs(data);
    setExpandedBuild(buildId);
  }

  async function retryBuild(buildId: string) {
    await fetch(`/api/admin/builds/${buildId}/retry`, { method: "POST" });
    loadBuilds();
  }

  const STATUSES = [
    "", "QUEUED", "IN_PROGRESS", "PREVIEW_READY", "APPROVED",
    "PUBLISHED", "FAILED", "QA_FAILED",
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-neutral-900">Build Queue</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: "#ffffff", border: "1.5px solid #E2E8F0", color: "#475569" }}
        >
          <option value="">All Statuses</option>
          {STATUSES.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "#E0E7FF", borderTopColor: "transparent" }} />
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                  {["Business", "Industry", "Status", "Agent", "Progress", "Cost", "Time", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              {builds.map((b) => {
                const st = getStatusStyle(b.status);
                return (
                  <tbody key={b.id}>
                    <tr className="cursor-pointer transition-colors" style={{ borderBottom: "1px solid #F8FAFC" }} onClick={() => loadLogs(b.id)}>
                      <td className="px-4 py-3 font-medium text-neutral-900">{b.businessName}</td>
                      <td className="px-4 py-3" style={{ color: "#64748B" }}>{b.industry}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: st.bg, color: st.color }}>{b.status}</span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#94A3B8" }}>{b.currentAgent ?? "---"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full" style={{ backgroundColor: "#F1F5F9" }}>
                            <div className="h-1.5 rounded-full" style={{ width: `${b.progress}%`, backgroundColor: "#4F46E5" }} />
                          </div>
                          <span className="text-[10px]" style={{ color: "#94A3B8" }}>{b.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#64748B" }}>${b.totalLlmCost.toFixed(4)}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#64748B" }}>{b.totalBuildTime}s</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {(b.status === "FAILED" || b.status === "QA_FAILED") && (
                            <button onClick={(e) => { e.stopPropagation(); retryBuild(b.id); }} className="rounded-lg px-2.5 py-1 text-xs font-medium text-white" style={{ backgroundColor: "#4F46E5" }}>Retry</button>
                          )}
                          {b.siteUrl && (
                            <a href={b.siteUrl} target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()} className="text-xs font-medium" style={{ color: "#4F46E5" }}>View</a>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedBuild === b.id && (
                      <tr>
                        <td colSpan={8} style={{ backgroundColor: "#F8FAFC" }}>
                          <div className="px-4 py-4">
                            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#94A3B8" }}>Agent Timeline</div>
                            {b.failureReason && (
                              <div className="mb-3 rounded-xl p-3 text-xs" style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>{b.failureReason}</div>
                            )}
                            <div className="space-y-1.5">
                              {logs.map((log) => (
                                <div key={log.id} className="flex items-center gap-3 text-xs">
                                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: LOG_DOT[log.status] ?? "#CBD5E1" }} />
                                  <span className="w-20 font-medium text-neutral-900">{log.agentName}</span>
                                  <span className="w-20" style={{ color: "#64748B" }}>{log.status}</span>
                                  <span className="w-16" style={{ color: "#94A3B8" }}>{log.durationMs ? `${(log.durationMs / 1000).toFixed(1)}s` : "---"}</span>
                                  <span className="w-20" style={{ color: "#94A3B8" }}>{log.llmModel ?? "---"}</span>
                                  {log.error && <span style={{ color: "#DC2626" }}>{log.error}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                );
              })}
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
