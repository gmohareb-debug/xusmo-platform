// =============================================================================
// Xusmo Design System — Single source of truth for all design tokens
// Palette: Deep Indigo + Warm Amber + Soft Cream
// Direction: Editorial magazine meets premium SaaS
// =============================================================================

export const colors = {
  // Brand Primary — Deep Indigo (trust, creativity, premium)
  primary: {
    50: "#EEF2FF",
    100: "#E0E7FF",
    200: "#C7D2FE",
    300: "#A5B4FC",
    400: "#818CF8",
    500: "#6366F1",
    600: "#4F46E5",
    700: "#4338CA",
    800: "#3730A3",
    900: "#312E81",
    950: "#1E1B4B",
  },

  // Accent — Warm Amber (energy, CTAs, highlights)
  accent: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B",
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
  },

  // Secondary — Coral (warmth, human touch)
  coral: {
    400: "#FB7185",
    500: "#F43F5E",
    600: "#E11D48",
  },

  // Surface colors
  surface: {
    cream: "#FAF9F7",
    white: "#FFFFFF",
    muted: "#F4F3F0",
    midnight: "#0C0A1D",
    card: "#16132B",
    cardHover: "#1E1A38",
    border: "#E8E6E1",
    borderDark: "#2A2545",
  },

  // Neutral — Warm gray/zinc scale
  neutral: {
    50: "#FAFAF9",
    100: "#F5F5F4",
    200: "#E7E5E4",
    300: "#D6D3D1",
    400: "#A8A29E",
    500: "#78716C",
    600: "#57534E",
    700: "#44403C",
    800: "#292524",
    900: "#1C1917",
    950: "#0C0A09",
  },

  // Semantic
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
} as const;

export const typography = {
  // Font families (class names from next/font/google)
  display: "var(--font-display)",
  body: "var(--font-body)",

  // Font sizes (rem)
  size: {
    xs: "0.75rem",     // 12px
    sm: "0.875rem",    // 14px
    base: "1rem",      // 16px
    lg: "1.125rem",    // 18px
    xl: "1.25rem",     // 20px
    "2xl": "1.5rem",   // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem",  // 36px
    "5xl": "3rem",     // 48px
    "6xl": "3.75rem",  // 60px
    "7xl": "4.5rem",   // 72px
    "8xl": "6rem",     // 96px
  },

  // Line heights
  leading: {
    none: "1",
    tight: "1.15",
    snug: "1.25",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  },

  // Font weights
  weight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },

  // Letter spacing
  tracking: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
} as const;

export const spacing = {
  // 4px base grid
  px: "1px",
  0: "0",
  0.5: "0.125rem", // 2px
  1: "0.25rem",    // 4px
  1.5: "0.375rem", // 6px
  2: "0.5rem",     // 8px
  2.5: "0.625rem", // 10px
  3: "0.75rem",    // 12px
  4: "1rem",       // 16px
  5: "1.25rem",    // 20px
  6: "1.5rem",     // 24px
  8: "2rem",       // 32px
  10: "2.5rem",    // 40px
  12: "3rem",      // 48px
  16: "4rem",      // 64px
  20: "5rem",      // 80px
  24: "6rem",      // 96px
  32: "8rem",      // 128px
} as const;

export const radius = {
  none: "0",
  sm: "0.25rem",   // 4px — subtle
  md: "0.5rem",    // 8px — medium
  lg: "1rem",      // 16px — large
  xl: "1.5rem",    // 24px
  "2xl": "2rem",   // 32px
  full: "9999px",  // pill
} as const;

export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.04)",
  glow: "0 0 30px -5px rgb(99 102 241 / 0.4)",
  glowAccent: "0 0 30px -5px rgb(245 158 11 / 0.4)",
  card: "0 1px 3px rgb(0 0 0 / 0.04), 0 8px 24px rgb(0 0 0 / 0.06)",
  cardHover: "0 4px 12px rgb(0 0 0 / 0.06), 0 16px 40px rgb(0 0 0 / 0.1)",
} as const;

export const animation = {
  duration: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
    dramatic: "800ms",
    glacial: "1200ms",
  },
  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
  },
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  toast: 70,
} as const;
