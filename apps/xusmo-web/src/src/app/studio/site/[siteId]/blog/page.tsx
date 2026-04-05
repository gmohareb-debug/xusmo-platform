"use client";

// =============================================================================
// Blog / News Manager — List all blog posts, create new ones
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Loader2,
  Search,
  Sparkles,
  Eye,
  FileText,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  DRAFT: { bg: `${C.dim}20`, color: C.dim },
  SCHEDULED: { bg: `${C.amber}20`, color: C.amber },
  PUBLISHED: { bg: `${C.green}20`, color: C.green },
  ARCHIVED: { bg: `${C.red}20`, color: C.red },
};

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  publishedAt: string | null;
  focusKeyword: string | null;
  aiGenerated: boolean;
  createdAt: string;
}

export default function BlogPage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.siteId as string;

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchPosts = useCallback(() => {
    setLoading(true);
    const qs = filter !== "ALL" ? `?status=${filter}` : "";
    fetch(`/api/studio/${siteId}/blog${qs}`)
      .then((r) => r.json())
      .then((d) => setPosts(Array.isArray(d) ? d : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [siteId, filter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/studio/${siteId}/blog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: [{ type: "paragraph", content: "" }],
        }),
      });
      const post = await res.json();
      if (post.id) {
        router.push(`/studio/site/${siteId}/blog/${post.id}`);
      }
    } catch {
      // handle error
    }
    setCreating(false);
  };

  const deletePost = async (id: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    await fetch(`/api/studio/${siteId}/blog/${id}`, { method: "DELETE" });
    fetchPosts();
  };

  return (
    <div style={{ padding: 24, fontFamily: "'Inter',-apple-system,sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <BookOpen size={22} color={C.accent} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>Blog & News</h1>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
            background: C.accent, border: "none", borderRadius: 8,
            color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          <Plus size={14} /> Write New Post
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: 20, marginBottom: 20,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12 }}>
            New Blog Post
          </div>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Post title..."
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && createPost()}
            style={{
              width: "100%", padding: "10px 14px", background: C.surfaceAlt,
              border: `1px solid ${C.border}`, borderRadius: 8, color: C.text,
              fontSize: 14, marginBottom: 12, boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={createPost}
              disabled={creating || !newTitle.trim()}
              style={{
                padding: "8px 16px", background: C.accent, border: "none",
                borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600,
                cursor: "pointer", opacity: creating || !newTitle.trim() ? 0.5 : 1,
              }}
            >
              {creating ? "Creating..." : "Create & Edit"}
            </button>
            <button
              onClick={() => { setShowCreate(false); setNewTitle(""); }}
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

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {["ALL", "DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"].map((s) => (
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

      {/* Posts List */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, color: C.muted }}>
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
          Loading posts...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : !posts.length ? (
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: "60px 24px", textAlign: "center",
        }}>
          <FileText size={40} color={C.dim} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 6 }}>
            Share your expertise
          </div>
          <div style={{ fontSize: 13, color: C.muted, maxWidth: 400, margin: "0 auto", marginBottom: 20 }}>
            Blog posts build trust and bring traffic. Write about your industry, share tips,
            and showcase your knowledge.
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              padding: "10px 20px", background: C.accent, border: "none",
              borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}
          >
            Write Your First Post
          </button>
        </div>
      ) : (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          {/* Table Header */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 100px 130px 120px 100px",
            padding: "10px 20px", borderBottom: `1px solid ${C.border}`,
            fontSize: 11, fontWeight: 600, color: C.dim, textTransform: "uppercase",
          }}>
            <div>Title</div>
            <div>Status</div>
            <div>Published</div>
            <div>Keyword</div>
            <div style={{ textAlign: "right" }}>Actions</div>
          </div>

          {posts.map((post) => {
            const st = STATUS_STYLES[post.status] || STATUS_STYLES.DRAFT;
            return (
              <div
                key={post.id}
                style={{
                  display: "grid", gridTemplateColumns: "1fr 100px 130px 120px 100px",
                  padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.text, display: "flex", alignItems: "center", gap: 6 }}>
                    {post.title}
                    {post.aiGenerated && <Sparkles size={12} color={C.amber} />}
                  </div>
                  <div style={{ fontSize: 11, color: C.dim }}>/{post.slug}</div>
                </div>
                <div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                    background: st.bg, color: st.color,
                  }}>
                    {post.status}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "—"}
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {post.focusKeyword ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Search size={10} /> {post.focusKeyword}
                    </span>
                  ) : "—"}
                </div>
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => router.push(`/studio/site/${siteId}/blog/${post.id}`)}
                    style={{
                      padding: "4px 8px", background: "transparent", border: `1px solid ${C.border}`,
                      borderRadius: 4, color: C.muted, cursor: "pointer", display: "flex", alignItems: "center",
                    }}
                    title="Edit"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    style={{
                      padding: "4px 8px", background: "transparent", border: `1px solid ${C.border}`,
                      borderRadius: 4, color: C.red, cursor: "pointer", display: "flex", alignItems: "center",
                    }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
