import React from "react";

export function CompareButton({ label = "Compare", active = false }) {
  return (
    <button
      className={`compare-button${active ? " compare-button-active" : ""}`}
      type="button"
      aria-pressed={active}
    >
      <span className="compare-icon" aria-hidden="true">
        &#x21C6;
      </span>
      <span className="compare-label">{label}</span>
    </button>
  );
}
