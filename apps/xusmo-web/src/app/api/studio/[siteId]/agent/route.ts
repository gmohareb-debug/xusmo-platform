// =============================================================================
// POST /api/studio/[siteId]/agent — AI Studio Agent
// Accepts natural-language instructions and executes site changes.
// Supports conversation history, undo, section introspection, SEO,
// theme token updates, and section management.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";
import { geminiFlash } from "@/lib/llm/gemini";
import {
  syncDesignToWordPress,
  syncPageToWordPress,
} from "@/lib/wordpress/sync";

// ---------------------------------------------------------------------------
// History message shape (sent from frontend)
// ---------------------------------------------------------------------------

interface HistoryMessage {
  role: "user" | "assistant";
  text: string;
}

// ---------------------------------------------------------------------------
// Action types the LLM can return
// ---------------------------------------------------------------------------

type AgentAction =
  | {
      action: "UPDATE_CONTENT";
      pageSlug: string;
      field: string;
      value: string;
    }
  | {
      action: "UPDATE_SEO";
      pageSlug: string;
      metaTitle?: string;
      metaDesc?: string;
    }
  | {
      action: "APPLY_PRESET";
      preset: string;
    }
  | {
      action: "UPDATE_THEME";
      colors?: Record<string, string>;
      fonts?: { heading?: string; body?: string };
    }
  | {
      action: "UPDATE_CSS";
      css: string;
    }
  | {
      action: "UPDATE_IMAGE";
      pageSlug: string;
      sectionIndex: number;
      propKey: string;
      searchQuery: string;
    }
  | {
      action: "NAVIGATE";
      tab: string;
    }
  | {
      action: "UNDO";
    }
  | { action: "INFO"; message: string };

type ActionResult = {
  action: string;
  success: boolean;
  label: string;
  error?: string;
};

// ---------------------------------------------------------------------------
// Change log entry — stored per-request for undo
// ---------------------------------------------------------------------------

interface ChangeEntry {
  action: string;
  table: string;
  id: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

// Per-session change log (keyed by siteId, kept in memory for the process)
const changeLog = new Map<string, ChangeEntry[]>();

function recordChange(siteId: string, entry: ChangeEntry) {
  const log = changeLog.get(siteId) || [];
  log.push(entry);
  // Keep last 50 changes per site
  if (log.length > 50) log.shift();
  changeLog.set(siteId, log);
}

// ---------------------------------------------------------------------------
// Strip markdown formatting from plain-text content values
// ---------------------------------------------------------------------------

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1") // **bold** → bold
    .replace(/\*(.+?)\*/g, "$1") // *italic* → italic
    .replace(/__(.+?)__/g, "$1") // __bold__ → bold
    .replace(/_(.+?)_/g, "$1") // _italic_ → italic
    .replace(/~~(.+?)~~/g, "$1") // ~~strike~~ → strike
    .replace(/`(.+?)`/g, "$1") // `code` → code
    .replace(/^#+\s+/gm, "") // # heading → heading
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); // [text](url) → text
}

// ---------------------------------------------------------------------------
// Valid presets
// ---------------------------------------------------------------------------

const VALID_PRESETS = ["professional", "bold", "elegant", "minimal", "warm"];

// ---------------------------------------------------------------------------
// Content fields the agent can edit
// ---------------------------------------------------------------------------

const CONTENT_FIELDS: Record<string, string> = {
  heroHeadline: "hero headline",
  heroSubheadline: "hero subheadline",
  ctaLabel: "CTA button",
  bodyContent: "body content",
  title: "page title",
};

// ---------------------------------------------------------------------------
// System prompt builder
// ---------------------------------------------------------------------------

