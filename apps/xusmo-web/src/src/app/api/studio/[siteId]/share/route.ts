// GET  /api/studio/[siteId]/share — list share links for the site
// POST /api/studio/[siteId]/share — create a new share link

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

    const shareLinks = await prisma.siteShareLink.findMany({
      where: { siteId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(shareLinks);
  } catch (error) {
    console.error("[studio/share GET]", error);
    return NextResponse.json(
      { error: "Failed to load share links" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    const session = await getServerSession(authOptions);
    const auth = await getStudioAuth(session?.user?.email, siteId, "edit");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { label, canComment, expiresAt } = body;

    const shareLink = await prisma.siteShareLink.create({
      data: {
        siteId,
        userId: auth.userId,
        label: label ?? null,
        canComment: canComment ?? false,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.xusmo.io";
    const fullUrl = `${baseUrl}/preview/${shareLink.token}`;

    return NextResponse.json({ ...shareLink, fullUrl }, { status: 201 });
  } catch (error) {
    console.error("[studio/share POST]", error);
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }
}
