"use client";

// =============================================================================
// Site Health Dashboard — One-glance view of site health
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Zap,
  Clock,
  HardDrive,
  FileCheck2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Download,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

interface HealthData {
  overallScore: number | null;
  lastChecked: string | null;
  checks: {
    ssl: { ok: boolean; detail: string };
    wpCore: { ok: boolean; detail: string };
    plugins: { ok: boolean; detail: string };
    performance: { ok: boolean; detail: string };
    uptime: { ok: boolean; detail: string };
    backup: { ok: boolean; detail: string };
    forms: { ok: boolean; detail: string };
  };
}

function StatusIcon({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle2 size={18} color={C.green} />
  ) : (
    <AlertTriangle size={18} color={C.amber} />
  );
}

export default function HealthPage() {
  const params = useParams();
  const siteId = params.siteId as string;

  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const fetchHealth = useCallback(() => {
    setLoading(true);
    fetch(`/api/studio/${siteId}/health`)
      .then((r) => r.json())
      .then((d) => setHealth(d))
      .catch(() => setHealth(null))
      .finally(() => setLoading(false));
  }, [siteId]);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const runCheck = async () => {
    setChecking(true);
    await fetch(`/api/studio/${siteId}/health/check`, { method: "POST" });
    fetchHealth();
    setChecking(false);
  };

  const timeAgo = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} minutes ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, color: C.muted, fontFamily: "'Inter',-apple-system,sans-serif" }}>
        <Loader2 size={20} style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
        Loading health data...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // If health data hasn't been fetched yet, show a "never checked" state
  const neverChecked = !health || !health.lastChecked;

  const checks = health?.checks || {
    ssl: { ok: false, detail: "Not yet checked" },
    wpCore: { ok: false, detail: "Not yet checked" },
    plugins: { ok: false, detail: "Not yet checked" },
    performance: { ok: false, detail: "Not yet checked" },
    uptime: { ok: false, detail: "Not yet checked" },
    backup: { ok: false, detail: "Not yet checked" },
    forms: { ok: false, detail: "Not yet checked" },
  };

  const allOk = !neverChecked && Object.values(checks).every((c) => c.ok);
  const failCount = neverChecked ? 0 : Object.values(checks).filter((c) => !c.ok).length;

  return (
    <div style={{ padding: 24, fontFamily: "'Inter',-apple-system,sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ShieldCheck size={22} color={C.accent} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>Site Health</h1>
        </div>
        <button
          onClick={runCheck}
          disabled={checking}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
            background: C.accent, border: "none", borderRadius: 8,
            color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          <RefreshCw size={14} className={checking ? "animate-spin" : ""} />
          {checking ? "Checking..." : "Check Now"}
        </button>
      </div>

      {/* Overall Health */}
      <div style={{
        background: neverChecked ? `${C.blue}10` : allOk ? `${C.green}10` : `${C.amber}10`,
        border: `1px solid ${neverChecked ? C.blue : allOk ? C.green : C.amber}30`,
        borderRadius: 12, padding: 20, marginBottom: 24,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {neverChecked ? (
            <ShieldCheck size={28} color={C.blue} />
          ) : allOk ? (
            <CheckCircle2 size={28} color={C.green} />
          ) : (
            <AlertTriangle size={28} color={C.amber} />
          )}
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: neverChecked ? C.blue : allOk ? C.green : C.amber }}>
              {neverChecked ? "Not Yet Checked" : allOk ? "Excellent" : `${failCount} issue${failCount > 1 ? "s" : ""} found`}
            </div>
            <div style={{ fontSize: 13, color: C.muted }}>
              {neverChecked ? "Run a health check to analyze your site" : allOk ? "All critical checks passing" : "Some checks need attention"}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: C.dim }}>
          Last checked: {timeAgo(health?.lastChecked || null)}
        </div>
      </div>

      {/* Health Check Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Security */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Lock size={16} color={C.blue} />
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Security</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <StatusIcon ok={checks.ssl.ok} />
              <div>
                <div style={{ fontSize: 13, color: C.text }}>SSL Certificate</div>
                <div style={{ fontSize: 11, color: C.dim }}>{checks.ssl.detail}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <StatusIcon ok={checks.wpCore.ok} />
              <div>
                <div style={{ fontSize: 13, color: C.text }}>WordPress Core</div>
                <div style={{ fontSize: 11, color: C.dim }}>{checks.wpCore.detail}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <StatusIcon ok={checks.plugins.ok} />
              <div>
                <div style={{ fontSize: 13, color: C.text }}>Plugins</div>
                <div style={{ fontSize: 11, color: C.dim }}>{checks.plugins.detail}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Zap size={16} color={C.amber} />
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Performance</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StatusIcon ok={checks.performance.ok} />
            <div>
              <div style={{ fontSize: 13, color: C.text }}>Lighthouse Score</div>
              <div style={{ fontSize: 11, color: C.dim }}>{checks.performance.detail}</div>
            </div>
          </div>
        </div>

        {/* Uptime */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Clock size={16} color={C.green} />
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Uptime</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StatusIcon ok={checks.uptime.ok} />
            <div>
              <div style={{ fontSize: 13, color: C.text }}>Availability</div>
              <div style={{ fontSize: 11, color: C.dim }}>{checks.uptime.detail}</div>
            </div>
          </div>
        </div>

        {/* Backups */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <HardDrive size={16} color={C.accent} />
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Backups</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <StatusIcon ok={checks.backup.ok} />
            <div>
              <div style={{ fontSize: 13, color: C.text }}>Backup Status</div>
              <div style={{ fontSize: 11, color: C.dim }}>{checks.backup.detail}</div>
            </div>
          </div>
          <button style={{
            display: "flex", alignItems: "center", gap: 5, padding: "6px 10px",
            background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 6,
            color: C.muted, fontSize: 12, cursor: "pointer",
          }}>
            <Download size={12} /> Download Latest Backup
          </button>
        </div>

        {/* Forms */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: 20, gridColumn: "1 / -1",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <FileCheck2 size={16} color={C.green} />
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Forms</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StatusIcon ok={checks.forms.ok} />
            <div>
              <div style={{ fontSize: 13, color: C.text }}>Form Status</div>
              <div style={{ fontSize: 11, color: C.dim }}>{checks.forms.detail}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
