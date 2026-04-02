// =============================================================================
// Pexels API Client — Search for stock photos for site sections
// Free API: sign up at pexels.com/api for an instant key
// =============================================================================

const PEXELS_API_URL = "https://api.pexels.com/v1/search";

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
  };
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[];
  total_results: number;
}

export interface HeroImageResult {
  url: string;
  photographer: string;
  alt: string;
}

/**
 * Search Pexels for a hero background image using business context.
 * Returns the best landscape photo or null if unavailable.
 */
export async function searchHeroImage(
  imageryThemes: string[],
  businessName: string,
  businessDescription?: string,
  businessTagline?: string,
  archetype?: string
): Promise<HeroImageResult | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.warn("[pexels] No PEXELS_API_KEY configured — skipping hero image.");
    return null;
  }

  // Build multiple search queries to try — best to worst
  const queries = buildSearchQueries(businessName, businessDescription, businessTagline, imageryThemes, archetype);
  console.log(`[pexels] Will try queries:`, queries);

  // Try each query until we get good results
  for (const query of queries) {
    try {
      console.log(`[pexels] Trying: "${query}"`);
      const params = new URLSearchParams({
        query,
        orientation: "landscape",
        size: "large",
        per_page: "8",
      });

      const res = await fetch(`${PEXELS_API_URL}?${params}`, {
        headers: { Authorization: apiKey },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        console.warn(`[pexels] API returned ${res.status}: ${res.statusText}`);
        continue;
      }

      const data: PexelsSearchResponse = await res.json();

      if (data.photos && data.photos.length > 0) {
        const photo = pickBestPhoto(data.photos);
        console.log(`[pexels] Found: "${photo.alt}" by ${photo.photographer}`);
        return {
          url: photo.src.large2x,
          photographer: photo.photographer,
          alt: photo.alt || `${businessName} hero image`,
        };
      }
    } catch (err) {
      console.warn(`[pexels] Query "${query}" failed:`, err instanceof Error ? err.message : err);
    }
  }

  console.warn("[pexels] All queries returned no results.");
  return null;
}

/**
 * Build a ranked list of search queries to try (best to worst).
 * Uses tagline > description > imageryThemes as signal sources.
 * Returns 2-3 queries to try in order.
 */
function buildSearchQueries(
  businessName: string,
  businessDescription?: string,
  businessTagline?: string,
  imageryThemes?: string[],
  archetype?: string
): string[] {
  const stopWords = new Set([
    "a", "an", "the", "and", "or", "of", "for", "in", "on", "at", "to",
    "is", "are", "was", "were", "be", "been", "with", "that", "this",
    "our", "your", "we", "us", "from", "by", "as", "has", "have", "had",
    "will", "can", "its", "it", "their", "they", "but", "not", "all",
    "each", "every", "any", "most", "more", "also", "very", "just",
    "about", "into", "over", "such", "through", "up", "out",
    "online", "offline", "best", "top", "great", "new",
    "get", "let", "make", "well",
  ]);

  function extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));
  }

  const queries: string[] = [];

  // Query 1: Tagline keywords (LLM-generated — usually meaningful)
  if (businessTagline) {
    const tagWords = extractKeywords(businessTagline);
    if (tagWords.length >= 2) {
      queries.push(tagWords.slice(0, 4).join(" "));
    }
  }

  // Query 2: Description keywords
  if (businessDescription) {
    const descWords = extractKeywords(businessDescription);
    if (descWords.length >= 1) {
      queries.push(descWords.slice(0, 3).join(" "));
    }
  }

  // Query 3: Best imagery themes (pick 2 most visual ones, joined)
  if (imageryThemes && imageryThemes.length > 0) {
    const skipThemes = new Set(["storefront", "store_interior", "happy_shoppers"]);
    const visualThemes = imageryThemes
      .filter((t) => !skipThemes.has(t))
      .map((t) => t.replace(/_/g, " "));
    if (visualThemes.length > 0) {
      queries.push(visualThemes.slice(0, 2).join(" "));
    }
  }

  // Archetype-based fallback for common site types
  if (queries.length === 0) {
    const archetypeFallback: Record<string, string> = {
      COMMERCE: "shopping products retail colorful",
      SERVICE: "professional business team office",
      RESTAURANT: "restaurant food dining",
      PORTFOLIO: "creative workspace design",
      BLOG: "writing creative workspace",
    };
    queries.push(archetypeFallback[archetype ?? ""] ?? "professional business");
  }

  return queries;
}

