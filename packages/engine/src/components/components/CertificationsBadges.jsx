import React from "react";

export function CertificationsBadges({ title, badges = [] }) {
  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-8">
      {title && (
        <h2
          className="text-2xl font-bold mb-6 text-center"
          style={{ color: 'var(--text, #1c1c1c)', fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h2>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {badges.map((badge, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-3 p-4 rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            style={{
              backgroundColor: 'var(--surface, #fff)',
              border: '1px solid var(--border, #e5e7eb)',
            }}
          >
            <img
              src={badge.src}
              alt={badge.alt || badge.label || "Certification badge"}
              className="w-16 h-16 object-contain"
            />
            {badge.label && (
              <span
                className="text-xs font-medium text-center"
                style={{ color: 'var(--text, #1c1c1c)' }}
              >
                {badge.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
