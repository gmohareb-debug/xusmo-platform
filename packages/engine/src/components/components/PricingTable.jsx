export function PricingTable({ title, plans = [] }) {
  return (
    <section className="max-w-6xl mx-auto">
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
      <div className={`grid gap-6 lg:gap-8 ${plans.length <= 3 ? `grid-cols-1 md:grid-cols-${plans.length}` : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`relative flex flex-col rounded-2xl border p-8 lg:p-10 transition-all duration-300 ${
              plan.highlighted
                ? "border-[var(--accent,#3b82f6)] bg-[var(--accent,#3b82f6)]/[0.03] shadow-xl scale-[1.02] ring-2 ring-[var(--accent,#3b82f6)]/20"
                : "border-[var(--border,#e5e7eb)] bg-[var(--surface,#fff)] hover:shadow-lg hover:-translate-y-1"
            }`}
          >
            {plan.highlighted && (
              <span
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-block px-4 py-1 text-xs font-bold uppercase tracking-wider text-white rounded-full"
                style={{ background: "var(--accent, #3b82f6)" }}
              >
                {plan.badge || "Recommended"}
              </span>
            )}
            <h3 className="text-lg font-semibold text-[var(--text,#1c1c1c)] mb-2">
              {plan.name}
            </h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl md:text-5xl font-bold text-[var(--text,#1c1c1c)] tracking-tight">
                {plan.price}
              </span>
              {plan.period && (
                <span className="text-sm text-[var(--muted,#6b7280)]">
                  {plan.period}
                </span>
              )}
            </div>
            {plan.features && plan.features.length > 0 && (
              <ul className="flex-1 space-y-3 mb-8 list-none p-0 m-0">
                {plan.features.map((feature, fIndex) => (
                  <li
                    key={fIndex}
                    className="flex items-start gap-3 text-sm text-[var(--muted,#6b7280)]"
                  >
                    <svg className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--accent, #3b82f6)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            )}
            {plan.cta && (
              <a
                className={`mt-auto inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold no-underline transition-all duration-200 ${
                  plan.highlighted
                    ? "text-white hover:opacity-90 hover:-translate-y-0.5 shadow-lg"
                    : "border-2 border-[var(--border,#e5e7eb)] text-[var(--text,#1c1c1c)] hover:border-[var(--accent,#3b82f6)] hover:text-[var(--accent,#3b82f6)]"
                }`}
                style={plan.highlighted ? { background: "var(--accent, #3b82f6)" } : undefined}
                href={plan.ctaHref || "#contact"}
              >
                {plan.cta}
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
