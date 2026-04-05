import React from "react";

export function ErrorMessage({ title, description, retryLabel, onRetry }) {
  return (
    <div className="error-message" role="alert">
      {title && <h3 className="error-message-title">{title}</h3>}
      {description && (
        <p className="error-message-description">{description}</p>
      )}
      {retryLabel && onRetry && (
        <button className="error-message-retry" onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </div>
  );
}
