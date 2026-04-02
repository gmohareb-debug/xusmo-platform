// GET /api/admin/defaults — list all industry defaults
// POST /api/admin/defaults — create new industry default

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
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

    const defaults = await prisma.industryDefault.findMany({
      orderBy: { displayName: "asc" },
      include: {
        _count: { select: { leads: true } },
      },
    });

    return NextResponse.json(
      defaults.map((d) => ({
        ...d,
        totalLeads: d._count.leads,
      }))
    );
  } catch (error) {
    console.error("[admin/defaults]", error);
    return NextResponse.json(
      { error: "Failed to load defaults" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();

    const industry = await prisma.industryDefault.create({
      data: body,
    });

    return NextResponse.json(industry, { status: 201 });
  } catch (error) {
    console.error("[admin/defaults/create]", error);
    return NextResponse.json(
      { error: "Failed to create industry" },
      { status: 500 }
    );
  }
}
