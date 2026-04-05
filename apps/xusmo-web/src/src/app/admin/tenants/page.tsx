"use client";

// =============================================================================
// Admin Tenants — Platform-level tenant management
// =============================================================================

import { useEffect, useState } from "react";
import {
  Building2,
  Search,
  Users,
  Globe,
  BarChart3,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface Tenant {
  id: string;
  slug: string;
  domain: string | null;
  planName: string;
  status: string;
  createdAt: string;
  siteLimit: number;
  storeLimit: number;
  productLimit: number;
  orderMonthlyLimit: number;
  memberCount: number;
  siteCount: number;
  storeCount: number;
  ownerEmail: string | null;
  ownerName: string | null;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: "#F0FDF4", text: "#16A34A" },
  TRIAL: { bg: "#EFF6FF", text: "#2563EB" },
  SUSPENDED: { bg: "#FFFBEB", text: "#D97706" },
  ARCHIVED: { bg: "#FEF2F2", text: "#DC2626" },
};

const PLAN_COLORS: Record<string, { bg: string; text: string }> = {
  starter: { bg: "#F1F5F9", text: "#64748B" },
  growth: { bg: "#F0FDF4", text: "#16A34A" },
  enterprise: { bg: "#EEF2FF", text: "#4F46E5" },
};

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchTenants = () => {
    setLoading(true);
    fetch("/api/admin/tenants")
      .then((r) => r.json())
      .then((d) => setTenants(Array.isArray(d) ? d : []))
      .catch(() => setTenants([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const filtered = tenants.filter((t) => {
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.slug.toLowerCase().includes(q) ||
        (t.domain?.toLowerCase().includes(q) ?? false) ||
        (t.ownerEmail?.toLowerCase().includes(q) ?? false) ||
        (t.ownerName?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  const stats = {
    total: tenants.length,
    active: tenants.filter((t) => t.status === "ACTIVE").length,
    trial: tenants.filter((t) => t.status === "TRIAL").length,
    suspended: tenants.filter((t) => t.status === "SUSPENDED").length,
  };

  const startEdit = (t: Tenant) => {
    setEditingId(t.id);
    setEditPlan(t.planName);
    setEditStatus(t.status);
  };

  const saveEdit = async (tenantId: string) => {
    setSaving(true);
    await fetch("/api/admin/tenants", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId,
        updates: { planName: editPlan, status: editStatus },
      }),
    });
    setEditingId(null);
    setSaving(false);
    fetchTenants();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" style={{ fontFamily: "'Inter',-apple-system,sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 size={22} style={{ color: "#4F46E5" }} />
          <h1 className="text-xl font-bold" style={{ color: "#1E293B" }}>
            Tenant Management
          </h1>
        </div>
        <button
          onClick={fetchTenants}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ color: "#64748B", border: "1px solid #E2E8F0" }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Tenants", value: stats.total, color: "#4F46E5" },
          { label: "Active", value: stats.active, color: "#16A34A" },
          { label: "Trial", value: stats.trial, color: "#2563EB" },
          { label: "Suspended", value: stats.suspended, color: "#D97706" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4"
            style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}
          >
            <div className="text-2xl font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-xs font-medium mt-1" style={{ color: "#94A3B8" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 mb-4">
        <div
          className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg"
          style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}
        >
          <Search size={16} style={{ color: "#94A3B8" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, domain, or owner..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "#1E293B" }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm font-medium"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #E2E8F0",
            color: "#1E293B",
          }}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="TRIAL">Trial</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Tenants Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20" style={{ color: "#94A3B8" }}>
          <Loader2 size={20} className="animate-spin mr-2" />
          Loading tenants...
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-16 rounded-xl"
          style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}
        >
          <Building2 size={36} style={{ color: "#CBD5E1", margin: "0 auto 12px" }} />
          <div className="text-sm font-medium" style={{ color: "#94A3B8" }}>
            No tenants found
          </div>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}
        >
          {/* Table Header */}
          <div
            className="grid gap-4 px-4 py-3 text-xs font-semibold uppercase tracking-wider"
            style={{
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px",
              backgroundColor: "#F8FAFC",
              color: "#94A3B8",
              borderBottom: "1px solid #E2E8F0",
            }}
          >
            <div>Tenant</div>
            <div>Plan</div>
            <div>Status</div>
            <div>Sites</div>
            <div>Members</div>
            <div></div>
          </div>

          {/* Rows */}
          {filtered.map((t) => {
            const sc = STATUS_COLORS[t.status] ?? { bg: "#F1F5F9", text: "#64748B" };
            const pc = PLAN_COLORS[t.planName] ?? PLAN_COLORS.starter;
            const expanded = expandedId === t.id;
            const editing = editingId === t.id;

            return (
              <div key={t.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
                <div
                  className="grid gap-4 px-4 py-3 items-center cursor-pointer transition-colors hover:bg-slate-50"
                  style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px" }}
                  onClick={() => setExpandedId(expanded ? null : t.id)}
                >
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "#1E293B" }}>
                      {t.slug}
                    </div>
                    <div className="text-xs" style={{ color: "#94A3B8" }}>
                      {t.ownerEmail ?? "No owner"} {t.domain ? `· ${t.domain}` : ""}
                    </div>
                  </div>
                  <div>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: pc.bg, color: pc.text }}
                    >
                      {t.planName}
                    </span>
                  </div>
                  <div>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: sc.bg, color: sc.text }}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm" style={{ color: "#64748B" }}>
                    <Globe size={13} />
                    {t.siteCount}/{t.siteLimit === 0 ? "\u221E" : t.siteLimit}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm" style={{ color: "#64748B" }}>
                    <Users size={13} />
                    {t.memberCount}
                  </div>
                  <div className="text-right">
                    {expanded ? (
                      <ChevronUp size={16} style={{ color: "#94A3B8" }} />
                    ) : (
                      <ChevronDown size={16} style={{ color: "#94A3B8" }} />
                    )}
                  </div>
                </div>

                {/* Expanded Detail */}
                {expanded && (
                  <div
                    className="px-4 pb-4 pt-2"
                    style={{ backgroundColor: "#F8FAFC", borderTop: "1px solid #E2E8F0" }}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {[
                        { label: "Sites", used: t.siteCount, limit: t.siteLimit },
                        { label: "Stores", used: t.storeCount, limit: t.storeLimit },
                        { label: "Products", used: "—", limit: t.productLimit },
                        { label: "Orders/mo", used: "—", limit: t.orderMonthlyLimit },
                      ].map((m) => (
                        <div
                          key={m.label}
                          className="rounded-lg p-3"
                          style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}
                        >
                          <div className="text-xs font-medium mb-1" style={{ color: "#94A3B8" }}>
                            {m.label}
                          </div>
                          <div className="text-sm font-semibold" style={{ color: "#1E293B" }}>
                            {m.used} / {m.limit === 0 ? "\u221E" : m.limit}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-xs" style={{ color: "#94A3B8" }}>
                      <BarChart3 size={12} />
                      Created {new Date(t.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                      {t.ownerName && ` · Owner: ${t.ownerName}`}
                    </div>

                    {/* Edit Controls */}
                    {editing ? (
                      <div className="flex items-center gap-3 mt-4">
                        <select
                          value={editPlan}
                          onChange={(e) => setEditPlan(e.target.value)}
                          className="px-3 py-1.5 rounded-lg text-sm"
                          style={{ border: "1px solid #E2E8F0", color: "#1E293B" }}
                        >
                          <option value="starter">starter</option>
                          <option value="growth">growth</option>
                          <option value="enterprise">enterprise</option>
                        </select>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="px-3 py-1.5 rounded-lg text-sm"
                          style={{ border: "1px solid #E2E8F0", color: "#1E293B" }}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="TRIAL">TRIAL</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                        </select>
                        <button
                          onClick={() => saveEdit(t.id)}
                          disabled={saving}
                          className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white"
                          style={{ backgroundColor: "#4F46E5", opacity: saving ? 0.5 : 1 }}
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 rounded-lg text-sm"
                          style={{ color: "#64748B", border: "1px solid #E2E8F0" }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(t)}
                        className="mt-4 px-4 py-1.5 rounded-lg text-sm font-medium"
                        style={{ color: "#4F46E5", border: "1px solid #E0E7FF", backgroundColor: "#EEF2FF" }}
                      >
                        Edit Plan / Status
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
