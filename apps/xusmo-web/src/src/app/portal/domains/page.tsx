"use client";

// =============================================================================
// Domains Page — Domain management, DNS instructions, domain list
// =============================================================================

import { useState, useEffect } from "react";

interface DomainInfo {
  id: string;
  domainName: string;
  status: string;
  siteId: string | null;
  siteName: string | null;
  dnsConfigured: boolean;
  sslActive: boolean;
  purchaseType: string;
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<DomainInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/portal/domains");
        if (res.ok) setDomains(await res.json());
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
    <div className="max-w-3xl mx-auto">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 mb-6">
        Domains
      </h1>

      {/* BYOD instructions */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}
      >
        <div className="flex items-start gap-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: "#EEF2FF" }}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#4F46E5"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="font-display text-lg font-semibold text-neutral-900 mb-1">
              Connect Your Own Domain
            </h2>
            <p className="text-sm mb-4" style={{ color: "#94A3B8" }}>
              Already have a domain? Point it to your Xusmo site with these DNS settings.
            </p>

            <div
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #E2E8F0" }}
            >
              {/* Header */}
              <div
                className="flex text-xs font-semibold uppercase tracking-wider px-4 py-2.5"
                style={{ backgroundColor: "#F8FAFC", color: "#94A3B8" }}
              >
                <span className="w-1/3">Type</span>
                <span className="w-1/3">Name</span>
                <span className="w-1/3">Value</span>
              </div>
              {/* A Record */}
              <div
                className="flex items-center px-4 py-3 text-sm"
                style={{ borderTop: "1px solid #F1F5F9" }}
              >
                <span className="w-1/3">
                  <span
                    className="rounded-md px-2 py-0.5 text-xs font-mono font-medium"
                    style={{ backgroundColor: "#EEF2FF", color: "#4F46E5" }}
                  >
                    A
                  </span>
                </span>
                <span className="w-1/3 font-mono text-xs" style={{ color: "#64748B" }}>
                  @
                </span>
                <span className="w-1/3 font-mono text-xs text-neutral-900">
                  Your server IP
                </span>
              </div>
              {/* CNAME */}
              <div
                className="flex items-center px-4 py-3 text-sm"
                style={{ borderTop: "1px solid #F1F5F9" }}
              >
                <span className="w-1/3">
                  <span
                    className="rounded-md px-2 py-0.5 text-xs font-mono font-medium"
                    style={{ backgroundColor: "#FFFBEB", color: "#D97706" }}
                  >
                    CNAME
                  </span>
                </span>
                <span className="w-1/3 font-mono text-xs" style={{ color: "#64748B" }}>
                  www
                </span>
                <span className="w-1/3 font-mono text-xs text-neutral-900">
                  your-site.xusmo.io
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs" style={{ color: "#CBD5E1" }}>
              DNS changes typically take 24-48 hours to propagate worldwide.
            </p>
          </div>
        </div>
      </div>

      {/* Domain list */}
      {domains.length === 0 ? (
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
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
          <p className="mb-2 font-display text-lg font-semibold text-neutral-900">
            No domains configured
          </p>
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Domains can be connected after your site is built and a plan is selected.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {domains.map((domain) => (
            <div
              key={domain.id}
              className="rounded-2xl p-5"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #E2E8F0",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <h3 className="font-display font-semibold text-neutral-900 truncate">
                    {domain.domainName}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                    {domain.siteName ?? "Unlinked"} &middot;{" "}
                    {domain.purchaseType === "BYOD"
                      ? "Your domain"
                      : "Xusmo domain"}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0 ml-4">
                  {/* DNS status */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: domain.dnsConfigured ? "#22C55E" : "#F59E0B",
                      }}
                    />
                    <span style={{ color: "#64748B" }}>
                      DNS {domain.dnsConfigured ? "Active" : "Pending"}
                    </span>
                  </div>

                  {/* SSL status */}
                  <div className="hidden sm:flex items-center gap-1.5 text-xs">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: domain.sslActive ? "#22C55E" : "#CBD5E1",
                      }}
                    />
                    <span style={{ color: "#64748B" }}>
                      SSL {domain.sslActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Status badge */}
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: domain.status === "ACTIVE" ? "#F0FDF4" : "#FFFBEB",
                      color: domain.status === "ACTIVE" ? "#16A34A" : "#D97706",
                    }}
                  >
                    {domain.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
