// =============================================================================
// Editor Agent — Modifies existing sites via natural language
// Fixes: BUG 1 (sync to designDocument), BUG 2 (page creation),
// BUG 4/10 (truncation), BUG 7 (JSON leak), BUG 8 (hallucination)
// =============================================================================

import { prisma } from "@/lib/db";
import { geminiPro } from "@/lib/llm/gemini";
import { syncDesignToWordPress, syncPageToWordPress } from "@/lib/wordpress/sync";
import type { AgentInput, AgentResult, AgentAction } from "./types";

// ---------------------------------------------------------------------------
// Edit action types
// ---------------------------------------------------------------------------

type EditAction =
  | { action: "UPDATE_CONTENT"; pageSlug: string; field: string; value: string }
  | { action: "UPDATE_SEO"; pageSlug: string; metaTitle?: string; metaDesc?: string }
  | { action: "APPLY_PRESET"; preset: string }
  | { action: "UPDATE_THEME"; colors?: Record<string, string>; fonts?: Record<string, string> }
  | { action: "UPDATE_CSS"; css: string }
  | { action: "UPDATE_IMAGE"; pageSlug: string; sectionIndex: number; propKey: string; searchQuery: string }
  | { action: "UPDATE_SECTION_PROP"; pageSlug: string; sectionIndex: number; propKey: string; value: unknown }
  | { action: "ADD_SECTION"; pageSlug: string; component: string; position: number }
  | { action: "REMOVE_SECTION"; pageSlug: string; sectionIndex: number }
  | { action: "CREATE_PAGE"; slug: string; title: string; sections: { component: string }[] }
  | { action: "NAVIGATE"; tab: string }
  | { action: "INFO"; message: string };

const VALID_PRESETS = ["professional", "bold", "elegant", "minimal", "warm"];

// Map LLM field aliases to correct DB field names
const FIELD_ALIASES: Record<string, string> = {
  headline: "heroHeadline", heading: "heroHeadline", hero_headline: "heroHeadline",
  subheadline: "heroSubheadline", subtitle: "heroSubheadline", hero_subheadline: "heroSubheadline",
  cta: "ctaLabel", cta_label: "ctaLabel", button: "ctaLabel",
  body: "bodyContent", body_content: "bodyContent", page_title: "title",
};

// Map DB fields to designDocument section prop names
const FIELD_TO_PROP: Record<string, string> = {
  heroHeadline: "title",
  heroSubheadline: "subtitle",
  ctaLabel: "cta",
};

const CONTENT_FIELDS = ["heroHeadline", "heroSubheadline", "ctaLabel", "bodyContent", "title"];

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

