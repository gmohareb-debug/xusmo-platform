import React from "react";
import { onImgError } from './imgFallback'

export function ClientLogos({ title, logos = [] }) {
  return (
    <section className="client-logos">
      {title && <h2 className="client-logos-title">{title}</h2>}
      <div className="client-logos-grid">
        {logos.map((logo, index) => (
          <div key={index} className="client-logo-item">
            <img
              src={logo.src}
              alt={logo.alt || "Client logo"}
              className="client-logo-image"
              style={{ filter: "grayscale(100%)", opacity: 0.7 }}
              onError={e => onImgError(e, 120, 40)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
