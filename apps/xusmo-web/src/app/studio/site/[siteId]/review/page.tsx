"use client";

// =============================================================================
// Review Page — Page-by-page review (placeholder)
// =============================================================================

import { MessageSquare, FileText, ArrowRight } from "lucide-react";
import { C } from "@/lib/studio/colors";

export default function SiteReviewPage() {
  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", fontSize: 14 }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: `${C.blue}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <MessageSquare size={28} color={C.blue} />
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: "0 0 8px" }}>
          Page-by-Page Review
        </h1>
        <p style={{ color: C.muted, fontSize: 14, margin: "0 0 32px", lineHeight: 1.6 }}>
          Review each page of your website, leave feedback, and request changes.
          Our AI will apply your revisions automatically.
        </p>

        <div
          style={{
            background: C.surface,
            borderRadius: 12,
            border: `1px dashed ${C.border}`,
            padding: 40,
            color: C.dim,
          }}
        >
          <FileText size={24} color={C.dim} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>
            Coming Soon
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>
            Page-by-page review with inline annotations and AI-powered revisions is under development.
          </div>
        </div>
      </div>
    </div>
  );
}
