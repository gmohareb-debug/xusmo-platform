// =============================================================================
// Preview & Review — Server component (data fetching)
// =============================================================================

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import PreviewClient from "./PreviewClient";

export default async function PreviewPage({
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
      wpUrl: true,
      status: true,
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
          bodyContent: true,
        },
      },
      build: {
        select: {
          id: true,
          status: true,
          qaReports: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
      revisions: {
        orderBy: { requestedAt: "desc" },
        take: 5,
        select: {
          id: true,
          status: true,
          description: true,
          requestType: true,
          requestedAt: true,
        },
      },
    },
  });

  if (!site) notFound();

  // Extract page list from designDocument for engine sites
  let enginePages: { slug: string; title: string }[] | null = null;
  if (site.designDocument) {
    const doc = site.designDocument as { pages?: Record<string, { label?: string; page?: string }> };
    if (doc.pages) {
      enginePages = Object.entries(doc.pages).map(([key, pageData]) => ({
        slug: key,
        title: pageData.label || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
      }));
    }
  }

  // Serialize dates + cast Json fields for client component
  const serialized = {
    ...site,
    designDocument: (site.designDocument as Record<string, unknown>) ?? null,
    pages: site.pages.map((p) => ({
      ...p,
      bodyContent: (p.bodyContent ?? null) as { type: string; content: string }[] | null,
    })),
    build: site.build
      ? {
          ...site.build,
          qaReports: site.build.qaReports.map((r) => ({
            ...r,
            createdAt: r.createdAt.toISOString(),
          })),
        }
      : null,
    revisions: site.revisions.map((r) => ({
      ...r,
      requestedAt: r.requestedAt.toISOString(),
    })),
  };

  return <PreviewClient site={serialized} enginePages={enginePages} />;
}
