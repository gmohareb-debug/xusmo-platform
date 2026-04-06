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
// 5. LEARNING / FEEDBACK LOOP
// ---------------------------------------------------------------------------

interface FeedbackEntry {
  siteId: string;
  agent: string;
  action: string;
  success: boolean;
  feedback?: string;
  ts: number;
}

const feedbackLog: FeedbackEntry[] = [];
const MAX_FEEDBACK = 500;

export function logAgentFeedback(siteId: string, agent: string, action: string, success: boolean, feedback?: string): void {
  feedbackLog.push({ siteId, agent, action, success, feedback, ts: Date.now() });
  if (feedbackLog.length > MAX_FEEDBACK) feedbackLog.splice(0, feedbackLog.length - MAX_FEEDBACK);
}

export function getAgentSuccessRate(agent: string): { total: number; successful: number; rate: number } {
  const entries = feedbackLog.filter(f => f.agent === agent);
  const successful = entries.filter(f => f.success).length;
  return {
    total: entries.length,
    successful,
    rate: entries.length > 0 ? successful / entries.length : 1,
  };
}

export function getCommonFailures(agent: string, limit = 5): string[] {
  return feedbackLog
    .filter(f => f.agent === agent && !f.success && f.feedback)
    .slice(-limit)
    .map(f => f.feedback!);
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
