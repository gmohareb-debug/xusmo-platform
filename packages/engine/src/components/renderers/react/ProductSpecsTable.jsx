import React from "react";

export function ProductSpecsTable({ title = "Specifications", specs = [] }) {
  if (specs.length === 0) {
    return null;
  }

  return (
    <div className="product-specs-table">
      {title && <h3 className="product-specs-title">{title}</h3>}
      <table className="product-specs">
        <tbody>
          {specs.map((spec, index) => (
            <tr
              key={index}
              className={
                index % 2 === 0
                  ? "product-specs-row-even"
                  : "product-specs-row-odd"
              }
            >
              <td className="product-specs-label">{spec.label}</td>
              <td className="product-specs-value">{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
