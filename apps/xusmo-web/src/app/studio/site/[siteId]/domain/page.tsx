"use client";

// =============================================================================
// Domain Page — Connect a custom domain (placeholder)
// =============================================================================

import { Globe, Link2, Shield, ArrowRight } from "lucide-react";
import { C } from "@/lib/studio/colors";

export default function SiteDomainPage() {
  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", fontSize: 14 }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: "0 0 8px" }}>Domain Settings</h1>
        <p style={{ color: C.dim, fontSize: 13, margin: "0 0 24px" }}>
          Connect your own domain or purchase one through Xusmo.
        </p>

        {/* Connect Your Domain */}
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
            <Globe size={20} color={C.cyan} />
            <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Connect Your Domain</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {/* Option 1: Bring Your Own */}
            <div
              style={{
                background: C.surfaceAlt,
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                padding: 18,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Link2 size={16} color={C.blue} />
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Bring Your Own Domain</span>
              </div>
              <p style={{ fontSize: 12, color: C.muted, margin: "0 0 12px", lineHeight: 1.5 }}>
                Already own a domain? Point it to your Xusmo site by updating your DNS records.
              </p>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 6,
                  background: `${C.blue}12`,
                  border: `1px solid ${C.blue}30`,
                  color: C.blue,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Connect Domain <ArrowRight size={12} />
              </button>
            </div>

            {/* Option 2: Purchase */}
            <div
              style={{
                background: C.surfaceAlt,
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                padding: 18,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Globe size={16} color={C.green} />
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Purchase a Domain</span>
              </div>
              <p style={{ fontSize: 12, color: C.muted, margin: "0 0 12px", lineHeight: 1.5 }}>
                Search and register a new domain. Free with annual plan or starting at $9.99/year.
              </p>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 6,
                  background: `${C.green}12`,
                  border: `1px solid ${C.green}30`,
                  color: C.green,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Search Domains <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* SSL info */}
          <div
            style={{
              background: `${C.green}08`,
              borderRadius: 8,
              border: `1px solid ${C.green}20`,
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Shield size={14} color={C.green} />
            <span style={{ fontSize: 12, color: C.muted }}>
              Free SSL certificate is automatically provisioned for all connected domains.
            </span>
          </div>
        </div>

        {/* Current Domain */}
        <div
          style={{
            background: C.surface,
            borderRadius: 12,
            border: `1px dashed ${C.border}`,
            padding: 30,
            textAlign: "center",
            color: C.dim,
          }}
        >
          <Globe size={24} color={C.dim} style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>
            No Custom Domain Connected
          </div>
          <div style={{ fontSize: 12, color: C.dim }}>
            Your site is currently accessible at your xusmo.io subdomain.
          </div>
        </div>
      </div>
    </div>
  );
}
