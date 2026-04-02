"use client";

// =============================================================================
// Team Access — Invite and manage team members
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Users,
  Plus,
  Trash2,
  Send,
  RefreshCw,
  Loader2,
  Shield,
  Edit3,
  Eye,
  X,
  Mail,
  Check,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

interface TeamMember {
  id: string;
  inviteEmail: string;
  inviteeName: string | null;
  inviteeUserId: string | null;
  role: string;
  status: string;
  invitedAt: string;
  acceptedAt: string | null;
}

const ROLE_DESCRIPTIONS = {
  VIEWER: "Can see all Studio screens. Cannot save changes.",
  EDITOR: "Can edit content, blog, assets, reviews.",
  MANAGER: "Full Studio access. Cannot delete site or change billing.",
};

const ROLE_COLORS: Record<string, string> = {
  VIEWER: C.blue,
  EDITOR: C.amber,
  MANAGER: C.green,
};

export default function TeamPage() {
  const params = useParams();
  const siteId = params.siteId as string;

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("VIEWER");
  const [sending, setSending] = useState(false);

  const fetchMembers = useCallback(() => {
    setLoading(true);
    fetch(`/api/studio/${siteId}/team`)
      .then((r) => r.json())
      .then((d) => setMembers(Array.isArray(d) ? d : []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, [siteId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;
    setSending(true);
    await fetch(`/api/studio/${siteId}/team/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole, name: inviteName || null }),
    });
    setShowInvite(false);
    setInviteEmail("");
    setInviteName("");
    setInviteRole("VIEWER");
    fetchMembers();
    setSending(false);
  };

  const removeMember = async (memberId: string) => {
    if (!confirm("Remove this team member?")) return;
    await fetch(`/api/studio/${siteId}/team/${memberId}`, { method: "DELETE" });
    fetchMembers();
  };

  const accepted = members.filter((m) => m.status === "ACCEPTED");
  const pending = members.filter((m) => m.status === "PENDING");

  return (
    <div style={{ padding: 24, fontFamily: "'Inter',-apple-system,sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Users size={22} color={C.accent} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>Team Access</h1>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
            background: C.accent, border: "none", borderRadius: 8,
            color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          <Plus size={14} /> Invite Someone
        </button>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: 20, marginBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Invite Team Member</div>
            <button onClick={() => setShowInvite(false)} style={{ background: "transparent", border: "none", color: C.dim, cursor: "pointer" }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: C.dim, display: "block", marginBottom: 4 }}>Email *</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="team@example.com"
                style={{
                  width: "100%", padding: "8px 12px", background: C.surfaceAlt,
                  border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.dim, display: "block", marginBottom: 4 }}>Name (optional)</label>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="John"
                style={{
                  width: "100%", padding: "8px 12px", background: C.surfaceAlt,
                  border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: C.dim, display: "block", marginBottom: 8 }}>Role</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["VIEWER", "EDITOR", "MANAGER"] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setInviteRole(role)}
                  style={{
                    flex: 1, padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                    background: inviteRole === role ? `${ROLE_COLORS[role]}15` : C.surfaceAlt,
                    border: `1px solid ${inviteRole === role ? ROLE_COLORS[role] : C.border}`,
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    {role === "VIEWER" && <Eye size={14} color={ROLE_COLORS[role]} />}
                    {role === "EDITOR" && <Edit3 size={14} color={ROLE_COLORS[role]} />}
                    {role === "MANAGER" && <Shield size={14} color={ROLE_COLORS[role]} />}
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{role}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.dim }}>
                    {ROLE_DESCRIPTIONS[role]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={sendInvite}
            disabled={sending || !inviteEmail.trim()}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 20px",
              background: C.accent, border: "none", borderRadius: 8,
              color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
              opacity: sending || !inviteEmail.trim() ? 0.5 : 1,
            }}
          >
            <Send size={14} /> {sending ? "Sending..." : "Send Invite"}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, color: C.muted }}>
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
          Loading team...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <>
          {/* Owner */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: 16, marginBottom: 20,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.dim, marginBottom: 12 }}>
              SITE OWNER
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", background: `${C.accent}20`,
                color: C.accent, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700,
              }}>
                U
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>You (Owner)</div>
                <div style={{ fontSize: 12, color: C.dim }}>Full Access</div>
              </div>
            </div>
          </div>

          {/* Accepted Members */}
          {accepted.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 10 }}>
                Current Members ({accepted.length})
              </div>
              {accepted.map((m) => (
                <div key={m.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
                  padding: 14, marginBottom: 6,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", background: `${ROLE_COLORS[m.role] || C.blue}20`,
                      color: ROLE_COLORS[m.role] || C.blue, display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 14, fontWeight: 700,
                    }}>
                      {(m.inviteeName || m.inviteEmail)[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>
                        {m.inviteeName || m.inviteEmail}
                      </div>
                      <div style={{ fontSize: 12, color: C.dim }}>
                        {m.inviteEmail} · {m.role} · Accepted {m.acceptedAt ? new Date(m.acceptedAt).toLocaleDateString() : ""}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMember(m.id)}
                    style={{
                      padding: "4px 8px", background: "transparent", border: `1px solid ${C.border}`,
                      borderRadius: 4, color: C.red, cursor: "pointer",
                    }}
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Pending Invites */}
          {pending.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.amber, marginBottom: 10 }}>
                Pending Invites ({pending.length})
              </div>
              {pending.map((m) => (
                <div key={m.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
                  padding: 14, marginBottom: 6,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Mail size={18} color={C.amber} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{m.inviteEmail}</div>
                      <div style={{ fontSize: 12, color: C.dim }}>
                        {m.role} · Sent {new Date(m.invitedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={{
                      padding: "4px 10px", background: C.surfaceAlt, border: `1px solid ${C.border}`,
                      borderRadius: 4, color: C.muted, fontSize: 12, cursor: "pointer",
                    }}>
                      Resend
                    </button>
                    <button
                      onClick={() => removeMember(m.id)}
                      style={{
                        padding: "4px 10px", background: C.surfaceAlt, border: `1px solid ${C.border}`,
                        borderRadius: 4, color: C.red, fontSize: 12, cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {accepted.length === 0 && pending.length === 0 && (
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
              padding: "40px 24px", textAlign: "center",
            }}>
              <Users size={36} color={C.dim} style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                No team members yet
              </div>
              <div style={{ fontSize: 13, color: C.muted, maxWidth: 380, margin: "0 auto" }}>
                Invite a VA, business partner, or web coordinator to help manage your site.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
