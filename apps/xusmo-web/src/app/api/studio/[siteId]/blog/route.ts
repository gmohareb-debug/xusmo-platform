// GET  /api/studio/[siteId]/blog — list blog posts for a site
// POST /api/studio/[siteId]/blog — create a new blog post

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove special characters
    .replace(/\s+/g, "-") // replace spaces with dashes
    .replace(/-+/g, "-") // collapse consecutive dashes
    .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes
}

// ---------------------------------------------------------------------------
// GET — list blog posts
// ---------------------------------------------------------------------------

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;

    const auth = await getStudioAuth(session.user.email, siteId, "view");
    if (!auth) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Optional status filter from query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = { siteId };
    if (status) {
      where.status = status.toUpperCase();
    }

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("[studio/blog/list]", error);
    return NextResponse.json(
      { error: "Failed to load blog posts" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST — create blog post
// ---------------------------------------------------------------------------

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;

    const auth = await getStudioAuth(session.user.email, siteId, "edit");
    if (!auth) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const {
      title,
      slug,
      excerpt,
      content,
      featuredImageUrl,
      metaTitle,
      metaDescription,
      focusKeyword,
      status,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "title and content are required" },
        { status: 400 }
      );
    }

    // Auto-generate slug from title if not provided
    const finalSlug = slug ? slugify(slug) : slugify(title);

    if (!finalSlug) {
      return NextResponse.json(
        { error: "Could not generate a valid slug from the title" },
        { status: 400 }
      );
    }

    // Check for slug uniqueness within this site
    const existing = await prisma.blogPost.findUnique({
      where: { siteId_slug: { siteId, slug: finalSlug } },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: `A post with slug "${finalSlug}" already exists for this site` },
        { status: 409 }
      );
    }

    const post = await prisma.blogPost.create({
      data: {
        siteId,
        title,
        slug: finalSlug,
        excerpt: excerpt ?? null,
        content, // JSON blocks
        featuredImageUrl: featuredImageUrl ?? null,
        metaTitle: metaTitle ?? null,
        metaDescription: metaDescription ?? null,
        focusKeyword: focusKeyword ?? null,
        status: status ? status.toUpperCase() : "DRAFT",
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("[studio/blog/create]", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
