import React from "react";

export function NotificationsCenter({ title = "Notifications", notifications = [] }) {
  if (notifications.length === 0) {
    return (
      <div className="notifications-center">
        <h2 className="notifications-center-title">{title}</h2>
        <p className="notifications-center-empty">No notifications.</p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="notifications-center">
      <div className="notifications-center-header">
        <h2 className="notifications-center-title">{title}</h2>
        {unreadCount > 0 && (
          <span className="notifications-center-badge">
            {unreadCount} unread
          </span>
        )}
      </div>
      <ul className="notifications-center-list">
        {notifications.map((notification, index) => (
          <li
            key={index}
            className={`notifications-center-item${
              !notification.read ? " notifications-center-item-unread" : ""
            }`}
          >
            <span className="notifications-center-message">
              {notification.message}
            </span>
            {notification.date && (
              <span className="notifications-center-date">
                {notification.date}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
