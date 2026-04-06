// =============================================================================
// Knowledge Engine — The Learning Core of Xusmo
//
// Goal: After enough sites are built, the system generates new sites from
// accumulated knowledge with minimal or zero LLM calls.
//
// Flow:
//   1. User prompt → normalize → generate embedding
//   2. Search knowledge base for similar blueprints (cosine similarity)
//   3. Cache HIT (similarity > 0.92) → Validator Agent applies delta
//   4. Cache MISS → Full generation → Store blueprint + embedding
//   5. Every result accumulates knowledge for future lookups
//
// Architecture:
//   - PostgreSQL: blueprint storage (JSON), metadata, versions
//   - Redis: exact-match cache (hash of normalized prompt)
//   - In-memory: embedding store (upgradeable to PGVector later)
//   - Gemini Flash: lightweight validation + delta detection
// =============================================================================

import { prisma } from "@/lib/db";
import { geminiFlash } from "@/lib/llm/gemini";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StoredBlueprint {
  id: string;
  normalizedPrompt: string;
  industry: string;
  archetype: string;
  personality: string;
  services: string[];
  embedding: number[];          // 128-dim normalized vector
  designDocument: unknown;       // Full site JSON
  theme: unknown;
  pageCount: number;
  sectionCount: number;
  componentList: string[];
  version: number;
  usageCount: number;
  avgRating: number;
  createdAt: Date;
}

interface SimilarityResult {
  blueprint: StoredBlueprint;
  score: number;               // 0-1 cosine similarity
  exactMatch: boolean;
}

interface DeltaResult {
  isValid: boolean;
  confidence: number;
  differences: string[];
  suggestedDelta: Record<string, unknown>;
  llmSkipped: boolean;          // true if served entirely from cache
}

// ---------------------------------------------------------------------------
// Knowledge Store — In-memory (upgradeable to PGVector)
// ---------------------------------------------------------------------------

const blueprintStore: StoredBlueprint[] = [];
const MAX_BLUEPRINTS = 5000;
const SIMILARITY_THRESHOLD = 0.88;  // Lower than 0.92 to be more aggressive about reuse
const HIGH_CONFIDENCE_THRESHOLD = 0.95;

// Redis for exact match
let redis: import("ioredis").Redis | null = null;
try {
  const { default: Redis } = require("ioredis");
  redis = new Redis(process.env.REDIS_URL || "redis://localhost:6380", {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    connectTimeout: 3000,
  });
  redis.connect().catch(() => { redis = null; });
} catch { redis = null; }

// Stats
const stats = {
  totalLookups: 0,
  exactHits: 0,
  semanticHits: 0,
  misses: 0,
  deltaApplied: 0,
  fullGeneration: 0,
  llmCallsSaved: 0,
  totalBlueprintsStored: 0,
};

export function getKnowledgeStats() {
  return { ...stats, blueprintsInMemory: blueprintStore.length };
}

// ---------------------------------------------------------------------------
// 1. NORMALIZE PROMPT — Extract structured entities from free text
// ---------------------------------------------------------------------------

function normalizePrompt(prompt: string, industry?: string, archetype?: string): string {
  // Remove filler words, normalize case, extract key entities
  const normalized = prompt
    .toLowerCase()
    .replace(/\b(please|can you|i want|i need|make me|build me|create|generate)\b/gi, "")
    .replace(/\b(a|an|the|for|with|and|or|but|in|on|at|to|my|our)\b/gi, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Append structured context for better matching
  const parts = [normalized];
  if (industry) parts.push(`industry:${industry.toLowerCase()}`);
  if (archetype) parts.push(`archetype:${archetype.toLowerCase()}`);

  return parts.join(" | ");
}

// ---------------------------------------------------------------------------
// 2. EMBEDDING — Simple but effective text embedding (no external API needed)
// Uses TF-IDF-like bag-of-words with dimension reduction
// Upgradeable to OpenAI/Gemini embeddings later
// ---------------------------------------------------------------------------

const VOCAB_SIZE = 128;
const vocabMap = new Map<string, number>();
let vocabCounter = 0;

function getVocabIndex(word: string): number {
  if (vocabMap.has(word)) return vocabMap.get(word)!;
  const idx = vocabCounter % VOCAB_SIZE;
  vocabMap.set(word, idx);
  vocabCounter++;
  return idx;
}

function generateEmbedding(text: string): number[] {
  const vector = new Float64Array(VOCAB_SIZE);
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  for (const word of words) {
    const idx = getVocabIndex(word);
    vector[idx] += 1;
  }

  // L2 normalize
  let norm = 0;
  for (let i = 0; i < VOCAB_SIZE; i++) norm += vector[i] * vector[i];
  norm = Math.sqrt(norm) || 1;
  const result: number[] = [];
  for (let i = 0; i < VOCAB_SIZE; i++) result.push(vector[i] / norm);

  return result;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i];
  }
  return dot; // Vectors are already normalized, so dot product = cosine similarity
}

