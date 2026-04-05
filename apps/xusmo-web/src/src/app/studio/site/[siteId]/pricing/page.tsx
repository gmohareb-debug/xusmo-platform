"use client";

// =============================================================================
// Pricing Rules — Markup rules engine for dropshipping products
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  DollarSign,
  Plus,
  Loader2,
  Edit3,
  Trash2,
  Save,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

interface PricingRule {
  id: string;
  name: string;
  type: "percentage" | "fixed" | "formula";
  value: number;
  scope: string; // "all", supplier slug, or category
  priority: number;
  is_active: boolean;
}

export default function PricingPage() {
  const params = useParams();
  const siteId = params.siteId as string;

  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/store/${siteId}/pricing`);
      if (!res.ok) throw new Error("Failed to load pricing rules");
      const data = await res.json();
      setRules(data.rules ?? data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pricing rules");
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: C.text, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <DollarSign size={24} /> Pricing Rules
          </h1>
          <p style={{ color: C.muted, marginTop: "0.25rem" }}>
            Configure markup rules for product pricing.
          </p>
        </div>
        <button
          style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.5rem 1rem", background: C.accent, color: "#fff",
            border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600,
          }}
        >
          <Plus size={16} /> Add Rule
        </button>
      </div>

      {/* Default markup info */}
      <div style={{
        padding: "1rem 1.25rem", background: "#f0f9ff", border: "1px solid #bae6fd",
        borderRadius: "8px", marginBottom: "1.5rem", fontSize: "0.875rem", color: "#0369a1",
      }}>
        Default markup: 1.6x (60% margin). Products without specific rules use this multiplier.
      </div>

      {error && (
        <div style={{ padding: "1rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#b91c1c", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} color={C.accent} />
        </div>
      ) : rules.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: C.surface, borderRadius: "12px", border: `1px solid ${C.border}` }}>
          <DollarSign size={48} color={C.muted} style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ color: C.text, marginBottom: "0.5rem" }}>No custom pricing rules</h3>
          <p style={{ color: C.muted }}>All products use the default 1.6x markup multiplier.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {rules.map((rule) => (
            <div
              key={rule.id}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "1rem 1.25rem", background: "#fff", border: `1px solid ${C.border}`,
                borderRadius: "10px", opacity: rule.is_active ? 1 : 0.6,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: C.text }}>{rule.name}</div>
                <div style={{ fontSize: "0.8125rem", color: C.muted, marginTop: "0.25rem" }}>
                  {rule.type === "percentage" ? `${rule.value}% markup` : rule.type === "fixed" ? `+$${rule.value} fixed` : `Formula: ${rule.value}`}
                  {" · "}Scope: {rule.scope} · Priority: {rule.priority}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.375rem" }}>
                <button style={{ padding: "0.375rem", background: "transparent", border: `1px solid ${C.border}`, borderRadius: "6px", cursor: "pointer" }} title="Edit">
                  <Edit3 size={16} color={C.muted} />
                </button>
                <button style={{ padding: "0.375rem", background: "transparent", border: `1px solid ${C.border}`, borderRadius: "6px", cursor: "pointer" }} title="Delete">
                  <Trash2 size={16} color="#dc2626" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
