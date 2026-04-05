"use client";

import { useState } from "react";
import {
  LayoutDashboard, Hammer, Users, Activity, Bot, Settings, Database, Globe,
  ShieldCheck, CreditCard, BarChart3, ChevronRight, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, Clock, Zap, ToggleLeft, ToggleRight, Search,
  RefreshCw, Crown, Box, GitBranch, Layers, type LucideIcon
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const C = {
  bg: "#F8F9FC",
  surface: "#FFFFFF",
  surfaceAlt: "#F1F5F9",
  border: "#E2E8F0",
  borderActive: "#4F46E5",
  red: "#EF4444",
  amber: "#f59e0b",
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#7C3AED",
  cyan: "#06b6d4",
  text: "#1E293B",
  muted: "#64748B",
  dim: "#94A3B8",
  accent: "#4F46E5",
};

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

const NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard",         icon: LayoutDashboard },
  { id: "builds",    label: "Builds",             icon: Hammer,    badge: 3 },
  { id: "users",     label: "Users",              icon: Users },
  { id: "activity",  label: "Activity Log",       icon: Activity },
  { id: "agents",    label: "Agents",             icon: Bot },
  { id: "defaults",  label: "Industry Defaults",  icon: Database },
  { id: "sites",     label: "Sites",              icon: Globe },
  { id: "qa",        label: "QA Queue",           icon: ShieldCheck, badge: 2 },
  { id: "billing",   label: "Billing",            icon: CreditCard },
  { id: "analytics", label: "Analytics",          icon: BarChart3 },
  { id: "settings",  label: "Settings",           icon: Settings },
];

const BUILDS_DATA  = Array.from({ length: 14 }, (_, i) => ({ day: `Feb ${i + 7}`, builds: Math.floor(Math.random() * 12 + 2) }));
const REVENUE_DATA = Array.from({ length: 14 }, (_, i) => ({ day: `Feb ${i + 7}`, revenue: Math.floor(Math.random() * 300 + 700) }));
const LLM_DATA     = Array.from({ length: 14 }, (_, i) => ({ day: `Feb ${i + 7}`, cost: +(Math.random() * 3 + 0.5).toFixed(2) }));
const INDUSTRY_DATA = [{ name: "Plumbing", v: 23 }, { name: "Restaurant", v: 18 }, { name: "Legal", v: 14 }, { name: "Salon", v: 12 }, { name: "Photography", v: 9 }, { name: "Other", v: 24 }];
const PIE_COLORS = [C.accent, C.amber, C.blue, C.green, C.purple, C.dim];

interface AgentStatus {
  name: string;
  status: "healthy" | "warning" | "error" | "disabled";
  quality: number | null;
  lastRun: string;
}

const AGENTS_STATUS: AgentStatus[] = [
  { name: "Classification", status: "healthy",  quality: 86, lastRun: "2m ago" },
  { name: "Interview",      status: "warning",  quality: 42, lastRun: "5m ago" },
  { name: "Blueprint",      status: "warning",  quality: 38, lastRun: "5m ago" },
  { name: "Content",        status: "error",    quality: 22, lastRun: "5m ago" },
  { name: "Builder",        status: "warning",  quality: 45, lastRun: "6m ago" },
  { name: "SEO",            status: "healthy",  quality: 72, lastRun: "6m ago" },
  { name: "Asset",          status: "error",    quality: 18, lastRun: "7m ago" },
  { name: "QA",             status: "healthy",  quality: 68, lastRun: "7m ago" },
  { name: "Publishing",     status: "disabled", quality: null, lastRun: "\u2014" },
  { name: "Revision",       status: "healthy",  quality: 75, lastRun: "1h ago" },
  { name: "Patrol",         status: "healthy",  quality: 90, lastRun: "14m ago" },
  { name: "Monitoring",     status: "disabled", quality: null, lastRun: "\u2014" },
  { name: "Compliance",     status: "healthy",  quality: 80, lastRun: "2h ago" },
  { name: "Provisioning",   status: "healthy",  quality: 85, lastRun: "3h ago" },
];

interface ActivityItem {
  time: string;
  sev: "info" | "warning" | "error" | "critical";
  cat: string;
  desc: string;
}

