"use client";

// =============================================================================
// StudioAgent — Floating AI chat panel for natural-language site editing
// =============================================================================

import { useState, useRef, useEffect, useCallback, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Send, X, Loader2, Check, AlertCircle, ChevronRight } from "lucide-react";
import { C } from "@/lib/studio/colors";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ActionResult {
  action: string;
  success: boolean;
  label: string;
  error?: string;
}

interface AgentResponse {
  reply: string;
  actions: ActionResult[];
  navigateTo?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  actions?: ActionResult[];
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const PANEL_WIDTH = 400;
const PANEL_HEIGHT = 500;

const styles = {
  // Floating trigger button
  trigger: {
    position: "fixed" as const,
    bottom: 24,
    right: 24,
    display: "flex",
    alignItems: "center" as const,
    gap: 8,
    padding: "10px 18px",
    background: C.accent,
    color: "#fff",
    border: "none",
    borderRadius: 50,
    fontSize: 13,
    fontWeight: 600 as const,
    fontFamily: "'Inter',-apple-system,sans-serif",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(79,70,229,0.35)",
    transition: "transform 0.15s, box-shadow 0.15s",
    zIndex: 10001,
  },

  // Chat panel container
  panel: {
    position: "fixed" as const,
    bottom: 24,
    right: 24,
    width: PANEL_WIDTH,
    height: PANEL_HEIGHT,
    background: C.surface,
    borderRadius: 16,
    boxShadow: "0 8px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
    fontFamily: "'Inter',-apple-system,sans-serif",
    zIndex: 10001,
    animation: "sfAgentSlideUp 0.25s ease-out",
  },

  // Panel header
  header: {
    display: "flex",
    alignItems: "center" as const,
    gap: 8,
    padding: "14px 16px",
    borderBottom: `1px solid ${C.border}`,
    background: C.surface,
    flexShrink: 0,
  },
  headerTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: 700 as const,
    color: C.text,
  },
  headerIcon: {
    color: C.accent,
  },
  closeBtn: {
    background: "none",
    border: "none",
    padding: 4,
    cursor: "pointer",
    color: C.dim,
    borderRadius: 6,
    display: "flex",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  // Messages area
  messages: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },

  // User message bubble
  userMsg: {
    alignSelf: "flex-end" as const,
    maxWidth: "85%",
    padding: "10px 14px",
    background: C.accent,
    color: "#fff",
    borderRadius: "14px 14px 4px 14px",
    fontSize: 13,
    lineHeight: 1.5,
    wordBreak: "break-word" as const,
  },

  // Assistant message bubble
  assistantMsg: {
    alignSelf: "flex-start" as const,
    maxWidth: "85%",
    padding: "10px 14px",
    background: C.surfaceAlt,
    color: C.text,
    borderRadius: "14px 14px 14px 4px",
    fontSize: 13,
    lineHeight: 1.5,
    wordBreak: "break-word" as const,
  },

  // Action badge
  actionBadge: (success: boolean) => ({
    display: "inline-flex",
    alignItems: "center" as const,
    gap: 4,
    padding: "3px 8px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 500 as const,
    marginTop: 6,
    marginRight: 4,
    background: success ? `${C.green}15` : `${C.red}15`,
    color: success ? C.green : C.red,
  }),

  // Input area
  inputArea: {
    display: "flex",
    alignItems: "center" as const,
    gap: 8,
    padding: "12px 16px",
    borderTop: `1px solid ${C.border}`,
    background: C.surface,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: "9px 14px",
    fontSize: 13,
    fontFamily: "'Inter',-apple-system,sans-serif",
    color: C.text,
    outline: "none",
    background: C.bg,
    transition: "border-color 0.15s",
  },
  sendBtn: {
    background: C.accent,
    border: "none",
    borderRadius: 10,
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    cursor: "pointer",
    color: "#fff",
    flexShrink: 0,
    transition: "opacity 0.15s",
  },

  // Empty state
  emptyState: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flex: 1,
    padding: 24,
    textAlign: "center" as const,
    color: C.dim,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 700 as const,
    color: C.text,
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    lineHeight: 1.6,
    maxWidth: 280,
  },
  suggestion: {
    display: "flex",
    alignItems: "center" as const,
    gap: 6,
    padding: "6px 12px",
    background: C.surfaceAlt,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    fontSize: 12,
    color: C.muted,
    cursor: "pointer",
    marginTop: 4,
    transition: "background 0.1s, color 0.1s",
    textAlign: "left" as const,
    width: "100%",
    maxWidth: 300,
  },

  // Typing indicator
  typing: {
    alignSelf: "flex-start" as const,
    display: "flex",
    alignItems: "center" as const,
    gap: 6,
    padding: "8px 14px",
    background: C.surfaceAlt,
    borderRadius: "14px 14px 14px 4px",
    fontSize: 12,
    color: C.dim,
  },
} as const;