function buildSystemPrompt(
  businessName: string,
  archetype: string,
  pages: {
    slug: string;
    title: string;
    heroHeadline: string | null;
    heroSubheadline: string | null;
    ctaLabel: string | null;
    metaDesc: string | null;
  }[],
  activePreset: string | null,
  themePoolEntryName: string | null,
  designSections: string | null,
  currentThemeTokens: string | null,
  hasChangeHistory: boolean
): string {
  const pageList = pages
    .map(
      (p) =>
        `  - ${p.slug}: "${p.title}" | headline: "${p.heroHeadline || "(none)"}" | sub: "${p.heroSubheadline || "(none)"}" | CTA: "${p.ctaLabel || "(none)"}" | meta: "${p.metaDesc || "(none)"}"`
    )
    .join("\n");

  const currentTheme =
    activePreset || themePoolEntryName || "default (archetype-based)";

  const sectionsInfo = designSections
    ? `\nCurrent homepage sections (from design document):\n${designSections}\n`
    : "";

  const themeTokensInfo = currentThemeTokens
    ? `\nCurrent theme tokens:\n${currentThemeTokens}\n`
    : "";

  const undoInfo = hasChangeHistory
    ? "\nThe user can ask to undo changes — you have access to the UNDO action which reverts the last change.\n"
    : "";

  return `You are a website editing assistant for the Xusmo studio. The user owns a website and wants to make changes via natural language.

Current site: ${businessName} (${archetype})
Current theme preset: ${currentTheme}
${themeTokensInfo}
Current pages with their content:
${pageList}
${sectionsInfo}${undoInfo}
You can perform these actions by returning JSON:

1. UPDATE_CONTENT: { action: "UPDATE_CONTENT", pageSlug: string, field: "heroHeadline"|"heroSubheadline"|"ctaLabel"|"bodyContent"|"title", value: string }
   - Use this to edit text content on any page.
   - IMPORTANT: Write plain text only. Never use markdown formatting (no **bold**, no *italic*, no # headings). The rendering engine handles formatting.

2. UPDATE_SEO: { action: "UPDATE_SEO", pageSlug: string, metaTitle?: string, metaDesc?: string }
   - Update SEO meta title and/or description for a page.

3. APPLY_PRESET: { action: "APPLY_PRESET", preset: "professional"|"bold"|"elegant"|"minimal"|"warm" }
   - Apply a theme preset to change the overall look.

4. UPDATE_THEME: { action: "UPDATE_THEME", colors?: { primary?: string, secondary?: string, accent?: string, background?: string, surface?: string, text?: string }, fonts?: { heading?: string, body?: string } }
   - Update specific theme colors or fonts using design tokens. Colors should be hex values.
   - Available heading fonts: Playfair Display, Lora, Poppins, Montserrat, Merriweather, Space Grotesk
   - Available body fonts: Inter, DM Sans, Lato, Open Sans, Nunito, Work Sans

5. UPDATE_CSS: { action: "UPDATE_CSS", css: string }
   - ONLY use this for very specific visual tweaks that cannot be done with UPDATE_THEME or APPLY_PRESET.
   - Do NOT use this for color or font changes — use UPDATE_THEME instead.
   - Do NOT use this to hide sections — tell the user to use the section editor.

6. NAVIGATE: { action: "NAVIGATE", tab: "content"|"design"|"seo"|"preview"|"pages" }

7. UPDATE_IMAGE: { action: "UPDATE_IMAGE", pageSlug: string, sectionIndex: number, propKey: string, searchQuery: string }
   - Change any image on the site by searching Pexels for a matching photo.
   - pageSlug: which page the section is on
   - sectionIndex: zero-based index of the section in that page's sections array
   - propKey: the prop that holds the image URL (e.g., "imageUrl", "image", "backgroundImage")
   - searchQuery: descriptive English phrase for the photo to find (e.g., "botanical garden greenhouse", "organic skincare products")

8. UNDO: { action: "UNDO" }
   - Reverts the most recent change made in this session.

9. INFO: { action: "INFO", message: string }
   - Use when you need more info, want to explain something, or the request is outside your capabilities.

Return a JSON object: { "reply": string, "actions": Action[] }

Rules:
- Always return valid JSON. Do not wrap in markdown code fences.
- Be helpful, concise, and proactive.
- NEVER use markdown formatting in content values (no **, no *, no #). Write clean plain text.
- For UPDATE_CONTENT, the pageSlug must be one of the existing pages listed above.
- You CAN introspect the site: if the user asks "what sections does my homepage have?" or "what is my current headline?", answer from the data above.
- You CAN change images using UPDATE_IMAGE. When the user asks to change an image (hero, about, product, etc.), use UPDATE_IMAGE with a descriptive searchQuery to find a matching photo from Pexels.
- You CANNOT add new pages. If asked, explain they can add pages via the Pages tab.
- You CANNOT add or remove sections from the design. If asked, explain they can manage sections via the Editor tab.
- You CANNOT edit footer copyright text directly. If asked, explain the footer content comes from the theme and can be customized via the Content tab.
- If you don't know the answer, say so honestly rather than guessing.`;
}

