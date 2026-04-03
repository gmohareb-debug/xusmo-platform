/**
 * SVG Logo Generator — creates text-based logos with business initials
 * on a colored background. Returns both SVG string and data URI.
 */

/**
 * Extract initials from a business name (max 2-3 chars)
 */
function getInitials(name) {
  if (!name) return 'X'
  const words = name.trim().split(/\s+/).filter(w => w.length > 0)
  if (words.length === 0) return 'X'
  if (words.length === 1) {
    // Single word: take first 2 chars
    return words[0].slice(0, 2).toUpperCase()
  }
  // Multiple words: first letter of each, max 3
  return words.slice(0, 3).map(w => w[0]).join('').toUpperCase()
}

/**
 * Generate an SVG logo string
 * @param {string} businessName - The business name
 * @param {string} accentColor - Background color (hex)
 * @param {string} [style='rounded'] - Shape: 'circle', 'rounded', 'square'
 * @returns {{ svg: string, dataUri: string, initials: string }}
 */
export function generateLogo(businessName, accentColor = '#3b82f6', style = 'rounded') {
  const initials = getInitials(businessName)
  const size = 80
  const fontSize = initials.length > 2 ? 28 : 32
  const color = accentColor || '#3b82f6'

  let shapeAttrs
  switch (style) {
    case 'circle':
      shapeAttrs = `rx="${size / 2}" ry="${size / 2}"`
      break
    case 'square':
      shapeAttrs = `rx="4" ry="4"`
      break
    case 'rounded':
    default:
      shapeAttrs = `rx="16" ry="16"`
      break
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${color}" ${shapeAttrs}/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
    font-family="'Inter', system-ui, -apple-system, sans-serif"
    font-weight="700" font-size="${fontSize}" fill="#ffffff"
    letter-spacing="0.05em">${initials}</text>
</svg>`

  // Create data URI
  const base64 = Buffer.from(svg).toString('base64')
  const dataUri = `data:image/svg+xml;base64,${base64}`

  return { svg, dataUri, initials }
}
