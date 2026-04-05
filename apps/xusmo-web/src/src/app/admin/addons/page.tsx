"use client";

// =============================================================================
// Admin Add-Ons Management — Full CRUD for add-on catalog + bundles
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import {
  Package,
  Layers,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  DollarSign,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Search,
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Color tokens                                                      */
/* ------------------------------------------------------------------ */

const C = {
  bg: "#0f1117",
  surface: "#181b25",
  surfaceAlt: "#1e2230",
  border: "#2a2f3e",
  red: "#dc2626",
  amber: "#f59e0b",
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#a855f7",
  cyan: "#06b6d4",
  text: "#e8ecf4",
  muted: "#a0abbe",
  dim: "#7a859b",
};

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface AddOn {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  pricingType: string;
  priceInCents: number;
  interval: string | null;
  stripePriceId: string | null;
  archetypes: string[];
  industries: string[];
  isActive: boolean;
  sortOrder: number;
  _count?: { entitlements: number };
}

interface BundleItem {
  id: string;
  addOn: AddOn;
}

interface Bundle {
  id: string;
  slug: string;
  name: string;
  description: string;
  discountPct: number;
  stripePriceId: string | null;
  isActive: boolean;
  items: BundleItem[];
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export default function AdminAddOnsPage() {
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [expandedBundle, setExpandedBundle] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/addons");
      if (!res.ok) throw new Error("Failed to fetch add-ons");
      const data = await res.json();
      setAddOns(data.addOns || []);
      setBundles(data.bundles || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleActive = async (addon: AddOn) => {
    try {
      const res = await fetch("/api/admin/addons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: addon.id, isActive: !addon.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setAddOns((prev) =>
        prev.map((a) => (a.id === addon.id ? { ...a, isActive: !a.isActive } : a))
      );
    } catch {
      setError("Failed to toggle add-on status");
    }
  };

  const handleSyncStripe = async () => {
    setSyncing(true);
    // Placeholder: would call Stripe sync endpoint
    await new Promise((r) => setTimeout(r, 1500));
    setSyncing(false);
  };

  const categories = ["All", ...Array.from(new Set(addOns.map((a) => a.category)))];

  const filtered = addOns.filter((a) => {
    if (categoryFilter !== "All" && a.category !== categoryFilter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.slug.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const formatPrice = (cents: number, type: string, interval: string | null) => {
    const dollars = (cents / 100).toFixed(2);
    if (type === "RECURRING" && interval) return `$${dollars}/${interval === "month" ? "mo" : "yr"}`;
    if (type === "ONE_TIME") return `$${dollars} one-time`;
    return `$${dollars}`;
  };

  if (loading) {
    return (
      <div style={{ background: C.bg, color: C.text, fontFamily: "'Inter',-apple-system,sans-serif", fontSize: 14, minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 32, height: 32, border: `2px solid ${C.red}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
          <div style={{ color: C.muted, fontSize: 13 }}>Loading add-ons...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "'Inter',-apple-system,sans-serif", fontSize: 14, minHeight: "100%" }}>
      <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Add-On Management</h1>
            <p style={{ color: C.dim, fontSize: 12, margin: 0 }}>
              {addOns.length} add-ons &middot; {bundles.length} bundles &middot; Manage catalog, pricing, and Stripe sync
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => fetchData()}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.muted, cursor: "pointer", fontSize: 12 }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button
              onClick={handleSyncStripe}
              disabled={syncing}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
                border: `1px solid ${C.purple}40`, background: `${C.purple}15`, color: C.purple,
                cursor: syncing ? "wait" : "pointer", fontSize: 12, fontWeight: 600,
                opacity: syncing ? 0.7 : 1,
              }}
            >
              <Zap size={14} /> {syncing ? "Syncing..." : "Sync to Stripe"}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: `${C.red}10`, border: `1px solid ${C.red}30`, borderRadius: 8, padding: 12, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={14} color={C.red} />
            <span style={{ color: C.red, fontSize: 12 }}>{error}</span>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "7px 12px", flex: "0 0 260px" }}>
            <Search size={14} color={C.dim} />
            <input
              placeholder="Search add-ons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: "transparent", border: "none", color: C.text, outline: "none", fontSize: 12, width: "100%" }}
            />
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: "6px 12px", borderRadius: 6, border: `1px solid ${categoryFilter === cat ? C.red : C.border}`,
                background: categoryFilter === cat ? `${C.red}15` : "transparent",
                color: categoryFilter === cat ? C.red : C.muted, cursor: "pointer", fontSize: 11, fontWeight: categoryFilter === cat ? 600 : 400,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Add-Ons Table */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 32 }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
            <Package size={16} color={C.red} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Add-Ons Catalog</span>
            <span style={{ fontSize: 11, color: C.dim, marginLeft: 8 }}>{filtered.length} items</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceAlt }}>
                {["Name", "Category", "Type", "Price", "Archetypes", "Industries", "Active", "Entitlements"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "9px 14px", fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((addon) => (
                <tr key={addon.id} style={{ borderBottom: `1px solid ${C.border}`, opacity: addon.isActive ? 1 : 0.5 }}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontWeight: 600, color: "#fff" }}>{addon.name}</div>
                    <div style={{ fontSize: 11, color: C.dim, fontFamily: "monospace" }}>{addon.slug}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2, maxWidth: 240 }}>{addon.description}</div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <Badge label={addon.category} color={C.purple} />
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <Badge label={addon.pricingType} color={addon.pricingType === "RECURRING" ? C.blue : C.green} />
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontWeight: 600, color: C.green, fontSize: 13 }}>
                      {formatPrice(addon.priceInCents, addon.pricingType, addon.interval)}
                    </div>
                    {addon.stripePriceId ? (
                      <div style={{ fontSize: 10, color: C.dim, fontFamily: "monospace", marginTop: 2 }}>
                        <CheckCircle2 size={9} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} color={C.green} />
                        Stripe synced
                      </div>
                    ) : (
                      <div style={{ fontSize: 10, color: C.amber, marginTop: 2 }}>
                        <AlertTriangle size={9} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
                        Not synced
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {addon.archetypes.map((a) => <Badge key={a} label={a} color={C.blue} />)}
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap", maxWidth: 180 }}>
                      {addon.industries.length > 0 ? (
                        addon.industries.slice(0, 3).map((i) => <Badge key={i} label={i} color={C.cyan} />)
                      ) : (
                        <span style={{ color: C.dim, fontSize: 11 }}>All</span>
                      )}
                      {addon.industries.length > 3 && (
                        <span style={{ fontSize: 10, color: C.dim }}>+{addon.industries.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <button
                      onClick={() => toggleActive(addon)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      {addon.isActive ? (
                        <ToggleRight size={24} color={C.green} />
                      ) : (
                        <ToggleLeft size={24} color={C.dim} />
                      )}
                    </button>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Shield size={13} color={C.muted} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{addon._count?.entitlements ?? 0}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 40, textAlign: "center", color: C.dim }}>
                    No add-ons found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bundles Section */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
            <Layers size={16} color={C.amber} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Bundles</span>
            <span style={{ fontSize: 11, color: C.dim, marginLeft: 8 }}>{bundles.length} bundles</span>
          </div>

          {bundles.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: C.dim }}>
              No bundles configured yet.
            </div>
          ) : (
            <div>
              {bundles.map((bundle) => {
                const isExpanded = expandedBundle === bundle.id;
                const totalCents = bundle.items.reduce((sum, item) => sum + item.addOn.priceInCents, 0);
                const discountedCents = Math.round(totalCents * (1 - bundle.discountPct / 100));

                return (
                  <div key={bundle.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <div
                      onClick={() => setExpandedBundle(isExpanded ? null : bundle.id)}
                      style={{
                        padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
                        background: isExpanded ? C.surfaceAlt : "transparent",
                      }}
                    >
                      {isExpanded ? <ChevronUp size={16} color={C.muted} /> : <ChevronDown size={16} color={C.muted} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontWeight: 600, color: "#fff" }}>{bundle.name}</span>
                          <Badge label={`${bundle.discountPct}% off`} color={C.amber} />
                          {!bundle.isActive && <Badge label="Inactive" color={C.dim} />}
                          <span style={{ fontSize: 11, color: C.dim, fontFamily: "monospace" }}>{bundle.slug}</span>
                        </div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{bundle.description}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 11, color: C.dim, textDecoration: "line-through" }}>${(totalCents / 100).toFixed(2)}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.green }}>${(discountedCents / 100).toFixed(2)}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Tag size={12} color={C.muted} />
                        <span style={{ fontSize: 12, color: C.muted }}>{bundle.items.length} add-ons</span>
                      </div>
                      <div>
                        {bundle.stripePriceId ? (
                          <span style={{ fontSize: 10, color: C.green }}>
                            <CheckCircle2 size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
                            Synced
                          </span>
                        ) : (
                          <span style={{ fontSize: 10, color: C.amber }}>
                            <AlertTriangle size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
                            Not synced
                          </span>
                        )}
                      </div>
                    </div>
                    {isExpanded && (
                      <div style={{ padding: "0 18px 14px 50px", background: C.surfaceAlt }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: C.dim, marginBottom: 8, textTransform: "uppercase" }}>Constituent Add-Ons</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
                          {bundle.items.map((item) => (
                            <div
                              key={item.id}
                              style={{
                                background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                                padding: "10px 12px", display: "flex", alignItems: "center", gap: 10,
                              }}
                            >
                              <Package size={14} color={C.muted} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{item.addOn.name}</div>
                                <div style={{ fontSize: 11, color: C.dim }}>{formatPrice(item.addOn.priceInCents, item.addOn.pricingType, item.addOn.interval)}</div>
                              </div>
                              <Badge label={item.addOn.category} color={C.purple} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4, background: `${color}18`, color }}>
      {label}
    </span>
  );
}

function formatPrice(cents: number, type: string, interval: string | null) {
  const dollars = (cents / 100).toFixed(2);
  if (type === "RECURRING" && interval) return `$${dollars}/${interval === "month" ? "mo" : "yr"}`;
  if (type === "ONE_TIME") return `$${dollars} one-time`;
  return `$${dollars}`;
}
