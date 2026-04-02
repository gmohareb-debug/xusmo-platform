"use client";

// =============================================================================
// Support Page — AI support chat (placeholder)
// =============================================================================

import { LifeBuoy, MessageCircle, Bot, Mail } from "lucide-react";
import { C } from "@/lib/studio/colors";

export default function SiteSupportPage() {
  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", fontSize: 14 }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: "0 0 8px" }}>Support</h1>
        <p style={{ color: C.dim, fontSize: 13, margin: "0 0 24px" }}>
          Get help with your website. Our AI assistant can help with most questions instantly.
        </p>

        {/* AI Chat — Coming Soon */}
        <div
          style={{
            background: C.surface,
            borderRadius: 12,
            border: `1px solid ${C.purple}25`,
            padding: 24,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: `${C.purple}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Bot size={26} color={C.purple} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>
            AI Support Chat
          </div>
          <p style={{ color: C.muted, fontSize: 13, margin: "0 0 20px", lineHeight: 1.6 }}>
            Our AI assistant understands your website configuration and can help with common questions about
            content changes, feature setup, domain configuration, and more.
          </p>
          <div
            style={{
              background: C.surfaceAlt,
              borderRadius: 8,
              border: `1px dashed ${C.border}`,
              padding: 24,
              color: C.dim,
              marginBottom: 16,
            }}
          >
            <MessageCircle size={20} color={C.dim} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>
              Coming Soon
            </div>
            <div style={{ fontSize: 12 }}>AI-powered support chat is under development.</div>
          </div>
        </div>

        {/* Contact Options */}
        <div
          style={{
            background: C.surface,
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            padding: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <LifeBuoy size={16} color={C.blue} />
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Other Ways to Get Help</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 8,
                background: C.surfaceAlt,
                border: `1px solid ${C.border}`,
              }}
            >
              <Mail size={16} color={C.cyan} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Email Support</div>
                <div style={{ fontSize: 11, color: C.dim }}>support@xusmo.io -- We respond within 24 hours</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
