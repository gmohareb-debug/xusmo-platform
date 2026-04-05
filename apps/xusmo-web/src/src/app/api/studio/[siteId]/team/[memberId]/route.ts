// DELETE /api/studio/[siteId]/team/[memberId] — remove team member

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string; memberId: string }> }
) {
  try {
    const { siteId, memberId } = await params;

    const session = await getServerSession(authOptions);
    const auth = await getStudioAuth(session?.user?.email, siteId, "manage");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await prisma.teamMember.findFirst({
      where: { id: memberId, siteId },
    });

    if (!member) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    // If pending, just delete. If accepted, revoke.
    if (member.status === "PENDING") {
      await prisma.teamMember.delete({
        where: { id: memberId },
      });
    } else {
      await prisma.teamMember.update({
        where: { id: memberId },
        data: {
          status: "REVOKED",
          revokedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[studio/team/[memberId] DELETE]", error);
    return NextResponse.json(
      { error: "Failed to remove team member" },
      { status: 500 }
    );
  }
}
