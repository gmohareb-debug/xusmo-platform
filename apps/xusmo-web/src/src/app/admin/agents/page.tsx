"use client";

// =============================================================================
// Admin Agents — Pending approvals queue + agent cards with stats and controls
// =============================================================================

import { useEffect, useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PendingApproval {
  id: string;
  action: string;
  reason: string;
  priority: "CRITICAL" | "URGENT" | "NORMAL" | "LOW";
  agent: { name: string; displayName: string };
  createdAt: string;
}

interface AgentLastRun {
  status: string;
  completedAt: string | null;
  startedAt: string;
  sitesChecked: number;
  issuesFound: number;
  autoFixed: number;
  escalated: number;
}

interface Agent {
  id: string;
  name: string;
  displayName: string;
  description: string;
  schedule: string | null;
  isEnabled: boolean;
  lastRun: AgentLastRun | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PRIORITY_STYLES: Record<
  string,
  { bg: string; color: string; border: string }
> = {
  CRITICAL: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  URGENT: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
  NORMAL: { bg: "#EEF2FF", color: "#4F46E5", border: "#C7D2FE" },
  LOW: { bg: "#F1F5F9", color: "#64748B", border: "#E2E8F0" },
};

const RUN_STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  COMPLETED: { bg: "#F0FDF4", color: "#16A34A" },
  FAILED: { bg: "#FEF2F2", color: "#DC2626" },
  STARTED: { bg: "#EEF2FF", color: "#4F46E5" },
};

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminAgents() {
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError("");

    Promise.all([
      fetch("/api/admin/agents/approvals").then((r) => {
        if (!r.ok) throw new Error("Failed to load approvals");
        return r.json();
      }),
      fetch("/api/admin/agents").then((r) => {
        if (!r.ok) throw new Error("Failed to load agents");
        return r.json();
      }),
    ])
      .then(([approvalsData, agentsData]) => {
        setApprovals(approvalsData.approvals ?? approvalsData);
        setAgents(agentsData.agents ?? agentsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleApproval(approvalId: string, action: "approve" | "dismiss") {
    setActionLoading(`${approvalId}-${action}`);
    try {
      await fetch(`/api/admin/agents/approvals/${approvalId}/${action}`, {
        method: "POST",
      });
      setApprovals((prev) => prev.filter((a) => a.id !== approvalId));
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  }

  async function handleToggleAgent(agentName: string, agentId: string, currentEnabled: boolean) {
    setActionLoading(`toggle-${agentId}`);
    try {
      await fetch(`/api/admin/agents/${agentName}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !currentEnabled }),
      });
      setAgents((prev) =>
        prev.map((a) =>
          a.id === agentId ? { ...a, isEnabled: !currentEnabled } : a
        )
      );
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRunNow(agentName: string, agentId: string) {
    setActionLoading(`run-${agentId}`);
    try {
      await fetch(`/api/admin/agents/${agentName}/run`, { method: "POST" });
      loadData();
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "#E0E7FF", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-2xl p-4"
        style={{
          backgroundColor: "#FEF2F2",
          border: "1px solid #FECACA",
          color: "#DC2626",
        }}
      >
        {error}
      </div>
    );
  }

  // Sort approvals so CRITICAL/URGENT come first
  const priorityOrder = { CRITICAL: 0, URGENT: 1, NORMAL: 2, LOW: 3 };
  const sortedApprovals = [...approvals].sort(
    (a, b) =>
      (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h2 className="font-display text-2xl font-bold text-neutral-900">
        Agents
      </h2>

      {/* ================================================================= */}
      {/* Pending Approvals                                                  */}
      {/* ================================================================= */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-display text-base font-semibold text-neutral-900">
            Pending Approvals
          </h3>
          {approvals.length > 0 && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}
            >
              {approvals.length}
            </span>
          )}
        </div>

        {sortedApprovals.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #E2E8F0",
            }}
          >
            <svg
              className="mx-auto h-10 w-10 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#CBD5E1"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              No pending approvals. All clear!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedApprovals.map((approval) => {
              const pStyle =
                PRIORITY_STYLES[approval.priority] ?? PRIORITY_STYLES.NORMAL;
              const isHighPriority =
                approval.priority === "CRITICAL" ||
                approval.priority === "URGENT";

              return (
                <div
                  key={approval.id}
                  className="rounded-2xl p-5"
                  style={{
                    backgroundColor: "#ffffff",
                    border: `1.5px solid ${isHighPriority ? pStyle.border : "#E2E8F0"}`,
                    boxShadow: isHighPriority
                      ? `0 0 0 1px ${pStyle.border}`
                      : "none",
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{
                            backgroundColor: pStyle.bg,
                            color: pStyle.color,
                          }}
                        >
                          {approval.priority}
                        </span>
                        <span className="text-sm font-semibold text-neutral-900">
                          {approval.action}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: "#64748B" }}>
                        {approval.reason}
                      </p>
                      <p
                        className="text-[11px] mt-1"
                        style={{ color: "#CBD5E1" }}
                      >
                        From {approval.agent?.displayName ?? "Agent"} &middot;{" "}
                        {relativeTime(approval.createdAt)}
                      </p>
                    </div>

                    <div className="flex gap-1.5 shrink-0 ml-4">
                      <button
                        onClick={() =>
                          handleApproval(approval.id, "approve")
                        }
                        disabled={
                          actionLoading === `${approval.id}-approve`
                        }
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                        style={{ backgroundColor: "#4F46E5" }}
                      >
                        {actionLoading === `${approval.id}-approve`
                          ? "..."
                          : "Approve"}
                      </button>
                      <button
                        onClick={() =>
                          handleApproval(approval.id, "dismiss")
                        }
                        disabled={
                          actionLoading === `${approval.id}-dismiss`
                        }
                        className="rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                        style={{
                          backgroundColor: "#F1F5F9",
                          color: "#64748B",
                        }}
                      >
                        {actionLoading === `${approval.id}-dismiss`
                          ? "..."
                          : "Dismiss"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* Agent Cards Grid                                                   */}
      {/* ================================================================= */}
      <div>
        <h3 className="font-display text-base font-semibold text-neutral-900 mb-4">
          Agent Fleet
        </h3>

        {agents.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #E2E8F0",
            }}
          >
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              No agents configured.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => {
              const runSt = agent.lastRun
                ? RUN_STATUS_STYLES[agent.lastRun.status] ??
                  RUN_STATUS_STYLES.success
                : null;

              return (
                <div
                  key={agent.id}
                  className="rounded-2xl p-5"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #E2E8F0",
                    opacity: agent.isEnabled ? 1 : 0.6,
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-900">
                        {agent.displayName}
                      </h4>
                      <p
                        className="text-[11px] mt-0.5"
                        style={{ color: "#94A3B8" }}
                      >
                        {agent.schedule ?? "No schedule"}
                      </p>
                    </div>

                    {/* Toggle */}
                    <button
                      onClick={() =>
                        handleToggleAgent(agent.name, agent.id, agent.isEnabled)
                      }
                      disabled={actionLoading === `toggle-${agent.id}`}
                      className="relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-50"
                      style={{
                        backgroundColor: agent.isEnabled
                          ? "#4F46E5"
                          : "#CBD5E1",
                      }}
                      aria-label={`Toggle ${agent.displayName}`}
                    >
                      <span
                        className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
                        style={{
                          transform: agent.isEnabled
                            ? "translate(17px, 2px)"
                            : "translate(2px, 2px)",
                        }}
                      />
                    </button>
                  </div>

                  {/* Description */}
                  {agent.description && (
                    <p
                      className="text-xs mb-3"
                      style={{ color: "#64748B" }}
                    >
                      {agent.description}
                    </p>
                  )}

                  {/* Last run status */}
                  {agent.lastRun ? (
                    <div
                      className="rounded-xl p-3 mb-3"
                      style={{ backgroundColor: "#F8FAFC" }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{
                            backgroundColor: runSt?.bg ?? "#F1F5F9",
                            color: runSt?.color ?? "#64748B",
                          }}
                        >
                          {agent.lastRun.status}
                        </span>
                        <span
                          className="text-[10px]"
                          style={{ color: "#CBD5E1" }}
                        >
                          {relativeTime(agent.lastRun.completedAt ?? agent.lastRun.startedAt)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span style={{ color: "#94A3B8" }}>Checked</span>
                          <span className="font-medium text-neutral-900">
                            {agent.lastRun.sitesChecked}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span style={{ color: "#94A3B8" }}>Issues</span>
                          <span
                            className="font-medium"
                            style={{
                              color:
                                agent.lastRun.issuesFound > 0
                                  ? "#D97706"
                                  : "#16A34A",
                            }}
                          >
                            {agent.lastRun.issuesFound}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span style={{ color: "#94A3B8" }}>Auto-fixed</span>
                          <span className="font-medium text-neutral-900">
                            {agent.lastRun.autoFixed}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span style={{ color: "#94A3B8" }}>Escalated</span>
                          <span
                            className="font-medium"
                            style={{
                              color:
                                agent.lastRun.escalated > 0
                                  ? "#DC2626"
                                  : "#16A34A",
                            }}
                          >
                            {agent.lastRun.escalated}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="rounded-xl p-3 mb-3 text-center"
                      style={{ backgroundColor: "#F8FAFC" }}
                    >
                      <p className="text-[11px]" style={{ color: "#CBD5E1" }}>
                        No runs yet
                      </p>
                    </div>
                  )}

                  {/* Run now button */}
                  <button
                    onClick={() => handleRunNow(agent.name, agent.id)}
                    disabled={
                      actionLoading === `run-${agent.id}` || !agent.isEnabled
                    }
                    className="w-full rounded-xl py-2 text-xs font-semibold transition-all duration-200 disabled:opacity-50"
                    style={{
                      backgroundColor: "#EEF2FF",
                      color: "#4F46E5",
                    }}
                  >
                    {actionLoading === `run-${agent.id}`
                      ? "Running..."
                      : "Run Now"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
