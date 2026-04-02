// =============================================================================
// Blog Post Generation API — AI-powered blog content creation
// POST /api/studio/[siteId]/blog/generate
// Generates a full blog post using Gemini Pro and saves as a draft
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStudioAuth } from "@/lib/studio/permissions";
import { geminiPro } from "@/lib/llm/gemini";

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
    const { topic } = body; // optional topic suggestion

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { businessName: true, archetype: true, industryId: true, tier: true },
    });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Auto-blogging is only available for PRO and AGENCY tiers
    if (site.tier !== "PRO" && site.tier !== "AGENCY") {
      return NextResponse.json(
        { error: "Blog generation requires PRO or AGENCY tier" },
        { status: 403 }
      );
    }

    // Get industry info for better context
    let industryName = "general business";
    if (site.industryId) {
      const ind = await prisma.industryDefault.findUnique({
        where: { id: site.industryId },
        select: { displayName: true },
      });
      if (ind) industryName = ind.displayName;
    }

    const prompt = `Write a blog post for ${site.businessName}, a ${industryName} business.
${topic ? `Topic: ${topic}` : "Choose a relevant topic that would help their customers."}

Return JSON:
{
  "title": "Blog post title (60 chars max)",
  "slug": "url-friendly-slug",
  "excerpt": "2-3 sentence summary",
  "content": [
    { "type": "heading", "content": "Section heading" },
    { "type": "paragraph", "content": "Paragraph text..." },
    { "type": "subheading", "content": "Sub-section heading" },
    { "type": "paragraph", "content": "More text..." },
    { "type": "list", "content": "Item 1\\nItem 2\\nItem 3" },
    { "type": "quote", "content": "A relevant quote or callout" }
  ],
  "metaDescription": "SEO meta description (155 chars max)",
  "focusKeyword": "primary SEO keyword",
  "tags": ["tag1", "tag2", "tag3"]
}

Guidelines:
- Write 800-1200 words of engaging, SEO-friendly content
- Use h2, h3 sections with practical tips
- Reference the business name naturally
- End with a call to action
- Content should be formatted as a JSON array of blocks (heading, paragraph, subheading, list, quote types)

Return ONLY valid JSON.`;

    const result = await geminiPro(
      prompt,
      "You are an expert blog writer for small businesses. Write engaging, SEO-friendly content. Return only valid JSON."
    );

    if (!result) {
      return NextResponse.json(
        { error: "Blog generation failed - LLM returned no response" },
        { status: 500 }
      );
    }

    const cleaned = result.text
      .replace(/```json?\n?/g, "")
      .replace(/```/g, "")
      .trim();

    let blog: {
      title: string;
      slug: string;
      excerpt?: string;
      content: unknown;
      metaDescription?: string;
      focusKeyword?: string;
      tags?: string[];
    };

    try {
      blog = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse blog content from AI response" },
        { status: 500 }
      );
    }

    // Validate required fields
    if (!blog.title || !blog.slug || !blog.content) {
      return NextResponse.json(
        { error: "AI response missing required fields (title, slug, content)" },
        { status: 500 }
      );
    }

    // Ensure slug is URL-safe
    const safeSlug = blog.slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // Check for duplicate slug
    const existingPost = await prisma.blogPost.findUnique({
      where: { siteId_slug: { siteId, slug: safeSlug } },
    });
    const finalSlug = existingPost
      ? `${safeSlug}-${Date.now().toString(36)}`
      : safeSlug;

    // Save to BlogPost model (content is Json block format)
    const post = await prisma.blogPost.create({
      data: {
        siteId,
        title: blog.title,
        slug: finalSlug,
        content: blog.content as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        excerpt: blog.excerpt || null,
        metaDescription: blog.metaDescription || null,
        focusKeyword: blog.focusKeyword || null,
        status: "DRAFT",
        aiGenerated: true,
        aiPrompt: topic || "auto-generated",
        llmModel: result.model,
        llmCost: result.cost,
      },
    });

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status,
        aiGenerated: true,
        llmModel: result.model,
        tokensUsed: result.tokensUsed,
      },
    });
  } catch (error) {
    console.error("[studio/blog/generate]", error);
    return NextResponse.json(
      { error: "Failed to generate blog post" },
      { status: 500 }
    );
  }
}
