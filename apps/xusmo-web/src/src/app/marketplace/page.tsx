// =============================================================================
// Theme Marketplace Page — Browse and preview community themes
// =============================================================================

import MarketingLayout from "@/components/layout/MarketingLayout";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import AnimatedSection from "@/components/ui/AnimatedSection";
import MarketplaceClient from "./MarketplaceClient";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Theme Marketplace | Xusmo",
  description:
    "Browse professional website themes built by the community. Preview, customize, and launch your site in minutes.",
};

export default async function MarketplacePage() {
  // Fetch initial themes from the pool (first 20, ordered by popularity)
  let initialThemes: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

  try {
    const themes = await prisma.themePoolEntry.findMany({
      where: { status: "active" },
      orderBy: { usageCount: "desc" },
      take: 100, // Fetch more so client-side filtering works well
    });

    initialThemes = themes.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      archetype: t.archetype,
      industryTags: t.industryTags as string[] | null,
      colors: t.colors as Record<string, string>,
      fonts: t.fonts as Record<string, string>,
      usageCount: t.usageCount,
      rating: t.rating,
      createdAt: t.createdAt.toISOString(),
    }));
  } catch {
    // Database unavailable — render with empty list
    initialThemes = [];
  }

  return (
    <MarketingLayout>
      <section className="py-16 bg-gradient-hero">
        <Container>
          <AnimatedSection>
            <SectionHeading
              eyebrow="Theme Marketplace"
              title="Find Your Perfect Design"
              subtitle="Browse professional themes built by the Xusmo community. Preview with real colors, fonts, and layouts — then launch in minutes."
            />
          </AnimatedSection>
        </Container>
      </section>

      <section className="py-12 bg-white min-h-screen">
        <Container width="wide">
          <MarketplaceClient initialThemes={initialThemes} />
        </Container>
      </section>
    </MarketingLayout>
  );
}
