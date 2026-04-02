export interface XusmoTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  borderRadius: {
    small: string;
    medium: string;
    large: string;
    pill: string;
  };
  button: {
    borderRadius: string;
    paddingVertical: string;
    paddingHorizontal: string;
    fontSize: string;
    fontWeight: string;
    textTransform: string;
    letterSpacing: string;
  };
}

declare global {
  interface Window {
    xusmoTheme?: XusmoTheme;
  }
}

const FALLBACK_THEME: XusmoTheme = {
  colors: {
    primary: "#1e3a8a",
    secondary: "#1e40af",
    accent: "#3b82f6",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#1e293b",
    textMuted: "#64748b",
    border: "#e2e8f0",
  },
  fonts: {
    heading: "system-ui, sans-serif",
    body: "system-ui, sans-serif",
  },
  borderRadius: {
    small: "6px",
    medium: "10px",
    large: "20px",
    pill: "9999px",
  },
  button: {
    borderRadius: "6px",
    paddingVertical: "0.75rem",
    paddingHorizontal: "1.75rem",
    fontSize: "0.9375rem",
    fontWeight: "600",
    textTransform: "none",
    letterSpacing: "0",
  },
};

export function getTheme(): XusmoTheme {
  return window.xusmoTheme ?? FALLBACK_THEME;
}
