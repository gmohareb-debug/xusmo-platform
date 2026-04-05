"use client";

// =============================================================================
// Activity Log — Filterable, paginated event log with expandable details
// =============================================================================

import React, { useEffect, useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ActivityEntry {
  id: string;
  createdAt: string;
  action: string;
  category: string;
  severity: string;
  siteId?: string | null;
  message: string;
  metadata?: Record<string, unknown> | null;
}

interface ActivityResponse {
  logs: ActivityEntry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SEVERITY_STYLES: Record<string, { bg: string; color: string }> = {
  info: { bg: "#EEF2FF", color: "#4F46E5" },
  warning: { bg: "#FFFBEB", color: "#D97706" },
  critical: { bg: "#FEF2F2", color: "#DC2626" },
};

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  agent: { bg: "#F0FDF4", color: "#16A34A" },
  plugin: { bg: "#EEF2FF", color: "#4F46E5" },
  health: { bg: "#FFFBEB", color: "#D97706" },
  backup: { bg: "#F0F9FF", color: "#0284C7" },
  security: { bg: "#FEF2F2", color: "#DC2626" },
  build: { bg: "#F5F3FF", color: "#7C3AED" },
  user: { bg: "#FFF7ED", color: "#EA580C" },
  system: { bg: "#F1F5F9", color: "#64748B" },
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminActivity() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [siteFilter, setSiteFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Expanded row
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    params.set("page", String(page));
    if (categoryFilter) params.set("category", categoryFilter);
    if (severityFilter) params.set("severity", severityFilter);
    if (siteFilter) params.set("siteId", siteFilter);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);

    fetch(`/api/admin/activity?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load activity log");
        return r.json();
      })
      .then((data: ActivityResponse) => {
        setEntries(data.logs ?? []);
        setTotalPages(data.pagination?.totalPages ?? 1);
        setTotal(data.pagination?.total ?? 0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, categoryFilter, severityFilter, siteFilter, dateFrom, dateTo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [categoryFilter, severityFilter, siteFilter, dateFrom, dateTo]);

  const CATEGORIES = [
    "",
    "agent",
    "plugin",
    "health",
    "backup",
    "security",
    "build",
    "user",
    "system",
  ];

  const SEVERITIES = ["", "info", "warning", "critical"];

  // Page range for pagination
  function getPageRange(): number[] {
    const range: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-neutral-900">
          Activity Log
        </h2>
        <span className="text-sm" style={{ color: "#94A3B8" }}>
          {total} total entries
        </span>
      </div>

      {/* ================================================================= */}
      {/* Filter Bar                                                         */}
      {/* ================================================================= */}
      <div
        className="rounded-2xl p-4"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #E2E8F0",
        }}
      >
        <div className="flex flex-wrap gap-3 items-end">
          {/* Category */}
          <div>
            <label
              className="block text-[11px] font-medium mb-1"
              style={{ color: "#94A3B8" }}
            >
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: "#ffffff",
                border: "1.5px solid #E2E8F0",
                color: "#475569",
                minWidth: "130px",
              }}
            >
              <option value="">All Categories</option>
              {CATEGORIES.filter(Boolean).map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label
              className="block text-[11px] font-medium mb-1"
              style={{ color: "#94A3B8" }}
            >
              Severity
            </label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: "#ffffff",
                border: "1.5px solid #E2E8F0",
                color: "#475569",
                minWidth: "130px",
              }}
            >
              <option value="">All Severities</option>
              {SEVERITIES.filter(Boolean).map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Date from */}
          <div>
            <label
              className="block text-[11px] font-medium mb-1"
              style={{ color: "#94A3B8" }}
            >
              From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: "#ffffff",
                border: "1.5px solid #E2E8F0",
                color: "#475569",
              }}
            />
          </div>

          {/* Date to */}
          <div>
            <label
              className="block text-[11px] font-medium mb-1"
              style={{ color: "#94A3B8" }}
            >
              To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: "#ffffff",
                border: "1.5px solid #E2E8F0",
                color: "#475569",
              }}
            />
          </div>

          {/* Site filter */}
          <div>
            <label
              className="block text-[11px] font-medium mb-1"
              style={{ color: "#94A3B8" }}
            >
              Site
            </label>
            <input
              type="text"
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              placeholder="Filter by site..."
              className="rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: "#ffffff",
                border: "1.5px solid #E2E8F0",
                color: "#1E293B",
                minWidth: "150px",
              }}
            />
          </div>

          {/* Clear filters */}
          {(categoryFilter ||
            severityFilter ||
            siteFilter ||
            dateFrom ||
            dateTo) && (
            <button
              onClick={() => {
                setCategoryFilter("");
                setSeverityFilter("");
                setSiteFilter("");
                setDateFrom("");
                setDateTo("");
              }}
              className="rounded-xl px-3 py-2 text-xs font-medium"
              style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
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
      )}

      {/* ================================================================= */}
      {/* Activity Table                                                     */}
      {/* ================================================================= */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: "#E0E7FF", borderTopColor: "transparent" }}
          />
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #E2E8F0",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                  {[
                    "Timestamp",
                    "Action",
                    "Category",
                    "Severity",
                    "Site",
                    "Message",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "#94A3B8" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-sm"
                      style={{ color: "#94A3B8" }}
                    >
                      No activity entries found.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => {
                    const sevSt =
                      SEVERITY_STYLES[entry.severity] ?? SEVERITY_STYLES.info;
                    const catSt =
                      CATEGORY_COLORS[entry.category] ??
                      CATEGORY_COLORS.system;
                    const isExpanded = expandedId === entry.id;

                    return (
                      <React.Fragment key={entry.id}>
                        <tr
                          className="cursor-pointer transition-colors"
                          style={{
                            borderBottom: "1px solid #F8FAFC",
                            backgroundColor: isExpanded
                              ? "#FAFBFE"
                              : "transparent",
                          }}
                          onClick={() =>
                            setExpandedId(isExpanded ? null : entry.id)
                          }
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div
                              className="text-xs font-medium text-neutral-900"
                              title={formatDate(entry.createdAt)}
                            >
                              {relativeTime(entry.createdAt)}
                            </div>
                            <div
                              className="text-[10px]"
                              style={{ color: "#CBD5E1" }}
                            >
                              {formatDate(entry.createdAt)}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium text-neutral-900">
                            {entry.action}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                              style={{
                                backgroundColor: catSt.bg,
                                color: catSt.color,
                              }}
                            >
                              {entry.category}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                              style={{
                                backgroundColor: sevSt.bg,
                                color: sevSt.color,
                              }}
                            >
                              {entry.severity}
                            </span>
                          </td>
                          <td
                            className="px-4 py-3 text-xs"
                            style={{ color: "#64748B" }}
                          >
                            {entry.siteId ?? "---"}
                          </td>
                          <td
                            className="px-4 py-3 text-xs max-w-xs"
                            style={{ color: "#64748B" }}
                          >
                            {truncateText(entry.message, 80)}
                          </td>
                        </tr>

                        {/* Expanded details */}
                        {isExpanded && (
                          <tr>
                            <td
                              colSpan={6}
                              style={{ backgroundColor: "#F8FAFC" }}
                            >
                              <div className="px-4 py-4">
                                <div className="mb-3">
                                  <div
                                    className="text-[11px] font-semibold uppercase tracking-wider mb-1"
                                    style={{ color: "#94A3B8" }}
                                  >
                                    Full Message
                                  </div>
                                  <p className="text-sm text-neutral-900">
                                    {entry.message}
                                  </p>
                                </div>

                                {entry.metadata &&
                                  Object.keys(entry.metadata).length > 0 && (
                                    <div>
                                      <div
                                        className="text-[11px] font-semibold uppercase tracking-wider mb-1"
                                        style={{ color: "#94A3B8" }}
                                      >
                                        Metadata
                                      </div>
                                      <pre
                                        className="rounded-xl p-3 text-xs overflow-x-auto"
                                        style={{
                                          backgroundColor: "#1E293B",
                                          color: "#E2E8F0",
                                        }}
                                      >
                                        {JSON.stringify(
                                          entry.metadata,
                                          null,
                                          2
                                        )}
                                      </pre>
                                    </div>
                                  )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* Pagination                                                         */}
      {/* ================================================================= */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          {/* Previous */}
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-40 transition-all"
            style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}
          >
            Prev
          </button>

          {/* Page numbers */}
          {getPageRange().map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                backgroundColor: p === page ? "#4F46E5" : "#F1F5F9",
                color: p === page ? "#ffffff" : "#64748B",
              }}
            >
              {p}
            </button>
          ))}

          {/* Next */}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-40 transition-all"
            style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
