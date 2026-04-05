// POST /api/domains/search
// Searches for available domains with pricing.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { searchDomain } from "@/lib/domains/cloudflare";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { query } = (await req.json()) as { query: string };
    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const results = await searchDomain(query);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("[domains/search]", error);
    return NextResponse.json(
      { error: "Domain search failed" },
      { status: 500 }
    );
  }
}
