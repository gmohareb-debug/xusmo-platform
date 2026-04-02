// GET /api/admin/builds
// Returns paginated builds list with filters.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status");
    const archetype = searchParams.get("archetype");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);

    const where: Prisma.BuildWhereInput = {};
    if (status) where.status = status as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (archetype) where.archetype = archetype as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [builds, total] = await Promise.all([
      prisma.build.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
        include: {
          blueprint: {
            select: {
              lead: {
                select: { businessName: true, industryName: true },
              },
            },
          },
          site: { select: { wpUrl: true, status: true } },
          _count: { select: { agentLogs: true } },
        },
      }),
      prisma.build.count({ where }),
    ]);

    return NextResponse.json({
      builds: builds.map((b) => ({
        id: b.id,
        status: b.status,
        businessName: b.blueprint?.lead?.businessName ?? "Unknown",
        industry: b.blueprint?.lead?.industryName ?? "Unknown",
        archetype: b.archetype,
        currentAgent: b.currentAgent,
        progress: b.progress,
        totalLlmCost: b.totalLlmCost,
        totalBuildTime: b.totalBuildTime,
        siteUrl: b.site?.wpUrl,
        siteStatus: b.site?.status,
        agentLogCount: b._count.agentLogs,
        failureReason: b.failureReason,
        createdAt: b.createdAt,
        startedAt: b.startedAt,
        completedAt: b.completedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[admin/builds]", error);
    return NextResponse.json(
      { error: "Failed to load builds" },
      { status: 500 }
    );
  }
}
