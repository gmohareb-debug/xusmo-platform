// POST /api/domains/purchase
// Purchases a domain via Cloudflare Registrar (or mock in dev).

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { purchaseDomain } from "@/lib/domains/cloudflare";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { domainName, siteId } = (await req.json()) as {
      domainName: string;
      siteId: string;
    };

    if (!domainName || !siteId) {
      return NextResponse.json(
        { error: "domainName and siteId are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify user owns the site
    const site = await prisma.site.findFirst({
      where: { id: siteId, userId: user.id },
    });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Check for active subscription (except in dev)
    if (process.env.NODE_ENV === "production") {
      const sub = await prisma.subscription.findFirst({
        where: { userId: user.id, status: "ACTIVE" },
      });
      if (!sub) {
        return NextResponse.json(
          { error: "Active subscription required to purchase domains" },
          { status: 402 }
        );
      }
    }

    const domain = await purchaseDomain(user.id, domainName, siteId);

    return NextResponse.json({
      domainId: domain.id,
      domainName: domain.domainName,
      status: domain.status,
      purchasePrice: domain.purchasePrice,
    });
  } catch (error) {
    console.error("[domains/purchase]", error);
    return NextResponse.json(
      { error: "Domain purchase failed" },
      { status: 500 }
    );
  }
}
