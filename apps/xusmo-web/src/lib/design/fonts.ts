// =============================================================================
// Xusmo Typography — Distinctive Google Fonts pairing
// Display: Space Grotesk — geometric, modern, techy personality
// Body: DM Sans — clean, highly readable, professional
// =============================================================================

import { Space_Grotesk, DM_Sans } from "next/font/google";

export const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Combined class string for <html> or <body>
export const fontVariables = `${displayFont.variable} ${bodyFont.variable}`;
