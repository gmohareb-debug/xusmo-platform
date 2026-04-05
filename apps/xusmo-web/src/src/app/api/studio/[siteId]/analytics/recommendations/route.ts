// GET /api/studio/[siteId]/analytics/recommendations — rule-based recommendation engine

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";

interface Recommendation {
  id: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  actionLabel: string;
  actionRoute: string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    const session = await getServerSession(authOptions);
    const auth = await getStudioAuth(session?.user?.email, siteId, "view");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recommendations: Recommendation[] = [];

    // 1. Check if home page hero headline is generic
    const homePage = await prisma.page.findUnique({
      where: { siteId_slug: { siteId, slug: "home" } },
      select: { heroHeadline: true },
    });

    if (homePage) {
      const headline = (homePage.heroHeadline ?? "").toLowerCase().trim();
      if (headline.includes("welcome to") || headline.length < 20) {
        recommendations.push({
          id: "hero-headline-generic",
          priority: "HIGH",
          title: "Improve your homepage headline",
          description:
            "Your hero headline appears generic or too short. A strong, specific headline improves engagement and conversions. Consider highlighting your key value proposition.",
          actionLabel: "Edit Homepage",
          actionRoute: `/studio/${siteId}/content/home`,
        });
      }
    }

    // 2. Check if any published pages have null metaDescription
    const pagesWithoutMeta = await prisma.page.count({
      where: {
        siteId,
        metaDesc: null,
      },
    });

    if (pagesWithoutMeta > 0) {
      recommendations.push({
        id: "missing-meta-descriptions",
        priority: "MEDIUM",
        title: `${pagesWithoutMeta} page(s) missing meta descriptions`,
        description:
          "Meta descriptions help search engines understand your pages and improve click-through rates in search results. Add a unique description to each page.",
        actionLabel: "Review SEO",
        actionRoute: `/studio/${siteId}/seo`,
      });
    }

    // 3. Check if blog posts count is 0
    const blogPostCount = await prisma.blogPost.count({
      where: { siteId },
    });

    if (blogPostCount === 0) {
      recommendations.push({
        id: "no-blog-posts",
        priority: "MEDIUM",
        title: "Start a blog to boost SEO",
        description:
          "You have no blog posts yet. Regular blogging helps drive organic traffic and establishes your authority in your industry.",
        actionLabel: "Create First Post",
        actionRoute: `/studio/${siteId}/blog/new`,
      });
    }

    // 4. Check if testimonials count < 3
    const testimonialCount = await prisma.testimonial.count({
      where: { siteId },
    });

    if (testimonialCount < 3) {
      recommendations.push({
        id: "low-testimonials",
        priority: "MEDIUM",
        title:
          testimonialCount === 0
            ? "Add testimonials to build trust"
            : `Add more testimonials (${testimonialCount}/3 minimum)`,
        description:
          "Social proof is one of the most powerful conversion tools. Aim for at least 3 testimonials to show credibility to potential customers.",
        actionLabel: "Manage Reviews",
        actionRoute: `/studio/${siteId}/reviews`,
      });
    }

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("[studio/analytics/recommendations GET]", error);
    return NextResponse.json(
      { error: "Failed to load recommendations" },
      { status: 500 }
    );
  }
}
