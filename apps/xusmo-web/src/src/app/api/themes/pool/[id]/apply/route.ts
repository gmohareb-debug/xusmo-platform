import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { syncDesignToWordPress } from "@/lib/wordpress/sync";
import { reassemblePagesForTheme } from "@/lib/wordpress/reassemble";

// POST /api/themes/pool/[id]/apply — Apply a theme from pool to a site
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { siteId } = body;
  if (!siteId) {
    return NextResponse.json({ error: "siteId required" }, { status: 400 });
  }

  // Verify theme exists
  const theme = await prisma.themePoolEntry.findUnique({ where: { id } });
  if (!theme) {
    return NextResponse.json({ error: "Theme not found" }, { status: 404 });
  }

  // Verify site ownership
  const site = await prisma.site.findFirst({
    where: { id: siteId, user: { email: session.user.email } },
  });
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  // Apply theme to site
  await prisma.site.update({
    where: { id: siteId },
    data: { themePoolEntryId: id, activePreset: null },
  });

  // Increment usage count
  await prisma.themePoolEntry.update({
    where: { id },
    data: { usageCount: { increment: 1 } },
  });

  // Sync design tokens (colors, fonts, CSS) to WordPress
  let syncWarning: string | null = null;
  try {
    await syncDesignToWordPress(siteId);
  } catch (err) {
    console.error("[themes/pool/apply] WP design sync failed:", err);
    syncWarning = err instanceof Error ? err.message : "Design sync failed";
  }

  // Re-assemble page content with new pattern layout matching the theme style
  let designStyle: string | null = null;
  try {
    const result = await reassemblePagesForTheme(siteId);
    designStyle = result.designStyle;
    console.log(`[themes/pool/apply] Pages reassembled: style=${result.designStyle}, pages=${result.pagesUpdated}`);
  } catch (err) {
    console.error("[themes/pool/apply] Page reassembly failed:", err);
    syncWarning = (syncWarning ? syncWarning + "; " : "") +
      (err instanceof Error ? err.message : "Page reassembly failed");
  }

  return NextResponse.json({
    success: true,
    theme: theme.name,
    ...(designStyle ? { designStyle } : {}),
    ...(syncWarning ? { syncWarning } : {}),
  });
}
