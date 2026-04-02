"use client";

// =============================================================================
// Testimonial & Review Manager — Manage testimonials displayed on site
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Star,
  Plus,
  Edit3,
  EyeOff,
  Eye,
  Trash2,
  Loader2,
  RefreshCw,
  X,
  Upload,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

interface Testimonial {
  id: string;
  authorName: string;
  authorTitle: string | null;
  authorPhoto: string | null;
  rating: number | null;
  content: string;
  source: string;
  isPublished: boolean;
  featuredPage: string | null;
  sortOrder: number;
  createdAt: string;
}

function Stars({ rating, size = 14 }: { rating: number | null; size?: number }) {
  if (!rating) return null;
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={i <= rating ? C.amber : "transparent"}
          color={i <= rating ? C.amber : C.dim}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const params = useParams();
  const siteId = params.siteId as string;

  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    authorName: "",
    authorTitle: "",
    rating: 5,
    content: "",
    featuredPage: "",
  });

  const fetchReviews = useCallback(() => {
    setLoading(true);
    fetch(`/api/studio/${siteId}/reviews`)
      .then((r) => r.json())
      .then((d) => setReviews(Array.isArray(d) ? d : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [siteId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const published = reviews.filter((r) => r.isPublished);
  const hidden = reviews.filter((r) => !r.isPublished);

  const resetForm = () => {
    setForm({ authorName: "", authorTitle: "", rating: 5, content: "", featuredPage: "" });
    setShowAdd(false);
    setEditId(null);
  };

  const submitReview = async () => {
    if (!form.authorName.trim() || !form.content.trim()) return;
    const url = editId
      ? `/api/studio/${siteId}/reviews/${editId}`
      : `/api/studio/${siteId}/reviews`;
    const method = editId ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    resetForm();
    fetchReviews();
  };

  const togglePublish = async (id: string, isPublished: boolean) => {
    await fetch(`/api/studio/${siteId}/reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !isPublished }),
    });
    fetchReviews();
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    await fetch(`/api/studio/${siteId}/reviews/${id}`, { method: "DELETE" });
    fetchReviews();
  };

  const startEdit = (r: Testimonial) => {
    setForm({
      authorName: r.authorName,
      authorTitle: r.authorTitle || "",
      rating: r.rating || 5,
      content: r.content,
      featuredPage: r.featuredPage || "",
    });
    setEditId(r.id);
    setShowAdd(true);
  };

  const connectGoogle = async () => {
    await fetch(`/api/studio/${siteId}/reviews/google-connect`, { method: "POST" });
    alert("Google Reviews import will be available once Google Places API is configured.");
  };

  const ReviewCard = ({ r }: { r: Testimonial }) => (
    <div style={{
      background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10,
      padding: 16, marginBottom: 8,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ flex: 1 }}>
          <Stars rating={r.rating} />
          <div style={{ fontSize: 14, color: C.text, marginTop: 8, lineHeight: 1.6, fontStyle: "italic" }}>
            &ldquo;{r.content}&rdquo;
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
            {r.authorPhoto ? (
              <img src={r.authorPhoto} alt="" style={{ width: 28, height: 28, borderRadius: "50%" }} />
            ) : (
              <div style={{
                width: 28, height: 28, borderRadius: "50%", background: `${C.accent}20`,
                color: C.accent, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
              }}>
                {r.authorName[0].toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{r.authorName}</div>
              <div style={{ fontSize: 11, color: C.dim }}>
                {r.authorTitle && `${r.authorTitle} · `}
                {r.source}
                {r.featuredPage && ` · Featured on: ${r.featuredPage}`}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, marginLeft: 12 }}>
          <button
            onClick={() => startEdit(r)}
            style={{
              padding: "4px 8px", background: "transparent", border: `1px solid ${C.border}`,
              borderRadius: 4, color: C.muted, cursor: "pointer",
            }}
            title="Edit"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => togglePublish(r.id, r.isPublished)}
            style={{
              padding: "4px 8px", background: "transparent", border: `1px solid ${C.border}`,
              borderRadius: 4, color: r.isPublished ? C.dim : C.green, cursor: "pointer",
            }}
            title={r.isPublished ? "Hide" : "Publish"}
          >
            {r.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button
            onClick={() => deleteReview(r.id)}
            style={{
              padding: "4px 8px", background: "transparent", border: `1px solid ${C.border}`,
              borderRadius: 4, color: C.red, cursor: "pointer",
            }}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: 24, fontFamily: "'Inter',-apple-system,sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Star size={22} color={C.amber} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>
            Reviews & Testimonials
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => { resetForm(); setShowAdd(true); }}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
              background: C.accent, border: "none", borderRadius: 8,
              color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            <Plus size={14} /> Add Manually
          </button>
          <button
            onClick={connectGoogle}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
              color: C.muted, fontSize: 13, cursor: "pointer",
            }}
          >
            <RefreshCw size={14} /> Connect Google
          </button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAdd && (
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: 20, marginBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
              {editId ? "Edit Testimonial" : "Add Testimonial"}
            </div>
            <button onClick={resetForm} style={{ background: "transparent", border: "none", color: C.dim, cursor: "pointer" }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: C.dim, display: "block", marginBottom: 4 }}>Author Name *</label>
              <input
                type="text"
                value={form.authorName}
                onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                style={{
                  width: "100%", padding: "8px 12px", background: C.surfaceAlt,
                  border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.dim, display: "block", marginBottom: 4 }}>Author Title</label>
              <input
                type="text"
                value={form.authorTitle}
                onChange={(e) => setForm({ ...form, authorTitle: e.target.value })}
                placeholder="e.g. Owner of ABC Bakery"
                style={{
                  width: "100%", padding: "8px 12px", background: C.surfaceAlt,
                  border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: C.dim, display: "block", marginBottom: 4 }}>Rating</label>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  onClick={() => setForm({ ...form, rating: i })}
                  style={{ background: "transparent", border: "none", cursor: "pointer", padding: 2 }}
                >
                  <Star
                    size={20}
                    fill={i <= form.rating ? C.amber : "transparent"}
                    color={i <= form.rating ? C.amber : C.dim}
                  />
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: C.dim, display: "block", marginBottom: 4 }}>Review Text *</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={4}
              style={{
                width: "100%", padding: "8px 12px", background: C.surfaceAlt,
                border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13,
                resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: C.dim, display: "block", marginBottom: 4 }}>Featured Page</label>
            <select
              value={form.featuredPage}
              onChange={(e) => setForm({ ...form, featuredPage: e.target.value })}
              style={{
                padding: "8px 12px", background: C.surfaceAlt,
                border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13,
              }}
            >
              <option value="">None</option>
              <option value="home">Home page</option>
              <option value="services">Services page</option>
              <option value="home,services">Both</option>
            </select>
          </div>

          <button
            onClick={submitReview}
            disabled={!form.authorName.trim() || !form.content.trim()}
            style={{
              padding: "8px 20px", background: C.accent, border: "none",
              borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
              opacity: !form.authorName.trim() || !form.content.trim() ? 0.5 : 1,
            }}
          >
            {editId ? "Update" : "Add to Site"}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, color: C.muted }}>
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
          Loading reviews...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : !reviews.length ? (
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: "60px 24px", textAlign: "center",
        }}>
          <Star size={40} color={C.dim} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 6 }}>
            No testimonials yet
          </div>
          <div style={{ fontSize: 13, color: C.muted, maxWidth: 400, margin: "0 auto", marginBottom: 20 }}>
            93% of consumers read reviews before contacting a local business.
            Add your best reviews to build trust with visitors.
          </div>
          <button
            onClick={() => { resetForm(); setShowAdd(true); }}
            style={{
              padding: "10px 20px", background: C.accent, border: "none",
              borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}
          >
            Add Your First Testimonial
          </button>
        </div>
      ) : (
        <>
          {/* Published Section */}
          {published.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.green, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <Eye size={14} /> Published ({published.length})
              </div>
              {published.map((r) => <ReviewCard key={r.id} r={r} />)}
            </div>
          )}

          {/* Hidden Section */}
          {hidden.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.dim, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <EyeOff size={14} /> Hidden ({hidden.length})
              </div>
              {hidden.map((r) => <ReviewCard key={r.id} r={r} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
