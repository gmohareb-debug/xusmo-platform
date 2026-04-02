// =============================================================================
// How It Works Page — Expanded walkthrough of the Xusmo 3-step process
// =============================================================================

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
  MessageSquare,
  Zap,
  Rocket,
  ClipboardList,
  Brain,
  Palette,
  FileText,
  Image,
  Search,
  Globe,
  ShieldCheck,
  Gauge,
  Eye,
  Pencil,
  CheckCircle2,
  ArrowRight,
  Play,
  Clock,
  CreditCard,
  HelpCircle,
  Sparkles,
  Monitor,
  Smartphone,
  Layout,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Data — Step details
// ---------------------------------------------------------------------------

const STEPS = [
  {
    num: "01",
    icon: MessageSquare,
    title: "Tell Us About Your Business",
    tagline: "A friendly conversation, not a complicated form.",
    color: "primary" as const,
    description:
      "Our AI interview feels like talking to a real designer. In about 5 minutes, you'll answer a handful of focused questions about your business. No jargon, no confusion — just a simple chat.",
    details: [
      {
        icon: ClipboardList,
        label: "Business basics",
        text: "Name, industry, location, and services. We tailor everything to your specific field.",
      },
      {
        icon: Palette,
        label: "Style preferences",
        text: "Pick the vibe you want — professional, modern, warm, bold. Or let AI decide for you.",
      },
      {
        icon: FileText,
        label: "Content details",
        text: "Share what makes your business special. Our AI turns your answers into polished website copy.",
      },
      {
        icon: Image,
        label: "Images & media",
        text: "Upload your own photos or let our AI generate professional images matched to your brand.",
      },
    ],
    stat: "~5 min",
    statLabel: "Average completion time",
  },
  {
    num: "02",
    icon: Zap,
    title: "AI Builds Your Site",
    tagline: "Sit back and watch the magic happen.",
    color: "accent" as const,
    description:
      "Once you've answered the questions, our AI gets to work. In just a few minutes, it builds a complete, multi-page WordPress website — custom-written content, professional images, SEO, and all.",
    details: [
      {
        icon: Brain,
        label: "AI-written content",
        text: "Every headline, paragraph, and call-to-action is written specifically for your business and industry.",
      },
      {
        icon: Layout,
        label: "Professional layouts",
        text: "Pages are structured using proven conversion patterns that turn visitors into customers.",
      },
      {
        icon: Search,
        label: "SEO from day one",
        text: "Meta titles, descriptions, heading structure, and schema markup — all configured automatically.",
      },
      {
        icon: Smartphone,
        label: "Mobile responsive",
        text: "Your site looks flawless on every device. Phone, tablet, desktop — pixel-perfect on all of them.",
      },
    ],
    stat: "~3 min",
    statLabel: "Average build time",
  },
  {
    num: "03",
    icon: Rocket,
    title: "Go Live",
    tagline: "Preview, refine, and publish to the world.",
    color: "primary" as const,
    description:
      "Your website is built and ready to preview — completely free. Look it over, request changes, and when you're happy, go live with professional hosting for just $11.99/mo.",
    details: [
      {
        icon: Eye,
        label: "Full preview",
        text: "See your complete website before paying anything. Click through every page to make sure it's perfect.",
      },
      {
        icon: Pencil,
        label: "Request changes",
        text: "Want something different? Tell us and we'll revise. You can also edit anything yourself in WordPress.",
      },
      {
        icon: Globe,
        label: "Custom domain",
        text: "Connect your own domain or register one through us. We handle all the DNS setup for you.",
      },
      {
        icon: ShieldCheck,
        label: "SSL & security",
        text: "Free SSL certificate, daily backups, CDN delivery, and 24/7 uptime monitoring included.",
      },
    ],
    stat: "$0",
    statLabel: "Cost to build your site",
  },
];

const WHAT_YOU_GET = [
  { icon: Monitor, label: "Up to 5 custom pages" },
  { icon: Brain, label: "AI-written content" },
  { icon: Image, label: "AI-generated images" },
  { icon: Search, label: "Full SEO setup" },
  { icon: Smartphone, label: "Mobile responsive" },
  { icon: Globe, label: "Real WordPress CMS" },
  { icon: ShieldCheck, label: "SSL certificate" },
  { icon: Gauge, label: "Fast CDN hosting" },
];

