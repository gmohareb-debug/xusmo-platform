"use client";

// =============================================================================
// Admin Analytics — Charts and metrics, light theme
// =============================================================================

import { useEffect, useState } from "react";

interface AnalyticsData {
  buildsByIndustry: Array<{ industry: string; count: number }>;
  buildsByArchetype: Array<{ archetype: string; count: number }>;
  buildsByStatus: Array<{ status: string; count: number }>;
  recentBuildsPerDay: Array<{ date: string; count: number }>;
  avgBuildDuration: number;
  totalLlmCost: number;
  totalBuilds: number;
}

const STATUS_BAR_COLORS: Record<string, string> = {
  QUEUED: "#94A3B8",
  IN_PROGRESS: "#6366F1",
  PREVIEW_READY: "#22C55E",
  APPROVED: "#059669",
  PUBLISHED: "#16A34A",
  FAILED: "#EF4444",
  QA_FAILED: "#F59E0B",
};

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/builds?limit=100").then((r) => r.json()),
    ])
      .then(([stats, buildsData]) => {
        const builds = buildsData.builds ?? [];

        const industryMap = new Map<string, number>();
        const archetypeMap = new Map<string, number>();
        const statusMap = new Map<string, number>();
        const dayMap = new Map<string, number>();

        for (const b of builds) {
          industryMap.set(b.industry, (industryMap.get(b.industry) ?? 0) + 1);
          archetypeMap.set(b.archetype, (archetypeMap.get(b.archetype) ?? 0) + 1);
          statusMap.set(b.status, (statusMap.get(b.status) ?? 0) + 1);
          const day = new Date(b.createdAt).toISOString().slice(0, 10);
          dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
        }

        setData({
          buildsByIndustry: [...industryMap.entries()].map(([industry, count]) => ({ industry, count })).sort((a, b) => b.count - a.count).slice(0, 10),
          buildsByArchetype: [...archetypeMap.entries()].map(([archetype, count]) => ({ archetype, count })).sort((a, b) => b.count - a.count),
          buildsByStatus: [...statusMap.entries()].map(([status, count]) => ({ status, count })).sort((a, b) => b.count - a.count),
          recentBuildsPerDay: [...dayMap.entries()].map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)).slice(-14),
          avgBuildDuration: stats.avgBuildTime ?? 0,
          totalLlmCost: builds.reduce((sum: number, b: { totalLlmCost: number }) => sum + b.totalLlmCost, 0),
          totalBuilds: buildsData.pagination?.total ?? builds.length,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "#E0E7FF", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!data) {
    return <div style={{ color: "#DC2626" }}>Failed to load analytics.</div>;
  }

  const maxIndustryCount = Math.max(...data.buildsByIndustry.map((b) => b.count), 1);
  const maxDayCount = Math.max(...data.recentBuildsPerDay.map((d) => d.count), 1);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h2 className="font-display text-2xl font-bold text-neutral-900">Analytics</h2>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Builds", value: data.totalBuilds, iconBg: "#EEF2FF", iconColor: "#4F46E5", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
          { label: "Total LLM Cost", value: `$${data.totalLlmCost.toFixed(4)}`, iconBg: "#FFFBEB", iconColor: "#D97706", icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" },
          { label: "Avg Build Duration", value: `${data.avgBuildDuration}s`, iconBg: "#F0FDF4", iconColor: "#16A34A", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5" style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: s.iconBg }}>
                <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke={s.iconColor} strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                </svg>
              </div>
              <span className="text-xs font-medium" style={{ color: "#94A3B8" }}>{s.label}</span>
            </div>
            <div className="text-2xl font-bold text-neutral-900">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Builds by Industry */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}>
          <h3 className="font-display text-base font-semibold text-neutral-900 mb-4">Builds by Industry</h3>
          <div className="space-y-2.5">
            {data.buildsByIndustry.map((b) => (
              <div key={b.industry} className="flex items-center gap-3 text-sm">
                <span className="w-24 truncate text-xs" style={{ color: "#64748B" }}>{b.industry}</span>
                <div className="flex-1">
                  <div className="h-3 rounded-full" style={{ backgroundColor: "#F1F5F9" }}>
                    <div className="h-3 rounded-full" style={{ width: `${(b.count / maxIndustryCount) * 100}%`, backgroundColor: "#4F46E5" }} />
                  </div>
                </div>
                <span className="w-8 text-right text-xs font-medium" style={{ color: "#64748B" }}>{b.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Builds by Status */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}>
          <h3 className="font-display text-base font-semibold text-neutral-900 mb-4">Builds by Status</h3>
          <div className="space-y-2.5">
            {data.buildsByStatus.map((b) => {
              const maxStatus = Math.max(...data.buildsByStatus.map((s) => s.count), 1);
              const barColor = STATUS_BAR_COLORS[b.status] ?? "#94A3B8";
              return (
                <div key={b.status} className="flex items-center gap-3 text-sm">
                  <span className="w-28 truncate text-xs" style={{ color: "#64748B" }}>{b.status}</span>
                  <div className="flex-1">
                    <div className="h-3 rounded-full" style={{ backgroundColor: "#F1F5F9" }}>
                      <div className="h-3 rounded-full" style={{ width: `${(b.count / maxStatus) * 100}%`, backgroundColor: barColor }} />
                    </div>
                  </div>
                  <span className="w-8 text-right text-xs font-medium" style={{ color: "#64748B" }}>{b.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Builds per Day */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}>
          <h3 className="font-display text-base font-semibold text-neutral-900 mb-4">Builds per Day (Last 14 Days)</h3>
          <div className="flex items-end gap-1" style={{ height: 120 }}>
            {data.recentBuildsPerDay.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium" style={{ color: "#64748B" }}>{d.count || ""}</span>
                <div
                  className="w-full rounded-t"
                  style={{
                    height: `${(d.count / maxDayCount) * 80}px`,
                    minHeight: d.count > 0 ? 4 : 0,
                    backgroundColor: "#4F46E5",
                  }}
                />
                <span className="text-[8px]" style={{ color: "#CBD5E1", transform: "rotate(-45deg)", display: "block", whiteSpace: "nowrap" }}>
                  {d.date.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Archetype Distribution */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}>
          <h3 className="font-display text-base font-semibold text-neutral-900 mb-4">Builds by Archetype</h3>
          <div className="space-y-3">
            {data.buildsByArchetype.map((a) => {
              const pct = data.totalBuilds > 0 ? Math.round((a.count / data.totalBuilds) * 100) : 0;
              return (
                <div key={a.archetype} className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-neutral-900">{a.archetype}</span>
                    <span className="text-xs" style={{ color: "#94A3B8" }}>{a.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ backgroundColor: "#F1F5F9" }}>
                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: "#10B981" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
