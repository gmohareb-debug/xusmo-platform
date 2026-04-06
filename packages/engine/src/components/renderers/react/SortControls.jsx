import React, { useState } from "react";

export function SortControls({ options = [], current }) {
  const [selected, setSelected] = useState(current || (options[0] && options[0].value) || "");

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-4">
      <label
        className="text-sm font-medium whitespace-nowrap"
        style={{ color: 'var(--muted, #6b7280)' }}
      >
        Sort by:
      </label>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
        {/* Dropdown for mobile */}
        <select
          className="sm:hidden w-full px-3 py-2 text-sm rounded-lg appearance-none cursor-pointer"
          style={{
            backgroundColor: 'var(--surface, #fff)',
            border: '1px solid var(--border, #e5e7eb)',
            color: 'var(--text, #1c1c1c)',
          }}
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Button group for desktop */}
        <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--surface, #fff)', border: '1px solid var(--border, #e5e7eb)' }}>
          {options.map((option) => {
            const isActive = selected === option.value;
            return (
              <button
                key={option.value}
                className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer border-none"
                style={{
                  backgroundColor: isActive ? 'var(--accent, #3b82f6)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--muted, #6b7280)',
                }}
                type="button"
                onClick={() => setSelected(option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
