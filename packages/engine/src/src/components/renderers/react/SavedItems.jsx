import React from "react";

export function SavedItems({ title = "Saved Items", items = [] }) {
  if (items.length === 0) {
    return (
      <div className="saved-items">
        <h2 className="saved-items-title">{title}</h2>
        <p className="saved-items-empty">No saved items yet.</p>
      </div>
    );
  }

  return (
    <div className="saved-items">
      <h2 className="saved-items-title">{title}</h2>
      <div className="saved-items-grid">
        {items.map((item, index) => {
          const content = (
            <div key={index} className="saved-items-card">
              {item.image && (
                <img
                  className="saved-items-image"
                  src={item.image}
                  alt={item.name}
                />
              )}
              <div className="saved-items-info">
                <h3 className="saved-items-name">{item.name}</h3>
                {item.price && (
                  <span className="saved-items-price">{item.price}</span>
                )}
              </div>
            </div>
          );

          if (item.href) {
            return (
              <a key={index} className="saved-items-link" href={item.href}>
                {content}
              </a>
            );
          }

          return content;
        })}
      </div>
    </div>
  );
}
