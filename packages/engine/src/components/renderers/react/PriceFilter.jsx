import React, { useState } from "react";

export function PriceFilter({ min = 0, max = 1000, currency = "$" }) {
  const [minValue, setMinValue] = useState(min);
  const [maxValue, setMaxValue] = useState(max);

  function handleMinChange(e) {
    const val = Number(e.target.value);
    if (val <= maxValue) {
      setMinValue(val);
    }
  }

  function handleMaxChange(e) {
    const val = Number(e.target.value);
    if (val >= minValue) {
      setMaxValue(val);
    }
  }

  return (
    <div
      className="w-full max-w-sm mx-auto p-5 rounded-xl"
      style={{ backgroundColor: 'var(--surface, #fff)', border: '1px solid var(--border, #e5e7eb)' }}
    >
      <h4
        className="text-base font-semibold mb-4"
        style={{ color: 'var(--text, #1c1c1c)', fontFamily: 'var(--font-heading, inherit)' }}
      >
        Price Range
      </h4>

      <div className="flex items-center justify-center gap-3 mb-6">
        <span
          className="px-3 py-1.5 text-sm font-semibold rounded-lg"
          style={{ backgroundColor: 'var(--accent, #3b82f6)', color: '#fff' }}
        >
          {currency}{minValue}
        </span>
        <span className="text-sm" style={{ color: 'var(--muted, #6b7280)' }}>&mdash;</span>
        <span
          className="px-3 py-1.5 text-sm font-semibold rounded-lg"
          style={{ backgroundColor: 'var(--accent, #3b82f6)', color: '#fff' }}
        >
          {currency}{maxValue}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted, #6b7280)' }}>
            Min
          </label>
          <input
            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[var(--accent,#3b82f6)]"
            style={{ backgroundColor: 'var(--border, #e5e7eb)' }}
            type="range"
            min={min}
            max={max}
            value={minValue}
            onChange={handleMinChange}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted, #6b7280)' }}>
            Max
          </label>
          <input
            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[var(--accent,#3b82f6)]"
            style={{ backgroundColor: 'var(--border, #e5e7eb)' }}
            type="range"
            min={min}
            max={max}
            value={maxValue}
            onChange={handleMaxChange}
          />
        </div>
      </div>
    </div>
  );
}
