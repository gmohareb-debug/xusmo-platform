// =============================================================================
// 4-Layer Industry Classification
// Classifies user input through 4 layers:
//   1. Industry detection (keyword matching against IndustryDefault)
//   2. LLM fallback for ambiguous cases (Gemini Flash)
//   3. Feature requirements (from IndustryDefault.defaultFeatures)
//   4. Template recommendation (archetype + visual style)
// Usage: import { classifyBusiness } from "@/lib/classification/classify";
// =============================================================================

import { prisma } from "@/lib/db";
import { routeLLM } from "@/lib/llm/router";
import type { IndustryDefault } from "@prisma/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ClassificationResult {
  industry: {
    industryId: string;
    industryCode: string;
    displayName: string;
    confidence: number;
    alternatives: Array<{
      industryCode: string;
      displayName: string;
      confidence: number;
    }>;
  };
  archetype: {
    type: "SERVICE" | "VENUE" | "PORTFOLIO" | "COMMERCE";
    confidence: number;
  };
  features: string[];
  template: {
    templateFamily: string;
    styleVariant: string;
    complexityLevel: "simple" | "standard" | "complex";
  };
  // Smart design fields
  visualStyle: {
    primaryColors: string[];
    imageryThemes: string[];
    tone: string;
    fontPreference: string;
    layoutDensity: string;
  };
  requiredSections: string[];
  regulated: boolean;
  disclaimers: string[];
  needsReview?: boolean;
}

// ---------------------------------------------------------------------------
// In-memory cache for industry defaults (rarely change)
// ---------------------------------------------------------------------------