const ACTIVITY_FEED: ActivityItem[] = [
  { time: "10:02", sev: "error",    cat: "BUILD",     desc: "Build FAILED at Content Agent: \"Joe\u2019s Auto Repair\" \u2014 Gemini 429" },
  { time: "10:01", sev: "info",     cat: "AGENT",     desc: "Agent \"builder\" completed \u2014 quality: 45%, duration: 28000ms" },
  { time: "09:58", sev: "warning",  cat: "AGENT",     desc: "Agent \"content\" quality score: 22% \u2014 fell back to template" },
  { time: "09:55", sev: "info",     cat: "BUILD",     desc: "Build started: \"Sakura Sushi\" (Restaurant, VENUE archetype)" },
  { time: "09:52", sev: "info",     cat: "INTERVIEW", desc: "Interview completed for \"Sakura Sushi\" in 180s" },
  { time: "09:45", sev: "critical", cat: "BILLING",   desc: "Payment $21.98 FAILED for sarah@email.com \u2014 card declined" },
  { time: "09:40", sev: "info",     cat: "AUTH",      desc: "New user registered: mike@plumber.ca (google)" },
  { time: "09:35", sev: "info",     cat: "BUILD",     desc: "Build completed: \"Elena Photography\" in 154s ($0.03 LLM)" },
  { time: "09:30", sev: "warning",  cat: "INTERVIEW", desc: "Interview abandoned at stage 2 (lead: clx9def456)" },
  { time: "09:22", sev: "info",     cat: "SETTINGS",  desc: "Setting \"agent.content.llm_model\" changed: template_only \u2192 gemini-pro" },
  { time: "09:15", sev: "warning",  cat: "WP-OPS",    desc: "Wordfence detected on downtownlegal.ca \u2014 auto-removal queued" },
  { time: "09:10", sev: "info",     cat: "WP-OPS",    desc: "Golden Image GI-SERVICE-2026Q1-001 promoted to ACTIVE" },
];

interface BuildRecord {
  id: string;
  biz: string;
  industry: string;
  arch: string;
  status: string;
  quality: number | null;
  grade: string | null;
  cost: number;
  time: string;
  agent: string;
  tier: string;
}

const RECENT_BUILDS: BuildRecord[] = [
  { id: "clx8a", biz: "Mario\u2019s Plumbing",  industry: "Plumbing",    arch: "SERVICE",   status: "PREVIEW_READY", quality: 42,   grade: "D",  cost: 0.03, time: "2m 34s", agent: "\u2014",       tier: "managed" },
  { id: "clx8b", biz: "Sakura Sushi",            industry: "Restaurant",  arch: "VENUE",     status: "IN_PROGRESS",   quality: null, grade: null, cost: 0.01, time: "1m 12s", agent: "builder",      tier: "managed" },
  { id: "clx8c", biz: "Joe\u2019s Auto Repair",  industry: "Auto Repair", arch: "SERVICE",   status: "FAILED",        quality: 15,   grade: "F",  cost: 0.00, time: "0m 45s", agent: "content",      tier: "hosting" },
  { id: "clx8d", biz: "Elena Photography",       industry: "Photography", arch: "PORTFOLIO", status: "PUBLISHED",     quality: 78,   grade: "B",  cost: 0.04, time: "2m 50s", agent: "\u2014",       tier: "managed" },
  { id: "clx8e", biz: "Downtown Legal",          industry: "Legal",       arch: "SERVICE",   status: "QA_FAILED",     quality: 35,   grade: "F",  cost: 0.06, time: "3m 10s", agent: "qa",           tier: "hosting" },
];

interface AttentionItem {
  type: "error" | "warning" | "critical";
  label: string;
  desc: string;
  link: string;
}

const NEEDS_ATTENTION: AttentionItem[] = [
  { type: "error",    label: "3 Failed Builds",          desc: "Content Agent failures \u2014 check Gemini API",               link: "builds" },
  { type: "warning",  label: "2 QA Failures",            desc: "Builds below quality threshold",                              link: "qa" },
  { type: "critical", label: "1 Payment Failure",        desc: "sarah@email.com \u2014 card declined",                        link: "billing" },
  { type: "warning",  label: "Interview Agent Grade: F", desc: "Not loading industry questions from DB",                      link: "agents" },
  { type: "warning",  label: "Wordfence on 1 site",      desc: "downtownlegal.ca \u2014 banned plugin, auto-removal queued",  link: "sites" },
];

// ═══ Settings types ═══
interface SettingItemBase {
  key: string;
  label: string;
}

interface SettingToggle extends SettingItemBase {
  type: "toggle";
  value: boolean;
}

interface SettingNumber extends SettingItemBase {
  type: "number";
  value: number;
}

interface SettingString extends SettingItemBase {
  type: "string";
  value: string;
}

interface SettingSelect extends SettingItemBase {
  type: "select";
  value: string;
  options: string[];
}

type SettingItem = SettingToggle | SettingNumber | SettingString | SettingSelect;

interface SettingsCategory {
  id: string;
  label: string;
  info?: string;
  items: SettingItem[];
}

