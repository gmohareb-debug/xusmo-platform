// =============================================================================
// Xusmo Landing Page — Complete Marketing Site (Enriched)
// =============================================================================

import Link from "next/link";
import MarketingLayout from "@/components/layout/MarketingLayout";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import GradientText from "@/components/ui/GradientText";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import AnimatedSection from "@/components/ui/AnimatedSection";
import FeatureCard from "@/components/ui/FeatureCard";
import TestimonialCard from "@/components/ui/TestimonialCard";

import HeroVisual from "@/components/marketing/HeroVisual";
import PricingTabs from "@/components/marketing/PricingTabs";
import {
  MessageSquare,
  Zap,
  Rocket,
  Brain,
  Smartphone,
  Search,
  Globe,
  Image,
  ShieldCheck,
  Gauge,
  Download,
  Lock,
  ShoppingCart,
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Star,
  Wrench,
  UtensilsCrossed,
  Camera,
  Scale,
  Dumbbell,
  Store,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const HERO_FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Content",
    description:
      "Professional copy written by AI, tailored to your industry and audience.",
    gradient: "from-primary-500 to-primary-700",
    bgGradient: "bg-gradient-to-br from-primary-50 to-primary-100",
    iconBg: "bg-gradient-to-br from-primary-500 to-primary-700",
  },
  {
    icon: Gauge,
    title: "Lightning Fast",
    description:
      "Optimized hosting with CDN. Your site loads in under 2 seconds.",
    gradient: "from-accent-400 to-accent-600",
    bgGradient: "bg-gradient-to-br from-accent-50 to-accent-100",
    iconBg: "bg-gradient-to-br from-accent-400 to-accent-600",
  },
  {
    icon: Search,
    title: "SEO Optimized",
    description:
      "Built-in SEO so customers find you on Google from day one.",
    gradient: "from-coral-400 to-coral-600",
    bgGradient: "bg-gradient-to-br from-pink-50 to-rose-100",
    iconBg: "bg-gradient-to-br from-coral-400 to-coral-600",
  },
];

const REMAINING_FEATURES = [
  {
    icon: Smartphone,
    title: "Mobile Responsive",
    description:
      "Every site looks perfect on phone, tablet, and desktop. Guaranteed.",
  },
  {
    icon: Globe,
    title: "Real WordPress",
    description:
      "Full WordPress CMS. Edit anything, add plugins, total control.",
  },
  {
    icon: Download,
    title: "You Own Everything",
    description:
      "Export anytime. No lock-in. Your site, your data, your choice.",
  },
  {
    icon: Globe,
    title: "Custom Domain",
    description: "Connect your own domain or buy one through us at cost.",
  },
  {
    icon: Image,
    title: "AI Images",
    description: "Professional AI-generated images matched to your brand.",
  },
  {
    icon: ShieldCheck,
    title: "Daily Backups",
    description:
      "Automatic daily backups. One-click restore if anything goes wrong.",
  },
  {
    icon: Lock,
    title: "SSL Included",
    description: "Free SSL certificate. Every site is secure by default.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "I got a professional website for my plumbing business in 20 minutes. I couldn't believe it was free.",
    name: "Mike Rodriguez",
    business: "Mike's Plumbing",
    industry: "Plumbing",
  },
  {
    quote:
      "The AI understood exactly what my restaurant needed. Menu, gallery, reservations — all done beautifully.",
    name: "Sarah Leclerc",
    business: "Bistro Nova",
    industry: "Restaurant",
  },
  {
    quote:
      "I've been quoted $3,000-$5,000 for a website. Xusmo built mine for free and it looks just as good.",
    name: "James Kim",
    business: "JK Photography",
    industry: "Photography",
  },
  {
    quote:
      "Setup was so easy even I could do it. The AI asked the right questions and nailed our brand voice.",
    name: "Rachel Torres",
    business: "Shine Cleaning Co.",
    industry: "Cleaning",
  },
  {
    quote:
      "Our law firm's website looks like a premium agency built it. Clients are impressed every time.",
    name: "David Chen",
    business: "Chen & Associates",
    industry: "Legal",
  },
  {
    quote:
      "The monthly hosting at $11.99 is a steal. My old hosting was $30/mo and way worse.",
    name: "Lisa Patel",
    business: "Lotus Yoga Studio",
    industry: "Fitness",
  },
];

