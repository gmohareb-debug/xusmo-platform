import React, { useState } from "react";

export function RatingWidget({ title, maxStars = 5 }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  return (
    <div className="rating-widget">
      {title && <h3 className="rating-widget-title">{title}</h3>}
      <div className="rating-widget-stars">
        {Array.from({ length: maxStars }, (_, i) => {
          const starIndex = i + 1;
          const filled = starIndex <= (hovered || rating);
          return (
            <span
              className={
                "rating-widget-star" +
                (filled ? " rating-widget-star-filled" : "")
              }
              key={starIndex}
              onClick={() => setRating(starIndex)}
              onMouseEnter={() => setHovered(starIndex)}
              onMouseLeave={() => setHovered(0)}
              style={{ cursor: "pointer", fontSize: "28px" }}
              role="button"
              aria-label={`Rate ${starIndex} of ${maxStars}`}
            >
              {filled ? "\u2605" : "\u2606"}
            </span>
          );
        })}
      </div>
      {rating > 0 && (
        <p className="rating-widget-value">
          {rating} / {maxStars}
        </p>
      )}
    </div>
  );
}
