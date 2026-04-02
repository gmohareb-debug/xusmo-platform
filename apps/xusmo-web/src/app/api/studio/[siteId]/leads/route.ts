// GET /api/studio/[siteId]/leads
// Returns paginated FormSubmissions for the site, filtered by status.
// Marks NEW submissions as VIEWED when fetched (background update).

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;

    const auth = await getStudioAuth(session.user.email, siteId, "view");
    if (!auth) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = { siteId };
    if (status) {
      where.status = status;
    }

    // Fetch submissions + total count in parallel
    const [submissions, totalCount] = await Promise.all([
      prisma.formSubmission.findMany({
        where,
        orderBy: { receivedAt: "desc" },
        skip,
        take: limit,
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
      }),
      prisma.formSubmission.count({ where }),
    ]);

    // Compute stats
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalAll, newToday, convertedCount] = await Promise.all([
      prisma.formSubmission.count({ where: { siteId } }),
      prisma.formSubmission.count({
        where: {
          siteId,
          receivedAt: { gte: startOfToday },
        },
      }),
      prisma.formSubmission.count({
        where: {
          siteId,
          status: "CONVERTED",
        },
      }),
    ]);

    const conversionRate = totalAll > 0
      ? Math.round((convertedCount / totalAll) * 10000) / 100
      : 0;

    // Mark NEW submissions as VIEWED in the background (don't await)
    const newSubmissionIds = submissions
      .filter((s) => s.status === "NEW")
      .map((s) => s.id);

    if (newSubmissionIds.length > 0) {
      prisma.formSubmission
        .updateMany({
          where: { id: { in: newSubmissionIds } },
          data: { status: "VIEWED" },
        })
        .catch((err: unknown) => {
          console.error("[studio/leads] Failed to mark submissions as VIEWED:", err);
        });
    }

    return NextResponse.json({
      submissions,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      stats: {
        total: totalAll,
        newToday,
        conversionRate,
      },
    });
  } catch (error) {
    console.error("[studio/leads]", error);
    return NextResponse.json(
      { error: "Failed to load leads" },
      { status: 500 }
    );
  }
}