function buildEditorPrompt(context: AgentInput["context"]): string {
  const pageList = context.currentPages
    .map((p) => `  - ${p.slug}: "${p.title}" (${p.sectionCount} sections)`)
    .join("\n");

  const sectionList = Object.entries(context.currentSections)
    .map(([slug, sections]) => {
      const items = sections
        .map((s, i) => {
          const imgProps = s.propKeys.filter(
            (k) => k.includes("image") || k.includes("Url") || k.includes("avatar") || k.includes("src")
          );
          return `    [${i}] ${s.component}${imgProps.length ? ` [images: ${imgProps.join(", ")}]` : ""}`;
        })
        .join("\n");
      return `  Page "${slug}":\n${items}`;
    })
    .join("\n");

  const themeInfo = context.currentTheme
    ? `Colors: ${JSON.stringify(context.currentTheme.colors)}\nFonts: ${JSON.stringify(context.currentTheme.fonts)}\nRadius: ${context.currentTheme.radius}`
    : "No theme data";

  return `You are a website editor for "${context.businessName}" (${context.industry}).

CURRENT SITE STATE:
Pages:
${pageList}

Sections (with indices):
${sectionList}

Theme:
${themeInfo}

AVAILABLE ACTIONS — return as JSON { "reply": "...", "actions": [...] }:

1. UPDATE_CONTENT: { action: "UPDATE_CONTENT", pageSlug, field: "heroHeadline"|"heroSubheadline"|"ctaLabel"|"bodyContent"|"title", value }
   - This updates BOTH the database AND the live preview section props automatically.

2. UPDATE_SEO: { action: "UPDATE_SEO", pageSlug, metaTitle?, metaDesc? }

3. APPLY_PRESET: { action: "APPLY_PRESET", preset: "professional"|"bold"|"elegant"|"minimal"|"warm" }

4. UPDATE_THEME: { action: "UPDATE_THEME", colors?: {accent?, background?, text?, surface?, ...}, fonts?: {heading?, body?} }

5. UPDATE_CSS: { action: "UPDATE_CSS", css }

6. UPDATE_IMAGE: { action: "UPDATE_IMAGE", pageSlug, sectionIndex, propKey, searchQuery }
   - Searches Pexels for a matching photo. propKey is the image property name (e.g., "imageUrl", "image").

7. UPDATE_SECTION_PROP: { action: "UPDATE_SECTION_PROP", pageSlug, sectionIndex, propKey, value }
   - Update ANY prop on any section. Use for things UPDATE_CONTENT doesn't cover.

8. ADD_SECTION: { action: "ADD_SECTION", pageSlug, component, position }
   - Add a new section. position = index where to insert (0 = beginning).

9. REMOVE_SECTION: { action: "REMOVE_SECTION", pageSlug, sectionIndex }

10. CREATE_PAGE: { action: "CREATE_PAGE", slug, title, sections: [{ component: "hero" }, { component: "section-title" }, ...] }
    - Creates a brand new page with specified sections.

11. NAVIGATE: { action: "NAVIGATE", tab }

12. INFO: { action: "INFO", message }

CRITICAL RULES:
- Return ONLY valid JSON. No markdown fences, no explanations outside the JSON.
- Write plain text in values. NEVER use markdown (**bold**, *italic*).
- Keep reply SHORT (1-2 sentences max). Do NOT write long paragraphs.
- Do NOT include raw action JSON in the reply text. The reply is for the USER, not for debugging.
- ONLY report actions you are ACTUALLY executing. Do NOT claim you did something from a previous conversation.
- If a page doesn't exist and user wants to create one, use CREATE_PAGE.
- For multi-step requests, include ALL actions in a single response.
- The section list above shows the CURRENT state. Base your actions on THIS, not on memory of previous conversations.`;
}

// ---------------------------------------------------------------------------
// Editor Agent entry point
// ---------------------------------------------------------------------------

export async function runEditorAgent(input: AgentInput): Promise<AgentResult> {
  const { siteId, prompt, context, history } = input;
  const startTime = Date.now();
  const actions: AgentAction[] = [];

  try {
    const systemPrompt = buildEditorPrompt(context);

    // Build prompt with history (limited)
    let fullPrompt = prompt;
    if (history && history.length > 0) {
      const recent = history.slice(-6);
      const historyText = recent
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
        .join("\n");
      fullPrompt = `Previous conversation:\n${historyText}\n\nCurrent message:\n${prompt}`;
    }

    // Use Gemini Pro for quality (BUG 4/10 fix — more tokens, less truncation)
    const llmResult = await geminiPro(fullPrompt, systemPrompt);
    if (!llmResult?.text) throw new Error("Empty LLM response");

    // Parse response — handle truncated JSON (BUG 4/10)
    let cleaned = llmResult.text.trim();
    if (cleaned.startsWith("```"))
      cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");

    let parsed: { reply: string; actions: EditAction[] };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Try to salvage truncated JSON
      parsed = salvageJSON(cleaned);
    }

    // Sanitize reply — remove any leaked JSON (BUG 7)
    parsed.reply = sanitizeReply(parsed.reply);

    // Execute each action
    for (const editAction of parsed.actions || []) {
      const result = await executeEditAction(siteId, editAction, context);
      actions.push(result);
    }

    return {
      agent: "editor",
      status: "completed",
      reply: parsed.reply || "Changes applied.",
      actions,
      durationMs: Date.now() - startTime,
    };
  } catch (err) {
    return {
      agent: "editor",
      status: "failed",
      reply: `Something went wrong. Please try a simpler request.`,
      actions,
      durationMs: Date.now() - startTime,
    };
  }
}

