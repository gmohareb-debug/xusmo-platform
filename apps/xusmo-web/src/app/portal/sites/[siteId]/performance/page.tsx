"use client";

// =============================================================================
// Performance Dashboard — Site health metrics, SEO, uptime, speed
// =============================================================================

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface PerformanceData {
  siteName: string;
  siteUrl: string | null;
  uptime: number;
  pageSpeed: number;
  seoScore: number;
  mobileScore: number;
  totalVisits: number | null;
  sslValid: boolean;
  lastChecked: string | null;
  recommendations: string[];
}

function ScoreCircle({ score, label, color }: { score: number; label: string; color: string }) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-24 w-24">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#F1F5F9" strokeWidth="6" />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-neutral-900">{score}</span>
        </div>
      </div>
      <span className="mt-2 text-xs font-medium" style={{ color: "#64748B" }}>{label}</span>
    </div>
  );
}

function getScoreColor(score: number) {
  if (score >= 90) return "#22C55E";
  if (score >= 70) return "#F59E0B";
  return "#EF4444";
}

export default function PerformancePage() {
  const params = useParams();
  const siteId = params.siteId as string;
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, fetch from /api/portal/sites/{siteId}/performance
    // MVP: use mock data
    const timer = setTimeout(() => {
      setData({
        siteName: "My Business",
        siteUrl: null,
        uptime: 99.9,
        pageSpeed: 92,
        seoScore: 87,
        mobileScore: 95,
        totalVisits: null,
        sslValid: true,
        lastChecked: new Date().toISOString(),
        recommendations: [
          "Add a blog to boost organic SEO traffic",
          "Connect Google Analytics for visitor insights",
          "Add alt text to all images for better accessibility",
          "Consider adding a FAQ section for long-tail keywords",
        ],
      });
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [siteId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "#E0E7FF", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/portal/sites" className="text-xs font-medium mb-2 inline-block" style={{ color: "#4F46E5" }}>
          &larr; Back to Sites
        </Link>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900">
          Performance Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#94A3B8" }}>
          {data.siteName}
          {data.lastChecked && (
            <> &middot; Last checked {new Date(data.lastChecked).toLocaleString()}</>
          )}
        </p>
      </div>

      {/* Score circles */}
      <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}>
        <h2 className="font-display text-base font-semibold text-neutral-900 mb-6">Health Scores</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-center">
          <ScoreCircle score={data.pageSpeed} label="Page Speed" color={getScoreColor(data.pageSpeed)} />
          <ScoreCircle score={data.seoScore} label="SEO Health" color={getScoreColor(data.seoScore)} />
          <ScoreCircle score={data.mobileScore} label="Mobile" color={getScoreColor(data.mobileScore)} />
          <ScoreCircle score={Math.round(data.uptime)} label="Uptime %" color={getScoreColor(Math.round(data.uptime))} />
        </div>
      </div>

      {/* Status cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        {/* Uptime */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: "#F0FDF4" }}>
              <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="#22C55E" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium" style={{ color: "#94A3B8" }}>Uptime (30d)</span>
          </div>
          <div className="text-2xl font-bold text-neutral-900">{data.uptime}%</div>
          <div className="mt-2 h-1.5 rounded-full" style={{ backgroundColor: "#F1F5F9" }}>
            <div className="h-1.5 rounded-full" style={{ width: `${data.uptime}%`, backgroundColor: "#22C55E" }} />
          </div>
        </div>

        {/* Visits */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: "#EEF2FF" }}>
              <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="#4F46E5" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span className="text-xs font-medium" style={{ color: "#94A3B8" }}>Total Visits</span>
          </div>
          {data.totalVisits !== null ? (
            <div className="text-2xl font-bold text-neutral-900">{data.totalVisits.toLocaleString()}</div>
          ) : (
            <div>
              <div className="text-sm font-medium text-neutral-900 mb-1">Not connected</div>
              <Link href="/portal/settings" className="text-xs font-medium" style={{ color: "#4F46E5" }}>
                Connect Google Analytics &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* Security */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: data.sslValid ? "#F0FDF4" : "#FEF2F2" }}>
              <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke={data.sslValid ? "#22C55E" : "#EF4444"} strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-xs font-medium" style={{ color: "#94A3B8" }}>Security</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: data.sslValid ? "#22C55E" : "#EF4444" }} />
              <span className="text-neutral-900">SSL {data.sslValid ? "Valid" : "Invalid"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly summary */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)", border: "1px solid #C7D2FE" }}>
        <h2 className="font-display text-base font-semibold text-neutral-900 mb-2">Monthly Summary</h2>
        <p className="text-sm" style={{ color: "#4338CA" }}>
          Your site had {data.uptime}% uptime, loads in ~{(100 - data.pageSpeed) * 0.03 + 0.8 > 0 ? ((100 - data.pageSpeed) * 0.03 + 0.8).toFixed(1) : "0.8"}s average, and has an SEO score of {data.seoScore}/100.
        </p>
      </div>

      {/* Recommendations */}
      <div className="rounded-2xl p-6" style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}>
        <h2 className="font-display text-base font-semibold text-neutral-900 mb-4">Recommendations</h2>
        <div className="space-y-3">
          {data.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: "#EEF2FF" }}>
                <span style={{ color: "#4F46E5", fontSize: "10px" }}>&rarr;</span>
              </div>
              <span className="text-sm" style={{ color: "#475569" }}>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
