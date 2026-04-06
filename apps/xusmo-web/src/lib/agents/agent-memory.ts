// =============================================================================
// Agent Memory System — Persistent memory, prompt caching, personality
// Shared infrastructure for all 20 agents.
// =============================================================================

import { prisma } from "@/lib/db";

// ---------------------------------------------------------------------------
// 1. PROMPT CACHE — Avoid redundant LLM calls
// Uses Redis if available, falls back to in-memory LRU
// ---------------------------------------------------------------------------

const promptCache = new Map<string, { result: string; ts: number; tokens: number }>();
const PROMPT_CACHE_TTL = 60 * 60 * 1000; // 1 hour for in-memory
const MAX_PROMPT_CACHE = 1000;

let redis: import("ioredis").Redis | null = null;
try {
  // Lazy import — don't fail if Redis isn't available
  const { default: Redis } = require("ioredis");
  redis = new Redis(process.env.REDIS_URL || "redis://localhost:6380", {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    connectTimeout: 3000,
  });
  redis.connect().catch(() => { redis = null; });
} catch { redis = null; }

function hashPrompt(systemPrompt: string, userPrompt: string): string {
  // Simple hash — djb2 algorithm
  let hash = 5381;
  const str = `${systemPrompt.slice(0, 200)}|${userPrompt}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0x7fffffff;
  }
  return `llm:${hash.toString(36)}`;
}

export async function getCachedLLMResponse(systemPrompt: string, userPrompt: string): Promise<string | null> {
  const key = hashPrompt(systemPrompt, userPrompt);

  // Try Redis first
  if (redis) {
    try {
      const cached = await redis.get(key);
      if (cached) {
        console.log("[AgentMemory] Redis cache hit");
        return cached;
      }
    } catch { /* fall through */ }
  }

  // Fall back to in-memory
  const entry = promptCache.get(key);
  if (entry && Date.now() - entry.ts < PROMPT_CACHE_TTL) {
    console.log("[AgentMemory] Memory cache hit");
    return entry.result;
  }
  if (entry) promptCache.delete(key);
  return null;
}

export async function setCachedLLMResponse(systemPrompt: string, userPrompt: string, result: string, tokens = 0): Promise<void> {
  const key = hashPrompt(systemPrompt, userPrompt);

  // Redis — 24h TTL
  if (redis) {
    try {
      await redis.setex(key, 86400, result);
    } catch { /* fall through */ }
  }

  // In-memory — 1h TTL
  if (promptCache.size > MAX_PROMPT_CACHE) {
    const oldest = promptCache.keys().next().value;
    if (oldest) promptCache.delete(oldest);
  }
  promptCache.set(key, { result, ts: Date.now(), tokens });
}

// ---------------------------------------------------------------------------
// 2. AGENT MEMORY — Per-site persistent knowledge
// Stores what the agent learned about a specific site/business
// ---------------------------------------------------------------------------

interface MemoryEntry {
  key: string;
  value: unknown;
  agent: string;
  createdAt: Date;
}

// In-memory store keyed by siteId (persisted to DB on write)
const siteMemory = new Map<string, Map<string, MemoryEntry>>();

export async function getAgentMemory(siteId: string, agent: string, key: string): Promise<unknown | null> {
  const siteMap = siteMemory.get(siteId);
  const fullKey = `${agent}:${key}`;
  if (siteMap?.has(fullKey)) return siteMap.get(fullKey)!.value;

  // Try DB — store in designDocument._agentMemory
  try {
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { designDocument: true },
    });
    const doc = site?.designDocument as Record<string, unknown> | null;
    const memory = doc?._agentMemory as Record<string, unknown> | undefined;
    if (memory?.[fullKey] !== undefined) {
      // Cache in-memory
      if (!siteMemory.has(siteId)) siteMemory.set(siteId, new Map());
      siteMemory.get(siteId)!.set(fullKey, {
        key, value: memory[fullKey], agent, createdAt: new Date(),
      });
      return memory[fullKey];
    }
  } catch { /* non-critical */ }

  return null;
}

export async function setAgentMemory(siteId: string, agent: string, key: string, value: unknown): Promise<void> {
  const fullKey = `${agent}:${key}`;

  // Cache in-memory
  if (!siteMemory.has(siteId)) siteMemory.set(siteId, new Map());
  siteMemory.get(siteId)!.set(fullKey, { key, value, agent, createdAt: new Date() });

  // Persist to DB in designDocument._agentMemory
  try {
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { designDocument: true },
    });
    const doc = (site?.designDocument as Record<string, unknown>) || {};
    const memory = (doc._agentMemory as Record<string, unknown>) || {};
    memory[fullKey] = value;
    doc._agentMemory = memory;
    await prisma.site.update({
      where: { id: siteId },
      data: { designDocument: doc },
    });
  } catch { /* non-critical */ }
}

export async function getAllAgentMemory(siteId: string, agent?: string): Promise<Record<string, unknown>> {
  try {
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { designDocument: true },
    });
    const doc = site?.designDocument as Record<string, unknown> | null;
    const memory = (doc?._agentMemory as Record<string, unknown>) || {};
    if (!agent) return memory;
    // Filter by agent prefix
    const filtered: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(memory)) {
      if (k.startsWith(`${agent}:`)) filtered[k.replace(`${agent}:`, "")] = v;
    }
    return filtered;
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------------------
// 3. CONVERSATION HISTORY — Per-session, persisted
// ---------------------------------------------------------------------------

const conversationStore = new Map<string, { role: "user" | "assistant"; text: string; ts: number }[]>();
const MAX_HISTORY_PER_SITE = 50;

export function addToConversation(siteId: string, role: "user" | "assistant", text: string): void {
  if (!conversationStore.has(siteId)) conversationStore.set(siteId, []);
  const history = conversationStore.get(siteId)!;
  history.push({ role, text: text.slice(0, 500), ts: Date.now() });
  // Keep last 50 messages
  if (history.length > MAX_HISTORY_PER_SITE) history.splice(0, history.length - MAX_HISTORY_PER_SITE);
}

export function getConversationHistory(siteId: string, limit = 10): { role: "user" | "assistant"; text: string }[] {
  const history = conversationStore.get(siteId) || [];
  return history.slice(-limit).map(({ role, text }) => ({ role, text }));
}

// ---------------------------------------------------------------------------
// 4. PERSONALITY SYSTEM — Each agent has a persona
// ---------------------------------------------------------------------------

export interface AgentPersonality {
  name: string;
  role: string;
  tone: string;
  expertise: string[];
  rules: string[];
}

const PERSONALITIES: Record<string, AgentPersonality> = {
  router: {
    name: "Atlas",
    role: "Request Dispatcher",
    tone: "decisive and efficient",
    expertise: ["intent classification", "task routing", "priority assessment"],
    rules: [
      "Classify quickly — don't overthink simple requests",
      "When uncertain, route to editor (it handles most things)",
      "Always consider secondary agents for multi-step tasks",
    ],
  },
  builder: {
    name: "Forge",
    role: "Website Architect",
    tone: "creative and thorough",
    expertise: ["site structure", "component selection", "visual design", "content strategy"],
    rules: [
      "Every site must feel unique — vary layouts, components, and color palettes",
      "Match the business personality — a law firm and a kids party venue should look nothing alike",
      "Always generate rich content — no placeholder text, no generic descriptions",
    ],
  },
  editor: {
    name: "Refine",
    role: "Design Editor",
    tone: "precise and helpful",
    expertise: ["layout adjustment", "content editing", "theme customization", "UX improvement"],
    rules: [
      "Keep changes minimal and targeted — don't redesign the whole site for a text change",
      "Respect the existing design language — don't introduce clashing styles",
      "Always update BOTH the designDocument and the database",
    ],
  },
  seo: {
    name: "Beacon",
    role: "SEO Strategist",
    tone: "analytical and data-driven",
    expertise: ["keyword research", "meta optimization", "schema markup", "content gaps"],
    rules: [
      "Every page needs a unique target keyword — no keyword cannibalization",
      "Meta titles under 60 chars, descriptions under 160 chars",
      "Local businesses MUST have location in their meta",
    ],
  },
  image: {
    name: "Lens",
    role: "Visual Curator",
    tone: "aesthetic and brand-conscious",
    expertise: ["photo curation", "brand consistency", "image optimization", "alt text"],
    rules: [
      "Never use the same image twice on a site",
      "Match image mood to business personality — dark/moody for bars, bright/airy for wellness",
      "Always generate descriptive alt text for accessibility and SEO",
    ],
  },
  ecommerce: {
    name: "Market",
    role: "E-commerce Specialist",
    tone: "commercial and conversion-focused",
    expertise: ["product management", "pricing strategy", "cart optimization"],
    rules: [
      "Products need compelling descriptions, not just names",
      "Always include a CTA on pricing sections",
      "Pricing plans should have a highlighted/recommended option",
    ],
  },
};

export function getPersonality(agentName: string): AgentPersonality {
  return PERSONALITIES[agentName] || {
    name: agentName,
    role: "Agent",
    tone: "professional",
    expertise: [],
    rules: [],
  };
}

export function buildPersonalityPrompt(agentName: string): string {
  const p = getPersonality(agentName);
  return `You are ${p.name}, the ${p.role} at Xusmo. Your tone is ${p.tone}.
Your expertise: ${p.expertise.join(", ")}.
${p.rules.map((r, i) => `Rule ${i + 1}: ${r}`).join("\n")}`;
}

// ---------------------------------------------------------------------------
// 5. LEARNING SYSTEM — Persistent, industry-aware, behavior-changing
// ---------------------------------------------------------------------------

// ── In-memory feedback log (volatile — for session stats) ──

interface FeedbackEntry {
  siteId: string;
  agent: string;
  action: string;
  success: boolean;
  feedback?: string;
  industry?: string;
  ts: number;
}

const feedbackLog: FeedbackEntry[] = [];
const MAX_FEEDBACK = 500;

export function logAgentFeedback(siteId: string, agent: string, action: string, success: boolean, feedback?: string, industry?: string): void {
  feedbackLog.push({ siteId, agent, action, success, feedback, industry, ts: Date.now() });
  if (feedbackLog.length > MAX_FEEDBACK) feedbackLog.splice(0, feedbackLog.length - MAX_FEEDBACK);

  // Auto-learn from patterns
  if (!success && feedback) {
    learnFromFailure(agent, action, feedback, industry);
  }
}

export function getAgentSuccessRate(agent: string): { total: number; successful: number; rate: number } {
  const entries = feedbackLog.filter(f => f.agent === agent);
  const successful = entries.filter(f => f.success).length;
  return { total: entries.length, successful, rate: entries.length > 0 ? successful / entries.length : 1 };
}

export function getCommonFailures(agent: string, limit = 5): string[] {
  return feedbackLog
    .filter(f => f.agent === agent && !f.success && f.feedback)
    .slice(-limit)
    .map(f => f.feedback!);
}

// ── Persistent lessons — stored in DB, survive restarts ──

interface Lesson {
  rule: string;
  source: string; // what triggered this lesson
  agent: string;
  industry?: string;
  learnedAt: string;
  appliedCount: number;
}

// In-memory cache of lessons (loaded from DB on first access)
let lessonsCache: Lesson[] | null = null;

async function loadLessons(): Promise<Lesson[]> {
  if (lessonsCache) return lessonsCache;
  try {
    // Store lessons in a special "system" site record or use the first admin user's prefs
    // For now, use Redis if available, else in-memory
    if (redis) {
      const raw = await redis.get("xusmo:agent:lessons");
      if (raw) {
        lessonsCache = JSON.parse(raw);
        return lessonsCache!;
      }
    }
  } catch { /* fall through */ }
  lessonsCache = [];
  return lessonsCache;
}

async function saveLessons(): Promise<void> {
  if (!lessonsCache) return;
  try {
    if (redis) {
      await redis.set("xusmo:agent:lessons", JSON.stringify(lessonsCache));
    }
  } catch { /* non-critical */ }
}

/**
 * Record a lesson that agents should follow in future generations.
 * Persisted to Redis, injected into LLM prompts via getLessonsForPrompt().
 */
export async function recordLesson(agent: string, rule: string, source: string, industry?: string): Promise<void> {
  const lessons = await loadLessons();

  // Don't duplicate
  if (lessons.some(l => l.rule === rule && l.agent === agent)) return;

  lessons.push({
    rule,
    source,
    agent,
    industry,
    learnedAt: new Date().toISOString(),
    appliedCount: 0,
  });

  // Keep max 100 lessons
  if (lessons.length > 100) lessons.splice(0, lessons.length - 100);

  await saveLessons();
  console.log(`[Learning] New lesson for ${agent}: "${rule}" (from: ${source})`);
}

/**
 * Get lessons relevant to a specific agent + industry, formatted for LLM injection.
 * Returns a string block that can be appended to any system prompt.
 */
export async function getLessonsForPrompt(agent: string, industry?: string): Promise<string> {
  const lessons = await loadLessons();
  const relevant = lessons.filter(l =>
    l.agent === agent || l.agent === "all" ||
    (industry && l.industry && industry.toLowerCase().includes(l.industry.toLowerCase()))
  );

  if (relevant.length === 0) return "";

  // Mark as applied
  for (const l of relevant) l.appliedCount++;
  saveLessons().catch(() => {});

  return `\n\nLEARNED RULES (from past experience — MUST follow):\n${relevant.map((l, i) => `${i + 1}. ${l.rule}`).join("\n")}`;
}

/**
 * Auto-learn from common failure patterns.
 * Called automatically by logAgentFeedback when success=false.
 */
function learnFromFailure(agent: string, action: string, feedback: string, industry?: string): void {
  const lower = feedback.toLowerCase();

  // Pattern: contrast/color issues
  if (lower.includes("contrast") || lower.includes("black on black") || lower.includes("unreadable") || lower.includes("can't read")) {
    recordLesson(agent, "NEVER use dark text colors (#000-#333) on dark backgrounds (#000-#1a1a1a). Dark themes must use light text (#f0f0f0+) and light muted (#94a3b8+).", feedback, industry);
  }

  // Pattern: generic/boring design
  if (lower.includes("generic") || lower.includes("boring") || lower.includes("same") || lower.includes("template")) {
    recordLesson(agent, "Vary layouts aggressively — use split hero, masonry gallery, list services, marquee testimonials. Never generate the same component sequence twice.", feedback, industry);
  }

  // Pattern: spacing issues
  if (lower.includes("spacing") || lower.includes("padding") || lower.includes("too much space") || lower.includes("cramped")) {
    recordLesson(agent, "Section padding should be moderate (py-12 to py-16). Never double-pad — if the component has internal padding, the wrapper should use less.", feedback, industry);
  }

  // Pattern: wrong images
  if (lower.includes("wrong image") || lower.includes("irrelevant") || lower.includes("stock photo") || lower.includes("doesn't match")) {
    recordLesson("image", `Search with specific business context: "${industry} professional [specific service]" not just generic industry terms.`, feedback, industry);
  }

  // Pattern: missing content
  if (lower.includes("placeholder") || lower.includes("lorem") || lower.includes("empty") || lower.includes("no content")) {
    recordLesson(agent, "Never leave placeholder text. Every section must have real, business-specific content. Services need descriptions, testimonials need real-sounding quotes.", feedback, industry);
  }
}

// ── Industry knowledge accumulation ──

interface IndustryInsight {
  industry: string;
  bestComponents: string[];
  bestPersonality: string;
  bestAccentColors: string[];
  commonServices: string[];
  siteCount: number;
  avgSections: number;
}

const industryKnowledge = new Map<string, IndustryInsight>();

/**
 * Record what worked well for an industry after a successful build.
 */
export function recordIndustrySuccess(
  industry: string,
  components: string[],
  personality: string,
  accentColor: string,
  sectionCount: number
): void {
  const lower = industry.toLowerCase();
  const existing = industryKnowledge.get(lower) || {
    industry: lower,
    bestComponents: [],
    bestPersonality: personality,
    bestAccentColors: [],
    commonServices: [],
    siteCount: 0,
    avgSections: 0,
  };

  existing.siteCount++;
  existing.avgSections = (existing.avgSections * (existing.siteCount - 1) + sectionCount) / existing.siteCount;

  // Track top components
  for (const c of components) {
    if (!existing.bestComponents.includes(c)) existing.bestComponents.push(c);
  }
  if (existing.bestComponents.length > 20) existing.bestComponents = existing.bestComponents.slice(-20);

  // Track accent colors
  if (!existing.bestAccentColors.includes(accentColor)) existing.bestAccentColors.push(accentColor);
  if (existing.bestAccentColors.length > 5) existing.bestAccentColors.shift();

  industryKnowledge.set(lower, existing);
}

/**
 * Get accumulated knowledge about an industry for prompt injection.
 */
export function getIndustryKnowledge(industry: string): IndustryInsight | null {
  return industryKnowledge.get(industry.toLowerCase()) || null;
}

/**
 * Build a prompt section with industry knowledge.
 */
export function buildIndustryKnowledgePrompt(industry: string): string {
  const insight = getIndustryKnowledge(industry);
  if (!insight || insight.siteCount < 2) return "";

  return `\n\nINDUSTRY KNOWLEDGE (learned from ${insight.siteCount} successful ${insight.industry} sites):
- Best components: ${insight.bestComponents.slice(0, 10).join(", ")}
- Typical section count: ${Math.round(insight.avgSections)}
- Proven accent colors: ${insight.bestAccentColors.join(", ")}
- Preferred personality: ${insight.bestPersonality}`;
}

// ---------------------------------------------------------------------------
// 6. COST TRACKING
// ---------------------------------------------------------------------------

const costTracker = { totalCalls: 0, totalTokens: 0, totalCost: 0, byAgent: {} as Record<string, { calls: number; tokens: number; cost: number }> };

export function trackLLMCost(agent: string, tokens: number, cost: number): void {
  costTracker.totalCalls++;
  costTracker.totalTokens += tokens;
  costTracker.totalCost += cost;
  if (!costTracker.byAgent[agent]) costTracker.byAgent[agent] = { calls: 0, tokens: 0, cost: 0 };
  costTracker.byAgent[agent].calls++;
  costTracker.byAgent[agent].tokens += tokens;
  costTracker.byAgent[agent].cost += cost;
}

export function getCostStats() {
  return { ...costTracker };
}
