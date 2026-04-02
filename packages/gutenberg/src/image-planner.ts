// =============================================================================
// Image Planner — Contextual stock photo selection for all site sections
// Searches Pexels based on business type, industry, and section purpose.
// Pure logic — no Prisma dependency. Called by the host app's image agent.
// =============================================================================

const PEXELS_API_URL = "https://api.pexels.com/v1/search";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  photographer: string;
  alt: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
  };
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[];
  total_results: number;
}

export interface SiteImage {
  slot: string; // e.g., "hero", "service_0", "gallery_2", "team_0", "testimonial_avatar_0"
  url: string; // Pexels CDN URL
  photographer: string;
  alt: string;
  width: number;
  height: number;
}

export interface ImagePlan {
  hero: SiteImage | null;
  pageHeroes: Record<string, SiteImage>; // per-page hero images keyed by slug
  services: SiteImage[];
  gallery: SiteImage[];
  team: SiteImage[];
  testimonialAvatars: SiteImage[];
  extras: SiteImage[]; // CTA backgrounds, section backgrounds, etc.
}

export interface BusinessContext {
  name: string;
  industry: string; // e.g., "HVAC", "dental", "restaurant"
  archetype: string; // SERVICE, VENUE, PORTFOLIO, COMMERCE
  description?: string;
  tagline?: string;
  imageryThemes?: string[];
  serviceNames?: string[];
  teamCount?: number;
  testimonialCount?: number;
}

// ---------------------------------------------------------------------------
// Search query builders — context-aware, industry-specific
// ---------------------------------------------------------------------------

/** Extract meaningful keywords from a description string */
function extractKeywords(text: string, limit = 3): string[] {
  const stopWords = new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "we", "our", "us", "your", "their", "this", "that", "it", "its",
    "has", "have", "had", "do", "does", "did", "will", "would", "can",
    "could", "should", "may", "might", "shall", "not", "no", "all",
    "also", "just", "about", "more", "very", "so", "up", "out",
    "as", "if", "than", "then", "too", "each", "every", "any", "such",
    "provide", "offering", "offer", "service", "services", "business",
    "company", "based", "specializing", "providing", "quality",
  ]);
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w))
    .slice(0, limit);
}

interface QueryPlan {
  queries: Record<string, string[]>;
  pageHeroQueries: Record<string, string[]>;
}

/** Build search queries for different image purposes */
function buildQueries(ctx: BusinessContext): QueryPlan {
  const ind = ctx.industry.toLowerCase();

  // Extract useful keywords from business description
  const descKeywords = ctx.description ? extractKeywords(ctx.description) : [];

  // Build more specific hero queries
  const heroQueries: string[] = [];
  if (ctx.serviceNames?.length) {
    heroQueries.push(`${ctx.serviceNames[0].toLowerCase()} ${ind}`);
  }
  if (descKeywords.length > 0) {
    heroQueries.push(`${descKeywords.join(" ")} ${ind}`);
  }
  if (ctx.imageryThemes?.length) {
    heroQueries.push(...ctx.imageryThemes.slice(0, 2).map((t) => `${t.replace(/_/g, " ")} ${ind}`));
  }
  heroQueries.push(`${ind} professional`, ind);

  // Page-specific hero queries
  const pageHeroQueries: Record<string, string[]> = {
    about: [
      `${ind} team office workspace`,
      `${ind} company team`,
      `professional team ${ind}`,
    ],
    services: [
      `${ind} work in progress`,
      `${ind} professional tools`,
      `${ind} expert working`,
    ],
    contact: [
      `customer service communication`,
      `business office reception`,
      `friendly customer support`,
    ],
    shop: [
      `${ind} store products`,
      `${ind} shopping retail`,
      `${ind} product display`,
    ],
  };

  // Build per-purpose queries (ordered best→worst)
  const queries: Record<string, string[]> = {
    hero: heroQueries,
    services: ctx.serviceNames?.length
      ? ctx.serviceNames.map((s) => `${s.toLowerCase()} ${ind} professional`)
      : [`${ind} work`, `${ind} service`, `${ind} tools equipment`],
    gallery: [
      `${ind} portfolio completed work`,
      `${ind} project results`,
      `${ind} before after`,
    ],
    team: [
      "professional person portrait headshot",
      "business team member portrait",
      "worker professional portrait",
    ],
    testimonialAvatars: [
      "person portrait headshot smiling",
      "happy customer portrait",
    ],
    extras: [
      `${ind} office workspace`,
      `${ind} detail close-up`,
      `${ind} tools equipment`,
    ],
  };

  return { queries, pageHeroQueries };
}

