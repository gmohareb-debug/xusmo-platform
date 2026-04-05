"use client";

// =============================================================================
// Pricing Tabs — Tabbed pricing for Website / E-Commerce tracks
// =============================================================================

import { useState } from "react";
import PricingCard from "@/components/ui/PricingCard";
import AnimatedSection from "@/components/ui/AnimatedSection";

const WEBSITE_PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Build your full AI website — no credit card needed.",
    features: [
      "Full AI-built website",
      "Up to 5 pages",
      "AI content & images",
      "SEO setup",
      "Mobile responsive design",
      "Custom domain connection",
    ],
    cta: "Start Free",
    ctaHref: "/interview?track=website",
  },
  {
    name: "Pro",
    price: "$39.99",
    period: "/mo",
    description: "Everything you need to grow your online presence.",
    features: [
      "Everything in Free",
      "Up to 25 pages",
      "Priority support",
      "Monthly SEO reports",
      "AI blog posts (4/mo)",
      "Advanced contact forms",
    ],
    cta: "Start Pro",
    ctaHref: "/interview?track=website",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Agency",
    price: "$89.99",
    period: "/mo",
    description: "For agencies and multi-site businesses.",
    features: [
      "Everything in Pro",
      "Unlimited pages",
      "White-label (no branding)",
      "Multiple sites",
      "API access",
      "Dedicated support",
    ],
    cta: "Contact Us",
    ctaHref: "/contact",
  },
];

const ECOMMERCE_PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Launch your online store — no credit card needed.",
    features: [
      "Full AI-built store",
      "Up to 10 products",
      "WooCommerce setup",
      "Payment gateway",
      "Mobile responsive design",
      "Custom domain connection",
    ],
    cta: "Start Free",
    ctaHref: "/interview?track=ecommerce",
  },
  {
    name: "Pro",
    price: "$59.99",
    period: "/mo",
    description: "Grow your store with more products and features.",
    features: [
      "Everything in Free",
      "Up to 200 products",
      "Priority support",
      "Inventory management",
      "Order notifications",
      "Advanced analytics",
    ],
    cta: "Start Pro",
    ctaHref: "/interview?track=ecommerce",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Agency",
    price: "$89.99",
    period: "/mo",
    description: "Unlimited products and premium support.",
    features: [
      "Everything in Pro",
      "Unlimited products",
      "White-label (no branding)",
      "Multiple stores",
      "API access",
      "Dedicated support",
    ],
    cta: "Contact Us",
    ctaHref: "/contact",
  },
];

export default function PricingTabs() {
  const [activeTrack, setActiveTrack] = useState<"website" | "ecommerce">("website");
  const plans = activeTrack === "ecommerce" ? ECOMMERCE_PLANS : WEBSITE_PLANS;

  return (
    <>
      {/* Tab toggle */}
      <div className="flex justify-center mb-10">
        <div
          className="inline-flex rounded-full p-1"
          style={{ backgroundColor: "#F1F5F9" }}
        >
          <button
            onClick={() => setActiveTrack("website")}
            className="rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200"
            style={
              activeTrack === "website"
                ? { backgroundColor: "#fff", color: "#1E293B", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                : { backgroundColor: "transparent", color: "#64748B" }
            }
          >
            Website
          </button>
          <button
            onClick={() => setActiveTrack("ecommerce")}
            className="rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200"
            style={
              activeTrack === "ecommerce"
                ? { backgroundColor: "#fff", color: "#1E293B", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                : { backgroundColor: "transparent", color: "#64748B" }
            }
          >
            E-Commerce
          </button>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div key={`${activeTrack}-${plan.name}`}>
            <PricingCard {...plan} />
          </div>
        ))}
      </div>

      <AnimatedSection delay={400}>
        <div className="mt-12 text-center">
          <p className="text-sm text-neutral-500">
            All plans include:{" "}
            <span className="text-neutral-700">
              Free AI-built {activeTrack === "ecommerce" ? "store" : "website"} &middot; Mobile responsive &middot; Full
              WordPress CMS &middot; SSL security
            </span>
          </p>
          <p className="mt-4 text-xs text-neutral-400">
            * Hosting is billed separately at $11.99/mo to publish your site with a custom domain, SSL, CDN, and daily backups.
          </p>
        </div>
      </AnimatedSection>
    </>
  );
}
