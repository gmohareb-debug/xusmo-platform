// POST /api/studio/[siteId]/blog/ai-draft — generate an AI blog draft
// Returns mock block content (Gemini integration handled separately)

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStudioAuth } from "@/lib/studio/permissions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ContentBlock {
  type: "heading" | "paragraph" | "subheading" | "list" | "quote";
  content: string;
}

interface AiDraftRequest {
  title: string;
  topic?: string;
  tone?: string;
  length?: "short" | "medium" | "long";
}

// ---------------------------------------------------------------------------
// Mock content generation
// ---------------------------------------------------------------------------

function generateMockBlocks(params: AiDraftRequest): ContentBlock[] {
  const { title, topic, tone, length } = params;

  const toneLabel = tone ?? "professional";
  const topicLabel = topic ?? title;

  // Base blocks that every draft includes
  const blocks: ContentBlock[] = [
    {
      type: "heading",
      content: title,
    },
    {
      type: "paragraph",
      content: `This is an AI-generated draft about "${topicLabel}" written in a ${toneLabel} tone. The content below serves as a starting point for your blog post and should be reviewed and edited before publishing.`,
    },
    {
      type: "subheading",
      content: "Introduction",
    },
    {
      type: "paragraph",
      content: `Understanding ${topicLabel} is essential for anyone looking to stay informed and make better decisions in this space. In this article, we explore the key aspects, recent developments, and practical takeaways that matter most to you and your audience.`,
    },
    {
      type: "subheading",
      content: "Key Points",
    },
    {
      type: "list",
      content: [
        `The fundamentals of ${topicLabel} and why they matter`,
        "Current trends shaping the landscape",
        "Practical strategies you can apply today",
        "Common pitfalls to avoid",
      ].join("\n"),
    },
    {
      type: "subheading",
      content: "Deep Dive",
    },
    {
      type: "paragraph",
      content: `When examining ${topicLabel} more closely, several important patterns emerge. Industry experts consistently point to the need for a thoughtful, well-informed approach. Rather than chasing short-term gains, the most successful practitioners focus on building a strong foundation of knowledge and adapting their strategies as conditions change.`,
    },
  ];

  // Add extra sections for medium and long drafts
  if (length === "medium" || length === "long") {
    blocks.push(
      {
        type: "subheading",
        content: "Analysis & Insights",
      },
      {
        type: "paragraph",
        content: `Recent data suggests that ${topicLabel} continues to evolve rapidly. Stakeholders who stay ahead of these changes position themselves for long-term success. The most effective approach combines continuous learning with practical experimentation, allowing you to refine your methods over time.`,
      },
      {
        type: "quote",
        content: `"The best time to start learning about ${topicLabel} was yesterday. The second best time is now."`,
      },
      {
        type: "paragraph",
        content: `By taking a structured approach to ${topicLabel}, you can avoid common mistakes and accelerate your progress. Focus on measurable outcomes and be willing to iterate on your strategy based on the results you observe.`,
      }
    );
  }

  // Add even more content for long drafts
  if (length === "long") {
    blocks.push(
      {
        type: "subheading",
        content: "Implementation Guide",
      },
      {
        type: "paragraph",
        content: `Putting theory into practice requires a clear plan. Start by identifying your primary goals related to ${topicLabel}, then break them down into manageable milestones. Each milestone should have specific, measurable criteria for success so you can track your progress effectively.`,
      },
      {
        type: "list",
        content: [
          "Define your objectives and success metrics",
          "Research best practices and case studies",
          "Create a phased implementation timeline",
          "Monitor results and adjust your approach",
          "Document learnings for future reference",
        ].join("\n"),
      },
      {
        type: "subheading",
        content: "Looking Ahead",
      },
      {
        type: "paragraph",
        content: `The future of ${topicLabel} holds both challenges and opportunities. Those who invest in understanding the underlying trends and developing adaptable strategies will be best positioned to thrive. Keep an eye on emerging developments and be ready to pivot when the landscape shifts.`,
      }
    );
  }

  // Conclusion (always included)
  blocks.push(
    {
      type: "subheading",
      content: "Conclusion",
    },
    {
      type: "paragraph",
      content: `In summary, ${topicLabel} presents a compelling opportunity for those willing to invest the time and effort. By staying informed, applying best practices, and remaining adaptable, you can achieve meaningful results. We encourage you to take the insights from this article and put them into action.`,
    }
  );

  return blocks;
}

// ---------------------------------------------------------------------------
// POST — generate AI draft
// ---------------------------------------------------------------------------

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;

    const auth = await getStudioAuth(session.user.email, siteId, "edit");
    if (!auth) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body: AiDraftRequest = await req.json();

    if (!body.title) {
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 }
      );
    }

    const generationParams = {
      title: body.title,
      topic: body.topic ?? null,
      tone: body.tone ?? "professional",
      length: body.length ?? "medium",
    };

    const blocks = generateMockBlocks({
      title: generationParams.title,
      topic: generationParams.topic ?? undefined,
      tone: generationParams.tone,
      length: generationParams.length as AiDraftRequest["length"],
    });

    return NextResponse.json({
      blocks,
      aiGenerated: true,
      generationParams,
      model: "mock",
      note: "This is mock-generated content. Gemini integration will replace this generator.",
    });
  } catch (error) {
    console.error("[studio/blog/ai-draft]", error);
    return NextResponse.json(
      { error: "Failed to generate AI draft" },
      { status: 500 }
    );
  }
}
