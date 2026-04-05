import React from "react";

export function MessagesInbox({ title = "Inbox", messages = [] }) {
  if (messages.length === 0) {
    return (
      <div className="messages-inbox">
        <h2 className="messages-inbox-title">{title}</h2>
        <p className="messages-inbox-empty">No messages.</p>
      </div>
    );
  }

  return (
    <div className="messages-inbox">
      <h2 className="messages-inbox-title">{title}</h2>
      <ul className="messages-inbox-list">
        {messages.map((msg, index) => (
          <li
            key={index}
            className={`messages-inbox-item${
              !msg.read ? " messages-inbox-item-unread" : ""
            }`}
          >
            <div className="messages-inbox-row">
              <span className="messages-inbox-from">{msg.from}</span>
              <span className="messages-inbox-date">{msg.date}</span>
            </div>
            <div className="messages-inbox-subject">{msg.subject}</div>
            {msg.preview && (
              <div className="messages-inbox-preview">{msg.preview}</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
