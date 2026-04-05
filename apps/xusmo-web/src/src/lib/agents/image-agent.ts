// =============================================================================
// Image Agent — Searches Pexels, replaces images in designDocument
// Can update hero images, section backgrounds, product photos, team avatars.
// =============================================================================

import { prisma } from "@/lib/db";
import type { AgentInput, AgentResult, AgentAction } from "./types";

interface PexelsPhoto {
  src: { original: string; large: string; medium: string };
  photographer: string;
  alt: string;
}

async function searchPexels(
  query: string,
  orientation: "landscape" | "portrait" | "square" = "landscape",
  count = 5
): Promise<PexelsPhoto[]> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return [];

  const params = new URLSearchParams({
    query,
    per_page: String(count),
    orientation,
  });

  const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
    headers: { Authorization: key },
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.photos || [];
}

function pexelsUrl(photo: PexelsPhoto, w = 1200, h = 800): string {
  return `${photo.src.original}?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;
}

export async function runImageAgent(input: AgentInput): Promise<AgentResult> {
  const { siteId, prompt, context } = input;
  const actions: AgentAction[] = [];
  const startTime = Date.now();

  try {
    // Load the design document
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

    // Determine what the user wants from the prompt
    const lower = prompt.toLowerCase();
    const targetPage = detectTargetPage(lower, Object.keys(pages));
    const searchQuery = extractImageQuery(prompt, context.businessName, context.industry);

    // Find image props in targeted page
    const page = pages[targetPage] as Record<string, unknown> | undefined;
    if (!page?.sections || !Array.isArray(page.sections)) {
      return {
        agent: "image",
        status: "failed",
        reply: `Page "${targetPage}" not found.`,
        actions: [],
      };
    }

    const sections = page.sections as Record<string, unknown>[];
    let updated = 0;

    // Find sections with image props and update them
    const updatedSections = [...sections];

    for (let i = 0; i < updatedSections.length; i++) {
      const section = updatedSections[i];
      const component = (section.component as string) || "";
      const props = (section.props as Record<string, unknown>) || {};

      // Determine which image props to update based on the prompt
      const imageProps = Object.entries(props).filter(([key, val]) => {
        if (typeof val !== "string") return false;
        const isImageKey =
          key.toLowerCase().includes("image") ||
          key.toLowerCase().includes("url") && !key.toLowerCase().includes("embed");
        const isPicsum = (val as string).includes("picsum.photos");
        const isPlaceholder = (val as string).includes("placehold.co");

        // Update if user specifically targets this section or if it's a placeholder
        if (lower.includes(component) || lower.includes("all images") || lower.includes("hero")) {
          return isImageKey;
        }
        return isImageKey && (isPicsum || isPlaceholder);
      });

      for (const [key, oldVal] of imageProps) {
        const photos = await searchPexels(searchQuery);
        if (photos.length > 0) {
          const photo = photos[Math.floor(Math.random() * photos.length)];
          const dim = guessDimensions(key, component);
          const newUrl = pexelsUrl(photo, dim.w, dim.h);

          const newProps = { ...props, [key]: newUrl };
          updatedSections[i] = { ...section, props: newProps };
          updated++;

          actions.push({
            type: "UPDATE_IMAGE",
            success: true,
            label: `Updated ${component}.${key} with "${searchQuery}" photo`,
            data: { pageSlug: targetPage, sectionIndex: i, propKey: key, oldUrl: oldVal, newUrl },
          });
        }
      }

      // Also update nested image arrays (products, testimonials, gallery)
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
                const itemQuery = (obj.name as string) || (obj.title as string) || searchQuery;
                const photos = await searchPexels(`${itemQuery} ${context.industry}`);
                if (photos.length > 0) {
                  const photo = photos[Math.floor(Math.random() * photos.length)];
                  newObj[ik] = pexelsUrl(photo, 600, 400);
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
          actions.push({
            type: "UPDATE_IMAGE",
            success: true,
            label: `Updated ${key} array images in ${component}`,
          });
        }
      }
    }

    // Save if anything changed
    if (updated > 0) {
      await prisma.site.update({
        where: { id: siteId },
        data: {
          designDocument: {
            ...doc,
            pages: { ...pages, [targetPage]: { ...page, sections: updatedSections } },
          },
        },
      });
    }

    return {
      agent: "image",
      status: "completed",
      reply: updated > 0
        ? `Updated ${updated} image(s) on the ${targetPage} page with "${searchQuery}" photos from Pexels.`
        : `No images to update on the ${targetPage} page. Try specifying which section's image to change.`,
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
  return "home";
}

function extractImageQuery(prompt: string, businessName: string, industry: string): string {
  // Remove action words to get the image description
  const cleaned = prompt
    .replace(/change|update|replace|set|make|use|the|image|photo|picture|background|hero|to|a|an|my|on|for/gi, "")
    .trim();

  if (cleaned.length > 10) return cleaned;
  return `${businessName} ${industry} professional`;
}

function guessDimensions(propKey: string, component: string): { w: number; h: number } {
  if (propKey.includes("avatar") || propKey.includes("logo")) return { w: 200, h: 200 };
  if (component.includes("hero")) return { w: 1920, h: 800 };
  if (propKey.includes("thumbnail") || component.includes("card")) return { w: 600, h: 400 };
  return { w: 1200, h: 800 };
}
