"use client";

import { useState, useMemo } from "react";
import { Search, Layout, Plus } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Badge from "@/components/ui/Badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SectionType =
  | "ALL"
  | "HERO"
  | "ABOUT"
  | "SERVICES"
  | "TESTIMONIALS"
  | "CONTACT"
  | "FAQ"
  | "GALLERY"
  | "CTA";

interface ContentTemplate {
  id: string;
  name: string;
  sectionType: SectionType;
  description: string;
  previewColors: { bg: string; accent: string; text: string };
  blocks: Record<string, unknown>[];
}

// ---------------------------------------------------------------------------
// Sample Templates (pre-built block patterns)
// ---------------------------------------------------------------------------

const TEMPLATES: ContentTemplate[] = [
  // Heroes
  {
    id: "hero-centered",
    name: "Centered Hero",
    sectionType: "HERO",
    description: "Classic centered hero with headline, subheadline, and CTA buttons.",
    previewColors: { bg: "#f8fafc", accent: "#6366f1", text: "#1e293b" },
    blocks: [{ type: "hero", variant: "centered", data: { headline: "Welcome to Our Business", subheadline: "Professional services you can trust", ctaLabel: "Get Started", ctaUrl: "/contact" } }],
  },
  {
    id: "hero-split",
    name: "Split Hero",
    sectionType: "HERO",
    description: "Left-aligned text with image on the right. Great for visual businesses.",
    previewColors: { bg: "#ffffff", accent: "#2563eb", text: "#111827" },
    blocks: [{ type: "hero", variant: "split", data: { headline: "Grow Your Business", subheadline: "We help you succeed", ctaLabel: "Learn More", imagePosition: "right" } }],
  },
  {
    id: "hero-gradient",
    name: "Gradient Hero",
    sectionType: "HERO",
    description: "Bold gradient background with white text. Eye-catching and modern.",
    previewColors: { bg: "#4f46e5", accent: "#818cf8", text: "#ffffff" },
    blocks: [{ type: "hero", variant: "gradient", data: { headline: "Transform Your Presence", subheadline: "Stand out from the competition", ctaLabel: "Start Now" } }],
  },

  // About
  {
    id: "about-story",
    name: "Our Story",
    sectionType: "ABOUT",
    description: "Company story section with founding year, mission, and team photo.",
    previewColors: { bg: "#ffffff", accent: "#059669", text: "#1e293b" },
    blocks: [{ type: "about", variant: "story", data: { title: "Our Story", content: "Founded with a passion for excellence..." } }],
  },
  {
    id: "about-stats",
    name: "About with Stats",
    sectionType: "ABOUT",
    description: "About section with key statistics — years in business, customers served, etc.",
    previewColors: { bg: "#f9fafb", accent: "#6366f1", text: "#111827" },
    blocks: [{ type: "about", variant: "stats", data: { stats: [{ label: "Years", value: "10+" }, { label: "Clients", value: "500+" }, { label: "Projects", value: "1,200+" }] } }],
  },

  // Services
  {
    id: "services-grid-3",
    name: "Services Grid (3-Column)",
    sectionType: "SERVICES",
    description: "Three-column grid with icon, title, and description for each service.",
    previewColors: { bg: "#f8fafc", accent: "#0891b2", text: "#0f172a" },
    blocks: [{ type: "services", variant: "grid-3", data: { services: [{ name: "Service 1" }, { name: "Service 2" }, { name: "Service 3" }] } }],
  },
  {
    id: "services-list",
    name: "Services List",
    sectionType: "SERVICES",
    description: "Vertical list layout with detailed descriptions and pricing.",
    previewColors: { bg: "#ffffff", accent: "#7c3aed", text: "#1e293b" },
    blocks: [{ type: "services", variant: "list", data: { services: [{ name: "Service A", price: "$99" }, { name: "Service B", price: "$149" }] } }],
  },

  // Testimonials
  {
    id: "testimonials-carousel",
    name: "Testimonial Carousel",
    sectionType: "TESTIMONIALS",
    description: "Rotating testimonial cards with customer photos and star ratings.",
    previewColors: { bg: "#f9fafb", accent: "#f59e0b", text: "#111827" },
    blocks: [{ type: "testimonials", variant: "carousel", data: { testimonials: [{ quote: "Amazing service!", author: "John D.", rating: 5 }] } }],
  },
  {
    id: "testimonials-grid",
    name: "Testimonials Grid",
    sectionType: "TESTIMONIALS",
    description: "Grid of testimonial cards with quotes and customer details.",
    previewColors: { bg: "#ffffff", accent: "#6366f1", text: "#1e293b" },
    blocks: [{ type: "testimonials", variant: "grid", data: { testimonials: [{ quote: "Highly recommend!", author: "Sarah K." }] } }],
  },

  // Contact
  {
    id: "contact-form",
    name: "Contact Form",
    sectionType: "CONTACT",
    description: "Standard contact form with name, email, phone, and message fields.",
    previewColors: { bg: "#ffffff", accent: "#2563eb", text: "#111827" },
    blocks: [{ type: "contact", variant: "form", data: { fields: ["name", "email", "phone", "message"] } }],
  },
  {
    id: "contact-split",
    name: "Contact Split Layout",
    sectionType: "CONTACT",
    description: "Contact form on the left, business info and map on the right.",
    previewColors: { bg: "#f8fafc", accent: "#059669", text: "#0f172a" },
    blocks: [{ type: "contact", variant: "split", data: { showMap: true, showHours: true } }],
  },

  // FAQ
  {
    id: "faq-accordion",
    name: "FAQ Accordion",
    sectionType: "FAQ",
    description: "Expandable accordion-style FAQ section with smooth animations.",
    previewColors: { bg: "#ffffff", accent: "#6366f1", text: "#1e293b" },
    blocks: [{ type: "faq", variant: "accordion", data: { faqs: [{ q: "How does it work?", a: "It's simple..." }] } }],
  },

  // Gallery
  {
    id: "gallery-masonry",
    name: "Masonry Gallery",
    sectionType: "GALLERY",
    description: "Pinterest-style masonry layout for showcasing work and portfolio.",
    previewColors: { bg: "#f9fafb", accent: "#0891b2", text: "#111827" },
    blocks: [{ type: "gallery", variant: "masonry", data: { columns: 3 } }],
  },
  {
    id: "gallery-grid",
    name: "Grid Gallery",
    sectionType: "GALLERY",
    description: "Even grid of images with lightbox preview on click.",
    previewColors: { bg: "#ffffff", accent: "#7c3aed", text: "#0f172a" },
    blocks: [{ type: "gallery", variant: "grid", data: { columns: 4 } }],
  },

  // CTA
  {
    id: "cta-banner",
    name: "CTA Banner",
    sectionType: "CTA",
    description: "Full-width call-to-action banner with gradient background.",
    previewColors: { bg: "#4f46e5", accent: "#a5b4fc", text: "#ffffff" },
    blocks: [{ type: "cta", variant: "banner", data: { headline: "Ready to Get Started?", ctaLabel: "Contact Us" } }],
  },
  {
    id: "cta-card",
    name: "CTA Card",
    sectionType: "CTA",
    description: "Compact card-style CTA with headline, supporting text, and button.",
    previewColors: { bg: "#f8fafc", accent: "#2563eb", text: "#1e293b" },
    blocks: [{ type: "cta", variant: "card", data: { headline: "Don't Wait", ctaLabel: "Get Started" } }],
  },
];

