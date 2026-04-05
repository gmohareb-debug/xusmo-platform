"use client";

import { useState } from "react";
import { Globe, Plug, RefreshCw, CheckCircle2, XCircle, AlertTriangle, ExternalLink, Eye, EyeOff, Search, Zap, Activity, Lock, Shield, Box, Crown } from "lucide-react";

const C = { bg: "#0f1117", surface: "#181b25", alt: "#1e2230", border: "#2a2f3e", red: "#dc2626", amber: "#f59e0b", green: "#22c55e", blue: "#3b82f6", purple: "#a855f7", cyan: "#06b6d4", text: "#e8ecf4", muted: "#a0abbe", dim: "#7a859b" };

// ═══ SERVICE TIERS ═══
// Managed  ($49/mo): 5 admin agents active — Patrol, Plugin Updater, Backup, SSL/Security, Performance
// Hosting-only ($29/mo): site live on our infrastructure, no automated management
const TIERS: Record<string, { label: string; price: number; color: string }> = {
  managed: { label: "Managed",      price: 49, color: C.purple },
  hosting: { label: "Hosting-only", price: 29, color: C.blue   },
};

// ═══ GOLDEN IMAGE LINEAGE ═══
interface GIMeta {
  archetype: string;
  gen: string;
  prev: string | null;
  deprecated: boolean;
}

const GI_META: Record<string, GIMeta> = {
  "GI-SERVICE-2026Q1-001":   { archetype: "SERVICE",   gen: "2026 Q1", prev: "GI-SERVICE-2025Q4-003",   deprecated: false },
  "GI-VENUE-2026Q1-001":     { archetype: "VENUE",     gen: "2026 Q1", prev: null,                        deprecated: false },
  "GI-PORTFOLIO-2026Q1-001": { archetype: "PORTFOLIO", gen: "2026 Q1", prev: null,                        deprecated: false },
  "GI-SERVICE-2025Q4-003":   { archetype: "SERVICE",   gen: "2025 Q4", prev: null,                        deprecated: true  },
};

interface PluginData {
  name: string;
  slug: string;
  v: string;
  ok: boolean;
  update?: string;
  required: boolean;
  active: boolean;
  banned?: boolean;
}

interface ClientData {
  id: number;
  biz: string;
  owner: string;
  email: string;
  tier: string;
  url: string;
  industry: string;
  status: string;
  score: number;
  wp: string;
  wpOk: boolean;
  wpUpdate: string | null;
  theme: string;
  themeOk: boolean;
  gi: string;
  plugins: PluginData[];
  response: number;
  ssl: number;
  backup: string;
  built: string;
  user: string;
  pages: number;
  media: number;
  vps: string;
}

