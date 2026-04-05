import React from "react";

export function EmptyState({ icon, title, description, actionLabel, actionHref }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      {title && <h3 className="empty-state-title">{title}</h3>}
      {description && (
        <p className="empty-state-description">{description}</p>
      )}
      {actionLabel && (
        <a href={actionHref || "#"} className="empty-state-action">
          {actionLabel}
        </a>
      )}
    </div>
  );
}
