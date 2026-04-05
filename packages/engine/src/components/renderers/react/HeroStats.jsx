export function HeroStats({ stats, layout = 'row' }) {
  if (!stats || stats.length === 0) return null

  // ── Cards: boxed stat cards with accent border ──
  if (layout === 'cards') {
    return (
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-[var(--surface,#fff)] rounded-2xl p-6 lg:p-8 text-center border border-[var(--border,#e5e7eb)]" style={{ borderTop: '4px solid var(--accent, #3b82f6)' }}>
              <span className="block text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--accent, #3b82f6)' }}>
                {stat.value}
              </span>
              <span className="block text-sm text-[var(--muted,#6b7280)] font-medium mt-2 uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>
    )
  }

  // ── Banner: colored background strip ──
  if (layout === 'banner') {
    return (
      <section className="-mx-5 md:-mx-8 lg:-mx-12 px-5 md:px-8 lg:px-12 py-10 rounded-2xl" style={{ background: 'var(--accent, #3b82f6)' }}>
        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <span className="block text-4xl md:text-5xl font-bold text-white tracking-tight">{stat.value}</span>
              <span className="block text-sm text-white/70 font-medium mt-2 uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>
    )
  }

  // ── Row (default): inline divider style ──
  return (
    <section className="relative">
      <div className="flex flex-wrap items-stretch justify-center">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <div className="hidden sm:block w-px h-16 mx-8 md:mx-14 bg-[var(--border,#e5e7eb)]" />}
            <div className="flex flex-col items-center text-center px-6 py-4">
              <span className="text-4xl md:text-5xl font-bold leading-none tracking-tight" style={{ color: 'var(--accent, #3b82f6)' }}>{stat.value}</span>
              <span className="text-sm text-[var(--muted,#6b7280)] font-medium mt-2 uppercase tracking-wider">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