// ---------------------------------------------------------------------------
// 3. LOOKUP — Find similar blueprints
// ---------------------------------------------------------------------------

export async function findSimilarBlueprint(
  prompt: string,
  industry?: string,
  archetype?: string
): Promise<SimilarityResult | null> {
  stats.totalLookups++;
  const normalized = normalizePrompt(prompt, industry, archetype);

  // Step 1: Exact match in Redis
  if (redis) {
    try {
      const exactKey = `kb:exact:${hashString(normalized)}`;
      const cached = await redis.get(exactKey);
      if (cached) {
        const blueprint = JSON.parse(cached) as StoredBlueprint;
        stats.exactHits++;
        console.log(`[Knowledge] EXACT HIT for "${industry}" (${blueprint.id})`);
        return { blueprint, score: 1.0, exactMatch: true };
      }
    } catch { /* fall through */ }
  }

  // Step 2: Semantic search in memory
  const queryEmbedding = generateEmbedding(normalized);
  let bestMatch: StoredBlueprint | null = null;
  let bestScore = 0;

  for (const bp of blueprintStore) {
    // Pre-filter by industry for speed
    if (industry && bp.industry !== industry.toLowerCase() && bestScore > 0.5) continue;

    const score = cosineSimilarity(queryEmbedding, bp.embedding);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = bp;
    }
  }

  if (bestMatch && bestScore >= SIMILARITY_THRESHOLD) {
    stats.semanticHits++;
    console.log(`[Knowledge] SEMANTIC HIT: score=${bestScore.toFixed(3)} for "${industry}" → "${bestMatch.id}"`);
    return { blueprint: bestMatch, score: bestScore, exactMatch: false };
  }

  stats.misses++;
  console.log(`[Knowledge] MISS for "${industry}" (best score: ${bestScore.toFixed(3)}, need ${SIMILARITY_THRESHOLD})`);
  return null;
}

// ---------------------------------------------------------------------------
// 4. VALIDATOR AGENT — Detect & apply differences (cheap LLM call)
// ---------------------------------------------------------------------------

const VALIDATOR_PROMPT = `You are a blueprint validator. Compare a stored website blueprint with a new request and determine if the stored blueprint can be reused with small modifications.

Return ONLY JSON:
{
  "isValid": true/false,
  "confidence": 0.0-1.0,
  "differences": ["list of specific changes needed"],
  "suggestedDelta": {
    "theme": { "colors": { "accent": "#new_color" } },
    "businessName": "New Business Name",
    "pages": { "add": [], "remove": [], "modify": {} }
  }
}

Rules:
- isValid=true if >80% of the blueprint can be reused
- List ONLY actual differences (business name, colors, specific content)
- suggestedDelta should be a minimal JSON patch — only changed fields
- confidence=0.95+ if only business name and colors differ
- confidence<0.5 if the industries are very different`;

