/**
 * Image Resolver — replaces picsum.photos (random) URLs with
 * keyword-matched photos from Pexels API or Unsplash API.
 *
 * Strategy:
 *   1. Pexels API (if PEXELS_API_KEY set) → best quality, free (200 req/mo)
 *   2. Unsplash API (if UNSPLASH_ACCESS_KEY set) → excellent quality, free (50 req/hr)
 *   3. Keep picsum.photos as-is (at least shows real photos, just not keyword-matched)
 *
 * Get a free Pexels key: https://www.pexels.com/api/new/
 * Get a free Unsplash key: https://unsplash.com/developers
 */

const PEXELS_API_KEY = process.env.PEXELS_API_KEY
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

const PEXELS_URL = 'https://api.pexels.com/v1/search'
const UNSPLASH_URL = 'https://api.unsplash.com/search/photos'

// Cache to avoid repeat API calls for the same keyword
const cache = new Map()

/**
 * Search Pexels for a photo matching the keyword.
 */
async function searchPexels(keyword, width, height) {
  if (!PEXELS_API_KEY) return null

  const cacheKey = `pexels:${keyword}:${width}x${height}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)

  try {
    const params = new URLSearchParams({
      query: keyword,
      per_page: '5',
      orientation: width > height * 1.3 ? 'landscape' : (height > width * 1.3 ? 'portrait' : 'square'),
    })

    const res = await fetch(`${PEXELS_URL}?${params}`, {
      headers: { Authorization: PEXELS_API_KEY },
    })

    if (!res.ok) {
      console.warn(`[ImageResolver] Pexels API ${res.status} for "${keyword}"`)
      return null
    }

    const data = await res.json()
    if (!data.photos?.length) {
      console.warn(`[ImageResolver] No Pexels results for "${keyword}"`)
      cache.set(cacheKey, null)
      return null
    }

    const photo = data.photos[Math.floor(Math.random() * data.photos.length)]
    const url = `${photo.src.original}?auto=compress&cs=tinysrgb&w=${width}&h=${height}&fit=crop`

    cache.set(cacheKey, url)
    return url
  } catch (err) {
    console.warn(`[ImageResolver] Pexels fetch error: ${err.message}`)
    return null
  }
}

/**
 * Search Unsplash for a photo matching the keyword.
 */
async function searchUnsplash(keyword, width, height) {
  if (!UNSPLASH_ACCESS_KEY) return null

  const cacheKey = `unsplash:${keyword}:${width}x${height}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)

  try {
    const orientation = width > height * 1.3 ? 'landscape' : (height > width * 1.3 ? 'portrait' : 'squarish')
    const params = new URLSearchParams({
      query: keyword,
      per_page: '5',
      orientation,
    })

    const res = await fetch(`${UNSPLASH_URL}?${params}`, {
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
    })

    if (!res.ok) {
      console.warn(`[ImageResolver] Unsplash API ${res.status} for "${keyword}"`)
      return null
    }

    const data = await res.json()
    if (!data.results?.length) {
      console.warn(`[ImageResolver] No Unsplash results for "${keyword}"`)
      cache.set(cacheKey, null)
      return null
    }

    const photo = data.results[Math.floor(Math.random() * data.results.length)]
    const url = `${photo.urls.raw}&w=${width}&h=${height}&fit=crop&auto=format&q=80`

    cache.set(cacheKey, url)
    return url
  } catch (err) {
    console.warn(`[ImageResolver] Unsplash fetch error: ${err.message}`)
    return null
  }
}

/**
 * Extract keyword and dimensions from a picsum.photos URL.
 * Format: https://picsum.photos/seed/{keyword}/{width}/{height}
 */
function parsePicsumUrl(url) {
  const match = url.match(/picsum\.photos\/seed\/([^/]+)\/(\d+)\/(\d+)/)
  if (!match) return null
  return {
    keyword: decodeURIComponent(match[1]).replace(/-/g, ' '),
    width: parseInt(match[2]),
    height: parseInt(match[3]),
  }
}

