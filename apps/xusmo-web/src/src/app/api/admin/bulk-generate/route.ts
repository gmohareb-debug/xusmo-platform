// =============================================================================
// Bulk Site Generation API — Accept array of business data, create leads + builds
// Agency white-label: generate multiple sites in a single batch request
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// ---------------------------------------------------------------------------
// POST — bulk generate sites from business data
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { businesses } = body;

    if (!Array.isArray(businesses) || businesses.length === 0) {
      return NextResponse.json(
        { error: "businesses array required" },
        { status: 400 }
      );
    }

    if (businesses.length > 20) {
      return NextResponse.json(
        { error: "Maximum 20 businesses per batch" },
        { status: 400 }
      );
    }

    const results: {
      businessName: string;
      status: string;
      buildId?: string;
      leadId?: string;
      error?: string;
    }[] = [];

    for (const biz of businesses) {
      try {
        if (!biz.businessName || !biz.description) {
          results.push({
            businessName: biz.businessName || "Unknown",
            status: "error",
            error: "Missing businessName or description",
          });
          continue;
        }

        // Create lead
        const lead = await prisma.lead.create({
          data: {
            userId: user.id,
            email: biz.email || session.user.email,
            businessName: biz.businessName,
            businessDescription: biz.description,
            status: "BLUEPRINT_GENERATED",
            rawAnswers: biz,
            archetype: biz.archetype || "SERVICE",
            phone: biz.phone || null,
            location: biz.location || null,
          },
        });

        // Create blueprint
        const pages = (
          biz.pages || ["home", "services", "about", "contact"]
        ).map((slug: string, i: number) => ({
          slug,
          title: slug.charAt(0).toUpperCase() + slug.slice(1),
          isRequired: true,
          sortOrder: i,
          blocks: [],
        }));

        const blueprint = await prisma.blueprint.create({
          data: {
            leadId: lead.id,
            businessInfo: {
              name: biz.businessName,
              description: biz.description,
              tagline: biz.tagline || "",
              phone: biz.phone || "",
              email: biz.email || "",
              location: biz.location || "",
            },
            pages,
            services: biz.services || [],
            designPrefs: biz.designPrefs || {},
            features: biz.features || [],
            trustSignals: [],
            contactPrefs: {
              phone: biz.phone || "",
              email: biz.email || "",
              formType: "contact_form",
              showMap: false,
            },
          },
        });

        // Import startDevBuildPipeline dynamically to avoid circular deps
        const { startDevBuildPipeline } = await import("@/lib/queue");
        const buildResult = await startDevBuildPipeline(blueprint.id);

        results.push({
          businessName: biz.businessName,
          status: "queued",
          buildId: buildResult.buildId,
          leadId: lead.id,
        });
      } catch (error) {
        results.push({
          businessName: biz.businessName || "Unknown",
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      total: businesses.length,
      queued: results.filter((r) => r.status === "queued").length,
      errors: results.filter((r) => r.status === "error").length,
      results,
    });
  } catch (error) {
    console.error("[admin/bulk-generate]", error);
    return NextResponse.json(
      { error: "Bulk generation failed" },
      { status: 500 }
    );
  }
}