// ---------------------------------------------------------------------------
// Salvage truncated JSON (BUG 4/10 fix)
// ---------------------------------------------------------------------------

function salvageJSON(raw: string): { reply: string; actions: EditAction[] } {
  // Try to extract reply from partial JSON
  const replyMatch = raw.match(/"reply"\s*:\s*"([^"]*)/);
  const reply = replyMatch ? replyMatch[1] : raw.slice(0, 200);

  // Try to extract actions array
  const actionsMatch = raw.match(/"actions"\s*:\s*\[/);
  if (!actionsMatch) return { reply, actions: [] };

  // Try to close the JSON
  let jsonStr = raw.replace(/,\s*$/, "");
  let inStr = false;
  let esc = false;
  const closers: string[] = [];
  for (const ch of jsonStr) {
    if (esc) { esc = false; continue; }
    if (ch === "\\" && inStr) { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === "{") closers.push("}");
    else if (ch === "[") closers.push("]");
    else if (ch === "}" || ch === "]") closers.pop();
  }
  if (inStr) jsonStr += '"';
  jsonStr = jsonStr.replace(/,\s*$/, "") + closers.reverse().join("");
  jsonStr = jsonStr.replace(/,\s*([}\]])/g, "$1");

  try {
    return JSON.parse(jsonStr);
  } catch {
    return { reply, actions: [] };
  }
}

// ---------------------------------------------------------------------------
// Sanitize reply — remove leaked JSON (BUG 7)
// ---------------------------------------------------------------------------

