// =============================================================================
// Tenant Switch API — POST to change the user's active tenant
// Updates the JWT token with new activeTenantId/role
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getToken } from "next-auth/jwt";
import { encode } from "next-auth/jwt";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { tenantId } = body;

  if (!tenantId || typeof tenantId !== "string") {
    return NextResponse.json({ error: "tenantId required" }, { status: 400 });
  }

  // Verify user has membership in the requested tenant
  const membership = session.user.tenants?.find(
    (t) => t.tenantId === tenantId
  );
  if (!membership) {
    return NextResponse.json(
      { error: "Not a member of this tenant" },
      { status: 403 }
    );
  }

  // Update the JWT token with new active tenant
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: "No token found" }, { status: 401 });
  }

  token.activeTenantId = membership.tenantId;
  token.activeTenantSlug = membership.slug;
  token.activeTenantRole = membership.role;

  // Re-encode the token
  const encoded = await encode({
    token,
    secret: process.env.NEXTAUTH_SECRET!,
  });

  // Set the updated session cookie
  const isSecure = process.env.NEXTAUTH_URL?.startsWith("https");
  const cookieName = isSecure
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

  const jar = await cookies();
  jar.set(cookieName, encoded, {
    httpOnly: true,
    secure: !!isSecure,
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.json({
    success: true,
    activeTenantId: membership.tenantId,
    activeTenantSlug: membership.slug,
    activeTenantRole: membership.role,
  });
}