/**
 * Walk a JSON object tree, find all picsum.photos URLs, and replace
 * them with keyword-matched photos from Pexels or Unsplash.
 *
 * If no API key is configured, keeps the original picsum URLs as-is
 * (they show real photos, just not keyword-matched).
 */
export async function resolveImages(obj, accentColor) {
  console.log(`[ImageResolver] resolveImages() called — accentColor=${accentColor || 'none'}`)

  if (!obj || typeof obj !== 'object') {
    console.warn('[ImageResolver] Input is not an object — skipping image resolution')
    return obj
  }

  const hasApiKey = !!PEXELS_API_KEY || !!UNSPLASH_ACCESS_KEY
  console.log(`[ImageResolver] API keys: PEXELS=${PEXELS_API_KEY ? 'SET (' + PEXELS_API_KEY.slice(0, 8) + '...)' : 'NOT SET'}, UNSPLASH=${UNSPLASH_ACCESS_KEY ? 'SET' : 'NOT SET'}`)

  if (!hasApiKey) {
    console.log('[ImageResolver] No PEXELS_API_KEY or UNSPLASH_ACCESS_KEY set — keeping picsum URLs')
    console.log('[ImageResolver] Get a free key: https://www.pexels.com/api/new/ or https://unsplash.com/developers')
    return obj
  }

  // Collect all picsum URLs to resolve in parallel
  const replacements = []

  function collectUrls(node, path = []) {
    if (typeof node === 'string') {
      if (node.includes('picsum.photos/seed/') || node.includes('loremflickr.com')) {
        replacements.push({ path: [...path], url: node })
      }
      return
    }
    if (Array.isArray(node)) {
      node.forEach((item, i) => collectUrls(item, [...path, i]))
      return
    }
    if (node && typeof node === 'object') {
      for (const key of Object.keys(node)) {
        collectUrls(node[key], [...path, key])
      }
    }
  }

  collectUrls(obj)

  if (replacements.length === 0) {
    console.log('[ImageResolver] No picsum.photos or loremflickr URLs found in output — nothing to resolve')
    return obj
  }

  console.log(`[ImageResolver] Found ${replacements.length} image URLs to resolve via ${PEXELS_API_KEY ? 'Pexels' : 'Unsplash'}`)
  // Log first few URLs for debugging
  for (const r of replacements.slice(0, 3)) {
    console.log(`[ImageResolver]   Sample: ${r.url.slice(0, 80)}...`)
  }

  // Resolve all in parallel (with concurrency limit)
  const CONCURRENCY = 5
  let resolved = 0

  for (let i = 0; i < replacements.length; i += CONCURRENCY) {
    const batch = replacements.slice(i, i + CONCURRENCY)
    const results = await Promise.all(
      batch.map(async ({ path, url }) => {
        const parsed = parsePicsumUrl(url)
        if (!parsed) {
          console.warn(`[ImageResolver] Could not parse picsum URL: ${url.slice(0, 80)}`)
          return { path, newUrl: url }
        }

        // Try Pexels first, then Unsplash, then keep original
        const pexelsUrl = await searchPexels(parsed.keyword, parsed.width, parsed.height)
        if (pexelsUrl) {
          resolved++
          return { path, newUrl: pexelsUrl }
        }

        const unsplashUrl = await searchUnsplash(parsed.keyword, parsed.width, parsed.height)
        if (unsplashUrl) {
          resolved++
          return { path, newUrl: unsplashUrl }
        }

        // Keep picsum URL as-is (better than broken alternatives)
        return { path, newUrl: url }
      })
    )

    // Apply replacements
    for (const { path, newUrl } of results) {
      let target = obj
      for (let j = 0; j < path.length - 1; j++) {
        target = target[path[j]]
      }
      target[path[path.length - 1]] = newUrl
    }
  }

  console.log(`[ImageResolver] Done: ${resolved} resolved, ${replacements.length - resolved} kept as picsum`)

  return obj
}
