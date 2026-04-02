// =============================================================================
// Public API Key Authentication
// MVP approach: API keys use format `xusmo_key_{userId}`
// Extracts userId and verifies the user exists in the database.
// Can be replaced with a proper ApiKey table later.
// =============================================================================

import { prisma } from "@/lib/db";

export interface ApiKeyUser {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
}

/**
 * Validate an API key and return the associated user.
 * Key format: `xusmo_key_{userId}`
 * Returns null if the key is invalid or user not found.
 */
export async function validateApiKey(key: string): Promise<ApiKeyUser | null> {
  if (!key || !key.startsWith("xusmo_key_")) {
    return null;
  }

  const userId = key.replace("xusmo_key_", "");
  if (!userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  } catch {
    return null;
  }
}

/**
 * Extract and validate API key from Authorization header.
 * Expects: `Authorization: Bearer xusmo_key_{userId}`
 */
export async function authenticateApiRequest(
  authHeader: string | null
): Promise<ApiKeyUser | null> {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;

  return validateApiKey(parts[1]);
}
