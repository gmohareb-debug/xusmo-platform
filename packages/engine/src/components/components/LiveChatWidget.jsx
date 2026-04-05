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
    <div className="live-chat-widget">
      {open && (
        <div className="live-chat-panel">
          <div className="live-chat-panel-header">
            <div>
              <h3 className="live-chat-panel-title">{title}</h3>
              <p className="live-chat-panel-subtitle">{subtitle}</p>
            </div>
            <button
              className="live-chat-panel-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
          <div className="live-chat-panel-status">
            <span
              className={
                "live-chat-status-dot" +
                (online
                  ? " live-chat-status-dot-online"
                  : " live-chat-status-dot-offline")
              }
            />
            <span>{online ? "Online" : "Offline"}</span>
          </div>
          <div className="live-chat-panel-messages">
            {messages.length === 0 && (
              <p className="live-chat-panel-empty">
                No messages yet. Start the conversation!
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                className={
                  "live-chat-message" +
                  (msg.from === "user"
                    ? " live-chat-message-user"
                    : " live-chat-message-agent")
                }
                key={i}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <form className="live-chat-panel-input" onSubmit={handleSend}>
            <input
              className="live-chat-input-field"
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="live-chat-send-button" type="submit">
              Send
            </button>
          </form>
        </div>
      )}
      <button
        className="live-chat-bubble"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle chat"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          fontSize: "24px",
          zIndex: 9999,
        }}
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
