"use client";

// =============================================================================
// Go Live Page — Post-approval celebration and next steps
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface SiteInfo {
  buildId: string;
  status: string;
  siteUrl: string | null;
  businessName: string | null;
}

export default function GoLivePage() {
  const params = useParams();
  const buildId = params.buildId as string;

  const isDemo = buildId.startsWith("demo-");
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(!isDemo);
  const [error, setError] = useState<string | null>(null);

  const fetchSiteInfo = useCallback(async () => {
    if (isDemo) return;
    try {
      const res = await fetch(`/api/builds/${buildId}/status`);
      if (!res.ok) throw new Error("Failed to fetch site info");
      const data = await res.json();
      setSiteInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setIsLoading(false);
    }
  }, [buildId, isDemo]);

  useEffect(() => {
    fetchSiteInfo();
  }, [fetchSiteInfo]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-hero">
        <div className="text-center">
          <div
            className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: "#E0E7FF", borderTopColor: "transparent" }}
          />
          <p className="mt-4 text-sm text-neutral-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-hero">
        <div
          className="rounded-2xl p-8 text-center max-w-md"
          style={{ backgroundColor: "#ffffff", border: "1px solid #FCA5A5" }}
        >
          <p className="text-sm" style={{ color: "#EF4444" }}>
            {error}
          </p>
          <Link
            href="/studio"
            className="mt-4 inline-block text-sm font-medium"
            style={{ color: "#4F46E5" }}
          >
            Go to Studio
          </Link>
        </div>
      </div>
    );
  }

  // Demo builds show a celebration + signup CTA
  if (isDemo) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <div className="flex items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="font-display text-xl font-bold text-neutral-900 tracking-tight"
          >
            Xus<span style={{ color: "#4F46E5" }}>mo</span>
          </Link>
        </div>

        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: "#F0FDF4" }}
          >
            <svg
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#22C55E"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-bold text-neutral-900 mb-3">
            Your Website is Ready!
          </h1>
          <p className="text-lg text-neutral-500 mb-10">
            This was a preview of what Xusmo can build for you. Sign up to publish your real website.
          </p>

          {/* What you get card */}
          <div
            className="rounded-2xl p-8 text-left mb-8"
            style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}
          >
            <h3 className="font-display text-lg font-semibold text-neutral-900 mb-4">
              What You&apos;ll Get
            </h3>
            <div className="space-y-3">
              {[
                "A fully custom, AI-built WordPress website",
                "Professional hosting on your own domain",
                "Built-in SEO optimization for Google",
                "Ongoing AI-powered content updates",
                "Full WordPress admin access",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: "#F0FDF4" }}
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="#22C55E"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-neutral-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signin"
              className="rounded-xl px-8 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{ backgroundColor: "#4F46E5" }}
            >
              Create My Account &rarr;
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl px-8 py-3.5 text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: "#ffffff",
                border: "1.5px solid #E0E7FF",
                color: "#4F46E5",
              }}
            >
              View Pricing Plans
            </Link>
          </div>

          <p className="mt-8 text-sm text-neutral-400">
            No credit card required to get started.{" "}
            <Link href="/contact" style={{ color: "#4F46E5" }}>
              Questions? Contact us
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-xl font-bold text-neutral-900 tracking-tight"
        >
          Xus<span style={{ color: "#4F46E5" }}>mo</span>
        </Link>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        {/* Celebration */}
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: "#F0FDF4" }}
        >
          <svg
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#22C55E"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-bold text-neutral-900 mb-3">
          You&apos;re Live!
        </h1>
        <p className="text-lg text-neutral-500 mb-10">
          Your website is published and ready for the world.
        </p>

        {/* Site info card */}
        <div
          className="rounded-2xl p-8 text-left mb-10"
          style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}
        >
          {siteInfo?.businessName && (
            <h2 className="font-display text-xl font-bold text-neutral-900 mb-1">
              {siteInfo.businessName}
            </h2>
          )}
          {siteInfo?.siteUrl && siteInfo.siteUrl !== "demo-preview" && (
            <a
              href={siteInfo.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm mb-6 inline-block"
              style={{ color: "#4F46E5" }}
            >
              {siteInfo.siteUrl} &rarr;
            </a>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            {siteInfo?.siteUrl && siteInfo.siteUrl !== "demo-preview" && (
              <a
                href={siteInfo.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl px-6 py-3 text-sm font-semibold text-white text-center transition-all duration-200 hover:-translate-y-0.5"
                style={{ backgroundColor: "#4F46E5" }}
              >
                Visit Your Website &rarr;
              </a>
            )}
            {siteInfo?.siteUrl && siteInfo.siteUrl !== "demo-preview" && (
              <a
                href={`${siteInfo.siteUrl}/wp-admin`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl px-6 py-3 text-sm font-medium text-center transition-all duration-200"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1.5px solid #E0E7FF",
                  color: "#4F46E5",
                }}
              >
                Open WordPress Admin
              </a>
            )}
          </div>
        </div>

        {/* Next steps */}
        <div
          className="rounded-2xl p-8 text-left mb-10"
          style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}
        >
          <h3 className="font-display text-lg font-semibold text-neutral-900 mb-4">
            Next Steps
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "#F0FDF4" }}
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#22C55E"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-sm text-neutral-700">
                Your site is published and live
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "#EEF2FF" }}
              >
                <span style={{ color: "#4F46E5", fontSize: "10px" }}>→</span>
              </div>
              <Link
                href="/studio"
                className="text-sm font-medium"
                style={{ color: "#4F46E5" }}
              >
                Connect a custom domain
              </Link>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "#EEF2FF" }}
              >
                <span style={{ color: "#4F46E5", fontSize: "10px" }}>→</span>
              </div>
              <span className="text-sm" style={{ color: "#4F46E5" }}>
                Set up Google Business Profile
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "#EEF2FF" }}
              >
                <span style={{ color: "#4F46E5", fontSize: "10px" }}>→</span>
              </div>
              <span className="text-sm" style={{ color: "#4F46E5" }}>
                Share your new website
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard link */}
        <Link
          href="/studio"
          className="inline-block rounded-xl px-8 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
          style={{ backgroundColor: "#4F46E5" }}
        >
          Go to Studio
        </Link>

        <p className="mt-6 text-sm text-neutral-400">
          Need help?{" "}
          <Link href="/contact" style={{ color: "#4F46E5" }}>
            Contact our support team
          </Link>
        </p>
      </div>
    </div>
  );
}
