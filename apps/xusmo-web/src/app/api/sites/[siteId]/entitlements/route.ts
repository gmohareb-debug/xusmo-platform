// GET /api/sites/[siteId]/entitlements — List entitlements for a site

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { siteId } = await params;

  // Verify site belongs to user (or user is admin)
  const site = await prisma.site.findFirst({
    where: {
      id: siteId,
      ...(token.role !== "ADMIN" ? { userId: token.sub } : {}),
    },
  });
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const entitlements = await prisma.entitlement.findMany({
    where: { siteId },
    include: { addOn: true },
    orderBy: { grantedAt: "desc" },
  });

  return NextResponse.json({ entitlements });
}
