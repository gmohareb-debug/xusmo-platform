// =============================================================================
// Compliance Document Generator API
// POST /api/studio/[siteId]/compliance — Generate privacy policy or terms of service
// Body: { type: "privacy" | "terms" }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStudioAuth } from "@/lib/studio/permissions";
import { generatePrivacyPolicy } from "@/lib/compliance/privacy";
import { generateTermsOfService } from "@/lib/compliance/terms";

// ---------------------------------------------------------------------------
// POST — generate compliance documents
// ---------------------------------------------------------------------------

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
    const { type } = body; // "privacy" | "terms"

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { businessName: true, wpUrl: true, isEcommerce: true },
    });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    let content: string;
    let slug: string;
    let title: string;

    if (type === "privacy") {
      content = await generatePrivacyPolicy({
        businessName: site.businessName,
        website: site.wpUrl || undefined,
        collectsPayment: site.isEcommerce,
        hasContactForm: true,
        usesAnalytics: true,
        usesNewsletter: false,
      });
      slug = "privacy-policy";
      title = "Privacy Policy";
    } else if (type === "terms") {
      content = await generateTermsOfService({
        businessName: site.businessName,
        website: site.wpUrl || undefined,
        isEcommerce: site.isEcommerce,
      });
      slug = "terms-of-service";
      title = "Terms of Service";
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Upsert the page
    await prisma.page.upsert({
      where: { siteId_slug: { siteId, slug } },
      create: {
        siteId,
        slug,
        title,
        content,
        sortOrder: 99,
        isRequired: false,
      },
      update: { content, title },
    });

    return NextResponse.json({ success: true, slug, title });
  } catch (error) {
    console.error("[studio/compliance]", error);
    return NextResponse.json(
      { error: "Failed to generate compliance document" },
      { status: 500 }
    );
  }
}
