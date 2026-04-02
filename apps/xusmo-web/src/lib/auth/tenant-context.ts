// =============================================================================
// Tenant Context Resolution (ported from Dropnex TenantRegistry)
// 5-tier resolution hierarchy to determine the current tenant.
// Usage: import { resolveTenantContext } from "@/lib/auth/tenant-context";
// =============================================================================

import type { TenantRole } from "@prisma/client";
import { prisma } from "@/lib/db";

export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  role: TenantRole;
  storeConnectionId?: string;
}

/**
 * Resolves tenant context for a request. Priority order (mirrors Dropnex):
 * 1. Explicit header: X-Tenant-ID (for API/webhook calls)
 * 2. Session: user's active tenant from cookie/session
 * 3. Domain lookup: match request hostname to Tenant.domain
 * 4. Default: user's primary tenant (first TenantMember by creation date)
 */
export async function resolveTenantContext(
  userId: string,
  options?: {
    explicitTenantId?: string;
    hostname?: string;
    activeTenantId?: string; // from session/cookie
  }
): Promise<TenantContext | null> {
  // 1. Explicit tenant ID (for API calls, webhooks, jobs)
  if (options?.explicitTenantId) {
    return resolveByTenantId(userId, options.explicitTenantId);
  }

  // 2. Session-based active tenant
  if (options?.activeTenantId) {
    return resolveByTenantId(userId, options.activeTenantId);
  }

  // 3. Domain-based lookup
  if (options?.hostname) {
    const tenant = await prisma.tenant.findUnique({
      where: { domain: options.hostname },
    });
    if (tenant) {
      return resolveByTenantId(userId, tenant.id);
    }
  }

  // 4. Default: user's primary tenant (first membership)
  const primaryMember = await prisma.tenantMember.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { tenant: true },
  });

  if (!primaryMember) return null;

  return {
    tenantId: primaryMember.tenantId,
    tenantSlug: primaryMember.tenant.slug,
    role: primaryMember.role,
  };
}

async function resolveByTenantId(
  userId: string,
  tenantId: string
): Promise<TenantContext | null> {
  const member = await prisma.tenantMember.findUnique({
    where: { tenantId_userId: { tenantId, userId } },
    include: { tenant: true },
  });

  if (!member) return null;

  return {
    tenantId: member.tenantId,
    tenantSlug: member.tenant.slug,
    role: member.role,
  };
}

/**
 * Get all tenants a user belongs to (for tenant switcher UI).
 */
export async function getUserTenants(userId: string) {
  return prisma.tenantMember.findMany({
    where: { userId },
    include: {
      tenant: {
        select: {
          id: true,
          slug: true,
          domain: true,
          planName: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}
