"use client";

// =============================================================================
// Examples Gallery Page — Showcase of websites built by Xusmo
// =============================================================================

import { useState } from "react";
import Link from "next/link";
import MarketingLayout from "@/components/layout/MarketingLayout";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import GradientText from "@/components/ui/GradientText";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Card from "@/components/ui/Card";
import {
  ArrowUpRight,
  Wrench,
  UtensilsCrossed,
  Camera,
  Scissors,
  Dumbbell,
  Scale,
  Sparkles,
  PawPrint,
  Building2,
  Hammer,
  Stethoscope,
  TreePine,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Category = "All" | "Service" | "Venue" | "Portfolio";

interface ExampleSite {
  name: string;
  industry: string;
  category: Category;
  description: string;
  gradient: string;
  icon: React.ComponentType<{ className?: string }>;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const CATEGORIES: Category[] = ["All", "Service", "Venue", "Portfolio"];

const EXAMPLE_SITES: ExampleSite[] = [
  {
    name: "Rodriguez Plumbing Co.",
    industry: "Plumbing",
    category: "Service",
    description:
      "Emergency plumbing services with online booking, service areas, and customer testimonials.",
    gradient: "from-blue-500 to-cyan-400",
    icon: Wrench,
  },
  {
    name: "Bistro Nova",
    industry: "Restaurant",
    category: "Venue",
    description:
      "Upscale dining with interactive menu, reservation system, and photo gallery.",
    gradient: "from-amber-500 to-orange-400",
    icon: UtensilsCrossed,
  },
  {
    name: "JK Photography",
    industry: "Photography",
    category: "Portfolio",
    description:
      "Stunning portfolio showcasing wedding and event photography with client galleries.",
    gradient: "from-purple-500 to-pink-400",
    icon: Camera,
  },
  {
    name: "Luxe Hair Studio",
    industry: "Hair Salon",
    category: "Venue",
    description:
      "Modern salon site with stylist profiles, service menu, and appointment booking.",
    gradient: "from-rose-500 to-pink-400",
    icon: Scissors,
  },
  {
    name: "Iron Peak Fitness",
    industry: "Gym & Fitness",
    category: "Venue",
    description:
      "High-energy gym site with class schedules, membership plans, and trainer bios.",
    gradient: "from-red-500 to-orange-400",
    icon: Dumbbell,
  },
  {
    name: "Chen & Associates",
    industry: "Law Firm",
    category: "Service",
    description:
      "Professional legal practice site with practice areas, attorney profiles, and case results.",
    gradient: "from-slate-600 to-slate-400",
    icon: Scale,
  },
  {
    name: "Shine Cleaning Co.",
    industry: "Cleaning",
    category: "Service",
    description:
      "Residential and commercial cleaning with instant quote calculator and service packages.",
    gradient: "from-teal-500 to-emerald-400",
    icon: Sparkles,
  },
  {
    name: "Happy Paws Vet",
    industry: "Veterinary",
    category: "Service",
    description:
      "Warm, welcoming vet clinic site with services, pet care tips blog, and emergency info.",
    gradient: "from-green-500 to-lime-400",
    icon: PawPrint,
  },
  {
    name: "Summit Real Estate",
    industry: "Real Estate",
    category: "Service",
    description:
      "Property listings, agent profiles, neighborhood guides, and mortgage calculator.",
    gradient: "from-indigo-500 to-blue-400",
    icon: Building2,
  },
  {
    name: "Atlas Construction",
    industry: "Construction",
    category: "Portfolio",
    description:
      "Project showcase with before/after galleries, certifications, and request-a-quote form.",
    gradient: "from-yellow-500 to-amber-400",
    icon: Hammer,
  },
  {
    name: "Bright Smile Dental",
    industry: "Dental",
    category: "Service",
    description:
      "Family dental practice with service details, insurance info, and patient portal link.",
    gradient: "from-sky-500 to-cyan-400",
    icon: Stethoscope,
  },
  {
    name: "Evergreen Landscapes",
    industry: "Landscaping",
    category: "Portfolio",
    description:
      "Landscape design portfolio with project galleries, seasonal tips, and free estimate form.",
    gradient: "from-emerald-500 to-green-400",
    icon: TreePine,
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ExamplesPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filteredSites =
    activeCategory === "All"
      ? EXAMPLE_SITES
      : EXAMPLE_SITES.filter((site) => site.category === activeCategory);

  return (
    <MarketingLayout>
      {/* ================================================================
          HERO SECTION
          ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-hero pb-16 pt-12 sm:pt-20">
        <Container>
          <div className="text-center">
            <AnimatedSection delay={0}>
              <Badge variant="outline" className="mb-6">
                Example Gallery
              </Badge>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-neutral-900 leading-tight">
                See What Xusmo
                <br />
                <GradientText from="from-primary-600" to="to-primary-400">
                  Can Build
                </GradientText>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-neutral-500 leading-relaxed">
                Browse real examples of AI-built websites across dozens of
                industries. Every site was generated in minutes — not months.
              </p>
            </AnimatedSection>
          </div>
        </Container>
      </section>

      {/* ================================================================
          FILTER TABS + GALLERY
          ================================================================ */}
      <section className="py-24 bg-white">
        <Container width="wide">
          {/* Filter Tabs */}
          <AnimatedSection>
            <div className="flex flex-wrap items-center justify-center gap-2 mb-16">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`
                    rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300
                    ${
                      activeCategory === category
                        ? "bg-primary-600 text-white shadow-md shadow-primary-200"
                        : "bg-surface-cream text-neutral-600 hover:bg-primary-50 hover:text-primary-700"
                    }
                  `}
                >
                  {category}
                </button>
              ))}
            </div>
          </AnimatedSection>

          {/* Gallery Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSites.map((site, i) => (
              <AnimatedSection key={site.name} delay={i * 80} direction="up">
                <Card hover className="overflow-hidden p-0 group">
                  {/* Placeholder Screenshot */}
                  <div
                    className={`
                      relative aspect-[4/3] bg-gradient-to-br ${site.gradient}
                      flex items-center justify-center overflow-hidden
                    `}
                  >
                    <site.icon className="h-16 w-16 text-white/30" />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-900 shadow-lg">
                        View Example
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="solid" className="text-[10px]">
                        {site.industry}
                      </Badge>
                      <span className="text-xs text-neutral-400 font-medium">
                        {site.category}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-semibold text-neutral-900 mb-1.5">
                      {site.name}
                    </h3>

                    <p className="text-sm text-neutral-500 leading-relaxed mb-4">
                      {site.description}
                    </p>

                    <a
                      href="#"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors duration-200"
                    >
                      View Example
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </Card>
              </AnimatedSection>
            ))}
          </div>

          {/* Empty state (safety net in case filtering returns nothing) */}
          {filteredSites.length === 0 && (
            <div className="text-center py-16">
              <p className="text-neutral-400 text-lg">
                No examples found for this category. Check back soon!
              </p>
            </div>
          )}
        </Container>
      </section>

      {/* ================================================================
          BOTTOM CTA
          ================================================================ */}
      <section className="relative py-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgb(245_158_11/0.15),_transparent_60%)]" />

        <Container className="relative">
          <AnimatedSection>
            <div className="text-center">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                Ready to Build Yours?
              </h2>
              <p className="mt-6 text-lg text-primary-200 max-w-xl mx-auto">
                Every example above was built by AI in minutes. Tell us about
                your business and get a professional website — completely free.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/interview">
                  <Button
                    size="xl"
                    className="bg-white text-primary-700 hover:bg-primary-50 hover:text-primary-800 shadow-xl hover:shadow-2xl group"
                    arrow
                  >
                    Build My Free Website
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    variant="ghost"
                    size="xl"
                    className="text-primary-100 hover:bg-white/10 hover:text-white"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>
              <p className="mt-6 text-sm text-primary-300">
                Free forever. Go live for $11.99/mo when you&apos;re ready.
              </p>
            </div>
          </AnimatedSection>
        </Container>
      </section>
    </MarketingLayout>
  );
}
