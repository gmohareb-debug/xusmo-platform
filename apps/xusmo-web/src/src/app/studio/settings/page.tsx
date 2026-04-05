"use client";

// =============================================================================
// Tenant Settings — Configure tenant-scoped settings (7 categories)
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import {
  Settings,
  RotateCcw,
  Package,
  DollarSign,
  ShoppingCart,
  Globe,
  Mail,
  Database,
  Loader2,
  Save,
  Check,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

type SettingsMap = Record<string, unknown>;

const TABS = [
  { id: "returns", label: "Returns & RMA", icon: RotateCcw },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "pricing", label: "Pricing", icon: DollarSign },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "currency", label: "Currency & FX", icon: Globe },
  { id: "comms", label: "Communications", icon: Mail },
  { id: "retention", label: "Data Retention", icon: Database },
] as const;

type TabId = (typeof TABS)[number]["id"];

const TAB_FIELDS: Record<TabId, Array<{
  key: string;
  label: string;
  type: "number" | "text" | "boolean" | "select";
  options?: string[];
  suffix?: string;
  description?: string;
}>> = {
  returns: [
    { key: "return_window_days", label: "Return Window", type: "number", suffix: "days", description: "How many days customers have to initiate a return" },
    { key: "non_returnable_categories", label: "Non-Returnable Categories", type: "text", description: "Comma-separated category slugs that cannot be returned" },
  ],
  inventory: [
    { key: "safety_stock_buffer", label: "Safety Stock Buffer", type: "number", description: "Units subtracted from available stock to prevent overselling" },
    { key: "stale_inventory_threshold", label: "Stale Inventory Threshold", type: "number", suffix: "hours", description: "Hours after which inventory data is considered stale" },
    { key: "stale_behavior", label: "Stale Behavior", type: "select", options: ["out_of_stock", "hide", "keep_last"], description: "What to do when inventory data becomes stale" },
    { key: "backorders_enabled", label: "Allow Backorders", type: "boolean", description: "Accept orders even when item is out of stock" },
    { key: "handling_time_days", label: "Handling Time", type: "number", suffix: "days", description: "Processing days before shipping" },
    { key: "split_orders_enabled", label: "Split Orders", type: "boolean", description: "Allow splitting orders across multiple suppliers" },
  ],
  pricing: [
    { key: "default_markup_multiplier", label: "Default Markup Multiplier", type: "number", description: "Cost price × this value = retail price (e.g. 1.6 = 60% markup)" },
    { key: "price_rounding_strategy", label: "Price Rounding", type: "select", options: [".99", ".95", ".00", "none"], description: "How to round final prices" },
    { key: "price_outlier_threshold", label: "Price Outlier Threshold", type: "number", suffix: "%", description: "Alert when price deviates more than this % from average" },
    { key: "map_enforcement_enabled", label: "MAP Enforcement", type: "boolean", description: "Enforce Minimum Advertised Price policies" },
  ],
  orders: [
    { key: "po_submission_trigger", label: "PO Submission Trigger", type: "select", options: ["processing", "paid", "manual"], description: "When to auto-submit purchase orders to suppliers" },
    { key: "order_cancellation_window", label: "Cancellation Window", type: "number", suffix: "minutes", description: "Time window for customers to cancel after placing an order" },
  ],
  currency: [
    { key: "store_display_currency", label: "Display Currency", type: "select", options: ["USD", "EUR", "GBP", "CAD", "AUD"], description: "Currency shown to customers" },
    { key: "fx_conversion_mode", label: "FX Conversion Mode", type: "select", options: ["manual", "free_api"], description: "How exchange rates are sourced" },
    { key: "fx_buffer_percent", label: "FX Buffer", type: "number", suffix: "%", description: "Extra margin added to exchange rate conversions" },
    { key: "fx_failure_policy", label: "FX Failure Policy", type: "select", options: ["freeze_last_known", "disable_currency", "fallback_usd"], description: "What happens when FX rate fetch fails" },
  ],
  comms: [
    { key: "shipment_email_mode", label: "Shipment Email Mode", type: "select", options: ["per_shipment", "consolidated"], description: "Send tracking email per shipment or daily digest" },
    { key: "guest_tracking_mode", label: "Guest Tracking", type: "select", options: ["secure_token_link", "email_only", "disabled"], description: "How guest customers track orders" },
    { key: "email_po_fallback", label: "Email PO Fallback", type: "boolean", description: "Send PO via email if API submission fails" },
  ],
  retention: [
    { key: "log_retention_days", label: "Log Retention", type: "number", suffix: "days", description: "How long operational logs are kept" },
    { key: "audit_retention_days", label: "Audit Retention", type: "number", suffix: "days", description: "How long audit trail entries are kept" },
    { key: "export_masking_enabled", label: "Export PII Masking", type: "boolean", description: "Mask personal data in exports" },
  ],
};

