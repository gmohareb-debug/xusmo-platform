// GET /api/studio/[siteId]/preview-data — site data for the preview screen

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";

// ---------------------------------------------------------------------------
// GET — preview data
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

    const site = await prisma.site.findFirst({
      where: { id: siteId },
      select: {
        id: true,
        businessName: true,
        wpUrl: true,
        status: true,
        industryId: true,
        pages: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            slug: true,
            title: true,
            sortOrder: true,
          },
        },
        build: {
          select: {
            id: true,
            status: true,
            qaReports: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
        revisions: {
          orderBy: { requestedAt: "desc" },
          take: 5,
          select: {
            id: true,
            status: true,
            description: true,
            requestType: true,
            requestedAt: true,
          },
        },
      },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    return NextResponse.json(site);
  } catch (error) {
    console.error("[studio/preview-data]", error);
    return NextResponse.json(
      { error: "Failed to load preview data" },
      { status: 500 }
    );
  }
}
