"use client";

// =============================================================================
// Contact Page — Contact form, info sidebar, and FAQ accordion
// =============================================================================

import { useState } from "react";
import Link from "next/link";
import MarketingLayout from "@/components/layout/MarketingLayout";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import { Mail, MessageSquare, MapPin, ChevronDown, Clock, Send, CheckCircle } from "lucide-react";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const SUBJECTS = [
  "General Inquiry",
  "Pricing & Plans",
  "Technical Support",
  "Enterprise / Agency",
  "Partnership Opportunity",
  "Bug Report",
];

const FAQ = [
  {
    q: "How long does it take to build my website?",
    a: "Our AI builds your complete website in under 10 minutes. You answer a few questions about your business, and our AI handles the rest - pages, content, images, and SEO are all generated automatically.",
  },
  {
    q: "Do I need any technical skills to use Xusmo?",
    a: "Not at all. Xusmo is designed for business owners, not developers. Our AI interview walks you through everything step by step. If you can answer questions about your business, you can build a website.",
  },
  {
    q: "Can I edit my website after it's built?",
    a: "Absolutely. Your site is a full WordPress website, so you have complete control. Edit text, swap images, add pages, install plugins - it's your site, your way. We also offer AI-powered content updates on Pro plans.",
  },
  {
    q: "What if I'm not happy with the result?",
    a: "Your initial website build is completely free, so there's zero risk. You can preview the full site before paying anything. If you'd like changes, you can edit it yourself or reach out to our support team for help.",
  },
  {
    q: "How do I connect my own domain?",
    a: "Once you go live with a hosting plan ($11.99/mo), you can connect any domain you already own. You can also purchase a new domain through us at cost. Annual plans include a free domain for the first year.",
  },
];