// ---------------------------------------------------------------------------
// Build full prompt with conversation history
// ---------------------------------------------------------------------------

function buildPromptWithHistory(
  currentMessage: string,
  history: HistoryMessage[]
): string {
  if (!history.length) return currentMessage;
  const recent = history.slice(-10);
  const historyText = recent
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
    .join("\n");
  return `Previous conversation:\n${historyText}\n\nCurrent message:\n${currentMessage}`;
}

// ---------------------------------------------------------------------------
// Parse LLM response
// ---------------------------------------------------------------------------

function parseLLMResponse(raw: string): {
  reply: string;
  actions: AgentAction[];
} {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }
  try {
    const parsed = JSON.parse(cleaned);
    return {
      reply: parsed.reply || "Done.",
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
    };
  } catch {
    return { reply: raw.trim(), actions: [] };
  }
}

// ---------------------------------------------------------------------------
// Replace text in Gutenberg HTML content
// ---------------------------------------------------------------------------

function replaceInGutenberg(
  html: string,
  field: string,
  oldValue: string,
  newValue: string
): string {
  if (!oldValue || !html) return html;
  const escaped = oldValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  switch (field) {
    case "heroHeadline": {
      const re = new RegExp(`(<h[12][^>]*>)(${escaped})(</h[12]>)`, "i");
      return re.test(html)
        ? html.replace(re, `$1${newValue}$3`)
        : html.replace(oldValue, newValue);
    }
    case "heroSubheadline": {
      const re = new RegExp(`(<p[^>]*>)(${escaped})(</p>)`, "i");
      return re.test(html)
        ? html.replace(re, `$1${newValue}$3`)
        : html.replace(oldValue, newValue);
    }
    case "ctaLabel": {
      const re = new RegExp(
        `(<a[^>]*class="wp-block-button__link[^"]*"[^>]*>)(${escaped})(</a>)`,
        "i"
      );
      return re.test(html)
        ? html.replace(re, `$1${newValue}$3`)
        : html.replace(oldValue, newValue);
    }
    default:
      return html.replace(oldValue, newValue);
  }
}

// ---------------------------------------------------------------------------
// Execute a single action
// ---------------------------------------------------------------------------

