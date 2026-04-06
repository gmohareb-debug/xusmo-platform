// =============================================================================
// Engine Preview — Full-page renderer for engine-generated sites.
// Loaded inside an iframe by PreviewClient. Renders React components from
// the designDocument (SiteDocument JSON) using @xusmo/engine components.
// =============================================================================

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EnginePreviewClient from "./EnginePreviewClient";

// Dynamic metadata — shows business name instead of "Xusmo" in tab title
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { siteId } = await params;
  const { page: pageSlug } = await searchParams;

  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: { businessName: true, designDocument: true },
  });

  if (!site) return { title: "Preview" };

  const doc = site.designDocument as Record<string, unknown> | null;
  const theme = doc?.theme as Record<string, unknown> | undefined;
  const pageName = pageSlug && pageSlug !== "home"
    ? pageSlug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
    : null;

  const title = pageName
    ? `${pageName} | ${site.businessName}`
    : `${site.businessName}${theme?.name ? ` — ${theme.name}` : ""}`;

  return {
    title,
    description: `${site.businessName} — Professional website powered by Xusmo`,
  };
}

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
