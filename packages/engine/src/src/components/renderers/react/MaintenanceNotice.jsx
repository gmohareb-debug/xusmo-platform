import React from "react";

export function MaintenanceNotice({
  title = "Under Maintenance",
  message,
  estimatedTime,
}) {
  return (
    <div className="maintenance-notice">
      <div className="maintenance-notice-content">
        <h2 className="maintenance-notice-title">{title}</h2>
        {message && (
          <p className="maintenance-notice-message">{message}</p>
        )}
        {estimatedTime && (
          <p className="maintenance-notice-time">
            Estimated time: <strong>{estimatedTime}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
