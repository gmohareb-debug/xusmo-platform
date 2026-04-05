export function FeatureComparison({ title, features = [], plans = [] }) {
  return (
    <section className="max-w-5xl mx-auto">
      {title && (
        <div className="text-center mb-14">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text,#1c1c1c)]"
            style={{ fontFamily: "var(--font-heading, inherit)" }}
          >
            {title}
          </h2>
        </div>
      )}
      <div className="overflow-x-auto rounded-2xl border border-[var(--border,#e5e7eb)]">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[var(--surface,#f8f9fa)]">
              <th className="text-left p-4 md:p-5 font-semibold text-[var(--text,#1c1c1c)] border-b border-[var(--border,#e5e7eb)]">
                Feature
              </th>
              {plans.map((plan, index) => (
                <th
                  key={index}
                  className="text-center p-4 md:p-5 font-semibold text-[var(--text,#1c1c1c)] border-b border-[var(--border,#e5e7eb)]"
                >
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature, fIndex) => (
              <tr
                key={fIndex}
                className="border-b border-[var(--border,#e5e7eb)] last:border-b-0 hover:bg-[var(--surface,#f8f9fa)]/50 transition-colors"
              >
                <td className="p-4 md:p-5 text-[var(--text,#1c1c1c)] font-medium">
                  {feature}
                </td>
                {plans.map((plan, pIndex) => {
                  const value =
                    plan.values && plan.values[fIndex] !== undefined
                      ? plan.values[fIndex]
                      : false;
                  return (
                    <td key={pIndex} className="text-center p-4 md:p-5">
                      {typeof value === "boolean" ? (
                        value ? (
                          <svg className="w-5 h-5 mx-auto" style={{ color: "var(--accent, #3b82f6)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-[var(--muted,#6b7280)]">&mdash;</span>
                        )
                      ) : (
                        <span className="text-[var(--text,#1c1c1c)]">{value}</span>
                      )}
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
