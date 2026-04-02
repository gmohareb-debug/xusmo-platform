import { useEffect } from 'react'

const VARIABLE_MAP = {
  accent: '--accent',
  accentLight: '--accent-light',
  surface: '--surface',
  background: '--bg',
  text: '--text',
  border: '--border',
  muted: '--muted',
  danger: '--danger',
  success: '--success',
  warning: '--warning',
}

export default function ThemeProvider({ theme, children }) {
  useEffect(() => {
    if (!theme) return

    const root = document.documentElement

    // Apply colors
    if (theme.colors) {
      for (const [key, variable] of Object.entries(VARIABLE_MAP)) {
        if (theme.colors[key]) {
          root.style.setProperty(variable, theme.colors[key])
        }
      }
      // Also set body background and text color
      if (theme.colors.background) {
        root.style.setProperty('background-color', theme.colors.background)
      }
      if (theme.colors.text) {
        root.style.setProperty('color', theme.colors.text)
      }
    }

    // Apply fonts
    if (theme.fonts) {
      if (theme.fonts.heading) {
        root.style.setProperty('--font-heading', theme.fonts.heading)
      }
      if (theme.fonts.body) {
        root.style.setProperty('font-family', `'${theme.fonts.body}', system-ui, sans-serif`)
      }
    }

    // Apply radius
    if (theme.radius) {
      root.style.setProperty('--radius', theme.radius)
    }

    // Cleanup: remove inline styles when theme is removed
    return () => {
      for (const variable of Object.values(VARIABLE_MAP)) {
        root.style.removeProperty(variable)
      }
      root.style.removeProperty('background-color')
      root.style.removeProperty('color')
      root.style.removeProperty('font-family')
      root.style.removeProperty('--font-heading')
      root.style.removeProperty('--radius')
    }
  }, [theme])

  return children
}
