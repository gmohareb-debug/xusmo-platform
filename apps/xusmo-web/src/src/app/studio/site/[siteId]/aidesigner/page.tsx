// =============================================================================
// AI Designer — Server component (data fetching)
// =============================================================================

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import AIDesignerClient from "./AIDesignerClient";

export default async function AIDesignerPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;

  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: {
      id: true,
      businessName: true,
      archetype: true,
      status: true,
      wpUrl: true,
      activePreset: true,
      customCss: true,
      designDocument: true,
      pages: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          slug: true,
          title: true,
          sortOrder: true,
          heroHeadline: true,
          heroSubheadline: true,
          ctaLabel: true,
          metaTitle: true,
          metaDesc: true,
        },
      },
    },
  });

  if (!site) notFound();

  const designDocument = site.designDocument as Record<string, unknown> | null;
  const theme = (designDocument?.theme as Record<string, unknown>) || null;
  const enginePages = (designDocument?.pages as Record<string, unknown>) || null;
  const plan = (designDocument?._plan as Record<string, unknown>) || null;

  // Extract section counts per page
  const pageSections: Record<string, number> = {};
  if (enginePages && typeof enginePages === "object") {
    for (const [slug, page] of Object.entries(enginePages)) {
      if (page && typeof page === "object") {
        const p = page as Record<string, unknown>;
        const sections = p.sections;
        pageSections[slug] = Array.isArray(sections) ? sections.length : 0;
      }
    }
  }

  return (
    <AIDesignerClient
      site={{
        id: site.id,
        businessName: site.businessName,
        archetype: site.archetype,
        status: site.status,
        wpUrl: site.wpUrl,
        activePreset: site.activePreset,
        customCss: site.customCss,
        hasDesignDocument: !!designDocument,
        pages: site.pages.map((p) => ({
          ...p,
          sectionCount: pageSections[p.slug] || 0,
        })),
        theme: theme
          ? {
              colors: (theme.colors as Record<string, string>) || {},
              fonts: (theme.fonts as Record<string, string>) || {},
              radius: (theme.radius as string) || "8px",
            }
          : null,
        componentCount: plan
          ? (plan.componentCount as number) || 0
          : 0,
        personality: plan ? (plan.personality as string) || "" : "",
      }}
    />
  );
}
