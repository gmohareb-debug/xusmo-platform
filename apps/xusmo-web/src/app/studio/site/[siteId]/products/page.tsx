"use client";

// =============================================================================
// Product Staging Queue — Review and publish imported products
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Package,
  Eye,
  Send,
  Trash2,
  Loader2,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

interface Product {
  id: string;
  title: string;
  supplier_name: string;
  status: "staging" | "published" | "rejected";
  price: number;
  cost: number;
  margin: number;
  image_url: string | null;
  imported_at: string;
}

type ProductFilter = "all" | "staging" | "published" | "rejected";

export default function ProductsPage() {
  const params = useParams();
  const siteId = params.siteId as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ProductFilter>("staging");
  const [publishing, setPublishing] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/store/${siteId}/products?status=${filter}`);
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data.products ?? data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [siteId, filter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const publishProduct = async (productId: string) => {
    setPublishing((prev) => new Set(prev).add(productId));
    try {
      await fetch(`/api/store/${siteId}/products/${productId}/publish`, {
        method: "POST",
      });
      await fetchProducts();
    } catch {
      // Handled by UI
    } finally {
      setPublishing((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const filterTabs: { key: ProductFilter; label: string }[] = [
    { key: "staging", label: "Staging" },
    { key: "published", label: "Published" },
    { key: "rejected", label: "Rejected" },
    { key: "all", label: "All" },
  ];

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: C.text, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Package size={24} /> Product Staging
        </h1>
        <p style={{ color: C.muted, marginTop: "0.25rem" }}>
          Review, price, and publish imported products to your store.
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
      ) : products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: C.surface, borderRadius: "12px", border: `1px solid ${C.border}` }}>
          <Filter size={48} color={C.muted} style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ color: C.text, marginBottom: "0.5rem" }}>No products in {filter}</h3>
          <p style={{ color: C.muted }}>Import products from a supplier feed to get started.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                display: "flex", alignItems: "center", gap: "1rem",
                padding: "1rem", background: "#fff", border: `1px solid ${C.border}`,
                borderRadius: "10px",
              }}
            >
              {/* Image placeholder */}
              <div style={{
                width: "60px", height: "60px", background: C.surface, borderRadius: "8px",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {product.image_url ? (
                  <img src={product.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
                ) : (
                  <Package size={24} color={C.muted} />
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {product.title}
                </div>
                <div style={{ display: "flex", gap: "1rem", fontSize: "0.8125rem", color: C.muted, marginTop: "0.25rem" }}>
                  <span>Supplier: {product.supplier_name}</span>
                  <span>Cost: ${product.cost?.toFixed(2) ?? "N/A"}</span>
                  <span>Price: ${product.price?.toFixed(2) ?? "N/A"}</span>
                  <span style={{ color: (product.margin ?? 0) > 0 ? "#16a34a" : "#dc2626" }}>
                    Margin: {product.margin?.toFixed(0) ?? 0}%
                  </span>
                </div>
              </div>

              {/* Status */}
              <div style={{
                display: "flex", alignItems: "center", gap: "0.25rem",
                padding: "0.25rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem",
                fontWeight: 500,
                background: product.status === "published" ? "#dcfce7" : product.status === "rejected" ? "#fef2f2" : "#f0f9ff",
                color: product.status === "published" ? "#166534" : product.status === "rejected" ? "#b91c1c" : "#1e40af",
              }}>
                {product.status === "published" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                {product.status}
              </div>

              {/* Actions */}
              {product.status === "staging" && (
                <div style={{ display: "flex", gap: "0.375rem" }}>
                  <button
                    style={{ padding: "0.375rem", background: "transparent", border: `1px solid ${C.border}`, borderRadius: "6px", cursor: "pointer" }}
                    title="Preview"
                  >
                    <Eye size={16} color={C.muted} />
                  </button>
                  <button
                    onClick={() => publishProduct(product.id)}
                    disabled={publishing.has(product.id)}
                    style={{ padding: "0.375rem", background: C.accent, border: "none", borderRadius: "6px", cursor: "pointer" }}
                    title="Publish"
                  >
                    {publishing.has(product.id) ? (
                      <Loader2 size={16} color="#fff" style={{ animation: "spin 1s linear infinite" }} />
                    ) : (
                      <Send size={16} color="#fff" />
                    )}
                  </button>
                  <button
                    style={{ padding: "0.375rem", background: "transparent", border: `1px solid ${C.border}`, borderRadius: "6px", cursor: "pointer" }}
                    title="Reject"
                  >
                    <Trash2 size={16} color="#dc2626" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
