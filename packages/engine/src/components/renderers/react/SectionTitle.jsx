export function SectionTitle({ eyebrow, title, subtitle, layout = 'center' }) {

  // ── Left-aligned ──
  if (layout === 'left') {
    return (
      <div className="max-w-3xl mb-16">
        {eyebrow && (
          <span className="inline-block uppercase tracking-[0.2em] text-xs font-semibold mb-4" style={{ color: 'var(--accent, #3b82f6)' }}>
            {eyebrow}
          </span>
        )}
        {title && (
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-[var(--text,#1c1c1c)]" style={{ fontFamily: 'var(--font-heading, inherit)' }}>
            {title}
          </h2>
        )}
        <div className="w-10 h-1 rounded-full mb-5" style={{ background: 'var(--accent, #3b82f6)' }} />
        {subtitle && (
          <p className="text-lg text-[var(--muted,#6b7280)] leading-relaxed m-0">{subtitle}</p>
        )}
      </div>
    )
  }

  // ── Split: title left, subtitle right ──
  if (layout === 'split') {
    return (
      <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-16 mb-16">
        <div className="md:flex-1">
          {eyebrow && (
            <span className="inline-block uppercase tracking-[0.2em] text-xs font-semibold mb-4" style={{ color: 'var(--accent, #3b82f6)' }}>
              {eyebrow}
            </span>
          )}
          {title && (
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight m-0 text-[var(--text,#1c1c1c)]" style={{ fontFamily: 'var(--font-heading, inherit)' }}>
              {title}
            </h2>
          )}
        </div>
        {subtitle && (
          <p className="md:flex-1 text-lg text-[var(--muted,#6b7280)] leading-relaxed m-0 md:max-w-md">
            {subtitle}
          </p>
        )}
      </div>
    )
  }

  // ── Center (default) ──
  return (
    <div className="text-center max-w-3xl mx-auto mb-16">
      {eyebrow && (
        <span className="inline-block uppercase tracking-[0.2em] text-xs font-semibold mb-5" style={{ color: 'var(--accent, #3b82f6)' }}>
          {eyebrow}
        </span>
      )}
      {title && (
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5 text-[var(--text,#1c1c1c)]" style={{ fontFamily: 'var(--font-heading, inherit)' }}>
          {title}
        </h2>
      )}
      <div className="mx-auto w-10 h-1 rounded-full mb-5" style={{ background: 'var(--accent, #3b82f6)' }} />
      {subtitle && (
        <p className="text-lg text-[var(--muted,#6b7280)] leading-relaxed max-w-2xl mx-auto m-0">{subtitle}</p>
      )}
    </div>
  )
}