export async function validateAndApplyDelta(
  stored: StoredBlueprint,
  newPrompt: string,
  newIndustry: string,
  newBusinessName: string
): Promise<DeltaResult> {
  // If exact match, skip LLM entirely
  if (stored.industry === newIndustry.toLowerCase()) {
    // Same industry — very high reuse potential
    const simpleChanges = detectObviousChanges(stored, newBusinessName);
    if (simpleChanges.length <= 3) {
      stats.deltaApplied++;
      stats.llmCallsSaved++;
      console.log(`[Knowledge] SKIP LLM — applying ${simpleChanges.length} obvious changes`);
      return {
        isValid: true,
        confidence: 0.98,
        differences: simpleChanges,
        suggestedDelta: buildSimpleDelta(stored, newBusinessName),
        llmSkipped: true,
      };
    }
  }

  // Call lightweight Validator Agent
  const storedSummary = {
    industry: stored.industry,
    archetype: stored.archetype,
    personality: stored.personality,
    services: stored.services,
    pageCount: stored.pageCount,
    componentList: stored.componentList.slice(0, 15),
  };

  const result = await geminiFlash(
    `Stored blueprint:\n${JSON.stringify(storedSummary, null, 2)}\n\nNew request:\nBusiness: "${newBusinessName}" (${newIndustry})\nPrompt: ${newPrompt}`,
    VALIDATOR_PROMPT,
    { agentName: "validator" }
  );

  if (!result?.text) {
    return { isValid: false, confidence: 0, differences: ["LLM validation failed"], suggestedDelta: {}, llmSkipped: false };
  }

  try {
    let cleaned = result.text.trim();
    if (cleaned.startsWith("```")) cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(cleaned);

    if (parsed.isValid) stats.deltaApplied++;

    return {
      isValid: parsed.isValid ?? false,
      confidence: parsed.confidence ?? 0.5,
      differences: parsed.differences ?? [],
      suggestedDelta: parsed.suggestedDelta ?? {},
      llmSkipped: false,
    };
  } catch {
    return { isValid: false, confidence: 0, differences: ["Failed to parse validation"], suggestedDelta: {}, llmSkipped: false };
  }
}

// ---------------------------------------------------------------------------
// 5. DELTA APPLICATION — Apply changes to stored blueprint
// ---------------------------------------------------------------------------

export function applyDelta(
  storedDoc: Record<string, unknown>,
  delta: Record<string, unknown>,
  newBusinessName: string
): Record<string, unknown> {
  const result = JSON.parse(JSON.stringify(storedDoc)); // Deep clone

  // Always update business name everywhere
  replaceInObject(result, storedDoc._originalBusinessName as string || "", newBusinessName);

  // Apply theme changes
  if (delta.theme && result.theme) {
    const theme = result.theme as Record<string, unknown>;
    const deltaTheme = delta.theme as Record<string, unknown>;
    if (deltaTheme.colors) {
      theme.colors = { ...(theme.colors as Record<string, string>), ...(deltaTheme.colors as Record<string, string>) };
    }
    if (deltaTheme.fonts) {
      theme.fonts = { ...(theme.fonts as Record<string, string>), ...(deltaTheme.fonts as Record<string, string>) };
    }
  }

  // Apply page modifications
  if (delta.pages) {
    const pages = result.pages as Record<string, unknown>;
    const deltaPages = delta.pages as Record<string, unknown>;
    if (deltaPages.modify) {
      for (const [slug, changes] of Object.entries(deltaPages.modify as Record<string, unknown>)) {
        if (pages[slug]) {
          Object.assign(pages[slug] as Record<string, unknown>, changes as Record<string, unknown>);
        }
      }
    }
  }

  return result;
}

