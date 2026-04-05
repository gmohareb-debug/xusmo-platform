// GET    /api/studio/[siteId]/blog/[id] — get a single blog post
// PUT    /api/studio/[siteId]/blog/[id] — update a blog post
// DELETE /api/studio/[siteId]/blog/[id] — delete a blog post

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type RouteParams = { params: Promise<{ siteId: string; id: string }> };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------------------------------------------------------------------------
// GET — single blog post
// ---------------------------------------------------------------------------

export async function GET(
  _req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId, id } = await params;

    const auth = await getStudioAuth(session.user.email, siteId, "view");
    if (!auth) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const post = await prisma.blogPost.findFirst({
      where: { id, siteId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("[studio/blog/get]", error);
    return NextResponse.json(
      { error: "Failed to load blog post" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PUT — update blog post
// ---------------------------------------------------------------------------

export async function PUT(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId, id } = await params;

    const auth = await getStudioAuth(session.user.email, siteId, "edit");
    if (!auth) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify the post belongs to this site
    const existing = await prisma.blogPost.findFirst({
      where: { id, siteId },
      select: { id: true, slug: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
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
      publishedAt,
    } = body;

    // Build the update data — only include fields that were provided
    const data: Record<string, unknown> = {};

    if (title !== undefined) data.title = title;
    if (excerpt !== undefined) data.excerpt = excerpt;
    if (content !== undefined) data.content = content;
    if (featuredImageUrl !== undefined) data.featuredImageUrl = featuredImageUrl;
    if (metaTitle !== undefined) data.metaTitle = metaTitle;
    if (metaDescription !== undefined) data.metaDescription = metaDescription;
    if (focusKeyword !== undefined) data.focusKeyword = focusKeyword;
    if (status !== undefined) data.status = status.toUpperCase();
    if (publishedAt !== undefined) {
      data.publishedAt = publishedAt ? new Date(publishedAt) : null;
    }

    // Handle slug: auto-generate from new title if slug not explicitly provided
    if (slug !== undefined) {
      data.slug = slugify(slug);
    } else if (title !== undefined) {
      data.slug = slugify(title);
    }

    // If slug changed, check uniqueness
    if (data.slug && data.slug !== existing.slug) {
      const slugConflict = await prisma.blogPost.findUnique({
        where: { siteId_slug: { siteId, slug: data.slug as string } },
        select: { id: true },
      });

      if (slugConflict && slugConflict.id !== id) {
        return NextResponse.json(
          { error: `A post with slug "${data.slug}" already exists for this site` },
          { status: 409 }
        );
      }
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data,
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("[studio/blog/update]", error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE — delete blog post
// ---------------------------------------------------------------------------

export async function DELETE(
  _req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId, id } = await params;

    const auth = await getStudioAuth(session.user.email, siteId, "edit");
    if (!auth) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify the post belongs to this site
    const existing = await prisma.blogPost.findFirst({
      where: { id, siteId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.blogPost.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[studio/blog/delete]", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}
