"use client";

// =============================================================================
// Lead Capture Dashboard — Form submissions inbox with CRM status
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Inbox,
  Mail,
  Phone,
  Download,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  CheckCircle2,
  Archive,
  Loader2,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

const STATUS_COLORS: Record<string, string> = {
  NEW: C.red,
  VIEWED: C.blue,
  CONTACTED: C.green,
  CONVERTED: C.accent,
  ARCHIVED: C.dim,
};

const STATUS_LABELS = ["ALL", "NEW", "VIEWED", "CONTACTED", "CONVERTED", "ARCHIVED"];

interface Submission {
  id: string;
  formName: string;
  pageSlug: string;
  fields: Record<string, string>;
  status: string;
  notes: string | null;
  receivedAt: string;
  contactedAt: string | null;
}

interface LeadsData {
  submissions: Submission[];
  total: number;
  stats: {
    total: number;
    newToday: number;
    conversionRate: number;
    topForm: string | null;
  };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function LeadsPage() {
  const params = useParams();
  const siteId = params.siteId as string;

  const [data, setData] = useState<LeadsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchLeads = useCallback(() => {
    setLoading(true);
    const qs = filter !== "ALL" ? `?status=${filter}` : "";
    fetch(`/api/studio/${siteId}/leads${qs}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [siteId, filter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch(`/api/studio/${siteId}/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        contactedAt: status === "CONTACTED" ? new Date().toISOString() : undefined,
      }),
    });
    fetchLeads();
    setUpdating(null);
  };

  const saveNote = async (id: string) => {
    setUpdating(id);
    await fetch(`/api/studio/${siteId}/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: noteText[id] || "" }),
    });
    fetchLeads();
    setUpdating(null);
  };

  const exportCsv = () => {
    window.open(`/api/studio/${siteId}/leads/export`, "_blank");
  };

  const extractField = (fields: Record<string, string>, keys: string[]): string => {
    for (const k of keys) {
      const found = Object.entries(fields).find(
        ([key]) => key.toLowerCase().includes(k)
      );
      if (found?.[1]) return found[1];
    }
    return "";
  };

  return (
    <div style={{ padding: 24, fontFamily: "'Inter',-apple-system,sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Inbox size={22} color={C.accent} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>
            Leads & Submissions
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={fetchLeads}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
              color: C.muted, fontSize: 13, cursor: "pointer",
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={exportCsv}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
              background: C.accent, border: "none", borderRadius: 8,
              color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Row */}
      {data?.stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Submissions", value: data.stats.total, color: C.text },
            { label: "New Today", value: data.stats.newToday, color: C.red },
            { label: "Conversion Rate", value: `${data.stats.conversionRate}%`, color: C.green },
            { label: "Top Form", value: data.stats.topForm || "—", color: C.blue },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
                padding: "16px 18px",
              }}
            >
              <div style={{ fontSize: 11, color: C.dim, marginBottom: 4 }}>{stat.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: stat.color }}>
                {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        <Filter size={14} color={C.dim} style={{ marginRight: 4, marginTop: 6 }} />
        {STATUS_LABELS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 500,
              cursor: "pointer", border: "none",
              background: filter === s ? C.accent : C.surfaceAlt,
              color: filter === s ? "#fff" : C.muted,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, color: C.muted }}>
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
          Loading submissions...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : !data?.submissions?.length ? (
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: "60px 24px", textAlign: "center",
        }}>
          <Inbox size={40} color={C.dim} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 6 }}>
            No submissions yet
          </div>
          <div style={{ fontSize: 13, color: C.muted, maxWidth: 400, margin: "0 auto" }}>
            When visitors fill out forms on your website, their submissions will appear here.
            You can track, respond to, and convert them into customers.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.submissions.map((sub) => {
            const name = extractField(sub.fields, ["name", "full_name", "first_name"]);
            const email = extractField(sub.fields, ["email", "e-mail"]);
            const phone = extractField(sub.fields, ["phone", "tel", "mobile"]);
            const message = extractField(sub.fields, ["message", "comment", "inquiry", "details"]);
            const isExpanded = expandedId === sub.id;
            const statusColor = STATUS_COLORS[sub.status] || C.dim;

            return (
              <div
                key={sub.id}
                style={{
                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
                  padding: "16px 20px", cursor: "pointer",
                  borderLeft: `3px solid ${statusColor}`,
                }}
                onClick={() => setExpandedId(isExpanded ? null : sub.id)}
              >
                {/* Top Row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                      background: `${statusColor}20`, color: statusColor,
                    }}>
                      {sub.status}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                      {name || "Unknown"}
                    </span>
                    <span style={{ fontSize: 12, color: C.dim }}>·</span>
                    <span style={{ fontSize: 12, color: C.muted }}>{sub.formName}</span>
                    <span style={{ fontSize: 12, color: C.dim }}>·</span>
                    <span style={{ fontSize: 12, color: C.dim }}>{sub.pageSlug} page</span>
                    <span style={{ fontSize: 12, color: C.dim }}>·</span>
                    <span style={{ fontSize: 12, color: C.dim }}>{timeAgo(sub.receivedAt)}</span>
                  </div>
                  {isExpanded ? <ChevronUp size={16} color={C.dim} /> : <ChevronDown size={16} color={C.dim} />}
                </div>

                {/* Contact Info */}
                <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                  {email && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: C.muted }}>
                      <Mail size={12} /> {email}
                    </span>
                  )}
                  {phone && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: C.muted }}>
                      <Phone size={12} /> {phone}
                    </span>
                  )}
                </div>

                {/* Message Preview */}
                {message && (
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 8, lineHeight: 1.5 }}>
                    &ldquo;{message.length > 120 ? message.slice(0, 120) + "..." : message}&rdquo;
                  </div>
                )}

                {/* Expanded Section */}
                {isExpanded && (
                  <div
                    style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* All Fields */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                      {Object.entries(sub.fields).map(([key, val]) => (
                        <div key={key}>
                          <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", marginBottom: 2 }}>
                            {key}
                          </div>
                          <div style={{ fontSize: 13, color: C.text }}>{String(val)}</div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                      {sub.status !== "CONTACTED" && (
                        <button
                          onClick={() => updateStatus(sub.id, "CONTACTED")}
                          disabled={updating === sub.id}
                          style={{
                            display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                            background: `${C.green}20`, border: `1px solid ${C.green}40`,
                            borderRadius: 6, color: C.green, fontSize: 12, cursor: "pointer",
                          }}
                        >
                          <MessageSquare size={12} /> Mark Contacted
                        </button>
                      )}
                      {sub.status !== "CONVERTED" && (
                        <button
                          onClick={() => updateStatus(sub.id, "CONVERTED")}
                          disabled={updating === sub.id}
                          style={{
                            display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                            background: `${C.accent}20`, border: `1px solid ${C.accent}40`,
                            borderRadius: 6, color: C.accent, fontSize: 12, cursor: "pointer",
                          }}
                        >
                          <CheckCircle2 size={12} /> Convert
                        </button>
                      )}
                      {sub.status !== "ARCHIVED" && (
                        <button
                          onClick={() => updateStatus(sub.id, "ARCHIVED")}
                          disabled={updating === sub.id}
                          style={{
                            display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                            background: C.surfaceAlt, border: `1px solid ${C.border}`,
                            borderRadius: 6, color: C.dim, fontSize: 12, cursor: "pointer",
                          }}
                        >
                          <Archive size={12} /> Archive
                        </button>
                      )}
                      {email && (
                        <a
                          href={`mailto:${email}?subject=Re: Your ${sub.formName} submission`}
                          style={{
                            display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                            background: `${C.blue}20`, border: `1px solid ${C.blue}40`,
                            borderRadius: 6, color: C.blue, fontSize: 12, textDecoration: "none",
                          }}
                        >
                          <Mail size={12} /> Reply via Email
                        </a>
                      )}
                    </div>

                    {/* Notes */}
                    <div>
                      <div style={{ fontSize: 11, color: C.dim, marginBottom: 4 }}>Internal Notes</div>
                      <textarea
                        value={noteText[sub.id] ?? sub.notes ?? ""}
                        onChange={(e) => setNoteText({ ...noteText, [sub.id]: e.target.value })}
                        placeholder="Add private notes about this lead..."
                        style={{
                          width: "100%", minHeight: 60, padding: 10, background: C.surfaceAlt,
                          border: `1px solid ${C.border}`, borderRadius: 6, color: C.text,
                          fontSize: 13, resize: "vertical", fontFamily: "inherit",
                        }}
                      />
                      <button
                        onClick={() => saveNote(sub.id)}
                        disabled={updating === sub.id}
                        style={{
                          marginTop: 6, padding: "6px 14px", background: C.accent,
                          border: "none", borderRadius: 6, color: "#fff",
                          fontSize: 12, fontWeight: 600, cursor: "pointer",
                        }}
                      >
                        Save Note
                      </button>
                    </div>
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
