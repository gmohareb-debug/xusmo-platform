"use client";

// =============================================================================
// Client Preview Share Link — Generate token-based preview URLs
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Share2,
  Link as LinkIcon,
  Copy,
  Trash2,
  Loader2,
  Plus,
  Eye,
  Clock,
  MessageSquare,
  Check,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

interface ShareLink {
  id: string;
  token: string;
  label: string | null;
  canComment: boolean;
  expiresAt: string | null;
  viewCount: number;
  lastViewedAt: string | null;
  isRevoked: boolean;
  createdAt: string;
}

export default function SharePage() {
  const params = useParams();
  const siteId = params.siteId as string;

  const [links, setLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [canComment, setCanComment] = useState(false);
  const [expiry, setExpiry] = useState("never");
  const [copied, setCopied] = useState<string | null>(null);

  const fetchLinks = useCallback(() => {
    setLoading(true);
    fetch(`/api/studio/${siteId}/share`)
      .then((r) => r.json())
      .then((d) => setLinks(Array.isArray(d) ? d : []))
      .catch(() => setLinks([]))
      .finally(() => setLoading(false));
  }, [siteId]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const createLink = async () => {
    setCreating(true);
    let expiresAt: string | null = null;
    if (expiry === "24h") expiresAt = new Date(Date.now() + 86400000).toISOString();
    if (expiry === "7d") expiresAt = new Date(Date.now() + 604800000).toISOString();
    if (expiry === "30d") expiresAt = new Date(Date.now() + 2592000000).toISOString();

    await fetch(`/api/studio/${siteId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: label || null, canComment, expiresAt }),
    });
    setShowForm(false);
    setLabel("");
    setCanComment(false);
    setExpiry("never");
    fetchLinks();
    setCreating(false);
  };

  const revokeLink = async (id: string) => {
    if (!confirm("Revoke this share link? It will no longer be accessible.")) return;
    await fetch(`/api/studio/${siteId}/share/${id}`, { method: "DELETE" });
    fetchLinks();
  };

  const copyUrl = (token: string) => {
    const url = `${window.location.origin}/shared/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  const activeLinks = links.filter((l) => !l.isRevoked);
  const revokedLinks = links.filter((l) => l.isRevoked);

  return (
    <div style={{ padding: 24, fontFamily: "'Inter',-apple-system,sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Share2 size={22} color={C.accent} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>Share Preview</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
            background: C.accent, border: "none", borderRadius: 8,
            color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          <Plus size={14} /> Generate Share Link
        </button>
      </div>

      {/* Info */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
        padding: 16, marginBottom: 24,
      }}>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
          Share a preview link with your client, business partner, or team.
          No login required to view. You can optionally allow recipients to leave comments.
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: 20, marginBottom: 20,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 16 }}>
            New Share Link
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: C.dim, display: "block", marginBottom: 4 }}>
              Label (internal note)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder='e.g. "Sent to John (client)"'
              style={{
                width: "100%", padding: "8px 12px", background: C.surfaceAlt,
                border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.text, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={canComment}
                onChange={(e) => setCanComment(e.target.checked)}
                style={{ accentColor: C.accent }}
              />
              Allow comments
            </label>

            <div>
              <label style={{ fontSize: 11, color: C.dim, marginRight: 8 }}>Expiry:</label>
              <select
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                style={{
                  padding: "6px 10px", background: C.surfaceAlt, border: `1px solid ${C.border}`,
                  borderRadius: 6, color: C.text, fontSize: 13,
                }}
              >
                <option value="never">Never</option>
                <option value="24h">24 hours</option>
                <option value="7d">7 days</option>
                <option value="30d">30 days</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={createLink}
              disabled={creating}
              style={{
                padding: "8px 16px", background: C.accent, border: "none",
                borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              {creating ? "Creating..." : "Generate Share Link"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: "8px 16px", background: C.surfaceAlt, border: `1px solid ${C.border}`,
                borderRadius: 8, color: C.muted, fontSize: 13, cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Links List */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, color: C.muted }}>
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
          Loading links...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : !links.length ? (
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: "60px 24px", textAlign: "center",
        }}>
          <LinkIcon size={40} color={C.dim} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 6 }}>
            No share links yet
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>
            Generate a share link to let others preview your site without logging in.
          </div>
        </div>
      ) : (
        <>
          {/* Active Links */}
          {activeLinks.length > 0 && (
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
              overflow: "hidden", marginBottom: 16,
            }}>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 100px 80px 100px 80px 80px",
                padding: "10px 20px", borderBottom: `1px solid ${C.border}`,
                fontSize: 11, fontWeight: 600, color: C.dim, textTransform: "uppercase",
              }}>
                <div>Label</div>
                <div>Created</div>
                <div>Expires</div>
                <div>Views</div>
                <div>Comments</div>
                <div style={{ textAlign: "right" }}>Actions</div>
              </div>

              {activeLinks.map((link) => (
                <div key={link.id} style={{
                  display: "grid", gridTemplateColumns: "1fr 100px 80px 100px 80px 80px",
                  padding: "12px 20px", borderBottom: `1px solid ${C.border}`,
                  alignItems: "center",
                }}>
                  <div style={{ fontSize: 13, color: C.text }}>
                    {link.label || "Untitled link"}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>
                    {new Date(link.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>
                    {link.expiresAt ? new Date(link.expiresAt).toLocaleDateString() : "Never"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: C.muted }}>
                    <Eye size={12} /> {link.viewCount}
                  </div>
                  <div style={{ fontSize: 12, color: link.canComment ? C.green : C.dim }}>
                    {link.canComment ? "Enabled" : "Off"}
                  </div>
                  <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => copyUrl(link.token)}
                      style={{
                        padding: "4px 8px", background: "transparent", border: `1px solid ${C.border}`,
                        borderRadius: 4, color: copied === link.token ? C.green : C.muted,
                        cursor: "pointer", display: "flex", alignItems: "center",
                      }}
                      title="Copy link"
                    >
                      {copied === link.token ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={() => revokeLink(link.id)}
                      style={{
                        padding: "4px 8px", background: "transparent", border: `1px solid ${C.border}`,
                        borderRadius: 4, color: C.red, cursor: "pointer", display: "flex", alignItems: "center",
                      }}
                      title="Revoke"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
