"use client";

import { useState, Fragment } from "react";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Activity,
  GitBranch,
  Shield,
  Database,
  Crown,
  Filter,
  Search,
  Download,
  RefreshCw,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";

const C = {
  bg: "#0f1117",
  surface: "#181b25",
  surfaceAlt: "#1e2230",
  border: "#2a2f3e",
  red: "#dc2626",
  amber: "#f59e0b",
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#a855f7",
  cyan: "#06b6d4",
  text: "#e8ecf4",
  muted: "#a0abbe",
  dim: "#7a859b",
};

const GRADE_COLORS: Record<string, string> = {
  A: C.green,
  B: C.blue,
  C: C.amber,
  D: "#f97316",
  F: C.red,
  "\u2014": C.dim,
};
const TIER_COLORS: Record<string, string> = {
  managed: C.purple,
  hosting: C.blue,
};

// --- Types ---

interface AgentGrades {
  classification: string;
  interview: string;
  blueprint: string;
  content: string;
  builder: string;
  seo: string;
  qa: string;
  [key: string]: string;
}

interface AuditRecord {
  id: string;
  ts: string;
  businessName: string;
  industry: string;
  archetype: string;
  tier: string;
  status: string;
  grade: string;
  score: number;
  durationMs: number;
  cost: number;
  agents: AgentGrades;
  issues: string[];
  gi: string;
}

// --- System-wide audit records ---
const AUDIT_RECORDS: AuditRecord[] = [
  {
    id: "bld-001",
    ts: "2026-02-20 10:02",
    businessName: "Mario's Plumbing",
    industry: "Plumbing",
    archetype: "SERVICE",
    tier: "managed",
    status: "PREVIEW_READY",
    grade: "D",
    score: 42,
    durationMs: 154000,
    cost: 0.03,
    agents: {
      classification: "B",
      interview: "F",
      blueprint: "F",
      content: "D",
      builder: "C",
      seo: "C",
      qa: "B",
    },
    issues: [
      "Interview skipped industry DB questions",
      "Blueprint missing services",
    ],
    gi: "GI-SERVICE-2026Q1-001",
  },
  {
    id: "bld-002",
    ts: "2026-02-20 11:45",
    businessName: "Bella Cucina",
    industry: "Restaurant",
    archetype: "VENUE",
    tier: "managed",
    status: "PUBLISHED",
    grade: "A",
    score: 91,
    durationMs: 132000,
    cost: 0.04,
    agents: {
      classification: "A",
      interview: "A",
      blueprint: "A",
      content: "B",
      builder: "A",
      seo: "A",
      qa: "A",
    },
    issues: [],
    gi: "GI-VENUE-2026Q1-001",
  },
  {
    id: "bld-003",
    ts: "2026-02-19 14:20",
    businessName: "Peak Fitness",
    industry: "Fitness",
    archetype: "SERVICE",
    tier: "hosting",
    status: "PUBLISHED",
    grade: "B",
    score: 78,
    durationMs: 145000,
    cost: 0.03,
    agents: {
      classification: "A",
      interview: "B",
      blueprint: "B",
      content: "B",
      builder: "B",
      seo: "C",
      qa: "B",
    },
    issues: ["SEO schema type not set"],
    gi: "GI-SERVICE-2026Q1-001",
  },
  {
    id: "bld-004",
    ts: "2026-02-19 09:00",
    businessName: "Clara's Studio",
    industry: "Photography",
    archetype: "PORTFOLIO",
    tier: "managed",
    status: "PUBLISHED",
    grade: "A",
    score: 88,
    durationMs: 128000,
    cost: 0.04,
    agents: {
      classification: "A",
      interview: "A",
      blueprint: "A",
      content: "A",
      builder: "A",
      seo: "B",
      qa: "A",
    },
    issues: [],
    gi: "GI-PORTFOLIO-2026Q1-001",
  },
  {
    id: "bld-005",
    ts: "2026-02-18 16:30",
    businessName: "Joe's Auto Repairs",
    industry: "Auto",
    archetype: "SERVICE",
    tier: "managed",
    status: "FAILED",
    grade: "F",
    score: 18,
    durationMs: 62000,
    cost: 0.01,
    agents: {
      classification: "A",
      interview: "F",
      blueprint: "F",
      content: "\u2014",
      builder: "\u2014",
      seo: "\u2014",
      qa: "\u2014",
    },
    issues: [
      "Interview failed \u2014 client disconnected",
      "Downstream agents blocked",
    ],
    gi: "GI-SERVICE-2026Q1-001",
  },
  {
    id: "bld-006",
    ts: "2026-02-18 13:15",
    businessName: "Downtown Legal",
    industry: "Legal",
    archetype: "SERVICE",
    tier: "managed",
    status: "REVIEW_REQUIRED",
    grade: "C",
    score: 62,
    durationMs: 168000,
    cost: 0.05,
    agents: {
      classification: "A",
      interview: "C",
      blueprint: "C",
      content: "C",
      builder: "B",
      seo: "C",
      qa: "D",
    },
    issues: [
      "Wordfence detected \u2014 must remove",
      "Missing trust signals",
      "SSL expired",
    ],
    gi: "GI-SERVICE-2026Q1-001",
  },
  {
    id: "bld-007",
    ts: "2026-02-17 11:00",
    businessName: "Harbour Brewing Co",
    industry: "Brewery",
    archetype: "VENUE",
    tier: "hosting",
    status: "PUBLISHED",
    grade: "B",
    score: 80,
    durationMs: 140000,
    cost: 0.04,
    agents: {
      classification: "A",
      interview: "B",
      blueprint: "B",
      content: "A",
      builder: "B",
      seo: "B",
      qa: "B",
    },
    issues: [],
    gi: "GI-VENUE-2026Q1-001",
  },
  {
    id: "bld-008",
    ts: "2026-02-17 08:20",
    businessName: "GreenLeaf Landscape",
    industry: "Landscaping",
    archetype: "SERVICE",
    tier: "managed",
    status: "PUBLISHED",
    grade: "A",
    score: 93,
    durationMs: 126000,
    cost: 0.03,
    agents: {
      classification: "A",
      interview: "A",
      blueprint: "A",
      content: "A",
      builder: "A",
      seo: "A",
      qa: "A",
    },
    issues: [],
    gi: "GI-SERVICE-2026Q1-001",
  },
];

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: C.green,
  PREVIEW_READY: C.blue,
  REVIEW_REQUIRED: C.amber,
  FAILED: C.red,
};

