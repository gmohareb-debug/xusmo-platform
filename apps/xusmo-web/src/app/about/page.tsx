// =============================================================================
// About Page — Company mission, values, team, and stats
// =============================================================================

import Link from "next/link";
import MarketingLayout from "@/components/layout/MarketingLayout";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import GradientText from "@/components/ui/GradientText";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  Gem,
  Zap,
  Scale,
  KeyRound,
  Globe,
  TrendingUp,
  Server,
  Timer,
  Linkedin,
  Twitter,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const VALUES = [
  {
    icon: Gem,
    title: "Quality",
    description:
      "Every website we generate meets the same standard you would expect from a professional agency. Beautiful design, clean code, and pixel-perfect responsiveness are non-negotiable.",
  },
  {
    icon: Zap,
    title: "Speed",
    description:
      "Time is your most valuable asset. Our AI builds in minutes what used to take weeks, so you can focus on running your business instead of waiting on a developer.",
  },
  {
    icon: Scale,
    title: "Fairness",
    description:
      "Great web presence should not come with a five-figure price tag. We keep costs transparent and accessible so every business — from solo freelancer to growing agency — can compete online.",
  },
  {
    icon: KeyRound,
    title: "Ownership",
    description:
      "Your website is yours. Full WordPress CMS, exportable at any time, no lock-in. We believe you should never be held hostage by the platform that built your site.",
  },
];

const STATS = [
  { icon: Globe, value: "500+", label: "Sites Built" },
  { icon: TrendingUp, value: "30+", label: "Industries Served" },
  { icon: Server, value: "99.9%", label: "Uptime" },
  { icon: Timer, value: "< 5 min", label: "Build Time" },
];

