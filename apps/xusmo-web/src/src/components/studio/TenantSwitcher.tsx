"use client";

// =============================================================================
// Tenant Switcher — Dropdown to switch between tenants the user belongs to
// Shown in studio + portal layouts for multi-tenant users
// =============================================================================

import { useState, useRef, useEffect } from "react";
import { Building2, ChevronDown, Check } from "lucide-react";
import { C } from "@/lib/studio/colors";

interface TenantInfo {
  tenantId: string;
  slug: string;
  role: string;
  planName: string;
  status: string;
}

interface TenantSwitcherProps {
  activeTenantId?: string;
  tenants: TenantInfo[];
  variant?: "studio" | "portal";
}

const PLAN_COLORS: Record<string, string> = {
  starter: C.blue,
  growth: C.green,
  enterprise: C.purple,
};

const ROLE_LABELS: Record<string, string> = {
  PLATFORM_OWNER: "Platform Owner",
  PLATFORM_OPS: "Platform Ops",
  PLATFORM_SUPPORT: "Support",
  TENANT_OWNER: "Owner",
  TENANT_ADMIN: "Admin",
  TENANT_CATALOG: "Catalog",
  TENANT_OPS: "Operations",
  DEV_APP_OWNER: "Developer",
};

export default function TenantSwitcher({
  activeTenantId,
  tenants,
  variant = "studio",
}: TenantSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!tenants || tenants.length <= 1) return null;

  const active = tenants.find((t) => t.tenantId === activeTenantId) ?? tenants[0];

  const switchTenant = async (tenantId: string) => {
    if (tenantId === activeTenantId || switching) return;
    setSwitching(true);
    try {
      const res = await fetch("/api/tenant/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch {
      // ignore
    } finally {
      setSwitching(false);
      setOpen(false);
    }
  };

  const isPortal = variant === "portal";
  const textColor = isPortal ? "#1E293B" : C.text;
  const mutedColor = isPortal ? "#64748B" : C.muted;
  const borderColor = isPortal ? "#E2E8F0" : C.border;
  const bgColor = isPortal ? "#ffffff" : C.surface;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          background: open ? `${C.accent}08` : "transparent",
          border: `1px solid ${open ? C.accent : borderColor}`,
          borderRadius: 8,
          cursor: "pointer",
          transition: "all 0.15s",
          minWidth: 0,
        }}
      >
        <Building2 size={15} color={C.accent} />
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: textColor,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 140,
          }}
        >
          {active.slug}
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            color: PLAN_COLORS[active.planName] ?? C.dim,
            padding: "1px 5px",
            borderRadius: 4,
            background: `${PLAN_COLORS[active.planName] ?? C.dim}15`,
          }}
        >
          {active.planName}
        </span>
        <ChevronDown
          size={14}
          color={mutedColor}
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
        />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: 6,
            width: 280,
            background: bgColor,
            border: `1px solid ${borderColor}`,
            borderRadius: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
            zIndex: 50,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              borderBottom: `1px solid ${borderColor}`,
              fontSize: 11,
              fontWeight: 600,
              color: mutedColor,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Switch Workspace
          </div>

          {tenants.map((t) => {
            const isActive = t.tenantId === activeTenantId;
            return (
              <button
                key={t.tenantId}
                onClick={() => switchTenant(t.tenantId)}
                disabled={switching}
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  padding: "10px 14px",
                  gap: 10,
                  background: isActive ? `${C.accent}08` : "transparent",
                  border: "none",
                  borderBottom: `1px solid ${borderColor}`,
                  cursor: isActive ? "default" : "pointer",
                  textAlign: "left",
                  opacity: switching && !isActive ? 0.5 : 1,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: `${C.accent}15`,
                    color: C.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {t.slug[0]?.toUpperCase() ?? "T"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      color: textColor,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.slug}
                  </div>
                  <div style={{ fontSize: 11, color: mutedColor }}>
                    {ROLE_LABELS[t.role] ?? t.role} &middot; {t.planName}
                  </div>
                </div>
                {isActive && <Check size={16} color={C.accent} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
