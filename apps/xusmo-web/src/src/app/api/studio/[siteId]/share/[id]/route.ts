// DELETE /api/studio/[siteId]/share/[id] — revoke a share link

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string; id: string }> }
) {
  try {
    const { siteId, id } = await params;

    const session = await getServerSession(authOptions);
    const auth = await getStudioAuth(session?.user?.email, siteId, "edit");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shareLink = await prisma.siteShareLink.findFirst({
      where: { id, siteId },
    });

    if (!shareLink) {
      return NextResponse.json({ error: "Share link not found" }, { status: 404 });
    }

    const updated = await prisma.siteShareLink.update({
      where: { id },
      data: { isRevoked: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[studio/share/[id] DELETE]", error);
    return NextResponse.json(
      { error: "Failed to revoke share link" },
      { status: 500 }
    );
  }
}
