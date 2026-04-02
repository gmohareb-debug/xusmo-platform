// =============================================================================
// Tenant Guard — SaaS Guard (ported from Dropnex validate_connection_access)
// Prevents cross-tenant access and enforces capability checks.
// Usage: import { validateTenantAccess, requireCapability } from "@/lib/auth/tenant-guard";
// =============================================================================

import type { TenantRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hasCapability, isPlatformRole, type Capability } from "./permissions";
import { logAudit } from "@/lib/tenant/audit";

/**
 * Validates that a user has access to a specific tenant.
 * Platform roles bypass tenant checks (mirrors Dropnex SaaS Guard).
 */
export async function validateTenantAccess(
  userId: string,
  tenantId: string
): Promise<{ valid: boolean; role?: TenantRole }> {
  const member = await prisma.tenantMember.findUnique({
    where: { tenantId_userId: { tenantId, userId } },
  });

  if (!member) {
    // Log security violation (mirrors Dropnex "[GDS Security] Cross-tenant access attempt")
    await logAudit({
      tenantId,
      userId,
      action: "cross_tenant_access_attempt",
      component: "security",
      details: { attemptedTenantId: tenantId },
    });
    return { valid: false };
  }

  return { valid: true, role: member.role };
}

/**
 * Validates that a user has a specific capability within a tenant.
 * Returns the role if valid, throws 403-like error if not.
 */
export async function requireCapability(
  userId: string,
  tenantId: string,
  capability: Capability
): Promise<TenantRole> {
  const { valid, role } = await validateTenantAccess(userId, tenantId);

  if (!valid || !role) {
    throw new TenantAccessError("Access denied: not a member of this tenant");
  }

  if (!hasCapability(role, capability)) {
    throw new TenantAccessError(
      `Access denied: role ${role} lacks capability ${capability}`
    );
  }

  return role;
}

/**
 * Validates that a site belongs to a tenant (prevents cross-tenant site access).
 */
export async function validateSiteAccess(
  userId: string,
  tenantId: string,
  siteId: string
): Promise<boolean> {
  const { valid, role } = await validateTenantAccess(userId, tenantId);
  if (!valid || !role) return false;

  // Platform roles can access any site
  if (isPlatformRole(role)) return true;

  const site = await prisma.site.findFirst({
    where: { id: siteId, tenantId },
  });

  if (!site) {
    await logAudit({
      tenantId,
      userId,
      action: "cross_tenant_site_access_attempt",
      component: "security",
      objectType: "site",
      objectId: siteId,
    });
    return false;
  }

  return true;
}

/**
 * Validates store connection belongs to tenant (mirrors Dropnex validate_connection_access).
 */
export async function validateStoreAccess(
  tenantId: string,
  storeConnectionId: string
): Promise<boolean> {
  const store = await prisma.storeConnection.findFirst({
    where: { id: storeConnectionId, tenantId },
  });
  return !!store;
}

export class TenantAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TenantAccessError";
  }
}
