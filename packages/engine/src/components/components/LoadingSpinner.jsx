import React from "react";

const sizeMap = {
  sm: 20,
  md: 40,
  lg: 64,
};

export function LoadingSpinner({ size = "md", label }) {
  const dimension = sizeMap[size] || sizeMap.md;
  const borderWidth = dimension >= 64 ? 5 : dimension >= 40 ? 4 : 3;

  return (
    <div className="loading-spinner-container">
      <div
        className="loading-spinner"
        role="status"
        style={{
          width: dimension,
          height: dimension,
          border: `${borderWidth}px solid #e0e0e0`,
          borderTopColor: "#3b82f6",
          borderRadius: "50%",
          animation: "loading-spin 0.8s linear infinite",
        }}
      />
      {label && <span className="loading-spinner-label">{label}</span>}
    </div>
  );
}
