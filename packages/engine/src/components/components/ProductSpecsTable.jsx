import React from "react";

export function ProductSpecsTable({ title = "Specifications", specs = [] }) {
  if (specs.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {title && (
        <h3
          className="text-xl md:text-2xl font-bold mb-4"
          style={{ color: 'var(--text, #1c1c1c)', fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h3>
      )}
      <div className="overflow-hidden rounded-xl" style={{ border: '1px solid var(--border, #e5e7eb)' }}>
        <table className="w-full text-sm">
          <tbody>
            {specs.map((spec, index) => (
              <tr
                key={index}
                style={{
                  backgroundColor: index % 2 === 0 ? 'var(--surface, #fff)' : 'transparent',
                  borderBottom: index < specs.length - 1 ? '1px solid var(--border, #e5e7eb)' : 'none',
                }}
              >
                <td
                  className="px-4 py-3 font-medium w-2/5"
                  style={{ color: 'var(--muted, #6b7280)' }}
                >
                  {spec.label}
                </td>
                <td
                  className="px-4 py-3"
                  style={{ color: 'var(--text, #1c1c1c)' }}
                >
                  {spec.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
