// GET /api/domains/[domainId]/status
// Returns domain status and DNS configuration details.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ domainId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { domainId } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const domain = await prisma.domain.findFirst({
      where: { id: domainId, userId: user.id },
      include: { site: { select: { businessName: true, wpUrl: true } } },
    });

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: domain.id,
      domainName: domain.domainName,
      status: domain.status,
      purchaseType: domain.purchaseType,
      dnsConfigured: domain.dnsConfigured,
      sslActive: domain.sslActive,
      aRecord: domain.aRecord,
      cnameRecord: domain.cnameRecord,
      registeredAt: domain.registeredAt,
      expiresAt: domain.expiresAt,
      site: domain.site,
    });
  } catch (error) {
    console.error("[domains/status]", error);
    return NextResponse.json(
      { error: "Failed to get domain status" },
      { status: 500 }
    );
  }
}
