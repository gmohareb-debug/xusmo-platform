import { NextRequest, NextResponse } from "next/server";

const WORD1_ENGINE_URL = process.env.WORD1_ENGINE_URL || "http://localhost:3010";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${WORD1_ENGINE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120_000),
    });

    const data = await res.json().catch(() => ({}));

    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "TimeoutError") {
      return NextResponse.json(
        { error: "AI generation timed out", code: "TIMEOUT" },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: "AI service unavailable", code: "SERVICE_ERROR" },
      { status: 502 }
    );
  }
}
