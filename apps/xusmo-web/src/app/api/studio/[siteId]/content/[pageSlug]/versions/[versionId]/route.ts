// GET /api/studio/[siteId]/content/[pageSlug]/versions/[versionId] — get a single ContentVersion snapshot

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string; pageSlug: string; versionId: string }> }
) {
  try {
    const { siteId, pageSlug, versionId } = await params;

    const session = await getServerSession(authOptions);
    const auth = await getStudioAuth(session?.user?.email, siteId, "view");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const page = await prisma.page.findUnique({
      where: { siteId_slug: { siteId, slug: pageSlug } },
      select: { id: true },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const version = await prisma.contentVersion.findFirst({
      where: { id: versionId, pageId: page.id, siteId },
    });

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    return NextResponse.json(version);
  } catch (error) {
    console.error("[studio/content/versions/[versionId] GET]", error);
    return NextResponse.json(
      { error: "Failed to load content version" },
      { status: 500 }
    );
  }
}
