import { useState } from "react";

export function BeforeAfterComparison({ before, after }) {
  const [position, setPosition] = useState(50);

  if (!before?.src || !after?.src) return null;

  return (
    <div className="ba-comparison">
      <div className="ba-comparison-container">
        <div className="ba-comparison-image-wrap">
          <img
            className="ba-comparison-image ba-comparison-after"
            src={after.src}
            alt={after.label || "After"}
          />
          <div
            className="ba-comparison-reveal"
            style={{ width: `${position}%` }}
          >
            <img
              className="ba-comparison-image ba-comparison-before"
              src={before.src}
              alt={before.label || "Before"}
            />
          </div>
          <div
            className="ba-comparison-slider-line"
            style={{ left: `${position}%` }}
          >
            <div className="ba-comparison-slider-handle" />
          </div>
        </div>

        <input
          className="ba-comparison-range"
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          aria-label="Comparison slider"
        />

        <div className="ba-comparison-labels">
          {before.label && (
            <span className="ba-comparison-label">{before.label}</span>
          )}
          {after.label && (
            <span className="ba-comparison-label">{after.label}</span>
          )}
        </div>
      </div>
    </div>
  );
}