const FAQ = [
  {
    q: "How long does the whole process take?",
    a: "Most businesses go from zero to a finished website in under 10 minutes. The AI interview takes about 5 minutes, and the build takes another 2-3 minutes. You can preview immediately and go live whenever you're ready.",
  },
  {
    q: "Do I need any technical skills?",
    a: "None at all. If you can answer questions about your business, you can build a website. Our AI handles all the technical work — design, code, content, SEO, hosting, everything.",
  },
  {
    q: "Is the website really free?",
    a: "Yes! We build your complete website for free. You can preview every page before paying anything. When you're ready to go live with your own domain, hosting is just $11.99/mo. No hidden fees.",
  },
  {
    q: "Can I edit the website after it's built?",
    a: "Absolutely. Your site runs on real WordPress, so you have full control. Edit text, swap images, add pages, install plugins — it's your site to customize however you want.",
  },
  {
    q: "What if I don't like what the AI creates?",
    a: "You can request changes during the preview stage at no cost. Want a different color scheme, different layout, or rewritten content? Just tell us. You can also edit everything yourself in the WordPress dashboard.",
  },
  {
    q: "Do I own my website?",
    a: "100%. You own all your content, images, and data. You can export your full WordPress site at any time. No lock-in, no strings attached.",
  },
  {
    q: "What industries do you support?",
    a: "We support over 30 industries including plumbing, restaurants, law firms, photography, fitness, dental, real estate, and many more. Our AI adapts to any business type — if you don't see your industry listed, it still works.",
  },
  {
    q: "What happens after I go live?",
    a: "Your site is live on your custom domain with SSL, CDN, daily backups, and 24/7 monitoring. You can manage everything from your portal — update content, check analytics, manage your domain, and more.",
  },
];

// ---------------------------------------------------------------------------
// Step color helpers
// ---------------------------------------------------------------------------

