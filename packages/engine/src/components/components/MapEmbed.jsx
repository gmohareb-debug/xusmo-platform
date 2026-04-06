import React from "react";

export function MapEmbed({ embedUrl, title = "Map", height = "400" }) {
  return (
    <div
      className="w-full rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--border, #e5e7eb)' }}
    >
      <iframe
        className="w-full block"
        src={embedUrl}
        title={title}
        height={height}
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
