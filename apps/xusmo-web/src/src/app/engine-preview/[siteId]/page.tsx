// =============================================================================
// Engine Preview — Full-page renderer for engine-generated sites.
// Loaded inside an iframe by PreviewClient. Renders React components from
// the designDocument (SiteDocument JSON) using @xusmo/engine components.
// =============================================================================

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import EnginePreviewClient from "./EnginePreviewClient";

export default async function EnginePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { siteId } = await params;
  const { page: pageSlug } = await searchParams;

  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: {
      id: true,
      businessName: true,
      designDocument: true,
    },
  });

  if (!site?.designDocument) notFound();

  return (
    <EnginePreviewClient
      designDocument={site.designDocument as Record<string, unknown>}
      businessName={site.businessName}
      activePageSlug={pageSlug || "home"}
    />
  );
}
