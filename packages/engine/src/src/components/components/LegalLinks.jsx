import React from "react";

export function LegalLinks({ links = [] }) {
  return (
    <nav className="legal-links" aria-label="Legal">
      {links.map((link, index) => (
        <span key={index} className="legal-links-item">
          {index > 0 && (
            <span className="legal-links-separator" aria-hidden="true">
              |
            </span>
          )}
          <a href={link.href || "#"} className="legal-links-link">
            {link.label}
          </a>
        </span>
      ))}
    </nav>
  );
}
