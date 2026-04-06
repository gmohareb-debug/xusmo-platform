import React, { useState } from "react";

export function RatingWidget({ title, maxStars = 5 }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex flex-col items-center gap-3 px-4 py-6">
      {title && (
        <h3
          className="text-lg font-semibold"
          style={{ color: 'var(--text, #1c1c1c)', fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h3>
      )}
      <div className="flex items-center gap-1">
        {Array.from({ length: maxStars }, (_, i) => {
          const starIndex = i + 1;
          const filled = starIndex <= (hovered || rating);
          return (
            <span
              key={starIndex}
              className="text-3xl md:text-4xl cursor-pointer transition-transform duration-150 hover:scale-110 select-none"
              style={{ color: filled ? 'var(--accent, #3b82f6)' : 'var(--border, #e5e7eb)' }}
              onClick={() => setRating(starIndex)}
              onMouseEnter={() => setHovered(starIndex)}
              onMouseLeave={() => setHovered(0)}
              role="button"
              aria-label={`Rate ${starIndex} of ${maxStars}`}
            >
              {filled ? "\u2605" : "\u2606"}
            </span>
          );
        })}
      </div>
      {rating > 0 && (
        <p className="text-sm font-medium" style={{ color: 'var(--muted, #6b7280)' }}>
          {rating} / {maxStars}
        </p>
      )}
    </div>
  );
}
