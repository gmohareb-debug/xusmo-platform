// POST /api/studio/[siteId]/content/[pageSlug]/sections — save section order and visibility

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";
import { syncPageToWordPress } from "@/lib/wordpress/sync";

interface SectionUpdate {
  id: string;
  sortOrder: number;
  visible: boolean;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string; pageSlug: string }> }
) {
  try {
    const { siteId, pageSlug } = await params;

    const session = await getServerSession(authOptions);
    const auth = await getStudioAuth(session?.user?.email, siteId, "edit");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sections } = body as { sections: SectionUpdate[] };

    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json(
        { error: "sections array is required" },
        { status: 400 }
      );
    }

    // Validate each section entry
    for (const section of sections) {
      if (!section.id || typeof section.id !== "string") {
        return NextResponse.json(
          { error: "Each section must have a valid id" },
          { status: 400 }
        );
      }
      if (typeof section.sortOrder !== "number") {
        return NextResponse.json(
          { error: "Each section must have a numeric sortOrder" },
          { status: 400 }
        );
      }
      if (typeof section.visible !== "boolean") {
        return NextResponse.json(
          { error: "Each section must have a boolean visible flag" },
          { status: 400 }
        );
      }
    }

    // Find the page
    const page = await prisma.page.findUnique({
      where: { siteId_slug: { siteId, slug: pageSlug } },
      select: {
        id: true,
        blocks: true,
        content: true,
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Update the blocks JSON with new sort order and visibility
    // The blocks field stores an array of section objects
    const currentBlocks = (page.blocks as Array<Record<string, unknown>>) || [];

    if (currentBlocks.length > 0) {
      // Update each block's sortOrder and visible flag based on the incoming sections
      const sectionMap = new Map(
        sections.map((s) => [s.id, s])
      );

      const updatedBlocks = currentBlocks.map((block) => {
        const blockId = block.id as string;
        const update = sectionMap.get(blockId);
        if (update) {
          return {
            ...block,
            order: update.sortOrder,
            sortOrder: update.sortOrder,
            visible: update.visible,
          };
        }
        return block;
      });

      // Sort by the new order
      updatedBlocks.sort((a, b) => {
        const orderA = (a.sortOrder as number) ?? (a.order as number) ?? 0;
        const orderB = (b.sortOrder as number) ?? (b.order as number) ?? 0;
        return orderA - orderB;
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await prisma.page.update({
        where: { id: page.id },
        data: { blocks: updatedBlocks as any },
      });
    }

    // Fire-and-forget sync to WordPress
    syncPageToWordPress(siteId, pageSlug).catch((err) => {
      console.error("[studio/content/sections] WP sync failed:", err);
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[studio/content/sections POST]", error);
    return NextResponse.json(
      { error: "Failed to save section order" },
      { status: 500 }
    );
  }
}
