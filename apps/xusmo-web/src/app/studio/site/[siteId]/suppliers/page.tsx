"use client";

// =============================================================================
// Supplier Management — Manage supplier feeds for dropshipping
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Truck,
  Plus,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Settings,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

interface Supplier {
  id: string;
  name: string;
  slug: string;
  connector_type: string;
  is_active: boolean;
  last_sync_at: string | null;
  product_count: number;
}

export default function SuppliersPage() {
  const params = useParams();
  const siteId = params.siteId as string;

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/store/${siteId}/suppliers`);
      if (!res.ok) throw new Error("Failed to load suppliers");
      const data = await res.json();
      setSuppliers(data.suppliers ?? data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const syncSupplier = async (supplierId: string) => {
    setSyncing(supplierId);
    try {
      await fetch(`/api/store/${siteId}/suppliers/${supplierId}/sync`, {
        method: "POST",
      });
      await fetchSuppliers();
    } catch {
      // Handled by UI
    } finally {
      setSyncing(null);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: C.text, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Truck size={24} /> Supplier Feeds
          </h1>
          <p style={{ color: C.muted, marginTop: "0.25rem" }}>
            Manage your dropshipping supplier connections.
          </p>
        </div>
        <button
          style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.5rem 1rem", background: C.accent, color: "#fff",
            border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600,
          }}
        >
          <Plus size={16} /> Add Supplier
        </button>
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
      ) : suppliers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: C.surface, borderRadius: "12px", border: `1px solid ${C.border}` }}>
          <Truck size={48} color={C.muted} style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ color: C.text, marginBottom: "0.5rem" }}>No suppliers connected</h3>
          <p style={{ color: C.muted }}>Add a supplier feed to start importing products.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "1.25rem", background: "#fff", border: `1px solid ${C.border}`,
                borderRadius: "10px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <span style={{ fontWeight: 600, color: C.text }}>{supplier.name}</span>
                  {supplier.is_active ? (
                    <CheckCircle2 size={14} color="#16a34a" />
                  ) : (
                    <XCircle size={14} color="#dc2626" />
                  )}
                </div>
                <div style={{ display: "flex", gap: "1rem", fontSize: "0.8125rem", color: C.muted }}>
                  <span>Type: {supplier.connector_type}</span>
                  <span>Products: {supplier.product_count ?? 0}</span>
                  {supplier.last_sync_at && (
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Clock size={12} /> Last sync: {new Date(supplier.last_sync_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => syncSupplier(supplier.id)}
                  disabled={syncing === supplier.id}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.375rem",
                    padding: "0.375rem 0.75rem", background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: "6px", cursor: "pointer", fontSize: "0.8125rem",
                  }}
                >
                  {syncing === supplier.id ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <RefreshCw size={14} />}
                  Sync
                </button>
                <button
                  style={{
                    display: "flex", alignItems: "center", gap: "0.375rem",
                    padding: "0.375rem 0.75rem", background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: "6px", cursor: "pointer", fontSize: "0.8125rem",
                  }}
                >
                  <Settings size={14} /> Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
