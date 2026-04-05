"use client";

// =============================================================================
// Team Invite Accept Page — Accept invitation to manage a site
// =============================================================================

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function InviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [siteId, setSiteId] = useState<string | null>(null);

  const acceptInvite = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/invite/${token}/accept`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) {
          // Not logged in — redirect to signin with callback
          router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`);
          return;
        }
        throw new Error(data.error || "Failed to accept invite");
      }
      const data = await res.json();
      setAccepted(true);
      setSiteId(data.siteId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#f8f9fc", fontFamily: "'Inter',-apple-system,sans-serif",
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 40, textAlign: "center",
        maxWidth: 440, width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      }}>
        {accepted ? (
          <>
            <CheckCircle2 size={48} color="#22c55e" style={{ marginBottom: 16 }} />
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>
              Welcome to the team!
            </h1>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>
              You now have access to manage this website on Xusmo.
            </p>
            <button
              onClick={() => router.push(`/studio/site/${siteId}`)}
              style={{
                padding: "10px 24px", background: "#4F46E5", border: "none",
                borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Open Studio
            </button>
          </>
        ) : (
          <>
            <Users size={48} color="#4F46E5" style={{ marginBottom: 16 }} />
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>
              You&apos;ve been invited
            </h1>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>
              Someone invited you to manage their website on Xusmo.
              Accept the invitation to get started.
            </p>

            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8, padding: 12,
                background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8,
                marginBottom: 16, color: "#dc2626", fontSize: 13,
              }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button
              onClick={acceptInvite}
              disabled={loading}
              style={{
                padding: "10px 24px", background: "#4F46E5", border: "none",
                borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600,
                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8,
              }}
            >
              {loading ? (
                <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Accepting...</>
              ) : (
                "Accept & Open Studio"
              )}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}
      </div>
    </div>
  );
}
