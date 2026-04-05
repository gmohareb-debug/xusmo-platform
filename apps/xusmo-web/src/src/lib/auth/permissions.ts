// =============================================================================
// RBAC Permission System (ported from Dropnex Capabilities.php)
// Maps TenantRole → capability strings. 8 roles across 3 tiers.
// Usage: import { hasCapability } from "@/lib/auth/permissions";
// =============================================================================

import type { TenantRole } from "@prisma/client";

// All capability strings in the system
export type Capability =
  // Platform tier
  | "platform_access"
  | "manage_tenants"
  | "manage_plans"
  | "manage_marketplace"
  | "platform_security"
  | "platform_ops"
  | "support_impersonate"
  // Tenant tier
  | "tenant_access"
  | "manage_suppliers"
  | "manage_imports"
  | "publish_catalog"
  | "manage_orders"
  | "manage_pricing"
  | "manage_inventory"
  | "manage_rmas"
  | "view_analytics"
  | "manage_settings"
  | "manage_apps"
  // Developer tier
  | "dev_portal_access"
  | "manage_own_apps"
  | "access_sandboxes";

// Exact mapping from Dropnex Capabilities.php
const ALL_TENANT_CAPS: Capability[] = [
  "tenant_access",
  "manage_suppliers",
  "manage_imports",
  "publish_catalog",
  "manage_orders",
  "manage_pricing",
  "manage_inventory",
  "manage_rmas",
  "view_analytics",
  "manage_settings",
  "manage_apps",
];

const ALL_DEV_CAPS: Capability[] = [
  "dev_portal_access",
  "manage_own_apps",
  "access_sandboxes",
];

export const ROLE_CAPABILITIES: Record<TenantRole, Capability[]> = {
  // Platform tier — control plane operators
  PLATFORM_OWNER: [
    "platform_access",
    "manage_tenants",
    "manage_plans",
    "manage_marketplace",
    "platform_security",
    "platform_ops",
    "support_impersonate",
    ...ALL_TENANT_CAPS,
    ...ALL_DEV_CAPS,
  ],
  PLATFORM_OPS: ["platform_access", "platform_ops", "manage_marketplace"],
  PLATFORM_SUPPORT: ["platform_access", "support_impersonate"],

  // Tenant tier — merchant/store owners
  TENANT_OWNER: [...ALL_TENANT_CAPS],
  TENANT_ADMIN: [...ALL_TENANT_CAPS],
  TENANT_CATALOG: [
    "tenant_access",
    "manage_suppliers",
    "manage_imports",
    "publish_catalog",
  ],
  TENANT_OPS: [
    "tenant_access",
    "manage_orders",
    "manage_rmas",
    "manage_inventory",
  ],

  // Developer tier
  DEV_APP_OWNER: [...ALL_DEV_CAPS],
};

export function hasCapability(
  role: TenantRole,
  capability: Capability
): boolean {
  return ROLE_CAPABILITIES[role]?.includes(capability) ?? false;
}

export function hasAnyCapability(
  role: TenantRole,
  capabilities: Capability[]
): boolean {
  const roleCaps = ROLE_CAPABILITIES[role] ?? [];
  return capabilities.some((cap) => roleCaps.includes(cap));
}

export function isPlatformRole(role: TenantRole): boolean {
  return role === "PLATFORM_OWNER" || role === "PLATFORM_OPS" || role === "PLATFORM_SUPPORT";
}

export function isTenantRole(role: TenantRole): boolean {
  return (
    role === "TENANT_OWNER" ||
    role === "TENANT_ADMIN" ||
    role === "TENANT_CATALOG" ||
    role === "TENANT_OPS"
  );
}