const TEAM = [
  {
    name: "Alex Rivera",
    role: "Founder & CEO",
    bio: "Former agency owner who watched small businesses get priced out of quality web design. Started Xusmo to fix that.",
    linkedIn: "#",
    twitter: "#",
  },
  {
    name: "Priya Sharma",
    role: "Head of AI",
    bio: "ML engineer with a decade of NLP experience. Leads the AI systems that turn a five-minute conversation into a polished website.",
    linkedIn: "#",
    twitter: "#",
  },
  {
    name: "Marcus Chen",
    role: "Head of Design",
    bio: "Previously design lead at a top SaaS company. Obsessed with making AI-generated layouts feel hand-crafted and on-brand.",
    linkedIn: "#",
    twitter: "#",
  },
  {
    name: "Lena Johansson",
    role: "Head of Engineering",
    bio: "Full-stack architect who built hosting platforms at scale. Ensures every Xusmo site loads lightning-fast and stays online.",
    linkedIn: "#",
    twitter: "#",
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AboutPage() {
  return (
    <MarketingLayout>
      {/* ================================================================
          HERO
          ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-hero pb-20 pt-12 sm:pt-20">
        <Container width="narrow">
          <div className="text-center">
            <AnimatedSection delay={0}>
              <Badge variant="outline" className="mb-6">
                About Xusmo
              </Badge>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-neutral-900 leading-tight">
                Making Professional Websites{" "}
                <GradientText from="from-primary-600" to="to-primary-400">
                  Accessible to Every Business
                </GradientText>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-neutral-500 leading-relaxed">
                We believe that every business — no matter its size or budget —
                deserves a website that looks like it was built by an expert.
                Xusmo uses AI to make that a reality in minutes, not months.
              </p>
            </AnimatedSection>
          </div>
        </Container>
      </section>

      {/* ================================================================
          MISSION / STORY
          ================================================================ */}
      <section className="py-24 bg-white">
        <Container width="narrow">
          <AnimatedSection>
            <SectionHeading
              eyebrow="Our Mission"
              title="Democratizing Web Design with AI"
            />
          </AnimatedSection>

          <AnimatedSection delay={150}>
            <div className="mt-12 space-y-6 text-lg text-neutral-600 leading-relaxed">
              <p>
                For too long, getting a professional website meant one of two
                things: spend thousands hiring a web agency, or settle for a
                cookie-cutter template that looks like everyone else. Small
                business owners — the backbone of every local economy — were
                left choosing between an empty wallet and an underwhelming online
                presence.
              </p>
              <p>
                Xusmo was born to change that equation. We combined the
                latest advances in artificial intelligence with deep expertise
                in web design and WordPress development to create a platform
                that builds genuinely professional websites through a simple
                conversation. You tell us about your business; the AI does the
                rest — content, images, layout, SEO — in under five minutes.
              </p>
              <p>
                The best part?{" "}
                <span className="font-semibold text-neutral-900">
                  The build is free.
                </span>{" "}
                You only pay when you are ready to go live, and at a fraction
                of the cost of traditional options. We believe that a great
                website is not a luxury — it is a necessity — and no one should
                be priced out of having one.
              </p>
            </div>
          </AnimatedSection>
        </Container>
      </section>

      {/* ================================================================
          VALUES
          ================================================================ */}
      <section className="py-24 bg-surface-cream">
        <Container>
          <AnimatedSection>
            <SectionHeading
              eyebrow="What We Stand For"
              title="Our Core Values"
              subtitle="These four principles guide every decision we make — from the AI models we train to the prices we set."
            />
          </AnimatedSection>

          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {VALUES.map((v, i) => (
              <AnimatedSection key={v.title} delay={i * 120}>
                <div className="group rounded-2xl border border-surface-border bg-white p-8 transition-shadow duration-300 hover:shadow-lg">
                  <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                    <v.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-neutral-900 mb-3">
                    {v.title}
                  </h3>
                  <p className="text-neutral-500 leading-relaxed">
                    {v.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </Container>
      </section>

      {/* ================================================================
          STATS
          ================================================================ */}
      <section className="relative py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgb(245_158_11/0.15),_transparent_60%)]" />

        <Container className="relative">
          <AnimatedSection>
            <SectionHeading
              title="Xusmo by the Numbers"
              subtitle="Growing fast because we keep our promise: quality sites, built free, in minutes."
              dark
            />
          </AnimatedSection>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <AnimatedSection key={s.label} delay={i * 100}>
                <div className="text-center">
                  <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <s.icon className="h-7 w-7" />
                  </div>
                  <p className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
                    {s.value}
                  </p>
                  <p className="mt-2 text-primary-200 text-sm font-medium uppercase tracking-wider">
                    {s.label}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </Container>
      </section>

      {/* ================================================================
          TEAM
          ================================================================ */}
      <section className="py-24 bg-white">
        <Container>
          <AnimatedSection>
            <SectionHeading
              eyebrow="The People Behind the AI"
              title="Meet Our Team"
              subtitle="A small, focused crew united by one goal: make the web more accessible."
            />
          </AnimatedSection>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((member, i) => (
              <AnimatedSection key={member.name} delay={i * 120}>
                <div className="group text-center">
                  {/* Avatar placeholder */}
                  <div className="mx-auto mb-6 h-32 w-32 rounded-full bg-gradient-to-br from-primary-200 to-primary-400 flex items-center justify-center">
                    <span className="font-display text-3xl font-bold text-white select-none">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-neutral-900">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-primary-600 mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-neutral-500 leading-relaxed mb-4">
                    {member.bio}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <a
                      href={member.linkedIn}
                      className="text-neutral-400 hover:text-primary-600 transition-colors"
                      aria-label={`${member.name} on LinkedIn`}
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                    <a
                      href={member.twitter}
                      className="text-neutral-400 hover:text-primary-600 transition-colors"
                      aria-label={`${member.name} on Twitter`}
                    >
                      <Twitter className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </Container>
      </section>

      {/* ================================================================
          BOTTOM CTA
          ================================================================ */}
      <section className="py-24 bg-surface-cream">
        <Container width="narrow">
          <AnimatedSection>
            <div className="text-center">
              <SectionHeading
                eyebrow="Get Started"
                title="Ready to See What AI Can Build for You?"
                subtitle="Join hundreds of businesses that launched a professional website in minutes — completely free."
              />

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/interview">
                  <Button variant="primary" size="xl" arrow className="group">
                    Build My Free Website
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="secondary" size="xl">
                    View Pricing
                  </Button>
                </Link>
              </div>

              <p className="mt-6 text-sm text-neutral-500">
                No credit card required. Your website is free to build.
              </p>
            </div>
          </AnimatedSection>
        </Container>
      </section>
    </MarketingLayout>
  );
}