function replaceInObject(obj: unknown, oldStr: string, newStr: string): void {
  if (!oldStr || !obj || typeof obj !== "object") return;
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    if (typeof val === "string" && val.includes(oldStr)) {
      (obj as Record<string, string>)[key] = val.replace(new RegExp(escapeRegex(oldStr), "gi"), newStr);
    } else if (typeof val === "object" && val) {
      replaceInObject(val, oldStr, newStr);
    }
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---------------------------------------------------------------------------
// 6. STORE — Save blueprint to knowledge base
// ---------------------------------------------------------------------------

export async function storeBlueprint(
  prompt: string,
  industry: string,
  archetype: string,
  businessName: string,
  designDocument: unknown,
  personality?: string
): Promise<string> {
  const normalized = normalizePrompt(prompt, industry, archetype);
  const embedding = generateEmbedding(normalized);
  const doc = designDocument as Record<string, unknown>;
  const theme = doc?.theme as Record<string, unknown> | undefined;
  const pages = doc?.pages as Record<string, unknown> | undefined;

  // Count sections and components
  let sectionCount = 0;
  const componentSet = new Set<string>();
  const services: string[] = [];

  if (pages) {
    for (const page of Object.values(pages)) {
      const sections = ((page as Record<string, unknown>).sections as unknown[]) || [];
      sectionCount += sections.length;
      for (const s of sections) {
        const comp = (s as Record<string, string>).component;
        if (comp) componentSet.add(comp);
      }
    }
  }

  const id = `kb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const blueprint: StoredBlueprint = {
    id,
    normalizedPrompt: normalized,
    industry: industry.toLowerCase(),
    archetype: archetype.toLowerCase(),
    personality: personality || "default",
    services,
    embedding,
    designDocument,
    theme,
    pageCount: pages ? Object.keys(pages).length : 0,
    sectionCount,
    componentList: Array.from(componentSet),
    version: 1,
    usageCount: 0,
    avgRating: 0,
    createdAt: new Date(),
  };

  // Store in memory
  blueprintStore.push(blueprint);
  if (blueprintStore.length > MAX_BLUEPRINTS) blueprintStore.shift();

  // Store in Redis for exact match
  if (redis) {
    try {
      const exactKey = `kb:exact:${hashString(normalized)}`;
      await redis.setex(exactKey, 30 * 24 * 3600, JSON.stringify(blueprint)); // 30 days
    } catch { /* non-critical */ }
  }

  // Store metadata in DB (designDocument._knowledge)
  try {
    // Find the site by checking recent sites
    const recentSite = await prisma.site.findFirst({
      where: { businessName: { contains: businessName.split(" ")[0] } },
      orderBy: { createdAt: "desc" },
      select: { id: true, designDocument: true },
    });
    if (recentSite) {
      const existingDoc = (recentSite.designDocument as Record<string, unknown>) || {};
      existingDoc._knowledge = {
        blueprintId: id,
        normalized: normalized.slice(0, 200),
        industry: industry.toLowerCase(),
        similarity_searchable: true,
        storedAt: new Date().toISOString(),
      };
      // Store original business name for future delta application
      existingDoc._originalBusinessName = businessName;
      await prisma.site.update({ where: { id: recentSite.id }, data: { designDocument: existingDoc } });
    }
  } catch { /* non-critical */ }

  stats.totalBlueprintsStored++;
  console.log(`[Knowledge] Stored blueprint ${id}: ${industry} / ${archetype} (${sectionCount} sections, ${componentSet.size} components)`);

  return id;
}

// ---------------------------------------------------------------------------
// 7. MAIN ENTRY POINT — Check knowledge before generating
// ---------------------------------------------------------------------------

export interface KnowledgeLookupResult {
  found: boolean;
  blueprint?: StoredBlueprint;
  delta?: DeltaResult;
  designDocument?: Record<string, unknown>;
  source: "exact_cache" | "semantic_match" | "delta_applied" | "full_generation";
  llmCallsSaved: number;
}

/**
 * Main entry point — check knowledge base before triggering full generation.
 * Returns a result indicating whether the knowledge base can handle this request.
 */
export async function checkKnowledgeBase(
  prompt: string,
  industry: string,
  archetype: string,
  businessName: string
): Promise<KnowledgeLookupResult> {
  // Step 1: Find similar blueprint
  const match = await findSimilarBlueprint(prompt, industry, archetype);

  if (!match) {
    stats.fullGeneration++;
    return { found: false, source: "full_generation", llmCallsSaved: 0 };
  }

  // Step 2: Validate and compute delta
  const delta = await validateAndApplyDelta(match.blueprint, prompt, industry, businessName);

  if (!delta.isValid || delta.confidence < 0.6) {
    stats.fullGeneration++;
    console.log(`[Knowledge] Delta rejected: confidence=${delta.confidence}, differences=${delta.differences.length}`);
    return { found: false, source: "full_generation", llmCallsSaved: 0 };
  }

  // Step 3: Apply delta to stored blueprint
  const storedDoc = match.blueprint.designDocument as Record<string, unknown>;
  const newDoc = applyDelta(storedDoc, delta.suggestedDelta, businessName);

  // Track reuse
  match.blueprint.usageCount++;

  const saved = delta.llmSkipped ? 3 : 2; // 3 LLM calls saved if no validation needed, 2 if only validation
  stats.llmCallsSaved += saved;

  console.log(`[Knowledge] REUSE: ${match.exactMatch ? "exact" : "semantic"} match (score=${match.score.toFixed(3)}) → ${delta.differences.length} changes applied, ${saved} LLM calls saved`);

  return {
    found: true,
    blueprint: match.blueprint,
    delta,
    designDocument: newDoc,
    source: match.exactMatch ? "exact_cache" : delta.llmSkipped ? "delta_applied" : "semantic_match",
    llmCallsSaved: saved,
  };
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function hashString(s: string): string {
  let hash = 5381;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) + hash + s.charCodeAt(i)) & 0x7fffffff;
  }
  return hash.toString(36);
}

function detectObviousChanges(stored: StoredBlueprint, newBusinessName: string): string[] {
  const changes: string[] = [];
  changes.push(`Replace business name with "${newBusinessName}"`);
  // Same industry = same structure, just different business
  return changes;
}

function buildSimpleDelta(stored: StoredBlueprint, newBusinessName: string): Record<string, unknown> {
  return {
    businessName: newBusinessName,
    // Theme stays the same for same industry
  };
}

// ---------------------------------------------------------------------------
// LOAD FROM DB — Bootstrap knowledge from existing sites on startup
// ---------------------------------------------------------------------------

let bootstrapped = false;

export async function bootstrapKnowledge(): Promise<number> {
  if (bootstrapped) return blueprintStore.length;

  try {
    const sites = await prisma.site.findMany({
      where: { designDocument: { not: null } },
      select: {
        id: true,
        businessName: true,
        designDocument: true,
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    for (const site of sites) {
      const doc = site.designDocument as Record<string, unknown>;
      if (!doc?.pages || !doc?.theme) continue;

      const knowledge = doc._knowledge as Record<string, unknown> | undefined;
      const industry = (knowledge?.industry as string) || "unknown";
      const archetype = ((doc.theme as Record<string, unknown>)?.name as string) || "default";

      const normalized = normalizePrompt(
        `${site.businessName} ${industry}`,
        industry,
        archetype
      );
      const embedding = generateEmbedding(normalized);

      let sectionCount = 0;
      const componentSet = new Set<string>();
      for (const page of Object.values(doc.pages as Record<string, unknown>)) {
        const sections = ((page as Record<string, unknown>).sections as unknown[]) || [];
        sectionCount += sections.length;
        for (const s of sections) {
          const comp = (s as Record<string, string>).component;
          if (comp) componentSet.add(comp);
        }
      }

      blueprintStore.push({
        id: (knowledge?.blueprintId as string) || site.id,
        normalizedPrompt: normalized,
        industry,
        archetype,
        personality: archetype,
        services: [],
        embedding,
        designDocument: doc,
        theme: doc.theme,
        pageCount: Object.keys(doc.pages as Record<string, unknown>).length,
        sectionCount,
        componentList: Array.from(componentSet),
        version: 1,
        usageCount: 0,
        avgRating: 0,
        createdAt: new Date(),
      });
    }

    bootstrapped = true;
    console.log(`[Knowledge] Bootstrapped ${blueprintStore.length} blueprints from ${sites.length} existing sites`);
    return blueprintStore.length;
  } catch (err) {
    console.warn("[Knowledge] Bootstrap failed:", err);
    return 0;
  }
}
