// PUT /api/studio/[siteId]/design/custom-css — save custom CSS

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";
import { syncDesignToWordPress } from "@/lib/wordpress/sync";

const MAX_CSS_LENGTH = 5000;

export async function PUT(
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
    const { css } = body;

    if (typeof css !== "string") {
      return NextResponse.json(
        { error: "css must be a string" },
        { status: 400 }
      );
    }

    if (css.length > MAX_CSS_LENGTH) {
      return NextResponse.json(
        { error: `CSS must not exceed ${MAX_CSS_LENGTH} characters` },
        { status: 400 }
      );
    }

    const lowerCss = css.toLowerCase();
    if (
      lowerCss.includes("<script") ||
      lowerCss.includes("javascript:") ||
      lowerCss.includes("expression(")
    ) {
      return NextResponse.json(
        { error: "CSS contains disallowed patterns" },
        { status: 400 }
      );
    }

    await prisma.site.update({
      where: { id: siteId },
      data: { customCss: css || null, customCssUpdatedAt: new Date() },
    });

    // Await sync so the client knows it worked
    let syncWarning: string | null = null;
    try {
      await syncDesignToWordPress(siteId);
    } catch (err) {
      console.error("[studio/design/custom-css] WP sync failed:", err);
      syncWarning = err instanceof Error ? err.message : "Sync failed";
    }

    return NextResponse.json({
      success: true,
      ...(syncWarning ? { syncWarning } : {}),
    });
  } catch (error) {
    console.error("[studio/design/custom-css PUT]", error);
    return NextResponse.json(
      { error: "Failed to save custom CSS" },
      { status: 500 }
    );
  }
}