// ═══ SETTINGS — includes FACTORY_PROVISION_SPEC category ═══
const SETTINGS_CATEGORIES: SettingsCategory[] = [
  { id: "general", label: "General", items: [
    { key: "general.site_name",            label: "Platform Name",       type: "string", value: "Xusmo" },
    { key: "general.maintenance_mode",     label: "Maintenance Mode",    type: "toggle", value: false },
    { key: "general.registration_enabled", label: "Allow Registration",  type: "toggle", value: true },
    { key: "general.max_sites_per_user",   label: "Max Sites Per User",  type: "number", value: 10 },
  ]},
  { id: "provision", label: "Provision Spec", info: "FACTORY_PROVISION_SPEC hierarchy controls how every site is configured at build time. Override order: Golden Image \u2192 Industry Defaults \u2192 Site-specific.", items: [
    { key: "provision.default_tier",         label: "Default Service Tier",                    type: "select", value: "hosting",   options: ["hosting", "managed"] },
    { key: "provision.managed_price",        label: "Managed Tier Price ($/mo)",               type: "number", value: 49 },
    { key: "provision.hosting_price",        label: "Hosting-only Price ($/mo)",               type: "number", value: 29 },
    { key: "provision.auto_promote_gi",      label: "Auto-promote GI to ACTIVE",               type: "toggle", value: false },
    { key: "provision.default_gi_service",   label: "Default GI \u2014 SERVICE arch",          type: "string", value: "GI-SERVICE-2026Q1-001" },
    { key: "provision.default_gi_venue",     label: "Default GI \u2014 VENUE arch",            type: "string", value: "GI-VENUE-2026Q1-001" },
    { key: "provision.default_gi_portfolio", label: "Default GI \u2014 PORTFOLIO arch",        type: "string", value: "GI-PORTFOLIO-2026Q1-001" },
    { key: "provision.no_multisite",         label: "Enforce No-Multisite Policy",              type: "toggle", value: true },
    { key: "provision.isolated_installs",    label: "Isolated WP Installs (no shared DB)",     type: "toggle", value: true },
  ]},
  { id: "agents", label: "Agents", items: [
    { key: "agent.content.llm_model",              label: "Content Agent Model",        type: "select", value: "gemini-pro", options: ["gemini-pro","gemini-flash","claude-sonnet","template_only"] },
    { key: "agent.content.enabled",                label: "Content Agent Enabled",      type: "toggle", value: true },
    { key: "agent.content.fallback_to_template",   label: "Fallback to Templates",      type: "toggle", value: true },
    { key: "agent.interview.adaptive_followups",   label: "LLM Adaptive Follow-ups",    type: "toggle", value: false },
    { key: "agent.interview.max_questions",        label: "Max Interview Questions",     type: "number", value: 15 },
    { key: "agent.qa.min_quality_score",           label: "Min QA Score to Pass",       type: "number", value: 50 },
    { key: "agent.builder.apply_theme_customization", label: "Apply Theme Customization", type: "toggle", value: true },
    { key: "agent.asset.image_source",             label: "Image Source",               type: "select", value: "placeholder", options: ["ai_generated","unsplash","pexels","placeholder"] },
  ]},
  { id: "llm", label: "LLM / AI", items: [
    { key: "llm.primary_provider",   label: "Primary Provider",      type: "select", value: "gemini",  options: ["gemini","claude","openai"] },
    { key: "llm.fallback_provider",  label: "Fallback Provider",     type: "select", value: "claude",  options: ["gemini","claude","openai","none"] },
    { key: "llm.max_cost_per_build", label: "Max Cost Per Build ($)", type: "number", value: 0.5 },
    { key: "llm.monthly_budget",     label: "Monthly Budget ($)",    type: "number", value: 100 },
  ]},
  { id: "pipeline", label: "Pipeline", items: [
    { key: "pipeline.max_concurrent_builds", label: "Max Concurrent Builds", type: "number", value: 5 },
    { key: "pipeline.auto_publish",          label: "Auto-publish After QA", type: "toggle", value: false },
    { key: "pipeline.min_quality_score",     label: "Min Score for Preview", type: "number", value: 60 },
  ]},
  { id: "wp-ops", label: "WP / Security", items: [
    { key: "wpops.banned_plugins",       label: "Banned Plugin Enforcement",       type: "toggle", value: true },
    { key: "wpops.auto_remove_banned",   label: "Auto-remove Banned Plugins",      type: "toggle", value: true },
    { key: "wpops.auto_update_low",      label: "Auto-update LOW-risk Plugins",    type: "toggle", value: true },
    { key: "wpops.stage_medium_risk",    label: "Stage MEDIUM-risk Before Update", type: "toggle", value: true },
    { key: "wpops.block_high_risk",      label: "Block HIGH-risk Plugin Updates",  type: "toggle", value: true },
    { key: "wpops.patrol_interval_hours", label: "Patrol Interval (hours)",        type: "number", value: 6 },
    { key: "wpops.backup_interval_hours", label: "Backup Interval (hours)",        type: "number", value: 6 },
    { key: "wpops.ssl_warn_days",         label: "SSL Expiry Warning (days)",      type: "number", value: 14 },
  ]},
];

