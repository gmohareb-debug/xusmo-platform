"use client";

// =============================================================================
// Pricing Page — 3 tiers: Free, Pro ($39.99), Agency ($69.99)
// Hosting ($11.99/mo) is a separate line item, not part of plan pricing
// =============================================================================

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import MarketingLayout from "@/components/layout/MarketingLayout";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import PricingTabs from "@/components/marketing/PricingTabs";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

const FAQ = [
  {
    q: "Is the website really free?",
    a: "Yes! Our AI builds your complete website at no cost — pages, content, images, and SEO. You only pay if you choose a Pro or Agency plan, or when you add hosting to go live.",
  },
  {
    q: "What does the $11.99/mo hosting include?",
    a: "Hosting is billed separately and includes your custom domain, SSL certificate, CDN for fast loading, daily backups, 24/7 uptime monitoring, and 99.9% uptime guarantee.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes! You can cancel your subscription at any time. Your site will remain active until the end of your billing period.",
  },
  {
    q: "What happens to my site if I cancel?",
    a: "Your site stays live until the end of your current billing cycle. After that, it moves to a suspended state. You can export your WordPress site at any time — you own everything.",
  },
  {
    q: "Do I get a free domain with annual billing?",
    a: "Yes! Annual billing includes a free custom domain for the first year (.com, .net, or .org).",
  },
  {
    q: "Can I upgrade or downgrade my plan?",
    a: "Absolutely. You can change your plan at any time from your portal. Changes take effect on your next billing cycle.",
  },
  {
    q: "Do I need technical skills?",
    a: "Not at all. Our AI handles everything — from writing content to configuring SEO. You just answer a few questions about your business.",
  },
  {
    q: "What's the difference between Website and E-Commerce plans?",
    a: "Website plans are for service businesses, portfolios, and informational sites. E-Commerce plans include WooCommerce with product listings, shopping cart, checkout, and payment integration. Both tracks start free.",
  },
  {
    q: "Can I switch from Website to E-Commerce later?",
    a: "Yes! You can upgrade your site to include e-commerce features at any time from your dashboard. Your existing content and pages will be preserved.",
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="bg-gradient-hero pt-16 pb-8">
        <Container width="narrow">
          <AnimatedSection>
            <div className="text-center">
              <Badge variant="outline" className="mb-6">
                Simple Pricing
              </Badge>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-tight">
                Choose Your Plan
              </h1>
              <p className="mt-4 text-lg text-neutral-500 max-w-xl mx-auto">
                Start for free. Upgrade when you&apos;re ready to grow.
              </p>
            </div>
          </AnimatedSection>
        </Container>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 bg-section-pricing">
        <Container>
          <PricingTabs />
        </Container>
      </section>

      {/* All Plans Include */}
      <section className="py-16 bg-white accent-border-top-subtle">
        <Container width="narrow">
          <AnimatedSection>
            <SectionHeading
              eyebrow="Included with Every Plan"
              title="Everything You Need"
              subtitle="No matter which plan you choose, you get a complete professional website."
            />
          </AnimatedSection>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              "AI-built website",
              "Mobile responsive",
              "SEO optimized",
              "AI images",
              "Contact forms",
              "Full WordPress CMS",
              "You own everything",
              "Export anytime",
              "No lock-in",
            ].map((item, i) => (
              <AnimatedSection key={item} delay={i * 50}>
                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <svg
                    className="h-5 w-5 shrink-0 text-primary-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {item}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-section-indigo">
        <Container width="narrow">
          <AnimatedSection>
            <SectionHeading
              eyebrow="Questions?"
              title="Frequently Asked Questions"
            />
          </AnimatedSection>

          <div className="mt-12 space-y-3">
            {FAQ.map((item, i) => (
              <AnimatedSection key={item.q} delay={i * 60}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left rounded-xl bg-white border border-surface-border p-5 shadow-card hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-display font-semibold text-neutral-900">
                      {item.q}
                    </h3>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-300 ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  <div
                    className={`grid transition-all duration-300 ${
                      openFaq === i
                        ? "grid-rows-[1fr] opacity-100 mt-3"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-sm text-neutral-500 leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </button>
              </AnimatedSection>
            ))}
          </div>
        </Container>
      </section>

      {/* Bottom CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgb(245_158_11/0.15),_transparent_60%)]" />

        <Container className="relative">
          <AnimatedSection>
            <div className="text-center">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                Ready to Get Started?
              </h2>
              <p className="mt-6 text-lg text-primary-200 max-w-xl mx-auto">
                Build your free website or store in minutes. No credit card required.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/interview?track=website">
                  <Button
                    size="xl"
                    className="bg-white text-primary-700 hover:bg-primary-50 hover:text-primary-800 shadow-xl hover:shadow-2xl group"
                    arrow
                  >
                    Build My Website
                  </Button>
                </Link>
                <Link href="/interview?track=ecommerce">
                  <Button
                    size="xl"
                    className="bg-white/10 text-white border border-white/30 hover:bg-white/20 shadow-xl group"
                    arrow
                  >
                    Build My Store
                  </Button>
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </Container>
      </section>
    </MarketingLayout>
  );
}
