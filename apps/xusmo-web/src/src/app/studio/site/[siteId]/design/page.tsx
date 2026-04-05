// =============================================================================
// Design Screen — Server component (data fetching)
// =============================================================================

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import DesignClient from "./DesignClient";

export default async function DesignPage({
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
      industryId: true,
      customCss: true,
      customCssUpdatedAt: true,
      activePreset: true,
      archetype: true,
      themePoolEntryId: true,
      wpUrl: true,
      designDocument: true,
      themePoolEntry: {
        select: {
          colors: true,
          fonts: true,
        },
      },
    },
  });

  if (!site) notFound();

  // Fetch industry defaults if industryId exists
  let industry: {
    displayName: string;
    primaryColors: string[] | null;
    fontPreference: string | null;
  } | null = null;

  if (site.industryId) {
    const raw = await prisma.industryDefault.findUnique({
      where: { id: site.industryId },
      select: {
        displayName: true,
        primaryColors: true,
        fontPreference: true,
      },
    });
    if (raw) {
      industry = {
        displayName: raw.displayName,
        primaryColors: raw.primaryColors as string[] | null,
        fontPreference: raw.fontPreference,
      };
    }
  }

  // Extract theme colors and fonts from the ThemePoolEntry if available
  let themeColors: Record<string, string> | null = null;
  let themeFonts: { heading: string; body: string } | null = null;

  if (site.themePoolEntry) {
    const rawColors = site.themePoolEntry.colors as Record<string, string> | null;
    if (rawColors) {
      // Map ThemePoolEntry color keys to the 8 standard keys
      // ThemePoolEntry uses "bg" for background
      themeColors = {
        primary: rawColors.primary || "#1e40af",
        secondary: rawColors.secondary || "#475569",
        accent: rawColors.accent || "#dc2626",
        background: rawColors.bg || rawColors.background || "#ffffff",
        surface: rawColors.surface || "#f8fafc",
        text: rawColors.text || "#0f172a",
        textMuted: rawColors.textMuted || "#64748b",
        border: rawColors.border || "#e2e8f0",
      };
    }

    const rawFonts = site.themePoolEntry.fonts as Record<string, string> | null;
    if (rawFonts) {
      themeFonts = {
        heading: rawFonts.heading || "Inter",
        body: rawFonts.body || "Inter",
      };
    }
  }

  // For engine sites, use designDocument.theme as the canonical theme
  const designDoc = site.designDocument as Record<string, unknown> | null;
  const engineTheme = designDoc?.theme as Record<string, unknown> | null;
  if (engineTheme) {
    const engineColors = engineTheme.colors as Record<string, string> | null;
    const engineFonts = engineTheme.fonts as Record<string, string> | null;
    if (engineColors) themeColors = engineColors;
    if (engineFonts) themeFonts = { heading: engineFonts.heading || "Inter", body: engineFonts.body || "Inter" };
  }

  // Engine-generated sites have designDocument — show visual editor
  const hasDesignDocument = !!site.designDocument;

  // Extract theme + pages from designDocument to pass directly to client
  // This avoids the client needing to make an authenticated API call
  let initialDesignData: { theme: Record<string, unknown>; pages: Record<string, unknown> } | null = null;
  if (site.designDocument) {
    const doc = site.designDocument as Record<string, unknown>;
    initialDesignData = {
      theme: (doc.theme as Record<string, unknown>) ?? {},
      pages: (doc.pages as Record<string, unknown>) ?? {},
    };
  }

  return (
    <DesignClient
      site={{
        id: site.id,
        businessName: site.businessName,
        customCss: site.customCss,
        customCssUpdatedAt: site.customCssUpdatedAt?.toISOString() || null,
        activePreset: site.activePreset,
        archetype: site.archetype,
        themePoolEntryId: site.themePoolEntryId,
        wpUrl: site.wpUrl,
        themeColors,
        themeFonts,
        hasDesignDocument,
      }}
      initialDesignData={initialDesignData}
      industry={industry}
    />
  );
}
