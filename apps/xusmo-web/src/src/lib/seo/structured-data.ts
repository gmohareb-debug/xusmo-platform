const SITE_URL = "https://xusmo.ai";
const SITE_NAME = "Xusmo";

// ---------------------------------------------------------------------------
// Schema types (subset of Schema.org for type safety)
// ---------------------------------------------------------------------------

interface SchemaBase {
  "@context": "https://schema.org";
  "@type": string;
  [key: string]: unknown;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Organization
// ---------------------------------------------------------------------------

export function organizationSchema(): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      "AI-powered website builder for small businesses. Professional sites in 5 minutes, not 5 weeks.",
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${SITE_URL}/contact`,
    },
  };
}

// ---------------------------------------------------------------------------
// WebSite (with SearchAction)
// ---------------------------------------------------------------------------

export function websiteSchema(): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/examples?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ---------------------------------------------------------------------------
// SoftwareApplication
// ---------------------------------------------------------------------------

export function softwareApplicationSchema(): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "AI-powered website builder that creates professional WordPress sites for small businesses in minutes.",
    offers: {
      "@type": "Offer",
      price: "11.99",
      priceCurrency: "USD",
      description: "Monthly hosting with custom domain and unlimited edits",
      url: `${SITE_URL}/pricing`,
    },
    aggregateRating: undefined,
  };
}

// ---------------------------------------------------------------------------
// FAQPage
// ---------------------------------------------------------------------------

export function faqSchema(faqs: FaqItem[]): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// ---------------------------------------------------------------------------
// BreadcrumbList
// ---------------------------------------------------------------------------

export function breadcrumbSchema(items: BreadcrumbItem[]): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

// ---------------------------------------------------------------------------
// Helper: render JSON-LD as a <script> tag string
// ---------------------------------------------------------------------------

export function jsonLdScript(data: object): string {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}