/**
 * Pick the best photo — prefer wider landscape images for hero backgrounds.
 */
function pickBestPhoto(photos: PexelsPhoto[]): PexelsPhoto {
  // Sort by aspect ratio (widest first) then by resolution
  const sorted = [...photos].sort((a, b) => {
    const ratioA = a.width / a.height;
    const ratioB = b.width / b.height;
    // Prefer photos with 16:9 or wider aspect ratio
    if (ratioA >= 1.5 && ratioB < 1.5) return -1;
    if (ratioB >= 1.5 && ratioA < 1.5) return 1;
    // Among similar ratios, prefer higher resolution
    return b.width * b.height - a.width * a.height;
  });
  return sorted[0];
}

// ---------------------------------------------------------------------------
// Batch section image fetch — hero + services + CTA in 1 API call
// ---------------------------------------------------------------------------

export interface SectionImageResult {
  hero: HeroImageResult | null;
  services: HeroImageResult[];
  cta: HeroImageResult | null;
}

/**
 * Batch-fetch images for all page sections in a single Pexels API call.
 * Returns CDN URLs that can be used directly in wp:image blocks.
 * Only the hero image needs WP media upload (for wp:cover attachment ID).
 */
export async function searchSectionImages(
  imageryThemes: string[],
  businessName: string,
  businessDescription?: string,
  businessTagline?: string,
  archetype?: string
): Promise<SectionImageResult> {
  const empty: SectionImageResult = { hero: null, services: [], cta: null };
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.warn("[pexels] No PEXELS_API_KEY — skipping section images.");
    return empty;
  }

  const queries = buildSearchQueries(businessName, businessDescription, businessTagline, imageryThemes, archetype);
  console.log(`[pexels/batch] Trying queries:`, queries);

  for (const query of queries) {
    try {
      const params = new URLSearchParams({
        query,
        orientation: "landscape",
        size: "large",
        per_page: "15",
      });

      const res = await fetch(`${PEXELS_API_URL}?${params}`, {
        headers: { Authorization: apiKey },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        console.warn(`[pexels/batch] API ${res.status}: ${res.statusText}`);
        continue;
      }

      const data: PexelsSearchResponse = await res.json();
      if (!data.photos || data.photos.length === 0) continue;

      // Sort by landscape quality (widest first)
      const sorted = [...data.photos].sort((a, b) => {
        const rA = a.width / a.height;
        const rB = b.width / b.height;
        if (rA >= 1.5 && rB < 1.5) return -1;
        if (rB >= 1.5 && rA < 1.5) return 1;
        return b.width * b.height - a.width * a.height;
      });

      const toResult = (p: PexelsPhoto): HeroImageResult => ({
        url: p.src.large2x,
        photographer: p.photographer,
        alt: p.alt || `${businessName} image`,
      });

      const result: SectionImageResult = {
        hero: sorted[0] ? toResult(sorted[0]) : null,
        services: sorted.slice(1, 4).map(toResult),
        cta: sorted[4] ? toResult(sorted[4]) : null,
      };

      console.log(
        `[pexels/batch] Found: hero=${result.hero ? "yes" : "no"}, ` +
        `services=${result.services.length}, cta=${result.cta ? "yes" : "no"}`
      );
      return result;
    } catch (err) {
      console.warn(`[pexels/batch] Query "${query}" failed:`, err instanceof Error ? err.message : err);
    }
  }

  console.warn("[pexels/batch] All queries returned no results.");
  return empty;
}
