import { useState } from "react";

export function BeforeAfterComparison({ before, after }) {
  const [position, setPosition] = useState(50);

  if (!before?.src || !after?.src) return null;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-4">
        <div className="relative w-full overflow-hidden rounded-xl select-none">
          <img
            className="block w-full h-auto object-cover"
            src={after.src}
            alt={after.label || "After"}
          />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${position}%` }}
          >
            <img
              className="block w-full h-full object-cover"
              style={{ minWidth: '100%', minHeight: '100%' }}
              src={before.src}
              alt={before.label || "Before"}
            />
          </div>
          <div
            className="absolute top-0 bottom-0 w-0.5"
            style={{
              left: `${position}%`,
              backgroundColor: 'var(--surface, #fff)',
              boxShadow: '0 0 6px rgba(0,0,0,0.3)',
            }}
          >
            <div
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
              style={{
                backgroundColor: 'var(--surface, #fff)',
                color: 'var(--text, #1c1c1c)',
              }}
            >
              &#x2194;
            </div>
          </div>
        </div>

        <input
          className="w-full cursor-pointer accent-[var(--accent,#3b82f6)]"
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          aria-label="Comparison slider"
        />

        <div className="flex justify-between">
          {before.label && (
            <span className="text-sm font-medium" style={{ color: 'var(--text, #1c1c1c)' }}>
              {before.label}
            </span>
          )}
          {after.label && (
            <span className="text-sm font-medium" style={{ color: 'var(--text, #1c1c1c)' }}>
              {after.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
