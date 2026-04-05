// GET  /api/studio/[siteId]/revisions — list revisions for a site
// POST /api/studio/[siteId]/revisions — create a new revision request

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";

// ---------------------------------------------------------------------------
// POST — create revision
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
    const { description, requestType, pagesAffected } = body as {
      description: string;
      requestType: string;
      pagesAffected: string[];
    };

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: "description is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const revision = await prisma.revision.create({
      data: {
        userId: user.id,
        siteId,
        description,
        requestType: requestType || "content",
        pagesAffected,
        status: "PENDING",
      },
    });

    return NextResponse.json(revision, { status: 201 });
  } catch (error) {
    console.error("[studio/revisions/create]", error);
    return NextResponse.json(
      { error: "Failed to create revision" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// GET — list revisions
// ---------------------------------------------------------------------------

export async function GET(
  _req: NextRequest,
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

    const revisions = await prisma.revision.findMany({
      where: { siteId },
      orderBy: { requestedAt: "desc" },
      take: 20,
    });

    return NextResponse.json(revisions);
  } catch (error) {
    console.error("[studio/revisions/list]", error);
    return NextResponse.json(
      { error: "Failed to load revisions" },
      { status: 500 }
    );
  }
}
