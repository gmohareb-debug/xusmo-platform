/**
 * Shared image onError handler.
 * Swaps a broken image src to a placehold.co placeholder with the alt text.
 * Only fires once to avoid infinite loops.
 */
export function onImgError(e, width = 400, height = 300, bg = 'e2e8f0', fg = '94a3b8') {
  const img = e.currentTarget
  if (img.dataset.fallback) return // already tried
  img.dataset.fallback = '1'
  const label = encodeURIComponent((img.alt || 'Image').slice(0, 30))
  img.src = `https://placehold.co/${width}x${height}/${bg}/${fg}?text=${label}`
}