async function executeAction(
  siteId: string,
  action: AgentAction
): Promise<ActionResult> {
  switch (action.action) {
    // ── UPDATE_CONTENT ──
    case "UPDATE_CONTENT": {
      const { pageSlug, value: rawValue } = action;
      // Map common LLM aliases to correct field names
      const FIELD_ALIASES: Record<string, string> = {
        headline: "heroHeadline",
        heading: "heroHeadline",
        hero_headline: "heroHeadline",
        subheadline: "heroSubheadline",
        subtitle: "heroSubheadline",
        hero_subheadline: "heroSubheadline",
        cta: "ctaLabel",
        cta_label: "ctaLabel",
        button: "ctaLabel",
        body: "bodyContent",
        body_content: "bodyContent",
        page_title: "title",
      };
      const field = FIELD_ALIASES[action.field] || action.field;
      if (!(field in CONTENT_FIELDS)) {
        return {
          action: "UPDATE_CONTENT",
          success: false,
          label: `Invalid field: ${field}`,
          error: `Field must be one of: ${Object.keys(CONTENT_FIELDS).join(", ")}`,
        };
      }

      // Strip markdown from the value
      const value = stripMarkdown(rawValue);

      try {
        const page = await prisma.page.findUnique({
          where: { siteId_slug: { siteId, slug: pageSlug } },
          select: {
            heroHeadline: true,
            heroSubheadline: true,
            ctaLabel: true,
            bodyContent: true,
            title: true,
            content: true,
          },
        });

        if (!page) {
          return {
            action: "UPDATE_CONTENT",
            success: false,
            label: `Page "${pageSlug}" not found`,
          };
        }

        const oldValue = (page as Record<string, unknown>)[field] ?? "";

        // Record for undo
        recordChange(siteId, {
          action: "UPDATE_CONTENT",
          table: "Page",
          id: `${siteId}:${pageSlug}`,
          field,
          oldValue,
          newValue: value,
        });

        const updateData: Record<string, string> = { [field]: value };

        // Also update Gutenberg HTML if applicable
        if (
          page.content &&
          typeof oldValue === "string" &&
          oldValue &&
          oldValue !== value
        ) {
          const updated = replaceInGutenberg(
            page.content,
            field,
            oldValue,
            value
          );
          if (updated !== page.content) updateData.content = updated;
        }

        await prisma.page.update({
          where: { siteId_slug: { siteId, slug: pageSlug } },
          data: updateData,
        });

        syncPageToWordPress(siteId, pageSlug).catch(() => {});

        return {
          action: "UPDATE_CONTENT",
          success: true,
          label: `Updated ${CONTENT_FIELDS[field]} on "${pageSlug}"`,
        };
      } catch (err) {
        return {
          action: "UPDATE_CONTENT",
          success: false,
          label: `Failed to update ${field} on "${pageSlug}"`,
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    }

    // ── UPDATE_SEO ──
    case "UPDATE_SEO": {
      const { pageSlug, metaTitle, metaDesc } = action;
      if (!metaTitle && !metaDesc) {
        return {
          action: "UPDATE_SEO",
          success: false,
          label: "No SEO fields provided",
        };
      }

      try {
        const page = await prisma.page.findUnique({
          where: { siteId_slug: { siteId, slug: pageSlug } },
          select: { metaTitle: true, metaDesc: true },
        });
        if (!page) {
          return {
            action: "UPDATE_SEO",
            success: false,
            label: `Page "${pageSlug}" not found`,
          };
        }

        const data: Record<string, string> = {};
        if (metaTitle) {
          recordChange(siteId, {
            action: "UPDATE_SEO",
            table: "Page",
            id: `${siteId}:${pageSlug}`,
            field: "metaTitle",
            oldValue: page.metaTitle,
            newValue: metaTitle,
          });
          data.metaTitle = stripMarkdown(metaTitle);
        }
        if (metaDesc) {
          recordChange(siteId, {
            action: "UPDATE_SEO",
            table: "Page",
            id: `${siteId}:${pageSlug}`,
            field: "metaDesc",
            oldValue: page.metaDesc,
            newValue: metaDesc,
          });
          data.metaDesc = stripMarkdown(metaDesc);
        }

        await prisma.page.update({
          where: { siteId_slug: { siteId, slug: pageSlug } },
          data,
        });

        const updated = [
          metaTitle ? "meta title" : "",
          metaDesc ? "meta description" : "",
        ]
          .filter(Boolean)
          .join(" and ");
        return {
          action: "UPDATE_SEO",
          success: true,
          label: `Updated ${updated} on "${pageSlug}"`,
        };
      } catch (err) {
        return {
          action: "UPDATE_SEO",
          success: false,
          label: "Failed to update SEO",
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    }

    // ── APPLY_PRESET ──
    case "APPLY_PRESET": {
      const { preset } = action;
      if (!VALID_PRESETS.includes(preset)) {
        return {
          action: "APPLY_PRESET",
          success: false,
          label: `Invalid preset: ${preset}`,
          error: `Must be one of: ${VALID_PRESETS.join(", ")}`,
        };
      }

      try {
        const site = await prisma.site.findUnique({
          where: { id: siteId },
          select: { activePreset: true },
        });

        recordChange(siteId, {
          action: "APPLY_PRESET",
          table: "Site",
          id: siteId,
          field: "activePreset",
          oldValue: site?.activePreset,
          newValue: preset,
        });

        await prisma.site.update({
          where: { id: siteId },
          data: { activePreset: preset },
        });

        syncDesignToWordPress(siteId).catch(() => {});

        return {
          action: "APPLY_PRESET",
          success: true,
          label: `Applied "${preset}" preset`,
        };
      } catch (err) {
        return {
          action: "APPLY_PRESET",
          success: false,
          label: `Failed to apply preset`,
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    }

    // ── UPDATE_THEME ──
    case "UPDATE_THEME": {
      const { colors, fonts } = action;
      if (!colors && !fonts) {
        return {
          action: "UPDATE_THEME",
          success: false,
          label: "No theme changes provided",
        };
      }

      try {
        const site = await prisma.site.findUnique({
          where: { id: siteId },
          select: { designDocument: true },
        });

        const doc =
          (site?.designDocument as Record<string, unknown>) || {};
        const currentTheme =
          (doc.theme as Record<string, unknown>) || {};
        const currentColors =
          (currentTheme.colors as Record<string, string>) || {};
        const currentFonts =
          (currentTheme.fonts as Record<string, string>) || {};

        recordChange(siteId, {
          action: "UPDATE_THEME",
          table: "Site",
          id: siteId,
          field: "designDocument.theme",
          oldValue: { colors: { ...currentColors }, fonts: { ...currentFonts } },
          newValue: { colors: colors || currentColors, fonts: fonts || currentFonts },
        });

        const updatedTheme = {
          ...currentTheme,
          colors: { ...currentColors, ...(colors || {}) },
          fonts: { ...currentFonts, ...(fonts || {}) },
        };

        await prisma.site.update({
          where: { id: siteId },
          data: {
            designDocument: { ...doc, theme: updatedTheme },
          },
        });

        syncDesignToWordPress(siteId).catch(() => {});

        const parts: string[] = [];
        if (colors) parts.push(`colors (${Object.keys(colors).join(", ")})`);
        if (fonts) parts.push(`fonts (${Object.keys(fonts).join(", ")})`);

        return {
          action: "UPDATE_THEME",
          success: true,
          label: `Updated theme ${parts.join(" and ")}`,
        };
      } catch (err) {
        return {
          action: "UPDATE_THEME",
          success: false,
          label: "Failed to update theme",
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    }

    // ── UPDATE_CSS ──
    case "UPDATE_CSS": {
      const { css } = action;
      try {
        const site = await prisma.site.findUnique({
          where: { id: siteId },
          select: { customCss: true },
        });

        recordChange(siteId, {
          action: "UPDATE_CSS",
          table: "Site",
          id: siteId,
          field: "customCss",
          oldValue: site?.customCss,
          newValue: css,
        });

        await prisma.site.update({
          where: { id: siteId },
          data: { customCss: css, customCssUpdatedAt: new Date() },
        });

        syncDesignToWordPress(siteId).catch(() => {});

        return {
          action: "UPDATE_CSS",
          success: true,
          label: "Updated custom CSS",
        };
      } catch (err) {
        return {
          action: "UPDATE_CSS",
          success: false,
          label: "Failed to update custom CSS",
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    }

    // ── UPDATE_IMAGE ──
    case "UPDATE_IMAGE": {
      const { pageSlug, sectionIndex, propKey, searchQuery } = action;
      try {
        const pexelsKey = process.env.PEXELS_API_KEY;
        if (!pexelsKey) {
          return {
            action: "UPDATE_IMAGE",
            success: false,
            label: "Image search not configured (no PEXELS_API_KEY)",
          };
        }

        // Search Pexels for a matching image
        const params = new URLSearchParams({
          query: searchQuery,
          per_page: "5",
          orientation: "landscape",
        });
        const pexelsRes = await fetch(
          `https://api.pexels.com/v1/search?${params}`,
          { headers: { Authorization: pexelsKey } }
        );

        if (!pexelsRes.ok) {
          return {
            action: "UPDATE_IMAGE",
            success: false,
            label: `Pexels API error: ${pexelsRes.status}`,
          };
        }

        const pexelsData = await pexelsRes.json();
        const photos = pexelsData.photos || [];
        if (photos.length === 0) {
          return {
            action: "UPDATE_IMAGE",
            success: false,
            label: `No images found for "${searchQuery}"`,
          };
        }

        // Pick a random photo from top results
        const photo = photos[Math.floor(Math.random() * photos.length)];
        const imageUrl = `${photo.src.original}?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop`;

        // Update the designDocument
        const site = await prisma.site.findUnique({
          where: { id: siteId },
          select: { designDocument: true },
        });

        const doc = (site?.designDocument as Record<string, unknown>) || {};
        const pages = (doc.pages as Record<string, unknown>) || {};
        const page = pages[pageSlug] as Record<string, unknown> | undefined;

        if (!page?.sections || !Array.isArray(page.sections)) {
          return {
            action: "UPDATE_IMAGE",
            success: false,
            label: `Page "${pageSlug}" not found in design document`,
          };
        }

        const sectionsCopy = [...(page.sections as Record<string, unknown>[])];
        if (sectionIndex < 0 || sectionIndex >= sectionsCopy.length) {
          return {
            action: "UPDATE_IMAGE",
            success: false,
            label: `Section index ${sectionIndex} out of range`,
          };
        }

        const section = { ...sectionsCopy[sectionIndex] };
        const props = { ...(section.props as Record<string, unknown> || {}) };

        // Record for undo — use structured metadata, not dot-path
        recordChange(siteId, {
          action: "UPDATE_IMAGE",
          table: "Site_designDocument_image",
          id: `${pageSlug}:${sectionIndex}:${propKey}`,
          field: "designDocument",
          oldValue: props[propKey],
          newValue: imageUrl,
        });

        props[propKey] = imageUrl;
        section.props = props;
        sectionsCopy[sectionIndex] = section;

        const updatedPages = {
          ...pages,
          [pageSlug]: { ...page, sections: sectionsCopy },
        };

        await prisma.site.update({
          where: { id: siteId },
          data: { designDocument: { ...doc, pages: updatedPages } },
        });

        return {
          action: "UPDATE_IMAGE",
          success: true,
          label: `Updated ${propKey} on ${pageSlug} section ${sectionIndex} with "${searchQuery}" photo`,
        };
      } catch (err) {
        return {
          action: "UPDATE_IMAGE",
          success: false,
          label: "Failed to update image",
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    }

    // ── UNDO ──
    case "UNDO": {
      const log = changeLog.get(siteId);
      if (!log || log.length === 0) {
        return {
          action: "UNDO",
          success: false,
          label: "Nothing to undo — no changes in this session",
        };
      }

      const last = log.pop()!;
      changeLog.set(siteId, log);

      try {
        if (last.table === "Page") {
          const [sid, slug] = last.id.split(":");
          await prisma.page.update({
            where: { siteId_slug: { siteId: sid, slug } },
            data: { [last.field]: last.oldValue as string },
          });
          syncPageToWordPress(siteId, slug).catch(() => {});
        } else if (last.table === "Site") {
          if (last.field === "designDocument.theme") {
            const site = await prisma.site.findUnique({
              where: { id: siteId },
              select: { designDocument: true },
            });
            const doc =
              (site?.designDocument as Record<string, unknown>) || {};
            const old = last.oldValue as Record<string, unknown>;
            await prisma.site.update({
              where: { id: siteId },
              data: {
                designDocument: {
                  ...doc,
                  theme: {
                    ...(doc.theme as Record<string, unknown>),
                    ...old,
                  },
                },
              },
            });
          } else {
            await prisma.site.update({
              where: { id: siteId },
              data: { [last.field]: last.oldValue },
            });
          }
          syncDesignToWordPress(siteId).catch(() => {});
        } else if (last.table === "Site_designDocument_image") {
          // Undo an image change: id format is "pageSlug:sectionIndex:propKey"
          const [pageSlug, idxStr, propKey] = last.id.split(":");
          const sectionIndex = parseInt(idxStr);
          const site = await prisma.site.findUnique({
            where: { id: siteId },
            select: { designDocument: true },
          });
          const doc = (site?.designDocument as Record<string, unknown>) || {};
          const pages = (doc.pages as Record<string, unknown>) || {};
          const page = pages[pageSlug] as Record<string, unknown> | undefined;
          if (page?.sections && Array.isArray(page.sections)) {
            const sectionsCopy = [...(page.sections as Record<string, unknown>[])];
            if (sectionIndex >= 0 && sectionIndex < sectionsCopy.length) {
              const section = { ...sectionsCopy[sectionIndex] };
              const props = { ...(section.props as Record<string, unknown> || {}) };
              props[propKey] = last.oldValue;
              section.props = props;
              sectionsCopy[sectionIndex] = section;
              await prisma.site.update({
                where: { id: siteId },
                data: {
                  designDocument: {
                    ...doc,
                    pages: { ...pages, [pageSlug]: { ...page, sections: sectionsCopy } },
                  },
                },
              });
            }
          }
        }

        return {
          action: "UNDO",
          success: true,
          label: `Reverted: ${last.action} on ${last.field}`,
        };
      } catch (err) {
        return {
          action: "UNDO",
          success: false,
          label: "Failed to undo",
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    }

    // ── NAVIGATE ──
    case "NAVIGATE": {
      return {
        action: "NAVIGATE",
        success: true,
        label: `Navigate to ${action.tab}`,
      };
    }

    // ── INFO ──
    case "INFO": {
      return { action: "INFO", success: true, label: action.message };
    }

    default: {
      return {
        action: "UNKNOWN",
        success: false,
        label: "Unknown action type",
        error: `Unrecognized action: ${JSON.stringify(action)}`,
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Extract section list from designDocument for system prompt
// ---------------------------------------------------------------------------

function extractSections(
  designDocument: unknown
): string | null {
  if (!designDocument || typeof designDocument !== "object") return null;

  const doc = designDocument as Record<string, unknown>;
  const plan = doc._plan as Record<string, unknown> | undefined;
  const components = plan?.components;

  if (Array.isArray(components) && components.length > 0) {
    return components
      .map((c: unknown, i: number) => {
        if (typeof c === "string") return `  ${i + 1}. ${c}`;
        if (typeof c === "object" && c !== null) {
          const comp = c as Record<string, string>;
          return `  ${i + 1}. ${comp.component || comp.type || "unknown"}${comp.page ? ` (page: ${comp.page})` : ""}`;
        }
        return null;
      })
      .filter(Boolean)
      .join("\n");
  }

  // Check pages object (dict keyed by slug) for section data with indices
  const pages = doc.pages;
  if (pages && typeof pages === "object" && !Array.isArray(pages)) {
    const lines: string[] = [];
    for (const [slug, pageVal] of Object.entries(pages as Record<string, unknown>)) {
      if (!pageVal || typeof pageVal !== "object") continue;
      const page = pageVal as Record<string, unknown>;
      const sections = page.sections;
      if (Array.isArray(sections)) {
        lines.push(`  Page "${slug}" (${sections.length} sections):`);
        sections.forEach((s: unknown, idx: number) => {
          if (typeof s === "object" && s !== null) {
            const sec = s as Record<string, unknown>;
            const comp = (sec.component as string) || "unknown";
            const props = (sec.props as Record<string, unknown>) || {};
            // List image props so LLM knows which propKey to use
            const imgProps = Object.keys(props).filter(
              (k) =>
                k.toLowerCase().includes("image") ||
                k.toLowerCase().includes("url") ||
                k.toLowerCase().includes("avatar") ||
                k.toLowerCase().includes("src") ||
                k.toLowerCase().includes("logo")
            );
            const imgInfo = imgProps.length > 0 ? ` [images: ${imgProps.join(", ")}]` : "";
            lines.push(`    [${idx}] ${comp}${imgInfo}`);
          }
        });
      }
    }
    if (lines.length) return lines.join("\n");
  }

  // Fallback: check pages as array
  if (Array.isArray(pages)) {
    const lines: string[] = [];
    for (const p of pages) {
      if (typeof p === "object" && p !== null) {
        const page = p as Record<string, unknown>;
        const sections = page.sections;
        if (Array.isArray(sections)) {
          for (const s of sections) {
            if (typeof s === "object" && s !== null) {
              const sec = s as Record<string, string>;
              lines.push(
                `  - ${sec.component || "unknown"} (${page.slug || "?"})`
              );
            }
          }
        }
      }
    }
    if (lines.length) return lines.join("\n");
  }

  return null;
}

// ---------------------------------------------------------------------------
// Extract current theme tokens for system prompt
// ---------------------------------------------------------------------------

function extractThemeTokens(
  designDocument: unknown
): string | null {
  if (!designDocument || typeof designDocument !== "object") return null;
  const doc = designDocument as Record<string, unknown>;
  const theme = doc.theme as Record<string, unknown> | undefined;
  if (!theme) return null;

  const lines: string[] = [];
  const colors = theme.colors as Record<string, string> | undefined;
  if (colors) {
    lines.push(
      `  Colors: ${Object.entries(colors)
        .map(([k, v]) => `${k}=${v}`)
        .join(", ")}`
    );
  }
  const fonts = theme.fonts as Record<string, string> | undefined;
  if (fonts) {
    lines.push(
      `  Fonts: ${Object.entries(fonts)
        .map(([k, v]) => `${k}=${v}`)
        .join(", ")}`
    );
  }
  return lines.length ? lines.join("\n") : null;
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    // 1. Auth
    const session = await getServerSession(authOptions);
    const auth = await getStudioAuth(session?.user?.email, siteId, "edit");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const body = await req.json();
    const { message, history } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const validHistory: HistoryMessage[] = Array.isArray(history)
      ? history
          .filter(
            (m: HistoryMessage) =>
              m &&
              typeof m.text === "string" &&
              (m.role === "user" || m.role === "assistant")
          )
          .slice(-10)
      : [];

    // 3. Fetch site data — include page content for introspection + design doc
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: {
        businessName: true,
        archetype: true,
        activePreset: true,
        designDocument: true,
        customCss: true,
        themePoolEntry: { select: { name: true } },
        pages: {
          select: {
            slug: true,
            title: true,
            heroHeadline: true,
            heroSubheadline: true,
            ctaLabel: true,
            metaTitle: true,
            metaDesc: true,
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // 4. Build system prompt with full context
    const designSections = extractSections(site.designDocument);
    const themeTokens = extractThemeTokens(site.designDocument);
    const hasUndo = (changeLog.get(siteId)?.length || 0) > 0;

    const systemPrompt = buildSystemPrompt(
      site.businessName,
      site.archetype,
      site.pages,
      site.activePreset,
      site.themePoolEntry?.name ?? null,
      designSections,
      themeTokens,
      hasUndo
    );

    const fullPrompt = buildPromptWithHistory(message.trim(), validHistory);
    const llmResult = await geminiFlash(fullPrompt, systemPrompt);

    if (!llmResult) {
      return NextResponse.json(
        {
          reply:
            "I'm having trouble processing your request right now. Please try again in a moment.",
          actions: [],
        },
        { status: 200 }
      );
    }

    // 5. Parse & execute
    const { reply, actions } = parseLLMResponse(llmResult.text);
    const results: ActionResult[] = [];
    let navigateTo: string | undefined;

    for (const action of actions) {
      const result = await executeAction(siteId, action);
      results.push(result);
      if (action.action === "NAVIGATE") {
        navigateTo = (action as { tab: string }).tab;
      }
    }

    return NextResponse.json({
      reply,
      actions: results,
      ...(navigateTo ? { navigateTo } : {}),
    });
  } catch (error) {
    console.error("[studio/agent POST]", error);
    return NextResponse.json(
      { error: "Failed to process agent request" },
      { status: 500 }
    );
  }
}
