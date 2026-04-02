// GET /api/portal/domains
// Returns all domains for the authenticated user.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const domains = await prisma.domain.findMany({
      where: { userId: user.id },
      include: {
        site: { select: { businessName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      domains.map((d) => ({
        id: d.id,
        domainName: d.domainName,
        status: d.status,
        siteId: d.siteId,
        siteName: d.site?.businessName ?? null,
        dnsConfigured: d.dnsConfigured,
        sslActive: d.sslActive,
        purchaseType: d.purchaseType,
      }))
    );
  } catch (error) {
    console.error("[portal/domains]", error);
    return NextResponse.json(
      { error: "Failed to load domains" },
      { status: 500 }
    );
  }
}
