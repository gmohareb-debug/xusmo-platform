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
    <div className="chatbot-assistant">
      <div className="chatbot-assistant-header">
        <h3 className="chatbot-assistant-name">{name}</h3>
      </div>
      <div className="chatbot-assistant-messages">
        {messages.map((msg, i) => (
          <div
            className={
              "chatbot-assistant-message" +
              (msg.from === "bot"
                ? " chatbot-assistant-message-bot"
                : " chatbot-assistant-message-user")
            }
            key={i}
          >
            {msg.from === "bot" && (
              <span className="chatbot-assistant-message-sender">{name}</span>
            )}
            <p className="chatbot-assistant-message-text">{msg.text}</p>
          </div>
        ))}
      </div>
      <form className="chatbot-assistant-input" onSubmit={handleSend}>
        <input
          className="chatbot-assistant-input-field"
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="chatbot-assistant-send" type="submit">
          Send
        </button>
      </form>
    </div>
  );
}