const AGENT_COLS: string[] = [
  "classification",
  "interview",
  "blueprint",
  "content",
  "builder",
  "seo",
  "qa",
];

const TH: React.CSSProperties = {
  textAlign: "left" as const,
  padding: "9px 12px",
  fontSize: 12,
  fontWeight: 600,
  color: C.muted,
  textTransform: "uppercase" as const,
  borderBottom: `1px solid ${C.border}`,
};
const TD: React.CSSProperties = {
  padding: "12px 14px",
  verticalAlign: "middle" as const,
};

export default function AuditDashboard() {
  const [filter, setFilter] = useState<string>("ALL");
  const [tierFil, setTierFil] = useState<string>("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");

  const filtered = AUDIT_RECORDS.filter((r) => {
    if (filter !== "ALL" && r.status !== filter) return false;
    if (tierFil !== "ALL" && r.tier !== tierFil) return false;
    if (search && !r.businessName.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const total = AUDIT_RECORDS.length;
  const published = AUDIT_RECORDS.filter(
    (r) => r.status === "PUBLISHED"
  ).length;
  const failed = AUDIT_RECORDS.filter((r) => r.status === "FAILED").length;
  const issues = AUDIT_RECORDS.filter((r) => r.issues.length > 0).length;
  const avgScore = Math.round(
    AUDIT_RECORDS.reduce((s, r) => s + r.score, 0) / total
  );
  const managedMRR =
    AUDIT_RECORDS.filter(
      (r) => r.tier === "managed" && r.status === "PUBLISHED"
    ).length * 49;
  const hostingMRR =
    AUDIT_RECORDS.filter(
      (r) => r.tier === "hosting" && r.status === "PUBLISHED"
    ).length * 29;

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100%",
        color: C.text,
        fontFamily: "'Inter',-apple-system,sans-serif",
        fontSize: 14,
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: `1px solid ${C.border}`,
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Zap size={18} color={C.red} />
        <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
          Xusmo Admin
        </span>
        <span style={{ color: C.dim }}>&rarr;</span>
        <span style={{ color: C.muted }}>Build Audit</span>
        <div style={{ flex: 1 }} />
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: `${C.blue}12`,
            color: C.blue,
            border: `1px solid ${C.blue}30`,
            borderRadius: 6,
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          <Download size={13} /> Export CSV
        </button>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: `${C.green}12`,
            color: C.green,
            border: `1px solid ${C.green}30`,
            borderRadius: 6,
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* FACTORY_PROVISION_SPEC Banner */}
      <div
        style={{
          background: `${C.cyan}06`,
          borderBottom: `1px solid ${C.cyan}15`,
          padding: "9px 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <GitBranch size={14} color={C.cyan} />
        <span style={{ fontSize: 11, color: C.muted }}>
          <span style={{ color: C.cyan, fontWeight: 600 }}>
            FACTORY_PROVISION_SPEC
          </span>
          <span style={{ color: C.dim, margin: "0 6px" }}>&middot;</span>
          <span style={{ color: C.text }}>Golden Image</span>
          <ChevronRight
            size={10}
            color={C.dim}
            style={{
              display: "inline",
              verticalAlign: "middle",
              margin: "0 3px",
            }}
          />
          <span style={{ color: C.text }}>Industry Defaults</span>
          <ChevronRight
            size={10}
            color={C.dim}
            style={{
              display: "inline",
              verticalAlign: "middle",
              margin: "0 3px",
            }}
          />
          <span style={{ color: C.text }}>Site-specific Overrides</span>
          <ChevronRight
            size={10}
            color={C.dim}
            style={{
              display: "inline",
              verticalAlign: "middle",
              margin: "0 3px",
            }}
          />
          <span style={{ color: C.cyan }}>Published Site</span>
          <span style={{ color: C.dim, margin: "0 12px" }}>|</span>
          Tier:{" "}
          <span style={{ color: C.purple, fontWeight: 600 }}>
            &#9733; Managed $49/mo
          </span>{" "}
          = 5 admin agents active
          <span style={{ color: C.dim, margin: "0 8px" }}>&middot;</span>
          <span style={{ color: C.blue, fontWeight: 600 }}>
            Hosting-only $29/mo
          </span>{" "}
          = self-managed
          <span style={{ color: C.dim, margin: "0 12px" }}>|</span>
          Colors/fonts via{" "}
          <span style={{ color: C.purple }}>wp_global_styles</span> DB post
          &mdash; never file edits
        </span>
      </div>

      <div style={{ padding: 24 }}>
        {/* KPI Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            gap: 10,
            marginBottom: 24,
          }}
        >
          <KPI label="Total Builds" value={total} color={C.text} />
          <KPI
            label="Published"
            value={published}
            color={C.green}
            sub={`${Math.round((published / total) * 100)}% success`}
          />
          <KPI
            label="Failed"
            value={failed}
            color={C.red}
            sub="need review"
          />
          <KPI
            label="With Issues"
            value={issues}
            color={C.amber}
            sub="flag raised"
          />
          <KPI
            label="Avg Score"
            value={`${avgScore}%`}
            color={avgScore >= 80 ? C.green : C.amber}
          />
          <KPI
            label="Managed MRR"
            value={`$${managedMRR}`}
            color={C.purple}
            sub="&#9733; Managed sites"
          />
          <KPI
            label="Hosting MRR"
            value={`$${hostingMRR}`}
            color={C.blue}
            sub="Hosting-only sites"
          />
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              padding: "7px 12px",
              flex: "0 0 240px",
            }}
          >
            <Search size={13} color={C.dim} />
            <input
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              placeholder="Search business name..."
              style={{
                background: "transparent",
                border: "none",
                color: C.text,
                outline: "none",
                fontSize: 12,
                width: "100%",
              }}
            />
          </div>
          <span style={{ fontSize: 11, color: C.dim }}>Status:</span>
          {[
            "ALL",
            "PUBLISHED",
            "PREVIEW_READY",
            "REVIEW_REQUIRED",
            "FAILED",
          ].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: `1px solid ${filter === s ? STATUS_COLORS[s] || C.red : C.border}`,
                background:
                  filter === s
                    ? `${STATUS_COLORS[s] || C.red}15`
                    : "transparent",
                color:
                  filter === s ? STATUS_COLORS[s] || C.text : C.muted,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: filter === s ? 600 : 400,
              }}
            >
              {s === "ALL" ? "All" : s.replace("_", " ")}
            </button>
          ))}
          <span style={{ color: C.dim, margin: "0 4px" }}>|</span>
          <span style={{ fontSize: 11, color: C.dim }}>Tier:</span>
          {["ALL", "managed", "hosting"].map((t) => (
            <button
              key={t}
              onClick={() => setTierFil(t)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: `1px solid ${tierFil === t ? (t === "managed" ? C.purple : t === "hosting" ? C.blue : C.red) : C.border}`,
                background:
                  tierFil === t
                    ? `${t === "managed" ? C.purple : t === "hosting" ? C.blue : C.red}15`
                    : "transparent",
                color:
                  tierFil === t
                    ? t === "managed"
                      ? C.purple
                      : t === "hosting"
                        ? C.blue
                        : C.text
                    : C.muted,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: tierFil === t ? 600 : 400,
              }}
            >
              {t === "ALL"
                ? "All Tiers"
                : t === "managed"
                  ? "\u2605 Managed"
                  : "Hosting-only"}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: C.dim }}>
            {filtered.length} of {total} builds
          </span>
        </div>

        {/* Audit Table */}
        <div
          style={{
            background: C.surface,
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceAlt }}>
                <th style={TH}>Build</th>
                <th style={TH}>Business</th>
                <th style={TH}>Tier</th>
                <th style={TH}>GI Source</th>
                <th style={TH}>Status</th>
                <th style={TH}>Score</th>
                {AGENT_COLS.map((a) => (
                  <th key={a} style={TH}>
                    {a}
                  </th>
                ))}
                <th style={TH}>Duration</th>
                <th style={TH}>Cost</th>
                <th style={TH}>Issues</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <Fragment key={r.id}>
                  <tr
                    onClick={() =>
                      setExpanded(expanded === r.id ? null : r.id)
                    }
                    style={{
                      borderBottom: `1px solid ${C.border}`,
                      cursor: "pointer",
                      background:
                        expanded === r.id ? `${C.red}05` : "transparent",
                    }}
                  >
                    <td style={TD}>
                      <div
                        style={{
                          fontFamily: "monospace",
                          fontSize: 11,
                          color: C.dim,
                        }}
                      >
                        {r.id}
                      </div>
                      <div style={{ fontSize: 11, color: C.dim }}>{r.ts}</div>
                    </td>
                    <td style={TD}>
                      <div style={{ fontWeight: 600, color: "#fff" }}>
                        {r.businessName}
                      </div>
                      <div style={{ fontSize: 11, color: C.dim }}>
                        {r.industry} &middot; {r.archetype}
                      </div>
                    </td>
                    <td style={TD}>
                      {r.tier === "managed" ? (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            color: C.purple,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          <Crown size={11} />
                          Managed
                        </span>
                      ) : (
                        <span style={{ color: C.blue, fontSize: 11 }}>
                          Hosting-only
                        </span>
                      )}
                    </td>
                    <td style={TD}>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: 11,
                          color: C.cyan,
                        }}
                      >
                        {r.gi}
                      </span>
                    </td>
                    <td style={TD}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "3px 8px",
                          borderRadius: 4,
                          background: `${STATUS_COLORS[r.status]}18`,
                          color: STATUS_COLORS[r.status],
                        }}
                      >
                        {r.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td style={TD}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 5,
                            borderRadius: 3,
                            background: C.border,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${r.score}%`,
                              height: "100%",
                              background: GRADE_COLORS[r.grade],
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: GRADE_COLORS[r.grade],
                          }}
                        >
                          {r.grade}
                        </span>
                        <span style={{ fontSize: 11, color: C.dim }}>
                          {r.score}%
                        </span>
                      </div>
                    </td>
                    {AGENT_COLS.map((a) => (
                      <td key={a} style={TD}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color:
                              GRADE_COLORS[r.agents[a] || "\u2014"],
                            background: `${GRADE_COLORS[r.agents[a] || "\u2014"]}15`,
                            padding: "2px 7px",
                            borderRadius: 4,
                          }}
                        >
                          {r.agents[a] || "\u2014"}
                        </span>
                      </td>
                    ))}
                    <td style={TD}>
                      <span style={{ color: C.muted, fontSize: 11 }}>
                        {(r.durationMs / 1000).toFixed(0)}s
                      </span>
                    </td>
                    <td style={TD}>
                      <span style={{ color: C.muted, fontSize: 11 }}>
                        ${r.cost.toFixed(2)}
                      </span>
                    </td>
                    <td style={TD}>
                      {r.issues.length === 0 ? (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            color: C.green,
                            fontSize: 11,
                          }}
                        >
                          <CheckCircle2 size={12} />
                          Clean
                        </span>
                      ) : (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            color:
                              r.status === "FAILED" ? C.red : C.amber,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          <AlertCircle size={12} />
                          {r.issues.length} issue
                          {r.issues.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </td>
                  </tr>
                  {expanded === r.id && (
                    <tr>
                      <td
                        colSpan={13}
                        style={{
                          background: C.surfaceAlt,
                          padding: 20,
                          borderBottom: `1px solid ${C.border}`,
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 20,
                          }}
                        >
                          {/* Agent breakdown */}
                          <div>
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#fff",
                                marginBottom: 16,
                              }}
                            >
                              Agent Score Breakdown
                            </div>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 8,
                              }}
                            >
                              {AGENT_COLS.map((a) => (
                                <div
                                  key={a}
                                  style={{
                                    background: C.surface,
                                    borderRadius: 8,
                                    padding: "10px 12px",
                                    border: `1px solid ${GRADE_COLORS[r.agents[a] || "\u2014"]}20`,
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: 12,
                                        color: C.muted,
                                        textTransform: "capitalize",
                                      }}
                                    >
                                      {a}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: 14,
                                        fontWeight: 700,
                                        color:
                                          GRADE_COLORS[
                                            r.agents[a] || "\u2014"
                                          ],
                                      }}
                                    >
                                      {r.agents[a] || "\u2014"}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          {/* Issues + Provision context */}
                          <div>
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#fff",
                                marginBottom: 16,
                              }}
                            >
                              Issues &amp; Context
                            </div>
                            {r.issues.length > 0 && (
                              <div style={{ marginBottom: 12 }}>
                                {r.issues.map((issue, i) => (
                                  <div
                                    key={i}
                                    style={{
                                      display: "flex",
                                      alignItems: "flex-start",
                                      gap: 8,
                                      padding: "8px 10px",
                                      background: `${C.amber}08`,
                                      border: `1px solid ${C.amber}20`,
                                      borderRadius: 6,
                                      marginBottom: 6,
                                    }}
                                  >
                                    <AlertCircle
                                      size={13}
                                      color={C.amber}
                                      style={{
                                        flexShrink: 0,
                                        marginTop: 1,
                                      }}
                                    />
                                    <span
                                      style={{
                                        fontSize: 12,
                                        color: C.muted,
                                      }}
                                    >
                                      {issue}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div
                              style={{
                                background: `${C.cyan}06`,
                                border: `1px solid ${C.cyan}15`,
                                borderRadius: 8,
                                padding: 12,
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: C.cyan,
                                  marginBottom: 6,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <Database size={12} /> Provision Context
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: C.muted,
                                  lineHeight: 1.8,
                                }}
                              >
                                <div>
                                  <span style={{ color: C.dim }}>GI:</span>{" "}
                                  <span
                                    style={{
                                      fontFamily: "monospace",
                                      color: C.cyan,
                                    }}
                                  >
                                    {r.gi}
                                  </span>
                                </div>
                                <div>
                                  <span style={{ color: C.dim }}>Tier:</span>{" "}
                                  <span
                                    style={{
                                      color: TIER_COLORS[r.tier],
                                      fontWeight: 600,
                                    }}
                                  >
                                    {r.tier === "managed"
                                      ? "\u2605 Managed ($49/mo)"
                                      : "Hosting-only ($29/mo)"}
                                  </span>
                                </div>
                                <div>
                                  <span style={{ color: C.dim }}>
                                    Archetype:
                                  </span>{" "}
                                  {r.archetype}
                                </div>
                                <div>
                                  <span style={{ color: C.dim }}>
                                    Colors/fonts:
                                  </span>{" "}
                                  <span style={{ color: C.purple }}>
                                    wp_global_styles
                                  </span>{" "}
                                  DB post
                                </div>
                                <div>
                                  <span style={{ color: C.dim }}>
                                    Multisite:
                                  </span>{" "}
                                  <span style={{ color: C.red }}>
                                    Never &mdash; isolated WP install
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              background: C.surface,
              borderRadius: 8,
              padding: "10px 16px",
              border: `1px solid ${C.border}`,
            }}
          >
            <span style={{ fontSize: 11, color: C.dim }}>
              Pipeline avg cost per build:{" "}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.green }}>
              $
              {(
                AUDIT_RECORDS.reduce((s, r) => s + r.cost, 0) / total
              ).toFixed(3)}
            </span>
          </div>
          <div
            style={{
              background: C.surface,
              borderRadius: 8,
              padding: "10px 16px",
              border: `1px solid ${C.border}`,
            }}
          >
            <span style={{ fontSize: 11, color: C.dim }}>
              Avg build time:{" "}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.blue }}>
              {(
                AUDIT_RECORDS.reduce((s, r) => s + r.durationMs, 0) /
                total /
                1000
              ).toFixed(0)}
              s
            </span>
          </div>
          <div
            style={{
              background: C.surface,
              borderRadius: 8,
              padding: "10px 16px",
              border: `1px solid ${C.border}`,
              display: "flex",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 11, color: C.dim }}>MRR breakdown:</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.purple }}>
              Managed ${managedMRR}/mo
            </span>
            <span style={{ fontSize: 11, color: C.dim }}>+</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.blue }}>
              Hosting ${hostingMRR}/mo
            </span>
            <span style={{ fontSize: 11, color: C.dim }}>=</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>
              ${managedMRR + hostingMRR}/mo
            </span>
          </div>
          <div
            style={{
              background: `${C.red}08`,
              borderRadius: 8,
              padding: "10px 16px",
              border: `1px solid ${C.red}20`,
            }}
          >
            <span style={{ fontSize: 11, color: C.red, fontWeight: 600 }}>
              Wordfence BANNED
            </span>
            <span style={{ fontSize: 11, color: C.dim }}>
              {" "}
              &mdash; production sites only use OLS + Imunify360 server-level
              security
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  color: string;
  sub?: string;
}) {
  return (
    <div
      style={{
        background: C.surface,
        borderRadius: 10,
        border: `1px solid ${C.border}`,
        padding: "14px 16px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: C.dim,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
      {sub && (
        <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{sub}</div>
      )}
    </div>
  );
}
