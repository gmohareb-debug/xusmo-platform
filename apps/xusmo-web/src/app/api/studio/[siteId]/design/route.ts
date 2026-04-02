// GET/PUT /api/studio/[siteId]/design — Read/write the engine designDocument
//
// GET  → returns { theme, pages } from site.designDocument
// PUT  → updates site.designDocument with edited { theme, pages }

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;

  const session = await getServerSession(authOptions);
  const auth = await getStudioAuth(session?.user?.email, siteId, "view");
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: { designDocument: true },
  });

  if (!site?.designDocument) {
    return NextResponse.json({ error: "No design document" }, { status: 404 });
  }

  const doc = site.designDocument as Record<string, unknown>;
  return NextResponse.json({
    theme: doc.theme ?? null,
    pages: doc.pages ?? {},
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;

  const session = await getServerSession(authOptions);
  const auth = await getStudioAuth(session?.user?.email, siteId, "edit");
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { theme, pages } = body;

  if (!pages || typeof pages !== "object") {
    return NextResponse.json(
      { error: "pages object is required" },
      { status: 400 }
    );
  }

  // Merge with existing designDocument to preserve _plan and other metadata
  const existing = await prisma.site.findUnique({
    where: { id: siteId },
    select: { designDocument: true },
  });

  const existingDoc = (existing?.designDocument as Record<string, unknown>) ?? {};

  const updatedDoc = {
    ...existingDoc,
    theme: theme ?? existingDoc.theme,
    pages,
  };

  await prisma.site.update({
    where: { id: siteId },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { designDocument: updatedDoc as any },
  });

  return NextResponse.json({ ok: true });
}
