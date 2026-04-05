// POST /api/admin/sites/[siteId]/ssl/renew
// Triggers SSL certificate renewal for a site.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getExecutor } from "@/lib/wordpress/ssh";

// Check admin auth
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true, wpUrl: true, serverIp: true, domain: true },
    });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const wp = getExecutor(siteId);

    // Trigger certificate renewal via certbot/acme
    const domainName = site.domain?.domainName ?? new URL(site.wpUrl ?? "").hostname;
    const renewResult = await wp.execute(
      `sudo certbot renew --cert-name ${domainName} --force-renewal`
    );

    // Update site SSL info
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 90); // Let's Encrypt certs are valid for 90 days

    await prisma.site.update({
      where: { id: siteId },
      data: {
        sslActive: true,
        sslExpiresAt: newExpiry,
      },
    });

    return NextResponse.json({
      success: true,
      siteId,
      domain: domainName,
      sslExpiresAt: newExpiry.toISOString(),
      output: renewResult.trim(),
    });
  } catch (error) {
    console.error("[admin/sites/[siteId]/ssl/renew]", error);
    return NextResponse.json(
      { error: "SSL renewal failed" },
      { status: 500 }
    );
  }
}
