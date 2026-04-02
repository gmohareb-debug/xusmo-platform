// GET /api/admin/activity
// Paginated ActivityLog. Supports query params:
// category, severity, siteId, from, to, page, limit.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

// Check admin auth
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const category = searchParams.get("category");
    const severity = searchParams.get("severity");
    const siteId = searchParams.get("siteId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 200);

    const where: Prisma.ActivityLogWhereInput = {};

    if (category) where.category = category;
    if (severity) where.severity = severity;
    if (siteId) where.siteId = siteId;

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.activityLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[admin/activity]", error);
    return NextResponse.json(
      { error: "Failed to load activity logs" },
      { status: 500 }
    );
  }
}
