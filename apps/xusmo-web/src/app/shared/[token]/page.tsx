"use client";

// =============================================================================
// Public Preview Page — View site preview via share token (no auth required)
// =============================================================================

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";

interface PreviewData {
  site: {
    businessName: string;
    wpUrl: string | null;
  };
  canComment: boolean;
}

export default function PublicPreviewPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch(`/api/preview/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error("Invalid or expired link");
        return r.json();
      })
      .then((d) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const submitComment = async () => {
    if (!comment.trim()) return;
    await fetch(`/api/preview/${token}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: comment }),
    });
    setSent(true);
    setComment("");
    setTimeout(() => { setSent(false); setShowComment(false); }, 2000);
  };

  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", background: "#f8f9fc", fontFamily: "'Inter',-apple-system,sans-serif",
      }}>
        <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "#4F46E5" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", background: "#f8f9fc", fontFamily: "'Inter',-apple-system,sans-serif",
      }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>
          Preview Unavailable
        </div>
        <div style={{ fontSize: 14, color: "#64748b" }}>
          {error || "This preview link is invalid or has expired."}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Bar */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #e2e8f0",
        padding: "10px 20px", display: "flex", alignItems: "center",
        justifyContent: "space-between", fontFamily: "'Inter',-apple-system,sans-serif",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
            Xus<span style={{ color: "#4F46E5" }}>mo</span>
          </span>
          <span style={{ fontSize: 13, color: "#64748b" }}>
            Preview of <strong>{data.site.businessName}</strong>
          </span>
        </div>
        {data.canComment && (
          <button
            onClick={() => setShowComment(!showComment)}
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
              background: showComment ? "#4F46E5" : "#f1f5f9",
              border: "1px solid #e2e8f0", borderRadius: 6,
              color: showComment ? "#fff" : "#64748b", fontSize: 13, cursor: "pointer",
            }}
          >
            <MessageSquare size={14} /> Leave Feedback
          </button>
        )}
      </div>

      {/* Comment Panel */}
      {showComment && (
        <div style={{
          background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "12px 20px",
          display: "flex", gap: 10, alignItems: "center",
          fontFamily: "'Inter',-apple-system,sans-serif",
        }}>
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Type your feedback..."
            style={{
              flex: 1, padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 6,
              fontSize: 13, outline: "none",
            }}
          />
          <button
            onClick={submitComment}
            disabled={!comment.trim()}
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "8px 14px",
              background: "#4F46E5", border: "none", borderRadius: 6,
              color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            {sent ? "Sent!" : <><Send size={14} /> Send</>}
          </button>
        </div>
      )}

      {/* Preview Iframe */}
      <div style={{ flex: 1, position: "relative" }}>
        {data.site.wpUrl ? (
          <iframe
            src={data.site.wpUrl}
            style={{ width: "100%", height: "100%", border: "none", minHeight: "calc(100vh - 50px)" }}
          />
        ) : (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            height: "100%", color: "#64748b", fontFamily: "'Inter',-apple-system,sans-serif",
          }}>
            Preview not available — site is still being built.
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div style={{
        background: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: "8px 20px",
        textAlign: "center", fontSize: 12, color: "#94a3b8",
        fontFamily: "'Inter',-apple-system,sans-serif",
      }}>
        Built with <a href="/" style={{ color: "#4F46E5", textDecoration: "none" }}>Xusmo</a> — Get your free website
      </div>
    </div>
  );
}
