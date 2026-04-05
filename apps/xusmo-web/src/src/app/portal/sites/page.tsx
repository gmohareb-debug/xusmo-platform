"use client";

// =============================================================================
// My Sites — Card/accordion list of user sites with details
// =============================================================================

import { useState, useEffect } from "react";
import Link from "next/link";

interface SiteDetail {
  id: string;
  businessName: string;
  status: string;
  wpUrl: string | null;
  tier: string;
  archetype: string;
  createdAt: string;
  updatedAt: string;
  pages: Array<{ slug: string; title: string }>;
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

export default function SitesPage() {
  const [sites, setSites] = useState<SiteDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/portal/sites");
        if (res.ok) setSites(await res.json());
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

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900">
          My Sites
        </h1>
        <Link
          href="/interview"
          className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
          style={{ backgroundColor: "#4F46E5" }}
        >
          Build New Site
        </Link>
      </div>

      {sites.length === 0 ? (
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
          </div>
          <p className="mb-2 font-display text-lg font-semibold text-neutral-900">
            No sites yet
          </p>
          <p className="mb-6 text-sm" style={{ color: "#94A3B8" }}>
            You haven&apos;t built any sites yet.
          </p>
          <Link
            href="/interview"
            className="inline-block rounded-xl px-6 py-3 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{ backgroundColor: "#4F46E5" }}
          >
            Build Your First Site
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sites.map((site) => {
            const st = getStatusStyle(site.status);
            const expanded = expandedId === site.id;

            return (
              <div
                key={site.id}
                className="rounded-2xl overflow-hidden transition-all duration-200"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #E2E8F0",
                }}
              >
                {/* Header row — clickable */}
                <div
                  className="flex cursor-pointer items-center justify-between p-5"
                  onClick={() => setExpandedId(expanded ? null : site.id)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Site icon */}
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: "#F8FAFC" }}
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="#94A3B8"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-semibold text-neutral-900 truncate">
                        {site.businessName}
                      </h3>
                      <p className="text-xs truncate" style={{ color: "#94A3B8" }}>
                        {site.wpUrl ?? "No URL yet"} &middot; {site.archetype}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <span
                      className="hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: st.bg, color: st.color }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: st.dot }}
                      />
                      {site.status}
                    </span>
                    <span
                      className="hidden md:inline text-xs font-medium"
                      style={{ color: "#94A3B8" }}
                    >
                      {site.tier}
                    </span>
                    <span
                      className="hidden md:inline text-xs"
                      style={{ color: "#CBD5E1" }}
                    >
                      {new Date(site.createdAt).toLocaleDateString()}
                    </span>
                    <svg
                      className="h-4 w-4 transition-transform duration-200"
                      style={{
                        color: "#94A3B8",
                        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded content */}
                {expanded && (
                  <div className="px-5 pb-5" style={{ borderTop: "1px solid #F1F5F9" }}>
                    <div className="pt-4">
                      {/* Mobile status badge */}
                      <div className="flex sm:hidden items-center gap-2 mb-4">
                        <span
                          className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: st.bg, color: st.color }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: st.dot }}
                          />
                          {site.status}
                        </span>
                        <span className="text-xs" style={{ color: "#94A3B8" }}>
                          {site.tier} &middot; {new Date(site.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Pages */}
                      <h4
                        className="mb-2 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "#94A3B8" }}
                      >
                        Pages ({site.pages.length})
                      </h4>
                      <div className="mb-5 flex flex-wrap gap-2">
                        {site.pages.map((p) => (
                          <span
                            key={p.slug}
                            className="rounded-lg px-2.5 py-1 text-xs font-medium"
                            style={{
                              backgroundColor: "#F1F5F9",
                              color: "#475569",
                            }}
                          >
                            {p.title}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        {site.wpUrl && (
                          <a
                            href={site.wpUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl px-4 py-2 text-sm font-medium transition-colors"
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
                            className="rounded-xl px-4 py-2 text-sm font-medium transition-colors"
                            style={{
                              backgroundColor: "#F1F5F9",
                              color: "#475569",
                            }}
                          >
                            WordPress Admin
                          </a>
                        )}
                        <Link
                          href="/pricing"
                          className="rounded-xl px-4 py-2 text-sm font-medium transition-colors"
                          style={{
                            backgroundColor: "#EEF2FF",
                            color: "#4F46E5",
                          }}
                        >
                          Upgrade Plan
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
