import React, { useState } from "react";

export function SortControls({ options = [], current }) {
  const [selected, setSelected] = useState(current || (options[0] && options[0].value) || "");

  return (
    <div className="sort-controls">
      <label className="sort-controls-label">Sort by:</label>
      <div className="sort-controls-options">
        <select
          className="sort-controls-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="sort-controls-buttons">
          {options.map((option) => (
            <button
              className={
                "sort-controls-button" +
                (selected === option.value
                  ? " sort-controls-button-active"
                  : "")
              }
              key={option.value}
              type="button"
              onClick={() => setSelected(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
