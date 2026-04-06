import React, { useState } from "react";

export function LiveChatWidget({
  title = "Live Chat",
  subtitle = "We're here to help",
  online = true,
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  function handleSend(e) {
    e.preventDefault();
    if (input.trim()) {
      setMessages((prev) => [...prev, { from: "user", text: input.trim() }]);
      setInput("");
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      {open && (
        <div
          className="w-80 sm:w-96 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{
            backgroundColor: 'var(--surface, #fff)',
            border: '1px solid var(--border, #e5e7eb)',
            height: '420px',
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-4 shrink-0"
            style={{ backgroundColor: 'var(--accent, #3b82f6)' }}
          >
            <div>
              <h3
                className="text-sm font-bold"
                style={{ color: 'var(--surface, #fff)', fontFamily: 'var(--font-heading, inherit)' }}
              >
                {title}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--surface, #fff)' }}>
                {subtitle}
              </p>
            </div>
            <button
              className="w-7 h-7 flex items-center justify-center rounded-full text-sm transition-all duration-150 hover:brightness-90"
              style={{
                backgroundColor: 'var(--surface, #fff)',
                color: 'var(--text, #1c1c1c)',
              }}
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              &#x2715;
            </button>
          </div>
          <div
            className="flex items-center gap-2 px-5 py-2 text-xs shrink-0"
            style={{ borderBottom: '1px solid var(--border, #e5e7eb)' }}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: online ? '#22c55e' : 'var(--muted, #6b7280)' }}
            />
            <span style={{ color: 'var(--muted, #6b7280)' }}>
              {online ? "Online" : "Offline"}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-center py-8" style={{ color: 'var(--muted, #6b7280)' }}>
                No messages yet. Start the conversation!
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  msg.from === "user" ? "ml-auto" : ""
                }`}
                style={{
                  backgroundColor: msg.from === "user" ? 'var(--accent, #3b82f6)' : 'var(--border, #e5e7eb)',
                  color: msg.from === "user" ? 'var(--surface, #fff)' : 'var(--text, #1c1c1c)',
                }}
                key={i}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <form
            className="flex items-center gap-2 p-3 shrink-0"
            style={{ borderTop: '1px solid var(--border, #e5e7eb)' }}
            onSubmit={handleSend}
          >
            <input
              className="flex-1 px-4 py-2 rounded-full text-sm outline-none"
              style={{
                backgroundColor: 'var(--surface, #fff)',
                color: 'var(--text, #1c1c1c)',
                border: '1px solid var(--border, #e5e7eb)',
              }}
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-95"
              style={{
                backgroundColor: 'var(--accent, #3b82f6)',
                color: 'var(--surface, #fff)',
              }}
              type="submit"
            >
              Send
            </button>
          </form>
        </div>
      )}
      <button
        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          backgroundColor: 'var(--accent, #3b82f6)',
          color: 'var(--surface, #fff)',
        }}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle chat"
      >
        {open ? "\u2715" : "\uD83D\uDCAC"}
      </button>
    </div>
  );
}
