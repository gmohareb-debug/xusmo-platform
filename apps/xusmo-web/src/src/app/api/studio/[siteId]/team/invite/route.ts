// POST /api/studio/[siteId]/team/invite — send team invite

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    const session = await getServerSession(authOptions);
    const auth = await getStudioAuth(session?.user?.email, siteId, "manage");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, role, name } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: "email and role are required" },
        { status: 400 }
      );
    }

    const validRoles = ["VIEWER", "EDITOR", "MANAGER"];
    if (!validRoles.includes(role.toUpperCase())) {
      return NextResponse.json(
        { error: `role must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    // Check if already invited
    const existing = await prisma.teamMember.findFirst({
      where: {
        siteId,
        inviteEmail: email.toLowerCase(),
        status: { in: ["PENDING", "ACCEPTED"] },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This email has already been invited to this site" },
        { status: 409 }
      );
    }

    const invite = await prisma.teamMember.create({
      data: {
        siteId,
        userId: auth.userId,
        inviteEmail: email.toLowerCase(),
        inviteeName: name ?? null,
        role: role.toUpperCase(),
        status: "PENDING",
      },
    });

    return NextResponse.json(invite, { status: 201 });
  } catch (error) {
    console.error("[studio/team/invite POST]", error);
    return NextResponse.json(
      { error: "Failed to send team invite" },
      { status: 500 }
    );
  }
}