const CLIENTS: ClientData[] = [
  { id: 1,  biz: "Mario's Plumbing",      owner: "Mario Rossi",    email: "mario@mariosplumbing.ca",  tier: "managed", url: "mariosplumbing.ca",     industry: "Plumbing",    status: "healthy",  score: 92, wp: "6.7.2", wpOk: true,  wpUpdate: null,  theme: "xusmo-child v1.2.0", themeOk: true,  gi: "GI-SERVICE-2026Q1-001",   plugins: [{name:"Yoast SEO",slug:"wordpress-seo",v:"22.3",ok:true, required:true, active:true},{name:"Contact Form 7",slug:"contact-form-7",v:"5.9.8",ok:true, required:true, active:true},{name:"Safe SVG",slug:"safe-svg",v:"2.2",ok:true, required:false,active:true}], response: 320,  ssl: 84,  backup: "2h ago",   built: "Jan 12", user: "sf_mario_r1",   pages: 5,  media: 12,  vps: "vps-01" },
  { id: 2,  biz: "Sakura Sushi",          owner: "Yuki Tanaka",    email: "yuki@sakurasushi.ca",      tier: "managed", url: "sakurasushi.ca",        industry: "Restaurant",  status: "healthy",  score: 88, wp: "6.7.2", wpOk: true,  wpUpdate: null,  theme: "xusmo-child v1.2.0", themeOk: true,  gi: "GI-VENUE-2026Q1-001",     plugins: [{name:"Yoast SEO",slug:"wordpress-seo",v:"22.3",ok:true, required:true, active:true},{name:"Contact Form 7",slug:"contact-form-7",v:"5.9.8",ok:true, required:true, active:true},{name:"Safe SVG",slug:"safe-svg",v:"2.2",ok:true, required:false,active:true}], response: 410,  ssl: 72,  backup: "4h ago",   built: "Jan 15", user: "sf_yuki_t2",    pages: 7,  media: 34,  vps: "vps-01" },
  { id: 3,  biz: "Downtown Legal",        owner: "Jennifer Park",  email: "jen@downtownlegal.ca",     tier: "hosting", url: "downtownlegal.ca",      industry: "Legal",       status: "critical", score: 35, wp: "6.7.0", wpOk: false, wpUpdate: "6.7.2", theme: "xusmo-child v1.1.0", themeOk: false, gi: "GI-SERVICE-2025Q4-003",   plugins: [{name:"Yoast SEO",slug:"wordpress-seo",v:"21.8",ok:false,update:"22.3",required:true, active:true},{name:"Contact Form 7",slug:"contact-form-7",v:"5.8",ok:false,update:"5.9.8",required:true,active:true},{name:"Safe SVG",slug:"safe-svg",v:"2.2",ok:true,required:false,active:true},{name:"Wordfence",slug:"wordfence",v:"7.11",ok:false,banned:true,required:false,active:true}], response: 2100, ssl: -3,  backup: "48h ago",  built: "Dec 3",  user: "admin",         pages: 6,  media: 8,   vps: "vps-02" },
  { id: 4,  biz: "Elena Photography",     owner: "Elena Vasquez",  email: "elena@elenavphoto.ca",     tier: "managed", url: "elenavphoto.ca",        industry: "Photography", status: "healthy",  score: 95, wp: "6.7.2", wpOk: true,  wpUpdate: null,  theme: "xusmo-child v1.2.0", themeOk: true,  gi: "GI-PORTFOLIO-2026Q1-001", plugins: [{name:"Yoast SEO",slug:"wordpress-seo",v:"22.3",ok:true, required:true, active:true},{name:"Contact Form 7",slug:"contact-form-7",v:"5.9.8",ok:true, required:true, active:true},{name:"Safe SVG",slug:"safe-svg",v:"2.2",ok:true, required:false,active:true}], response: 280,  ssl: 90,  backup: "1h ago",   built: "Jan 20", user: "sf_elena_v4",   pages: 8,  media: 245, vps: "vps-01" },
  { id: 5,  biz: "Fresh Cuts Salon",      owner: "Sarah Mitchell", email: "sarah@freshcuts.ca",       tier: "managed", url: "freshcutssalon.ca",     industry: "Salon",       status: "healthy",  score: 86, wp: "6.7.2", wpOk: true,  wpUpdate: null,  theme: "xusmo-child v1.2.0", themeOk: true,  gi: "GI-VENUE-2026Q1-001",     plugins: [{name:"Yoast SEO",slug:"wordpress-seo",v:"22.3",ok:true, required:true, active:true},{name:"Contact Form 7",slug:"contact-form-7",v:"5.9.8",ok:true, required:true, active:true},{name:"Safe SVG",slug:"safe-svg",v:"2.2",ok:true, required:false,active:true}], response: 390,  ssl: 55,  backup: "3h ago",   built: "Jan 8",  user: "sf_sarah_m5",   pages: 6,  media: 22,  vps: "vps-02" },
  { id: 6,  biz: "Joe's Auto Repair",     owner: "Joe Colombo",    email: "joe@joesauto.ca",          tier: "hosting", url: "joesautorepair.ca",     industry: "Auto Repair", status: "warning",  score: 68, wp: "6.7.2", wpOk: true,  wpUpdate: null,  theme: "xusmo-child v1.2.0", themeOk: true,  gi: "GI-SERVICE-2026Q1-001",   plugins: [{name:"Yoast SEO",slug:"wordpress-seo",v:"22.1",ok:false,update:"22.3",required:true,active:true},{name:"Contact Form 7",slug:"contact-form-7",v:"5.9.8",ok:true,required:true,active:true},{name:"Safe SVG",slug:"safe-svg",v:"2.2",ok:true,required:false,active:true},{name:"WP Mail SMTP",slug:"wp-mail-smtp",v:"3.8",ok:false,update:"3.9",required:false,active:false}], response: 580, ssl: 60, backup: "6h ago", built: "Dec 20", user: "sf_joe_c6", pages: 5, media: 18, vps: "vps-01" },
  { id: 7,  biz: "Bright Smiles Dental",  owner: "Dr. Amy Chen",   email: "amy@brightsmiles.ca",      tier: "managed", url: "brightsmilesdental.ca", industry: "Dental",      status: "healthy",  score: 90, wp: "6.7.2", wpOk: true,  wpUpdate: null,  theme: "xusmo-child v1.2.0", themeOk: true,  gi: "GI-SERVICE-2026Q1-001",   plugins: [{name:"Yoast SEO",slug:"wordpress-seo",v:"22.3",ok:true,required:true,active:true},{name:"Contact Form 7",slug:"contact-form-7",v:"5.9.8",ok:true,required:true,active:true},{name:"Safe SVG",slug:"safe-svg",v:"2.2",ok:true,required:false,active:true}], response: 310, ssl: 88, backup: "2h ago", built: "Jan 25", user: "sf_amy_c7", pages: 7, media: 28, vps: "vps-01" },
  { id: 8,  biz: "GreenThumb Landscaping",owner: "Marcus Brown",   email: "marcus@greenthumb.ca",     tier: "hosting", url: "greenthumbland.ca",     industry: "Landscaping", status: "healthy",  score: 84, wp: "6.7.2", wpOk: true,  wpUpdate: null,  theme: "xusmo-child v1.2.0", themeOk: true,  gi: "GI-SERVICE-2026Q1-001",   plugins: [{name:"Yoast SEO",slug:"wordpress-seo",v:"22.3",ok:true,required:true,active:true},{name:"Contact Form 7",slug:"contact-form-7",v:"5.9.8",ok:true,required:true,active:true},{name:"Safe SVG",slug:"safe-svg",v:"2.2",ok:true,required:false,active:true}], response: 350, ssl: 45, backup: "5h ago", built: "Feb 1", user: "sf_marcus_b8", pages: 5, media: 15, vps: "vps-02" },
  { id: 9,  biz: "Peak Fitness Gym",      owner: "Ryan Torres",    email: "ryan@peakfitness.ca",      tier: "managed", url: "peakfitnessgym.ca",     industry: "Gym",         status: "warning",  score: 62, wp: "6.7.2", wpOk: true,  wpUpdate: null,  theme: "xusmo-child v1.1.0", themeOk: false, gi: "GI-SERVICE-2026Q1-001",   plugins: [{name:"Yoast SEO",slug:"wordpress-seo",v:"22.3",ok:true,required:true,active:true},{name:"Contact Form 7",slug:"contact-form-7",v:"5.9",ok:false,update:"5.9.8",required:true,active:true},{name:"Safe SVG",slug:"safe-svg",v:"2.2",ok:true,required:false,active:true}], response: 720, ssl: 30, backup: "12h ago", built: "Feb 5", user: "sf_ryan_t9", pages: 6, media: 20, vps: "vps-02" },
  { id: 10, biz: "Paws & Claws Vet",      owner: "Dr. Lisa Wong",  email: "lisa@pawsclaws.ca",        tier: "managed", url: "pawsandclawsvet.ca",    industry: "Veterinary",  status: "healthy",  score: 91, wp: "6.7.2", wpOk: true,  wpUpdate: null,  theme: "xusmo-child v1.2.0", themeOk: true,  gi: "GI-SERVICE-2026Q1-001",   plugins: [{name:"Yoast SEO",slug:"wordpress-seo",v:"22.3",ok:true,required:true,active:true},{name:"Contact Form 7",slug:"contact-form-7",v:"5.9.8",ok:true,required:true,active:true},{name:"Safe SVG",slug:"safe-svg",v:"2.2",ok:true,required:false,active:true}], response: 300, ssl: 78, backup: "2h ago", built: "Jan 18", user: "sf_lisa_w10", pages: 6, media: 30, vps: "vps-01" },
  { id: 11, biz: "TrueNorth Roofing",     owner: "Dave Wilson",    email: "dave@truenorth.ca",        tier: "hosting", url: "truenorthroofing.ca",   industry: "Roofing",     status: "healthy",  score: 87, wp: "6.7.2", wpOk: true,  wpUpdate: null,  theme: "xusmo-child v1.2.0", themeOk: true,  gi: "GI-SERVICE-2026Q1-001",   plugins: [{name:"Yoast SEO",slug:"wordpress-seo",v:"22.3",ok:true,required:true,active:true},{name:"Contact Form 7",slug:"contact-form-7",v:"5.9.8",ok:true,required:true,active:true},{name:"Safe SVG",slug:"safe-svg",v:"2.2",ok:true,required:false,active:true}], response: 340, ssl: 66, backup: "4h ago", built: "Feb 8", user: "sf_dave_w11", pages: 5, media: 10, vps: "vps-01" },
  { id: 12, biz: "Bella's Bakery",        owner: "Isabella Costa", email: "bella@bellasbakery.ca",    tier: "managed", url: "bellasbakery.ca",       industry: "Bakery",      status: "healthy",  score: 89, wp: "6.7.2", wpOk: true,  wpUpdate: null,  theme: "xusmo-child v1.2.0", themeOk: true,  gi: "GI-VENUE-2026Q1-001",     plugins: [{name:"Yoast SEO",slug:"wordpress-seo",v:"22.3",ok:true,required:true,active:true},{name:"Contact Form 7",slug:"contact-form-7",v:"5.9.8",ok:true,required:true,active:true},{name:"Safe SVG",slug:"safe-svg",v:"2.2",ok:true,required:false,active:true}], response: 330, ssl: 82, backup: "3h ago", built: "Jan 22", user: "sf_bella_c12", pages: 7, media: 40, vps: "vps-01" },
  { id: 13, biz: "CloudNine Cleaning",    owner: "Priya Sharma",   email: "priya@cloudnine.ca",       tier: "hosting", url: "cloudninecleaning.ca",  industry: "Cleaning",    status: "healthy",  score: 83, wp: "6.7.2", wpOk: true,  wpUpdate: null,  theme: "xusmo-child v1.2.0", themeOk: true,  gi: "GI-SERVICE-2026Q1-001",   plugins: [{name:"Yoast SEO",slug:"wordpress-seo",v:"22.3",ok:true,required:true,active:true},{name:"Contact Form 7",slug:"contact-form-7",v:"5.9.8",ok:true,required:true,active:true},{name:"Safe SVG",slug:"safe-svg",v:"2.2",ok:true,required:false,active:true}], response: 360, ssl: 50, backup: "5h ago", built: "Feb 3", user: "sf_priya_s13", pages: 5, media: 8, vps: "vps-02" },
  { id: 14, biz: "Summit Accounting",     owner: "Robert Kim",     email: "rob@summit.ca",            tier: "managed", url: "summitaccounting.ca",   industry: "Accounting",  status: "healthy",  score: 93, wp: "6.7.2", wpOk: true,  wpUpdate: null,  theme: "xusmo-child v1.2.0", themeOk: true,  gi: "GI-SERVICE-2026Q1-001",   plugins: [{name:"Yoast SEO",slug:"wordpress-seo",v:"22.3",ok:true,required:true,active:true},{name:"Contact Form 7",slug:"contact-form-7",v:"5.9.8",ok:true,required:true,active:true},{name:"Safe SVG",slug:"safe-svg",v:"2.2",ok:true,required:false,active:true}], response: 290, ssl: 90, backup: "1h ago", built: "Jan 10", user: "sf_rob_k14", pages: 6, media: 14, vps: "vps-01" },
  { id: 15, biz: "Iron Works Welding",    owner: "Andrei Petrov",  email: "andrei@ironworks.ca",      tier: "hosting", url: "ironworksweld.ca",      industry: "Welding",     status: "healthy",  score: 85, wp: "6.7.2", wpOk: true,  wpUpdate: null,  theme: "xusmo-child v1.2.0", themeOk: true,  gi: "GI-SERVICE-2026Q1-001",   plugins: [{name:"Yoast SEO",slug:"wordpress-seo",v:"22.3",ok:true,required:true,active:true},{name:"Contact Form 7",slug:"contact-form-7",v:"5.9.8",ok:true,required:true,active:true},{name:"Safe SVG",slug:"safe-svg",v:"2.2",ok:true,required:false,active:true}], response: 370, ssl: 44, backup: "4h ago", built: "Feb 10", user: "sf_andrei_p15", pages: 5, media: 12, vps: "vps-02" },
  { id: 16, biz: "Lotus Yoga Studio",     owner: "Maya Singh",     email: "maya@lotusyoga.ca",        tier: "managed", url: "lotusyogastudio.ca",    industry: "Yoga",        status: "healthy",  score: 88, wp: "6.7.2", wpOk: true,  wpUpdate: null,  theme: "xusmo-child v1.2.0", themeOk: true,  gi: "GI-VENUE-2026Q1-001",     plugins: [{name:"Yoast SEO",slug:"wordpress-seo",v:"22.3",ok:true,required:true,active:true},{name:"Contact Form 7",slug:"contact-form-7",v:"5.9.8",ok:true,required:true,active:true},{name:"Safe SVG",slug:"safe-svg",v:"2.2",ok:true,required:false,active:true}], response: 340, ssl: 70, backup: "3h ago", built: "Jan 28", user: "sf_maya_s16", pages: 6, media: 18, vps: "vps-01" },
  { id: 17, biz: "QuickFix HVAC",         owner: "Tom Bradley",    email: "tom@quickfixhvac.ca",      tier: "managed", url: "quickfixhvac.ca",       industry: "HVAC",        status: "warning",  score: 71, wp: "6.7.2", wpOk: true,  wpUpdate: null,  theme: "xusmo-child v1.2.0", themeOk: true,  gi: "GI-SERVICE-2026Q1-001",   plugins: [{name:"Yoast SEO",slug:"wordpress-seo",v:"22.3",ok:true,required:true,active:true},{name:"Contact Form 7",slug:"contact-form-7",v:"5.9",ok:false,update:"5.9.8",required:true,active:true},{name:"Safe SVG",slug:"safe-svg",v:"2.2",ok:true,required:false,active:true}], response: 480, ssl: 38, backup: "8h ago", built: "Feb 12", user: "sf_tom_b17", pages: 5, media: 10, vps: "vps-02" },
  { id: 18, biz: "Artisan Coffee",         owner: "Claire Dubois",  email: "claire@artisancoffee.ca",  tier: "managed", url: "artisancoffeehouse.ca", industry: "Cafe",        status: "healthy",  score: 90, wp: "6.7.2", wpOk: true,  wpUpdate: null,  theme: "xusmo-child v1.2.0", themeOk: true,  gi: "GI-VENUE-2026Q1-001",     plugins: [{name:"Yoast SEO",slug:"wordpress-seo",v:"22.3",ok:true,required:true,active:true},{name:"Contact Form 7",slug:"contact-form-7",v:"5.9.8",ok:true,required:true,active:true},{name:"Safe SVG",slug:"safe-svg",v:"2.2",ok:true,required:false,active:true}], response: 310, ssl: 85, backup: "2h ago", built: "Feb 14", user: "sf_claire_d18", pages: 6, media: 25, vps: "vps-01" },
  { id: 19, biz: "Heritage Homes RE",      owner: "Michael Osei",   email: "michael@heritagehomes.ca", tier: "managed", url: "heritagehomesre.ca",    industry: "Real Estate", status: "healthy",  score: 94, wp: "6.7.2", wpOk: true,  wpUpdate: null,  theme: "xusmo-child v1.2.0", themeOk: true,  gi: "GI-SERVICE-2026Q1-001",   plugins: [{name:"Yoast SEO",slug:"wordpress-seo",v:"22.3",ok:true,required:true,active:true},{name:"Contact Form 7",slug:"contact-form-7",v:"5.9.8",ok:true,required:true,active:true},{name:"Safe SVG",slug:"safe-svg",v:"2.2",ok:true,required:false,active:true}], response: 270, ssl: 92, backup: "1h ago", built: "Feb 16", user: "sf_michael_o19", pages: 10, media: 60, vps: "vps-01" },
  { id: 20, biz: "Zen Garden Spa",         owner: "Mei Lin",         email: "mei@zengardenspa.ca",      tier: "managed", url: "zengardenspa.ca",       industry: "Spa",         status: "healthy",  score: 87, wp: "6.7.2", wpOk: true,  wpUpdate: null,  theme: "xusmo-child v1.2.0", themeOk: true,  gi: "GI-VENUE-2026Q1-001",     plugins: [{name:"Yoast SEO",slug:"wordpress-seo",v:"22.3",ok:true,required:true,active:true},{name:"Contact Form 7",slug:"contact-form-7",v:"5.9.8",ok:true,required:true,active:true},{name:"Safe SVG",slug:"safe-svg",v:"2.2",ok:true,required:false,active:true}], response: 350, ssl: 65, backup: "3h ago", built: "Feb 18", user: "sf_mei_l20", pages: 7, media: 35, vps: "vps-02" },
];

