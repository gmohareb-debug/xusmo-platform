// POST /api/domains/connect
// BYOD — connects a customer's own domain and returns DNS instructions.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { connectBYOD } from "@/lib/domains/cloudflare";

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

    const result = await connectBYOD(user.id, domainName, siteId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[domains/connect]", error);
    return NextResponse.json(
      { error: "Domain connection failed" },
      { status: 500 }
    );
  }
}
