// POST /api/preview/[token]/comment — add comment on shared preview (public)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const shareLink = await prisma.siteShareLink.findUnique({
      where: { token },
    });

    if (!shareLink) {
      return NextResponse.json({ error: "Share link not found" }, { status: 404 });
    }

    if (shareLink.isRevoked) {
      return NextResponse.json(
        { error: "This share link has been revoked" },
        { status: 410 }
      );
    }

    if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This share link has expired" },
        { status: 410 }
      );
    }

    if (!shareLink.canComment) {
      return NextResponse.json(
        { error: "Commenting is not enabled for this share link" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { content, x, y, pageSlug } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "content is required and must be a string" },
        { status: 400 }
      );
    }

    // TODO: Store comments in a dedicated Comment model when it is added.
    // For now, return success with the submitted data.
    return NextResponse.json({
      success: true,
      comment: {
        content,
        x: x ?? null,
        y: y ?? null,
        pageSlug: pageSlug ?? null,
        siteId: shareLink.siteId,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[preview/[token]/comment POST]", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