const stColor: Record<string, string> = { healthy: C.green, warning: C.amber, critical: C.red };

export default function AdminSites() {
  const [selected,    setSelected]    = useState<number>(3);
  const [search,      setSearch]      = useState<string>("");
  const [filter,      setFilter]      = useState<string>("all");
  const [tierFilter,  setTierFilter]  = useState<string>("all");
  const [showPass,    setShowPass]    = useState<boolean>(false);

  const filtered = CLIENTS.filter(c => {
    if (filter === "issues" && c.status === "healthy") return false;
    if (tierFilter !== "all" && c.tier !== tierFilter) return false;
    if (search && !c.biz.toLowerCase().includes(search.toLowerCase()) && !c.owner.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const site           = CLIENTS.find(c => c.id === selected) ?? null;
  const healthy        = CLIENTS.filter(c => c.status === "healthy").length;
  const managedCount   = CLIENTS.filter(c => c.tier === "managed").length;
  const hostingCount   = CLIENTS.filter(c => c.tier === "hosting").length;
  const managedMRR     = managedCount * 49;
  const hostingMRR     = hostingCount * 29;
  const totalMrr       = managedMRR + hostingMRR;

  return (
    <div style={{ background: C.bg, minHeight: "100%", color: C.text, fontFamily: "'Inter',-apple-system,sans-serif", fontSize: 14, display: "flex", flexDirection: "column" }}>
      {/* Top Bar */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Zap size={16} color={C.red} />
          <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Xusmo</span>
          <span style={{ color: C.dim }}>·</span>
          <span style={{ color: C.muted, fontSize: 12 }}>{CLIENTS.length} sites total</span>
          <span style={{ color: C.dim }}>·</span>
          <span style={{ color: C.green, fontSize: 12 }}>{healthy} healthy</span>
          <span style={{ color: C.dim }}>·</span>
          <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: C.purple }}>
            <Crown size={11} /> {managedCount} Managed
          </span>
          <span style={{ color: C.dim }}>·</span>
          <span style={{ color: C.blue, fontSize: 12 }}>{hostingCount} Hosting-only</span>
          <span style={{ color: C.dim }}>·</span>
          <span style={{ color: C.green, fontSize: 12, fontWeight: 600 }}>${totalMrr.toLocaleString()}/mo MRR</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn icon={RefreshCw} label="Check All"           color={C.green} />
          <Btn icon={Plug}      label="Update All Plugins"  color={C.blue} />
        </div>
      </div>

      {/* ═══ HORIZONTAL NAVIGATION BAR (replaces vertical sidebar) ═══ */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "10px 20px", flexShrink: 0 }}>
        {/* Search + Filters row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 10px", width: 240 }}>
            <Search size={13} color={C.dim} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sites..." style={{ background: "transparent", border: "none", color: C.text, outline: "none", fontSize: 12, width: "100%" }} />
          </div>
          {/* Status filter */}
          <div style={{ display: "flex", gap: 4 }}>
            {([["all", "All"], ["issues", "Issues"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} style={{ padding: "4px 12px", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: 600, border: `1px solid ${filter === k ? C.red : C.border}`, background: filter === k ? `${C.red}15` : "transparent", color: filter === k ? C.red : C.dim }}>{l}</button>
            ))}
          </div>
          {/* Tier filter */}
          <div style={{ display: "flex", gap: 3 }}>
            {([["all","All Tiers",C.muted],["managed","Managed",C.purple],["hosting","Hosting",C.blue]] as const).map(([k,l,col]) => (
              <button key={k} onClick={() => setTierFilter(k as string)} style={{ padding: "3px 10px", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: 600, border: `1px solid ${tierFilter === k ? col : C.border}`, background: tierFilter === k ? `${col}18` : "transparent", color: tierFilter === k ? col : C.dim }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Horizontal site tabs */}
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{ display: "flex", gap: 2 }}>
            {filtered.map(c => {
              const plugIssues = c.plugins.filter(p => !p.ok).length;
              const isActive   = selected === c.id;
              const tier       = TIERS[c.tier];
              const giDep      = GI_META[c.gi]?.deprecated;
              return (
                <button key={c.id} onClick={() => setSelected(c.id)} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", cursor: "pointer",
                  background: isActive ? `${C.red}10` : "transparent",
                  border: "none",
                  borderBottom: isActive ? `2px solid ${C.red}` : "2px solid transparent",
                  color: isActive ? "#fff" : C.muted,
                  fontSize: 12, fontWeight: isActive ? 600 : 400,
                  whiteSpace: "nowrap", flexShrink: 0,
                  borderRadius: "6px 6px 0 0",
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: stColor[c.status], flexShrink: 0 }} />
                  <span>{c.biz}</span>
                  <span style={{ fontSize: 11, color: tier.color, background: `${tier.color}15`, padding: "2px 8px", borderRadius: 3, fontWeight: 600 }}>
                    {c.tier === "managed" && "\u2605 "}{tier.label}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: c.score >= 80 ? C.green : c.score >= 60 ? C.amber : C.red }}>{c.score}</span>
                  {plugIssues > 0 && <span style={{ fontSize: 11, color: c.plugins.some(p => p.banned) ? C.red : C.amber, fontWeight: 600 }}>{plugIssues} issue{plugIssues > 1 ? "s" : ""}</span>}
                  {giDep && <span style={{ fontSize: 11, color: C.amber, fontWeight: 600 }}>OLD GI</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ SITE DETAIL ═══ */}
      {site && (() => {
        const tier   = TIERS[site.tier];
        const giMeta = GI_META[site.gi];
        return (
          <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: stColor[site.status] }} />
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: 0 }}>{site.biz}</h2>
                  <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 5, background: `${stColor[site.status]}18`, color: stColor[site.status], fontWeight: 600, textTransform: "uppercase" }}>{site.status}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, padding: "3px 10px", borderRadius: 5, background: `${tier.color}18`, color: tier.color, fontWeight: 700, border: `1px solid ${tier.color}30` }}>
                    {site.tier === "managed" && <Crown size={11} />} {tier.label} · ${tier.price}/mo
                  </span>
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12, color: C.muted }}>
                  <span>{site.owner}</span><span>{site.email}</span><span>{site.industry}</span><span>Built {site.built}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <a href="#" style={{ display:"flex",alignItems:"center",gap:4,padding:"7px 14px",borderRadius:6,background:`${C.blue}12`,border:`1px solid ${C.blue}25`,color:C.blue,textDecoration:"none",fontSize:12,fontWeight:500 }}><ExternalLink size={13}/> WP Admin</a>
                <a href="#" style={{ display:"flex",alignItems:"center",gap:4,padding:"7px 14px",borderRadius:6,background:`${C.green}12`,border:`1px solid ${C.green}25`,color:C.green,textDecoration:"none",fontSize:12,fontWeight:500 }}><Globe size={13}/> View Live</a>
              </div>
            </div>

            {/* Tier Context Banner */}
            {site.tier === "hosting" ? (
              <div style={{ background:`${C.blue}08`,border:`1px solid ${C.blue}25`,borderRadius:8,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                <span style={{ color:C.blue,fontSize:12 }}>Hosting-only — no admin agents. Patrol, Plugin Updater, Backup, SSL &amp; Performance agents are <strong>inactive</strong> for this site.</span>
                <button style={{ fontSize:11,padding:"5px 12px",borderRadius:5,background:C.purple,color:"#fff",border:"none",cursor:"pointer",fontWeight:600,whiteSpace:"nowrap",marginLeft:12 }}>Upgrade to Managed ($49/mo)</button>
              </div>
            ) : (
              <div style={{ background:`${C.purple}08`,border:`1px solid ${C.purple}20`,borderRadius:8,padding:"8px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:8 }}>
                <Crown size={13} color={C.purple}/>
                <span style={{ color:C.purple,fontSize:11 }}>Managed — 5 admin agents active: Patrol · Plugin Updater · Backup · SSL/Security · Performance.</span>
              </div>
            )}

            {/* Alerts */}
            {site.plugins.some(p => p.banned) && (
              <div style={{ background:`${C.red}10`,border:`1px solid ${C.red}30`,borderRadius:8,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:8 }}>
                <Shield size={15} color={C.red}/>
                <span style={{ color:C.red,fontWeight:600,fontSize:12 }}>BANNED plugin detected: Wordfence is prohibited on production sites. Remove immediately. Use server-level hardening instead.</span>
              </div>
            )}
            {site.user === "admin" && (
              <div style={{ background:`${C.amber}10`,border:`1px solid ${C.amber}30`,borderRadius:8,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:8 }}>
                <AlertTriangle size={15} color={C.amber}/>
                <span style={{ color:C.amber,fontWeight:600,fontSize:12 }}>Default &quot;admin&quot; username still in use — rotate credentials immediately</span>
              </div>
            )}
            {giMeta?.deprecated && (
              <div style={{ background:`${C.amber}10`,border:`1px solid ${C.amber}30`,borderRadius:8,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:8 }}>
                <Box size={14} color={C.amber}/>
                <span style={{ color:C.amber,fontSize:12,fontWeight:600 }}>Deprecated Golden Image <code style={{ fontFamily:"monospace" }}>{site.gi}</code> — migrate to 2026 Q1 image for latest security patches and performance baselines.</span>
              </div>
            )}

            {/* 3-col grid */}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16 }}>

              {/* Plugins */}
              <div style={{ background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,padding:20 }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#fff",display:"flex",alignItems:"center",gap:6 }}><Plug size={14} color={C.blue}/> Plugins</div>
                  <span style={{ fontSize:11,color:C.dim }}>{site.plugins.length} installed</span>
                </div>
                {site.plugins.map(p => (
                  <div key={p.slug} style={{ padding:"10px 12px",marginBottom:6,borderRadius:8,background:p.banned?`${C.red}08`:C.alt,border:`1px solid ${p.banned?`${C.red}25`:C.border}` }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                        <span style={{ fontWeight:600,color:p.banned?C.red:"#fff",fontSize:12 }}>{p.name}</span>
                        {p.required&&<Lock size={9} color={C.blue}/>}
                        {p.banned&&<span style={{ fontSize:11,fontWeight:700,color:C.red,background:`${C.red}18`,padding:"2px 8px",borderRadius:3 }}>BANNED</span>}
                      </div>
                      {p.active?<span style={{ fontSize:11,color:C.green }}>active</span>:<span style={{ fontSize:11,color:C.dim }}>inactive</span>}
                    </div>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                      <span style={{ fontSize:11,color:C.dim,fontFamily:"monospace" }}>v{p.v}</span>
                      <div style={{ display:"flex",gap:4 }}>
                        {p.banned&&<ActionBtn label="Remove Now" color={C.red}/>}
                        {p.update&&!p.banned&&<ActionBtn label={`\u2192 ${p.update}`} color={C.amber}/>}
                        {!p.required&&!p.banned&&p.active&&<ActionBtn label="Deactivate" color={C.dim}/>}
                        {!p.banned&&!p.active&&<ActionBtn label="Activate" color={C.green}/>}
                        {!p.required&&!p.banned&&<ActionBtn label="Remove" color={C.red}/>}
                      </div>
                    </div>
                  </div>
                ))}
                <button style={{ marginTop:8,fontSize:11,padding:"8px",borderRadius:7,background:`${C.blue}10`,border:`1px solid ${C.blue}20`,color:C.blue,cursor:"pointer",width:"100%",fontWeight:500 }}>+ Install Plugin</button>
              </div>

              {/* Health */}
              <div style={{ background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,padding:20 }}>
                <div style={{ fontSize:13,fontWeight:700,color:"#fff",marginBottom:16,display:"flex",alignItems:"center",gap:6 }}><Activity size={14} color={C.green}/> Health &amp; Stack</div>
                <HealthRow label="Health Score"  value={`${site.score}/100`}  ok={site.score>=80}/>
                <HealthRow label="WordPress"     value={site.wp}              ok={site.wpOk} action={!site.wpOk?`Update \u2192 ${site.wpUpdate}`:null}/>
                <HealthRow label="Child Theme"   value={site.theme}           ok={site.themeOk} action={!site.themeOk?"Update \u2192 v1.2.0":null}/>
                <HealthRow label="SSL"           value={site.ssl>0?`${site.ssl} days`:"EXPIRED!"} ok={site.ssl>7} action={site.ssl<=7?"Renew":null}/>
                <HealthRow label="Last Backup"   value={site.backup}          ok={!site.backup.includes("48")&&!site.backup.includes("12")} action={site.backup.includes("48")?"Backup Now":null}/>
                <HealthRow label="Response"      value={`${site.response}ms`} ok={site.response<500}/>
                <HealthRow label="Pages"         value={site.pages}           ok/>
                <HealthRow label="Media Files"   value={site.media}           ok/>
                <HealthRow label="Server"        value={site.vps}             ok/>

                {/* GI Lineage Panel */}
                <div style={{ marginTop:14,padding:"10px 12px",background:C.alt,borderRadius:8,border:`1px solid ${giMeta?.deprecated?`${C.amber}30`:C.border}` }}>
                  <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:6 }}>
                    <Box size={12} color={giMeta?.deprecated?C.amber:C.cyan}/>
                    <span style={{ fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase" }}>Golden Image</span>
                  </div>
                  <div style={{ fontFamily:"monospace",fontSize:11,color:giMeta?.deprecated?C.amber:C.cyan,fontWeight:600,marginBottom:3 }}>{site.gi}</div>
                  <div style={{ fontSize:11,color:C.dim }}>Archetype: {giMeta?.archetype} · {giMeta?.gen}</div>
                  {giMeta?.prev&&<div style={{ fontSize:11,color:C.dim,marginTop:2 }}>Prev: <span style={{ fontFamily:"monospace",color:C.dim }}>{giMeta.prev}</span></div>}
                  {giMeta?.deprecated&&<div style={{ fontSize:11,color:C.amber,marginTop:4,fontWeight:600 }}>&#9888; Deprecated — upgrade available</div>}
                </div>

                <div style={{ display:"flex",gap:6,marginTop:14 }}>
                  <button style={{ flex:1,fontSize:11,padding:"8px",borderRadius:7,background:`${C.green}10`,border:`1px solid ${C.green}20`,color:C.green,cursor:"pointer",fontWeight:500 }}>Health Check</button>
                  <button style={{ flex:1,fontSize:11,padding:"8px",borderRadius:7,background:`${C.blue}10`,border:`1px solid ${C.blue}20`,color:C.blue,cursor:"pointer",fontWeight:500 }}>Force Backup</button>
                </div>
              </div>

              {/* Access */}
              <div style={{ background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,padding:16 }}>
                <div style={{ fontSize:13,fontWeight:700,color:"#fff",marginBottom:14,display:"flex",alignItems:"center",gap:6 }}><Lock size={14} color={C.purple}/> Access &amp; Actions</div>
                <div style={{ background:C.alt,borderRadius:8,padding:12,marginBottom:14,border:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:11,fontWeight:600,color:C.muted,marginBottom:8 }}>WP ADMIN CREDENTIALS</div>
                  <CredRow label="URL"      value={`${site.url}/wp-admin`} link/>
                  <CredRow label="Username" value={site.user} warn={site.user==="admin"}/>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0" }}>
                    <span style={{ color:C.dim,fontSize:11 }}>Password</span>
                    <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                      <span style={{ fontFamily:"monospace",fontSize:11,color:C.text }}>{showPass?"Xk9#mP2$vL7!":"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
                      <button onClick={()=>setShowPass(!showPass)} style={{ background:"none",border:"none",cursor:"pointer",padding:2 }}>
                        {showPass?<EyeOff size={12} color={C.dim}/>:<Eye size={12} color={C.dim}/>}
                      </button>
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                  <SiteAction label="Open WP Admin"         icon={ExternalLink} color={C.blue}/>
                  <SiteAction label="View Live Site"        icon={Globe}        color={C.green}/>
                  <SiteAction label="Update All Plugins"    icon={Plug}         color={C.amber}/>
                  <SiteAction label="Rotate Credentials"    icon={Lock}         color={C.purple}/>
                  <SiteAction label="Security Hardening"    icon={Shield}       color={C.cyan}/>
                  {site.tier==="hosting"&&<SiteAction label="Upgrade \u2192 Managed ($49/mo)" icon={Crown} color={C.purple}/>}
                  <div style={{ height:1,background:C.border,margin:"4px 0" }}/>
                  <SiteAction label="Suspend Site"          icon={XCircle}      color={C.red}/>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function Btn({ icon: Icon, label, color }: { icon: React.ComponentType<{ size: number }>; label: string; color: string }) {
  return <button style={{ display:"flex",alignItems:"center",gap:5,background:`${color}12`,color,border:`1px solid ${color}30`,borderRadius:6,padding:"6px 12px",cursor:"pointer",fontSize:11,fontWeight:500 }}><Icon size={12}/>{label}</button>;
}

function ActionBtn({ label, color }: { label: string; color: string }) {
  return <button style={{ fontSize:11,padding:"2px 8px",borderRadius:4,background:`${color}12`,border:`1px solid ${color}25`,color,cursor:"pointer",fontWeight:500 }}>{label}</button>;
}

function HealthRow({ label, value, ok, action }: { label: string; value: string | number; ok: boolean; action?: string | null }) {
  return (
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${C.border}08` }}>
      <span style={{ color:C.dim,fontSize:12 }}>{label}</span>
      <div style={{ display:"flex",alignItems:"center",gap:5 }}>
        <span style={{ color:ok?C.text:C.amber,fontWeight:ok?400:600,fontSize:12 }}>{value}</span>
        {ok?<CheckCircle2 size={11} color={C.green}/>:<AlertTriangle size={11} color={C.amber}/>}
        {action&&<button style={{ fontSize:11,padding:"2px 8px",borderRadius:3,background:`${C.amber}12`,border:`1px solid ${C.amber}25`,color:C.amber,cursor:"pointer" }}>{action}</button>}
      </div>
    </div>
  );
}

function CredRow({ label, value, link, warn }: { label: string; value: string; link?: boolean; warn?: boolean }) {
  return (
    <div style={{ display:"flex",justifyContent:"space-between",padding:"5px 0" }}>
      <span style={{ color:C.dim,fontSize:11 }}>{label}</span>
      {link?(<a href="#" style={{ color:C.blue,textDecoration:"none",fontSize:11,display:"flex",alignItems:"center",gap:3 }}>{value}<ExternalLink size={9}/></a>):(<span style={{ fontFamily:"monospace",fontSize:11,color:warn?C.red:C.text,fontWeight:warn?700:400 }}>{value}{warn&&" \u26a0\ufe0f"}</span>)}
    </div>
  );
}

function SiteAction({ label, icon: Icon, color }: { label: string; icon: React.ComponentType<{ size: number }>; color: string }) {
  return <button style={{ display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 12px",borderRadius:7,background:`${color}08`,border:`1px solid ${color}18`,color,cursor:"pointer",fontSize:12,fontWeight:500 }}><Icon size={13}/>{label}</button>;
}
