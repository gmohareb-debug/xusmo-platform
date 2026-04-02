"use client";

// =============================================================================
// Blog Post Editor — Edit a single blog post with AI drafting
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Send,
  Image as ImageIcon,
  Plus,
  Trash2,
  Loader2,
  GripVertical,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

interface ContentBlock {
  type: "heading" | "paragraph" | "list" | "callout" | "quote" | "divider" | "image";
  content: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: ContentBlock[];
  featuredImageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  focusKeyword: string | null;
  status: string;
  publishedAt: string | null;
  aiGenerated: boolean;
}

export default function BlogEditorPage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.siteId as string;
  const postId = params.postId as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState("Informative");
  const [aiLength, setAiLength] = useState("Medium");
  const [aiGenerating, setAiGenerating] = useState(false);

  const fetchPost = useCallback(() => {
    setLoading(true);
    fetch(`/api/studio/${siteId}/blog/${postId}`)
      .then((r) => r.json())
      .then((d) => {
        setPost(d);
        setAiTopic(d.title || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [siteId, postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const save = async (publish = false) => {
    if (!post) return;
    setSaving(true);
    const body: Record<string, unknown> = {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featuredImageUrl: post.featuredImageUrl,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      focusKeyword: post.focusKeyword,
    };
    if (publish) {
      body.status = "PUBLISHED";
      body.publishedAt = new Date().toISOString();
    }
    await fetch(`/api/studio/${siteId}/blog/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!publish) fetchPost();
  };

  const generateAiDraft = async () => {
    setAiGenerating(true);
    try {
      const res = await fetch(`/api/studio/${siteId}/blog/ai-draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: aiTopic, tone: aiTone, length: aiLength }),
      });
      const data = await res.json();
      if (data.blocks) {
        setPost((prev) =>
          prev ? { ...prev, content: data.blocks, aiGenerated: true } : prev
        );
        setShowAi(false);
      }
    } catch {
      // handle error
    }
    setAiGenerating(false);
  };

  const updateBlock = (index: number, content: string) => {
    if (!post) return;
    const blocks = [...post.content];
    blocks[index] = { ...blocks[index], content };
    setPost({ ...post, content: blocks });
  };

  const addBlock = (type: ContentBlock["type"] = "paragraph", afterIndex?: number) => {
    if (!post) return;
    const blocks = [...post.content];
    const newBlock = { type, content: "" };
    if (afterIndex !== undefined) {
      blocks.splice(afterIndex + 1, 0, newBlock);
    } else {
      blocks.push(newBlock);
    }
    setPost({ ...post, content: blocks });
  };

  const removeBlock = (index: number) => {
    if (!post || post.content.length <= 1) return;
    const blocks = post.content.filter((_, i) => i !== index);
    setPost({ ...post, content: blocks });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, color: C.muted }}>
        <Loader2 size={20} style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
        Loading post...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!post) {
    return <div style={{ padding: 40, color: C.dim, textAlign: "center" }}>Post not found.</div>;
  }

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif" }}>
      {/* Top Bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 24px", background: C.surface, borderBottom: `1px solid ${C.border}`,
        position: "sticky", top: 56, zIndex: 30,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => router.push(`/studio/site/${siteId}/blog`)}
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
              background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 6,
              color: C.muted, fontSize: 13, cursor: "pointer",
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
            background: post.status === "PUBLISHED" ? `${C.green}20` : `${C.dim}20`,
            color: post.status === "PUBLISHED" ? C.green : C.dim,
          }}>
            {post.status}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowAi(!showAi)}
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "8px 14px",
              background: `${C.amber}20`, border: `1px solid ${C.amber}40`, borderRadius: 8,
              color: C.amber, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            <Sparkles size={14} /> Draft with AI
          </button>
          <button
            onClick={() => save(false)}
            disabled={saving}
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "8px 14px",
              background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 8,
              color: C.muted, fontSize: 13, cursor: "pointer",
            }}
          >
            <Save size={14} /> {saving ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={() => save(true)}
            disabled={saving}
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "8px 14px",
              background: C.accent, border: "none", borderRadius: 8,
              color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            <Send size={14} /> {post.status === "PUBLISHED" ? "Update" : "Publish Now"}
          </button>
        </div>
      </div>

      {/* AI Draft Panel */}
      {showAi && (
        <div style={{
          background: `${C.amber}08`, borderBottom: `1px solid ${C.amber}30`,
          padding: "16px 24px",
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.amber, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={16} /> AI Draft Assistant
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 200px 200px auto", gap: 12, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 11, color: C.dim, display: "block", marginBottom: 4 }}>Topic / Title</label>
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px", background: C.surface,
                  border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.dim, display: "block", marginBottom: 4 }}>Tone</label>
              <select
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px", background: C.surface,
                  border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13,
                }}
              >
                <option>Informative</option>
                <option>Conversational</option>
                <option>Expert</option>
                <option>Local SEO</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.dim, display: "block", marginBottom: 4 }}>Length</label>
              <select
                value={aiLength}
                onChange={(e) => setAiLength(e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px", background: C.surface,
                  border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13,
                }}
              >
                <option>Short</option>
                <option>Medium</option>
                <option>Long</option>
              </select>
            </div>
            <button
              onClick={generateAiDraft}
              disabled={aiGenerating || !aiTopic.trim()}
              style={{
                padding: "8px 16px", background: C.amber, border: "none",
                borderRadius: 8, color: "#000", fontSize: 13, fontWeight: 600,
                cursor: "pointer", whiteSpace: "nowrap",
                opacity: aiGenerating || !aiTopic.trim() ? 0.5 : 1,
              }}
            >
              {aiGenerating ? "Generating..." : "Generate Draft"}
            </button>
          </div>
        </div>
      )}

      {/* Editor Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 0, minHeight: "calc(100vh - 170px)" }}>
        {/* Left: Content Editor */}
        <div style={{ padding: 24, borderRight: `1px solid ${C.border}` }}>
          {/* Title */}
          <input
            type="text"
            value={post.title}
            onChange={(e) => {
              setPost({ ...post, title: e.target.value, slug: slugify(e.target.value) });
            }}
            placeholder="Post title..."
            style={{
              width: "100%", fontSize: 28, fontWeight: 700, color: C.text,
              background: "transparent", border: "none", outline: "none",
              marginBottom: 4, boxSizing: "border-box",
            }}
          />
          <div style={{ fontSize: 12, color: C.dim, marginBottom: 24 }}>
            Slug: /{post.slug}
          </div>

          {/* Featured Image */}
          <div style={{
            background: C.surfaceAlt, border: `1px dashed ${C.border}`, borderRadius: 10,
            padding: 24, textAlign: "center", marginBottom: 24, cursor: "pointer",
          }}>
            {post.featuredImageUrl ? (
              <img src={post.featuredImageUrl} alt="" style={{ maxWidth: "100%", borderRadius: 8 }} />
            ) : (
              <>
                <ImageIcon size={28} color={C.dim} />
                <div style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>
                  Click to set featured image
                </div>
              </>
            )}
          </div>

          {/* Content Blocks */}
          {post.content.map((block, i) => (
            <div key={i} style={{ position: "relative", marginBottom: 8 }}>
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 8,
              }}>
                <div style={{ padding: "8px 0", color: C.dim, cursor: "grab" }}>
                  <GripVertical size={14} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                    <select
                      value={block.type}
                      onChange={(e) => {
                        const blocks = [...post.content];
                        blocks[i] = { ...blocks[i], type: e.target.value as ContentBlock["type"] };
                        setPost({ ...post, content: blocks });
                      }}
                      style={{
                        padding: "2px 6px", background: C.surfaceAlt, border: `1px solid ${C.border}`,
                        borderRadius: 4, color: C.dim, fontSize: 10,
                      }}
                    >
                      <option value="heading">Heading</option>
                      <option value="paragraph">Paragraph</option>
                      <option value="list">List</option>
                      <option value="callout">Callout</option>
                      <option value="quote">Quote</option>
                      <option value="divider">Divider</option>
                    </select>
                    <button
                      onClick={() => removeBlock(i)}
                      style={{
                        padding: "2px 4px", background: "transparent", border: "none",
                        color: C.dim, cursor: "pointer",
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  {block.type === "divider" ? (
                    <hr style={{ border: "none", borderTop: `1px solid ${C.border}`, margin: "8px 0" }} />
                  ) : (
                    <textarea
                      value={block.content}
                      onChange={(e) => updateBlock(i, e.target.value)}
                      placeholder={`${block.type} content...`}
                      style={{
                        width: "100%", minHeight: block.type === "heading" ? 40 : 80,
                        padding: "8px 12px", background: C.surfaceAlt,
                        border: `1px solid ${C.border}`, borderRadius: 6,
                        color: C.text, fontSize: block.type === "heading" ? 18 : 14,
                        fontWeight: block.type === "heading" ? 600 : 400,
                        fontStyle: block.type === "quote" ? "italic" : "normal",
                        resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Add block button between blocks */}
              <div style={{ textAlign: "center", padding: "4px 0" }}>
                <button
                  onClick={() => addBlock("paragraph", i)}
                  style={{
                    padding: "2px 8px", background: "transparent", border: `1px dashed ${C.border}`,
                    borderRadius: 4, color: C.dim, fontSize: 11, cursor: "pointer",
                  }}
                >
                  <Plus size={10} /> Add block
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Sidebar */}
        <div style={{ padding: 20, background: C.surface }}>
          <div style={{ position: "sticky", top: 130 }}>
            {/* Status */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: C.dim, display: "block", marginBottom: 4 }}>Status</label>
              <select
                value={post.status}
                onChange={(e) => setPost({ ...post, status: e.target.value })}
                style={{
                  width: "100%", padding: "8px 12px", background: C.surfaceAlt,
                  border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13,
                }}
              >
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>

            {/* Publish Date */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: C.dim, display: "block", marginBottom: 4 }}>Publish Date</label>
              <input
                type="datetime-local"
                value={post.publishedAt ? post.publishedAt.slice(0, 16) : ""}
                onChange={(e) => setPost({ ...post, publishedAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
                style={{
                  width: "100%", padding: "8px 12px", background: C.surfaceAlt,
                  border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <hr style={{ border: "none", borderTop: `1px solid ${C.border}`, margin: "16px 0" }} />

            {/* SEO */}
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 12 }}>SEO</div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: C.dim, display: "block", marginBottom: 4 }}>
                Focus Keyword
              </label>
              <input
                type="text"
                value={post.focusKeyword || ""}
                onChange={(e) => setPost({ ...post, focusKeyword: e.target.value })}
                placeholder="e.g. plumber toronto"
                style={{
                  width: "100%", padding: "8px 12px", background: C.surfaceAlt,
                  border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: C.dim, display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span>Meta Title</span>
                <span>{(post.metaTitle || "").length}/60</span>
              </label>
              <input
                type="text"
                value={post.metaTitle || ""}
                onChange={(e) => setPost({ ...post, metaTitle: e.target.value })}
                maxLength={60}
                style={{
                  width: "100%", padding: "8px 12px", background: C.surfaceAlt,
                  border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: C.dim, display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span>Meta Description</span>
                <span>{(post.metaDescription || "").length}/160</span>
              </label>
              <textarea
                value={post.metaDescription || ""}
                onChange={(e) => setPost({ ...post, metaDescription: e.target.value })}
                maxLength={160}
                rows={3}
                style={{
                  width: "100%", padding: "8px 12px", background: C.surfaceAlt,
                  border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13,
                  resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
                }}
              />
            </div>

            {/* Excerpt */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: C.dim, display: "block", marginBottom: 4 }}>
                Excerpt
              </label>
              <textarea
                value={post.excerpt || ""}
                onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                rows={3}
                placeholder="Brief summary for listings..."
                style={{
                  width: "100%", padding: "8px 12px", background: C.surfaceAlt,
                  border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13,
                  resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
