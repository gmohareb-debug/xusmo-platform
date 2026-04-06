import { onImgError } from './imgFallback'

export function FeaturedContent({ title, description, image, reverse, layout = 'side', cta, ctaHref }) {

  // ── Fullbleed: image background with text overlay ──
  if (layout === 'fullbleed' && image) {
    return (
      <section className="relative min-h-[500px] flex items-center overflow-hidden rounded-2xl">
        <img src={image} alt={title || ''} className="absolute inset-0 w-full h-full object-cover" onError={e => onImgError(e, 1200, 600)} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="relative z-10 max-w-xl p-10 lg:p-16">
          {title && <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-heading, inherit)' }}>{title}</h2>}
          {description && <p className="text-lg text-white/80 leading-relaxed mb-8">{description}</p>}
          {cta && (
            <a href={ctaHref || '#contact'} className="inline-flex items-center px-8 py-4 text-base font-semibold rounded-full text-white no-underline hover:-translate-y-0.5 transition-all" style={{ background: 'var(--accent, #3b82f6)', boxShadow: '0 8px 30px -4px var(--accent, #3b82f6)' }}>
              {cta}
            </a>
          )}
        </div>
      </section>
    )
  }

  // ── Overlap: image with overlapping text card ──
  if (layout === 'overlap' && image) {
    return (
      <section className="relative">
        <div className="rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[2/1]">
          <img src={image} alt={title || ''} className="w-full h-full object-cover" onError={e => onImgError(e, 1200, 500)} />
        </div>
        <div className={`relative -mt-20 ${reverse ? 'ml-auto mr-8' : 'ml-8'} max-w-lg bg-[var(--surface,#fff)] rounded-2xl p-8 lg:p-10 shadow-2xl border border-[var(--border,#e5e7eb)]`}>
          {title && <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[var(--text,#1c1c1c)]" style={{ fontFamily: 'var(--font-heading, inherit)' }}>{title}</h2>}
          {description && <p className="text-base text-[var(--muted,#6b7280)] leading-relaxed m-0">{description}</p>}
          {cta && (
            <a href={ctaHref || '#contact'} className="inline-flex items-center gap-2 mt-6 text-sm font-semibold no-underline" style={{ color: 'var(--accent, #3b82f6)' }}>
              {cta} <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          )}
        </div>
      </section>
    )
  }

  // ── Side (default): image + text side by side ──
  return (
    <section className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${reverse ? 'lg:[direction:rtl]' : ''}`}>
      <div className={`relative ${reverse ? 'lg:[direction:ltr]' : ''}`}>
        <div className="absolute -inset-4 rounded-3xl opacity-[0.06] blur-2xl" style={{ background: 'var(--accent, #3b82f6)' }} />
        {image && (
          <div className="relative overflow-hidden rounded-2xl" style={{ boxShadow: '0 25px 60px -12px rgba(0,0,0,0.15)' }}>
            <img className="w-full h-auto object-cover aspect-[4/3]" src={image} alt={title || ""} onError={e => onImgError(e, 800, 600)} />
          </div>
        )}
      </div>
      <div className={`space-y-6 ${reverse ? 'lg:[direction:ltr]' : ''}`}>
        {title && <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight m-0 text-[var(--text,#1c1c1c)]" style={{ fontFamily: 'var(--font-heading, inherit)' }}>{title}</h2>}
        {description && <p className="text-base md:text-lg text-[var(--muted,#6b7280)] leading-relaxed m-0">{description}</p>}
        {cta && (
          <a href={ctaHref || '#contact'} className="inline-flex items-center px-7 py-3.5 text-sm font-semibold rounded-full text-white no-underline hover:-translate-y-0.5 transition-all" style={{ background: 'var(--accent, #3b82f6)' }}>
            {cta}
          </a>
        )}
      </div>
    </section>
  )
}
