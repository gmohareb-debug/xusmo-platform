// GET /api/preview/[token] — validate share link token (public, no auth)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const shareLink = await prisma.siteShareLink.findUnique({
      where: { token },
      include: {
        site: {
          select: {
            businessName: true,
            wpUrl: true,
          },
        },
      },
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

    // Increment viewCount and update lastViewedAt
    await prisma.siteShareLink.update({
      where: { token },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
    });

    return NextResponse.json({
      site: {
        businessName: shareLink.site.businessName,
        wpUrl: shareLink.site.wpUrl,
      },
      canComment: shareLink.canComment,
    });
  } catch (error) {
    console.error("[preview/[token] GET]", error);
    return NextResponse.json(
      { error: "Failed to validate share link" },
      { status: 500 }
    );
  }
}
