// POST /api/studio/[siteId]/approve — approve a site (set status to APPROVED)

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";

// ---------------------------------------------------------------------------
// POST — approve site
// ---------------------------------------------------------------------------

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;

    const auth = await getStudioAuth(session.user.email, siteId, "manage");
    if (!auth) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const site = await prisma.site.findFirst({ where: { id: siteId } });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    if (site.status === "LIVE") {
      return NextResponse.json(
        { error: "Site is already live" },
        { status: 400 }
      );
    }

    if (site.status === "APPROVED") {
      return NextResponse.json(
        { error: "Site is already approved" },
        { status: 400 }
      );
    }

    await prisma.site.update({
      where: { id: siteId },
      data: { status: "APPROVED" },
    });

    return NextResponse.json({ ok: true, status: "APPROVED" });
  } catch (error) {
    console.error("[studio/approve]", error);
    return NextResponse.json(
      { error: "Failed to approve site" },
      { status: 500 }
    );
  }
}