// ---------------------------------------------------------------------------
// Pexels API search with caching
// ---------------------------------------------------------------------------

// In-memory cache for this process lifetime
const searchCache = new Map<string, PexelsPhoto[]>();

async function searchPexels(
  query: string,
  orientation: "landscape" | "portrait" | "square" = "landscape",
  perPage = 10
): Promise<PexelsPhoto[]> {
  const cacheKey = `${query}|${orientation}|${perPage}`;
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.warn("[image-planner] No PEXELS_API_KEY configured.");
    return [];
  }

  try {
    const params = new URLSearchParams({
      query,
      orientation,
      size: "large",
      per_page: String(perPage),
    });

    const res = await fetch(`${PEXELS_API_URL}?${params}`, {
      headers: { Authorization: apiKey },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.warn(`[image-planner] Pexels ${res.status} for "${query}"`);
      return [];
    }

    const data: PexelsSearchResponse = await res.json();
    const photos = data.photos || [];
    searchCache.set(cacheKey, photos);
    return photos;
  } catch (err) {
    console.warn(`[image-planner] Search failed for "${query}":`, err instanceof Error ? err.message : err);
    return [];
  }
}

/** Pick the best photo for a given purpose — prefers wider for hero, taller for portraits */
function pickPhoto(
  photos: PexelsPhoto[],
  idx: number,
  preferLandscape = true
): PexelsPhoto | null {
  if (photos.length === 0) return null;

  if (preferLandscape) {
    const sorted = [...photos].sort((a, b) => {
      const rA = a.width / a.height;
      const rB = b.width / b.height;
      if (rA >= 1.4 && rB < 1.4) return -1;
      if (rB >= 1.4 && rA < 1.4) return 1;
      return b.width * b.height - a.width * a.height;
    });
    return sorted[idx % sorted.length];
  }

  const sorted = [...photos].sort((a, b) => {
    const rA = a.height / a.width;
    const rB = b.height / b.width;
    if (rA >= 1.2 && rB < 1.2) return -1;
    if (rB >= 1.2 && rA < 1.2) return 1;
    return b.width * b.height - a.width * a.height;
  });
  return sorted[idx % sorted.length];
}

function toSiteImage(photo: PexelsPhoto, slot: string): SiteImage {
  return {
    slot,
    url: photo.src.large2x,
    photographer: photo.photographer,
    alt: photo.alt || slot.replace(/_/g, " "),
    width: photo.width,
    height: photo.height,
  };
}

// ---------------------------------------------------------------------------
// Main Image Planner — generates a complete ImagePlan for a site
// ---------------------------------------------------------------------------

