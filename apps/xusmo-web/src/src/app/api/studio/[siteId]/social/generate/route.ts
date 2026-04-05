// =============================================================================
// Social Content Generator API — AI-generated social media posts
// POST /api/studio/[siteId]/social/generate
// Generates platform-specific social media posts using Gemini Flash
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStudioAuth } from "@/lib/studio/permissions";
import { geminiFlash } from "@/lib/llm/gemini";

// Supported platforms
const PLATFORMS = ["facebook", "instagram", "linkedin", "twitter"] as const;
type Platform = (typeof PLATFORMS)[number];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const session = await getServerSession(authOptions);
    const auth = await getStudioAuth(session?.user?.email, siteId, "edit");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { platform, topic } = body;

    // Validate platform if provided
    if (platform && !PLATFORMS.includes(platform as Platform)) {
      return NextResponse.json(
        { error: `Invalid platform. Must be one of: ${PLATFORMS.join(", ")}` },
        { status: 400 }
      );
    }

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { businessName: true, archetype: true, industryId: true },
    });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Get industry context
    let industryName = "general business";
    if (site.industryId) {
      const ind = await prisma.industryDefault.findUnique({
        where: { id: site.industryId },
        select: { displayName: true },
      });
      if (ind) industryName = ind.displayName;
    }

    const platformLabel = platform || "social media";

    const prompt = `Generate 3 ${platformLabel} posts for ${site.businessName}, a ${industryName} business.
${topic ? `Topic: ${topic}` : "Choose engaging topics relevant to their industry."}

Return JSON array:
[
  { "text": "post text", "hashtags": ["tag1", "tag2"], "callToAction": "optional CTA" },
  { "text": "post text", "hashtags": ["tag1", "tag2"], "callToAction": "optional CTA" },
  { "text": "post text", "hashtags": ["tag1", "tag2"], "callToAction": "optional CTA" }
]

Platform guidelines:
- Facebook: 1-3 paragraphs, conversational, can include links
- Instagram: Short, visual language, 5-10 hashtags
- LinkedIn: Professional tone, industry insights
- Twitter/X: Under 280 chars, punchy

Return ONLY valid JSON array.`;

    const result = await geminiFlash(
      prompt,
      "You are a social media content creator for small businesses. Write engaging, platform-appropriate posts. Return only valid JSON."
    );

    if (!result) {
      return NextResponse.json(
        { error: "Social content generation failed - LLM returned no response" },
        { status: 500 }
      );
    }

    const cleaned = result.text
      .replace(/```json?\n?/g, "")
      .replace(/```/g, "")
      .trim();

    let posts: Array<{
      text: string;
      hashtags?: string[];
      callToAction?: string;
    }>;

    try {
      posts = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse social content from AI response" },
        { status: 500 }
      );
    }

    if (!Array.isArray(posts)) {
      return NextResponse.json(
        { error: "AI response was not an array of posts" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      platform: platform || "general",
      businessName: site.businessName,
      posts,
      llmModel: result.model,
      tokensUsed: result.tokensUsed,
    });
  } catch (error) {
    console.error("[studio/social/generate]", error);
    return NextResponse.json(
      { error: "Failed to generate social content" },
      { status: 500 }
    );
  }
}
