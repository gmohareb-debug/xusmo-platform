// =============================================================================
// Theme Matching from Logo Colors
// Scores theme pool entries against extracted logo colors using Euclidean
// distance in RGB space. Returns top 5 matches sorted by score.
// Usage: import { matchThemeToColors } from "@/lib/logo/color-match";
// =============================================================================

import { prisma } from "@/lib/db";

interface MatchResult {
  themeId: string;
  themeName: string;
  score: number;
  colors: Record<string, string>;
}

export async function matchThemeToColors(
  dominantColors: { hex: string; population: number }[]
): Promise<MatchResult[]> {
  if (!dominantColors.length) return [];

  const themes = await prisma.themePoolEntry.findMany({
    where: { status: "active" },
    select: { id: true, name: true, colors: true },
  });

  const logoColors = dominantColors.map((c) => hexToRgb(c.hex));

  const scored = themes.map((theme) => {
    const themeColors = theme.colors as Record<string, string>;
    const primary = hexToRgb(themeColors.primary);
    const accent = hexToRgb(themeColors.accent);

    // Calculate min color distance between logo colors and theme primary/accent
    let minDist = Infinity;
    for (const lc of logoColors) {
      const distP = colorDistance(lc, primary);
      const distA = colorDistance(lc, accent);
      minDist = Math.min(minDist, distP, distA);
    }

    return {
      themeId: theme.id,
      themeName: theme.name,
      score: Math.max(0, 100 - minDist),
      colors: themeColors,
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, 5);
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function colorDistance(
  a: [number, number, number],
  b: [number, number, number]
): number {
  return Math.sqrt(
    Math.pow(a[0] - b[0], 2) +
      Math.pow(a[1] - b[1], 2) +
      Math.pow(a[2] - b[2], 2)
  );
}
