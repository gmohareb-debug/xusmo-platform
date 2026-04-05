// =============================================================================
// Tenant Onboarding (ported from Dropnex OnboardingManager)
// Self-provisioning new tenants with defaults.
// Usage: import { provisionTenant } from "@/lib/tenant/onboarding";
// =============================================================================

import type { Tenant } from "@prisma/client";
import { prisma } from "@/lib/db";
import { logAudit } from "./audit";

interface ProvisionResult {
  success: boolean;
  tenant?: Tenant;
  error?: string;
}

/**
 * Provision a new tenant. Mirrors Dropnex OnboardingManager.provision_tenant():
 * 1. Validate uniqueness of slug and domain
 * 2. Create Tenant record
 * 3. Create TenantMember (userId → tenantId, role: TENANT_OWNER)
 * 4. Create TenantSettings with defaults
 * 5. Log audit event
 */
export async function provisionTenant(
  userId: string,
  tenantSlug: string,
  options?: {
    domain?: string;
    planName?: string;
  }
): Promise<ProvisionResult> {
  const slug = tenantSlug
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slug) {
    return { success: false, error: "Invalid tenant slug" };
  }

  // Check for duplicate slug
  const existingSlug = await prisma.tenant.findUnique({ where: { slug } });
  if (existingSlug) {
    return { success: false, error: "Tenant slug already exists" };
  }

  // Check for duplicate domain
  if (options?.domain) {
    const existingDomain = await prisma.tenant.findUnique({
      where: { domain: options.domain },
    });
    if (existingDomain) {
      return { success: false, error: "Domain already registered" };
    }
  }

  // Create tenant + member + settings in a transaction
  const tenant = await prisma.$transaction(async (tx) => {
    // 1. Create Tenant
    const newTenant = await tx.tenant.create({
      data: {
        slug,
        domain: options?.domain,
        planName: options?.planName ?? "starter",
        status: "ACTIVE",
      },
    });

    // 2. Create TenantMember (owner)
    await tx.tenantMember.create({
      data: {
        tenantId: newTenant.id,
        userId,
        role: "TENANT_OWNER",
      },
    });

    // 3. Create TenantSettings with empty (defaults applied at read time)
    await tx.tenantSettings.create({
      data: {
        tenantId: newTenant.id,
        settings: {},
      },
    });

    return newTenant;
  });

  // 4. Log audit event
  await logAudit({
    tenantId: tenant.id,
    userId,
    action: "tenant_provisioned",
    component: "onboarding",
    details: {
      slug: tenant.slug,
      domain: tenant.domain,
      planName: tenant.planName,
    },
  });

  return { success: true, tenant };
}

/**
 * Auto-provision a tenant for a new user (called during signup).
 * Creates a tenant named after the user's email prefix.
 */
export async function autoProvisionForUser(
  userId: string,
  email: string
): Promise<Tenant | null> {
  const slug = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-");
  const result = await provisionTenant(userId, slug);
  return result.tenant ?? null;
}
