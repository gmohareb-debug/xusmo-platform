"use client";

// =============================================================================
// Portal Layout — Clean sidebar + top bar (light theme, indigo accents)
// =============================================================================

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import SupportChat from "@/components/portal/SupportChat";
import TenantSwitcher from "@/components/studio/TenantSwitcher";

interface TenantInfo {
  tenantId: string;
  slug: string;
  role: string;
  planName: string;
  status: string;
}

const NAV_ITEMS = [
  {
    href: "/portal",
    label: "Dashboard",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    exact: true,
  },
  {
    href: "/portal/sites",
    label: "My Sites",
    icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
    exact: false,
  },
  {
    href: "/portal/billing",
    label: "Billing",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    exact: false,
  },
  {
    href: "/portal/usage",
    label: "Usage",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    exact: false,
  },
  {
    href: "/portal/domains",
    label: "Domains",
    icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
    exact: false,
  },
  {
    href: "/portal/support",
    label: "Support",
    icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    exact: false,
  },
  {
    href: "/portal/settings",
    label: "Settings",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    exact: false,
  },
];

// Bottom tab items for mobile (subset of nav)
const MOBILE_TABS = [
  { href: "/portal", label: "Home", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", exact: true },
  { href: "/portal/sites", label: "Sites", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9", exact: false },
  { href: "/portal/billing", label: "Billing", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", exact: false },
  { href: "/portal/support", label: "Support", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", exact: false },
  { href: "/portal/settings", label: "More", icon: "M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z", exact: false },
];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [activeTenantId, setActiveTenantId] = useState<string | undefined>();

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.tenants) {
          setTenants(data.user.tenants);
          setActiveTenantId(data.user.activeTenantId);
        }
      })
      .catch(() => {});
  }, []);

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0"
        style={{ backgroundColor: "#ffffff", borderRight: "1px solid #E2E8F0" }}
      >
        {/* Logo */}
        <div
          className="flex h-16 items-center px-6"
          style={{ borderBottom: "1px solid #E2E8F0" }}
        >
          <Link
            href="/"
            className="font-display text-xl font-bold text-neutral-900 tracking-tight"
          >
            Xus<span style={{ color: "#4F46E5" }}>mo</span>
          </Link>
        </div>

        {/* Tenant Switcher */}
        {tenants.length > 1 && (
          <div className="px-4 mt-3">
            <TenantSwitcher
              activeTenantId={activeTenantId}
              tenants={tenants}
              variant="portal"
            />
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 mt-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: active ? "#EEF2FF" : "transparent",
                  color: active ? "#4F46E5" : "#64748B",
                }}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={item.icon}
                  />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer — Build CTA */}
        <div className="p-4" style={{ borderTop: "1px solid #E2E8F0" }}>
          <Link
            href="/interview"
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{ backgroundColor: "#4F46E5" }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Build New Site
          </Link>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 md:hidden"
            style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 w-72 md:hidden"
            style={{ backgroundColor: "#ffffff" }}
          >
            <div
              className="flex h-16 items-center justify-between px-6"
              style={{ borderBottom: "1px solid #E2E8F0" }}
            >
              <Link
                href="/"
                className="font-display text-xl font-bold text-neutral-900 tracking-tight"
              >
                Xus<span style={{ color: "#4F46E5" }}>mo</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1"
                style={{ color: "#94A3B8" }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="mt-4 px-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
                    style={{
                      backgroundColor: active ? "#EEF2FF" : "transparent",
                      color: active ? "#4F46E5" : "#64748B",
                    }}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4" style={{ borderTop: "1px solid #E2E8F0" }}>
              <Link
                href="/interview"
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
                style={{ backgroundColor: "#4F46E5" }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Build New Site
              </Link>
            </div>
          </aside>
        </>
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col md:pl-64">
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 flex h-16 items-center justify-between px-6"
          style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #E2E8F0" }}
        >
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 md:hidden"
            style={{ color: "#64748B" }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Breadcrumb placeholder */}
          <div className="hidden md:block" />

          {/* Right side */}
          <div className="flex items-center gap-4 ml-auto">
            <Link
              href="/interview"
              className="hidden md:inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{ backgroundColor: "#4F46E5" }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Build New Site
            </Link>

            {/* User avatar + sign out */}
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: "#EEF2FF", color: "#4F46E5" }}
            >
              U
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs font-medium"
              style={{ color: "#94A3B8", background: "none", border: "none", cursor: "pointer" }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6">{children}</main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex md:hidden"
        style={{
          backgroundColor: "#ffffff",
          borderTop: "1px solid #E2E8F0",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {MOBILE_TABS.map((tab) => {
          const active = isActive(tab.href, tab.exact);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-1 flex-col items-center gap-1 py-2 text-center"
              style={{ color: active ? "#4F46E5" : "#94A3B8" }}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={active ? 2 : 1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
              </svg>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Floating support chat */}
      <SupportChat />
    </div>
  );
}
