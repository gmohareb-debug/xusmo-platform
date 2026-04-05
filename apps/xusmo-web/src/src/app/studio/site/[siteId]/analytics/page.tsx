"use client";

// =============================================================================
// Analytics Dashboard — Traffic data + Performance Recommendation Engine
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  BarChart2,
  TrendingUp,
  Users,
  Eye,
  Clock,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

interface Recommendation {
  id: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  actionLabel: string;
  actionRoute: string;
  isDone?: boolean;
}

const PRIORITY_STYLES = {
  HIGH: { color: C.red, bg: `${C.red}15`, label: "HIGH IMPACT" },
  MEDIUM: { color: C.amber, bg: `${C.amber}15`, label: "MEDIUM IMPACT" },
  LOW: { color: C.blue, bg: `${C.blue}15`, label: "LOW IMPACT" },
};

export default function AnalyticsPage() {
  const params = useParams();
  const siteId = params.siteId as string;

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  const fetchRecommendations = useCallback(() => {
    setLoadingRecs(true);
    fetch(`/api/studio/${siteId}/analytics/recommendations`)
      .then((r) => r.json())
      .then((d) => setRecommendations(d.recommendations || []))
      .catch(() => setRecommendations([]))
      .finally(() => setLoadingRecs(false));
  }, [siteId]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Mock analytics data (real data comes from WP analytics plugins)
  const stats = [
    { label: "Visitors (30d)", value: "—", icon: Users, color: C.blue },
    { label: "Page Views (30d)", value: "—", icon: Eye, color: C.accent },
    { label: "Avg. Session", value: "—", icon: Clock, color: C.green },
    { label: "Bounce Rate", value: "—", icon: TrendingUp, color: C.amber },
  ];

  const highRecs = recommendations.filter((r) => r.priority === "HIGH" && !r.isDone);
  const medRecs = recommendations.filter((r) => r.priority === "MEDIUM" && !r.isDone);
  const doneRecs = recommendations.filter((r) => r.isDone);

  return (
    <div style={{ padding: 24, fontFamily: "'Inter',-apple-system,sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <BarChart2 size={22} color={C.accent} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>Analytics</h1>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
              padding: "16px 18px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Icon size={16} color={stat.color} />
                <span style={{ fontSize: 11, color: C.dim }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.text }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>
                Analytics will show when your site is live
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendations Section */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
        padding: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
            Action Items
          </div>
          <button
            onClick={fetchRecommendations}
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
              background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 6,
              color: C.muted, fontSize: 12, cursor: "pointer",
            }}
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {loadingRecs ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40, color: C.muted }}>
            <Loader2 size={18} style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
            Analyzing your site...
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : recommendations.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <CheckCircle2 size={32} color={C.green} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: C.green }}>
              Looking good! No recommendations right now.
            </div>
          </div>
        ) : (
          <>
            {/* HIGH Impact */}
            {highRecs.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 10,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <AlertCircle size={14} /> HIGH IMPACT
                </div>
                {highRecs.map((rec) => (
                  <RecommendationCard key={rec.id} rec={rec} siteId={siteId} />
                ))}
              </div>
            )}

            {/* MEDIUM Impact */}
            {medRecs.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: C.amber, marginBottom: 10,
                }}>
                  MEDIUM IMPACT
                </div>
                {medRecs.map((rec) => (
                  <RecommendationCard key={rec.id} rec={rec} siteId={siteId} />
                ))}
              </div>
            )}

            {/* Done */}
            {doneRecs.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 10 }}>
                  DONE
                </div>
                {doneRecs.map((rec) => (
                  <div key={rec.id} style={{
                    padding: "8px 12px", fontSize: 13, color: C.dim,
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <CheckCircle2 size={14} color={C.green} />
                    <span style={{ textDecoration: "line-through" }}>{rec.title}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function RecommendationCard({ rec, siteId }: { rec: Recommendation; siteId: string }) {
  const style = PRIORITY_STYLES[rec.priority] || PRIORITY_STYLES.MEDIUM;
  return (
    <div style={{
      background: style.bg, border: `1px solid ${style.color}30`, borderRadius: 10,
      padding: 16, marginBottom: 8,
    }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>
        {rec.title}
      </div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 10, lineHeight: 1.5 }}>
        {rec.description}
      </div>
      <Link
        href={`/studio/site/${siteId}/${rec.actionRoute}`}
        style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "6px 12px", background: `${style.color}25`, border: `1px solid ${style.color}50`,
          borderRadius: 6, color: style.color, fontSize: 12, fontWeight: 600,
          textDecoration: "none",
        }}
      >
        {rec.actionLabel} <ChevronRight size={12} />
      </Link>
    </div>
  );
}