// ---------------------------------------------------------------------------
// Suggestion prompts
// ---------------------------------------------------------------------------

const SUGGESTIONS = [
  "Change the hero headline",
  "Apply a professional blue theme",
  "Update the CTA button text",
  "Make the design more elegant",
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function StudioAgent({ siteId }: { siteId: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Send message to agent API
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        text: text.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        // Build conversation history from previous messages (last 10 turns)
        const historyForApi = messages
          .slice(-10)
          .map((m) => ({ role: m.role, text: m.text }));

        const res = await fetch(`/api/studio/${siteId}/agents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            history: historyForApi,
          }),
        });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const data: AgentResponse = await res.json();

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: data.reply,
          actions: data.actions,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Signal design page to refresh preview if any data-modifying action succeeded
        const hasDataChange = data.actions?.some(
          (a: ActionResult) =>
            a.success &&
            a.action !== "INFO" &&
            a.action !== "NAVIGATE"
        );
        if (hasDataChange && typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("xusmo-design-refresh"));
        }

        // Handle navigation
        if (data.navigateTo) {
          const basePath = `/studio/site/${siteId}`;
          const tabMap: Record<string, string> = {
            content: `${basePath}/content`,
            design: `${basePath}/design`,
            seo: `${basePath}/seo`,
            preview: `${basePath}/preview`,
            pages: `${basePath}/pages`,
          };
          const target = tabMap[data.navigateTo];
          if (target) {
            router.push(target);
          }
        }
      } catch (err) {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          text:
            err instanceof Error
              ? `Something went wrong: ${err.message}. Please try again.`
              : "Something went wrong. Please try again.",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [siteId, isLoading, router]
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleSuggestion = (text: string) => {
    sendMessage(text);
  };

  // ----- Render: Floating trigger button -----
  if (!isOpen) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          style={styles.trigger}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 28px rgba(79,70,229,0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(79,70,229,0.35)";
          }}
        >
          <Sparkles size={16} />
          AI Assistant
        </button>
        <style>{`@keyframes sfAgentSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }`}</style>
      </>
    );
  }

  // ----- Render: Chat panel -----
  return (
    <>
      <div style={styles.panel}>
        {/* Header */}
        <div style={styles.header}>
          <Sparkles size={16} style={styles.headerIcon} />
          <span style={styles.headerTitle}>AI Assistant</span>
          <button
            onClick={() => setIsOpen(false)}
            style={styles.closeBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = C.surfaceAlt;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div style={styles.messages}>
          {messages.length === 0 && !isLoading ? (
            <div style={styles.emptyState}>
              <Sparkles size={28} style={{ color: C.accent }} />
              <div style={styles.emptyTitle}>How can I help?</div>
              <div style={styles.emptySubtitle}>
                Tell me what changes you'd like to make to your website. I can
                update content, apply themes, and more.
              </div>
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6, width: "100%" , alignItems: "center" }}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    style={styles.suggestion}
                    onClick={() => handleSuggestion(s)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${C.accent}10`;
                      e.currentTarget.style.color = C.text;
                      e.currentTarget.style.borderColor = C.accent;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = C.surfaceAlt;
                      e.currentTarget.style.color = C.muted;
                      e.currentTarget.style.borderColor = C.border;
                    }}
                  >
                    <ChevronRight size={12} />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id}>
                  <div
                    style={
                      msg.role === "user"
                        ? styles.userMsg
                        : styles.assistantMsg
                    }
                  >
                    {msg.text}
                  </div>

                  {/* Action badges */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        maxWidth: "85%",
                        marginTop: 2,
                      }}
                    >
                      {msg.actions
                        .filter((a) => a.action !== "INFO")
                        .map((a, i) => (
                          <span key={i} style={styles.actionBadge(a.success)}>
                            {a.success ? (
                              <Check size={10} />
                            ) : (
                              <AlertCircle size={10} />
                            )}
                            {a.label}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div style={styles.typing}>
                  <Loader2
                    size={14}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Thinking...
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} style={styles.inputArea}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me to change anything..."
            style={styles.input}
            disabled={isLoading}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = C.accent;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = C.border;
            }}
          />
          <button
            type="submit"
            style={{
              ...styles.sendBtn,
              opacity: !input.trim() || isLoading ? 0.5 : 1,
              cursor: !input.trim() || isLoading ? "not-allowed" : "pointer",
            }}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2
                size={16}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <Send size={16} />
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes sfAgentSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
