"use client";

import { useState, useCallback } from "react";
import ColorPicker from "@/components/studio/ColorPicker";
import FontSelector from "@/components/studio/FontSelector";
import {
  Palette,
  Code2,
  Save,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Type,
  ExternalLink,
  Paintbrush,
  RefreshCw,
  Monitor,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

interface SiteData {
  id: string;
  businessName: string;
  customCss: string | null;
  customCssUpdatedAt: string | null;
  activePreset: string | null;
  themePoolEntryId: string | null;
  wpUrl: string | null;
  themeColors: Record<string, string> | null;
  themeFonts: { heading: string; body: string } | null;
}

interface IndustryData {
  displayName: string;
  primaryColors: string[] | null;
  fontPreference: string | null;
}

const PRESETS = [
  { id: "professional", name: "Professional", primary: "#1e3a8a", accent: "#3b82f6", font: "Inter", radius: "8px" },
  { id: "bold", name: "Bold", primary: "#09090b", accent: "#dc2626", font: "Oswald", radius: "0px" },
  { id: "elegant", name: "Elegant", primary: "#7c2d12", accent: "#b45309", font: "Playfair Display", radius: "4px" },
  { id: "minimal", name: "Minimal", primary: "#18181b", accent: "#3b82f6", font: "Syne", radius: "0px" },
  { id: "warm", name: "Warm", primary: "#78350f", accent: "#d97706", font: "Nunito", radius: "16px" },
];

const FONT_MAP: Record<string, string> = {
  "clean sans-serif": "Inter",
  "bold modern sans": "Oswald",
  "elegant serif": "Playfair Display",
  "traditional serif": "Merriweather",
  "creative display": "Syne",
};

interface CustomizePanelProps {
  site: SiteData;
  industry: IndustryData | null;
  refreshPreview: (delayMs?: number) => void;
  /** When true, renders as a compact single-column layout (no live preview iframe) */
  compact?: boolean;
}

export default function CustomizePanel({ site, industry, refreshPreview, compact }: CustomizePanelProps) {
  const [customCss, setCustomCss] = useState(site.customCss || "");
  const [originalCss, setOriginalCss] = useState(site.customCss || "");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savingCss, setSavingCss] = useState(false);
  const [cssSaved, setCssSaved] = useState(false);
  const [cssError, setCssError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(site.customCssUpdatedAt);

  const [activePreset, setActivePreset] = useState<string | null>(site.activePreset);
  const [applyingPreset, setApplyingPreset] = useState<string | null>(null);
  const [presetToast, setPresetToast] = useState<string | null>(null);

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSelector, setShowFontSelector] = useState(false);

  const [iframeKey, setIframeKey] = useState(0);
  const [iframeLoading, setIframeLoading] = useState(true);

  const colors = industry?.primaryColors || ["#1e40af", "#ffffff", "#64748b"];
  const fontPref = industry?.fontPreference || null;
  const headingFont = fontPref ? FONT_MAP[fontPref] || "Inter" : "Inter";
  const hasChanges = customCss !== originalCss;

  const saveCss = async () => {
    setCssError(null);
    setCssSaved(false);
    const lower = customCss.toLowerCase();
    if (lower.includes("<script") || lower.includes("javascript:") || lower.includes("expression(")) {
      setCssError("CSS contains disallowed content and was not saved.");
      return;
    }
    if (customCss.length > 5000) {
      setCssError("CSS is limited to 5,000 characters.");
      return;
    }
    setSavingCss(true);
    try {
      const res = await fetch(`/api/studio/${site.id}/design/custom-css`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ css: customCss }),
      });
      if (!res.ok) {
        const data = await res.json();
        setCssError(data.error || "Failed to save CSS.");
      } else {
        setCssSaved(true);
        setOriginalCss(customCss);
        setLastUpdated(new Date().toISOString());
        setTimeout(() => setCssSaved(false), 3000);
        refreshPreview();
      }
    } catch {
      setCssError("Failed to save CSS.");
    }
    setSavingCss(false);
  };

  const applyPreset = async (presetId: string) => {
    setApplyingPreset(presetId);
    setPresetToast(null);
    try {
      const res = await fetch(`/api/studio/${site.id}/design/apply-preset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preset: presetId }),
      });
      if (res.ok) {
        setActivePreset(presetId);
        setPresetToast("Style applied. Preview refreshing...");
        setTimeout(() => setPresetToast(null), 5000);
        refreshPreview();
      }
    } catch {
      // silent
    }
    setApplyingPreset(null);
  };

  const controls = (
    <div style={{ padding: compact ? 16 : 24 }}>
      {/* Current Theme */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 16 }}>
          Your Current Theme
        </div>
        {site.themeColors ? (
          <div style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", height: 32, marginBottom: 16, border: `1px solid ${C.border}` }}>
            {Object.entries(site.themeColors).map(([key, hex]) => (
              <div key={key} style={{ flex: 1, background: hex }} title={`${key}: ${hex}`} />
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            {colors.slice(0, 3).map((hex, i) => (
              <div key={i} style={{ width: 36, height: 36, borderRadius: "50%", background: hex, border: `2px solid ${C.border}` }} />
            ))}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Type size={14} color={C.muted} />
          <span style={{ fontSize: 13, color: C.text }}>
            {site.themeFonts ? (
              <>
                <span style={{ fontWeight: 600 }}>{site.themeFonts.heading}</span>
                {site.themeFonts.body !== site.themeFonts.heading && (
                  <span style={{ color: C.muted }}> + {site.themeFonts.body}</span>
                )}
              </>
            ) : (
              <>{headingFont} + Inter</>
            )}
          </span>
        </div>
        <div style={{ fontSize: 12, color: C.dim, display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={12} color={C.accent} />
          {industry ? `Based on ${industry.displayName} industry defaults.` : "Set from your build preferences."}
        </div>
      </div>

      {/* Custom Colors */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", color: C.text }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Paintbrush size={18} color={C.accent} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Custom Colors</div>
              <div style={{ fontSize: 12, color: C.dim }}>Fine-tune your site&apos;s color palette.</div>
            </div>
          </div>
          {showColorPicker ? <ChevronUp size={18} color={C.dim} /> : <ChevronDown size={18} color={C.dim} />}
        </button>
        {showColorPicker && (
          <div style={{ padding: "0 20px 20px" }}>
            <ColorPicker
              siteId={site.id}
              currentColors={site.themeColors || {
                primary: colors[0] || "#1e40af",
                secondary: colors[1] || "#475569",
                accent: colors[2] || "#dc2626",
                background: "#ffffff",
                surface: "#f8fafc",
                text: "#0f172a",
                textMuted: "#64748b",
                border: "#e2e8f0",
              }}
              themePoolEntryId={site.themePoolEntryId || undefined}
            />
          </div>
        )}
      </div>

      {/* Font Pairing */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
        <button
          onClick={() => setShowFontSelector(!showFontSelector)}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", color: C.text }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Type size={18} color={C.purple} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Font Pairing</div>
              <div style={{ fontSize: 12, color: C.dim }}>Curated heading + body font combinations.</div>
            </div>
          </div>
          {showFontSelector ? <ChevronUp size={18} color={C.dim} /> : <ChevronDown size={18} color={C.dim} />}
        </button>
        {showFontSelector && (
          <div style={{ padding: "0 20px 20px" }}>
            <FontSelector
              siteId={site.id}
              currentFonts={site.themeFonts || { heading: headingFont, body: "Inter" }}
            />
          </div>
        )}
      </div>

      {/* Style Presets */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>
          Quick Style Presets
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
          Apply a different visual style without a full rebuild.
        </div>
        {presetToast && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: `${C.green}15`, border: `1px solid ${C.green}30`, borderRadius: 6, marginBottom: 14, fontSize: 12, color: C.green }}>
            <CheckCircle2 size={14} /> {presetToast}
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {PRESETS.map((p) => {
            const isActive = activePreset === p.id;
            const isApplying = applyingPreset === p.id;
            return (
              <div key={p.id} style={{ background: C.surfaceAlt, border: `1px solid ${isActive ? C.green : C.border}`, borderRadius: 10, padding: 16, position: "relative" }}>
                {isActive && (
                  <span style={{ position: "absolute", top: 10, right: 10, fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: `${C.green}20`, color: C.green }}>
                    Active
                  </span>
                )}
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>{p.name}</div>
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: p.primary, border: `1px solid ${C.border}` }} title={`Primary: ${p.primary}`} />
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: p.accent, border: `1px solid ${C.border}` }} title={`Accent: ${p.accent}`} />
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>{p.font} · Radius: {p.radius}</div>
                <button
                  onClick={() => !isActive && applyPreset(p.id)}
                  disabled={isActive || isApplying}
                  style={{
                    width: "100%", padding: "6px 0",
                    background: isActive ? "transparent" : C.accent,
                    border: isActive ? `1px solid ${C.green}` : "none",
                    borderRadius: 6,
                    color: isActive ? C.green : "#fff",
                    fontSize: 12, fontWeight: 600,
                    cursor: isActive ? "default" : "pointer",
                  }}
                >
                  {isActive ? "Applied \u2713" : isApplying ? "Applying\u2026" : "Apply"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom CSS */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", color: C.text }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Code2 size={18} color={C.amber} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Custom CSS</div>
              <div style={{ fontSize: 12, color: C.dim }}>For advanced users.</div>
            </div>
          </div>
          {showAdvanced ? <ChevronUp size={18} color={C.dim} /> : <ChevronDown size={18} color={C.dim} />}
        </button>
        {showAdvanced && (
          <div style={{ padding: "0 20px 20px" }}>
            <textarea
              value={customCss}
              onChange={(e) => { setCustomCss(e.target.value); setCssError(null); setCssSaved(false); }}
              placeholder={`/* Example: change button color */\n.wp-block-button__link {\n  background: #ff6b35 !important;\n}`}
              rows={10}
              style={{
                width: "100%", minHeight: 200, padding: 16, background: "#0d1117",
                border: `1px solid ${C.border}`, borderRadius: 8, color: "#e6edf3",
                fontSize: 13, fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
                lineHeight: 1.6, resize: "vertical", boxSizing: "border-box", tabSize: 2,
              }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: customCss.length > 5000 ? C.red : C.dim }}>{customCss.length} / 5,000</span>
                {lastUpdated && <span style={{ fontSize: 11, color: C.dim }}>· {new Date(lastUpdated).toLocaleString()}</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {cssError && <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: C.red }}><AlertTriangle size={14} /> {cssError}</span>}
                {cssSaved && <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: C.green }}><CheckCircle2 size={14} /> Saved</span>}
                <button
                  onClick={saveCss}
                  disabled={savingCss || !hasChanges}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
                    background: hasChanges ? C.accent : C.surfaceAlt,
                    border: "none", borderRadius: 8,
                    color: hasChanges ? "#fff" : C.dim,
                    fontSize: 13, fontWeight: 600,
                    cursor: hasChanges ? "pointer" : "default",
                  }}
                >
                  <Save size={14} /> {savingCss ? "Applying..." : "Apply CSS"}
                </button>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, padding: "8px 12px", background: `${C.amber}10`, border: `1px solid ${C.amber}30`, borderRadius: 6 }}>
              <AlertTriangle size={14} color={C.amber} />
              <span style={{ fontSize: 12, color: C.amber }}>Incorrect CSS may break your site&apos;s appearance.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Compact mode: controls only (for slide-over drawer)
  if (compact) {
    return controls;
  }

  // Full mode: controls + live preview side by side (for WP tab layout)
  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <div style={{ flex: "0 0 480px", maxWidth: 520, overflowY: "auto", borderRight: site.wpUrl ? `1px solid ${C.border}` : "none" }}>
        {controls}
      </div>
      {site.wpUrl && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg, minWidth: 0 }}>
          <div style={{ height: 40, background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Monitor size={14} color={C.muted} />
              <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>Live Preview</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                onClick={() => setIframeKey((k) => k + 1)}
                title="Refresh preview"
                style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", padding: 4, borderRadius: 4, display: "flex", alignItems: "center" }}
              >
                <RefreshCw size={14} />
              </button>
              <a href={site.wpUrl} target="_blank" rel="noopener noreferrer" title="Open in new tab" style={{ color: C.muted, padding: 4, display: "flex", alignItems: "center" }}>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            {iframeLoading && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, background: C.bg, zIndex: 1 }}>
                <RefreshCw size={20} color={C.muted} style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: 13, color: C.muted }}>Loading preview...</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}
            <iframe
              key={iframeKey}
              src={`${site.wpUrl}${site.wpUrl!.includes("?") ? "&" : "?"}cb=${iframeKey}`}
              title={`Preview of ${site.businessName}`}
              onLoad={() => setIframeLoading(false)}
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none", background: "#fff" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
