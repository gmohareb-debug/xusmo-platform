// GET /api/preview-proxy/[siteId]?path=/about
// Proxies WordPress site content through xusmo.com (HTTPS) so the studio
// preview iframe avoids mixed-content and X-Frame-Options issues.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { siteId } = await params;
  const path = req.nextUrl.searchParams.get("path") || "/";

  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: { wpUrl: true, userId: true },
  });

  if (!site?.wpUrl) {
    return new NextResponse("Site not found", { status: 404 });
  }

  // Build the upstream URL
  const upstream = site.wpUrl.replace(/\/$/, "") + path;

  try {
    const res = await fetch(upstream, {
      headers: {
        "User-Agent": "XusmoPreviewProxy/1.0",
        Accept: "text/html,*/*",
      },
      redirect: "follow",
    });

    const contentType = res.headers.get("content-type") || "text/html";
    const body = await res.arrayBuffer();

    // For HTML responses, rewrite internal URLs to go through the proxy
    if (contentType.includes("text/html")) {
      let html = new TextDecoder().decode(body);
      // Rewrite absolute URLs pointing to the WP site to go through proxy
      const wpOrigin = new URL(site.wpUrl).origin;
      html = html.replace(
        new RegExp(wpOrigin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        `/api/preview-proxy/${siteId}?path=`
      );
      // Rewrite relative href/src to go through proxy
      html = html.replace(
        /(?:href|src|action)="\/(?!api\/preview-proxy)/g,
        (match) => match.replace('="/', `="/api/preview-proxy/${siteId}?path=/`)
      );

      return new NextResponse(html, {
        status: res.status,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "no-store",
        },
      });
    }

    // For non-HTML (CSS, JS, images), pass through directly
    return new NextResponse(body, {
      status: res.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(`Proxy error: ${msg}`, { status: 502 });
  }
}
