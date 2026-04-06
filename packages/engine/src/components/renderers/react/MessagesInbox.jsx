import React from "react";

export function MessagesInbox({ title = "Inbox", messages = [] }) {
  if (messages.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: 'var(--text, #1c1c1c)', fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h2>
        <p className="text-sm" style={{ color: 'var(--muted, #6b7280)' }}>
          No messages.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <h2
        className="text-2xl font-bold mb-6"
        style={{ color: 'var(--text, #1c1c1c)', fontFamily: 'var(--font-heading, inherit)' }}
      >
        {title}
      </h2>
      <ul className="flex flex-col gap-1">
        {messages.map((msg, index) => (
          <li
            key={index}
            className="px-4 py-3 rounded-lg transition-colors duration-150 cursor-pointer hover:brightness-95"
            style={{
              backgroundColor: !msg.read ? 'var(--surface, #fff)' : 'transparent',
              borderLeft: !msg.read ? '3px solid var(--accent, #3b82f6)' : '3px solid transparent',
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-sm"
                style={{
                  color: 'var(--text, #1c1c1c)',
                  fontWeight: !msg.read ? 700 : 400,
                }}
              >
                {msg.from}
              </span>
              <span className="text-xs" style={{ color: 'var(--muted, #6b7280)' }}>
                {msg.date}
              </span>
            </div>
            <div
              className="text-sm mb-0.5"
              style={{
                color: 'var(--text, #1c1c1c)',
                fontWeight: !msg.read ? 600 : 400,
              }}
            >
              {msg.subject}
            </div>
            {msg.preview && (
              <div
                className="text-xs truncate"
                style={{ color: 'var(--muted, #6b7280)' }}
              >
                {msg.preview}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
