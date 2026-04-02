// =============================================================================
// Logo Generator — Generates professional SVG logos for sites without one
// Uses industry-aware icons, theme colors, and brand fonts.
// Pure logic — no Prisma dependency.
// =============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LogoResult {
  svg: string;
  svgCompact: string; // Icon-only or abbreviated version
  type: "generated";
  dominantColors: Array<{ hex: string; population: number }>;
}

export interface LogoContext {
  businessName: string;
  industry: string;
  archetype: string;
  primaryColor: string;
  accentColor: string;
  headingFont: string;
  borderRadius: string; // determines shape language
}

// ---------------------------------------------------------------------------
// Industry icon SVG paths (16x16 viewBox)
// Simple recognizable silhouettes for logo marks
// ---------------------------------------------------------------------------

const INDUSTRY_ICONS: Record<string, string> = {
  // Construction / Trade
  hvac: "M3 13h2v-2H3v2zm4 0h2V8H7v5zm4 0h2V3h-2v10z",
  plumbing: "M8 1C5.8 1 4 2.8 4 5v2H3v6h3v-6H5V5c0-1.7 1.3-3 3-3s3 1.3 3 3v2h-1v6h3V7h-1V5c0-2.2-1.8-4-4-4z",
  electrical: "M9 1L4 8h3l-1 7 6-8H9l1-6z",
  construction: "M2 14h12L8 3 2 14zm6-2H7v-1h1v1zm0-2H7V8h1v2z",
  roofing: "M8 2L1 9h2v5h4v-3h2v3h4V9h2L8 2z",
  landscaping: "M12 10c0-2.2-1.8-4-4-4S4 7.8 4 10H2v4h12v-4h-2zm-4-2c1.1 0 2 .9 2 2H6c0-1.1.9-2 2-2z",
  cleaning: "M7 1v3H5l1 4H5l3 7 3-7H9L10 4H8V1H7z",

  // Food & Beverage
  restaurant: "M3 2v5c0 1.1.9 2 2 2h1v5h2V9h1c1.1 0 2-.9 2-2V2h-1v4H9V2H8v4H7V2H6v4H5V2H3z",
  cafe: "M2 4v2c0 1.7 1.3 3 3 3h5v1H4v2h8V9c1.1 0 2-.9 2-2V4H2zm10 3c0 .6-.4 1-1 1V6h1v1z",
  bakery: "M8 2C5.2 2 3 4.2 3 7c0 1.5.6 2.8 1.6 3.8L4 14h8l-.6-3.2C12.4 9.8 13 8.5 13 7c0-2.8-2.2-5-5-5z",
  bar: "M3 2l2 6v6h6V8l2-6H3zm5 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z",

  // Health & Wellness
  medical: "M10 2H6v4H2v4h4v4h4v-4h4V6h-4V2z",
  dental: "M8 2C6 2 4 3.5 4 6c0 2 1.5 3 1.5 5.5S7 14 8 14s2.5-0.5 2.5-2.5S12 8 12 6c0-2.5-2-4-4-4z",
  fitness: "M1 6h2v4H1V6zm3-2h1v8H4V4zm2 1h1v6H6V5zm5-1h1v8h-1V4zm2 1h1v6h-1V5zm2-2h2v4h-2V6z",
  spa: "M8 1C5.8 1 4 3 4 5.5c0 3 4 8.5 4 8.5s4-5.5 4-8.5C12 3 10.2 1 8 1z",
  yoga: "M8 2a2 2 0 100 4 2 2 0 000-4zM5 8l3 2 3-2v2l-3 4-3-4V8z",

  // Professional Services
  law: "M4 2h8v2H4V2zm1 3h6l1 3H4l1-3zm-1 4h8v1H4V9zm2 2h4v3H6v-3z",
  finance: "M8 2L2 5v1h12V5L8 2zM3 7v4h2V7H3zm4 0v4h2V7H7zm4 0v4h2V7h-2zM2 12v2h12v-2H2z",
  consulting: "M4 4h8v8H4V4zm2 2v1h4V6H6zm0 2v1h4V8H6zm0 2v1h2v-1H6z",
  insurance: "M8 1L3 4v4c0 3.5 2.1 6.8 5 8 2.9-1.2 5-4.5 5-8V4L8 1zm0 2l3 2v3c0 2.5-1.5 4.8-3 5.8-1.5-1-3-3.3-3-5.8V5l3-2z",

  // Creative
  photography: "M9 2H7L6 3H3v9h10V3h-3L9 2zM8 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z",
  design: "M3 11.5V14h2.5l7.4-7.4-2.5-2.5L3 11.5zm11.7-6.8c.3-.3.3-.7 0-1l-1.4-1.4c-.3-.3-.7-.3-1 0l-1.2 1.2 2.5 2.5 1.1-1.3z",
  art: "M12 2C9.8 2 8 3.8 8 6c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4c2.2 0 4-1.8 4-4s-1.8-4-4-4z",
  music: "M12 1v8.3c-.5-.2-1-.3-1.5-.3-1.4 0-2.5.9-2.5 2s1.1 2 2.5 2 2.5-.9 2.5-2V4h3V1h-4zM5.5 10C4.1 10 3 10.9 3 12s1.1 2 2.5 2S8 13.1 8 12V5h3V2H7v6.3c-.5-.2-1-.3-1.5-.3z",

  // Real Estate / Property
  realestate: "M8 2L1 7h2v7h4v-4h2v4h4V7h2L8 2z",
  property: "M8 2L1 7h2v7h4v-4h2v4h4V7h2L8 2z",
  hotel: "M2 12h12V7H2v5zM7 4h2v2H7V4zM3 4h3v2H3V4zm8 0h3v2h-3V4z",

  // Automotive
  automotive: "M3 7l1.5-3h7L13 7h1v4h-2c0 1.1-.9 2-2 2s-2-.9-2-2H6c0 1.1-.9 2-2 2s-2-.9-2-2H1V7h2zm1 1.5a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z",

  // Education
  education: "M8 1L1 5l7 4 6-3.5V10h1V5L8 1zM4 7.2v3.3l4 2.3 4-2.3V7.2L8 9.5 4 7.2z",
  tutoring: "M8 1L1 5l7 4 6-3.5V10h1V5L8 1zM4 7.2v3.3l4 2.3 4-2.3V7.2L8 9.5 4 7.2z",

  // Pets
  pets: "M4.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm7 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-8.5 5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm10 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM8 8c-2.2 0-4 1.3-4 3 0 2 2 3 4 3s4-1 4-3c0-1.7-1.8-3-4-3z",
  veterinary: "M4.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm7 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM8 8c-2.2 0-4 1.3-4 3 0 2 2 3 4 3s4-1 4-3c0-1.7-1.8-3-4-3z",

  // Technology
  tech: "M2 3v8h12V3H2zm10 6H4V5h8v4zm-5 3h2v2H7v-2z",
  developer: "M4 4L1 8l3 4 1.4-1.4L3 8l2.4-2.6L4 4zm8 0l-1.4 1.4L13 8l-2.4 2.6L12 12l3-4-3-4zM7.5 13h1l2-10h-1l-2 10z",
  saas: "M2 4h12v8H2V4zm2 2v4h8V6H4zm3 1h2v2H7V7z",
};

