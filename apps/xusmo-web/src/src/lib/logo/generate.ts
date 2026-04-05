// =============================================================================
// Text Logo Generator
// Generates simple SVG text logos from a business name and brand colors.
// Abbreviates long names to initials. Uses Google Fonts for web-safe rendering.
// Usage: import { generateTextLogo } from "@/lib/logo/generate";
// =============================================================================

export interface GeneratedLogo {
  svg: string;
  type: "text";
}

export function generateTextLogo(
  businessName: string,
  primaryColor: string = "#1e40af",
  fontFamily: string = "Inter"
): GeneratedLogo {
  // Abbreviate if name is too long
  const displayName =
    businessName.length > 20
      ? businessName
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
      : businessName;

  const width = Math.max(200, displayName.length * 20);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 60" width="${width}" height="60">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@700&amp;display=swap');
    .logo-text { font-family: '${fontFamily}', sans-serif; font-weight: 700; fill: ${primaryColor}; }
  </style>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" class="logo-text" font-size="28">${escapeXml(displayName)}</text>
</svg>`;

  return { svg, type: "text" };
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
