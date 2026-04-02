"use client";

// =============================================================================
// Site Workspace Layout — Left sidebar navigation with all Studio screens
// =============================================================================

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  MessageSquare,
  PenLine,
  BookOpen,
  ImagePlus,
  Zap,
  Star,
  Inbox,
  LayoutGrid,
  Search,
  Palette,
  Globe,
  BarChart2,
  ShieldCheck,
  Share2,
  Users,
  Rocket,
  Package,
  CreditCard,
  LifeBuoy,
  Loader2,
  ChevronLeft,
  ShoppingCart,
  Truck,
  Tags,
  DollarSign,
  ClipboardList,
  Boxes,
} from "lucide-react";
import { C } from "@/lib/studio/colors";
import StudioAgent from "./StudioAgent";

interface SiteDetails {
  id: string;
  businessName: string;
  status: string;
  wpUrl: string | null;
  archetype: string;
  tier: string;
  isEcommerce: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  phase: string;
  showFor?: string[];
}

const STATUS_COLOR: Record<string, string> = {
  STAGING: C.blue,
  LIVE: C.green,
  SUSPENDED: C.red,
  MAINTENANCE: C.amber,
};

const ALL_STATUSES = ["STAGING", "LIVE", "SUSPENDED", "MAINTENANCE"];

const STORE_SECTION: { label: string; items: NavItem[] } = {
  label: "STORE",
  items: [
    { id: "products",  label: "Products",   icon: ShoppingCart,  phase: "store" },
    { id: "orders",    label: "Orders",     icon: ClipboardList, phase: "store" },
    { id: "suppliers", label: "Suppliers",  icon: Truck,         phase: "store" },
    { id: "inventory", label: "Inventory",  icon: Boxes,         phase: "store" },
    { id: "pricing",   label: "Pricing",    icon: DollarSign,    phase: "store" },
  ],
};

const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "MANAGE",
    items: [
      { id: "aidesigner", label: "AI Designer",     icon: Zap,         phase: "manage" },
      { id: "preview",  label: "Preview & Review", icon: Eye,         phase: "manage" },
      { id: "content",  label: "Content",          icon: PenLine,     phase: "manage" },
      { id: "blog",     label: "Blog",             icon: BookOpen,    phase: "manage" },
      { id: "assets",   label: "Assets",           icon: ImagePlus,   phase: "manage" },
      { id: "reviews",  label: "Reviews",          icon: Star,        phase: "manage" },
      { id: "leads",    label: "Leads",            icon: Inbox,       phase: "manage" },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      { id: "pages",   label: "Pages",   icon: LayoutGrid, phase: "settings" },
      { id: "seo",     label: "SEO",     icon: Search,     phase: "settings" },
      { id: "design",  label: "Design",  icon: Palette,    phase: "settings" },
      { id: "domain",  label: "Domain",  icon: Globe,      phase: "settings", showFor: ["LIVE", "MAINTENANCE"] },
    ],
  },
  {
    label: "GROWTH",
    items: [
      { id: "analytics", label: "Analytics",   icon: BarChart2,   phase: "growth" },
      { id: "health",    label: "Site Health",  icon: ShieldCheck, phase: "growth" },
      { id: "share",     label: "Share Preview",icon: Share2,      phase: "growth" },
      { id: "team",      label: "Team",         icon: Users,       phase: "growth" },
    ],
  },
  {
    label: "OTHER",
    items: [
      { id: "review",   label: "Revision Request", icon: MessageSquare, phase: "other" },
      { id: "addons",   label: "Add Features",     icon: Package,       phase: "other" },
      { id: "billing",  label: "Billing",           icon: CreditCard,    phase: "other", showFor: ["LIVE", "MAINTENANCE"] },
      { id: "support",  label: "Support",           icon: LifeBuoy,      phase: "other" },
    ],
  },
];