const SOCIAL_LINKS = [
  { name: "Twitter / X", href: "https://x.com/xusmo", label: "@xusmo" },
  { name: "LinkedIn", href: "https://linkedin.com/company/xusmo", label: "Xusmo" },
  { name: "YouTube", href: "https://youtube.com/@xusmo", label: "Xusmo" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);

    // Simulate sending
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
    }, 1500);
  }

  return (
    <MarketingLayout>
      {/* ================================================================
          HERO SECTION
          ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-hero pb-16 pt-12 sm:pt-20">
        <Container>
          <AnimatedSection>
            <div className="text-center">
              <p className="text-sm font-semibold tracking-widest uppercase mb-3 text-primary-600">
                Contact Us
              </p>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-tight">
                Get in Touch
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-neutral-500 leading-relaxed">
                Have a question, need help, or want to learn more about Xusmo?
                We&apos;d love to hear from you.
              </p>
            </div>
          </AnimatedSection>
        </Container>
      </section>

      {/* ================================================================
          CONTACT FORM + INFO
          ================================================================ */}
      <section className="py-24 bg-white">
        <Container>
          <div className="grid gap-12 lg:grid-cols-5">
            {/* ---- Contact Form (Left - 3 cols) ---- */}
            <AnimatedSection direction="left" className="lg:col-span-3">
              <div className="rounded-2xl border border-surface-border bg-white p-8 sm:p-10 shadow-card">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-neutral-900 mb-3">
                      Message Sent!
                    </h3>
                    <p className="text-neutral-500 max-w-sm leading-relaxed">
                      Thanks for reaching out, {formData.name.split(" ")[0] || "there"}!
                      We&apos;ll get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: "", email: "", subject: "", message: "" });
                      }}
                      className="mt-8 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="font-display text-2xl font-bold text-neutral-900 mb-2">
                      Send Us a Message
                    </h2>
                    <p className="text-neutral-500 mb-8">
                      Fill out the form below and we&apos;ll get back to you as soon as possible.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Name */}
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-neutral-700 mb-2"
                        >
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="w-full rounded-lg border border-surface-border bg-surface-cream px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-neutral-700 mb-2"
                        >
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          className="w-full rounded-lg border border-surface-border bg-surface-cream px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                        />
                      </div>

                      {/* Subject */}
                      <div>
                        <label
                          htmlFor="subject"
                          className="block text-sm font-medium text-neutral-700 mb-2"
                        >
                          Subject
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-surface-border bg-surface-cream px-4 py-3 text-sm text-neutral-900 outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100 appearance-none"
                        >
                          <option value="" disabled>
                            Select a subject...
                          </option>
                          {SUBJECTS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Message */}
                      <div>
                        <label
                          htmlFor="message"
                          className="block text-sm font-medium text-neutral-700 mb-2"
                        >
                          Message
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          required
                          rows={5}
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us how we can help..."
                          className="w-full rounded-lg border border-surface-border bg-surface-cream px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-none"
                        />
                      </div>

                      {/* Submit */}
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        loading={sending}
                        className="w-full group"
                      >
                        <Send className="h-4 w-4" />
                        Send Message
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </AnimatedSection>

            {/* ---- Contact Info (Right - 2 cols) ---- */}
            <AnimatedSection direction="right" delay={150} className="lg:col-span-2">
              <div className="space-y-8">
                {/* Email */}
                <div className="rounded-2xl border border-surface-border bg-surface-cream p-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-neutral-900 mb-1">
                    Email Us
                  </h3>
                  <a
                    href="mailto:hello@xusmo.com"
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    hello@xusmo.com
                  </a>
                  <p className="mt-2 text-sm text-neutral-500">
                    We typically respond within 24 hours.
                  </p>
                </div>

                {/* Support Hours */}
                <div className="rounded-2xl border border-surface-border bg-surface-cream p-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                    <Clock className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-neutral-900 mb-1">
                    Support Hours
                  </h3>
                  <p className="text-neutral-700 font-medium">
                    Monday - Friday
                  </p>
                  <p className="text-sm text-neutral-500">
                    9:00 AM - 6:00 PM EST
                  </p>
                  <p className="mt-2 text-sm text-neutral-500">
                    Pro &amp; Agency plans include priority support with faster response times.
                  </p>
                </div>

                {/* Live Chat */}
                <div className="rounded-2xl border border-surface-border bg-surface-cream p-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-neutral-900 mb-1">
                    Connect With Us
                  </h3>
                  <div className="mt-3 space-y-2">
                    {SOCIAL_LINKS.map((link) => (
                      <a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600 transition-colors"
                      >
                        <span className="font-medium">{link.name}</span>
                        <span className="text-neutral-400">{link.label}</span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="rounded-2xl border border-surface-border bg-surface-cream p-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-neutral-900 mb-1">
                    Location
                  </h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    Xusmo is a fully remote company serving businesses worldwide.
                    No office visits needed - everything is done online.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </Container>
      </section>

      {/* ================================================================
          FAQ SECTION
          ================================================================ */}
      <section className="py-24 bg-surface-cream">
        <Container width="narrow">
          <AnimatedSection>
            <SectionHeading
              eyebrow="FAQ"
              title="Frequently Asked Questions"
              subtitle="Quick answers to common questions about Xusmo."
            />
          </AnimatedSection>

          <div className="mt-12 space-y-4">
            {FAQ.map((item, i) => (
              <AnimatedSection key={item.q} delay={i * 80}>
                <div className="rounded-xl border border-surface-border bg-white shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors hover:bg-primary-50/50"
                  >
                    <span className="font-medium text-neutral-900 pr-4">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-300 ${
                        openFaq === i ? "rotate-180 text-primary-600" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      openFaq === i
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-sm text-neutral-500 leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={500}>
            <p className="mt-8 text-center text-sm text-neutral-500">
              Still have questions?{" "}
              <a
                href="mailto:hello@xusmo.com"
                className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Email us directly
              </a>{" "}
              and we&apos;ll be happy to help.
            </p>
          </AnimatedSection>
        </Container>
      </section>

      {/* ================================================================
          BOTTOM CTA
          ================================================================ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgb(245_158_11/0.15),_transparent_60%)]" />

        <Container className="relative">
          <AnimatedSection>
            <div className="text-center">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                Ready to Build Your Free Website?
              </h2>
              <p className="mt-6 text-lg text-primary-200 max-w-xl mx-auto">
                Skip the back and forth. Get a professional website in minutes, not weeks.
              </p>
              <div className="mt-10">
                <Link href="/interview">
                  <Button
                    size="xl"
                    className="bg-white text-primary-700 hover:bg-primary-50 hover:text-primary-800 shadow-xl hover:shadow-2xl group"
                    arrow
                  >
                    Build My Free Website
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
