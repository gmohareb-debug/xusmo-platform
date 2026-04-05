// GET /api/admin/sites/[siteId]/credentials — return credentials
// POST /api/admin/sites/[siteId]/credentials — action: "rotate" to rotate credentials

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCredentials, rotateCredentials } from "@/lib/wordpress/plugins";

// Check admin auth
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET(
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
      select: { id: true },
    });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const credentials = await getCredentials(siteId);

    return NextResponse.json(credentials);
  } catch (error) {
    console.error("[admin/sites/[siteId]/credentials GET]", error);
    return NextResponse.json(
      { error: "Failed to get credentials" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;
    const body = await req.json();
    const { action } = body;

    if (action !== "rotate") {
      return NextResponse.json(
        { error: "Invalid action. Supported: rotate" },
        { status: 400 }
      );
    }

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true },
    });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const result = await rotateCredentials(siteId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[admin/sites/[siteId]/credentials POST]", error);
    return NextResponse.json(
      { error: "Failed to rotate credentials" },
      { status: 500 }
    );
  }
}
