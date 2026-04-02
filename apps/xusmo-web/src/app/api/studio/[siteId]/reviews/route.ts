// GET  /api/studio/[siteId]/reviews — list all testimonials for the site
// POST /api/studio/[siteId]/reviews — add a testimonial manually

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

    const testimonials = await prisma.testimonial.findMany({
      where: { siteId },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("[studio/reviews GET]", error);
    return NextResponse.json(
      { error: "Failed to load testimonials" },
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
    const { authorName, authorTitle, authorPhoto, rating, content, featuredPage } = body;

    if (!authorName || !content) {
      return NextResponse.json(
        { error: "authorName and content are required" },
        { status: 400 }
      );
    }

    // Determine the next sortOrder for this site
    const lastTestimonial = await prisma.testimonial.findFirst({
      where: { siteId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const nextSortOrder = (lastTestimonial?.sortOrder ?? -1) + 1;

    const testimonial = await prisma.testimonial.create({
      data: {
        siteId,
        authorName,
        authorTitle: authorTitle ?? null,
        authorPhoto: authorPhoto ?? null,
        rating: rating ?? null,
        content,
        featuredPage: featuredPage ?? null,
        source: "MANUAL",
        sortOrder: nextSortOrder,
      },
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error("[studio/reviews POST]", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
