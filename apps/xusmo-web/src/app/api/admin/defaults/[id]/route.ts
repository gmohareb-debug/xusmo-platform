// PUT /api/admin/defaults/[id] — update industry default

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    // Remove fields that shouldn't be updated directly
    delete body.id;
    delete body.createdAt;
    delete body.updatedAt;

    const industry = await prisma.industryDefault.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(industry);
  } catch (error) {
    console.error("[admin/defaults/update]", error);
    return NextResponse.json(
      { error: "Failed to update industry" },
      { status: 500 }
    );
  }
}
