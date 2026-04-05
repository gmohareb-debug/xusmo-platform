// =============================================================================
// Studio Export API — Download the full WordPress site as a tar.gz archive
//
// GET  /api/studio/[siteId]/export         — Full site export (DB + files)
// GET  /api/studio/[siteId]/export?format=xml — WordPress XML export only
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStudioAuth } from "@/lib/studio/permissions";
import { exportWordPressSite, exportWordPressXML } from "@/lib/wordpress/export";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { siteId } = await params;
    const auth = await getStudioAuth(session.user.id, siteId);
    if (!auth) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const format = req.nextUrl.searchParams.get("format");

    let result;
    if (format === "xml") {
      result = await exportWordPressXML(siteId);
    } else {
      result = await exportWordPressSite(siteId);
    }

    if (!result.success || !result.archive) {
      return NextResponse.json(
        { error: result.error || "Export failed" },
        { status: 500 }
      );
    }

    // Return the archive as a downloadable file
    const contentType =
      format === "xml" ? "application/xml" : "application/gzip";

    return new NextResponse(new Uint8Array(result.archive), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "Content-Length": result.archive.length.toString(),
        "X-Export-Summary": JSON.stringify(result.summary),
      },
    });
  } catch (error) {
    console.error("[api/studio/export]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