const INDUSTRIES = [
  {
    key: "plumbing",
    label: "Plumbing",
    icon: Wrench,
    color: "text-primary-600",
    bgColor: "bg-primary-50",
    activeBg: "bg-primary-600",
    site: "mikeys-plumbing.com",
    headline: "Toronto's Most Trusted Plumbing Service",
    subline: "24/7 emergency service. Licensed & insured.",
    pages: ["Home", "Services", "About", "Reviews", "Contact"],
  },
  {
    key: "restaurant",
    label: "Restaurant",
    icon: UtensilsCrossed,
    color: "text-coral-500",
    bgColor: "bg-pink-50",
    activeBg: "bg-coral-500",
    site: "bistro-nova.com",
    headline: "Fine Dining in the Heart of Downtown",
    subline: "Farm-to-table seasonal menu. Reserve your table.",
    pages: ["Home", "Menu", "Gallery", "Reservations", "Contact"],
  },
  {
    key: "photography",
    label: "Photography",
    icon: Camera,
    color: "text-accent-600",
    bgColor: "bg-accent-50",
    activeBg: "bg-accent-500",
    site: "jk-photography.com",
    headline: "Capturing Life's Beautiful Moments",
    subline: "Weddings, portraits, and commercial photography.",
    pages: ["Home", "Portfolio", "Packages", "About", "Book Now"],
  },
  {
    key: "law",
    label: "Law",
    icon: Scale,
    color: "text-primary-700",
    bgColor: "bg-primary-50",
    activeBg: "bg-primary-700",
    site: "chen-associates.com",
    headline: "Experienced Legal Counsel You Can Trust",
    subline: "Corporate law, litigation, and family law.",
    pages: ["Home", "Practice Areas", "Attorneys", "Cases", "Contact"],
  },
  {
    key: "fitness",
    label: "Fitness",
    icon: Dumbbell,
    color: "text-green-600",
    bgColor: "bg-green-50",
    activeBg: "bg-green-600",
    site: "lotus-yoga.com",
    headline: "Find Your Balance, Transform Your Life",
    subline: "Yoga, pilates, and meditation classes.",
    pages: ["Home", "Classes", "Schedule", "Instructors", "Join"],
  },
  {
    key: "retail",
    label: "Retail",
    icon: Store,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    activeBg: "bg-purple-600",
    site: "urban-threads.com",
    headline: "Curated Fashion for the Modern You",
    subline: "Shop the latest trends. Free shipping over $50.",
    pages: ["Home", "Shop", "New Arrivals", "Sale", "About"],
  },
];

const TICKER_ITEMS = [
  "Plumbing",
  "Restaurant",
  "Photography",
  "Law Firm",
  "Fitness Studio",
  "E-Commerce",
  "Retail",
  "Dental",
  "Real Estate",
  "Consulting",
  "Salon & Spa",
  "Construction",
  "Accounting",
  "Landscaping",
  "Tutoring",
  "Pet Services",
  "Bakery",
  "Auto Repair",
  "Insurance",
  "Marketing Agency",
];

