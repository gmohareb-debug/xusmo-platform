"use client";

// =============================================================================
// Admin Users — User table with search, details, actions
// =============================================================================

import { useEffect, useState } from "react";

interface UserInfo {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
  sitesCount?: number;
  plan?: string | null;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Uses the stats endpoint which includes recentUsers
    // In production this would be a dedicated /api/admin/users endpoint
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setUsers(
          (data.recentUsers ?? []).map((u: UserInfo) => ({
            ...u,
            sitesCount: 0,
            plan: null,
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (u.name?.toLowerCase().includes(q) ?? false) ||
      (u.email?.toLowerCase().includes(q) ?? false)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "#E0E7FF", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-neutral-900">Users</h2>
        <span className="text-sm" style={{ color: "#94A3B8" }}>
          {users.length} total users
        </span>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full max-w-sm rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
          style={{
            backgroundColor: "#ffffff",
            border: "1.5px solid #E2E8F0",
            color: "#1E293B",
          }}
        />
      </div>

      {/* Users table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                {["User", "Email", "Role", "Joined", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#94A3B8" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm" style={{ color: "#94A3B8" }}>
                    {search ? "No users match your search." : "No users found."}
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #F8FAFC" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ backgroundColor: "#EEF2FF", color: "#4F46E5" }}
                        >
                          {(u.name?.[0] ?? u.email?.[0] ?? "?").toUpperCase()}
                        </div>
                        <span className="font-medium text-neutral-900">
                          {u.name ?? "---"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: "#64748B" }}>
                      {u.email ?? "---"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{
                          backgroundColor: u.role === "ADMIN" ? "#EEF2FF" : "#F1F5F9",
                          color: u.role === "ADMIN" ? "#4F46E5" : "#64748B",
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#94A3B8" }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          className="rounded-lg px-2.5 py-1 text-xs font-medium"
                          style={{ backgroundColor: "#EEF2FF", color: "#4F46E5" }}
                        >
                          View
                        </button>
                        <button
                          className="rounded-lg px-2.5 py-1 text-xs font-medium"
                          style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}
                        >
                          Email
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
