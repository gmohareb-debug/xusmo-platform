"use client";

// =============================================================================
// Support Chat Widget — Floating chat bubble for portal
// =============================================================================

import { useState, useRef, useEffect } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm the Xusmo AI assistant. I can help with billing, domains, editing your website, and more. How can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response ?? "Sorry, I couldn't process that.",
          timestamp: data.timestamp ?? new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  const quickActions = [
    "Billing question",
    "Domain help",
    "Edit my site",
    "Talk to a human",
  ];

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-105 md:bottom-8 md:right-8"
        style={{ backgroundColor: "#4F46E5" }}
      >
        <svg
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl shadow-2xl md:bottom-8 md:right-8"
      style={{
        width: 380,
        maxWidth: "calc(100vw - 48px)",
        height: 520,
        maxHeight: "calc(100vh - 120px)",
        backgroundColor: "#ffffff",
        border: "1px solid #E2E8F0",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between rounded-t-2xl px-4 py-3"
        style={{ backgroundColor: "#4F46E5" }}
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "#86EFAC" }} />
          <span className="text-sm font-semibold text-white">Xusmo Support</span>
        </div>
        <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
              style={
                msg.role === "user"
                  ? { backgroundColor: "#4F46E5", color: "#ffffff" }
                  : { backgroundColor: "#F1F5F9", color: "#1E293B" }
              }
            >
              {msg.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div
              className="rounded-2xl px-4 py-2.5 text-sm"
              style={{ backgroundColor: "#F1F5F9", color: "#94A3B8" }}
            >
              Typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions (show only if few messages) */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => {
                setInput(action);
              }}
              className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
              style={{
                backgroundColor: "#EEF2FF",
                color: "#4F46E5",
              }}
            >
              {action}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 pb-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ backgroundColor: "#F8FAFC", border: "1.5px solid #E2E8F0" }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm outline-none text-neutral-900"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors disabled:opacity-40"
            style={{ backgroundColor: "#4F46E5" }}
          >
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
