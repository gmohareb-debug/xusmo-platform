"use client";

// =============================================================================
// ColorPicker — Visual color customizer for theme colors
// Allows users to pick custom colors for their 8 theme color slots
// =============================================================================

import { useState, useCallback } from "react";
import {
  Palette,
  RotateCcw,
  Check,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ColorPickerProps {
  siteId: string;
  currentColors: Record<string, string>;
  themePoolEntryId?: string;
}

const COLOR_KEYS = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "accent", label: "Accent" },
  { key: "background", label: "Background" },
  { key: "surface", label: "Surface" },
  { key: "text", label: "Text" },
  { key: "textMuted", label: "Muted" },
  { key: "border", label: "Border" },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ColorPicker({
  siteId,
  currentColors,
  themePoolEntryId,
}: ColorPickerProps) {
  const [colors, setColors] = useState<Record<string, string>>({
    ...currentColors,
  });
  const [originalColors] = useState<Record<string, string>>({
    ...currentColors,
  });
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasChanges = Object.keys(colors).some(
    (k) => colors[k] !== originalColors[k]
  );

  const updateColor = useCallback((key: string, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setError(null);
  }, []);

  const resetToTheme = useCallback(() => {
    setColors({ ...originalColors });
    setActiveKey(null);
    setSaved(false);
    setError(null);
  }, [originalColors]);

  const applyColors = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch(`/api/studio/${siteId}/design/colors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colors }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to apply colors.");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      }
    } catch {
      setError("Failed to apply colors.");
    }

    setSaving(false);
  };

  return (
    <div>
      {/* Color swatches row */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        {COLOR_KEYS.map(({ key, label }) => {
          const isActive = activeKey === key;
          return (
            <div key={key} style={{ textAlign: "center" }}>
              <button
                onClick={() => setActiveKey(isActive ? null : key)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: colors[key] || "#cccccc",
                  border: isActive
                    ? `3px solid ${C.accent}`
                    : `2px solid ${C.border}`,
                  cursor: "pointer",
                  transition: "border-color 0.15s, transform 0.15s",
                  transform: isActive ? "scale(1.1)" : "scale(1)",
                  padding: 0,
                }}
                title={`${label}: ${colors[key]}`}
              />
              <div
                style={{
                  fontSize: 9,
                  color: isActive ? C.accent : C.dim,
                  fontWeight: isActive ? 700 : 600,
                  marginTop: 4,
                }}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Inline color picker for selected swatch */}
      {activeKey && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            background: C.surfaceAlt,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, minWidth: 70 }}>
            {COLOR_KEYS.find((c) => c.key === activeKey)?.label}
          </div>
          <div
            style={{
              position: "relative",
              width: 36,
              height: 36,
              borderRadius: 6,
              overflow: "hidden",
              border: `1px solid ${C.border}`,
              flexShrink: 0,
            }}
          >
            <input
              type="color"
              value={colors[activeKey] || "#000000"}
              onChange={(e) => updateColor(activeKey, e.target.value)}
              style={{
                position: "absolute",
                top: -4,
                left: -4,
                width: 44,
                height: 44,
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            />
          </div>
          <input
            type="text"
            value={colors[activeKey] || ""}
            onChange={(e) => {
              const val = e.target.value;
              if (/^#[0-9a-fA-F]{0,6}$/.test(val) || val === "") {
                updateColor(activeKey, val);
              }
            }}
            placeholder="#000000"
            style={{
              flex: 1,
              maxWidth: 100,
              padding: "6px 10px",
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              color: C.text,
              fontSize: 12,
              fontFamily: "monospace",
              outline: "none",
            }}
          />
          <button
            onClick={() => setActiveKey(null)}
            style={{
              fontSize: 11,
              color: C.dim,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Done
          </button>
        </div>
      )}

      {/* Mini live preview strip */}
      <div
        style={{
          padding: 14,
          background: colors.background || "#ffffff",
          border: `1px solid ${colors.border || "#e5e7eb"}`,
          borderRadius: 8,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: C.dim,
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          Live Preview
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {/* Heading sample */}
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: colors.text || "#000",
            }}
          >
            Heading Text
          </span>
          {/* Paragraph sample */}
          <span
            style={{
              fontSize: 12,
              color: colors.textMuted || "#666",
            }}
          >
            Body text goes here
          </span>
          {/* Primary button */}
          <span
            style={{
              display: "inline-block",
              padding: "4px 14px",
              background: colors.primary || "#1e40af",
              color: colors.background || "#fff",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Primary
          </span>
          {/* Accent button */}
          <span
            style={{
              display: "inline-block",
              padding: "4px 14px",
              background: colors.accent || "#dc2626",
              color: colors.background || "#fff",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Accent
          </span>
          {/* Surface card */}
          <span
            style={{
              display: "inline-block",
              padding: "6px 12px",
              background: colors.surface || "#f8f8f8",
              border: `1px solid ${colors.border || "#e5e7eb"}`,
              borderRadius: 4,
              fontSize: 10,
              color: colors.text || "#000",
            }}
          >
            Surface Card
          </span>
        </div>
      </div>

      {/* Action row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {/* Apply button */}
        <button
          onClick={applyColors}
          disabled={saving || !hasChanges}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 16px",
            background: hasChanges ? C.accent : C.surfaceAlt,
            border: "none",
            borderRadius: 6,
            color: hasChanges ? "#fff" : C.dim,
            fontSize: 12,
            fontWeight: 600,
            cursor: hasChanges ? "pointer" : "default",
          }}
        >
          {saving ? (
            <>
              <Loader2
                size={13}
                style={{ animation: "spin 1s linear infinite" }}
              />
              Applying...
            </>
          ) : (
            <>
              <Palette size={13} /> Apply Colors
            </>
          )}
        </button>

        {/* Reset button */}
        {themePoolEntryId && (
          <button
            onClick={resetToTheme}
            disabled={!hasChanges}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "7px 14px",
              background: "transparent",
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              color: hasChanges ? C.muted : C.dim,
              fontSize: 12,
              fontWeight: 500,
              cursor: hasChanges ? "pointer" : "default",
            }}
          >
            <RotateCcw size={12} /> Reset to Theme
          </button>
        )}

        {/* Status messages */}
        {saved && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: C.green,
            }}
          >
            <Check size={14} /> Colors applied. Changes will appear within 60s.
          </span>
        )}
        {error && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: C.red,
            }}
          >
            <AlertTriangle size={14} /> {error}
          </span>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