let cachedIndustries: IndustryDefault[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function loadIndustries(): Promise<IndustryDefault[]> {
  const now = Date.now();
  if (cachedIndustries && now - cacheTimestamp < CACHE_TTL) {
    return cachedIndustries;
  }
  cachedIndustries = await prisma.industryDefault.findMany();
  cacheTimestamp = now;
  return cachedIndustries;
}

// ---------------------------------------------------------------------------
// Tokenizer — splits input into lowercase tokens
// ---------------------------------------------------------------------------

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

// ---------------------------------------------------------------------------
// Scoring — matches tokens against industry keywords/metadata
// ---------------------------------------------------------------------------

interface ScoredIndustry {
  industry: IndustryDefault;
  score: number;
  maxPossible: number;
  confidence: number;
}

function scoreIndustry(tokens: string[], industry: IndustryDefault): ScoredIndustry {
  let score = 0;
  const inputText = tokens.join(" ");

  // Check keywords (highest weight — 2 points each)
  const keywords = industry.keywords as string[];
  for (const kw of keywords) {
    const kwLower = kw.toLowerCase();
    if (inputText.includes(kwLower)) {
      score += 2;
    } else {
      // Partial match: check if any token starts with the keyword or vice versa
      for (const token of tokens) {
        if (token.startsWith(kwLower) || kwLower.startsWith(token)) {
          score += 1;
          break;
        }
      }
    }
  }

  // Check displayName (3 points for full match)
  if (inputText.includes(industry.displayName.toLowerCase())) {
    score += 3;
  }

  // Check category (1 point)
  if (industry.category && inputText.includes(industry.category.toLowerCase())) {
    score += 1;
  }

  // Check subNiches (1.5 points each)
  const subNiches = industry.subNiches as string[];
  for (const niche of subNiches) {
    const nicheWords = niche.toLowerCase().replace(/_/g, " ");
    if (inputText.includes(nicheWords)) {
      score += 1.5;
    }
  }

  // Max possible = all keywords * 2 + displayName + category + all subNiches
  const maxPossible = keywords.length * 2 + 3 + 1 + subNiches.length * 1.5;
  const confidence = maxPossible > 0 ? Math.min(score / maxPossible, 1) : 0;

  return { industry, score, maxPossible, confidence };
}

// ---------------------------------------------------------------------------
// Template recommendation
// ---------------------------------------------------------------------------

function getComplexityLevel(features: string[]): "simple" | "standard" | "complex" {
  if (features.length <= 3) return "simple";
  if (features.length <= 6) return "standard";
  return "complex";
}

function getStyleVariant(industry: IndustryDefault): string {
  const tone = (industry.tone as string) ?? "professional";
  const density = (industry.layoutDensity as string) ?? "standard";
  return `${tone}-${density}`;
}

// ---------------------------------------------------------------------------
// LLM Classification Fallback (Gemini Flash)
// ---------------------------------------------------------------------------

async function classifyWithLLM(
  description: string,
  industries: IndustryDefault[]
): Promise<ClassificationResult | null> {
  const industryList = industries
    .map((i) => `${i.industryCode}: ${i.displayName}`)
    .join("\n");

  const prompt = `Classify this business into one of these industries:
${industryList}

Business description: "${description}"

Respond with ONLY a JSON object:
{"industryCode": "...", "confidence": 0.0-1.0, "archetype": "SERVICE|VENUE|PORTFOLIO|COMMERCE", "alternatives": [{"industryCode": "...", "confidence": 0.0-1.0}]}`;

  const response = await routeLLM(
    "classify",
    prompt,
    "You are a business classification expert. Respond with valid JSON only."
  );

  if (!response) return null;

  try {
    // Extract JSON from response (handle possible markdown code blocks)
    const jsonStr = response.text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    const parsed = JSON.parse(jsonStr) as {
      industryCode: string;
      confidence: number;
      archetype: string;
      alternatives?: Array<{ industryCode: string; confidence: number }>;
    };

    // Look up the matched industry
    const matched = industries.find(
      (i) => i.industryCode === parsed.industryCode
    );
    if (!matched) return null;

    const features = matched.defaultFeatures as string[];
    const archetype = parsed.archetype as
      | "SERVICE"
      | "VENUE"
      | "PORTFOLIO"
      | "COMMERCE";

    // Build alternatives
    const alternatives = (parsed.alternatives ?? [])
      .map((alt) => {
        const altIndustry = industries.find(
          (i) => i.industryCode === alt.industryCode
        );
        return altIndustry
          ? {
              industryCode: alt.industryCode,
              displayName: altIndustry.displayName,
              confidence: alt.confidence,
            }
          : null;
      })
      .filter((a): a is NonNullable<typeof a> => a !== null);

    // Populate smart design fields from IndustryDefault
    const visualStyle = {
      primaryColors: (matched.primaryColors as string[] | null) ?? ["#1e40af", "#ffffff", "#64748b"],
      imageryThemes: (matched.imageryThemes as string[] | null) ?? [],
      tone: matched.tone ?? "professional",
      fontPreference: matched.fontPreference ?? "clean sans-serif",
      layoutDensity: matched.layoutDensity ?? "moderate",
    };

    const requiredSections = (matched.requiredSections as string[] | null) ?? [];
    const regulated = matched.isRegulated;
    const disclaimers = (matched.defaultDisclaimers as string[] | null) ?? [];

    return {
      industry: {
        industryId: matched.id,
        industryCode: matched.industryCode,
        displayName: matched.displayName,
        confidence: Math.round(parsed.confidence * 100) / 100,
        alternatives,
      },
      archetype: {
        type: archetype,
        confidence: parsed.confidence >= 0.7 ? 0.95 : 0.8,
      },
      features,
      template: {
        templateFamily: archetype.toLowerCase(),
        styleVariant: getStyleVariant(matched),
        complexityLevel: getComplexityLevel(features),
      },
      visualStyle,
      requiredSections,
      regulated,
      disclaimers,
    };
  } catch (err) {
    console.error("[classify] Failed to parse LLM response:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main classification function
// ---------------------------------------------------------------------------

export async function classifyBusiness(
  description: string
): Promise<ClassificationResult | null> {
  const industries = await loadIndustries();
  const tokens = tokenize(description);

  if (tokens.length === 0) return null;

  // Score all industries via keyword matching
  const scored = industries
    .map((ind) => scoreIndustry(tokens, ind))
    .sort((a, b) => b.confidence - a.confidence);

  const best = scored[0];

  // High confidence keyword match — use it directly
  if (best && best.confidence >= 0.6) {
    const features = best.industry.defaultFeatures as string[];
    const archetype = best.industry.archetype as
      | "SERVICE"
      | "VENUE"
      | "PORTFOLIO"
      | "COMMERCE";

    const alternatives = scored
      .slice(1, 4)
      .filter((s) => s.confidence > 0.1)
      .map((s) => ({
        industryCode: s.industry.industryCode,
        displayName: s.industry.displayName,
        confidence: Math.round(s.confidence * 100) / 100,
      }));

    // Populate smart design fields from IndustryDefault
    const visualStyle = {
      primaryColors: (best.industry.primaryColors as string[] | null) ?? ["#1e40af", "#ffffff", "#64748b"],
      imageryThemes: (best.industry.imageryThemes as string[] | null) ?? [],
      tone: best.industry.tone ?? "professional",
      fontPreference: best.industry.fontPreference ?? "clean sans-serif",
      layoutDensity: best.industry.layoutDensity ?? "moderate",
    };

    const requiredSections = (best.industry.requiredSections as string[] | null) ?? [];
    const regulated = best.industry.isRegulated;
    const disclaimers = (best.industry.defaultDisclaimers as string[] | null) ?? [];

    return {
      industry: {
        industryId: best.industry.id,
        industryCode: best.industry.industryCode,
        displayName: best.industry.displayName,
        confidence: Math.round(best.confidence * 100) / 100,
        alternatives,
      },
      archetype: {
        type: archetype,
        confidence: best.confidence >= 0.5 ? 0.95 : 0.8,
      },
      features,
      template: {
        templateFamily: archetype.toLowerCase(),
        styleVariant: getStyleVariant(best.industry),
        complexityLevel: getComplexityLevel(features),
      },
      visualStyle,
      requiredSections,
      regulated,
      disclaimers,
    };
  }

  // Low confidence (< 0.6) — try LLM classification
  console.log(
    `[classify] Keyword confidence ${best?.confidence.toFixed(2) ?? 0} < 0.6, trying LLM...`
  );
  const llmResult = await classifyWithLLM(description, industries);
  if (llmResult) return llmResult;

  // LLM also failed — fall back to best keyword match if above 0.3
  if (best && best.confidence >= 0.3) {
    const features = best.industry.defaultFeatures as string[];
    const archetype = best.industry.archetype as
      | "SERVICE"
      | "VENUE"
      | "PORTFOLIO"
      | "COMMERCE";

    const alternatives = scored
      .slice(1, 4)
      .filter((s) => s.confidence > 0.1)
      .map((s) => ({
        industryCode: s.industry.industryCode,
        displayName: s.industry.displayName,
        confidence: Math.round(s.confidence * 100) / 100,
      }));

    // Populate smart design fields from IndustryDefault
    const visualStyle = {
      primaryColors: (best.industry.primaryColors as string[] | null) ?? ["#1e40af", "#ffffff", "#64748b"],
      imageryThemes: (best.industry.imageryThemes as string[] | null) ?? [],
      tone: best.industry.tone ?? "professional",
      fontPreference: best.industry.fontPreference ?? "clean sans-serif",
      layoutDensity: best.industry.layoutDensity ?? "moderate",
    };

    const requiredSections = (best.industry.requiredSections as string[] | null) ?? [];
    const regulated = best.industry.isRegulated;
    const disclaimers = (best.industry.defaultDisclaimers as string[] | null) ?? [];

    return {
      industry: {
        industryId: best.industry.id,
        industryCode: best.industry.industryCode,
        displayName: best.industry.displayName,
        confidence: Math.round(best.confidence * 100) / 100,
        alternatives,
      },
      archetype: {
        type: archetype,
        confidence: 0.7,
      },
      features,
      template: {
        templateFamily: archetype.toLowerCase(),
        styleVariant: getStyleVariant(best.industry),
        complexityLevel: getComplexityLevel(features),
      },
      visualStyle,
      requiredSections,
      regulated,
      disclaimers,
      needsReview: true,
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Helper — get full IndustryDefault by code
// ---------------------------------------------------------------------------

export async function getIndustryDefaults(
  industryCode: string
): Promise<IndustryDefault | null> {
  const industries = await loadIndustries();
  return industries.find((i) => i.industryCode === industryCode) ?? null;
}
