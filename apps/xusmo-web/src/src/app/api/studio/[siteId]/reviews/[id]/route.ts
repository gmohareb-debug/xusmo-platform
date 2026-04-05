// PUT    /api/studio/[siteId]/reviews/[id] — update a testimonial
// DELETE /api/studio/[siteId]/reviews/[id] — delete a testimonial

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string; id: string }> }
) {
  try {
    const { siteId, id } = await params;

    const session = await getServerSession(authOptions);
    const auth = await getStudioAuth(session?.user?.email, siteId, "edit");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the testimonial belongs to this site
    const existing = await prisma.testimonial.findFirst({
      where: { id, siteId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      authorName,
      authorTitle,
      authorPhoto,
      rating,
      content,
      featuredPage,
      isPublished,
      sortOrder,
    } = body;

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        ...(authorName !== undefined && { authorName }),
        ...(authorTitle !== undefined && { authorTitle }),
        ...(authorPhoto !== undefined && { authorPhoto }),
        ...(rating !== undefined && { rating }),
        ...(content !== undefined && { content }),
        ...(featuredPage !== undefined && { featuredPage }),
        ...(isPublished !== undefined && { isPublished }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error("[studio/reviews PUT]", error);
    return NextResponse.json(
      { error: "Failed to update testimonial" },
      { status: 500 }
    );
  }
}

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

    // Verify the testimonial belongs to this site
    const existing = await prisma.testimonial.findFirst({
      where: { id, siteId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    await prisma.testimonial.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[studio/reviews DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}