// Fallback icon for unknown industries — abstract shape
const DEFAULT_ICON = "M8 1L1 8l7 7 7-7-7-7zM8 3.4L12.6 8 8 12.6 3.4 8 8 3.4z";

export function getIndustryIcon(industry: string): string {
  const key = industry.toLowerCase().replace(/[\s-_]+/g, "");
  if (INDUSTRY_ICONS[key]) return INDUSTRY_ICONS[key];
  for (const [k, v] of Object.entries(INDUSTRY_ICONS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return DEFAULT_ICON;
}

// ---------------------------------------------------------------------------
// SVG Logo Generator — produces professional mark + wordmark
// ---------------------------------------------------------------------------

export function generateLogo(ctx: LogoContext): LogoResult {
  const {
    businessName,
    industry,
    primaryColor,
    accentColor,
    headingFont,
    borderRadius,
  } = ctx;

  const iconPath = getIndustryIcon(industry);
  const parsed = parseInt(borderRadius);
  const rad = isNaN(parsed) ? 8 : parsed;
  const isRounded = rad >= 12;
  const isSharp = rad <= 2;

  // Encode font for SVG
  const fontEncoded = encodeURIComponent(headingFont);

  // Text truncation for display
  const shortName =
    businessName.length > 20
      ? businessName
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
      : businessName;

  const textWidth = Math.max(180, shortName.length * 16);
  const totalWidth = textWidth + 56; // icon (40px) + gap (16px)

  // --- Full logo: icon + wordmark ---
  const iconShape = isRounded
    ? `<circle cx="20" cy="20" r="20" fill="${primaryColor}"/>`
    : isSharp
      ? `<rect width="40" height="40" fill="${primaryColor}"/>`
      : `<rect width="40" height="40" rx="${Math.min(rad, 10)}" fill="${primaryColor}"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} 44" width="${totalWidth}" height="44">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=${fontEncoded}:wght@700&amp;display=swap');
    .name { font-family: '${headingFont}', sans-serif; font-weight: 700; fill: ${primaryColor}; font-size: 20px; }
  </style>
  <g transform="translate(0,2)">
    ${iconShape}
    <g transform="translate(8,8) scale(1.5)">
      <path d="${iconPath}" fill="white" fill-rule="evenodd"/>
    </g>
  </g>
  <text x="56" y="28" class="name">${escapeXml(shortName)}</text>
</svg>`;

  // --- Compact logo: icon only ---
  const svgCompact = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  ${iconShape}
  <g transform="translate(8,8) scale(1.5)">
    <path d="${iconPath}" fill="white" fill-rule="evenodd"/>
  </g>
</svg>`;

  return {
    svg,
    svgCompact,
    type: "generated",
    dominantColors: [
      { hex: primaryColor, population: 60 },
      { hex: accentColor, population: 30 },
      { hex: "#ffffff", population: 10 },
    ],
  };
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
