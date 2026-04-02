"use client";

// =============================================================================
// Billing Page — Subscription status (placeholder)
// =============================================================================

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CreditCard, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { C } from "@/lib/studio/colors";

export default function SiteBillingPage() {
  const params = useParams();
  const siteId = params.siteId as string;
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState<any>(null);

  useEffect(() => {
    fetch("/api/billing/status")
      .then((r) => r.json())
      .then((data) => setBilling(data))
      .catch(() => setBilling(null))
      .finally(() => setLoading(false));
  }, [siteId]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, color: C.muted, fontFamily: "'Inter',-apple-system,sans-serif", fontSize: 14 }}>
        <Loader2 size={20} style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
        <span>Loading billing info...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", fontSize: 14 }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: "0 0 8px" }}>Billing</h1>
        <p style={{ color: C.dim, fontSize: 13, margin: "0 0 24px" }}>
          Manage your subscription and payment details.
        </p>

        {/* Subscription Status Card */}
        <div
          style={{
            background: C.surface,
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            padding: 24,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <CreditCard size={20} color={C.blue} />
            <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Subscription Status</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", marginBottom: 4 }}>Status</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle2 size={14} color={C.green} />
                <span style={{ fontSize: 14, fontWeight: 600, color: C.green }}>
                  {billing?.status || "Active"}
                </span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", marginBottom: 4 }}>Plan</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                {billing?.planType || "Basic"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", marginBottom: 4 }}>Amount</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                ${billing?.amount || "11.99"}/mo
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", marginBottom: 4 }}>Next Billing</div>
              <div style={{ fontSize: 14, color: C.muted }}>
                {billing?.currentPeriodEnd
                  ? new Date(billing.currentPeriodEnd).toLocaleDateString()
                  : "---"}
              </div>
            </div>
          </div>
        </div>

        {/* Manage Subscription */}
        <div
          style={{
            background: C.surface,
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            padding: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>
              Manage Payment Method
            </div>
            <div style={{ fontSize: 12, color: C.dim }}>
              Update your card, view invoices, or cancel your subscription.
            </div>
          </div>
          <button
            onClick={async () => {
              const res = await fetch("/api/billing/portal", { method: "POST" });
              const data = await res.json();
              if (data.url) window.location.href = data.url;
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 18px",
              borderRadius: 8,
              background: `${C.blue}12`,
              border: `1px solid ${C.blue}30`,
              color: C.blue,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Stripe Portal <ExternalLink size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
