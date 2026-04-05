"use client";

// =============================================================================
// Admin Templates — Golden Image versioning and governance
// =============================================================================

import { useState } from "react";
import { getTemplateVersions, type TemplateVersion } from "@/lib/templates/governance";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  active: { bg: "#F0FDF4", color: "#16A34A" },
  deprecated: { bg: "#FEF2F2", color: "#DC2626" },
  testing: { bg: "#FFFBEB", color: "#D97706" },
};

const CWV_STYLES: Record<string, { bg: string; color: string }> = {
  green: { bg: "#F0FDF4", color: "#16A34A" },
  yellow: { bg: "#FFFBEB", color: "#D97706" },
  red: { bg: "#FEF2F2", color: "#DC2626" },
};

export default function AdminTemplates() {
  const [templates] = useState<TemplateVersion[]>(getTemplateVersions);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-neutral-900">Templates</h2>
        <span className="text-sm" style={{ color: "#94A3B8" }}>{templates.length} templates</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {templates.map((tpl) => {
          const st = STATUS_STYLES[tpl.status] ?? STATUS_STYLES.active;
          const cwv = CWV_STYLES[tpl.coreWebVitals] ?? CWV_STYLES.green;
          return (
            <div key={tpl.id} className="rounded-2xl p-5" style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display font-semibold text-neutral-900">{tpl.name}</h3>
                  <p className="text-xs" style={{ color: "#94A3B8" }}>
                    v{tpl.version} &middot; {tpl.archetype}
                  </p>
                </div>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: st.bg, color: st.color }}>
                  {tpl.status}
                </span>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="rounded-xl p-3 text-center" style={{ backgroundColor: "#F8FAFC" }}>
                  <div className="text-lg font-bold text-neutral-900">{tpl.lighthouseScore}</div>
                  <div className="text-[10px]" style={{ color: "#94A3B8" }}>Lighthouse</div>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ backgroundColor: "#F8FAFC" }}>
                  <div className="text-lg font-bold text-neutral-900">{tpl.mobileScore}</div>
                  <div className="text-[10px]" style={{ color: "#94A3B8" }}>Mobile</div>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ backgroundColor: "#F8FAFC" }}>
                  <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: cwv.bg, color: cwv.color }}>
                    {tpl.coreWebVitals}
                  </span>
                  <div className="text-[10px] mt-1" style={{ color: "#94A3B8" }}>CWV</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs" style={{ color: "#94A3B8" }}>
                <span>{tpl.sitesUsing} sites using this template</span>
                <span>Updated {new Date(tpl.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