export default function TenantSettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [original, setOriginal] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("returns");

  const fetchSettings = useCallback(() => {
    setLoading(true);
    fetch("/api/tenant/settings")
      .then((r) => r.json())
      .then((d) => {
        setSettings(d);
        setOriginal(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateLocal = (key: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(original);

  const saveSettings = async () => {
    const changes: Record<string, unknown> = {};
    for (const key of Object.keys(settings)) {
      if (JSON.stringify(settings[key]) !== JSON.stringify(original[key])) {
        changes[key] = settings[key];
      }
    }
    if (Object.keys(changes).length === 0) return;

    setSaving(true);
    try {
      const res = await fetch("/api/tenant/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: changes }),
      });
      if (res.ok) {
        const d = await res.json();
        setSettings(d);
        setOriginal(d);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setSettings({ ...original });
    setSaved(false);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 80, color: C.muted }}>
        <Loader2 size={20} style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
        Loading settings...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: "'Inter',-apple-system,sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Settings size={22} color={C.accent} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>Tenant Settings</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {hasChanges && (
            <button
              onClick={discard}
              style={{
                padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer",
              }}
            >
              Discard
            </button>
          )}
          <button
            onClick={saveSettings}
            disabled={!hasChanges || saving}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: saved ? C.green : C.accent, border: "none",
              color: "#fff", cursor: hasChanges ? "pointer" : "default",
              opacity: hasChanges ? 1 : 0.5,
            }}
          >
            {saved ? <><Check size={14} /> Saved</> : saving ? <><Loader2 size={14} /> Saving...</> : <><Save size={14} /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, overflowX: "auto", paddingBottom: 2 }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                whiteSpace: "nowrap", cursor: "pointer",
                background: active ? `${C.accent}10` : "transparent",
                border: `1px solid ${active ? C.accent : "transparent"}`,
                color: active ? C.accent : C.muted,
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Fields */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
        {TAB_FIELDS[activeTab].map((field) => (
          <div
            key={field.key}
            style={{
              display: "flex", alignItems: "flex-start", justifyContent: "space-between",
              padding: "16px 0", borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div style={{ flex: 1, marginRight: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{field.label}</div>
              {field.description && (
                <div style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>{field.description}</div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {field.type === "boolean" ? (
                <button
                  onClick={() => updateLocal(field.key, !settings[field.key])}
                  style={{
                    width: 44, height: 24, borderRadius: 12, padding: 2, cursor: "pointer",
                    border: "none",
                    background: settings[field.key] ? C.accent : C.border,
                    transition: "background 0.15s",
                  }}
                >
                  <div
                    style={{
                      width: 20, height: 20, borderRadius: "50%", background: "#fff",
                      transform: settings[field.key] ? "translateX(20px)" : "translateX(0)",
                      transition: "transform 0.15s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  />
                </button>
              ) : field.type === "select" ? (
                <select
                  value={String(settings[field.key] ?? "")}
                  onChange={(e) => updateLocal(field.key, e.target.value)}
                  style={{
                    padding: "6px 10px", borderRadius: 6, fontSize: 13, minWidth: 140,
                    background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.text,
                  }}
                >
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <>
                  <input
                    type={field.type}
                    value={String(settings[field.key] ?? "")}
                    onChange={(e) =>
                      updateLocal(
                        field.key,
                        field.type === "number" ? Number(e.target.value) : e.target.value
                      )
                    }
                    style={{
                      padding: "6px 10px", borderRadius: 6, fontSize: 13, width: 120,
                      background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.text,
                      textAlign: field.type === "number" ? "right" : "left",
                    }}
                  />
                  {field.suffix && (
                    <span style={{ fontSize: 12, color: C.dim }}>{field.suffix}</span>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
