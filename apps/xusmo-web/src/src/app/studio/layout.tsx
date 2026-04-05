"use client";

// =============================================================================
// Studio Layout — Client workspace with dark theme, auth check, top nav,
// notification bell
// =============================================================================

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Bell, LogOut } from "lucide-react";
import { C } from "@/lib/studio/colors";
import TenantSwitcher from "@/components/studio/TenantSwitcher";
import MySitesDropdown from "@/components/studio/MySitesDropdown";

interface TenantInfo {
  tenantId: string;
  slug: string;
  role: string;
  planName: string;
  status: string;
}

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  activeTenantId?: string;
  tenants?: TenantInfo[];
}

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checking, setChecking] = useState(true);

  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then(async (data) => {
        if (!data?.user) {
          router.replace("/auth/signin");
          return;
        }

        const sessionUser = data.user as SessionUser;

        // If user has no tenants, try to auto-provision
        if (!sessionUser.tenants || sessionUser.tenants.length === 0) {
          try {
            const provRes = await fetch("/api/auth/ensure-tenant", { method: "POST" });
            if (provRes.ok) {
              // Refresh session to pick up new tenant
              const refreshed = await fetch("/api/auth/session").then(r => r.json());
              if (refreshed?.user) {
                setUser(refreshed.user as SessionUser);
                setChecking(false);
                return;
              }
            }
          } catch {
            // Fall through — show user anyway
          }
        }

        setUser(sessionUser);
        setChecking(false);
      })
      .catch(() => {
        router.replace("/auth/signin");
      });
  }, [router]);

  // Fetch notifications
  useEffect(() => {
    if (!user) return;
    const fetchNotifs = () => {
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((d) => {
          setNotifications(d.notifications || []);
          setUnreadCount(d.unreadCount || 0);
        })
        .catch(() => {});
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "PUT" });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (checking) {
    return (
      <div
        style={{
          backgroundColor: C.bg,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: `2px solid ${C.accent}`,
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const initials = (
    user?.name?.[0] ?? user?.email?.[0] ?? "U"
  ).toUpperCase();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg }}>
      {/* Top Navigation Bar */}
      <header
        style={{
          backgroundColor: C.surface,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 40,
          borderBottom: "none",
          boxShadow: `0 1px 0 0 ${C.border}`,
        }}
      >
        {/* Gradient accent line at the bottom of the header */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background: C.gradient,
            opacity: 0.6,
          }}
        />

        {/* Left: Logo + Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <Link
            href="/studio"
            style={{
              textDecoration: "none",
              fontSize: 18,
              fontWeight: 700,
              fontFamily: "'Inter',-apple-system,sans-serif",
              letterSpacing: "-0.5px",
              background: C.gradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Xusmo
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <MySitesDropdown />
            {[
              { href: "/studio/team", label: "Team" },
              { href: "/studio/settings", label: "Settings" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 500,
                  color: C.muted,
                  padding: "6px 12px",
                  borderRadius: 6,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = C.text;
                  (e.currentTarget as HTMLElement).style.background = C.surfaceAlt;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = C.muted;
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Tenant Switcher */}
          {user?.tenants && user.tenants.length > 1 && (
            <TenantSwitcher
              activeTenantId={user.activeTenantId}
              tenants={user.tenants}
              variant="studio"
            />
          )}
        </div>

        {/* Right: Notifications + User avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Notification Bell */}
          <div ref={bellRef} style={{ position: "relative" }}>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              style={{
                position: "relative",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 6,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                color: showNotifs ? C.accent : C.muted,
              }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: C.red,
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifs && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: 8,
                  width: 380,
                  maxHeight: 480,
                  overflowY: "auto",
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  fontFamily: "'Inter',-apple-system,sans-serif",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: C.accent,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div
                    style={{
                      padding: "32px 16px",
                      textAlign: "center",
                      color: C.dim,
                      fontSize: 13,
                    }}
                  >
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.linkUrl || "#"}
                      onClick={() => setShowNotifs(false)}
                      style={{
                        display: "block",
                        padding: "12px 16px",
                        borderBottom: `1px solid ${C.border}`,
                        textDecoration: "none",
                        background: n.isRead ? "transparent" : `${C.accent}08`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                        }}
                      >
                        {!n.isRead && (
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: C.accent,
                              marginTop: 6,
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: n.isRead ? 400 : 600,
                              color: C.text,
                              marginBottom: 2,
                            }}
                          >
                            {n.title}
                          </div>
                          {n.body && (
                            <div style={{ fontSize: 12, color: C.muted }}>
                              {n.body}
                            </div>
                          )}
                          <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>
                            {timeAgo(n.createdAt)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          {/* User */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>
                {user?.name ?? "User"}
              </div>
              <div style={{ fontSize: 11, color: C.dim }}>
                {user?.email ?? ""}
              </div>
            </div>
            {user?.image ? (
              <img
                src={user.image}
                alt=""
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: `2px solid ${C.border}`,
                }}
              />
            ) : (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: `${C.accent}20`,
                  color: C.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {initials}
              </div>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              title="Sign out"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 6,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                color: C.muted,
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ minHeight: "calc(100vh - 56px)" }}>{children}</main>
    </div>
  );
}
