// POST /api/revisions/create
// Creates a revision request for a site owned by the authenticated user.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revisionQueue } from "@/lib/queue";
import { detectRevisionType } from "@/agents/revision.agent";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { siteId, description, pagesAffected } = body as {
      siteId: string;
      description: string;
      pagesAffected?: string[];
    };

    if (!siteId || !description) {
      return NextResponse.json(
        { error: "siteId and description are required" },
        { status: 400 }
      );
    }

    // Verify user owns the site
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const site = await prisma.site.findFirst({
      where: { id: siteId, userId: user.id },
    });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Auto-detect revision type
    const requestType = detectRevisionType(description);

    // Create revision record
    const revision = await prisma.revision.create({
      data: {
        userId: user.id,
        siteId,
        description,
        requestType,
        pagesAffected: pagesAffected ? (pagesAffected as any) : undefined, // eslint-disable-line @typescript-eslint/no-explicit-any
      },
    });

    // Queue revision job
    await revisionQueue.add(
      "revision-job",
      { revisionId: revision.id },
      {
        attempts: 2,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      }
    );

    return NextResponse.json({
      revisionId: revision.id,
      status: "PENDING",
      estimatedRequestType: requestType,
    });
  } catch (error) {
    console.error("[revisions/create]", error);
    return NextResponse.json(
      { error: "Failed to create revision" },
      { status: 500 }
    );
  }
}