function stepAccentClasses(color: "primary" | "accent") {
  return {
    numText: color === "primary" ? "text-primary-100" : "text-accent-200",
    iconBg:
      color === "primary"
        ? "bg-primary-50 text-primary-600"
        : "bg-accent-50 text-accent-600",
    iconBgHover:
      color === "primary"
        ? "group-hover:bg-primary-600 group-hover:text-white"
        : "group-hover:bg-accent-500 group-hover:text-white",
    detailIcon:
      color === "primary" ? "text-primary-500" : "text-accent-500",
    badge:
      color === "primary" ? "outline" : ("pulse" as "outline" | "pulse"),
    statBg:
      color === "primary"
        ? "bg-primary-50 text-primary-700 border-primary-200"
        : "bg-accent-50 text-accent-700 border-accent-200",
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HowItWorksPage() {
  return (
    <MarketingLayout>
      {/* ================================================================
          HERO SECTION
          ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-hero pb-16 pt-12 sm:pt-20">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-200/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent-200/20 blur-3xl" />
        </div>

        <Container className="relative">
          <div className="text-center">
            <AnimatedSection delay={0}>
              <Badge variant="outline" className="mb-6">
                <Clock className="mr-1.5 h-3 w-3" />
                Website in Under 10 Minutes
              </Badge>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 leading-tight">
                See How{" "}
                <GradientText from="from-primary-600" to="to-primary-400">
                  Xusmo
                </GradientText>{" "}
                Works
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-neutral-500 leading-relaxed">
                Three simple steps take you from &ldquo;I need a website&rdquo; to
                &ldquo;my website is live.&rdquo; No design skills, no coding, no
                headaches. Just answer a few questions and let AI handle the rest.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/interview">
                  <Button variant="primary" size="xl" arrow className="group">
                    Start Building — Free
                  </Button>
                </Link>
                <Link href="#steps">
                  <Button variant="secondary" size="lg">
                    Read the Walkthrough
                  </Button>
                </Link>
              </div>
            </AnimatedSection>

            {/* Quick overview strip */}
            <AnimatedSection delay={400}>
              <div className="mt-14 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-surface-border bg-white/80 backdrop-blur-sm px-6 py-4 shadow-card">
                {[
                  { icon: MessageSquare, label: "Answer Questions" },
                  { icon: Zap, label: "AI Builds It" },
                  { icon: Rocket, label: "Go Live" },
                ].map((item, i) => (
                  <span key={item.label} className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700">
                      <item.icon className="h-4 w-4 text-primary-500" />
                      {item.label}
                    </span>
                    {i < 2 && (
                      <ArrowRight className="h-3.5 w-3.5 text-neutral-300" />
                    )}
                  </span>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </Container>
      </section>

      {/* ================================================================
          DETAILED STEPS
          ================================================================ */}
      <section id="steps" className="py-24 bg-white">
        <Container>
          <AnimatedSection>
            <SectionHeading
              eyebrow="The Full Walkthrough"
              title="Three Steps, Explained"
              subtitle="Here's exactly what happens at every stage — no surprises, no fine print."
            />
          </AnimatedSection>

          <div className="mt-20 space-y-32">
            {STEPS.map((step, stepIndex) => {
              const accent = stepAccentClasses(step.color);
              const isReversed = stepIndex % 2 !== 0;

              return (
                <div key={step.num} className="relative">
                  {/* Connector line between steps */}
                  {stepIndex < STEPS.length - 1 && (
                    <div className="absolute left-1/2 -bottom-16 hidden h-32 w-px bg-gradient-to-b from-surface-border to-transparent lg:block" />
                  )}

                  <AnimatedSection delay={100}>
                    <div
                      className={`grid items-center gap-12 lg:grid-cols-2 ${
                        isReversed ? "lg:direction-rtl" : ""
                      }`}
                    >
                      {/* --- Text side --- */}
                      <div
                        className={`${
                          isReversed ? "lg:order-2 lg:text-left" : ""
                        }`}
                      >
                        <div className="flex items-center gap-4 mb-6">
                          <span
                            className={`font-display text-6xl font-bold ${accent.numText}`}
                          >
                            {step.num}
                          </span>
                          <div>
                            <Badge variant={accent.badge} className="mb-1">
                              Step {stepIndex + 1} of 3
                            </Badge>
                            <h3 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900">
                              {step.title}
                            </h3>
                          </div>
                        </div>

                        <p className="text-lg text-primary-600 font-medium mb-4">
                          {step.tagline}
                        </p>

                        <p className="text-neutral-500 leading-relaxed mb-8 max-w-lg">
                          {step.description}
                        </p>

                        {/* Stat badge */}
                        <div
                          className={`inline-flex items-center gap-3 rounded-xl border px-5 py-3 ${accent.statBg}`}
                        >
                          <span className="text-2xl font-bold">
                            {step.stat}
                          </span>
                          <span className="text-sm opacity-80">
                            {step.statLabel}
                          </span>
                        </div>
                      </div>

                      {/* --- Detail cards side --- */}
                      <div
                        className={`grid gap-4 sm:grid-cols-2 ${
                          isReversed ? "lg:order-1" : ""
                        }`}
                      >
                        {step.details.map((detail, di) => (
                          <AnimatedSection
                            key={detail.label}
                            delay={200 + di * 100}
                            direction={isReversed ? "left" : "right"}
                          >
                            <Card hover className="h-full">
                              <detail.icon
                                className={`h-6 w-6 mb-3 ${accent.detailIcon}`}
                              />
                              <h4 className="font-semibold text-neutral-900 mb-1.5">
                                {detail.label}
                              </h4>
                              <p className="text-sm text-neutral-500 leading-relaxed">
                                {detail.text}
                              </p>
                            </Card>
                          </AnimatedSection>
                        ))}
                      </div>
                    </div>
                  </AnimatedSection>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ================================================================
          WHAT YOU GET — Summary strip
          ================================================================ */}
      <section className="py-16 bg-surface-cream">
        <Container>
          <AnimatedSection>
            <div className="text-center mb-12">
              <Badge variant="solid" className="mb-4">
                <Sparkles className="mr-1.5 h-3 w-3" />
                All Included Free
              </Badge>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900">
                What You Get — At No Cost
              </h2>
              <p className="mt-3 text-neutral-500 max-w-lg mx-auto">
                Every website we build comes with these features standard.
                No upsells, no hidden extras.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-3xl mx-auto">
              {WHAT_YOU_GET.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-2 rounded-xl bg-white border border-surface-border p-4 text-center shadow-card"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-neutral-700">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </Container>
      </section>

      {/* ================================================================
          SEE IT IN ACTION — Demo video placeholder
          ================================================================ */}
      <section className="py-24 bg-white">
        <Container width="narrow">
          <AnimatedSection>
            <SectionHeading
              eyebrow="See It in Action"
              title="Watch a Website Get Built"
              subtitle="See the entire process from start to finish in under 3 minutes."
            />
          </AnimatedSection>

          <AnimatedSection delay={200} direction="scale">
            <div className="mt-12 relative group">
              {/* Video placeholder */}
              <div className="aspect-video rounded-2xl border-2 border-surface-border bg-gradient-to-br from-primary-50 via-white to-accent-50 shadow-card-hover overflow-hidden">
                <div className="flex h-full flex-col items-center justify-center gap-4">
                  {/* Play button */}
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-600 text-white shadow-glow transition-transform duration-300 group-hover:scale-110">
                    <Play className="h-8 w-8 ml-1" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-neutral-700">
                      Demo Coming Soon
                    </p>
                    <p className="text-sm text-neutral-400 mt-1">
                      Watch a real business website get built by AI in minutes
                    </p>
                  </div>
                </div>

                {/* Decorative browser chrome */}
                <div className="absolute top-0 left-0 right-0 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border-b border-surface-border px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-coral-400/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-accent-300/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
                  <span className="ml-3 flex-1 rounded-md bg-neutral-100 px-3 py-1 text-xs text-neutral-400 text-center">
                    xusmo.ai/demo
                  </span>
                </div>
              </div>

              {/* Supporting note */}
              <p className="mt-4 text-center text-sm text-neutral-400">
                Or skip the video and{" "}
                <Link
                  href="/interview"
                  className="font-medium text-primary-600 hover:text-primary-700 underline underline-offset-4"
                >
                  try it yourself for free
                </Link>
                .
              </p>
            </div>
          </AnimatedSection>
        </Container>
      </section>

      {/* ================================================================
          TIMELINE SUMMARY — Quick visual recap
          ================================================================ */}
      <section className="py-20 bg-surface-cream">
        <Container>
          <AnimatedSection>
            <SectionHeading
              eyebrow="At a Glance"
              title="Your Timeline"
              subtitle="Here's how fast you can go from idea to live website."
            />
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div className="mt-12 mx-auto max-w-3xl">
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary-300 via-accent-300 to-primary-300 hidden sm:block" />

                {[
                  {
                    time: "0:00",
                    label: "Start the AI interview",
                    detail: "Click 'Build My Free Website' and begin answering questions.",
                    icon: MessageSquare,
                  },
                  {
                    time: "~5:00",
                    label: "Interview complete",
                    detail: "You've told us everything we need. The AI starts building.",
                    icon: CheckCircle2,
                  },
                  {
                    time: "~8:00",
                    label: "Your website is ready",
                    detail: "Preview your complete, multi-page website. Every page, fully designed.",
                    icon: Eye,
                  },
                  {
                    time: "~10:00",
                    label: "Go live (when you're ready)",
                    detail: "Connect your domain and publish. Hosting is $11.99/mo.",
                    icon: Rocket,
                  },
                ].map((item, i) => (
                  <AnimatedSection key={item.time} delay={i * 150}>
                    <div className="relative flex items-start gap-6 pb-10 last:pb-0">
                      {/* Timeline dot */}
                      <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white border-2 border-primary-200 shadow-card">
                        <item.icon className="h-5 w-5 text-primary-600" />
                      </div>

                      <div className="pt-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono text-sm font-bold text-primary-600">
                            {item.time}
                          </span>
                          <h4 className="font-semibold text-neutral-900">
                            {item.label}
                          </h4>
                        </div>
                        <p className="text-sm text-neutral-500 leading-relaxed">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </Container>
      </section>

      {/* ================================================================
          FAQ
          ================================================================ */}
      <section className="py-24 bg-white">
        <Container width="narrow">
          <AnimatedSection>
            <SectionHeading
              eyebrow="Questions & Answers"
              title="Frequently Asked Questions"
              subtitle="Everything you need to know about the process."
            />
          </AnimatedSection>

          <div className="mt-12 space-y-3">
            {FAQ.map((item, i) => (
              <AnimatedSection key={item.q} delay={i * 60}>
                <details className="group rounded-xl border border-surface-border bg-white shadow-card open:shadow-card-hover transition-shadow duration-300">
                  <summary className="flex cursor-pointer items-center gap-3 px-6 py-5 font-medium text-neutral-800 select-none">
                    <HelpCircle className="h-5 w-5 shrink-0 text-primary-400 transition-colors group-open:text-primary-600" />
                    <span className="flex-1">{item.q}</span>
                    <svg
                      className="h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-300 group-open:rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="px-6 pb-5 pl-14">
                    <p className="text-neutral-500 leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </details>
              </AnimatedSection>
            ))}
          </div>
        </Container>
      </section>

      {/* ================================================================
          BOTTOM CTA
          ================================================================ */}
      <section className="relative py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgb(245_158_11/0.15),_transparent_60%)]" />

        <Container className="relative">
          <AnimatedSection>
            <div className="text-center">
              <Badge
                variant="gradient"
                className="mb-6"
              >
                <CreditCard className="mr-1.5 h-3 w-3" />
                No Credit Card Required
              </Badge>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                Ready to See It for Yourself?
              </h2>

              <p className="mt-6 text-lg text-primary-200 max-w-xl mx-auto leading-relaxed">
                Your AI-built website is completely free. Answer a few questions,
                preview your site, and only pay when you&apos;re ready to go live.
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
                <Link href="/#pricing">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-primary-200 hover:text-white hover:bg-white/10"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-primary-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary-400" />
                  Website built free
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary-400" />
                  Full preview before paying
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary-400" />
                  $11.99/mo to go live
                </span>
              </div>
            </div>
          </AnimatedSection>
        </Container>
      </section>
    </MarketingLayout>
  );
}
