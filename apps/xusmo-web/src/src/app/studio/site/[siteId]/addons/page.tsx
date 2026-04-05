"use client";

// =============================================================================
// Add-Ons Marketplace — Browse, purchase, and manage add-on features
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  Package,
  Layers,
  CheckCircle2,
  Loader2,
  Star,
  Zap,
  ArrowRight,
  Tag,
  Sparkles,
  ShoppingCart,
  Store,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

interface AddOn {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  pricingType: string;
  priceInCents: number;
  interval: string | null;
  archetypes: string[];
  industries: string[];
  isActive: boolean;
}

interface BundleAddOn {
  id: string;
  addOn: AddOn;
}

interface Bundle {
  id: string;
  slug: string;
  name: string;
  description: string;
  discountPct: number;
  isActive: boolean;
  items: BundleAddOn[];
  totalALaCarte: number;
  discountedTotal: number;
  savingsInCents: number;
}

interface Entitlement {
  id: string;
  addOnId: string;
  status: string;
  addOn: AddOn;
}

interface SiteInfo {
  id: string;
  archetype: string;
  businessName: string;
  isEcommerce?: boolean;
}

export default function SiteAddOnsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const siteId = params.siteId as string;

  const [site, setSite] = useState<SiteInfo | null>(null);
  const [recommended, setRecommended] = useState<AddOn[]>([]);
  const [available, setAvailable] = useState<AddOn[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [enablingEcom, setEnablingEcom] = useState(false);

  // Check for success parameter
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    try {
      // Fetch site info
      const sitesRes = await fetch("/api/portal/sites");
      const sitesData = await sitesRes.json();
      const sites = Array.isArray(sitesData) ? sitesData : [];
      const foundSite = sites.find((s: SiteInfo) => s.id === siteId);
      setSite(foundSite || null);

      if (!foundSite) {
        setLoading(false);
        return;
      }

      // Fetch catalog and entitlements in parallel
      const [catalogRes, entRes] = await Promise.all([
        fetch(`/api/addons/catalog?archetype=${foundSite.archetype}&industry=`),
        fetch(`/api/sites/${siteId}/entitlements`),
      ]);

      const catalogData = await catalogRes.json();
      const entData = await entRes.json();

      setRecommended(catalogData.recommended || []);
      setAvailable(catalogData.available || []);
      setBundles(catalogData.bundles || []);
      setEntitlements(entData.entitlements || []);
    } catch {
      // Silently handle errors — UI will show empty state
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const entitledAddOnIds = new Set(
    entitlements.filter((e) => e.status === "ACTIVE").map((e) => e.addOnId)
  );

  const handleAddToSite = async (addOnSlug: string) => {
    setPurchasing(addOnSlug);
    try {
      const res = await fetch("/api/addons/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, addOnSlug }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Handle error
    } finally {
      setPurchasing(null);
    }
  };

  const handleBundleCheckout = async (bundleSlug: string) => {
    setPurchasing(bundleSlug);
    try {
      const res = await fetch("/api/addons/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, bundleSlug }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Handle error
    } finally {
      setPurchasing(null);
    }
  };

  const formatPrice = (cents: number, type: string, interval: string | null) => {
    const dollars = (cents / 100).toFixed(0);
    if (type === "RECURRING" && interval === "month") return `$${dollars}/mo`;
    if (type === "RECURRING" && interval === "year") return `$${dollars}/yr`;
    return `$${dollars} one-time`;
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, color: C.muted, fontFamily: "'Inter',-apple-system,sans-serif", fontSize: 14 }}>
        <Loader2 size={20} style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
        <span>Loading add-ons...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", fontSize: 14 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        {/* Success Toast */}
        {showSuccess && (
          <div
            style={{
              background: `${C.green}15`,
              border: `1px solid ${C.green}40`,
              borderRadius: 10,
              padding: "12px 18px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <CheckCircle2 size={18} color={C.green} />
            <span style={{ color: C.green, fontWeight: 600, fontSize: 13 }}>
              Add-on purchased successfully! It will be activated on your site shortly.
            </span>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>Add Features to Your Site</h1>
          <p style={{ color: C.dim, fontSize: 13, margin: 0 }}>
            Enhance your website with powerful add-ons. Each feature is activated automatically after purchase.
          </p>
        </div>

        {/* E-Commerce Store Card */}
        <div
          style={{
            background: site?.isEcommerce
              ? `linear-gradient(135deg, ${C.green}08, ${C.green}15)`
              : `linear-gradient(135deg, #EEF2FF, #E0E7FF)`,
            border: `1px solid ${site?.isEcommerce ? `${C.green}30` : "#C7D2FE"}`,
            borderRadius: 14,
            padding: 20,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: site?.isEcommerce ? `${C.green}20` : "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Store size={22} color={site?.isEcommerce ? C.green : C.accent} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
                E-Commerce Store
              </div>
              <div style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>
                {site?.isEcommerce
                  ? "WooCommerce + Dropshipping is active on this site"
                  : "Enable WooCommerce + Dropshipping Suite for this site"}
              </div>
            </div>
          </div>
          {site?.isEcommerce ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: `${C.green}15`,
                  color: C.green,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Active
              </span>
              <a
                href={`/studio/site/${siteId}/suppliers`}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  background: C.accent,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Manage Store
              </a>
            </div>
          ) : (
            <button
              onClick={async () => {
                setEnablingEcom(true);
                try {
                  const res = await fetch(`/api/sites/${siteId}/ecommerce/enable`, {
                    method: "POST",
                  });
                  if (res.ok) {
                    setSite((prev) => prev ? { ...prev, isEcommerce: true } : prev);
                  }
                } catch {
                  // ignore
                } finally {
                  setEnablingEcom(false);
                }
              }}
              disabled={enablingEcom}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                background: C.accent,
                border: "none",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                opacity: enablingEcom ? 0.6 : 1,
                whiteSpace: "nowrap",
              }}
            >
              {enablingEcom ? "Enabling..." : "Enable E-Commerce"}
            </button>
          )}
        </div>

        {/* Active Entitlements Summary */}
        {entitlements.length > 0 && (
          <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: "14px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
            <Zap size={16} color={C.green} />
            <span style={{ fontSize: 13, color: C.text }}>
              <span style={{ fontWeight: 600 }}>{entitlements.filter((e) => e.status === "ACTIVE").length}</span> active add-on{entitlements.filter((e) => e.status === "ACTIVE").length !== 1 ? "s" : ""} on this site
            </span>
            <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
              {entitlements
                .filter((e) => e.status === "ACTIVE")
                .slice(0, 5)
                .map((e) => (
                  <span key={e.id} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: `${C.green}18`, color: C.green }}>
                    {e.addOn.name}
                  </span>
                ))}
              {entitlements.filter((e) => e.status === "ACTIVE").length > 5 && (
                <span style={{ fontSize: 10, color: C.dim }}>+{entitlements.filter((e) => e.status === "ACTIVE").length - 5} more</span>
              )}
            </div>
          </div>
        )}

        {/* Recommended for Your Business */}
        {recommended.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Sparkles size={18} color={C.amber} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>Recommended for Your Business</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
              {recommended.map((addon) => (
                <AddOnCard
                  key={addon.id}
                  addon={addon}
                  isEntitled={entitledAddOnIds.has(addon.id)}
                  purchasing={purchasing}
                  onAdd={handleAddToSite}
                  formatPrice={formatPrice}
                  recommended
                />
              ))}
            </div>
          </div>
        )}

        {/* All Available Features */}
        {available.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Package size={18} color={C.blue} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>All Available Features</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
              {available.map((addon) => (
                <AddOnCard
                  key={addon.id}
                  addon={addon}
                  isEntitled={entitledAddOnIds.has(addon.id)}
                  purchasing={purchasing}
                  onAdd={handleAddToSite}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          </div>
        )}

        {/* Bundles */}
        {bundles.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Layers size={18} color={C.purple} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>Save with Bundles</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
              {bundles.map((bundle) => {
                const allEntitled = bundle.items.every((item) => entitledAddOnIds.has(item.addOn.id));
                return (
                  <div
                    key={bundle.id}
                    style={{
                      background: C.surface,
                      borderRadius: 12,
                      border: `1px solid ${C.purple}30`,
                      padding: 20,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Discount badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        background: `${C.amber}20`,
                        color: C.amber,
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: 6,
                      }}
                    >
                      Save {bundle.discountPct}%
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <Layers size={16} color={C.purple} />
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{bundle.name}</div>
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.5 }}>
                      {bundle.description}
                    </div>

                    {/* Included add-ons */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.dim, textTransform: "uppercase", marginBottom: 6 }}>Includes</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {bundle.items.map((item) => (
                          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                            {entitledAddOnIds.has(item.addOn.id) ? (
                              <CheckCircle2 size={12} color={C.green} />
                            ) : (
                              <Tag size={12} color={C.dim} />
                            )}
                            <span style={{ color: entitledAddOnIds.has(item.addOn.id) ? C.green : C.text }}>
                              {item.addOn.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: C.green }}>
                        ${(bundle.discountedTotal / 100).toFixed(0)}
                      </span>
                      <span style={{ fontSize: 13, color: C.dim, textDecoration: "line-through" }}>
                        ${(bundle.totalALaCarte / 100).toFixed(0)}
                      </span>
                      <span style={{ fontSize: 11, color: C.amber, fontWeight: 600 }}>
                        Save ${(bundle.savingsInCents / 100).toFixed(0)}
                      </span>
                    </div>

                    {/* CTA */}
                    {allEntitled ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          padding: "10px 16px",
                          borderRadius: 8,
                          background: `${C.green}12`,
                          color: C.green,
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        <CheckCircle2 size={14} /> All Features Active
                      </div>
                    ) : (
                      <button
                        onClick={() => handleBundleCheckout(bundle.slug)}
                        disabled={purchasing === bundle.slug}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          padding: "10px 16px",
                          borderRadius: 8,
                          background: C.purple,
                          color: "#fff",
                          border: "none",
                          cursor: purchasing === bundle.slug ? "wait" : "pointer",
                          fontSize: 13,
                          fontWeight: 600,
                          opacity: purchasing === bundle.slug ? 0.7 : 1,
                        }}
                      >
                        {purchasing === bundle.slug ? (
                          <>
                            <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                            Processing...
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={14} /> Get This Bundle
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {recommended.length === 0 && available.length === 0 && bundles.length === 0 && (
          <div style={{ background: C.surface, borderRadius: 12, border: `1px dashed ${C.border}`, padding: 60, textAlign: "center" }}>
            <Package size={32} color={C.dim} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 4 }}>No Add-Ons Available Yet</div>
            <div style={{ color: C.dim, fontSize: 13 }}>Check back soon for new features to enhance your site.</div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AddOnCard                                                         */
/* ------------------------------------------------------------------ */

function AddOnCard({
  addon,
  isEntitled,
  purchasing,
  onAdd,
  formatPrice,
  recommended,
}: {
  addon: AddOn;
  isEntitled: boolean;
  purchasing: string | null;
  onAdd: (slug: string) => void;
  formatPrice: (cents: number, type: string, interval: string | null) => string;
  recommended?: boolean;
}) {
  return (
    <div
      style={{
        background: C.surface,
        borderRadius: 12,
        border: `1px solid ${recommended ? `${C.amber}25` : C.border}`,
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            {recommended && <Star size={13} color={C.amber} />}
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{addon.name}</span>
          </div>
          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4, background: `${C.purple}18`, color: C.purple }}>
            {addon.category}
          </span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.green }}>
            {formatPrice(addon.priceInCents, addon.pricingType, addon.interval)}
          </div>
        </div>
      </div>

      {/* Description */}
      <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, flex: 1 }}>
        {addon.description}
      </div>

      {/* CTA */}
      {isEntitled ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "9px 14px",
            borderRadius: 8,
            background: `${C.green}12`,
            color: C.green,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={14} /> Active
        </div>
      ) : (
        <button
          onClick={() => onAdd(addon.slug)}
          disabled={purchasing === addon.slug}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "9px 14px",
            borderRadius: 8,
            background: `${C.red}12`,
            border: `1px solid ${C.red}30`,
            color: C.red,
            cursor: purchasing === addon.slug ? "wait" : "pointer",
            fontSize: 12,
            fontWeight: 600,
            opacity: purchasing === addon.slug ? 0.7 : 1,
          }}
        >
          {purchasing === addon.slug ? (
            <>
              <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
              Processing...
            </>
          ) : (
            <>
              Add to Site <ArrowRight size={13} />
            </>
          )}
        </button>
      )}
    </div>
  );
}
