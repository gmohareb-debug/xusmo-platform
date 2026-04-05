"use client";

// =============================================================================
// Admin Layout — Dark sidebar with indigo accents, admin-only session check
// =============================================================================

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface SessionUser {
  name?: string | null;
  email?: string | null;
  role?: string;
}

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    exact: true,
  },
  {
    href: "/admin/tenants",
    label: "Tenants",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    exact: false,
  },
  {
    href: "/admin/sites",
    label: "Client Sites",
    icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
    exact: false,
  },
  {
    href: "/admin/operations",
    label: "WP Operations",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    exact: false,
  },
  {
    href: "/admin/plugins",
    label: "Plugins & Theme",
    icon: "M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z",
    exact: false,
  },
  {
    href: "/admin/lab",
    label: "Lab & Agents",
    icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
    exact: false,
  },
  {
    href: "/admin/audit",
    label: "Audit Trail",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    exact: false,
  },
  {
    href: "/admin/activity",
    label: "Activity Log",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    exact: false,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        const user = data?.user as SessionUser | undefined;
        if (!user || user.role !== "ADMIN") {
          router.replace("/auth/signin");
        } else {
          setSessionUser(user);
          setChecking(false);
        }
      })
      .catch(() => {
        router.replace("/auth/signin");
      });
  }, [router]);

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  if (checking) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "#F8F9FC" }}
      >
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "#4F46E5", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#F8F9FC" }}>
      {/* Light Sidebar */}
      <aside
        className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0"
        style={{ backgroundColor: "#FFFFFF", borderRight: "1px solid #E2E8F0" }}
      >
        {/* Branding */}
        <div
          className="flex h-16 items-center gap-3 px-5"
          style={{ borderBottom: "1px solid #E2E8F0" }}
        >
          <Link
            href="/admin"
            className="font-display text-xl font-bold tracking-tight"
            style={{ color: "#1E293B" }}
          >
            Xus<span style={{ color: "#4F46E5" }}>mo</span>
          </Link>
          <span
            className="rounded-md px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: "rgba(79,70,229,0.1)", color: "#4F46E5" }}
          >
            Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: active
                    ? "rgba(79,70,229,0.08)"
                    : "transparent",
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

        {/* Sidebar footer */}
        <div
          className="p-4"
          style={{ borderTop: "1px solid #E2E8F0" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{
                backgroundColor: "rgba(79,70,229,0.1)",
                color: "#4F46E5",
              }}
            >
              {(
                sessionUser?.name?.[0] ??
                sessionUser?.email?.[0] ??
                "A"
              ).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div
                className="text-sm font-medium truncate"
                style={{ color: "#1E293B" }}
              >
                {sessionUser?.name ?? "Admin"}
              </div>
              <div
                className="text-[11px] truncate"
                style={{ color: "#94A3B8" }}
              >
                {sessionUser?.email ?? ""}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Link
              href="/studio"
              className="flex items-center gap-2 text-xs font-medium"
              style={{ color: "#94A3B8" }}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Studio
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: "#94A3B8", background: "none", border: "none", cursor: "pointer" }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col md:pl-60">
        <header
          className="sticky top-0 z-30 flex h-14 items-center justify-between px-6"
          style={{
            backgroundColor: "#FFFFFF",
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          <span className="text-sm font-medium" style={{ color: "#94A3B8" }}>
            Admin Panel
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-medium"
              style={{ color: "#4F46E5" }}
            >
              View Site
            </Link>
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold"
              style={{ backgroundColor: "rgba(79,70,229,0.1)", color: "#4F46E5" }}
            >
              {(
                sessionUser?.name?.[0] ??
                sessionUser?.email?.[0] ??
                "A"
              ).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
