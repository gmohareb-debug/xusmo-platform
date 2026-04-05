import React from "react";

export function FeatureComparison({ title, features = [], plans = [] }) {
  return (
    <section className="feature-comparison">
      {title && <h2 className="feature-comparison-title">{title}</h2>}
      <div className="feature-comparison-table-wrapper">
        <table className="feature-comparison-table">
          <thead>
            <tr>
              <th className="feature-comparison-header">Feature</th>
              {plans.map((plan, index) => (
                <th key={index} className="feature-comparison-header">
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature, fIndex) => (
              <tr key={fIndex} className="feature-comparison-row">
                <td className="feature-comparison-label">{feature}</td>
                {plans.map((plan, pIndex) => {
                  const value =
                    plan.values && plan.values[fIndex] !== undefined
                      ? plan.values[fIndex]
                      : false;
                  return (
                    <td key={pIndex} className="feature-comparison-value">
                      {typeof value === "boolean"
                        ? value
                          ? "\u2713"
                          : "\u2014"
                        : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