const STATS = [
  { value: "500+", label: "Sites Created", icon: Globe },
  { value: "10,000+", label: "Pages Generated", icon: BarChart3 },
  { value: "2s", label: "Average Load Time", icon: Clock },
  { value: "98%", label: "Customer Satisfaction", icon: TrendingUp },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LandingPage() {
  return (
    <MarketingLayout>
      {/* ================================================================
          HERO SECTION
          ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-hero pb-20 pt-12 sm:pt-20">
        <Container>
          <div className="text-center">
            <AnimatedSection delay={0}>
              <Badge variant="gradient" className="mb-6">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered Website Builder
              </Badge>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 leading-tight">
                Build Your Business Online
                <br />
                <GradientText from="from-primary-600" to="to-purple-500">
                  Free, in Minutes
                </GradientText>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-neutral-500 leading-relaxed">
                Tell our AI about your business. Get a professional WordPress
                website or e-commerce store — completely free.
              </p>
            </AnimatedSection>

            {/* Two-track hero cards */}
            <AnimatedSection delay={300}>
              <div className="mt-10 grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {/* Website Card */}
                <Link
                  href="/interview?track=website"
                  className="group relative rounded-2xl border-2 border-surface-border bg-white p-6 text-left transition-all duration-200 hover:border-primary-400 hover:shadow-xl hover:shadow-primary-100"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-200">
                    <Globe className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-neutral-900 mb-1">
                    Business Website
                  </h3>
                  <ul className="space-y-1 text-sm text-neutral-500 mb-4">
                    <li className="flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      5 pages free
                    </li>
                    <li className="flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Services, portfolio, SEO
                    </li>
                    <li className="flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Lead generation ready
                    </li>
                  </ul>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 group-hover:text-primary-700">
                    Build My Website
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </span>
                  <span className="absolute top-3 right-3 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
                    Free
                  </span>
                </Link>

                {/* E-Commerce Card */}
                <Link
                  href="/interview?track=ecommerce"
                  className="group relative rounded-2xl border-2 border-surface-border bg-white p-6 text-left transition-all duration-200 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-100"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-200">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-neutral-900 mb-1">
                    E-Commerce Store
                  </h3>
                  <ul className="space-y-1 text-sm text-neutral-500 mb-4">
                    <li className="flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 text-purple-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      10 products free
                    </li>
                    <li className="flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 text-purple-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Shop, cart, checkout
                    </li>
                    <li className="flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 text-purple-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Payment integration
                    </li>
                  </ul>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 group-hover:text-purple-700">
                    Build My Store
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </span>
                  <span className="absolute top-3 right-3 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
                    Free
                  </span>
                </Link>
              </div>
            </AnimatedSection>

            {/* Floating Glassmorphism Stat Cards */}
            <AnimatedSection delay={350}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <div className="glass-stat rounded-full px-4 py-2 flex items-center gap-2 animate-float" style={{ animationDelay: "0s" }}>
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse-dot" />
                  <span className="text-xs font-semibold text-neutral-700">500+ Sites Built</span>
                </div>
                <div className="glass-stat rounded-full px-4 py-2 flex items-center gap-2 animate-float" style={{ animationDelay: "0.5s" }}>
                  <Gauge className="h-3.5 w-3.5 text-accent-500" />
                  <span className="text-xs font-semibold text-neutral-700">2s Load Time</span>
                </div>
                <div className="glass-stat rounded-full px-4 py-2 flex items-center gap-2 animate-float" style={{ animationDelay: "1s" }}>
                  <ShieldCheck className="h-3.5 w-3.5 text-primary-500" />
                  <span className="text-xs font-semibold text-neutral-700">98% Uptime</span>
                </div>
                <div className="glass-stat rounded-full px-4 py-2 flex items-center gap-2 animate-float" style={{ animationDelay: "1.5s" }}>
                  <Star className="h-3.5 w-3.5 text-accent-400 fill-accent-400" />
                  <span className="text-xs font-semibold text-neutral-700">Free Forever</span>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={400}>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Full WordPress site
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  You own everything
                </span>
              </div>
            </AnimatedSection>
          </div>

          {/* Hero Visual */}
          <AnimatedSection delay={500} direction="scale">
            <div className="mt-16">
              <HeroVisual />
            </div>
          </AnimatedSection>
        </Container>
      </section>

      {/* ================================================================
          TRUSTED BY / LOGO TICKER
          ================================================================ */}
      <section className="py-12 bg-white border-b border-surface-border overflow-hidden">
        <Container>
          <AnimatedSection>
            <p className="text-center text-sm font-semibold text-neutral-400 uppercase tracking-widest mb-6">
              Trusted by <span className="text-primary-600">500+</span> businesses across{" "}
              <span className="text-accent-600">20+</span> industries
            </p>
          </AnimatedSection>
        </Container>
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          {/* Ticker */}
          <div className="ticker-track">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span
                key={`${item}-${i}`}
                className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface-cream px-4 py-2 text-sm font-medium text-neutral-600 mx-2 whitespace-nowrap hover:border-primary-300 hover:text-primary-600 transition-colors"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary-400" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          HOW IT WORKS — Timeline / Connected Steps
          ================================================================ */}
      <section id="how-it-works" className="py-24 bg-white">
        <Container>
          <AnimatedSection>
            <SectionHeading
              eyebrow="Simple Process"
              title="Three Steps to Your Website"
              subtitle="No technical knowledge required. Our AI handles everything."
            />
          </AnimatedSection>

          {/* Desktop: horizontal connected steps | Mobile: vertical timeline */}
          <div className="mt-16 relative">
            {/* Desktop connecting line */}
            <div className="hidden md:block absolute top-[60px] left-[16.67%] right-[16.67%] h-[3px]">
              <div className="w-full h-full bg-gradient-to-r from-primary-400 via-accent-400 to-coral-400 rounded-full" />
            </div>
            {/* Mobile connecting line */}
            <div className="md:hidden absolute top-0 bottom-0 left-[28px] w-[3px]">
              <div className="w-full h-full bg-gradient-to-b from-primary-400 via-accent-400 to-coral-400 rounded-full" />
            </div>

            <div className="grid gap-12 md:grid-cols-3 md:gap-8">
              {[
                {
                  num: "01",
                  icon: MessageSquare,
                  title: "Tell Us About Your Business",
                  desc: "Answer a few quick questions. Our AI understands your industry and knows exactly what your site needs.",
                  color: "primary",
                  numBg: "bg-gradient-to-br from-primary-500 to-primary-700",
                  iconBg: "bg-primary-50",
                  iconColor: "text-primary-600",
                },
                {
                  num: "02",
                  icon: Zap,
                  title: "AI Builds Your Site",
                  desc: "In minutes, our AI creates a complete WordPress website — pages, content, images, SEO — all tailored to you.",
                  color: "accent",
                  numBg: "bg-gradient-to-br from-accent-400 to-accent-600",
                  iconBg: "bg-accent-50",
                  iconColor: "text-accent-600",
                },
                {
                  num: "03",
                  icon: Rocket,
                  title: "Go Live",
                  desc: "Preview your site, request changes, and publish. Your website is free — go live with hosting for $11.99/mo.",
                  color: "coral",
                  numBg: "bg-gradient-to-br from-coral-400 to-coral-600",
                  iconBg: "bg-pink-50",
                  iconColor: "text-coral-500",
                },
              ].map((step, i) => (
                <AnimatedSection key={step.num} delay={i * 200}>
                  <div className="relative flex md:flex-col items-start md:items-center md:text-center gap-6 md:gap-0">
                    {/* Step Number Circle */}
                    <div className={`relative z-10 flex-shrink-0 h-14 w-14 rounded-2xl ${step.numBg} flex items-center justify-center shadow-lg`}>
                      <span className="font-display text-lg font-bold text-white">
                        {step.num}
                      </span>
                    </div>
                    <div className="flex-1 md:mt-6">
                      {/* Icon */}
                      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${step.iconBg} ${step.iconColor}`}>
                        <step.icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-display text-xl font-semibold text-neutral-900 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-neutral-500 leading-relaxed max-w-sm mx-auto">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ================================================================
          BEFORE / AFTER SHOWCASE — Dark Background
          ================================================================ */}
      <section className="relative py-24 bg-section-dark overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid pointer-events-none" />
        <Container className="relative">
          <AnimatedSection>
            <div className="text-center mb-16">
              <Badge variant="pulse" className="mb-4 bg-accent-500/20 text-accent-300">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered Transformation
              </Badge>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                From Blank Page to{" "}
                <GradientText from="from-accent-300" to="to-coral-400">
                  Professional Site
                </GradientText>
              </h2>
              <p className="mt-4 text-lg text-neutral-400 max-w-2xl mx-auto">
                See what our AI creates in minutes — no templates, no drag-and-drop, just tell it about your business.
              </p>
            </div>
          </AnimatedSection>

          <div className="before-after-split grid md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto items-stretch">
            {/* BEFORE — Boring Generic */}
            <AnimatedSection delay={100} direction="left">
              <div className="relative h-full">
                <div className="absolute -top-3 left-4 z-10">
                  <span className="rounded-full bg-neutral-700 px-3 py-1 text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                    Before
                  </span>
                </div>
                <div className="rounded-2xl border border-surface-border-dark bg-surface-card overflow-hidden h-full opacity-60">
                  {/* Fake boring browser */}
                  <div className="flex items-center gap-2 border-b border-surface-border-dark px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-neutral-600" />
                      <div className="h-2.5 w-2.5 rounded-full bg-neutral-600" />
                      <div className="h-2.5 w-2.5 rounded-full bg-neutral-600" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="rounded bg-surface-card-hover px-3 py-0.5 text-[10px] text-neutral-500">
                        generic-template.com
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {/* Boring gray blocks */}
                    <div className="h-4 w-24 rounded bg-neutral-700" />
                    <div className="h-8 w-3/4 rounded bg-neutral-700/60" />
                    <div className="h-3 w-full rounded bg-neutral-800" />
                    <div className="h-3 w-5/6 rounded bg-neutral-800" />
                    <div className="h-3 w-2/3 rounded bg-neutral-800" />
                    <div className="mt-6 grid grid-cols-3 gap-3">
                      <div className="h-16 rounded bg-neutral-700/40" />
                      <div className="h-16 rounded bg-neutral-700/40" />
                      <div className="h-16 rounded bg-neutral-700/40" />
                    </div>
                    <div className="h-8 w-28 rounded bg-neutral-600 mt-4" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-neutral-500 text-center">
                  Generic template. No personality. No SEO. No results.
                </p>
              </div>
            </AnimatedSection>

            {/* AFTER — AI-Built */}
            <AnimatedSection delay={300} direction="right">
              <div className="relative h-full">
                <div className="absolute -top-3 left-4 z-10">
                  <span className="rounded-full bg-gradient-to-r from-accent-400 to-coral-400 px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
                    After — AI Built
                  </span>
                </div>
                <div className="rounded-2xl border border-accent-400/30 bg-surface-card overflow-hidden h-full shadow-xl shadow-accent-400/10">
                  {/* Colorful browser */}
                  <div className="flex items-center gap-2 border-b border-surface-border-dark px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="rounded bg-surface-card-hover px-3 py-0.5 text-[10px] text-accent-400 font-medium">
                        mikeys-plumbing.com
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {/* Colorful, professional blocks */}
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-28 rounded bg-primary-500" />
                      <div className="flex gap-2">
                        <div className="h-3 w-10 rounded bg-neutral-600" />
                        <div className="h-3 w-10 rounded bg-neutral-600" />
                        <div className="h-5 w-16 rounded bg-accent-500" />
                      </div>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-primary-600/40 to-primary-800/40 p-4">
                      <div className="h-3 w-16 rounded-full bg-primary-400/60 mb-2" />
                      <div className="h-5 w-3/4 rounded bg-white/80 mb-2" />
                      <div className="h-3 w-5/6 rounded bg-white/40 mb-3" />
                      <div className="flex gap-2">
                        <div className="h-6 w-20 rounded bg-accent-400" />
                        <div className="h-6 w-16 rounded bg-white/20 border border-white/30" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {["bg-primary-500/30", "bg-accent-400/30", "bg-coral-400/30"].map((bg, i) => (
                        <div key={i} className={`h-14 rounded-lg ${bg} flex items-center justify-center`}>
                          <div className="h-2 w-8 rounded bg-white/50" />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-1">
                        {[0,1,2,3,4].map(j => (
                          <div key={j} className="h-3 w-3 rounded-full bg-accent-400" style={{ opacity: 1 }}>
                            <Star className="h-3 w-3 text-accent-700 fill-accent-400" />
                          </div>
                        ))}
                      </div>
                      <div className="h-2.5 w-20 rounded bg-neutral-600" />
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-accent-300 text-center font-medium">
                  Custom AI design. SEO-ready. Converting visitors into customers.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </Container>
      </section>

      {/* ================================================================
          FEATURES — Split: Hero 3 + Remaining Grid
          ================================================================ */}
      <section className="py-24 bg-section-indigo">
        <Container>
          <AnimatedSection>
            <SectionHeading
              eyebrow="Everything Included"
              title="Built for Business Owners"
              subtitle="Every site comes loaded with professional features. No upsells, no surprises."
            />
          </AnimatedSection>

          {/* Top 3 Hero Features — Large Cards */}
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {HERO_FEATURES.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 150}>
                <div className="group relative rounded-2xl bg-white border border-surface-border p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover overflow-hidden">
                  {/* Gradient border on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: "linear-gradient(135deg, transparent, transparent)",
                      boxShadow: i === 0
                        ? "inset 0 0 0 2px rgb(99 102 241 / 0.3)"
                        : i === 1
                          ? "inset 0 0 0 2px rgb(245 158 11 / 0.3)"
                          : "inset 0 0 0 2px rgb(244 63 94 / 0.3)",
                    }}
                  />
                  <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${f.iconBg} text-white shadow-lg`}>
                    <f.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-neutral-900 mb-3">
                    {f.title}
                  </h3>
                  <p className="text-neutral-500 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Remaining Features — Compact Grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
            {REMAINING_FEATURES.map((f, i) => (
              <AnimatedSection key={f.title} delay={450 + i * 80}>
                <FeatureCard
                  icon={f.icon}
                  title={f.title}
                  description={f.description}
                />
              </AnimatedSection>
            ))}
          </div>
        </Container>
      </section>

      {/* ================================================================
          LIVE STATS — Dark Section with Animated Counters
          ================================================================ */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-surface-midnight to-primary-950" />
        <div className="absolute inset-0 bg-dot-grid pointer-events-none" />
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-accent-400/10 rounded-full blur-3xl" />

        <Container className="relative">
          <AnimatedSection>
            <div className="text-center mb-12">
              <p className="text-sm font-semibold tracking-widest uppercase text-primary-300 mb-3">
                Growing Every Day
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white text-glow">
                Numbers That Speak
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {STATS.map((stat, i) => (
              <AnimatedSection key={stat.label} delay={i * 150}>
                <div className="text-center group">
                  <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl glass text-primary-300 group-hover:text-accent-400 transition-colors duration-300">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 animate-count-up text-glow">
                    {stat.value}
                  </div>
                  <p className="text-sm text-neutral-400 font-medium">
                    {stat.label}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </Container>
      </section>

      {/* ================================================================
          INDUSTRIES — Tabbed Showcase (Static for Server Component)
          ================================================================ */}
      <section id="industries" className="py-24 bg-section-amber">
        <Container>
          <AnimatedSection>
            <SectionHeading
              eyebrow="Universal AI"
              title="Built for Any Business"
              subtitle="Whatever you do, our AI adapts. Tell it about your business and get a website tailored to you."
            />
          </AnimatedSection>

          {/* Industry Tabs — Show all as a showcase grid */}
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {INDUSTRIES.map((ind, i) => (
              <AnimatedSection key={ind.key} delay={i * 100}>
                <div className="group rounded-2xl bg-white border border-surface-border p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:border-accent-300">
                  {/* Industry Icon & Label */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${ind.bgColor} ${ind.color} group-hover:text-white transition-colors duration-300`}
                      style={{
                        backgroundColor: undefined,
                      }}
                    >
                      <ind.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-neutral-900">
                        {ind.label}
                      </h3>
                      <p className="text-[11px] text-neutral-400">{ind.site}</p>
                    </div>
                  </div>
                  {/* Mini browser mockup */}
                  <div className="rounded-lg border border-surface-border overflow-hidden mb-4">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-muted border-b border-surface-border">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-300" />
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                      <div className="h-1.5 w-1.5 rounded-full bg-green-300" />
                      <span className="ml-2 text-[8px] text-neutral-400">{ind.site}</span>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-surface-cream to-white">
                      <p className="font-display text-[11px] font-bold text-neutral-800 mb-1 leading-tight">
                        {ind.headline}
                      </p>
                      <p className="text-[9px] text-neutral-400 mb-2">{ind.subline}</p>
                      <div className="flex gap-1">
                        <div className={`h-4 w-12 rounded text-[7px] font-semibold text-white flex items-center justify-center ${ind.activeBg}`}>
                          Contact
                        </div>
                        <div className="h-4 w-10 rounded border border-neutral-200 text-[7px] text-neutral-500 flex items-center justify-center">
                          Learn
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Pages */}
                  <div className="flex flex-wrap gap-1.5">
                    {ind.pages.map((page) => (
                      <span
                        key={page}
                        className="rounded-full bg-surface-cream px-2 py-0.5 text-[10px] font-medium text-neutral-500"
                      >
                        {page}
                      </span>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </Container>
      </section>

      {/* ================================================================
          PRICING
          ================================================================ */}
      <section id="pricing" className="py-24 bg-section-pricing accent-border-top">
        <Container>
          <AnimatedSection>
            <SectionHeading
              eyebrow="Simple Pricing"
              title="Choose Your Plan"
              subtitle="Start for free. Upgrade when you're ready to grow."
            />
          </AnimatedSection>

          <div className="mt-16">
            <PricingTabs />
          </div>
        </Container>
      </section>

      {/* ================================================================
          TESTIMONIALS — Visual Variety
          ================================================================ */}
      <section className="py-24 bg-section-testimonials">
        <Container>
          <AnimatedSection>
            <SectionHeading
              eyebrow="Happy Businesses"
              title="What Our Customers Say"
              subtitle="Real businesses, real websites, real results."
            />
          </AnimatedSection>

          <div className="mt-16">
            {/* Featured testimonial — large */}
            <AnimatedSection delay={0}>
              <div className="gradient-border mb-8 max-w-3xl mx-auto">
                <div className="rounded-2xl bg-white p-8 sm:p-10">
                  <div className="flex gap-0.5 mb-4">
                    {[0, 1, 2, 3, 4].map((j) => (
                      <Star
                        key={j}
                        className="h-5 w-5 fill-accent-400 text-accent-400"
                      />
                    ))}
                  </div>
                  <blockquote className="text-lg sm:text-xl text-neutral-700 leading-relaxed mb-6 font-medium">
                    &ldquo;{TESTIMONIALS[0].quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg">
                      {TESTIMONIALS[0].name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">
                        {TESTIMONIALS[0].name}
                      </p>
                      <p className="text-neutral-500 text-sm">
                        {TESTIMONIALS[0].business} &middot;{" "}
                        <span className="text-primary-600">{TESTIMONIALS[0].industry}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Remaining testimonials — grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {TESTIMONIALS.slice(1).map((t, i) => {
                const accentColors = [
                  "border-t-accent-400",
                  "border-t-coral-400",
                  "border-t-primary-400",
                  "border-t-green-400",
                  "border-t-purple-400",
                ];
                return (
                  <AnimatedSection key={t.name} delay={(i + 1) * 100}>
                    <TestimonialCard
                      {...t}
                      className={`border-t-2 ${accentColors[i % accentColors.length]}`}
                    />
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* ================================================================
          BOTTOM CTA — Dramatic with animated gradient
          ================================================================ */}
      <section className="relative py-28 sm:py-32 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-purple-700 to-primary-900 animate-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgb(245_158_11/0.2),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgb(244_63_94/0.15),_transparent_50%)]" />

        {/* Floating decorative elements */}
        <div className="absolute top-12 left-[10%] h-24 w-24 rounded-full bg-accent-400/10 blur-xl animate-float" />
        <div className="absolute bottom-16 right-[15%] h-20 w-20 rounded-full bg-coral-400/10 blur-xl animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-[5%] h-16 w-16 rounded-2xl bg-primary-300/10 blur-lg animate-float" style={{ animationDelay: "2.5s" }} />
        <div className="absolute top-1/3 right-[8%] h-12 w-12 rounded-xl bg-accent-300/10 blur-lg animate-float" style={{ animationDelay: "0.5s" }} />

        <Container className="relative">
          <AnimatedSection>
            <div className="text-center">
              <Badge variant="outline" className="border-white/30 text-white/90 mb-6">
                <Rocket className="h-3 w-3 mr-1" />
                Ready in Minutes
              </Badge>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight text-glow">
                Ready to Get Started?
              </h2>
              <p className="mt-6 text-lg sm:text-xl text-primary-200 max-w-xl mx-auto leading-relaxed">
                Join <span className="text-accent-300 font-semibold">500+</span> businesses who got their website or store in minutes, not months.
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
              <p className="mt-8 text-sm text-primary-300">
                Free forever. Go live for $11.99/mo when you&apos;re ready.
              </p>
              {/* Trust indicators */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-primary-300/80">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  No credit card
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Full WordPress
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  You own everything
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Cancel anytime
                </span>
              </div>
            </div>
          </AnimatedSection>
        </Container>
      </section>
    </MarketingLayout>
  );
}