const SECTION_TABS: { label: string; value: SectionType }[] = [
  { label: "All", value: "ALL" },
  { label: "Hero", value: "HERO" },
  { label: "About", value: "ABOUT" },
  { label: "Services", value: "SERVICES" },
  { label: "Testimonials", value: "TESTIMONIALS" },
  { label: "Contact", value: "CONTACT" },
  { label: "FAQ", value: "FAQ" },
  { label: "Gallery", value: "GALLERY" },
  { label: "CTA", value: "CTA" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MarketplaceTemplatesClient() {
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState<SectionType>("ALL");

  const filtered = useMemo(() => {
    let list = [...TEMPLATES];

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(s) ||
          t.description.toLowerCase().includes(s)
      );
    }

    if (sectionFilter !== "ALL") {
      list = list.filter((t) => t.sectionType === sectionFilter);
    }

    return list;
  }, [search, sectionFilter]);

  return (
    <>
      {/* Search & Filters */}
      <div className="mb-8 space-y-4">
        {/* Search bar */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-surface-border bg-white text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow shadow-sm"
          />
        </div>

        {/* Section type tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-neutral-100 max-w-fit mx-auto">
          {SECTION_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSectionFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sectionFilter === tab.value
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <p className="text-sm text-neutral-500 mb-6">
        {filtered.length} template{filtered.length !== 1 ? "s" : ""} found
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-neutral-400 text-lg">
            No templates match your search.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSectionFilter("ALL");
            }}
            className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template, i) => (
            <AnimatedSection key={template.id} delay={i * 50} direction="scale">
              <TemplateCard template={template} />
            </AnimatedSection>
          ))}
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Template Card
// ---------------------------------------------------------------------------

function TemplateCard({ template }: { template: ContentTemplate }) {
  const { bg, accent, text } = template.previewColors;
  const [added, setAdded] = useState(false);

  return (
    <div className="group rounded-2xl bg-white border border-surface-border shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Mini preview */}
      <div
        className="relative h-36 flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: bg }}
      >
        {/* Abstract preview showing the section type */}
        <div className="text-center px-4">
          <div
            className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center"
            style={{ backgroundColor: `${accent}20` }}
          >
            <Layout className="w-4 h-4" style={{ color: accent }} />
          </div>
          <p
            className="text-xs font-semibold"
            style={{ color: text }}
          >
            {template.name}
          </p>
          <div className="flex gap-1 justify-center mt-2">
            {/* Abstract content blocks */}
            <div
              className="w-16 h-1.5 rounded-full"
              style={{ backgroundColor: `${text}20` }}
            />
            <div
              className="w-10 h-1.5 rounded-full"
              style={{ backgroundColor: `${text}15` }}
            />
          </div>
          <div
            className="mt-2 inline-block px-2 py-0.5 rounded text-[8px] text-white"
            style={{ backgroundColor: accent }}
          >
            Preview
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-neutral-900">
            {template.name}
          </h3>
          <Badge variant="outline" className="shrink-0 text-[10px]">
            {template.sectionType}
          </Badge>
        </div>

        <p className="text-xs text-neutral-500 leading-relaxed">
          {template.description}
        </p>

        <button
          onClick={() => setAdded(true)}
          disabled={added}
          className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
            added
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-primary-600 text-white hover:bg-primary-500"
          }`}
        >
          {added ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Added to My Site
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              Add to My Site
            </>
          )}
        </button>
      </div>
    </div>
  );
}