const sevColor: Record<string, string>    = { info: C.muted, warning: C.amber, error: C.red, critical: "#ff3333" };
const statColor: Record<string, string>   = { QUEUED: C.muted, IN_PROGRESS: C.blue, PREVIEW_READY: C.green, PUBLISHED: C.green, FAILED: C.red, QA_FAILED: C.red, APPROVED: C.green, CANCELLED: C.dim };
const healthColor: Record<string, string> = { healthy: C.green, warning: C.amber, error: C.red, disabled: C.dim };

export default function AdminDashboard() {
  const [page, setPage]                   = useState<string>("dashboard");
  const [settingsCat, setSettingsCat]      = useState<string>("general");
  const [localSettings, setLocalSettings]  = useState<Record<string, string | number | boolean>>(() => {
    const m: Record<string, string | number | boolean> = {};
    SETTINGS_CATEGORIES.forEach(c => c.items.forEach(i => { m[i.key] = i.value; }));
    return m;
  });

  const updateSetting = (key: string, val: string | number | boolean) =>
    setLocalSettings(p => ({ ...p, [key]: val }));

  return (
    <div style={{ minHeight: "100%", background: C.bg, color: C.text, fontFamily: "'Inter',-apple-system,sans-serif", fontSize: 14 }}>
      {/* Horizontal Tab Bar */}
      <div style={{ display: "flex", gap: 4, overflowX: "auto", borderBottom: `1px solid ${C.border}`, background: C.surface, padding: "0 16px" }}>
        {NAV.map(n => {
          const isActive = page === n.id;
          return (
            <button
              key={n.id}
              onClick={() => setPage(n.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 14px",
                border: "none",
                borderBottom: isActive ? `2px solid ${C.accent}` : "2px solid transparent",
                cursor: "pointer",
                background: "transparent",
                color: isActive ? C.accent : C.muted,
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <n.icon size={15} />
              {n.label}
              {n.badge && (
                <span style={{ background: C.accent, color: "#ffffff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>
                  {n.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <div style={{ padding: 24 }}>
        {page === "dashboard" && <DashboardPage />}
        {page === "builds"    && <BuildsPage />}
        {page === "activity"  && <ActivityPage />}
        {page === "agents"    && <AgentsPage />}
        {page === "settings"  && <SettingsPage cat={settingsCat} setCat={setSettingsCat} settings={localSettings} update={updateSetting} />}
        {page === "users"     && <PlaceholderPage title="User Management"        desc="All users &mdash; role, tier, sites, activity. Click for full profile." />}
        {page === "defaults"  && <PlaceholderPage title="Industry Defaults Editor" desc="Edit all 30 industries &mdash; services, questions, design, features, compliance. Every edit logged." />}
        {page === "sites"     && <PlaceholderPage title="Sites Management"       desc="All live WordPress sites &mdash; health, tier, GI version, suspend/backup/upgrade actions." />}
        {page === "qa"        && <PlaceholderPage title="QA Review Queue"        desc="2 builds below quality threshold. Override, retry, or reject with notes." />}
        {page === "billing"   && <PlaceholderPage title="Billing &amp; Revenue"  desc="Managed MRR: $588 (12&times;$49) &middot; Hosting-only MRR: $232 (8&times;$29) &middot; Total: $820 &middot; 1 payment failure." />}
        {page === "analytics" && <PlaceholderPage title="Analytics &amp; Flywheel" desc="Build trends, revenue, classification accuracy, revision patterns, industry intelligence." />}
      </div>
    </div>
  );
}

function DashboardPage() {
  // Tier breakdown: 12 Managed @ $49, 8 Hosting-only @ $29
  const managedCount = 12;
  const hostingCount = 8;
  const managedMRR   = managedCount * 49;
  const hostingMRR   = hostingCount * 29;
  const totalMRR     = managedMRR + hostingMRR;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E293B", margin: 0 }}>Dashboard</h1>
          <p style={{ color: C.dim, fontSize: 12, margin: "4px 0 0" }}>Real-time system overview &mdash; Feb 20, 2026</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, background: `${C.accent}15`, color: C.accent, border: `1px solid ${C.accent}30`, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat Cards — Tier-aware */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr) 2px repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
        <StatCard label="Active Builds"   value="2"           color={C.blue} />
        <StatCard label="Failed (24h)"    value="3"           color={C.red}  alert />
        <StatCard label="Avg Quality"     value="42%"         color={C.red}  alert />
        <StatCard label="LLM Cost Today"  value="$4.82"       color={C.amber} />
        {/* Divider */}
        <div style={{ background: C.border, borderRadius: 2 }} />
        {/* Tier breakdown */}
        <StatCard label={`Managed (\u00d7${managedCount})`}      value={`$${managedMRR}/mo`} color={C.purple} tier="managed" />
        <StatCard label={`Hosting-only (\u00d7${hostingCount})`} value={`$${hostingMRR}/mo`} color={C.blue} />
        <StatCard label="Total MRR"       value={`$${totalMRR}/mo`} color={C.green} trend="+8%" />
        <StatCard label="Live Sites"      value="20"          color={C.green} />
      </div>

      {/* FACTORY_PROVISION_SPEC hierarchy — always-visible banner */}
      <div style={{ background: `${C.cyan}08`, border: `1px solid ${C.cyan}20`, borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
        <GitBranch size={16} color={C.cyan} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.cyan, marginBottom: 2 }}>FACTORY_PROVISION_SPEC Hierarchy</div>
          <div style={{ fontSize: 11, color: C.dim, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: C.text }}>Golden Image</span>
            <ChevronRight size={11} color={C.dim} />
            <span style={{ color: C.text }}>Industry Defaults</span>
            <ChevronRight size={11} color={C.dim} />
            <span style={{ color: C.text }}>Site-specific Overrides</span>
            <ChevronRight size={11} color={C.dim} />
            <span style={{ color: C.cyan }}>Published Site</span>
            <span style={{ marginLeft: 8, color: C.dim }}>&middot; Each site = isolated WP install (no Multisite)</span>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: `${C.cyan}15`, color: C.cyan }}>3 archetypes active</span>
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: `${C.green}15`, color: C.green }}>GI 2026Q1 current</span>
        </div>
      </div>

      {/* Pipeline Health */}
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", marginBottom: 16 }}>Pipeline Health &mdash; 14 Agents</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {AGENTS_STATUS.map(a => (
            <div key={a.name} style={{ background: C.surfaceAlt, borderRadius: 8, padding: "8px 10px", minWidth: 90, textAlign: "center", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{a.name}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: healthColor[a.status] }} />
                {a.quality !== null ? (
                  <span style={{ fontSize: 13, fontWeight: 700, color: a.quality >= 70 ? C.green : a.quality >= 50 ? C.amber : C.red }}>{a.quality}%</span>
                ) : <span style={{ fontSize: 11, color: C.dim }}>OFF</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
        <ChartCard title="Builds / Day (14d)">
          <ResponsiveContainer width="100%" height={150}><BarChart data={BUILDS_DATA}><XAxis dataKey="day" tick={false}/><Tooltip contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, padding: "10px 14px" }}/><Bar dataKey="builds" fill={C.accent} radius={[3,3,0,0]}/></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Revenue Trend (14d)">
          <ResponsiveContainer width="100%" height={150}><LineChart data={REVENUE_DATA}><XAxis dataKey="day" tick={false}/><Tooltip contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, padding: "10px 14px" }}/><Line type="monotone" dataKey="revenue" stroke={C.green} strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="LLM Cost / Day (14d)">
          <ResponsiveContainer width="100%" height={150}><LineChart data={LLM_DATA}><XAxis dataKey="day" tick={false}/><Tooltip contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, padding: "10px 14px" }}/><Line type="monotone" dataKey="cost" stroke={C.amber} strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Needs Attention + Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 16 }}>
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={14} color={C.amber} /> Needs Attention
          </div>
          {NEEDS_ATTENTION.map((n, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: i < NEEDS_ATTENTION.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: sevColor[n.type] }}>{n.label}</div>
              <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{n.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
            <Activity size={14} color={C.blue} /> Live Activity Feed
          </div>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {ACTIVITY_FEED.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: `1px solid ${C.border}08`, fontSize: 12 }}>
                <span style={{ color: C.muted, minWidth: 36, flexShrink: 0 }}>{a.time}</span>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: sevColor[a.sev], marginTop: 5, flexShrink: 0 }} />
                <span style={{ color: C.muted, minWidth: 70, flexShrink: 0, fontSize: 11, fontWeight: 600 }}>{a.cat}</span>
                <span style={{ color: a.sev === "error" || a.sev === "critical" ? sevColor[a.sev] : C.text }}>{a.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Builds */}
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, marginTop: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", marginBottom: 16 }}>Recent Builds</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Business", "Industry", "Arch", "Tier", "Status", "Quality", "Cost", "Time", "Agent"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "6px 10px", fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT_BUILDS.map(b => (
              <tr key={b.id} style={{ borderBottom: `1px solid ${C.border}08`, cursor: "pointer" }}>
                <td style={{ padding: "12px 14px", fontWeight: 500, color: "#1E293B" }}>{b.biz}</td>
                <td style={{ padding: "12px 14px", color: C.muted }}>{b.industry}</td>
                <td style={{ padding: "12px 14px" }}><span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: `${C.blue}15`, color: C.blue }}>{b.arch}</span></td>
                <td style={{ padding: "12px 14px" }}>
                  <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 4, background: `${b.tier==="managed"?C.purple:C.blue}15`, color: b.tier==="managed"?C.purple:C.blue, fontWeight: 600 }}>
                    {b.tier === "managed" ? "\u2605 Managed" : "Hosting"}
                  </span>
                </td>
                <td style={{ padding: "12px 14px" }}><span style={{ fontSize: 11, fontWeight: 600, color: statColor[b.status] || C.muted }}>{b.status.replace("_", " ")}</span></td>
                <td style={{ padding: "12px 14px" }}>{b.grade ? <span style={{ fontWeight: 700, color: b.quality !== null && b.quality >= 70 ? C.green : b.quality !== null && b.quality >= 50 ? C.amber : C.red }}>{b.grade} ({b.quality}%)</span> : <span style={{ color: C.dim }}>&mdash;</span>}</td>
                <td style={{ padding: "12px 14px", color: C.muted }}>${b.cost.toFixed(2)}</td>
                <td style={{ padding: "12px 14px", color: C.muted }}>{b.time}</td>
                <td style={{ padding: "12px 14px", color: C.dim }}>{b.agent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BuildsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E293B", margin: "0 0 6px" }}>Build Pipeline</h1>
      <p style={{ color: C.dim, fontSize: 12, margin: "0 0 20px" }}>All builds with full agent audit trail. Click any row for details.</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["All", "In Progress", "Preview Ready", "Failed", "Published"].map(f => (
          <button key={f} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${f==="All"?C.accent:C.border}`, background: f==="All"?`${C.accent}15`:"transparent", color: f==="All"?C.accent:C.muted, cursor: "pointer", fontSize: 12 }}>{f}</button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 12px" }}>
          <Search size={14} color={C.dim} /><input placeholder="Search builds..." style={{ background: "transparent", border: "none", color: C.text, outline: "none", fontSize: 12, width: 150 }} />
        </div>
      </div>
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.surfaceAlt }}>
              {["Business", "Industry", "Arch", "Tier", "Status", "Quality", "LLM Cost", "Duration", "Created"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", borderBottom: `1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT_BUILDS.concat(RECENT_BUILDS).map((b, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, cursor: "pointer" }} onMouseOver={(e: React.MouseEvent<HTMLTableRowElement>) => e.currentTarget.style.background=C.surfaceAlt} onMouseOut={(e: React.MouseEvent<HTMLTableRowElement>) => e.currentTarget.style.background="transparent"}>
                <td style={{ padding: "12px", fontWeight: 500, color: "#1E293B" }}>{b.biz}</td>
                <td style={{ padding: "12px", color: C.muted }}>{b.industry}</td>
                <td style={{ padding: "12px" }}><span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: `${C.blue}15`, color: C.blue }}>{b.arch}</span></td>
                <td style={{ padding: "12px" }}><span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 4, background: `${b.tier==="managed"?C.purple:C.blue}15`, color: b.tier==="managed"?C.purple:C.blue }}>{b.tier==="managed"?"Managed":"Hosting"}</span></td>
                <td style={{ padding: "12px" }}><span style={{ fontSize: 11, fontWeight: 600, color: statColor[b.status] }}>{b.status.replace("_"," ")}</span></td>
                <td style={{ padding: "12px" }}>{b.grade ? <span style={{ fontWeight: 700, color: b.quality !== null && b.quality >= 70 ? C.green : b.quality !== null && b.quality >= 50 ? C.amber : C.red }}>{b.grade}</span> : "\u2014"}</td>
                <td style={{ padding: "12px", color: C.muted }}>${b.cost.toFixed(2)}</td>
                <td style={{ padding: "12px", color: C.muted }}>{b.time}</td>
                <td style={{ padding: "12px", color: C.dim, fontSize: 11 }}>Feb 20, 10:02</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActivityPage() {
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E293B", margin: "0 0 6px" }}>Activity Log</h1>
      <p style={{ color: C.dim, fontSize: 12, margin: "0 0 20px" }}>Every action tracked &mdash; signups, builds, agent runs, payments, settings, WP-ops changes.</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["All","AUTH","BUILD","AGENT","BILLING","SETTINGS","WP-OPS","SECURITY"].map(f => (
          <button key={f} style={{ padding:"5px 12px",borderRadius:6,border:`1px solid ${f==="All"?C.accent:C.border}`,background:f==="All"?`${C.accent}15`:"transparent",color:f==="All"?C.accent:C.muted,cursor:"pointer",fontSize:11 }}>{f}</button>
        ))}
        <button style={{ padding:"5px 12px",borderRadius:6,border:`1px solid ${C.red}`,background:`${C.red}15`,color:C.red,cursor:"pointer",fontSize:11,marginLeft:"auto" }}>Errors Only</button>
      </div>
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 4 }}>
        {ACTIVITY_FEED.concat(ACTIVITY_FEED).map((a, i) => (
          <div key={i} style={{ display:"flex",gap:12,padding:"10px 14px",borderBottom:`1px solid ${C.border}08`,alignItems:"flex-start" }}>
            <span style={{ color:C.dim,fontSize:11,minWidth:40,flexShrink:0 }}>{a.time}</span>
            <div style={{ width:8,height:8,borderRadius:"50%",background:sevColor[a.sev],marginTop:4,flexShrink:0 }}/>
            <span style={{ fontSize:11,fontWeight:700,color:C.dim,minWidth:75,flexShrink:0,textTransform:"uppercase" }}>{a.cat}</span>
            <span style={{ flex:1,color:a.sev==="error"||a.sev==="critical"?sevColor[a.sev]:C.text,fontSize:12 }}>{a.desc}</span>
            <ChevronRight size={14} color={C.dim} style={{ flexShrink:0,marginTop:1 }}/>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E293B", margin: "0 0 6px" }}>Agent Configuration &amp; Health</h1>
      <p style={{ color: C.dim, fontSize: 12, margin: "0 0 20px" }}>Monitor, configure, and control all 14 pipeline + admin agents.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 12 }}>
        {AGENTS_STATUS.map(a => (
          <div key={a.name} style={{ background:C.surface,borderRadius:10,border:`1px solid ${a.status==="error"?`${C.red}40`:C.border}`,padding:16,cursor:"pointer" }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <div style={{ width:10,height:10,borderRadius:"50%",background:healthColor[a.status] }}/>
                <span style={{ fontWeight:600,color:"#1E293B" }}>{a.name}</span>
              </div>
              {a.status!=="disabled"?<ToggleRight size={20} color={C.green}/>:<ToggleLeft size={20} color={C.dim}/>}
            </div>
            <div style={{ display:"flex",gap:16 }}>
              <div>
                <div style={{ fontSize:10,color:C.dim }}>Quality</div>
                <div style={{ fontSize:18,fontWeight:700,color:a.quality!==null?(a.quality>=70?C.green:a.quality>=50?C.amber:C.red):C.dim }}>{a.quality!==null?`${a.quality}%`:"\u2014"}</div>
              </div>
              <div><div style={{ fontSize:10,color:C.dim }}>Last Run</div><div style={{ fontSize:13,color:C.muted }}>{a.lastRun}</div></div>
              <div><div style={{ fontSize:10,color:C.dim }}>Status</div><div style={{ fontSize:13,color:healthColor[a.status],fontWeight:600,textTransform:"capitalize" }}>{a.status}</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SettingsPageProps {
  cat: string;
  setCat: (cat: string) => void;
  settings: Record<string, string | number | boolean>;
  update: (key: string, val: string | number | boolean) => void;
}

function SettingsPage({ cat, setCat, settings, update }: SettingsPageProps) {
  const category = SETTINGS_CATEGORIES.find(c => c.id === cat) || SETTINGS_CATEGORIES[0];
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E293B", margin: "0 0 6px" }}>System Settings</h1>
      <p style={{ color: C.dim, fontSize: 12, margin: "0 0 20px" }}>Configure every aspect of the platform. All changes logged.</p>
      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ width: 190, flexShrink: 0 }}>
          {SETTINGS_CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)} style={{ width:"100%",textAlign:"left",padding:"10px 14px",borderRadius:8,border:"none",cursor:"pointer",marginBottom:4,background:cat===c.id?`${C.accent}15`:"transparent",color:cat===c.id?C.accent:C.muted,fontSize:13,fontWeight:cat===c.id?600:400,display:"flex",alignItems:"center",gap:8 }}>
              {c.id === "provision" && <Box size={13}/>}
              {c.label}
              {c.id === "provision" && <span style={{ fontSize:11,background:`${C.cyan}20`,color:C.cyan,padding:"2px 8px",borderRadius:3,marginLeft:"auto" }}>SPEC</span>}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
          {category.id === "provision" && (
            <div style={{ background:`${C.cyan}08`,border:`1px solid ${C.cyan}20`,borderRadius:8,padding:"10px 14px",marginBottom:20 }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
                <GitBranch size={14} color={C.cyan}/>
                <span style={{ fontSize:12,fontWeight:600,color:C.cyan }}>FACTORY_PROVISION_SPEC</span>
              </div>
              <p style={{ fontSize:11,color:C.dim,margin:0 }}>{category.info}</p>
            </div>
          )}
          <h2 style={{ fontSize:16,fontWeight:600,color:"#fff",margin:"0 0 20px" }}>{category.label} Settings</h2>
          {category.items.map(item => (
            <div key={item.key} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 0",borderBottom:`1px solid ${C.border}08` }}>
              <div>
                <div style={{ fontSize:13,color:"#fff",fontWeight:500 }}>{item.label}</div>
                <div style={{ fontSize:11,color:C.dim,fontFamily:"monospace" }}>{item.key}</div>
              </div>
              {item.type==="toggle"&&<button onClick={()=>update(item.key,!settings[item.key])} style={{ background:"none",border:"none",cursor:"pointer" }}>{settings[item.key]?<ToggleRight size={28} color={C.green}/>:<ToggleLeft size={28} color={C.dim}/>}</button>}
              {item.type==="number"&&<input type="number" value={settings[item.key] as number} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>update(item.key,+e.target.value)} style={{ width:80,padding:"6px 10px",borderRadius:6,border:`1px solid ${C.border}`,background:C.surfaceAlt,color:C.text,fontSize:13,textAlign:"right",outline:"none" }}/>}
              {item.type==="string"&&<input value={settings[item.key] as string} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>update(item.key,e.target.value)} style={{ width:240,padding:"6px 10px",borderRadius:6,border:`1px solid ${C.border}`,background:C.surfaceAlt,color:C.text,fontSize:13,outline:"none",fontFamily:"monospace" }}/>}
              {item.type==="select"&&<select value={settings[item.key] as string} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>update(item.key,e.target.value)} style={{ padding:"6px 10px",borderRadius:6,border:`1px solid ${C.border}`,background:C.surfaceAlt,color:C.text,fontSize:13,outline:"none" }}>{(item as SettingSelect).options.map((o: string)=><option key={o} value={o}>{o}</option>)}</select>}
            </div>
          ))}
          <button style={{ marginTop:20,padding:"10px 24px",background:C.accent,color:"#ffffff",border:"none",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

interface PlaceholderPageProps {
  title: string;
  desc: string;
}

function PlaceholderPage({ title, desc }: PlaceholderPageProps) {
  return (
    <div>
      <h1 style={{ fontSize:22,fontWeight:700,color:"#fff",margin:"0 0 6px" }}>{title}</h1>
      <p style={{ color:C.dim,fontSize:12,margin:"0 0 20px" }}>{desc}</p>
      <div style={{ background:C.surface,borderRadius:12,border:`1px dashed ${C.border}`,padding:60,textAlign:"center",color:C.dim }}>Full implementation renders real data from API routes.</div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  color: string;
  trend?: string;
  alert?: boolean;
  tier?: string;
}

function StatCard({ label, value, color, trend, alert, tier }: StatCardProps) {
  return (
    <div style={{ background:C.surface,borderRadius:10,border:`1px solid ${alert?`${C.red}40`:tier==="managed"?`${C.purple}25`:C.border}`,padding:"16px 18px" }}>
      <div style={{ fontSize:12,color:C.dim,textTransform:"uppercase",display:"flex",alignItems:"center",gap:4 }}>
        {tier==="managed"&&<Crown size={9} color={C.purple}/>}{label}
      </div>
      <div style={{ fontSize:24,fontWeight:800,color,marginTop:4 }}>{value}</div>
      {trend&&<div style={{ fontSize:11,color:trend.startsWith("+")?C.green:C.red,marginTop:2,display:"flex",alignItems:"center",gap:2 }}>
        {trend.startsWith("+")?<TrendingUp size={10}/>:<TrendingDown size={10}/>}{trend}
      </div>}
    </div>
  );
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

function ChartCard({ title, children }: ChartCardProps) {
  return <div style={{ background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,padding:16 }}><div style={{ fontSize:12,fontWeight:600,color:C.muted,marginBottom:10 }}>{title}</div>{children}</div>;
}
