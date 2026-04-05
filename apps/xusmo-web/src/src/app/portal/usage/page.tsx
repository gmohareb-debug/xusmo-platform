"use client";

// =============================================================================
// Usage Dashboard — Metered usage display with progress bars
// =============================================================================

import { useEffect, useState } from "react";
import Link from "next/link";

interface UsageMetric {
  key: string;
  label: string;
  used: number;
  limit: number;
  icon: string;
  resetsMonthly?: boolean;
}

interface UsageData {
  planName: string;
  metrics: UsageMetric[];
  featureFlags: Record<string, boolean>;
}

const ICON_PATHS: Record<string, string> = {
  globe: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
  store: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z",
  package: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  "shopping-cart": "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z",
};

function getBarColor(percent: number): string {
  if (percent >= 90) return "#DC2626";
  if (percent >= 70) return "#D97706";
  return "#16A34A";
}

export default function UsagePage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tenant/usage")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-sm" style={{ color: "#94A3B8" }}>Unable to load usage data.</p>
      </div>
    );
  }

  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysUntilReset = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const flags = Object.entries(data.featureFlags as Record<string, boolean>);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
        Usage
      </h1>
      <p className="text-sm mb-6" style={{ color: "#94A3B8" }}>
        Current plan: <span className="font-semibold capitalize" style={{ color: "#4F46E5" }}>{data.planName}</span>
      </p>

      {/* Usage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {data.metrics.map((m) => {
          const isUnlimited = m.limit === 0;
          const percent = isUnlimited ? 0 : Math.min(100, Math.round((m.used / m.limit) * 100));
          const barColor = getBarColor(percent);
          const iconPath = ICON_PATHS[m.icon] ?? ICON_PATHS.globe;

          return (
            <div
              key={m.key}
              className="rounded-2xl p-5"
              style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "#EEF2FF" }}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#4F46E5"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-neutral-900">{m.label}</div>
                  {m.resetsMonthly && (
                    <div className="text-xs" style={{ color: "#94A3B8" }}>
                      Resets in {daysUntilReset} days
                    </div>
                  )}
                </div>
              </div>

              {/* Count */}
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-2xl font-bold text-neutral-900">{m.used}</span>
                <span className="text-sm" style={{ color: "#94A3B8" }}>
                  / {isUnlimited ? "\u221E" : m.limit}
                </span>
              </div>

              {/* Progress Bar */}
              {!isUnlimited && (
                <>
                  <div
                    className="w-full h-2 rounded-full mb-2"
                    style={{ backgroundColor: "#F1F5F9" }}
                  >
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-medium" style={{ color: barColor }}>
                      {percent}% used
                    </span>
                    {percent >= 80 && (
                      <Link
                        href="/pricing"
                        className="text-xs font-semibold"
                        style={{ color: "#4F46E5" }}
                      >
                        Upgrade
                      </Link>
                    )}
                  </div>
                </>
              )}

              {isUnlimited && (
                <div className="text-xs font-medium" style={{ color: "#16A34A" }}>
                  Unlimited on your plan
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Feature Flags */}
      {flags.length > 0 && (
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}
        >
          <h2 className="font-display text-lg font-semibold text-neutral-900 mb-4">
            Feature Access
          </h2>
          <div className="space-y-3">
            {flags.map(([key, enabled]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm capitalize" style={{ color: "#1E293B" }}>
                  {key.replace(/_/g, " ")}
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: enabled ? "#F0FDF4" : "#FEF2F2",
                    color: enabled ? "#16A34A" : "#DC2626",
                  }}
                >
                  {enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
