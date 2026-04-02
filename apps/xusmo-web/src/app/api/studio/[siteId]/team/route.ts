// GET /api/studio/[siteId]/team — list TeamMembers for the site

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    const session = await getServerSession(authOptions);
    const auth = await getStudioAuth(session?.user?.email, siteId, "view");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const members = await prisma.teamMember.findMany({
      where: { siteId },
      orderBy: { invitedAt: "desc" },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("[studio/team GET]", error);
    return NextResponse.json(
      { error: "Failed to load team members" },
      { status: 500 }
    );
  }
}
