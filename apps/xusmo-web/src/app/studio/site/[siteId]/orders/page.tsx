"use client";

// =============================================================================
// Orders Management — View orders and purchase orders
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  ShoppingCart,
  Loader2,
  Eye,
  FileText,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  status: "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  total: number;
  items_count: number;
  created_at: string;
  has_po: boolean;
}

type OrderFilter = "all" | "processing" | "shipped" | "delivered";

const STATUS_STYLES: Record<string, { bg: string; color: string; icon: typeof Clock }> = {
  processing: { bg: "#fef3c7", color: "#92400e", icon: Clock },
  shipped: { bg: "#dbeafe", color: "#1e40af", icon: Truck },
  delivered: { bg: "#dcfce7", color: "#166534", icon: CheckCircle2 },
  cancelled: { bg: "#fef2f2", color: "#b91c1c", icon: AlertCircle },
  refunded: { bg: "#f3e8ff", color: "#6b21a8", icon: AlertCircle },
};

export default function OrdersPage() {
  const params = useParams();
  const siteId = params.siteId as string;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter === "all"
        ? `/api/store/${siteId}/orders`
        : `/api/store/${siteId}/orders?status=${filter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(data.orders ?? data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [siteId, filter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filterTabs: { key: OrderFilter; label: string }[] = [
    { key: "all", label: "All Orders" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
  ];

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: C.text, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ShoppingCart size={24} /> Orders
        </h1>
        <p style={{ color: C.muted, marginTop: "0.25rem" }}>
          Manage customer orders and supplier purchase orders.
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem", background: C.surface, padding: "0.25rem", borderRadius: "8px", width: "fit-content" }}>
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: "0.5rem 1rem", borderRadius: "6px", border: "none",
              background: filter === tab.key ? "#fff" : "transparent",
              color: filter === tab.key ? C.text : C.muted,
              fontWeight: filter === tab.key ? 600 : 400,
              cursor: "pointer", fontSize: "0.875rem",
              boxShadow: filter === tab.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
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
      ) : orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: C.surface, borderRadius: "12px", border: `1px solid ${C.border}` }}>
          <ShoppingCart size={48} color={C.muted} style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ color: C.text, marginBottom: "0.5rem" }}>No orders yet</h3>
          <p style={{ color: C.muted }}>Orders will appear here when customers place them.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {orders.map((order) => {
            const statusStyle = STATUS_STYLES[order.status] ?? STATUS_STYLES.processing;
            const StatusIcon = statusStyle.icon;
            return (
              <div
                key={order.id}
                style={{
                  display: "flex", alignItems: "center", gap: "1rem",
                  padding: "1rem 1.25rem", background: "#fff", border: `1px solid ${C.border}`,
                  borderRadius: "10px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                    <span style={{ fontWeight: 600, color: C.text }}>#{order.order_number}</span>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: "0.25rem",
                      padding: "0.125rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem",
                      fontWeight: 500, background: statusStyle.bg, color: statusStyle.color,
                    }}>
                      <StatusIcon size={12} /> {order.status}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.8125rem", color: C.muted }}>
                    <span>{order.customer_name}</span>
                    <span>{order.items_count} item{order.items_count !== 1 ? "s" : ""}</span>
                    <span>${order.total?.toFixed(2)}</span>
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.375rem" }}>
                  <button style={{ padding: "0.375rem", background: "transparent", border: `1px solid ${C.border}`, borderRadius: "6px", cursor: "pointer" }} title="View Order">
                    <Eye size={16} color={C.muted} />
                  </button>
                  {order.has_po && (
                    <button style={{ padding: "0.375rem", background: "transparent", border: `1px solid ${C.border}`, borderRadius: "6px", cursor: "pointer" }} title="View PO">
                      <FileText size={16} color={C.accent} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
