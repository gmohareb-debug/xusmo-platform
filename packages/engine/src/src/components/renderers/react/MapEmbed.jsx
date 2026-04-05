import React from "react";

export function MapEmbed({ embedUrl, title = "Map", height = "400" }) {
  return (
    <div className="map-embed">
      <iframe
        className="map-embed-iframe"
        src={embedUrl}
        title={title}
        width="100%"
        height={height}
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
