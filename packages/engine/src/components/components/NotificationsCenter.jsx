import React from "react";

export function NotificationsCenter({ title = "Notifications", notifications = [] }) {
  if (notifications.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8" style={{ color: 'var(--text, #1c1c1c)' }}>
        <h2
          className="text-2xl md:text-3xl font-bold mb-4"
          style={{ fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h2>
        <p className="text-sm" style={{ color: 'var(--muted, #6b7280)' }}>No notifications.</p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8" style={{ color: 'var(--text, #1c1c1c)' }}>
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-2xl md:text-3xl font-bold"
          style={{ fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h2>
        {unreadCount > 0 && (
          <span
            className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full text-white"
            style={{ backgroundColor: 'var(--accent, #3b82f6)' }}
          >
            {unreadCount} unread
          </span>
        )}
      </div>
      <ul className="list-none p-0 m-0 flex flex-col gap-2">
        {notifications.map((notification, index) => (
          <li
            key={index}
            className="flex items-start justify-between gap-4 px-4 py-3 rounded-lg transition-colors duration-200"
            style={{
              backgroundColor: !notification.read ? 'var(--accent, #3b82f6)' : 'var(--surface, #fff)',
              color: !notification.read ? 'white' : 'var(--text, #1c1c1c)',
              borderLeft: !notification.read ? 'none' : '1px solid var(--border, #e5e7eb)',
              borderTop: !notification.read ? 'none' : '1px solid var(--border, #e5e7eb)',
              borderRight: !notification.read ? 'none' : '1px solid var(--border, #e5e7eb)',
              borderBottom: !notification.read ? 'none' : '1px solid var(--border, #e5e7eb)',
            }}
          >
            <span className="text-sm leading-relaxed flex-1">
              {notification.message}
            </span>
            {notification.date && (
              <span
                className="text-xs whitespace-nowrap mt-0.5"
                style={{ color: !notification.read ? 'rgba(255,255,255,0.8)' : 'var(--muted, #6b7280)' }}
              >
                {notification.date}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