function sanitizeReply(reply: string): string {
  if (!reply) return "Done.";

  // Remove any JSON-like structures from the reply
  let cleaned = reply
    .replace(/\{[^}]*"action"\s*:/g, "")
    .replace(/"pageSlug"\s*:\s*"[^"]*"/g, "")
    .replace(/"sectionIndex"\s*:\s*\d+/g, "")
    .replace(/"propKey"\s*:\s*"[^"]*"/g, "")
    .replace(/\}\s*,?\s*\{/g, "")
    .replace(/[\[{}\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // If reply is mostly JSON garbage, replace with generic message
  if (cleaned.length < 10 || cleaned.split('"').length > 6) {
    return "Changes applied.";
  }

  return cleaned;
}

// ---------------------------------------------------------------------------
// Strip markdown from content values
// ---------------------------------------------------------------------------

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

// ---------------------------------------------------------------------------
// Action executor
// ---------------------------------------------------------------------------

async function executeEditAction(
  siteId: string,
  action: EditAction,
  context: AgentInput["context"]
): Promise<AgentAction> {
  switch (action.action) {
    case "UPDATE_CONTENT": {
      const field = FIELD_ALIASES[action.field] || action.field;
      if (!CONTENT_FIELDS.includes(field)) {
        return { type: "UPDATE_CONTENT", success: false, label: `Invalid field: ${action.field}` };
      }
      const value = stripMarkdown(action.value);
      try {
        // 1. Update Page table
        await prisma.page.update({
          where: { siteId_slug: { siteId, slug: action.pageSlug } },
          data: { [field]: value },
        });

        // 2. BUG 1 FIX: Also update the designDocument section props
        const propName = FIELD_TO_PROP[field]; // heroHeadline → "title"
        if (propName) {
          await updateDesignDocumentHero(siteId, action.pageSlug, propName, value);
        }

        syncPageToWordPress(siteId, action.pageSlug).catch(() => {});
        return { type: "UPDATE_CONTENT", success: true, label: `Updated ${field} on "${action.pageSlug}"` };
      } catch {
        return { type: "UPDATE_CONTENT", success: false, label: `Page "${action.pageSlug}" not found` };
      }
    }

    case "UPDATE_SEO": {
      const data: Record<string, string> = {};
      if (action.metaTitle) data.metaTitle = action.metaTitle;
      if (action.metaDesc) data.metaDesc = action.metaDesc;
      try {
        await prisma.page.update({
          where: { siteId_slug: { siteId, slug: action.pageSlug } },
          data,
        });
        return { type: "UPDATE_SEO", success: true, label: `Updated SEO on "${action.pageSlug}"` };
      } catch {
        return { type: "UPDATE_SEO", success: false, label: "Failed to update SEO" };
      }
    }

    case "APPLY_PRESET": {
      if (!VALID_PRESETS.includes(action.preset)) {
        return { type: "APPLY_PRESET", success: false, label: `Invalid preset: ${action.preset}` };
      }
      await prisma.site.update({ where: { id: siteId }, data: { activePreset: action.preset } });
      syncDesignToWordPress(siteId).catch(() => {});
      return { type: "APPLY_PRESET", success: true, label: `Applied "${action.preset}" preset` };
    }

    case "UPDATE_THEME": {
      try {
        const site = await prisma.site.findUnique({ where: { id: siteId }, select: { designDocument: true } });
        const doc = (site?.designDocument as Record<string, unknown>) || {};
        const currentTheme = (doc.theme as Record<string, unknown>) || {};
        const currentColors = (currentTheme.colors as Record<string, string>) || {};
        const currentFonts = (currentTheme.fonts as Record<string, string>) || {};

        const updatedTheme = {
          ...currentTheme,
          colors: { ...currentColors, ...(action.colors || {}) },
          fonts: { ...currentFonts, ...(action.fonts || {}) },
        };

        await prisma.site.update({
          where: { id: siteId },
          data: { designDocument: { ...doc, theme: updatedTheme } },
        });
        syncDesignToWordPress(siteId).catch(() => {});

        const parts: string[] = [];
        if (action.colors) parts.push(`colors (${Object.keys(action.colors).join(", ")})`);
        if (action.fonts) parts.push(`fonts (${Object.keys(action.fonts).join(", ")})`);
        return { type: "UPDATE_THEME", success: true, label: `Updated theme ${parts.join(" and ")}` };
      } catch {
        return { type: "UPDATE_THEME", success: false, label: "Failed to update theme" };
      }
    }

    case "UPDATE_CSS": {
      await prisma.site.update({
        where: { id: siteId },
        data: { customCss: action.css, customCssUpdatedAt: new Date() },
      });
      syncDesignToWordPress(siteId).catch(() => {});
      return { type: "UPDATE_CSS", success: true, label: "Updated custom CSS" };
    }

    case "UPDATE_IMAGE": {
      try {
        const pexelsKey = process.env.PEXELS_API_KEY;
        if (!pexelsKey) return { type: "UPDATE_IMAGE", success: false, label: "No PEXELS_API_KEY" };

        const params = new URLSearchParams({ query: action.searchQuery, per_page: "5", orientation: "landscape" });
        const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
          headers: { Authorization: pexelsKey },
        });
        if (!res.ok) return { type: "UPDATE_IMAGE", success: false, label: `Pexels error: ${res.status}` };

        const data = await res.json();
        const photos = data.photos || [];
        if (!photos.length) return { type: "UPDATE_IMAGE", success: false, label: `No images for "${action.searchQuery}"` };

        const photo = photos[Math.floor(Math.random() * photos.length)];
        const imageUrl = `${photo.src.original}?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop`;

        const site = await prisma.site.findUnique({ where: { id: siteId }, select: { designDocument: true } });
        const doc = (site?.designDocument as Record<string, unknown>) || {};
        const pages = (doc.pages as Record<string, unknown>) || {};
        const page = pages[action.pageSlug] as Record<string, unknown> | undefined;
        if (!page?.sections || !Array.isArray(page.sections)) {
          return { type: "UPDATE_IMAGE", success: false, label: `Page "${action.pageSlug}" not found` };
        }

        const sectionsCopy = [...(page.sections as Record<string, unknown>[])];
        if (action.sectionIndex < 0 || action.sectionIndex >= sectionsCopy.length) {
          return { type: "UPDATE_IMAGE", success: false, label: `Section ${action.sectionIndex} out of range` };
        }

        const section = { ...sectionsCopy[action.sectionIndex] };
        const props = { ...(section.props as Record<string, unknown> || {}) };
        props[action.propKey] = imageUrl;
        section.props = props;
        sectionsCopy[action.sectionIndex] = section;

        await prisma.site.update({
          where: { id: siteId },
          data: { designDocument: { ...doc, pages: { ...pages, [action.pageSlug]: { ...page, sections: sectionsCopy } } } },
        });

        return { type: "UPDATE_IMAGE", success: true, label: `Updated image with "${action.searchQuery}" photo` };
      } catch (err) {
        return { type: "UPDATE_IMAGE", success: false, label: `Image error: ${err instanceof Error ? err.message : "Unknown"}` };
      }
    }

    case "UPDATE_SECTION_PROP": {
      try {
        const site = await prisma.site.findUnique({ where: { id: siteId }, select: { designDocument: true } });
        const doc = (site?.designDocument as Record<string, unknown>) || {};
        const pages = (doc.pages as Record<string, unknown>) || {};
        const page = pages[action.pageSlug] as Record<string, unknown> | undefined;
        if (!page?.sections || !Array.isArray(page.sections)) {
          return { type: "UPDATE_SECTION_PROP", success: false, label: "Page not found" };
        }

        const sectionsCopy = [...(page.sections as Record<string, unknown>[])];
        if (action.sectionIndex < 0 || action.sectionIndex >= sectionsCopy.length) {
          return { type: "UPDATE_SECTION_PROP", success: false, label: `Section ${action.sectionIndex} out of range` };
        }

        const section = { ...sectionsCopy[action.sectionIndex] };
        const props = { ...(section.props as Record<string, unknown> || {}) };
        props[action.propKey] = action.value;
        section.props = props;
        sectionsCopy[action.sectionIndex] = section;

        await prisma.site.update({
          where: { id: siteId },
          data: { designDocument: { ...doc, pages: { ...pages, [action.pageSlug]: { ...page, sections: sectionsCopy } } } },
        });

        return { type: "UPDATE_SECTION_PROP", success: true, label: `Updated ${action.propKey} on section ${action.sectionIndex}` };
      } catch {
        return { type: "UPDATE_SECTION_PROP", success: false, label: "Failed to update prop" };
      }
    }

    case "ADD_SECTION": {
      try {
        const site = await prisma.site.findUnique({ where: { id: siteId }, select: { designDocument: true } });
        const doc = (site?.designDocument as Record<string, unknown>) || {};
        const pages = (doc.pages as Record<string, unknown>) || {};
        const page = pages[action.pageSlug] as Record<string, unknown> | undefined;
        if (!page) return { type: "ADD_SECTION", success: false, label: "Page not found" };

        const sections = [...((page.sections || []) as Record<string, unknown>[])];
        const newSection = {
          id: `section-${Date.now()}`,
          component: action.component,
          props: {},
          layout: { background: "default", padding: "lg", width: "contained", align: "center" },
          style: {},
        };

        const pos = Math.min(Math.max(0, action.position), sections.length);
        sections.splice(pos, 0, newSection);

        await prisma.site.update({
          where: { id: siteId },
          data: { designDocument: { ...doc, pages: { ...pages, [action.pageSlug]: { ...page, sections } } } },
        });

        return { type: "ADD_SECTION", success: true, label: `Added ${action.component} to "${action.pageSlug}"` };
      } catch {
        return { type: "ADD_SECTION", success: false, label: "Failed to add section" };
      }
    }

    case "REMOVE_SECTION": {
      try {
        const site = await prisma.site.findUnique({ where: { id: siteId }, select: { designDocument: true } });
        const doc = (site?.designDocument as Record<string, unknown>) || {};
        const pages = (doc.pages as Record<string, unknown>) || {};
        const page = pages[action.pageSlug] as Record<string, unknown> | undefined;
        if (!page?.sections || !Array.isArray(page.sections)) {
          return { type: "REMOVE_SECTION", success: false, label: "Page not found" };
        }

        const sections = [...(page.sections as Record<string, unknown>[])];
        if (action.sectionIndex < 0 || action.sectionIndex >= sections.length) {
          return { type: "REMOVE_SECTION", success: false, label: `Section ${action.sectionIndex} out of range` };
        }

        const removed = sections[action.sectionIndex] as Record<string, string> | undefined;
        sections.splice(action.sectionIndex, 1);

        await prisma.site.update({
          where: { id: siteId },
          data: { designDocument: { ...doc, pages: { ...pages, [action.pageSlug]: { ...page, sections } } } },
        });

        return { type: "REMOVE_SECTION", success: true, label: `Removed ${removed?.component || "section"} from "${action.pageSlug}"` };
      } catch {
        return { type: "REMOVE_SECTION", success: false, label: "Failed to remove section" };
      }
    }

    // BUG 2 FIX: Page creation
    case "CREATE_PAGE": {
      try {
        // Create in Page table
        const maxOrder = await prisma.page.count({ where: { siteId } });
        await prisma.page.create({
          data: {
            siteId,
            slug: action.slug,
            title: action.title,
            sortOrder: maxOrder,
          },
        });

        // Create in designDocument
        const site = await prisma.site.findUnique({ where: { id: siteId }, select: { designDocument: true } });
        const doc = (site?.designDocument as Record<string, unknown>) || {};
        const pages = (doc.pages as Record<string, unknown>) || {};

        const newSections = (action.sections || []).map((s, i) => ({
          id: `section-${Date.now()}-${i}`,
          component: s.component,
          props: {},
          layout: { background: i === 0 ? "dark" : "default", padding: "lg", width: "contained", align: "center" },
          style: {},
        }));

        pages[action.slug] = {
          page: `${context.businessName}-${action.slug}`,
          sections: newSections,
        };

        await prisma.site.update({
          where: { id: siteId },
          data: { designDocument: { ...doc, pages } },
        });

        return { type: "CREATE_PAGE", success: true, label: `Created page "${action.title}" (/${action.slug}) with ${newSections.length} sections` };
      } catch (err) {
        return { type: "CREATE_PAGE", success: false, label: `Failed to create page: ${err instanceof Error ? err.message : "Unknown"}` };
      }
    }

    case "NAVIGATE":
      return { type: "NAVIGATE", success: true, label: `Navigate to ${action.tab}` };

    case "INFO":
      return { type: "INFO", success: true, label: action.message };

    default:
      return { type: "UNKNOWN", success: false, label: "Unknown action" };
  }
}

// ---------------------------------------------------------------------------
// BUG 1 FIX: Update hero section props in designDocument
// When user changes heroHeadline, also update the hero section's "title" prop
// ---------------------------------------------------------------------------

async function updateDesignDocumentHero(
  siteId: string,
  pageSlug: string,
  propName: string,
  value: string
): Promise<void> {
  try {
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { designDocument: true },
    });

    const doc = (site?.designDocument as Record<string, unknown>) || {};
    const pages = (doc.pages as Record<string, unknown>) || {};
    const page = pages[pageSlug] as Record<string, unknown> | undefined;

    if (!page?.sections || !Array.isArray(page.sections)) return;

    const sections = [...(page.sections as Record<string, unknown>[])];
    let updated = false;

    // Find the first hero section and update its prop
    for (let i = 0; i < sections.length; i++) {
      const comp = (sections[i].component as string) || "";
      if (comp.includes("hero")) {
        const s = { ...sections[i] };
        const props = { ...(s.props as Record<string, unknown> || {}) };
        props[propName] = value;
        s.props = props;
        sections[i] = s;
        updated = true;
        break;
      }
    }

    if (updated) {
      await prisma.site.update({
        where: { id: siteId },
        data: {
          designDocument: {
            ...doc,
            pages: { ...pages, [pageSlug]: { ...page, sections } },
          },
        },
      });
    }
  } catch {
    // Non-critical — don't fail the main action
  }
}
