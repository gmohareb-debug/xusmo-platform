// Tenant isolation — ensures users can only access their own data

import { prisma } from "@/lib/db";

export async function validateSiteOwnership(
  userId: string,
  siteId: string
): Promise<boolean> {
  const site = await prisma.site.findFirst({
    where: { id: siteId, userId },
    select: { id: true },
  });
  return !!site;
}

export async function validateTenantAccess(
  userId: string,
  tenantId: string
): Promise<boolean> {
  const member = await prisma.tenantMember.findFirst({
    where: { userId, tenantId },
    select: { id: true },
  });
  return !!member;
}

// Rate limiter (in-memory, per route per user)
const rateLimits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  userId: string,
  route: string,
  maxPerMinute: number = 60
): boolean {
  const key = `${userId}:${route}`;
  const now = Date.now();
  const entry = rateLimits.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= maxPerMinute) {
    return false;
  }

  entry.count++;
  return true;
}
