// =============================================================================
// Blog Generator — AI-generated blog posts for Pro/Agency tier sites
// LLM-powered idea generation + content pipeline.
// Pure logic — LLM functions injected by the host application.
// =============================================================================

import type { SimpleLLMFunction } from "./types";

export interface BlogPostIdea {
  title: string;
  topic: string;
  keywords: string[];
  targetWordCount: number;
}

export interface GeneratedBlogPost {
  title: string;
  slug: string;
  content: unknown; // JSON block format for BlogPost.content field
  excerpt: string;
  metaDescription: string;
  focusKeyword: string;
  featuredImagePrompt: string;
  tags: string[];
  wordCount: number;
  llmModel: string;
  llmCost: number;
}

/**
 * Generate blog post ideas for a given industry using LLM.
 * Falls back to template-based ideas if LLM is unavailable.
 */
export async function generateBlogIdeas(
  industry: string,
  businessName: string,
  llmFlash: SimpleLLMFunction,
  count: number = 4
): Promise<BlogPostIdea[]> {
  // Try LLM-powered idea generation first
  try {
    const result = await llmFlash(
      `Generate ${count} blog post ideas for "${businessName}", a ${industry} business.
Return JSON array: [{ "title": "...", "topic": "category", "keywords": ["kw1","kw2","kw3"], "targetWordCount": 1000 }]
Topics should help attract customers via SEO. Return ONLY valid JSON.`,
      "You are an SEO content strategist for small businesses."
    );

    if (result) {
      const cleaned = result.text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      const ideas = JSON.parse(cleaned);
      if (Array.isArray(ideas) && ideas.length > 0) {
        return ideas.slice(0, count);
      }
    }
  } catch {
    // Fall through to template-based ideas
  }

  // Fallback: template-based ideas
  const templates: BlogPostIdea[] = [
    {
      title: `5 Things Every ${industry} Customer Should Know`,
      topic: "customer-education",
      keywords: [industry.toLowerCase(), "tips", "guide"],
      targetWordCount: 1000,
    },
    {
      title: `How to Choose the Right ${industry} Service`,
      topic: "buying-guide",
      keywords: [industry.toLowerCase(), "how to choose", "comparison"],
      targetWordCount: 1200,
    },
    {
      title: `${industry} Trends to Watch This Year`,
      topic: "industry-trends",
      keywords: [industry.toLowerCase(), "trends", new Date().getFullYear().toString()],
      targetWordCount: 800,
    },
    {
      title: `Common ${industry} Mistakes and How to Avoid Them`,
      topic: "problem-solving",
      keywords: [industry.toLowerCase(), "mistakes", "avoid"],
      targetWordCount: 1000,
    },
  ];

  return templates.slice(0, count);
}

/**
 * Generate a full blog post from an idea using LLM.
 * Returns block-format content compatible with the BlogPost model.
 */
export async function generateBlogPost(
  idea: BlogPostIdea,
  businessName: string,
  industry: string,
  llmPro: SimpleLLMFunction
): Promise<GeneratedBlogPost> {
  const prompt = `Write a blog post for "${businessName}", a ${industry} business.
Title: "${idea.title}"
Target: ${idea.targetWordCount} words.
SEO Keywords: ${idea.keywords.join(", ")}

Return JSON:
{
  "title": "${idea.title}",
  "slug": "url-friendly-slug",
  "excerpt": "2-3 sentence summary",
  "content": [
    { "type": "heading", "content": "Section heading" },
    { "type": "paragraph", "content": "Paragraph text..." },
    { "type": "subheading", "content": "Sub-section" },
    { "type": "list", "content": "Item 1\\nItem 2\\nItem 3" },
    { "type": "quote", "content": "Callout quote" }
  ],
  "metaDescription": "SEO meta description (155 chars max)",
  "focusKeyword": "primary keyword",
  "tags": ["tag1", "tag2"]
}

Write engaging, SEO-friendly content. Reference the business name naturally.
End with a call to action. Return ONLY valid JSON.`;

  const result = await llmPro(
    prompt,
    "You are an expert blog writer for small businesses. Write engaging, practical content. Return only valid JSON."
  );

  if (result) {
    try {
      const cleaned = result.text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      const blog = JSON.parse(cleaned);

      const safeSlug = (blog.slug || idea.topic)
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      return {
        title: blog.title || idea.title,
        slug: safeSlug,
        content: blog.content || [],
        excerpt: blog.excerpt || "",
        metaDescription: blog.metaDescription || `Learn about ${idea.title.toLowerCase()}.`,
        focusKeyword: blog.focusKeyword || idea.keywords[0] || "",
        featuredImagePrompt: `Professional blog header image for "${idea.title}", clean modern design, ${industry} business`,
        tags: blog.tags || idea.keywords,
        wordCount: idea.targetWordCount,
        llmModel: result.model,
        llmCost: result.cost,
      };
    } catch {
      // Fall through to placeholder
    }
  }

  // Fallback: placeholder content (when LLM is unavailable)
  return {
    title: idea.title,
    slug: idea.topic,
    content: [
      { type: "heading", content: idea.title },
      { type: "paragraph", content: `This is a draft blog post about "${idea.title}". The full content will be generated by our AI content pipeline.` },
      { type: "paragraph", content: `Target word count: ${idea.targetWordCount} words. Topics covered: ${idea.keywords.join(", ")}.` },
    ],
    excerpt: `Learn about ${idea.title.toLowerCase()}. Expert insights and practical tips.`,
    metaDescription: `Learn about ${idea.title.toLowerCase()}. Expert insights and practical tips for your business.`,
    focusKeyword: idea.keywords[0] || "",
    featuredImagePrompt: `Professional blog header image for ${idea.title}, clean modern design`,
    tags: idea.keywords,
    wordCount: idea.targetWordCount,
    llmModel: "fallback",
    llmCost: 0,
  };
}

/**
 * Check if a site is eligible for auto-blogging
 */
export function isEligibleForAutoBlog(tier: string): boolean {
  return tier === "PRO" || tier === "AGENCY";
}
