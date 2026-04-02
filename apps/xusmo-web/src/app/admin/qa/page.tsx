"use client";

// =============================================================================
// Admin QA Review Queue — light theme
// =============================================================================

import { useEffect, useState } from "react";

interface FailedBuild {
  id: string;
  status: string;
  businessName: string;
  industry: string;
  failureReason: string | null;
  createdAt: string;
}

export default function AdminQA() {
  const [builds, setBuilds] = useState<FailedBuild[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/builds?status=QA_FAILED")
      .then((r) => r.json())
      .then((data) => setBuilds(data.builds ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function retryBuild(buildId: string) {
    await fetch(`/api/admin/builds/${buildId}/retry`, { method: "POST" });
    setBuilds((prev) => prev.filter((b) => b.id !== buildId));
  }

  async function overrideApprove(buildId: string) {
    await fetch(`/api/builds/${buildId}/approve`, { method: "POST" });
    setBuilds((prev) => prev.filter((b) => b.id !== buildId));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "#E0E7FF", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="font-display text-2xl font-bold text-neutral-900">QA Review Queue</h2>

      {builds.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}
        >
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "#F0FDF4" }}
          >
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="#22C55E" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-display font-semibold text-neutral-900 mb-1">All Clear</p>
          <p className="text-sm" style={{ color: "#94A3B8" }}>No failed QA builds to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {builds.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl p-5"
              style={{ backgroundColor: "#ffffff", border: "1px solid #FDE68A" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-semibold text-neutral-900">{b.businessName}</h3>
                  <p className="text-sm" style={{ color: "#64748B" }}>{b.industry}</p>
                  <p className="mt-1 text-xs" style={{ color: "#CBD5E1" }}>
                    {new Date(b.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: "#FFFBEB", color: "#D97706" }}
                >
                  QA_FAILED
                </span>
              </div>

              {b.failureReason && (
                <div
                  className="mt-4 rounded-xl p-3 text-xs font-mono whitespace-pre-wrap"
                  style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}
                >
                  {b.failureReason}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => retryBuild(b.id)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-white"
                  style={{ backgroundColor: "#4F46E5" }}
                >
                  Retry QA
                </button>
                <button
                  onClick={() => overrideApprove(b.id)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold"
                  style={{ backgroundColor: "#FFFBEB", color: "#D97706", border: "1px solid #FDE68A" }}
                >
                  Override & Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
