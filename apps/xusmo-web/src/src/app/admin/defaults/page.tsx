"use client";

// =============================================================================
// Admin Industry Defaults Editor — light theme, inline editing
// =============================================================================

import { useEffect, useState } from "react";

interface IndustryDefault {
  id: string;
  industryCode: string;
  displayName: string;
  category: string | null;
  archetype: string;
  isActive: boolean;
  isRegulated: boolean;
  totalBuilds: number;
  approvedBuilds: number;
  avgQualityScore: number | null;
  llmTier: number;
  totalLeads: number;
  keywords: string[];
  defaultFeatures: string[];
  defaultServices: Array<{ name: string; description: string }>;
  primaryColors: string[] | null;
  tone: string | null;
}

const TIER_STYLES: Record<number, { bg: string; color: string; label: string }> = {
  1: { bg: "#F0FDF4", color: "#16A34A", label: "Cached" },
  2: { bg: "#EEF2FF", color: "#4F46E5", label: "Distilled" },
  3: { bg: "#F1F5F9", color: "#64748B", label: "Mainstream" },
};

export default function AdminDefaults() {
  const [industries, setIndustries] = useState<IndustryDefault[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<IndustryDefault>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/defaults")
      .then((r) => r.json())
      .then(setIndustries)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function startEdit(ind: IndustryDefault) {
    setEditingId(ind.id);
    setEditData({
      displayName: ind.displayName,
      category: ind.category,
      tone: ind.tone,
      isActive: ind.isActive,
      isRegulated: ind.isRegulated,
      llmTier: ind.llmTier,
    });
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/defaults/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        const updated = await res.json();
        setIndustries((prev) =>
          prev.map((i) => (i.id === editingId ? { ...i, ...updated } : i))
        );
        setEditingId(null);
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "#E0E7FF", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-neutral-900">Industry Defaults</h2>
        <span className="text-sm" style={{ color: "#94A3B8" }}>{industries.length} industries</span>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                {["Industry", "Archetype", "Category", "Builds", "Approved", "LLM Tier", "Regulated", "Active", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {industries.map((ind) => {
                const tier = TIER_STYLES[ind.llmTier] ?? TIER_STYLES[3];
                return (
                  <tr key={ind.id} style={{ borderBottom: "1px solid #F8FAFC" }}>
                    {editingId === ind.id ? (
                      <>
                        <td className="px-4 py-2">
                          <input
                            value={editData.displayName ?? ""}
                            onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                            className="w-full rounded-lg px-2 py-1.5 text-sm outline-none"
                            style={{ backgroundColor: "#F8FAFC", border: "1.5px solid #E2E8F0" }}
                          />
                        </td>
                        <td className="px-4 py-2" style={{ color: "#64748B" }}>{ind.archetype}</td>
                        <td className="px-4 py-2">
                          <input
                            value={editData.category ?? ""}
                            onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                            className="w-full rounded-lg px-2 py-1.5 text-sm outline-none"
                            style={{ backgroundColor: "#F8FAFC", border: "1.5px solid #E2E8F0" }}
                          />
                        </td>
                        <td className="px-4 py-2" style={{ color: "#64748B" }}>{ind.totalBuilds}</td>
                        <td className="px-4 py-2" style={{ color: "#64748B" }}>{ind.approvedBuilds}</td>
                        <td className="px-4 py-2">
                          <select
                            value={editData.llmTier ?? 3}
                            onChange={(e) => setEditData({ ...editData, llmTier: parseInt(e.target.value) })}
                            className="rounded-lg px-2 py-1.5 text-sm outline-none"
                            style={{ backgroundColor: "#F8FAFC", border: "1.5px solid #E2E8F0" }}
                          >
                            <option value={1}>1 (Cached)</option>
                            <option value={2}>2 (Distilled)</option>
                            <option value={3}>3 (Mainstream)</option>
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input type="checkbox" checked={editData.isRegulated ?? false} onChange={(e) => setEditData({ ...editData, isRegulated: e.target.checked })} className="h-4 w-4 rounded" />
                        </td>
                        <td className="px-4 py-2">
                          <input type="checkbox" checked={editData.isActive ?? true} onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })} className="h-4 w-4 rounded" />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex gap-1.5">
                            <button onClick={saveEdit} disabled={saving} className="rounded-lg px-2.5 py-1 text-xs font-medium text-white" style={{ backgroundColor: "#16A34A" }}>
                              {saving ? "..." : "Save"}
                            </button>
                            <button onClick={() => setEditingId(null)} className="rounded-lg px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}>
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-medium text-neutral-900">{ind.displayName}</td>
                        <td className="px-4 py-3" style={{ color: "#64748B" }}>{ind.archetype}</td>
                        <td className="px-4 py-3" style={{ color: "#64748B" }}>{ind.category ?? "---"}</td>
                        <td className="px-4 py-3" style={{ color: "#64748B" }}>{ind.totalBuilds}</td>
                        <td className="px-4 py-3" style={{ color: "#64748B" }}>{ind.approvedBuilds}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: tier.bg, color: tier.color }}>
                            Tier {ind.llmTier} ({tier.label})
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span style={{ color: ind.isRegulated ? "#D97706" : "#CBD5E1" }}>
                            {ind.isRegulated ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span style={{ color: ind.isActive ? "#16A34A" : "#DC2626" }}>
                            {ind.isActive ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => startEdit(ind)} className="rounded-lg px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: "#EEF2FF", color: "#4F46E5" }}>
                            Edit
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
