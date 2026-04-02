"use client";

// =============================================================================
// Interview Agent — Smart AI chat widget for the homepage
// Uses Gemini-powered conversation to gather business info naturally
// =============================================================================

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function InterviewAgent() {
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [collectedData, setCollectedData] = useState<Record<string, string>>({});
  const [track, setTrack] = useState<string>("WEBSITE");
  const [readyToBuild, setReadyToBuild] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [showSignupGate, setShowSignupGate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatorType, setGeneratorType] = useState<"gutenberg" | "engine">("engine");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasGreeted = useRef(false);
  const hasRestoredSession = useRef(false);
  const pendingAutoBuild = useRef(false);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when panel is open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open, messages]);

  // Save conversation to localStorage whenever it changes
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem("xusmo_agent_messages", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (Object.keys(collectedData).length > 0) {
      localStorage.setItem("xusmo_agent_data", JSON.stringify(collectedData));
    }
  }, [collectedData]);

  useEffect(() => {
    if (readyToBuild) {
      localStorage.setItem("xusmo_agent_ready", "true");
    }
  }, [readyToBuild]);

  // Save track to localStorage
  useEffect(() => {
    localStorage.setItem("xusmo_agent_track", track);
  }, [track]);

  // Restore conversation from localStorage on mount (e.g. after login redirect)
  useEffect(() => {
    if (hasRestoredSession.current) return;
    hasRestoredSession.current = true;

    const savedMessages = localStorage.getItem("xusmo_agent_messages");
    const savedData = localStorage.getItem("xusmo_agent_data");
    const savedReady = localStorage.getItem("xusmo_agent_ready");

    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages) as ChatMessage[];
        if (parsed.length > 0) {
          hasGreeted.current = true;
          setMessages(parsed);
          const restoredData = savedData ? JSON.parse(savedData) : {};
          if (savedData) setCollectedData(restoredData);
          const savedTrack = localStorage.getItem("xusmo_agent_track");
          if (savedTrack === "ECOMMERCE" || savedTrack === "WEBSITE") setTrack(savedTrack);
          if (savedReady === "true") {
            setReadyToBuild(true);
            // If we have a pending build flag (set before auth redirect), auto-trigger
            if (localStorage.getItem("xusmo_agent_pending_build") === "true") {
              localStorage.removeItem("xusmo_agent_pending_build");
              pendingAutoBuild.current = true;
            }
          }
          return; // Skip the greeting — we have a restored session
        }
      } catch { /* ignore bad data */ }
    }

    // No saved session — show greeting
    if (!hasGreeted.current) {
      hasGreeted.current = true;
      const timer = setTimeout(() => {
        setMessages([{
          id: "greeting",
          role: "assistant",
          content: "Hi! I'm the Xusmo AI. I can build you a professional website or an online store — completely free. Which are you looking for?",
        }]);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Send message to AI
  // ---------------------------------------------------------------------------

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: userText.trim(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue("");
    setIsTyping(true);
    setError(null);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          collectedData,
          track,
        }),
      });

      const data = await res.json();

      // Merge any new extracted data
      if (data.data && Object.keys(data.data).length > 0) {
        // Detect track change from AI
        if (data.data.track === "ECOMMERCE" || data.data.track === "WEBSITE") {
          setTrack(data.data.track);
        }
        setCollectedData((prev) => ({ ...prev, ...data.data }));
      }

      if (data.ready_to_build) {
        setReadyToBuild(true);
      }

      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", content: data.reply },
      ]);
    } catch {
      setError("Connection issue. Try again.");
    } finally {
      setIsTyping(false);
    }
  }, [messages, collectedData, isTyping, track]);

  // ---------------------------------------------------------------------------
  // Build website — create lead and trigger generation
  // ---------------------------------------------------------------------------

  const handleBuild = useCallback(async () => {
    setIsBuilding(true);
    setError(null);

    setMessages((prev) => [
      ...prev,
      { id: `a-build-${Date.now()}`, role: "assistant", content: "Analyzing your business and building your website... This takes just a moment." },
    ]);

    try {
      // Single atomic endpoint: creates lead, classifies, generates blueprint, starts build
      const res = await fetch("/api/agent/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectedData, track, generatorType }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 || data.requiresAuth) {
          localStorage.setItem("xusmo_agent_pending_build", "true");
          setShowSignupGate(true);
          setIsBuilding(false);
          return;
        }
        throw new Error(data.error ?? "Build failed");
      }

      localStorage.removeItem("xusmo_agent_data");
      localStorage.removeItem("xusmo_agent_messages");
      localStorage.removeItem("xusmo_agent_ready");
      localStorage.removeItem("xusmo_agent_track");

      const destination = data.siteId
        ? `/studio/site/${data.siteId}`
        : `/studio/build/${data.buildId}`;

      setMessages((prev) => [
        ...prev,
        { id: `a-done-${Date.now()}`, role: "assistant", content: "Your website is ready! Redirecting you to your dashboard..." },
      ]);

      setTimeout(() => {
        window.location.href = destination;
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate. Try again.");
      setIsBuilding(false);
    }
  }, [collectedData, track, generatorType]);

  // Auto-trigger build after returning from auth
  useEffect(() => {
    if (pendingAutoBuild.current && readyToBuild && Object.keys(collectedData).length > 0) {
      pendingAutoBuild.current = false;
      setTimeout(() => handleBuild(), 500);
    }
  }, [readyToBuild, collectedData, handleBuild]);

  // ---------------------------------------------------------------------------
  // Form submit
  // ---------------------------------------------------------------------------

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  // Panel dimensions
  const panelW = expanded ? "100vw" : "400px";
  const panelH = expanded ? "100vh" : "600px";
  const panelPos = expanded
    ? { bottom: 0, right: 0, borderRadius: 0 }
    : { bottom: 24, right: 24, borderRadius: 20 };

  // ---------------------------------------------------------------------------
  // Closed — floating button
  // ---------------------------------------------------------------------------

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        style={{
          background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
          boxShadow: "0 4px 20px rgba(79,70,229,0.4)",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    );
  }

  // ---------------------------------------------------------------------------
  // Open — chat panel
  // ---------------------------------------------------------------------------

  return (
    <div
      className="fixed z-50 flex flex-col shadow-2xl overflow-hidden"
      style={{
        width: panelW,
        maxWidth: expanded ? "100vw" : "calc(100vw - 48px)",
        height: panelH,
        maxHeight: expanded ? "100vh" : "calc(100vh - 48px)",
        backgroundColor: "#FAFBFC",
        border: expanded ? "none" : "1px solid #E2E8F0",
        borderRadius: panelPos.borderRadius,
        bottom: panelPos.bottom,
        right: panelPos.right,
        animation: "agentPanelIn 0.25s ease-out",
      }}
    >
      {/* ── Header ───────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{
          background: "linear-gradient(135deg, #4F46E5, #5B52F0)",
        }}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
            <path d="M18 14a6 6 0 0 0-12 0v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white">Xusmo AI</div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            <span className="text-[11px] text-white/70">Online now</span>
          </div>
        </div>

        {/* Expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-white/60 hover:text-white transition-colors"
          title={expanded ? "Minimize" : "Expand"}
        >
          {expanded ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" />
              <line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          )}
        </button>

        {/* Close */}
        <button
          onClick={() => { setOpen(false); setExpanded(false); }}
          className="text-white/60 hover:text-white transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ── Messages ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              style={{ animation: "fadeSlideIn 0.3s ease-out" }}
            >
              {/* Bot avatar */}
              {msg.role === "assistant" && (
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                    <path d="M18 14a6 6 0 0 0-12 0v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4z" />
                  </svg>
                </div>
              )}

              {/* Bubble */}
              <div
                className={`max-w-[80%] text-[13px] leading-relaxed ${
                  msg.role === "user"
                    ? "rounded-2xl rounded-br-md px-3.5 py-2.5"
                    : "rounded-2xl rounded-bl-md px-3.5 py-2.5"
                }`}
                style={
                  msg.role === "user"
                    ? { background: "linear-gradient(135deg, #4F46E5, #6366F1)", color: "#fff" }
                    : { backgroundColor: "#F1F5F9", color: "#1E293B" }
                }
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-end gap-2">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                  <path d="M18 14a6 6 0 0 0-12 0v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4z" />
                </svg>
              </div>
              <div className="rounded-2xl rounded-bl-md px-4 py-2.5" style={{ backgroundColor: "#F1F5F9" }}>
                <div className="flex gap-1">
                  <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: "0ms" }} />
                  <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: "150ms" }} />
                  <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* ── Input area ───────────────────────────────────────────── */}
      <div className="shrink-0 px-3 pb-3">
        {error && (
          <div className="mb-2 rounded-xl px-3 py-1.5 text-xs" style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}>
            {error}
          </div>
        )}

        {/* Generator picker + Build button — shown when AI collected enough data */}
        {readyToBuild && !isBuilding && !showSignupGate && (
          <div className="mb-2 space-y-2">
            {/* Generator toggle */}
            <div className="flex gap-1.5 rounded-xl p-1" style={{ backgroundColor: "#F1F5F9" }}>
              <button
                onClick={() => setGeneratorType("gutenberg")}
                className="flex-1 rounded-lg py-1.5 text-[11px] font-medium transition-all duration-200"
                style={generatorType === "gutenberg"
                  ? { backgroundColor: "#fff", color: "#4F46E5", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                  : { backgroundColor: "transparent", color: "#64748B" }
                }
              >
                WordPress (Gutenberg)
              </button>
              <button
                onClick={() => setGeneratorType("engine")}
                className="flex-1 rounded-lg py-1.5 text-[11px] font-medium transition-all duration-200"
                style={generatorType === "engine"
                  ? { backgroundColor: "#fff", color: "#4F46E5", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                  : { backgroundColor: "transparent", color: "#64748B" }
                }
              >
                React (Engine)
              </button>
            </div>
            <button
              onClick={handleBuild}
              className="w-full rounded-full py-2.5 text-xs font-semibold text-white transition-all duration-200 hover:shadow-lg hover:shadow-indigo-200"
              style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}
            >
              {track === "ECOMMERCE" ? "Generate My Store" : "Generate My Website"}
            </button>
          </div>
        )}

        {/* Building state */}
        {isBuilding && (
          <div className="mb-2 flex items-center justify-center gap-2 rounded-full py-2.5" style={{ backgroundColor: "#EEF2FF" }}>
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-600" />
            <span className="text-xs font-medium" style={{ color: "#4F46E5" }}>Building your blueprint...</span>
          </div>
        )}

        {/* Signup gate */}
        {showSignupGate && (
          <div className="mb-2 text-center py-2 space-y-2">
            <p className="text-xs text-neutral-500">Create a free account to build your website</p>
            <Link
              href="/auth/signin?mode=signup&callbackUrl=%2F"
              className="block rounded-full px-5 py-2.5 text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}
            >
              Create Free Account
            </Link>
            <Link
              href="/auth/signin?mode=signin&callbackUrl=%2F"
              className="block text-xs text-neutral-500 hover:text-neutral-700"
            >
              Already have an account? Sign in
            </Link>
          </div>
        )}

        {/* Text input — always visible */}
        {!isBuilding && !showSignupGate && (
          <form onSubmit={handleSubmit}>
            <div
              className="flex items-center gap-2 rounded-2xl px-3 py-2"
              style={{ backgroundColor: "#fff", border: "1px solid #E2E8F0" }}
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-sm outline-none text-neutral-900 placeholder:text-neutral-400"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={isTyping || !inputValue.trim()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-150 disabled:opacity-30"
                style={{
                  background: inputValue.trim()
                    ? "linear-gradient(135deg, #4F46E5, #6366F1)"
                    : "#E2E8F0",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Animations ───────────────────────────────────────────── */}
      <style jsx global>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes agentPanelIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
