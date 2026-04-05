export function Pricing({ title, plans = [] }) {
  return (
    <section>
      {title && (
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text,#1c1c1c)] mb-4"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            {title}
          </h2>
          <div className="mx-auto w-12 h-1 rounded-full mt-4" style={{ background: 'var(--accent, #3b82f6)' }} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {plans.map((plan, index) => {
          const isFeatured = plan.featured || plan.popular || index === 1
          return (
            <div
              key={plan.name || index}
              className={`relative rounded-2xl p-8 lg:p-10 text-center border transition-all duration-500 hover:-translate-y-1 ${
                isFeatured
                  ? 'border-[var(--accent,#3b82f6)] scale-105 bg-[var(--surface,#fff)]'
                  : 'border-[var(--border,#e5e7eb)] bg-[var(--surface,#fff)]'
              }`}
              style={{
                boxShadow: isFeatured
                  ? '0 20px 60px rgba(0,0,0,0.12)'
                  : '0 1px 3px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.12)' }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = isFeatured ? '0 20px 60px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              {isFeatured && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider"
                  style={{ background: 'var(--accent, #3b82f6)' }}
                >
                  Most Popular
                </div>
              )}

              {plan.name && (
                <h3 className="text-lg font-semibold text-[var(--text,#1c1c1c)] mb-2 m-0">{plan.name}</h3>
              )}

              {plan.price && (
                <div className="my-6">
                  <span
                    className="text-4xl md:text-5xl font-bold tracking-tight"
                    style={{ color: 'var(--accent, #3b82f6)' }}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-[var(--muted,#6b7280)] ml-1">/{plan.period}</span>
                  )}
                </div>
              )}

              {plan.description && (
                <p className="text-sm text-[var(--muted,#6b7280)] leading-relaxed mb-6 m-0">{plan.description}</p>
              )}

              {plan.features && plan.features.length > 0 && (
                <ul className="list-none p-0 m-0 mb-8 space-y-3 text-left">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-3 text-sm text-[var(--text,#1c1c1c)]">
                      <span className="shrink-0 mt-0.5" style={{ color: 'var(--accent, #3b82f6)' }}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {typeof f === 'string' ? f : f.label || f.name || ''}
                    </li>
                  ))}
                </ul>
              )}

              {(plan.ctaLabel || plan.cta) && (
                <a
                  href={plan.ctaHref || plan.href || '#contact'}
                  className={`inline-flex items-center justify-center w-full px-6 py-3.5 rounded-full text-sm font-semibold no-underline transition-all duration-300 hover:-translate-y-0.5 ${
                    isFeatured
                      ? 'text-white'
                      : 'border-2 border-[var(--border,#e5e7eb)] text-[var(--text,#1c1c1c)] hover:border-[var(--accent,#3b82f6)]'
                  }`}
                  style={isFeatured ? {
                    background: 'var(--accent, #3b82f6)',
                    boxShadow: '0 4px 14px -2px var(--accent, #3b82f6)',
                  } : {}}
                >
                  {plan.ctaLabel || plan.cta || 'Get Started'}
                </a>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
