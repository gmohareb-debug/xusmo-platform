"use client";

// =============================================================================
// Tenant Team — Manage tenant-level team members and their RBAC roles
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Plus,
  Trash2,
  Loader2,
  Crown,
  Shield,
  Package,
  ShoppingCart,
  X,
  Send,
  ChevronDown,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

interface Member {
  id: string;
  userId: string;
  role: string;
  createdAt: string;
  email: string;
  name: string | null;
  image: string | null;
}

const ROLES = [
  {
    value: "TENANT_ADMIN",
    label: "Admin",
    icon: Shield,
    color: C.green,
    description: "Full access to all tenant settings, team, and resources",
  },
  {
    value: "TENANT_CATALOG",
    label: "Catalog Manager",
    icon: Package,
    color: C.amber,
    description: "Manage suppliers, imports, and publish products to catalog",
  },
  {
    value: "TENANT_OPS",
    label: "Operations Manager",
    icon: ShoppingCart,
    color: C.blue,
    description: "Manage orders, returns, inventory, and purchase orders",
  },
] as const;

const ROLE_MAP: Record<string, { label: string; color: string; icon: typeof Shield }> = {
  TENANT_OWNER: { label: "Owner", color: C.accent, icon: Crown },
  TENANT_ADMIN: { label: "Admin", color: C.green, icon: Shield },
  TENANT_CATALOG: { label: "Catalog", color: C.amber, icon: Package },
  TENANT_OPS: { label: "Operations", color: C.blue, icon: ShoppingCart },
  PLATFORM_OWNER: { label: "Platform Owner", color: C.purple, icon: Crown },
  PLATFORM_OPS: { label: "Platform Ops", color: C.cyan, icon: Shield },
  PLATFORM_SUPPORT: { label: "Support", color: C.dim, icon: Shield },
  DEV_APP_OWNER: { label: "Developer", color: C.indigo, icon: Shield },
};

export default function TenantTeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("TENANT_ADMIN");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchMembers = useCallback(() => {
    setLoading(true);
    fetch("/api/tenant/team")
      .then((r) => r.json())
      .then((d) => setMembers(Array.isArray(d) ? d : []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/tenant/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to add member");
        setSending(false);
        return;
      }
      setShowInvite(false);
      setInviteEmail("");
      setInviteRole("TENANT_ADMIN");
      fetchMembers();
    } catch {
      setError("Network error");
    } finally {
      setSending(false);
    }
  };

  const changeRole = async (memberId: string, role: string) => {
    await fetch("/api/tenant/team", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, role }),
    });
    setEditingId(null);
    fetchMembers();
  };

  const removeMember = async (memberId: string) => {
    if (!confirm("Remove this team member from the tenant?")) return;
    await fetch(`/api/tenant/team?memberId=${memberId}`, { method: "DELETE" });
    fetchMembers();
  };

  const owners = members.filter((m) => m.role === "TENANT_OWNER" || m.role === "PLATFORM_OWNER");
  const others = members.filter((m) => m.role !== "TENANT_OWNER" && m.role !== "PLATFORM_OWNER");

  return (
    <div style={{ padding: 24, fontFamily: "'Inter',-apple-system,sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Users size={22} color={C.accent} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>Tenant Team</h1>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
            background: C.accent, border: "none", borderRadius: 8,
            color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          <Plus size={14} /> Add Member
        </button>
      </div>

      {/* Invite Form */}
      {showInvite && (
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: 20, marginBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Add Team Member</div>
            <button onClick={() => { setShowInvite(false); setError(""); }} style={{ background: "transparent", border: "none", color: C.dim, cursor: "pointer" }}>
              <X size={18} />
            </button>
          </div>

          {error && (
            <div style={{ padding: "8px 12px", borderRadius: 6, background: "#FEF2F2", color: "#DC2626", fontSize: 13, marginBottom: 12 }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: C.dim, display: "block", marginBottom: 4 }}>Email Address *</label>
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
            <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>
              User must already have a Xusmo account
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: C.dim, display: "block", marginBottom: 8 }}>Role</label>
            <div style={{ display: "flex", gap: 8 }}>
              {ROLES.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.value}
                    onClick={() => setInviteRole(role.value)}
                    style={{
                      flex: 1, padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                      background: inviteRole === role.value ? `${role.color}15` : C.surfaceAlt,
                      border: `1px solid ${inviteRole === role.value ? role.color : C.border}`,
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <Icon size={14} color={role.color} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{role.label}</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.dim }}>{role.description}</div>
                  </button>
                );
              })}
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
            <Send size={14} /> {sending ? "Adding..." : "Add Member"}
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
          {/* Owners */}
          {owners.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.dim, marginBottom: 10 }}>
                OWNER{owners.length > 1 ? "S" : ""}
              </div>
              {owners.map((m) => {
                const rm = ROLE_MAP[m.role] ?? { label: m.role, color: C.dim, icon: Shield };
                const Icon = rm.icon;
                return (
                  <div key={m.id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
                    padding: 14, marginBottom: 6,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", background: `${rm.color}20`,
                      color: rm.color, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 700,
                    }}>
                      {(m.name || m.email)[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>
                        {m.name || m.email}
                      </div>
                      <div style={{ fontSize: 12, color: C.dim }}>
                        {m.email}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 6, background: `${rm.color}10` }}>
                      <Icon size={12} color={rm.color} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: rm.color }}>{rm.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Other Members */}
          {others.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 10 }}>
                TEAM MEMBERS ({others.length})
              </div>
              {others.map((m) => {
                const rm = ROLE_MAP[m.role] ?? { label: m.role, color: C.dim, icon: Shield };
                const Icon = rm.icon;
                const editing = editingId === m.id;

                return (
                  <div key={m.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
                    padding: 14, marginBottom: 6,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%", background: `${rm.color}20`,
                        color: rm.color, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 700,
                      }}>
                        {(m.name || m.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{m.name || m.email}</div>
                        <div style={{ fontSize: 12, color: C.dim }}>{m.email}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {editing ? (
                        <div style={{ display: "flex", gap: 4 }}>
                          {ROLES.map((r) => (
                            <button
                              key={r.value}
                              onClick={() => changeRole(m.id, r.value)}
                              style={{
                                padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                                background: m.role === r.value ? `${r.color}20` : C.surfaceAlt,
                                border: `1px solid ${m.role === r.value ? r.color : C.border}`,
                                color: m.role === r.value ? r.color : C.muted,
                              }}
                            >
                              {r.label}
                            </button>
                          ))}
                          <button onClick={() => setEditingId(null)} style={{ background: "transparent", border: "none", color: C.dim, cursor: "pointer", padding: "4px" }}>
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingId(m.id)}
                            style={{
                              display: "flex", alignItems: "center", gap: 4, padding: "4px 10px",
                              borderRadius: 6, background: `${rm.color}10`, border: "none", cursor: "pointer",
                            }}
                          >
                            <Icon size={12} color={rm.color} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: rm.color }}>{rm.label}</span>
                            <ChevronDown size={10} color={rm.color} />
                          </button>
                          <button
                            onClick={() => removeMember(m.id)}
                            style={{
                              padding: "4px 8px", background: "transparent", border: `1px solid ${C.border}`,
                              borderRadius: 4, color: C.red, cursor: "pointer",
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {others.length === 0 && owners.length <= 1 && (
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
              padding: "40px 24px", textAlign: "center",
            }}>
              <Users size={36} color={C.dim} style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                No additional team members
              </div>
              <div style={{ fontSize: 13, color: C.muted, maxWidth: 380, margin: "0 auto" }}>
                Add team members to delegate catalog management, order processing, or admin tasks.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
