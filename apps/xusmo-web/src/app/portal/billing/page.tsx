"use client";

// =============================================================================
// Billing Page — Plan display, subscription management, billing history
// =============================================================================

import { useState, useEffect } from "react";
import Link from "next/link";

interface BillingData {
  hasSubscription: boolean;
  subscription: {
    id: string;
    status: string;
    planType: string;
    billingCycle: string;
    amount: number;
    currentPeriodEnd: string | null;
    canceledAt: string | null;
  } | null;
}

export default function BillingPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/billing/status");
        if (res.ok) setData(await res.json());
      } catch {
        // empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const result = await res.json();
      if (result.url) window.location.href = result.url;
    } catch {
      // ignore
    } finally {
      setPortalLoading(false);
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

  const sub = data?.subscription;

  const statusStyles: Record<string, { bg: string; color: string }> = {
    ACTIVE: { bg: "#F0FDF4", color: "#16A34A" },
    PAST_DUE: { bg: "#FFFBEB", color: "#D97706" },
    TRIALING: { bg: "#EEF2FF", color: "#4F46E5" },
    CANCELED: { bg: "#FEF2F2", color: "#DC2626" },
  };

  const subStatus = sub ? (statusStyles[sub.status] ?? { bg: "#F1F5F9", color: "#64748B" }) : null;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 mb-6">
        Billing
      </h1>

      {/* Current plan card */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}
      >
        <h2 className="font-display text-lg font-semibold text-neutral-900 mb-4">
          Current Plan
        </h2>
        {sub ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-display text-2xl font-bold text-neutral-900">
                {sub.planType}
              </span>
              {subStatus && (
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: subStatus.bg, color: subStatus.color }}
                >
                  {sub.status}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-neutral-900">
                ${sub.amount.toFixed(2)}
              </span>
              <span className="text-sm" style={{ color: "#94A3B8" }}>
                / {sub.billingCycle === "ANNUAL" ? "year" : "month"}
              </span>
            </div>

            <div
              className="rounded-xl p-4 space-y-2"
              style={{ backgroundColor: "#F8FAFC" }}
            >
              {sub.currentPeriodEnd && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: "#64748B" }}>Next billing date</span>
                  <span className="font-medium text-neutral-900">
                    {new Date(sub.currentPeriodEnd).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span style={{ color: "#64748B" }}>Billing cycle</span>
                <span className="font-medium text-neutral-900">
                  {sub.billingCycle === "ANNUAL" ? "Annual" : "Monthly"}
                </span>
              </div>
            </div>

            {sub.canceledAt && (
              <div
                className="rounded-xl p-4 flex items-center gap-3"
                style={{ backgroundColor: "#FEF2F2" }}
              >
                <svg
                  className="h-5 w-5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#DC2626"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
                <span className="text-sm" style={{ color: "#DC2626" }}>
                  Canceled on {new Date(sub.canceledAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <p className="mb-1 font-display font-semibold text-neutral-900">
              Free Plan
            </p>
            <p className="mb-6 text-sm" style={{ color: "#94A3B8" }}>
              You&apos;re on the Free plan. Upgrade to unlock more features.
            </p>
            <Link
              href="/pricing"
              className="inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{ backgroundColor: "#4F46E5" }}
            >
              View Plans
            </Link>
          </div>
        )}
      </div>

      {/* Manage subscription */}
      {sub && (
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}
        >
          <h2 className="font-display text-lg font-semibold text-neutral-900 mb-2">
            Manage Subscription
          </h2>
          <p className="mb-5 text-sm" style={{ color: "#94A3B8" }}>
            Update your payment method, change your plan, or cancel your subscription through the Stripe Customer Portal.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
              style={{ backgroundColor: "#4F46E5" }}
            >
              {portalLoading ? "Loading..." : "Manage Subscription"}
            </button>
            <Link
              href="/pricing"
              className="rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: "#ffffff",
                border: "1.5px solid #E0E7FF",
                color: "#4F46E5",
              }}
            >
              Upgrade Plan
            </Link>
          </div>
        </div>
      )}

      {/* Annual savings callout */}
      {sub && sub.billingCycle !== "ANNUAL" && (
        <div
          className="rounded-2xl p-6"
          style={{
            background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
            border: "1px solid #C7D2FE",
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: "#ffffff" }}
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
                  d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-display font-semibold text-neutral-900 mb-1">
                Switch to Annual Billing
              </h3>
              <p className="text-sm" style={{ color: "#4338CA" }}>
                Save 20% by switching to annual billing. That&apos;s $28.80/yr in savings.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
