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
    <div className="price-filter">
      <h4 className="price-filter-title">Price Range</h4>
      <div className="price-filter-display">
        <span className="price-filter-value">
          {currency}{minValue}
        </span>
        <span className="price-filter-separator"> — </span>
        <span className="price-filter-value">
          {currency}{maxValue}
        </span>
      </div>
      <div className="price-filter-sliders">
        <div className="price-filter-slider-group">
          <label className="price-filter-label">Min</label>
          <input
            className="price-filter-range"
            type="range"
            min={min}
            max={max}
            value={minValue}
            onChange={handleMinChange}
          />
        </div>
        <div className="price-filter-slider-group">
          <label className="price-filter-label">Max</label>
          <input
            className="price-filter-range"
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