export default function SiteWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const siteId = params.siteId as string;

  const [site, setSite] = useState<SiteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/portal/sites")
      .then((r) => r.json())
      .then((data) => {
        const sites = Array.isArray(data) ? data : [];
        const found = sites.find((s: SiteDetails) => s.id === siteId);
        setSite(found || null);
      })
      .catch(() => setSite(null))
      .finally(() => setLoading(false));
  }, [siteId]);

  // Fetch badge counts
  useEffect(() => {
    if (!siteId) return;
    // Fetch new leads count
    fetch(`/api/studio/${siteId}/leads?status=NEW&limit=1`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.stats?.newToday !== undefined) {
          setBadges((prev) => ({ ...prev, leads: d.stats.newToday }));
        }
      })
      .catch(() => {});
  }, [siteId]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 300,
          color: C.muted,
          fontFamily: "'Inter',-apple-system,sans-serif",
        }}
      >
        <Loader2 size={20} style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
        <span style={{ fontSize: 13 }}>Loading site...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!site) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: C.dim, fontFamily: "'Inter',-apple-system,sans-serif", fontSize: 14 }}>
        Site not found. It may have been removed or you don&apos;t have access.
      </div>
    );
  }

  const basePath = `/studio/site/${siteId}`;
  const statusColor = STATUS_COLOR[site.status] || C.dim;

  return (
    <>
    <div style={{ display: "flex", height: "calc(100vh - 56px)", fontFamily: "'Inter',-apple-system,sans-serif", fontSize: 14 }}>
      {/* Left Sidebar */}
      <aside
        style={{
          width: 220,
          background: C.surface,
          borderRight: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          overflowY: "auto",
        }}
      >
        {/* Site Header */}
        <div style={{ padding: "16px 14px 12px", borderBottom: `1px solid ${C.border}` }}>
          <Link
            href="/studio"
            style={{
              display: "flex", alignItems: "center", gap: 4,
              fontSize: 11, color: C.dim, textDecoration: "none", marginBottom: 10,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = C.accent;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = C.dim;
            }}
          >
            <ChevronLeft size={12} /> All Sites
          </Link>
          <div style={{
            fontSize: 17,
            fontWeight: 800,
            color: C.accent,
            marginBottom: 8,
            letterSpacing: "-0.3px",
            lineHeight: 1.2,
          }}>
            {site.businessName}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
              background: `${statusColor}15`, color: statusColor,
            }}>
              {site.status}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4,
              background: `${C.blue}15`, color: C.blue,
            }}>
              {site.tier}
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav style={{ flex: 1, padding: "8px 0" }}>
          {[...NAV_SECTIONS.slice(0, 1),
            ...(site.isEcommerce || site.archetype === "COMMERCE" ? [STORE_SECTION] : []),
            ...NAV_SECTIONS.slice(1),
          ].map((section) => {
            const visibleItems = section.items.filter(
              (item) => !item.showFor || item.showFor.includes(site.status)
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.label} style={{ marginBottom: 4 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: C.dim, padding: "10px 14px 4px",
                  letterSpacing: "0.5px",
                }}>
                  {section.label}
                </div>
                {visibleItems.map((item) => {
                  const href = `${basePath}/${item.id}`;
                  const isActive = pathname === href || pathname.startsWith(href + "/");
                  const Icon = item.icon;
                  const badgeCount = badges[item.id] || 0;

                  return (
                    <Link
                      key={item.id}
                      href={href}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "7px 14px",
                        margin: "1px 6px",
                        borderRadius: "0 6px 6px 0",
                        fontSize: 13,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? C.text : C.muted,
                        textDecoration: "none",
                        background: isActive ? `${C.accent}12` : "transparent",
                        borderLeft: isActive ? `4px solid ${C.accent}` : "4px solid transparent",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = C.surfaceAlt;
                          (e.currentTarget as HTMLElement).style.color = C.text;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                          (e.currentTarget as HTMLElement).style.color = C.muted;
                        }
                      }}
                    >
                      <span style={{ color: isActive ? C.accent : "inherit", display: "flex" }}>
                        <Icon size={15} />
                      </span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {badgeCount > 0 && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "1px 6px",
                          borderRadius: 8, background: C.red, color: "#fff",
                          minWidth: 16, textAlign: "center",
                        }}>
                          {badgeCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: "auto" }}>
        {children}
      </main>
    </div>

    {/* Floating AI Agent — hide on AI Designer page (has its own inline chat) */}
    {!pathname.includes("/aidesigner") && <StudioAgent siteId={siteId} />}
    </>
  );
}
