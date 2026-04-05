// PUT /api/studio/[siteId]/leads/[id]
// Update a FormSubmission's status, notes, or contactedAt.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";

const VALID_STATUSES = ["NEW", "VIEWED", "CONTACTED", "CONVERTED", "ARCHIVED"] as const;
type ValidStatus = (typeof VALID_STATUSES)[number];

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string; id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId, id } = await params;

    const auth = await getStudioAuth(session.user.email, siteId, "edit");
    if (!auth) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify the submission exists and belongs to this site
    const existing = await prisma.formSubmission.findFirst({
      where: { id, siteId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Submission not found or does not belong to this site" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { status, notes, contactedAt } = body as {
      status?: string;
      notes?: string;
      contactedAt?: string;
    };

    // Validate status if provided
    if (status !== undefined && !VALID_STATUSES.includes(status as ValidStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    // Build update data — only include provided fields
    const updateData: Record<string, unknown> = {};

    if (status !== undefined) {
      updateData.status = status;

      // Auto-set archivedAt when status changes to ARCHIVED
      if (status === "ARCHIVED") {
        updateData.archivedAt = new Date();
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (contactedAt !== undefined) {
      updateData.contactedAt = contactedAt ? new Date(contactedAt) : null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update. Provide at least one of: status, notes, contactedAt" },
        { status: 400 }
      );
    }

    const updated = await prisma.formSubmission.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        formName: true,
        pageSlug: true,
        fields: true,
        status: true,
        notes: true,
        contactedAt: true,
        archivedAt: true,
        receivedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[studio/leads/[id]]", error);
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    );
  }
}
