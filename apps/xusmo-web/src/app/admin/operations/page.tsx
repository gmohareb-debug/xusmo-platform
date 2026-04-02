"use client";

import { useState } from "react";
import {
  Box, Shield, Server, Key, Plug, RefreshCw, AlertTriangle, CheckCircle2,
  XCircle, ChevronDown, ChevronRight, Activity, Eye, EyeOff, ToggleRight,
  ToggleLeft, Zap, Globe, Lock, Database, GitBranch, Layers, Crown, Info,
  Search, Trash2, Plus, ArrowUpRight, Copy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

const C = { bg: "#0f1117", surface: "#181b25", surfaceAlt: "#1e2230", border: "#2a2f3e", red: "#dc2626", amber: "#f59e0b", green: "#22c55e", blue: "#3b82f6", purple: "#a855f7", cyan: "#06b6d4", text: "#e8ecf4", muted: "#a0abbe", dim: "#7a859b" };

interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

const TABS: TabItem[] = [
  { id: "health",  label: "Site Health",     icon: Activity, badge: 3 },
  { id: "golden",  label: "Golden Images",   icon: Box },
  { id: "plugins", label: "Plugin Registry", icon: Plug, badge: 25 },
  { id: "creds",   label: "Credentials",     icon: Key },
];

// ═══ SITE ISOLATION POLICY ═══
// Every Xusmo site = isolated WordPress install on its own database.
// No WordPress Multisite — ever. Isolation is enforced at provisioning.
// Tier: managed ($49/mo) = admin agents active | hosting ($29/mo) = no agents

interface WpUser {
  user: string;
  role: string;
  lastLogin: string;
}

interface HealthSite {
  id: string;
  name: string;
  url: string;
  status: string;
  score: number;
  wp: string;
  php: string;
  plugins: string;
  updates: number;
  theme: string;
  ssl: boolean;
  sslDays: number;
  backup: string;
  response: number;
  issues: number;
  gi: string;
  vps: string;
  tier: string;
  owner: string;
  disk: number;
  diskLimit: number;
  db: number;
  pages: number;
  posts: number;
  media: number;
  wpUsers: WpUser[];
}

const HEALTH_SITES: HealthSite[] = [
  { id:"s1", name:"Mario\u2019s Plumbing",   url:"marios.xusmo.io",  status:"HEALTHY",  score:92, wp:"6.7.2", php:"8.3", plugins:"3/3", updates:0, theme:"TT5 v1.2", ssl:true,  sslDays:84,  backup:"2h ago",   response:340,  issues:0, gi:"GI-SERVICE-2026Q1-001",   vps:"vps-01", tier:"managed", owner:"mario@plumbing.ca",  disk:42,  diskLimit:80,  db:28,  pages:5,  posts:0,  media:12,  wpUsers:[{user:"sf_mario_a1",role:"admin",lastLogin:"10:15 today"}] },
  { id:"s2", name:"Sakura Sushi",       url:"sakura.xusmo.io",  status:"HEALTHY",  score:88, wp:"6.7.2", php:"8.3", plugins:"3/3", updates:0, theme:"TT5 v1.2", ssl:true,  sslDays:72,  backup:"4h ago",   response:410,  issues:0, gi:"GI-VENUE-2026Q1-001",     vps:"vps-01", tier:"managed", owner:"sakura@email.com",   disk:68,  diskLimit:80,  db:45,  pages:7,  posts:3,  media:34,  wpUsers:[{user:"sf_sakura_b2",role:"admin",lastLogin:"14:22 yesterday"}] },
  { id:"s3", name:"Downtown Legal",     url:"downtown.xusmo.io",status:"CRITICAL", score:35, wp:"6.7.0", php:"8.2", plugins:"3/4", updates:3, theme:"TT5 v1.1", ssl:false, sslDays:-3,  backup:"48h ago",  response:2100, issues:4, gi:"GI-SERVICE-2025Q4-003",   vps:"vps-02", tier:"hosting", owner:"legal@downtown.ca",  disk:71,  diskLimit:80,  db:52,  pages:6,  posts:0,  media:8,   wpUsers:[{user:"admin",role:"admin",lastLogin:"3 days ago"},{user:"jennifer",role:"editor",lastLogin:"yesterday"}] },
  { id:"s4", name:"Joe\u2019s Auto Repair",  url:"joes.xusmo.io",    status:"WARNING",  score:68, wp:"6.7.2", php:"8.3", plugins:"4/4", updates:1, theme:"TT5 v1.2", ssl:true,  sslDays:60,  backup:"6h ago",   response:580,  issues:2, gi:"GI-SERVICE-2026Q1-001",   vps:"vps-01", tier:"hosting", owner:"joe@auto.ca",        disk:55,  diskLimit:80,  db:38,  pages:5,  posts:2,  media:18,  wpUsers:[{user:"sf_joe_c3",role:"admin",lastLogin:"08:45 today"}] },
  { id:"s5", name:"Elena Photography",  url:"elena.xusmo.io",   status:"HEALTHY",  score:95, wp:"6.7.2", php:"8.3", plugins:"3/3", updates:0, theme:"TT5 v1.2", ssl:true,  sslDays:90,  backup:"1h ago",   response:280,  issues:0, gi:"GI-PORTFOLIO-2026Q1-001", vps:"vps-01", tier:"managed", owner:"elena@photo.ca",     disk:156, diskLimit:200, db:62,  pages:8,  posts:12, media:245, wpUsers:[{user:"sf_elena_d4",role:"admin",lastLogin:"09:30 today"}] },
  { id:"s6", name:"Fresh Cuts Salon",   url:"freshcuts.xusmo.io",status:"HEALTHY", score:86, wp:"6.7.2", php:"8.3", plugins:"3/3", updates:0, theme:"TT5 v1.2", ssl:true,  sslDays:55,  backup:"3h ago",   response:390,  issues:0, gi:"GI-VENUE-2026Q1-001",     vps:"vps-02", tier:"managed", owner:"sarah@freshcuts.ca", disk:48,  diskLimit:80,  db:31,  pages:6,  posts:0,  media:22,  wpUsers:[{user:"sf_sarah_e5",role:"admin",lastLogin:"yesterday"}] },
];

// ═══ GOLDEN IMAGE LINEAGE ═══
// GI version string encodes: archetype + year + quarter + sequence
// Lineage chain: old version → new version → ACTIVE

interface GoldenImagePlugin {
  slug: string;
  name: string;
  version: string;
  required: boolean;
  category: string;
}

interface GoldenImage {
  id: string;
  version: string;
  type: string;
  status: string;
  wp: string;
  php: string;
  theme: string;
  childTheme: string;
  prevVersion: string | null;
  gen: string;
  plugins: GoldenImagePlugin[];
  pages: string[];
  patterns: string[];
  sites: number;
  avgLH: number;
  failRate: number;
  created: string;
  notes: string;
}

const GOLDEN_IMAGES: GoldenImage[] = [
  {
    id:"gi1", version:"GI-SERVICE-2026Q1-001", type:"SERVICE", status:"ACTIVE",
    wp:"6.7.2", php:"8.3", theme:"twentytwentyfive v1.0", childTheme:"xusmo-child v1.2.0",
    prevVersion:"GI-SERVICE-2025Q4-003", gen:"2026 Q1",
    plugins:[{slug:"wordpress-seo",name:"Yoast SEO",version:"22.1",required:true,category:"SEO"},{slug:"contact-form-7",name:"Contact Form 7",version:"5.9",required:true,category:"FORMS"},{slug:"safe-svg",name:"Safe SVG",version:"2.2",required:false,category:"MEDIA"}],
    pages:["Home","Services","About","Contact","Privacy"],
    patterns:["Hero","Trust Bar","Services Grid","CTA","FAQ","Testimonials","Contact Form"],
    sites:87, avgLH:84, failRate:3.2, created:"Jan 15, 2026",
    notes:"Primary service-business archetype. Twenty Twenty-Five FSE + xusmo-child. No Wordfence \u2014 server-level hardening via OpenLiteSpeed.",
  },
  {
    id:"gi2", version:"GI-VENUE-2026Q1-001", type:"VENUE", status:"ACTIVE",
    wp:"6.7.2", php:"8.3", theme:"twentytwentyfive v1.0", childTheme:"xusmo-child v1.2.0",
    prevVersion:null, gen:"2026 Q1",
    plugins:[{slug:"wordpress-seo",name:"Yoast SEO",version:"22.1",required:true,category:"SEO"},{slug:"contact-form-7",name:"Contact Form 7",version:"5.9",required:true,category:"FORMS"},{slug:"safe-svg",name:"Safe SVG",version:"2.2",required:false,category:"MEDIA"}],
    pages:["Home","Menu","About","Gallery","Reservations","Contact","Privacy"],
    patterns:["Hero","Menu Grid","Hours Widget","Gallery Masonry","Booking CTA","Reviews","Map Embed"],
    sites:43, avgLH:82, failRate:5.1, created:"Jan 15, 2026",
    notes:"Venue/restaurant archetype. Supports online menu display and reservations block.",
  },
  {
    id:"gi3", version:"GI-PORTFOLIO-2026Q1-001", type:"PORTFOLIO", status:"ACTIVE",
    wp:"6.7.2", php:"8.3", theme:"twentytwentyfive v1.0", childTheme:"xusmo-child v1.2.0",
    prevVersion:null, gen:"2026 Q1",
    plugins:[{slug:"wordpress-seo",name:"Yoast SEO",version:"22.1",required:true,category:"SEO"},{slug:"contact-form-7",name:"Contact Form 7",version:"5.9",required:true,category:"FORMS"},{slug:"safe-svg",name:"Safe SVG",version:"2.2",required:false,category:"MEDIA"}],
    pages:["Home","Portfolio","About","Services","Testimonials","Contact","Privacy"],
    patterns:["Hero Full Bleed","Portfolio Grid","Credentials Bar","Case Study","Process Steps","Booking CTA"],
    sites:12, avgLH:88, failRate:1.8, created:"Jan 15, 2026",
    notes:"Creatives and photographers. Emphasises visual showcase with masonry grid.",
  },
  {
    id:"gi4", version:"GI-SERVICE-2025Q4-003", type:"SERVICE", status:"DEPRECATED",
    wp:"6.6.1", php:"8.2", theme:"twentytwentyfour v1.2", childTheme:"xusmo-child v1.0.0",
    prevVersion:null, gen:"2025 Q4",
    plugins:[{slug:"wordpress-seo",name:"Yoast SEO",version:"21.8",required:true,category:"SEO"},{slug:"contact-form-7",name:"Contact Form 7",version:"5.8",required:true,category:"FORMS"}],
    pages:["Home","Services","About","Contact"],
    patterns:["Hero","Services Grid","CTA"],
    sites:34, avgLH:78, failRate:8.4, created:"Oct 1, 2025",
    notes:"DEPRECATED \u2014 1 site still on this version (Downtown Legal). Migrate recommended. Security patches no longer applied.",
  },
];

// ═══ PLUGIN CATALOG ═══
// BANNED plugins: never install on production. Lab use only for research.
// Wordfence: BANNED — 200ms+ slowdown, nags for premium, conflicts with FSE. Use server-level hardening instead.
// Elementor / WPBakery: BANNED — page builder lock-in, FSE conflicts, performance penalty.

interface PluginCatalogItem {
  slug: string;
  name: string;
  category: string;
  ourVersion: string;
  latest: string;
  updateAvail: boolean;
  policy: string;
  risk: string;
  sites: number;
  outdated: number;
  status: string;
  license: string;
  banReason?: string;
}

const PLUGIN_CATALOG: PluginCatalogItem[] = [
  { slug:"wordpress-seo",  name:"Yoast SEO",           category:"SEO",       ourVersion:"22.1", latest:"22.3", updateAvail:true,  policy:"STAGING_FIRST", risk:"MEDIUM", sites:142, outdated:23, status:"REQUIRED", license:"GPLv2" },
  { slug:"contact-form-7", name:"Contact Form 7",       category:"FORMS",     ourVersion:"5.9",  latest:"5.9.8",updateAvail:true,  policy:"STAGING_FIRST", risk:"MEDIUM", sites:142, outdated:0,  status:"REQUIRED", license:"GPLv2" },
  { slug:"safe-svg",       name:"Safe SVG",             category:"MEDIA",     ourVersion:"2.2",  latest:"2.2",  updateAvail:false, policy:"AUTO",          risk:"LOW",    sites:142, outdated:0,  status:"ALLOWED",  license:"GPLv2" },
  { slug:"wp-mail-smtp",   name:"WP Mail SMTP",         category:"EMAIL",     ourVersion:"\u2014",    latest:"3.9",  updateAvail:false, policy:"MANUAL",        risk:"LOW",    sites:6,   outdated:0,  status:"ALLOWED",  license:"GPLv2" },
  { slug:"updraftplus",    name:"UpdraftPlus",          category:"BACKUP",    ourVersion:"\u2014",    latest:"2.23", updateAvail:false, policy:"MANUAL",        risk:"MEDIUM", sites:0,   outdated:0,  status:"ALLOWED",  license:"GPLv2" },
  { slug:"wordfence",      name:"Wordfence Security",   category:"SECURITY",  ourVersion:"\u2014",    latest:"7.11", updateAvail:false, policy:"\u2014",             risk:"HIGH",   sites:3,   outdated:0,  status:"BANNED",   license:"GPLv2", banReason:"200ms+ performance penalty, premium nags, conflicts with FSE. Banned from all production sites. Lab-testing only for research purposes. Use server-level hardening instead (OLS + Imunify360)." },
  { slug:"elementor",      name:"Elementor",            category:"EDITOR",    ourVersion:"\u2014",    latest:"3.21", updateAvail:false, policy:"\u2014",             risk:"HIGH",   sites:0,   outdated:0,  status:"BANNED",   license:"Freemium", banReason:"Page builder lock-in, conflicts with Full Site Editing, severe performance penalty. Never install." },
  { slug:"wpbakery",       name:"WPBakery",             category:"EDITOR",    ourVersion:"\u2014",    latest:"7.8",  updateAvail:false, policy:"\u2014",             risk:"HIGH",   sites:0,   outdated:0,  status:"BANNED",   license:"Commercial", banReason:"Commercial license, FSE conflicts, vendor lock-in." },
];

const statusColor: Record<string, string>    = { HEALTHY:C.green, WARNING:C.amber, CRITICAL:C.red, UNREACHABLE:C.dim, MAINTENANCE:C.blue };
const giStatusColor: Record<string, string>  = { ACTIVE:C.green, TESTING:C.blue, STAGING:C.amber, DRAFT:C.muted, DEPRECATED:C.dim, RETIRED:"#333" };
const pluginStatusColor: Record<string, string> = { REQUIRED:C.blue, ALLOWED:C.green, BANNED:C.red };
const riskColor: Record<string, string>      = { LOW:C.green, MEDIUM:C.amber, HIGH:C.red, CRITICAL:"#ff3333" };
const policyColor: Record<string, string>    = { AUTO:C.green, STAGING_FIRST:C.amber, MANUAL:C.red, FROZEN:C.dim };
const tierColor: Record<string, string>      = { managed:C.purple, hosting:C.blue };

export default function WPOperations() {
  const [tab,        setTab]        = useState<string>("health");
  const [expanded,   setExpanded]   = useState<string | null>(null);
  const [showCreds,  setShowCreds]  = useState<Record<string, boolean>>({});
  const [giExpanded, setGiExpanded] = useState<string | null>(null);
  const [plugSearch, setPlugSearch] = useState<string>("");

  return (
    <div style={{ background:C.bg, minHeight:"100%", color:C.text, fontFamily:"'Inter',-apple-system,sans-serif", fontSize:14 }}>
      {/* Header */}
      <div style={{ borderBottom:`1px solid ${C.border}`, padding:"16px 24px" }}>
        <div style={{ maxWidth:1400, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
            <Server size={20} color={C.red} />
            <h1 style={{ fontSize:20, fontWeight:700, color:"#fff", margin:0 }}>WordPress Operations</h1>
          </div>
          <p style={{ fontSize:12, color:C.dim, margin:0 }}>Golden Images, plugin governance, site health, credentials</p>
        </div>
      </div>

      {/* FACTORY_PROVISION_SPEC Banner */}
      <div style={{ background:`${C.cyan}06`, borderBottom:`1px solid ${C.cyan}15`, padding:"10px 24px" }}>
        <div style={{ maxWidth:1400, margin:"0 auto", display:"flex", alignItems:"center", gap:16 }}>
          <GitBranch size={15} color={C.cyan}/>
          <div style={{ fontSize:11, color:C.muted }}>
            <span style={{ color:C.cyan, fontWeight:600 }}>FACTORY_PROVISION_SPEC</span>
            <span style={{ margin:"0 8px", color:C.dim }}>&middot;</span>
            <span style={{ color:C.text }}>Golden Image</span>
            <ChevronRight size={11} color={C.dim} style={{ display:"inline",verticalAlign:"middle",margin:"0 4px" }}/>
            <span style={{ color:C.text }}>Industry Defaults</span>
            <ChevronRight size={11} color={C.dim} style={{ display:"inline",verticalAlign:"middle",margin:"0 4px" }}/>
            <span style={{ color:C.text }}>Site-specific Overrides</span>
            <ChevronRight size={11} color={C.dim} style={{ display:"inline",verticalAlign:"middle",margin:"0 4px" }}/>
            <span style={{ color:C.cyan }}>Published Site</span>
            <span style={{ margin:"0 16px", color:C.dim }}>|</span>
            <span style={{ color:C.amber, fontWeight:600 }}>&#x1f512; No WordPress Multisite &mdash; ever.</span>
            <span style={{ color:C.dim }}> Each site = isolated WP install on its own DB.</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom:`1px solid ${C.border}`, padding:"0 24px" }}>
        <div style={{ maxWidth:1400, margin:"0 auto", display:"flex", gap:0 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:"flex",alignItems:"center",gap:8,padding:"12px 20px",border:"none",cursor:"pointer",fontSize:13,borderBottom:tab===t.id?`2px solid ${C.red}`:"2px solid transparent",color:tab===t.id?C.red:C.muted,background:"transparent",fontWeight:tab===t.id?600:400 }}>
              <t.icon size={15}/> {t.label}
              {t.badge&&<span style={{ background:tab===t.id?`${C.red}25`:`${C.muted}20`,color:tab===t.id?C.red:C.dim,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:10 }}>{t.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ maxWidth:1400, margin:"0 auto", padding:24 }}>
        {tab === "health"  && <HealthTab  sites={HEALTH_SITES}  expanded={expanded}  setExpanded={setExpanded} showCreds={showCreds} setShowCreds={setShowCreds}/>}
        {tab === "golden"  && <GoldenTab  images={GOLDEN_IMAGES} expanded={giExpanded} setExpanded={setGiExpanded}/>}
        {tab === "plugins" && <PluginsTab  catalog={PLUGIN_CATALOG} search={plugSearch} setSearch={setPlugSearch}/>}
        {tab === "creds"   && <CredsTab sites={HEALTH_SITES} showCreds={showCreds} setShowCreds={setShowCreds}/>}
      </div>
    </div>
  );
}

// ═══ HEALTH TAB ═══
interface HealthTabProps {
  sites: HealthSite[];
  expanded: string | null;
  setExpanded: (id: string | null) => void;
  showCreds: Record<string, boolean>;
  setShowCreds: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

function HealthTab({ sites, expanded, setExpanded, showCreds, setShowCreds }: HealthTabProps) {
  const critical = sites.filter(s=>s.status==="CRITICAL").length;
  const warning  = sites.filter(s=>s.status==="WARNING").length;
  const healthy  = sites.filter(s=>s.status==="HEALTHY").length;

  return (
    <div>
      {/* Summary row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:20 }}>
        <MiniStatCard label="Total Sites"        value={sites.length}  color={C.text}/>
        <MiniStatCard label="Healthy"            value={healthy}       color={C.green}/>
        <MiniStatCard label="Warning"            value={warning}       color={C.amber}/>
        <MiniStatCard label="Critical"           value={critical}      color={C.red}  alert={critical>0}/>
        <MiniStatCard label="Sites on Old GI"    value={sites.filter(s=>s.gi.includes("2025Q4")).length} color={C.amber} alert/>
      </div>

      {sites.map(site => {
        const isOpen = expanded === site.id;
        const giDep  = site.gi.includes("2025Q4");
        return (
          <div key={site.id} style={{ background:C.surface, borderRadius:10, border:`1px solid ${site.status==="CRITICAL"?`${C.red}40`:site.status==="WARNING"?`${C.amber}30`:C.border}`, marginBottom:8, overflow:"hidden" }}>
            {/* Row */}
            <div onClick={()=>setExpanded(isOpen?null:site.id)} style={{ display:"flex",alignItems:"center",gap:12,padding:"14px 16px",cursor:"pointer" }}>
              <div style={{ width:10,height:10,borderRadius:"50%",background:statusColor[site.status],flexShrink:0 }}/>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <span style={{ fontWeight:600,color:"#fff",fontSize:14 }}>{site.name}</span>
                  <span style={{ fontSize:11,color:statusColor[site.status],background:`${statusColor[site.status]}15`,padding:"2px 8px",borderRadius:4,fontWeight:600 }}>{site.status}</span>
                  <span style={{ fontSize:11,color:tierColor[site.tier],background:`${tierColor[site.tier]}15`,padding:"2px 8px",borderRadius:4,fontWeight:600 }}>
                    {site.tier==="managed"?"\u2605 Managed":"Hosting-only"}
                  </span>
                  {giDep&&<span style={{ fontSize:11,color:C.amber,background:`${C.amber}15`,padding:"2px 8px",borderRadius:4,fontWeight:600 }}>OLD GI</span>}
                </div>
                <div style={{ fontSize:11,color:C.dim,marginTop:2 }}>{site.url} &middot; {site.owner}</div>
              </div>
              {/* Mini stats */}
              <div style={{ display:"flex",gap:16 }}>
                <MiniStat label="Score"    value={site.score}           color={site.score>=80?C.green:site.score>=60?C.amber:C.red}/>
                <MiniStat label="WP"       value={site.wp}/>
                <MiniStat label="Response" value={`${site.response}ms`} color={site.response<500?C.green:C.red}/>
                <MiniStat label="Plugins"  value={site.plugins}/>
                <MiniStat label="Disk"     value={`${site.disk}/${site.diskLimit}MB`} color={site.disk/site.diskLimit>0.8?C.amber:C.green}/>
                <MiniStat label="Backup"   value={site.backup} color={site.backup.includes("48")?C.red:C.muted}/>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ fontSize:12,fontWeight:600,color:site.score>=80?C.green:site.score>=60?C.amber:C.red }}>{site.score}/100</span>
                {isOpen?<ChevronDown size={16} color={C.dim}/>:<ChevronRight size={16} color={C.dim}/>}
              </div>
            </div>

            {/* Expanded */}
            {isOpen && (
              <div style={{ borderTop:`1px solid ${C.border}`, padding:16 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                  <DetailCard title="Stack & Health">
                    <DL label="WordPress"  value={site.wp}/>
                    <DL label="PHP"        value={site.php}/>
                    <DL label="Child Theme" value={site.theme}/>
                    <DL label="Plugins"    value={site.plugins}/>
                    <DL label="Pending Updates" value={site.updates}/>
                    <DL label="Pages"      value={site.pages}/>
                    <DL label="Media"      value={site.media}/>
                    <DL label="Response"   value={`${site.response}ms`}/>
                    <DL label="SSL"        value={site.ssl?`\u2713 ${site.sslDays}d left`:"\u2717 EXPIRED"} color={site.ssl?C.green:C.red}/>
                    <DL label="Last Backup" value={site.backup} color={site.backup.includes("48")?C.red:C.muted}/>
                  </DetailCard>

                  <DetailCard title="Golden Image Lineage">
                    <div style={{ marginBottom:8 }}>
                      <div style={{ fontSize:11,color:C.muted,marginBottom:4 }}>Current GI</div>
                      <div style={{ fontFamily:"monospace",fontSize:12,color:giDep?C.amber:C.cyan,fontWeight:600 }}>{site.gi}</div>
                      {giDep&&<div style={{ fontSize:11,color:C.amber,marginTop:4,background:`${C.amber}10`,padding:"4px 8px",borderRadius:4 }}>&lrm;&#9888; Deprecated &mdash; upgrade to GI-SERVICE-2026Q1-001</div>}
                    </div>
                    <div style={{ fontSize:11,color:C.muted,marginBottom:8 }}>Server</div>
                    <DL label="VPS"        value={site.vps}/>
                    <DL label="DB Size"    value={`${site.db}MB`}/>
                    <DL label="Disk Used"  value={`${site.disk}/${site.diskLimit}MB`}/>
                    <div style={{ marginTop:12,padding:"8px 10px",background:C.bg,borderRadius:6,border:`1px solid ${C.border}` }}>
                      <div style={{ fontSize:11,color:C.dim,marginBottom:4,fontWeight:600 }}>ISOLATION POLICY</div>
                      <div style={{ fontSize:11,color:C.muted }}>Standalone WP install &middot; Own database &middot; No Multisite</div>
                    </div>
                  </DetailCard>

                  <DetailCard title="WP Users">
                    {site.wpUsers.map((u,i)=>(
                      <div key={i} style={{ padding:"8px 0",borderBottom:i<site.wpUsers.length-1?`1px solid ${C.border}08`:"none" }}>
                        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                          <span style={{ fontFamily:"monospace",fontSize:12,color:u.user==="admin"?C.red:"#fff",fontWeight:u.user==="admin"?700:400 }}>{u.user}</span>
                          <span style={{ fontSize:11,color:C.blue,background:`${C.blue}12`,padding:"2px 8px",borderRadius:4 }}>{u.role}</span>
                        </div>
                        {u.user==="admin"&&<div style={{ fontSize:11,color:C.red,marginTop:2 }}>&#9888; Default &quot;admin&quot; username &mdash; rotate immediately</div>}
                        <div style={{ fontSize:11,color:C.dim,marginTop:2 }}>Last: {u.lastLogin}</div>
                      </div>
                    ))}
                    <div style={{ display:"flex",gap:6,marginTop:12,flexWrap:"wrap" }}>
                      <SmBtn label="Run Health Check"/>
                      <SmBtn label="Force Backup"/>
                      <SmBtn label="Update All Plugins"/>
                      {site.tier==="hosting"&&<SmBtn label="Upgrade to Managed" color={C.purple}/>}
                    </div>
                  </DetailCard>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══ GOLDEN IMAGES TAB ═══
interface GoldenTabProps {
  images: GoldenImage[];
  expanded: string | null;
  setExpanded: (id: string | null) => void;
}

function GoldenTab({ images, expanded, setExpanded }: GoldenTabProps) {
  return (
    <div>
      {/* PROVISION SPEC chain */}
      <div style={{ background:C.surfaceAlt, borderRadius:10, border:`1px solid ${C.border}`, padding:"12px 16px", marginBottom:20 }}>
        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
          <Layers size={14} color={C.cyan}/>
          <span style={{ fontSize:12,fontWeight:600,color:C.cyan }}>FACTORY_PROVISION_SPEC &mdash; Archetype Coverage</span>
        </div>
        <div style={{ display:"flex",gap:12 }}>
          {[{arch:"SERVICE",gi:"GI-SERVICE-2026Q1-001",sites:87},{arch:"VENUE",gi:"GI-VENUE-2026Q1-001",sites:43},{arch:"PORTFOLIO",gi:"GI-PORTFOLIO-2026Q1-001",sites:12}].map(a=>(
            <div key={a.arch} style={{ flex:1,background:C.bg,borderRadius:8,padding:"10px 12px",border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:11,color:C.muted,textTransform:"uppercase",marginBottom:4 }}>{a.arch}</div>
              <div style={{ fontSize:11,color:C.cyan,fontFamily:"monospace",fontWeight:600,marginBottom:4 }}>{a.gi}</div>
              <div style={{ fontSize:12,color:C.green,fontWeight:600 }}>{a.sites} sites</div>
            </div>
          ))}
        </div>
      </div>

      {images.map(gi=>{
        const isOpen = expanded===gi.id;
        return (
          <div key={gi.id} style={{ background:C.surface,borderRadius:10,border:`1px solid ${gi.status==="DEPRECATED"?`${C.dim}40`:gi.status==="ACTIVE"?`${C.green}25`:C.border}`,marginBottom:10,overflow:"hidden" }}>
            <div onClick={()=>setExpanded(isOpen?null:gi.id)} style={{ display:"flex",alignItems:"center",gap:12,padding:"14px 18px",cursor:"pointer" }}>
              <Box size={18} color={giStatusColor[gi.status]}/>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:3 }}>
                  <span style={{ fontFamily:"monospace",fontSize:13,fontWeight:700,color:"#fff" }}>{gi.version}</span>
                  <span style={{ fontSize:11,padding:"2px 8px",borderRadius:4,background:`${giStatusColor[gi.status]}18`,color:giStatusColor[gi.status],fontWeight:600 }}>{gi.status}</span>
                  <span style={{ fontSize:11,color:C.blue,background:`${C.blue}12`,padding:"2px 8px",borderRadius:4 }}>{gi.type}</span>
                  <span style={{ fontSize:11,color:C.dim }}>{gi.gen}</span>
                </div>
                <div style={{ fontSize:11,color:C.dim }}>
                  WP {gi.wp} &middot; PHP {gi.php} &middot; {gi.plugins.length} plugins &middot; {gi.sites} sites &middot; Lighthouse avg {gi.avgLH}
                  {gi.prevVersion&&<span style={{ marginLeft:8,color:C.dim }}>&uarr; from <span style={{ fontFamily:"monospace",fontSize:11 }}>{gi.prevVersion}</span></span>}
                </div>
              </div>
              <div style={{ display:"flex",gap:12 }}>
                <MiniStat label="Sites"     value={gi.sites}/>
                <MiniStat label="Lighthouse" value={gi.avgLH} color={gi.avgLH>=85?C.green:gi.avgLH>=75?C.amber:C.red}/>
                <MiniStat label="Fail Rate" value={`${gi.failRate}%`} color={gi.failRate<5?C.green:gi.failRate<10?C.amber:C.red}/>
              </div>
              {isOpen?<ChevronDown size={16} color={C.dim}/>:<ChevronRight size={16} color={C.dim}/>}
            </div>

            {isOpen&&(
              <div style={{ borderTop:`1px solid ${C.border}`,padding:16 }}>
                {gi.notes&&<div style={{ background:`${C.cyan}08`,border:`1px solid ${C.cyan}20`,borderRadius:8,padding:"8px 12px",marginBottom:16,fontSize:12,color:C.muted }}><Info size={12} color={C.cyan} style={{ display:"inline",marginRight:6,verticalAlign:"middle" }}/>{gi.notes}</div>}
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16 }}>
                  <DetailCard title="Stack">
                    <DL label="WordPress"   value={gi.wp}/>
                    <DL label="PHP"         value={gi.php}/>
                    <DL label="Parent Theme" value={gi.theme}/>
                    <DL label="Child Theme" value={gi.childTheme}/>
                    <DL label="Created"     value={gi.created}/>
                    {gi.prevVersion&&<DL label="Supersedes" value={gi.prevVersion}/>}
                  </DetailCard>
                  <DetailCard title="Plugins">
                    {gi.plugins.map((p,i)=>(
                      <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}08`,fontSize:12 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                          <span style={{ color:C.text }}>{p.name}</span>
                          {p.required&&<Lock size={9} color={C.blue}/>}
                        </div>
                        <div style={{ display:"flex",gap:6 }}>
                          <span style={{ color:C.dim,fontFamily:"monospace",fontSize:11 }}>v{p.version}</span>
                          <span style={{ fontSize:10,color:C.dim,background:`${C.blue}10`,padding:"1px 5px",borderRadius:3 }}>{p.category}</span>
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop:10,padding:"8px",background:`${C.red}08`,borderRadius:6,border:`1px solid ${C.red}20`,fontSize:10,color:C.red }}>&#x1f6ab; Wordfence: BANNED. Not in any GI. Use OLS + Imunify360.</div>
                  </DetailCard>
                  <DetailCard title="Pages & Patterns">
                    <div style={{ fontSize:11,color:C.dim,marginBottom:4 }}>Pages ({gi.pages.length})</div>
                    {gi.pages.map((p,i)=><div key={i} style={{ fontSize:12,color:C.muted,padding:"2px 0" }}>&middot; {p}</div>)}
                    <div style={{ fontSize:11,color:C.dim,marginTop:10,marginBottom:4 }}>Block Patterns ({gi.patterns.length})</div>
                    {gi.patterns.map((p,i)=><div key={i} style={{ fontSize:12,color:C.muted,padding:"2px 0" }}>&middot; {p}</div>)}
                  </DetailCard>
                </div>
                <div style={{ display:"flex",gap:8,marginTop:16 }}>
                  {gi.status==="ACTIVE"&&<>
                    <SmBtn label="Clone for Testing"/>
                    <SmBtn label="View All Sites"/>
                    <SmBtn label="Export Manifest"/>
                  </>}
                  {gi.status==="DEPRECATED"&&<SmBtn label="Migrate Sites to Current" color={C.amber}/>}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══ PLUGIN REGISTRY TAB ═══
interface PluginsTabProps {
  catalog: PluginCatalogItem[];
  search: string;
  setSearch: (value: string) => void;
}

function PluginsTab({ catalog, search, setSearch }: PluginsTabProps) {
  const bannedCount   = catalog.filter(p=>p.status==="BANNED").length;
  const requiredCount = catalog.filter(p=>p.status==="REQUIRED").length;
  const filtered      = catalog.filter(p=>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Banner: banned plugin policy */}
      <div style={{ background:`${C.red}08`, border:`1px solid ${C.red}20`, borderRadius:10, padding:"12px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
        <Shield size={16} color={C.red}/>
        <div>
          <div style={{ fontSize:12,fontWeight:600,color:C.red,marginBottom:2 }}>Plugin Governance Policy</div>
          <div style={{ fontSize:11,color:C.muted }}>
            <strong>BANNED plugins are never installed on production sites</strong> &mdash; not even temporarily. Lab environment only for QA research.
            Wordfence and all page builders (Elementor, WPBakery) are permanently banned.
            Security is handled at server level: OpenLiteSpeed + Imunify360.
          </div>
        </div>
        <div style={{ marginLeft:"auto",display:"flex",gap:8,flexShrink:0 }}>
          <Badge label={`${requiredCount} Required`} color={C.blue}/>
          <Badge label={`${bannedCount} Banned`}     color={C.red}/>
        </div>
      </div>

      <div style={{ display:"flex",gap:8,marginBottom:16 }}>
        <div style={{ display:"flex",alignItems:"center",gap:6,background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 12px",flex:1 }}>
          <Search size={13} color={C.dim}/>
          <input value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setSearch(e.target.value)} placeholder="Search plugins..." style={{ background:"transparent",border:"none",color:C.text,outline:"none",fontSize:12,width:"100%" }}/>
        </div>
        <button style={{ display:"flex",alignItems:"center",gap:6,background:`${C.blue}12`,color:C.blue,border:`1px solid ${C.blue}30`,borderRadius:6,padding:"7px 14px",cursor:"pointer",fontSize:12,fontWeight:500 }}>
          <Plus size={14}/> Add to Catalog
        </button>
      </div>

      <div style={{ background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden" }}>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.surfaceAlt }}>
              {["Plugin","Category","Our Ver","Latest","Policy","Risk","Sites","Outdated","Status","Actions"].map(h=>(
                <th key={h} style={{ textAlign:"left",padding:"10px 12px",fontSize:10,fontWeight:600,color:C.dim,textTransform:"uppercase",borderBottom:`1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p)=>(
              <tr key={p.slug}>
                <td style={{ padding:"12px" }}>
                  <div style={{ fontWeight:600,color:p.status==="BANNED"?C.red:"#fff",fontSize:13 }}>{p.name}</div>
                  {p.banReason&&<div style={{ fontSize:10,color:C.red,marginTop:2,maxWidth:280 }}>{p.banReason.substring(0,80)}&hellip;</div>}
                </td>
                <td style={{ padding:"12px" }}><Badge label={p.category} color={C.dim}/></td>
                <td style={{ padding:"12px",fontFamily:"monospace",fontSize:12,color:C.muted }}>{p.ourVersion}</td>
                <td style={{ padding:"12px",fontFamily:"monospace",fontSize:12,color:C.muted }}>{p.latest}</td>
                <td style={{ padding:"12px" }}>{p.policy!=="\u2014"?<Badge label={p.policy} color={policyColor[p.policy]||C.dim}/>:<span style={{ color:C.dim }}>&mdash;</span>}</td>
                <td style={{ padding:"12px" }}><Badge label={p.risk} color={riskColor[p.risk]}/></td>
                <td style={{ padding:"12px",color:p.sites>0?C.text:C.dim,fontWeight:p.sites>0?500:400 }}>{p.sites}</td>
                <td style={{ padding:"12px",color:p.outdated>0?C.amber:C.dim }}>{p.outdated>0?p.outdated:"\u2014"}</td>
                <td style={{ padding:"12px" }}><Badge label={p.status} color={pluginStatusColor[p.status]}/></td>
                <td style={{ padding:"12px" }}>
                  <div style={{ display:"flex",gap:4 }}>
                    {p.updateAvail&&<SmBtn label="Stage Update"/>}
                    {p.status==="BANNED"&&p.sites>0&&<SmBtn label={`Remove (${p.sites})`} danger/>}
                    {p.status!=="BANNED"&&<SmBtn label="Details"/>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══ CREDENTIALS TAB ═══
interface CredsTabProps {
  sites: HealthSite[];
  showCreds: Record<string, boolean>;
  setShowCreds: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

function CredsTab({ sites, showCreds, setShowCreds }: CredsTabProps) {
  return (
    <div>
      <div style={{ background:`${C.amber}08`,border:`1px solid ${C.amber}20`,borderRadius:8,padding:"10px 14px",marginBottom:20,display:"flex",alignItems:"center",gap:10 }}>
        <Lock size={14} color={C.amber}/>
        <span style={{ fontSize:12,color:C.amber }}>WP Admin credentials &mdash; all generated by Provisioning Agent. Shown here for emergency access only. Rotate via &quot;Rotate Credentials&quot; action.</span>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:12 }}>
        {sites.map(site=>{
          const show = showCreds[site.id];
          const hasAdmin = site.wpUsers.some(u=>u.user==="admin");
          return (
            <div key={site.id} style={{ background:C.surface,borderRadius:10,border:`1px solid ${hasAdmin?`${C.red}40`:C.border}`,padding:16 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                <div>
                  <div style={{ fontWeight:600,color:"#fff",fontSize:13 }}>{site.name}</div>
                  <div style={{ fontSize:10,color:C.dim,marginTop:2 }}>{site.url} &middot; {site.tier==="managed"?"Managed":"Hosting-only"}</div>
                </div>
                <div style={{ width:10,height:10,borderRadius:"50%",background:statusColor[site.status] }}/>
              </div>
              {hasAdmin&&<div style={{ background:`${C.red}10`,border:`1px solid ${C.red}25`,borderRadius:6,padding:"6px 10px",marginBottom:10,fontSize:11,color:C.red,fontWeight:600 }}>&#9888; Default &quot;admin&quot; username &mdash; rotate now</div>}
              <DL label="WP Admin URL" value={`${site.url}/wp-admin`}/>
              {site.wpUsers.map((u,i)=>(
                <div key={i} style={{ padding:"6px 0",borderBottom:`1px solid ${C.border}08` }}>
                  <div style={{ display:"flex",justifyContent:"space-between",fontSize:12 }}>
                    <span style={{ color:C.dim }}>Username</span>
                    <span style={{ fontFamily:"monospace",color:u.user==="admin"?C.red:C.text,fontWeight:u.user==="admin"?700:400 }}>{u.user}</span>
                  </div>
                  <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,marginTop:4 }}>
                    <span style={{ color:C.dim }}>Password</span>
                    <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                      <span style={{ fontFamily:"monospace",color:C.text }}>{show?"Xk9#mP2$vL7!":"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
                      <button onClick={()=>setShowCreds((p: Record<string, boolean>)=>({...p,[site.id]:!p[site.id]}))} style={{ background:"none",border:"none",cursor:"pointer",padding:2 }}>
                        {show?<EyeOff size={12} color={C.dim}/>:<Eye size={12} color={C.dim}/>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ display:"flex",gap:6,marginTop:12 }}>
                <SmBtn label="Rotate Credentials"/>
                <SmBtn label="Open WP Admin"/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══ Shared UI Components ═══
interface MiniStatCardProps {
  label: string;
  value: string | number;
  color: string;
  alert?: boolean;
}

function MiniStatCard({ label, value, color, alert }: MiniStatCardProps) {
  return (
    <div style={{ background:C.surface,borderRadius:8,border:`1px solid ${alert?`${C.red}30`:C.border}`,padding:"10px 14px" }}>
      <div style={{ fontSize:10,color:C.dim,textTransform:"uppercase" }}>{label}</div>
      <div style={{ fontSize:20,fontWeight:800,color:color||C.text,marginTop:2 }}>{value}</div>
    </div>
  );
}

interface MiniStatProps {
  label: string;
  value: string | number;
  color?: string;
}

function MiniStat({ label, value, color }: MiniStatProps) {
  return <div style={{ textAlign:"right" }}><div style={{ fontSize:9,color:C.dim,textTransform:"uppercase" }}>{label}</div><div style={{ fontSize:13,fontWeight:600,color:color||C.text }}>{value}</div></div>;
}

interface DetailCardProps {
  title: string;
  children: React.ReactNode;
}

function DetailCard({ title, children }: DetailCardProps) {
  return <div style={{ background:C.bg,borderRadius:8,padding:12,border:`1px solid ${C.border}` }}><div style={{ fontSize:11,fontWeight:600,color:C.muted,marginBottom:8,textTransform:"uppercase" }}>{title}</div>{children}</div>;
}

interface DLProps {
  label: string;
  value: string | number;
  color?: string;
}

function DL({ label, value, color }: DLProps) {
  return <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4 }}><span style={{ color:C.dim }}>{label}</span><span style={{ color:color||C.text }}>{value}</span></div>;
}

interface BadgeProps {
  label: string;
  color: string;
}

function Badge({ label, color }: BadgeProps) {
  return <span style={{ fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:4,background:`${color}18`,color }}>{label}</span>;
}

interface SmBtnProps {
  label: string;
  danger?: boolean;
  color?: string;
}

function SmBtn({ label, danger, color }: SmBtnProps) {
  const col = danger?C.red:color||C.blue;
  return <button style={{ fontSize:10,padding:"3px 8px",borderRadius:4,border:`1px solid ${col}30`,background:`${col}10`,color:col,cursor:"pointer" }}>{label}</button>;
}
