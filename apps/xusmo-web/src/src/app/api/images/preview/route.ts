import { NextRequest, NextResponse } from "next/server";

// =============================================================================
// GET /api/images/preview — Proxies Pexels images for theme previews
// Searches Pexels by query, caches results, streams image data back.
// Used by ThemePreview to show industry-relevant stock photos.
// =============================================================================

const PEXELS_API_URL = "https://api.pexels.com/v1/search";

interface PexelsPhoto {
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
  };
}

// In-memory cache: query → array of photo URLs
const urlCache = new Map<string, string[]>();

// In-memory image cache: sized URL → { data, contentType }
const imageCache = new Map<string, { data: ArrayBuffer; contentType: string }>();
const MAX_IMAGE_CACHE = 200;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "business";
  const idx = parseInt(searchParams.get("idx") || "0");
  const w = parseInt(searchParams.get("w") || "800");
  const h = parseInt(searchParams.get("h") || "400");

  const cacheKey = q.toLowerCase().trim();

  let urls = urlCache.get(cacheKey);

  if (!urls) {
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
      // Fallback to picsum if no API key — redirect since no key to proxy
      return NextResponse.redirect(
        `https://picsum.photos/seed/${encodeURIComponent(q)}-${idx}/${w}/${h}`,
      );
    }

    try {
      const orientation = h > w ? "portrait" : "landscape";
      const params = new URLSearchParams({
        query: q,
        orientation,
        size: "large",
        per_page: "15",
      });

      const res = await fetch(`${PEXELS_API_URL}?${params}`, {
        headers: { Authorization: apiKey },
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const data = await res.json();
        urls = (data.photos as PexelsPhoto[])?.map((p) => p.src.large2x) ?? [];
        if (urls.length > 0) {
          urlCache.set(cacheKey, urls);
        }
      }
    } catch {
      // Fall through to fallback
    }
  }

  if (urls && urls.length > 0) {
    const photoUrl = urls[idx % urls.length];
    const sizedUrl = `${photoUrl}?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;

    // Check image cache
    const cached = imageCache.get(sizedUrl);
    if (cached) {
      return new NextResponse(cached.data, {
        headers: {
          "Content-Type": cached.contentType,
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
      });
    }

    // Proxy the image: fetch from Pexels CDN and stream it back
    try {
      const imgRes = await fetch(sizedUrl, {
        signal: AbortSignal.timeout(10000),
      });

      if (imgRes.ok && imgRes.body) {
        const data = await imgRes.arrayBuffer();
        const contentType = imgRes.headers.get("Content-Type") || "image/jpeg";

        // Cache the image data (evict oldest if full)
        if (imageCache.size >= MAX_IMAGE_CACHE) {
          const firstKey = imageCache.keys().next().value;
          if (firstKey) imageCache.delete(firstKey);
        }
        imageCache.set(sizedUrl, { data, contentType });

        return new NextResponse(data, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
          },
        });
      }
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback: 1x1 transparent pixel (prevents broken image icon)
  const pixel = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64",
  );
  return new NextResponse(pixel, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "public, max-age=60",
    },
  });
}
