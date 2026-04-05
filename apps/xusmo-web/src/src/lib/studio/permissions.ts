// =============================================================================
// Studio Permission Helper
// Checks if a user can access a site (owner or team member with sufficient role)
// =============================================================================

import { prisma } from "@/lib/db";

type PermissionLevel = "view" | "edit" | "manage";

const ROLE_LEVELS: Record<string, number> = {
  VIEWER: 1,
  EDITOR: 2,
  MANAGER: 3,
};

const PERMISSION_LEVELS: Record<PermissionLevel, number> = {
  view: 1,
  edit: 2,
  manage: 3,
};

/**
 * Check if a user has permission to access a site's Studio.
 * Owner always has full access. Team members checked by role level.
 */
export async function checkStudioPermission(
  userId: string,
  siteId: string,
  required: PermissionLevel
): Promise<boolean> {
  // Check if user is site owner
  const site = await prisma.site.findFirst({
    where: { id: siteId, userId },
    select: { id: true },
  });

  if (site) return true; // Owner has full access

  // Check team membership
  const member = await prisma.teamMember.findFirst({
    where: {
      siteId,
      inviteeUserId: userId,
      status: "ACCEPTED",
    },
    select: { role: true },
  });

  if (!member) return false;

  const memberLevel = ROLE_LEVELS[member.role] ?? 0;
  const requiredLevel = PERMISSION_LEVELS[required];

  return memberLevel >= requiredLevel;
}

/**
 * Get the authenticated user's ID and verify site access in one call.
 * Returns { userId, siteId } or null if unauthorized.
 */
export async function getStudioAuth(
  sessionEmail: string | null | undefined,
  siteId: string,
  required: PermissionLevel = "view"
): Promise<{ userId: string } | null> {
  if (!sessionEmail) return null;

  const user = await prisma.user.findUnique({
    where: { email: sessionEmail },
    select: { id: true },
  });

  if (!user) return null;

  const hasPermission = await checkStudioPermission(user.id, siteId, required);
  if (!hasPermission) return null;

  return { userId: user.id };
}
