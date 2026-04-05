"use client";

// =============================================================================
// Theme Editor — Edit designDocument.theme tokens (colors, fonts, radius)
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import { C } from "@/lib/studio/colors";
import {
  Palette,
  Type,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface ThemeData {
  colors?: Record<string, string>;
  fonts?: Record<string, string>;
  radius?: string;
}

const COLOR_KEYS = [
  { key: "accent", label: "Accent" },
  { key: "accentLight", label: "Accent Light" },
  { key: "surface", label: "Surface" },
  { key: "background", label: "Background" },
  { key: "text", label: "Text" },
  { key: "border", label: "Border" },
  { key: "muted", label: "Muted" },
];

const FONT_OPTIONS = [
  "Inter",
  "Oswald",
  "Playfair Display",
  "Merriweather",
  "Syne",
  "DM Sans",
  "Nunito",
  "Roboto",
  "Lato",
  "Open Sans",
  "Montserrat",
  "Poppins",
  "Raleway",
  "Source Sans 3",
  "Work Sans",
];

export default function ThemeEditor({ siteId }: { siteId: string }) {
  const [theme, setTheme] = useState<ThemeData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Load theme from designDocument via sections endpoint (returns { pages, theme })
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/studio/${siteId}/design/sections`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          if (data.theme) {
            setTheme(data.theme);
          }
        }
      } catch {
        // ignore
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [siteId]);

  const saveTheme = useCallback(async (patch: Partial<ThemeData>) => {
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch(`/api/studio/${siteId}/design/theme`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.theme) setTheme(data.theme);
        setToast({ type: "success", msg: "Theme saved" });
        // Dispatch refresh event for the preview iframe
        window.dispatchEvent(new Event("xusmo-design-refresh"));
        setTimeout(() => setToast(null), 2500);
      } else {
        setToast({ type: "error", msg: "Failed to save theme" });
        setTimeout(() => setToast(null), 4000);
      }
    } catch {
      setToast({ type: "error", msg: "Network error" });
      setTimeout(() => setToast(null), 4000);
    }
    setSaving(false);
  }, [siteId]);

  const updateColor = (key: string, value: string) => {
    setTheme((prev) => ({
      ...prev,
      colors: { ...(prev.colors || {}), [key]: value },
    }));
  };

  const updateFont = (key: string, value: string) => {
    setTheme((prev) => ({
      ...prev,
      fonts: { ...(prev.fonts || {}), [key]: value },
    }));
  };

  const updateRadius = (value: string) => {
    setTheme((prev) => ({ ...prev, radius: value }));
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40, color: C.muted }}>
        <RefreshCw size={18} style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
        Loading theme...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const radiusNum = parseInt(theme.radius || "8", 10);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 12px",
            background: toast.type === "success" ? `${C.green}15` : `${C.red}15`,
            border: `1px solid ${toast.type === "success" ? C.green : C.red}30`,
            borderRadius: 6,
            fontSize: 12,
            color: toast.type === "success" ? C.green : C.red,
          }}
        >
          {toast.type === "success" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          {toast.msg}
        </div>
      )}

      {/* Colors */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Palette size={16} color={C.accent} />
          <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Theme Colors</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {COLOR_KEYS.map(({ key, label }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="color"
                value={theme.colors?.[key] || "#888888"}
                onChange={(e) => updateColor(key, e.target.value)}
                style={{
                  width: 32,
                  height: 32,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  cursor: "pointer",
                  padding: 0,
                  background: "transparent",
                }}
              />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{label}</div>
                <div style={{ fontSize: 11, color: C.dim, fontFamily: "monospace" }}>
                  {theme.colors?.[key] || "not set"}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => saveTheme({ colors: theme.colors })}
          disabled={saving}
          style={{
            marginTop: 16,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            background: C.accent,
            border: "none",
            borderRadius: 8,
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Save size={13} />
          {saving ? "Saving..." : "Save Colors"}
        </button>
      </div>

      {/* Fonts */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Type size={16} color={C.purple} />
          <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Fonts</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { key: "heading", label: "Heading Font" },
            { key: "body", label: "Body Font" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 4, display: "block" }}>
                {label}
              </label>
              <select
                value={theme.fonts?.[key] || "Inter"}
                onChange={(e) => updateFont(key, e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: C.surfaceAlt,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  color: C.text,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <button
          onClick={() => saveTheme({ fonts: theme.fonts })}
          disabled={saving}
          style={{
            marginTop: 16,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            background: C.accent,
            border: "none",
            borderRadius: 8,
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Save size={13} />
          {saving ? "Saving..." : "Save Fonts"}
        </button>
      </div>

      {/* Radius */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Border Radius</span>
          <span style={{ fontSize: 13, color: C.dim, fontFamily: "monospace" }}>{radiusNum}px</span>
        </div>

        <input
          type="range"
          min={0}
          max={32}
          step={1}
          value={radiusNum}
          onChange={(e) => updateRadius(e.target.value)}
          style={{ width: "100%", accentColor: C.accent }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.dim, marginTop: 4 }}>
          <span>0px (sharp)</span>
          <span>32px (round)</span>
        </div>

        <button
          onClick={() => saveTheme({ radius: theme.radius })}
          disabled={saving}
          style={{
            marginTop: 16,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            background: C.accent,
            border: "none",
            borderRadius: 8,
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Save size={13} />
          {saving ? "Saving..." : "Save Radius"}
        </button>
      </div>
    </div>
  );
}
