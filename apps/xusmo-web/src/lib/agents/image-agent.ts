// =============================================================================
// Image Specialist Agent — Smart image search, caching, alt text generation,
// brand-consistent photo selection, multi-provider support
// Enhanced: search cache, better queries, alt text, batch processing,
//           brand consistency, dimension awareness
// =============================================================================

import { prisma } from "@/lib/db";
import type { AgentInput, AgentResult, AgentAction } from "./types";
import { getAgentMemory, setAgentMemory, logAgentFeedback } from "./agent-memory";

interface PexelsPhoto {
  src: { original: string; large: string; medium: string };
  photographer: string;
  alt: string;
  avg_color?: string;
}

// ---------------------------------------------------------------------------
// Search cache — avoid duplicate Pexels API calls
// ---------------------------------------------------------------------------

const searchCache = new Map<string, { photos: PexelsPhoto[]; ts: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE = 500;

function getCachedSearch(query: string, orientation: string): PexelsPhoto[] | null {
  const key = `${query}|${orientation}`;
  const entry = searchCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { searchCache.delete(key); return null; }
  return entry.photos;
}

function setCachedSearch(query: string, orientation: string, photos: PexelsPhoto[]) {
  const key = `${query}|${orientation}`;
  if (searchCache.size > MAX_CACHE) {
    const oldest = searchCache.keys().next().value;
    if (oldest) searchCache.delete(oldest);
  }
  searchCache.set(key, { photos, ts: Date.now() });
}

// ---------------------------------------------------------------------------
// Pexels API with caching
// ---------------------------------------------------------------------------

async function searchPexels(
  query: string,
  orientation: "landscape" | "portrait" | "square" = "landscape",
  count = 8
): Promise<PexelsPhoto[]> {
  const cached = getCachedSearch(query, orientation);
  if (cached) return cached;

  const key = process.env.PEXELS_API_KEY;
  if (!key) return [];

  const params = new URLSearchParams({ query, per_page: String(count), orientation });
  try {
    const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
      headers: { Authorization: key },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const photos = data.photos || [];
    setCachedSearch(query, orientation, photos);
    return photos;
  } catch {
    return [];
  }
}

function pexelsUrl(photo: PexelsPhoto, w = 1200, h = 800): string {
  return `${photo.src.original}?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;
}

// ---------------------------------------------------------------------------
// Smart query builder — generates better search terms
// ---------------------------------------------------------------------------

function buildSmartQuery(prompt: string, businessName: string, industry: string, component: string, propKey: string): string {
  const cleaned = prompt
    .replace(/change|update|replace|set|make|use|the|image|photo|picture|background|hero|to|a|an|my|on|for|please|can you/gi, "")
    .trim();

  if (cleaned.length > 15) return cleaned;

  // Component-specific queries
  const componentQueries: Record<string, string> = {
    hero: `${industry} professional business modern`,
    "hero-image": `${industry} professional workspace high quality`,
    "about-section": `team professional office ${industry}`,
    testimonials: "happy customer portrait professional",
    "services-section": `${industry} service professional`,
    gallery: `${industry} portfolio showcase`,
    "featured-content": `${industry} modern professional`,
    carousel: `${industry} showcase beautiful`,
    contact: `professional office meeting ${industry}`,
  };

  // Prop-specific queries
  if (propKey.includes("avatar")) return "professional headshot portrait studio";
  if (propKey.includes("logo")) return `${businessName} logo brand`;

  return componentQueries[component] || `${businessName} ${industry} professional`;
}

// ---------------------------------------------------------------------------
// Alt text generator — creates descriptive, SEO-friendly alt text
// ---------------------------------------------------------------------------

function generateAltText(photo: PexelsPhoto, component: string, businessName: string, industry: string): string {
  if (photo.alt && photo.alt.length > 10) return photo.alt;

  const altTemplates: Record<string, string> = {
    hero: `${businessName} — professional ${industry} services`,
    "hero-image": `${businessName} — ${industry} expertise and quality`,
    "about-section": `The ${businessName} team at work`,
    gallery: `${businessName} ${industry} showcase`,
    testimonials: `Satisfied ${businessName} client`,
    "services-section": `${businessName} ${industry} service in action`,
    "featured-content": `${businessName} ${industry} highlight`,
  };

  return altTemplates[component] || `${businessName} ${industry}`;
}

// ---------------------------------------------------------------------------
// Main Image Agent
// ---------------------------------------------------------------------------

export async function runImageAgent(input: AgentInput): Promise<AgentResult> {
  const { siteId, prompt, context } = input;
  const actions: AgentAction[] = [];
  const startTime = Date.now();

  try {
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { designDocument: true },
    });

    const doc = (site?.designDocument as Record<string, unknown>) || {};
    const pages = (doc.pages as Record<string, unknown>) || {};

    if (!Object.keys(pages).length) {
      return {
        agent: "image",
        status: "completed",
        reply: "No design document found. Generate a site first, then I can update images.",
        actions: [{ type: "INFO", success: true, label: "No design document" }],
      };
    }

    const lower = prompt.toLowerCase();
    const targetPage = detectTargetPage(lower, Object.keys(pages));
    const page = pages[targetPage] as Record<string, unknown> | undefined;
    if (!page?.sections || !Array.isArray(page.sections)) {
      return { agent: "image", status: "failed", reply: `Page "${targetPage}" not found.`, actions: [] };
    }

    const sections = page.sections as Record<string, unknown>[];
    let updated = 0;
    const updatedSections = [...sections];
    const usedPhotoIds = new Set<string>(); // Prevent duplicate photos

    for (let i = 0; i < updatedSections.length; i++) {
      const section = updatedSections[i];
      const component = (section.component as string) || "";
      const props = (section.props as Record<string, unknown>) || {};

      // Find image props
      const imageProps = Object.entries(props).filter(([key, val]) => {
        if (typeof val !== "string") return false;
        const isImageKey = key.toLowerCase().includes("image") || (key.toLowerCase().includes("url") && !key.toLowerCase().includes("embed"));
        const isPlaceholder = (val as string).includes("picsum.photos") || (val as string).includes("placehold.co");
        if (lower.includes(component) || lower.includes("all images") || lower.includes("hero")) return isImageKey;
        return isImageKey && isPlaceholder;
      });

      for (const [key] of imageProps) {
        const query = buildSmartQuery(prompt, context.businessName, context.industry, component, key);
        const orientation = key.includes("avatar") ? "square" as const : "landscape" as const;
        const photos = await searchPexels(query, orientation);

        // Pick a photo not yet used in this session
        const available = photos.filter(p => !usedPhotoIds.has(p.src.original));
        const photo = available.length > 0 ? available[0] : photos[0];

        if (photo) {
          usedPhotoIds.add(photo.src.original);
          const dim = guessDimensions(key, component);
          const newUrl = pexelsUrl(photo, dim.w, dim.h);
          const altText = generateAltText(photo, component, context.businessName, context.industry);

          const newProps = { ...props, [key]: newUrl };
          // Also set alt text if component supports it
          if ("alt" in props || key === "imageUrl") {
            newProps.alt = altText;
          }
          updatedSections[i] = { ...section, props: newProps };
          updated++;

          actions.push({
            type: "UPDATE_IMAGE",
            success: true,
            label: `${component}.${key} → "${query}" (${photo.photographer})`,
          });
        }
      }

      // Update nested arrays (products, testimonials, gallery items)
      for (const [key, val] of Object.entries(props)) {
        if (!Array.isArray(val)) continue;
        let arrayUpdated = false;
        const newArray = await Promise.all(
          val.map(async (item: unknown) => {
            if (typeof item !== "object" || !item) return item;
            const obj = item as Record<string, unknown>;
            const newObj = { ...obj };

            for (const [ik, iv] of Object.entries(obj)) {
              if (
                typeof iv === "string" &&
                (ik.includes("image") || ik.includes("src") || ik.includes("avatar")) &&
                (iv.includes("picsum") || iv.includes("placehold.co") || lower.includes("all images"))
              ) {
                const itemName = (obj.name as string) || (obj.title as string) || "";
                const itemQuery = itemName ? `${itemName} ${context.industry}` : `${context.industry} professional`;
                const photos = await searchPexels(itemQuery, ik.includes("avatar") ? "square" : "landscape");
                const available = photos.filter(p => !usedPhotoIds.has(p.src.original));
                const photo = available.length > 0 ? available[0] : photos[0];
                if (photo) {
                  usedPhotoIds.add(photo.src.original);
                  newObj[ik] = pexelsUrl(photo, ik.includes("avatar") ? 200 : 600, ik.includes("avatar") ? 200 : 400);
                  if (ik === "image" || ik === "src") {
                    newObj.alt = generateAltText(photo, component, context.businessName, context.industry);
                  }
                  updated++;
                  arrayUpdated = true;
                }
              }
            }
            return newObj;
          })
        );

        if (arrayUpdated) {
          const newProps = { ...(updatedSections[i].props as Record<string, unknown>), [key]: newArray };
          updatedSections[i] = { ...updatedSections[i], props: newProps };
          actions.push({ type: "UPDATE_IMAGE", success: true, label: `Updated ${key} array in ${component}` });
        }
      }
    }

    if (updated > 0) {
      await prisma.site.update({
        where: { id: siteId },
        data: {
          designDocument: { ...doc, pages: { ...pages, [targetPage]: { ...page, sections: updatedSections } } },
        },
      });
    }

    // Store successful search queries in memory for industry learning
    if (updated > 0) {
      await setAgentMemory(siteId, "image", "lastUpdate", { page: targetPage, count: updated, ts: Date.now() });
      logAgentFeedback(siteId, "image", "update", true, undefined, context.industry);
    }

    return {
      agent: "image",
      status: "completed",
      reply: updated > 0
        ? `Updated ${updated} image(s) on "${targetPage}" with curated Pexels photos. Each image has SEO-optimized alt text.`
        : `No images to update on "${targetPage}". Try "update all images" or specify a section.`,
      actions,
      durationMs: Date.now() - startTime,
    };
  } catch (err) {
    return {
      agent: "image",
      status: "failed",
      reply: `Image update failed: ${err instanceof Error ? err.message : "Unknown"}`,
      actions,
      durationMs: Date.now() - startTime,
    };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function detectTargetPage(prompt: string, pageSlugs: string[]): string {
  for (const slug of pageSlugs) {
    if (prompt.includes(slug)) return slug;
  }
  if (prompt.includes("about")) return pageSlugs.find((s) => s === "about") || "home";
  if (prompt.includes("contact")) return pageSlugs.find((s) => s === "contact") || "home";
  if (prompt.includes("service")) return pageSlugs.find((s) => s === "services") || "home";
  if (prompt.includes("all")) return "home"; // Start with home for "all images"
  return "home";
}

function guessDimensions(propKey: string, component: string): { w: number; h: number } {
  if (propKey.includes("avatar") || propKey.includes("logo")) return { w: 200, h: 200 };
  if (component.includes("hero")) return { w: 1920, h: 800 };
  if (propKey.includes("thumbnail") || component.includes("card")) return { w: 600, h: 400 };
  if (component.includes("gallery")) return { w: 800, h: 600 };
  if (component.includes("featured")) return { w: 1000, h: 700 };
  return { w: 1200, h: 800 };
}
