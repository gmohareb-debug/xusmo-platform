// POST /api/invite/[token]/accept — accept team invite (public, requires auth)

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const invite = await prisma.teamMember.findUnique({
      where: { inviteToken: token },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (invite.status === "ACCEPTED") {
      return NextResponse.json(
        { error: "This invite has already been accepted" },
        { status: 409 }
      );
    }

    if (invite.status === "REVOKED") {
      return NextResponse.json(
        { error: "This invite has been revoked" },
        { status: 410 }
      );
    }

    if (invite.status === "EXPIRED") {
      return NextResponse.json(
        { error: "This invite has expired" },
        { status: 410 }
      );
    }

    const updated = await prisma.teamMember.update({
      where: { inviteToken: token },
      data: {
        inviteeUserId: user.id,
        status: "ACCEPTED",
        acceptedAt: new Date(),
      },
    });

    return NextResponse.json({ siteId: updated.siteId });
  } catch (error) {
    console.error("[invite/[token]/accept POST]", error);
    return NextResponse.json(
      { error: "Failed to accept invite" },
      { status: 500 }
    );
  }
}
