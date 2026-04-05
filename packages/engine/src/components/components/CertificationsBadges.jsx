import React from "react";

export function CertificationsBadges({ title, badges = [] }) {
  return (
    <section className="certifications-badges">
      {title && <h2 className="certifications-badges-title">{title}</h2>}
      <div className="certifications-badges-grid">
        {badges.map((badge, index) => (
          <div key={index} className="certification-badge-item">
            <img
              src={badge.src}
              alt={badge.alt || badge.label || "Certification badge"}
              className="certification-badge-image"
            />
            {badge.label && (
              <span className="certification-badge-label">{badge.label}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
