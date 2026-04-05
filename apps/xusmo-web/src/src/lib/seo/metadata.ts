import type { Metadata } from "next";

const SITE_NAME = "Xusmo";
const SITE_URL = "https://xusmo.ai";
const DEFAULT_DESCRIPTION =
  "AI-powered website builder for small businesses. Professional sites in 5 minutes, not 5 weeks.";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

export function createMetadata(overrides: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
}): Metadata {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    path = "",
    image = DEFAULT_IMAGE,
  } = overrides;

  const canonicalUrl = `${SITE_URL}${path}`;

  return {
    title: title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — AI Website Builder`,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — AI Website Builder`,
      description,
      url: canonicalUrl,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title ? `${title} — ${SITE_NAME}` : SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — AI Website Builder`,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// ---------------------------------------------------------------------------
// Pre-built metadata for each marketing page
// ---------------------------------------------------------------------------

export const homeMetadata: Metadata = createMetadata({
  description:
    "AI builds your professional website for free. Tell us about your business and get a custom WordPress site in minutes. Go live with hosting for $11.99/mo.",
});

export const pricingMetadata: Metadata = createMetadata({
  title: "Pricing",
  description:
    "Simple, transparent pricing for your AI-built website. Free to build, $11.99/mo to go live with hosting, domain, and unlimited edits.",
  path: "/pricing",
});

export const howItWorksMetadata: Metadata = createMetadata({
  title: "How It Works",
  description:
    "See how Xusmo builds your professional website in 3 simple steps: answer a few questions, review your AI-generated site, then go live instantly.",
  path: "/how-it-works",
});

export const examplesMetadata: Metadata = createMetadata({
  title: "Examples",
  description:
    "Browse real websites built by Xusmo AI. See professional sites for restaurants, salons, contractors, and more small businesses.",
  path: "/examples",
});

export const aboutMetadata: Metadata = createMetadata({
  title: "About",
  description:
    "Xusmo is on a mission to give every small business a professional web presence. Learn about the team and technology behind the AI website builder.",
  path: "/about",
});

export const contactMetadata: Metadata = createMetadata({
  title: "Contact",
  description:
    "Get in touch with the Xusmo team. We're here to help with questions about your AI-built website, billing, or partnerships.",
  path: "/contact",
});

export const privacyMetadata: Metadata = createMetadata({
  title: "Privacy Policy",
  description:
    "Xusmo privacy policy. Learn how we collect, use, and protect your personal information when you use our AI website builder.",
  path: "/privacy",
});

export const termsMetadata: Metadata = createMetadata({
  title: "Terms of Service",
  description:
    "Xusmo terms of service. Read the terms and conditions that govern your use of our AI website builder and hosting platform.",
  path: "/terms",
});
