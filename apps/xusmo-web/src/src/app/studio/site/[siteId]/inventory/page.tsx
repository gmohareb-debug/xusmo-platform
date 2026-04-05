"use client";

// =============================================================================
// Inventory Management — Stock levels and health monitoring
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Warehouse,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

interface InventoryItem {
  id: string;
  product_title: string;
  sku: string;
  supplier_name: string;
  stock_level: number;
  safety_stock: number;
  status: "healthy" | "low" | "out_of_stock" | "stale";
  last_checked: string;
}

interface InventorySummary {
  total_products: number;
  healthy: number;
  low_stock: number;
  out_of_stock: number;
  stale: number;
}

export default function InventoryPage() {
  const params = useParams();
  const siteId = params.siteId as string;

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/store/${siteId}/inventory`);
      if (!res.ok) throw new Error("Failed to load inventory");
      const data = await res.json();
      setItems(data.items ?? []);
      setSummary(data.summary ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const syncInventory = async () => {
    setSyncing(true);
    try {
      await fetch(`/api/store/${siteId}/inventory/sync`, { method: "POST" });
      await fetchInventory();
    } catch {
      // Handled by UI
    } finally {
      setSyncing(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "healthy": return { bg: "#dcfce7", color: "#166534" };
      case "low": return { bg: "#fef3c7", color: "#92400e" };
      case "out_of_stock": return { bg: "#fef2f2", color: "#b91c1c" };
      case "stale": return { bg: "#f3e8ff", color: "#6b21a8" };
      default: return { bg: C.surface, color: C.muted };
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: C.text, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Warehouse size={24} /> Inventory
          </h1>
          <p style={{ color: C.muted, marginTop: "0.25rem" }}>
            Monitor stock levels and inventory health.
          </p>
        </div>
        <button
          onClick={syncInventory}
          disabled={syncing}
          style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.5rem 1rem", background: C.surface, color: C.text,
            border: `1px solid ${C.border}`, borderRadius: "6px", cursor: "pointer", fontWeight: 500,
          }}
        >
          {syncing ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <RefreshCw size={16} />}
          Sync Stock
        </button>
      </div>

      {/* Summary cards */}
      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
          {[
            { label: "Total Products", value: summary.total_products, icon: Warehouse, color: C.accent },
            { label: "Healthy", value: summary.healthy, icon: CheckCircle2, color: "#16a34a" },
            { label: "Low Stock", value: summary.low_stock, icon: TrendingDown, color: "#d97706" },
            { label: "Out of Stock", value: summary.out_of_stock, icon: AlertTriangle, color: "#dc2626" },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                padding: "1.25rem", background: "#fff", border: `1px solid ${C.border}`,
                borderRadius: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.8125rem", color: C.muted }}>{card.label}</span>
                <card.icon size={18} color={card.color} />
              </div>
              <span style={{ fontSize: "1.5rem", fontWeight: 700, color: C.text }}>{card.value}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{ padding: "1rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#b91c1c", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} color={C.accent} />
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: C.surface, borderRadius: "12px", border: `1px solid ${C.border}` }}>
          <Warehouse size={48} color={C.muted} style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ color: C.text, marginBottom: "0.5rem" }}>No inventory data</h3>
          <p style={{ color: C.muted }}>Import and publish products to see inventory tracking.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {items.map((item) => {
            const sc = statusColor(item.status);
            return (
              <div
                key={item.id}
                style={{
                  display: "flex", alignItems: "center", gap: "1rem",
                  padding: "1rem 1.25rem", background: "#fff", border: `1px solid ${C.border}`,
                  borderRadius: "10px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: C.text }}>{item.product_title}</div>
                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.8125rem", color: C.muted, marginTop: "0.25rem" }}>
                    <span>SKU: {item.sku}</span>
                    <span>Supplier: {item.supplier_name}</span>
                    <span>Checked: {new Date(item.last_checked).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 600, color: C.text, fontSize: "1.125rem" }}>
                    {item.stock_level}
                    {item.stock_level <= item.safety_stock && item.stock_level > 0 && (
                      <TrendingDown size={14} color="#d97706" style={{ marginLeft: "0.25rem" }} />
                    )}
                    {item.stock_level > item.safety_stock && (
                      <TrendingUp size={14} color="#16a34a" style={{ marginLeft: "0.25rem" }} />
                    )}
                  </div>
                  <span style={{
                    display: "inline-block", padding: "0.125rem 0.5rem", borderRadius: "9999px",
                    fontSize: "0.6875rem", fontWeight: 500, background: sc.bg, color: sc.color,
                  }}>
                    {item.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
