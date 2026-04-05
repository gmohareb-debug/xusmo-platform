// =============================================================================
// Logo Color Extraction
// Uses sharp to extract dominant colors from logo images via histogram analysis.
// Usage: import { extractColorsFromImage } from "@/lib/logo/color-extract";
// =============================================================================

import sharp from "sharp";

interface DominantColor {
  hex: string;
  population: number;
}

export async function extractColorsFromImage(buffer: Buffer): Promise<DominantColor[]> {
  // Resize to small image for faster processing
  const { data } = await sharp(buffer)
    .resize(100, 100, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Simple color quantization — group pixels into buckets
  const colorMap = new Map<string, number>();

  for (let i = 0; i < data.length; i += 3) {
    const r = Math.round(data[i] / 32) * 32;
    const g = Math.round(data[i + 1] / 32) * 32;
    const b = Math.round(data[i + 2] / 32) * 32;
    const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
  }

  // Sort by frequency, take top 5
  const sorted = [...colorMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([hex, population]) => ({ hex, population }));

  // Filter out near-white and near-black
  const filtered = sorted.filter((c) => {
    const r = parseInt(c.hex.slice(1, 3), 16);
    const g = parseInt(c.hex.slice(3, 5), 16);
    const b = parseInt(c.hex.slice(5, 7), 16);
    const brightness = (r + g + b) / 3;
    return brightness > 30 && brightness < 230;
  });

  return filtered.length > 0 ? filtered : sorted.slice(0, 3);
}
