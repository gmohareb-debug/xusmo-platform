"use client";

// =============================================================================
// Interview Page — Full-page AI chat using the same Gemini agent as the homepage
// =============================================================================

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
// Main
// ---------------------------------------------------------------------------

export default function InterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      }
    >
      <InterviewPageInner />
    </Suspense>
  );
}

function InterviewPageInner() {
  const searchParams = useSearchParams();
  const trackParam = searchParams.get("track");
  const initialTrack = trackParam === "ecommerce" ? "ECOMMERCE" : "WEBSITE";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [collectedData, setCollectedData] = useState<Record<string, string>>({});
  const [track, setTrack] = useState(initialTrack);
  const [readyToBuild, setReadyToBuild] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [showSignupGate, setShowSignupGate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasGreeted = useRef(false);
  const hasRestoredSession = useRef(false);
  const pendingAutoBuild = useRef(false);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [messages]);

  // Persist conversation to localStorage
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

  useEffect(() => {
    localStorage.setItem("xusmo_agent_track", track);
  }, [track]);

  // Restore conversation from localStorage (e.g. after login redirect)
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
          if (savedData) setCollectedData(JSON.parse(savedData));
          const savedTrack = localStorage.getItem("xusmo_agent_track");
          if (savedTrack === "ECOMMERCE" || savedTrack === "WEBSITE") setTrack(savedTrack);
          if (savedReady === "true") {
            setReadyToBuild(true);
            if (localStorage.getItem("xusmo_agent_pending_build") === "true") {
              localStorage.removeItem("xusmo_agent_pending_build");
              pendingAutoBuild.current = true;
            }
          }
          return;
        }
      } catch { /* ignore */ }
    }

    // No saved session — show greeting
    if (!hasGreeted.current) {
      hasGreeted.current = true;
      const isEcommerce = initialTrack === "ECOMMERCE";
      const timer = setTimeout(() => {
        setMessages([{
          id: "greeting",
          role: "assistant",
          content: isEcommerce
            ? "Hi! I'm the Xusmo AI. Tell me about the online store you'd like to build — what do you sell, who are your customers, and what's your business name?"
            : "Hi! I'm the Xusmo AI. Tell me about your business and I'll build you a professional website in minutes. What's your business name and what do you do?",
        }]);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [initialTrack]);

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

      if (data.data && Object.keys(data.data).length > 0) {
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
      setError("Connection issue. Please try again.");
    } finally {
      setIsTyping(false);
    }
  }, [messages, collectedData, isTyping, track]);

  // ---------------------------------------------------------------------------
  // Build website
  // ---------------------------------------------------------------------------

  const handleBuild = useCallback(async () => {
    setIsBuilding(true);
    setError(null);

    setMessages((prev) => [
      ...prev,
      { id: `a-build-${Date.now()}`, role: "assistant", content: "Analyzing your business and generating your website... This takes just a moment." },
    ]);

    try {
      const res = await fetch("/api/agent/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectedData, track }),
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

      // Clear saved session
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
  }, [collectedData, track]);

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

  // Count collected fields for progress indicator
  const requiredFields = ["business_name", "description", "primary_goal", "target_audience", "location", "phone", "email", "services"];
  const filledCount = requiredFields.filter((f) => collectedData[f]).length;
  const progressPct = Math.round((filledCount / requiredFields.length) * 100);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#FAFBFC" }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 flex items-center gap-3 px-5 py-3"
        style={{
          backgroundColor: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid #F1F5F9",
        }}
      >
        <Link href="/" className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
          >
            <span className="text-sm font-bold text-white">X</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-neutral-900">Xusmo AI</div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              <span className="text-[11px] text-neutral-400">Building your website</span>
            </div>
          </div>
        </Link>

        {/* Progress bar */}
        {filledCount > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <div className="h-1.5 w-24 rounded-full overflow-hidden" style={{ backgroundColor: "#E2E8F0" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPct}%`,
                  background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                }}
              />
            </div>
            <span className="text-[11px] text-neutral-400">{progressPct}%</span>
          </div>
        )}
      </header>

      {/* ── Chat area ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="space-y-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                style={{ animation: "fadeSlideIn 0.3s ease-out" }}
              >
                {/* Bot avatar */}
                {msg.role === "assistant" && (
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                      <path d="M18 14a6 6 0 0 0-12 0v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4z" />
                    </svg>
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`max-w-[75%] text-[14px] leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-2xl rounded-br-md px-4 py-2.5"
                      : "rounded-2xl rounded-bl-md px-4 py-2.5"
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
              <div className="flex items-end gap-2.5">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                    <path d="M18 14a6 6 0 0 0-12 0v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4z" />
                  </svg>
                </div>
                <div className="rounded-2xl rounded-bl-md px-4 py-3" style={{ backgroundColor: "#F1F5F9" }}>
                  <div className="flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: "0ms" }} />
                    <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: "150ms" }} />
                    <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* ── Input area ─────────────────────────────────────────────────── */}
      <div
        className="sticky bottom-0 z-10 px-4 pb-4 pt-2"
        style={{
          background: "linear-gradient(to top, #FAFBFC 70%, transparent)",
        }}
      >
        <div className="mx-auto max-w-2xl">
          {error && (
            <div
              className="mb-2 rounded-xl px-4 py-2 text-sm"
              style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}
            >
              {error}
            </div>
          )}

          {/* Build button */}
          {readyToBuild && !isBuilding && !showSignupGate && (
            <button
              onClick={handleBuild}
              className="mb-3 w-full rounded-full py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:shadow-indigo-200"
              style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}
            >
              {track === "ECOMMERCE" ? "Generate My Online Store" : "Generate My Website"}
            </button>
          )}

          {/* Building state */}
          {isBuilding && (
            <div className="mb-3 flex items-center justify-center gap-2 rounded-full py-3.5" style={{ backgroundColor: "#EEF2FF" }}>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-600" />
              <span className="text-sm font-medium" style={{ color: "#4F46E5" }}>Building your website...</span>
            </div>
          )}

          {/* Signup gate */}
          {showSignupGate && (
            <div
              className="mb-3 rounded-2xl p-6 text-center"
              style={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
            >
              <div
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-1">Almost there!</h3>
              <p className="text-sm text-neutral-500 mb-5">
                Create a free account to generate your website. Your conversation is saved.
              </p>
              <div className="flex flex-col gap-2.5">
                <Link
                  href="/auth/signin?mode=signup&callbackUrl=%2Finterview%3Fresume%3D1"
                  className="block rounded-full px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:shadow-indigo-200"
                  style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}
                >
                  Create Free Account
                </Link>
                <Link
                  href="/auth/signin?mode=signin&callbackUrl=%2Finterview%3Fresume%3D1"
                  className="block rounded-full px-6 py-3 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
                >
                  Already have an account? Sign in
                </Link>
              </div>
            </div>
          )}

          {/* Text input */}
          {!isBuilding && !showSignupGate && (
            <form onSubmit={handleSubmit}>
              <div
                className="flex items-center gap-2 rounded-2xl px-4 py-3"
                style={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Tell me about your business..."
                  className="flex-1 bg-transparent text-sm outline-none text-neutral-900 placeholder:text-neutral-400"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={isTyping || !inputValue.trim()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-150 disabled:opacity-30"
                  style={{
                    background: inputValue.trim()
                      ? "linear-gradient(135deg, #4F46E5, #6366F1)"
                      : "#E2E8F0",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </form>
          )}

          <p className="mt-2 text-center text-[11px] text-neutral-400">
            Free. No credit card required. Powered by AI.
          </p>
        </div>
      </div>

      {/* ── Animation keyframes ────────────────────────────────────────── */}
      <style jsx global>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
