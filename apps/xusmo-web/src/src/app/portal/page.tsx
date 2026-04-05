"use client";

// =============================================================================
// Portal Dashboard — Welcome, stats, site cards, quick actions
// =============================================================================

import { useState, useEffect } from "react";
import Link from "next/link";

interface SiteSummary {
  id: string;
  businessName: string;
  status: string;
  wpUrl: string | null;
  tier: string;
  createdAt: string;
}

interface DashboardData {
  userName: string;
  totalSites: number;
  currentPlan: string | null;
  nextBillingDate: string | null;
  sites: SiteSummary[];
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
  LIVE: { bg: "#F0FDF4", color: "#16A34A", dot: "#22C55E" },
  STAGING: { bg: "#FFFBEB", color: "#D97706", dot: "#F59E0B" },
  BUILDING: { bg: "#EEF2FF", color: "#4F46E5", dot: "#6366F1" },
  REVIEW: { bg: "#EEF2FF", color: "#4F46E5", dot: "#6366F1" },
  DRAFT: { bg: "#F1F5F9", color: "#64748B", dot: "#94A3B8" },
};

function getStatusStyle(status: string) {
  return STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT;
}

export default function PortalDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/portal/dashboard");
        if (res.ok) setData(await res.json());
      } catch {
        // empty state
      } finally {
        setLoading(false);
      }
    }
    load();
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

  const stats = [
    {
      label: "Total Sites",
      value: data?.totalSites ?? 0,
      icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
      iconBg: "#EEF2FF",
      iconColor: "#4F46E5",
    },
    {
      label: "Current Plan",
      value: data?.currentPlan ?? "Free",
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      iconBg: "#F0FDF4",
      iconColor: "#16A34A",
    },
    {
      label: "Next Billing",
      value: data?.nextBillingDate
        ? new Date(data.nextBillingDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "---",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      iconBg: "#FFFBEB",
      iconColor: "#D97706",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900">
          {getGreeting()}
          {data?.userName ? `, ${data.userName}` : ""}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#64748B" }}>
          {formatDate(new Date())}
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
            style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: s.iconBg }}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={s.iconColor}
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                </svg>
              </div>
              <div>
                <div className="text-xs font-medium" style={{ color: "#94A3B8" }}>
                  {s.label}
                </div>
                <div className="text-xl font-bold text-neutral-900">{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sites section */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-neutral-900">
          Your Sites
        </h2>
        <Link
          href="/interview"
          className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
          style={{ backgroundColor: "#4F46E5" }}
        >
          Build New Site
        </Link>
      </div>

      {!data?.sites?.length ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{
            backgroundColor: "#ffffff",
            border: "2px dashed #E2E8F0",
          }}
        >
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "#EEF2FF" }}
          >
            <svg
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#4F46E5"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="mb-2 font-display text-lg font-semibold text-neutral-900">
            No sites yet
          </h3>
          <p className="mb-6 text-sm" style={{ color: "#94A3B8" }}>
            Build your first AI-powered website in minutes.
          </p>
          <Link
            href="/interview"
            className="inline-block rounded-xl px-6 py-3 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{ backgroundColor: "#4F46E5" }}
          >
            Get Started
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.sites.map((site) => {
            const st = getStatusStyle(site.status);
            return (
              <div
                key={site.id}
                className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #E2E8F0",
                }}
              >
                {/* Thumbnail placeholder */}
                <div
                  className="mb-4 h-32 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#F8FAFC" }}
                >
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#CBD5E1"
                    strokeWidth={1}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-display font-semibold text-neutral-900 truncate pr-2">
                    {site.businessName}
                  </h3>
                  <span
                    className="shrink-0 flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: st.bg, color: st.color }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: st.dot }}
                    />
                    {site.status}
                  </span>
                </div>

                <p className="mb-4 text-xs" style={{ color: "#94A3B8" }}>
                  {site.tier} plan
                </p>

                <div className="flex gap-2">
                  {site.wpUrl && (
                    <a
                      href={site.wpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: "#F1F5F9",
                        color: "#475569",
                      }}
                    >
                      Visit Site
                    </a>
                  )}
                  {site.wpUrl && (
                    <a
                      href={`${site.wpUrl}/wp-admin`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: "#F1F5F9",
                        color: "#475569",
                      }}
                    >
                      WP Admin
                    </a>
                  )}
                  <Link
                    href={`/portal/sites?id=${site.id}`}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                    style={{
                      color: "#4F46E5",
                      backgroundColor: "#EEF2FF",
                    }}
                  >
                    Manage
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Build new site card */}
          <Link
            href="/interview"
            className="flex flex-col items-center justify-center rounded-2xl p-5 text-center transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: "#ffffff",
              border: "2px dashed #E2E8F0",
              minHeight: "240px",
            }}
          >
            <div
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "#EEF2FF" }}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#4F46E5"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-sm font-medium" style={{ color: "#4F46E5" }}>
              Build New Site
            </span>
          </Link>
        </div>
      )}

      {/* Quick actions */}
      <div className="mt-10">
        <h2 className="font-display text-lg font-semibold text-neutral-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Connect a Domain",
              desc: "Point your custom domain to your site",
              href: "/portal/domains",
              icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
              iconBg: "#EEF2FF",
              iconColor: "#4F46E5",
            },
            {
              label: "Upgrade Your Plan",
              desc: "Unlock more features and capacity",
              href: "/pricing",
              icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
              iconBg: "#F0FDF4",
              iconColor: "#16A34A",
            },
            {
              label: "Get Help",
              desc: "Browse FAQs or contact our team",
              href: "/portal/support",
              icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
              iconBg: "#FFFBEB",
              iconColor: "#D97706",
            },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-4 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
              style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: action.iconBg }}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={action.iconColor}
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-neutral-900">{action.label}</div>
                <div className="text-xs" style={{ color: "#94A3B8" }}>
                  {action.desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