export async function generateImagePlan(ctx: BusinessContext): Promise<ImagePlan> {
  console.log(`[image-planner] Generating image plan for "${ctx.name}" (${ctx.industry} / ${ctx.archetype})`);

  const { queries, pageHeroQueries } = buildQueries(ctx);
  const plan: ImagePlan = {
    hero: null,
    pageHeroes: {},
    services: [],
    gallery: [],
    team: [],
    testimonialAvatars: [],
    extras: [],
  };

  // --- Hero (main / home page) ---
  for (const q of queries.hero) {
    const photos = await searchPexels(q, "landscape", 10);
    if (photos.length > 0) {
      plan.hero = toSiteImage(pickPhoto(photos, 0, true)!, "hero");
      console.log(`[image-planner] Hero: "${q}" → ${plan.hero.alt || plan.hero.url.slice(-40)}`);
      break;
    }
  }

  // --- Per-page hero images (about, services, contact, shop) ---
  const usedPhotoIds = new Set<number>();
  if (plan.hero) {
    const mainUrl = plan.hero.url;
    const idMatch = mainUrl.match(/\/photos\/(\d+)\//);
    if (idMatch) usedPhotoIds.add(parseInt(idMatch[1], 10));
  }

  for (const [pageSlug, pageQueries] of Object.entries(pageHeroQueries)) {
    for (const q of pageQueries) {
      const photos = await searchPexels(q, "landscape", 10);
      const available = photos.filter((p) => !usedPhotoIds.has(p.id));
      if (available.length > 0) {
        const photo = pickPhoto(available, 0, true)!;
        usedPhotoIds.add(photo.id);
        plan.pageHeroes[pageSlug] = toSiteImage(photo, `hero_${pageSlug}`);
        console.log(`[image-planner] Hero (${pageSlug}): "${q}" → ${photo.alt || photo.src.large2x.slice(-40)}`);
        break;
      }
    }
  }

  // --- Services (one per service, up to 6) ---
  const serviceCount = Math.min(ctx.serviceNames?.length || 3, 6);
  for (let i = 0; i < serviceCount; i++) {
    const q = queries.services[i % queries.services.length];
    const photos = await searchPexels(q, "landscape", 10);
    const photo = pickPhoto(photos, i, true);
    if (photo) {
      plan.services.push(toSiteImage(photo, `service_${i}`));
    }
  }
  if (plan.services.length > 0) {
    console.log(`[image-planner] Services: ${plan.services.length} images found`);
  }

  // --- Gallery (up to 8 portfolio/work images) ---
  for (const q of queries.gallery) {
    const photos = await searchPexels(q, "landscape", 15);
    if (photos.length >= 4) {
      for (let i = 0; i < Math.min(8, photos.length); i++) {
        plan.gallery.push(toSiteImage(photos[i], `gallery_${i}`));
      }
      console.log(`[image-planner] Gallery: ${plan.gallery.length} images`);
      break;
    }
  }

  // --- Team member headshots ---
  const teamCount = ctx.teamCount || 4;
  if (teamCount > 0) {
    for (const q of queries.team) {
      const photos = await searchPexels(q, "portrait", 10);
      if (photos.length >= teamCount) {
        for (let i = 0; i < teamCount; i++) {
          plan.team.push(toSiteImage(photos[i], `team_${i}`));
        }
        console.log(`[image-planner] Team: ${plan.team.length} portraits`);
        break;
      }
    }
  }

  // --- Testimonial avatars ---
  const testimonialCount = ctx.testimonialCount || 0;
  if (testimonialCount > 0) {
    for (const q of queries.testimonialAvatars) {
      const photos = await searchPexels(q, "square", 10);
      if (photos.length >= testimonialCount) {
        for (let i = 0; i < testimonialCount; i++) {
          plan.testimonialAvatars.push(toSiteImage(photos[i], `testimonial_avatar_${i}`));
        }
        console.log(`[image-planner] Avatars: ${plan.testimonialAvatars.length} portraits`);
        break;
      }
    }
  }

  // --- Extra images (CTA backgrounds, section backgrounds) ---
  for (const q of queries.extras) {
    const photos = await searchPexels(q, "landscape", 8);
    if (photos.length > 0) {
      for (let i = 0; i < Math.min(3, photos.length); i++) {
        plan.extras.push(toSiteImage(photos[i], `extra_${i}`));
      }
      break;
    }
  }

  const total =
    (plan.hero ? 1 : 0) +
    Object.keys(plan.pageHeroes).length +
    plan.services.length +
    plan.gallery.length +
    plan.team.length +
    plan.testimonialAvatars.length +
    plan.extras.length;

  console.log(`[image-planner] Plan complete: ${total} images total`);
  return plan;
}
