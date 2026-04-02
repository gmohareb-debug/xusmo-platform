// =============================================================================
// Content Template Marketplace Page — Browse pre-built content blocks
// =============================================================================

import MarketingLayout from "@/components/layout/MarketingLayout";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import AnimatedSection from "@/components/ui/AnimatedSection";
import MarketplaceTemplatesClient from "./MarketplaceTemplatesClient";

export const metadata = {
  title: "Content Templates | Xusmo Marketplace",
  description:
    "Browse pre-built content blocks — hero sections, service grids, testimonials, and more. Add them to your site with one click.",
};

export default function ContentTemplatesPage() {
  return (
    <MarketingLayout>
      <section className="py-16 bg-gradient-hero">
        <Container>
          <AnimatedSection>
            <SectionHeading
              eyebrow="Content Templates"
              title="Ready-Made Content Blocks"
              subtitle="Browse pre-built sections for your site. Hero variations, service grids, testimonials, FAQs, and more — add any to your pages with one click."
            />
          </AnimatedSection>
        </Container>
      </section>

      <section className="py-12 bg-white min-h-screen">
        <Container width="wide">
          <MarketplaceTemplatesClient />
        </Container>
      </section>
    </MarketingLayout>
  );
}
