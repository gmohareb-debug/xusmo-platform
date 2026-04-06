import React, { useState } from "react";

export function ChatbotAssistant({
  name = "Bot",
  welcomeMessage = "Hello! How can I help you today?",
}) {
  const [messages, setMessages] = useState([
    { from: "bot", text: welcomeMessage },
  ]);
  const [input, setInput] = useState("");

  function handleSend(e) {
    e.preventDefault();
    if (input.trim()) {
      setMessages((prev) => [
        ...prev,
        { from: "user", text: input.trim() },
        {
          from: "bot",
          text: "Thanks for your message! This is a UI mockup.",
        },
      ]);
      setInput("");
    }
  }

  return (
    <div
      className="w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-lg flex flex-col"
      style={{
        backgroundColor: 'var(--surface, #fff)',
        border: '1px solid var(--border, #e5e7eb)',
        height: '480px',
      }}
    >
      <div
        className="px-5 py-4 shrink-0"
        style={{ backgroundColor: 'var(--accent, #3b82f6)' }}
      >
        <h3
          className="text-base font-bold"
          style={{ color: 'var(--surface, #fff)', fontFamily: 'var(--font-heading, inherit)' }}
        >
          {name}
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            className={`flex flex-col max-w-[80%] ${
              msg.from === "bot" ? "items-start" : "items-end ml-auto"
            }`}
            key={i}
          >
            {msg.from === "bot" && (
              <span
                className="text-xs font-semibold mb-1"
                style={{ color: 'var(--muted, #6b7280)' }}
              >
                {name}
              </span>
            )}
            <p
              className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
              style={{
                backgroundColor: msg.from === "bot" ? 'var(--border, #e5e7eb)' : 'var(--accent, #3b82f6)',
                color: msg.from === "bot" ? 'var(--text, #1c1c1c)' : 'var(--surface, #fff)',
              }}
            >
              {msg.text}
            </p>
          </div>
        ))}
      </div>
      <form
        className="flex items-center gap-2 p-3 shrink-0"
        style={{ borderTop: '1px solid var(--border, #e5e7eb)' }}
        onSubmit={handleSend}
      >
        <input
          className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none"
          style={{
            backgroundColor: 'var(--surface, #fff)',
            color: 'var(--text, #1c1c1c)',
            border: '1px solid var(--border, #e5e7eb)',
          }}
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-95"
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
  );
}
