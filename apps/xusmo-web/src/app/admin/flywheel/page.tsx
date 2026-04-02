"use client";

// =============================================================================
// Admin Flywheel — Data enrichment suggestions and industry maturity
// =============================================================================

import { useState } from "react";
import {
  generateEnrichmentSuggestions,
  calculateIndustryMaturity,
  type EnrichmentSuggestion,
  type IndustryMaturity,
} from "@/lib/flywheel/enrichment";

function getMaturityColor(score: number) {
  if (score >= 75) return "#22C55E";
  if (score >= 50) return "#F59E0B";
  return "#EF4444";
}

export default function AdminFlywheel() {
  const [suggestions] = useState<EnrichmentSuggestion[]>(generateEnrichmentSuggestions);
  const [maturity] = useState<IndustryMaturity[]>(calculateIndustryMaturity);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [applied, setApplied] = useState<Set<string>>(new Set());

  function handleApply(id: string) {
    setApplied((prev) => new Set(prev).add(id));
  }

  function handleDismiss(id: string) {
    setDismissed((prev) => new Set(prev).add(id));
  }

  const activeSuggestions = suggestions.filter(
    (s) => !dismissed.has(s.id) && !applied.has(s.id)
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h2 className="font-display text-2xl font-bold text-neutral-900">Data Flywheel</h2>

      {/* Enrichment suggestions */}
      <div>
        <h3 className="font-display text-base font-semibold text-neutral-900 mb-4">
          Enrichment Suggestions
        </h3>
        {activeSuggestions.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}>
            <p className="text-sm" style={{ color: "#94A3B8" }}>No pending suggestions. The flywheel will generate more as builds are approved.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeSuggestions.map((s) => (
              <div key={s.id} className="rounded-2xl p-5" style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{
                          backgroundColor: s.type === "add_service" ? "#F0FDF4" : "#FEF2F2",
                          color: s.type === "add_service" ? "#16A34A" : "#DC2626",
                        }}
                      >
                        {s.type === "add_service" ? "Add" : "Remove"}
                      </span>
                      <span className="text-sm font-semibold text-neutral-900">{s.value}</span>
                    </div>
                    <p className="text-xs" style={{ color: "#64748B" }}>
                      {s.industryName} &middot; {s.occurrences} occurrences &middot; {Math.round(s.confidence * 100)}% confidence
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0 ml-4">
                    <button onClick={() => handleApply(s.id)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-white" style={{ backgroundColor: "#4F46E5" }}>
                      Apply
                    </button>
                    <button onClick={() => handleDismiss(s.id)} className="rounded-lg px-3 py-1.5 text-xs font-medium" style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}>
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Industry maturity */}
      <div>
        <h3 className="font-display text-base font-semibold text-neutral-900 mb-4">
          Industry Maturity
        </h3>
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                {["Industry", "Builds", "Approved", "Revision Rate", "Maturity"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {maturity.map((m) => (
                <tr key={m.industryCode} style={{ borderBottom: "1px solid #F8FAFC" }}>
                  <td className="px-4 py-3 font-medium text-neutral-900">{m.industryName}</td>
                  <td className="px-4 py-3" style={{ color: "#64748B" }}>{m.totalBuilds}</td>
                  <td className="px-4 py-3" style={{ color: "#64748B" }}>{m.approvedBuilds}</td>
                  <td className="px-4 py-3" style={{ color: "#64748B" }}>{m.revisionRate}%</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full" style={{ backgroundColor: "#F1F5F9" }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${m.maturityScore}%`, backgroundColor: getMaturityColor(m.maturityScore) }} />
                      </div>
                      <span className="text-xs font-medium" style={{ color: getMaturityColor(m.maturityScore) }}>{m.maturityScore}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
