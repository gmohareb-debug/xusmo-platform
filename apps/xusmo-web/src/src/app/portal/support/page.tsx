"use client";

// =============================================================================
// Support Page — FAQ, contact form, AI chat placeholder
// =============================================================================

import { useState } from "react";
import Link from "next/link";

const FAQ_CATEGORIES = [
  {
    name: "Getting Started",
    items: [
      {
        q: "How do I build my first website?",
        a: "Click \"Build New Site\" from the dashboard or sidebar. Our AI will ask you a few questions about your business, then build a complete website in minutes.",
      },
      {
        q: "Is the website really free?",
        a: "Yes! We build your website completely free. You only pay for hosting ($11.99/mo) when you're ready to go live with your own domain.",
      },
      {
        q: "How long does it take to build a site?",
        a: "Most sites are built in under 5 minutes. The AI interview takes about 2-3 minutes, then the build process takes another 1-2 minutes.",
      },
    ],
  },
  {
    name: "Your Website",
    items: [
      {
        q: "Can I edit my website after it's built?",
        a: "Absolutely. Your site is a real WordPress website. You can log into the WordPress admin panel and edit anything — pages, content, images, plugins, and more.",
      },
      {
        q: "Can I request changes through Xusmo?",
        a: "Yes. From the preview page, you can request revisions and our AI will make changes for you. You can also edit directly through WordPress.",
      },
      {
        q: "Do I own my website?",
        a: "Yes, 100%. Your website, content, and data are yours. You can export your WordPress site at any time and host it anywhere.",
      },
    ],
  },
  {
    name: "Billing",
    items: [
      {
        q: "What does the hosting fee include?",
        a: "Your $11.99/mo hosting includes: custom domain, SSL certificate, CDN, daily backups, 24/7 uptime monitoring, and email support.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes. You can cancel your hosting subscription at any time from the Billing page. We recommend exporting your site before canceling.",
      },
      {
        q: "Do you offer annual billing?",
        a: "Yes! Switch to annual billing and save 20%. You'll also get a free custom domain included with your annual plan.",
      },
    ],
  },
  {
    name: "Domains",
    items: [
      {
        q: "Can I use my own domain?",
        a: "Yes. Go to the Domains page and follow the instructions to point your existing domain to your Xusmo site.",
      },
      {
        q: "How long does DNS take to update?",
        a: "DNS changes typically propagate within 24-48 hours, though many updates happen within a few hours.",
      },
    ],
  },
];

export default function SupportPage() {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder — would POST to /api/support/ticket
    setSubmitted(true);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
        Support
      </h1>
      <p className="text-sm mb-8" style={{ color: "#94A3B8" }}>
        Find answers or get in touch with our team.
      </p>

      {/* AI Chat placeholder */}
      <div
        className="rounded-2xl p-6 mb-8"
        style={{
          background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
          border: "1px solid #C7D2FE",
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: "#ffffff" }}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#4F46E5"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <div>
            <h2 className="font-display font-semibold text-neutral-900 mb-1">
              AI Support Assistant
            </h2>
            <p className="text-sm mb-3" style={{ color: "#4338CA" }}>
              Get instant answers about your website, billing, and more.
            </p>
            <span
              className="inline-block rounded-xl px-4 py-2 text-sm font-medium"
              style={{
                backgroundColor: "#ffffff",
                color: "#4F46E5",
                border: "1px solid #C7D2FE",
                opacity: 0.7,
              }}
            >
              Coming Soon
            </span>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-10">
        <h2 className="font-display text-lg font-semibold text-neutral-900 mb-4">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          {FAQ_CATEGORIES.map((category) => (
            <div key={category.name}>
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: "#94A3B8" }}
              >
                {category.name}
              </h3>
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #E2E8F0",
                }}
              >
                {category.items.map((item, idx) => {
                  const key = `${category.name}-${idx}`;
                  const isOpen = openItem === key;
                  return (
                    <div
                      key={key}
                      style={{
                        borderTop: idx > 0 ? "1px solid #F1F5F9" : "none",
                      }}
                    >
                      <button
                        onClick={() => setOpenItem(isOpen ? null : key)}
                        className="flex w-full items-center justify-between px-5 py-4 text-left"
                      >
                        <span className="text-sm font-medium text-neutral-900 pr-4">
                          {item.q}
                        </span>
                        <svg
                          className="h-4 w-4 shrink-0 transition-transform duration-200"
                          style={{
                            color: "#94A3B8",
                            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          }}
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
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4">
                          <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>
                            {item.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact form */}
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}
      >
        <h2 className="font-display text-lg font-semibold text-neutral-900 mb-1">
          Contact Us
        </h2>
        <p className="text-sm mb-5" style={{ color: "#94A3B8" }}>
          Can&apos;t find what you need? Send us a message and we&apos;ll get back to you.
        </p>

        {submitted ? (
          <div className="text-center py-8">
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "#F0FDF4" }}
            >
              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#22C55E"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-display font-semibold text-neutral-900 mb-1">
              Message Sent
            </p>
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              We&apos;ll get back to you within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "#64748B" }}
                >
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, name: e.target.value })
                  }
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none transition-all"
                  style={{
                    backgroundColor: "#F8FAFC",
                    border: "1.5px solid #E2E8F0",
                  }}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "#64748B" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, email: e.target.value })
                  }
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none transition-all"
                  style={{
                    backgroundColor: "#F8FAFC",
                    border: "1.5px solid #E2E8F0",
                  }}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "#64748B" }}
              >
                Subject
              </label>
              <input
                type="text"
                required
                value={contactForm.subject}
                onChange={(e) =>
                  setContactForm({ ...contactForm, subject: e.target.value })
                }
                className="w-full rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none transition-all"
                style={{
                  backgroundColor: "#F8FAFC",
                  border: "1.5px solid #E2E8F0",
                }}
                placeholder="How can we help?"
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "#64748B" }}
              >
                Message
              </label>
              <textarea
                required
                rows={4}
                value={contactForm.message}
                onChange={(e) =>
                  setContactForm({ ...contactForm, message: e.target.value })
                }
                className="w-full rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none transition-all resize-none"
                style={{
                  backgroundColor: "#F8FAFC",
                  border: "1.5px solid #E2E8F0",
                }}
                placeholder="Describe your issue or question..."
              />
            </div>

            <button
              type="submit"
              className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{ backgroundColor: "#4F46E5" }}
            >
              Send Message
            </button>
          </form>
        )}
      </div>

      {/* Feature request */}
      <div className="mt-6 text-center">
        <p className="text-sm" style={{ color: "#94A3B8" }}>
          Have an idea?{" "}
          <Link href="/contact" style={{ color: "#4F46E5" }} className="font-medium">
            Submit a feature request
          </Link>
        </p>
      </div>
    </div>
  );
}
