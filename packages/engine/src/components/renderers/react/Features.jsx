export function Features({ title, items = [] }) {
  const isRich = items.length > 0 && typeof items[0] === 'object'

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

      {isRich ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {items.map((item, i) => (
            <div
              key={i}
              className="bg-[var(--surface,#fff)] rounded-2xl p-8 lg:p-10 border border-[var(--border,#e5e7eb)] hover:-translate-y-1 transition-all duration-500 group"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)' }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              {item.icon && (
                <span className="block text-3xl mb-5">{item.icon}</span>
              )}
              {item.title && (
                <h3 className="text-lg font-semibold mb-3 leading-snug m-0 text-[var(--text,#1c1c1c)]">
                  {item.title}
                </h3>
              )}
              {item.description && (
                <p className="text-[15px] text-[var(--muted,#6b7280)] leading-relaxed m-0">
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 justify-center">
          {items.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[var(--surface,#fff)] rounded-xl border border-[var(--border,#e5e7eb)] text-sm font-medium text-[var(--text,#1c1c1c)] hover:-translate-y-0.5 transition-all duration-300"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              <span style={{ color: 'var(--accent, #3b82f6)' }} className="font-bold">&#10003;</span>
              {item}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}
