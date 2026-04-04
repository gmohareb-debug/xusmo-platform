export function Hero({ variant = 'text', title, subtitle, cta, ctaSecondary, ctaHref, ctaSecondaryHref, imageUrl, videoUrl, icon, eyebrow }) {
  const isMedia = variant === 'video' || variant === 'image'

  return (
    <section className={`hero-unified hero-unified--${variant} relative min-h-[85vh] flex items-center justify-center overflow-hidden ${isMedia ? 'text-white' : 'text-[var(--text,#1c1c1c)]'}`}>
      {/* Background layer */}
      {isMedia && (
        <div className="hero-unified__bg absolute inset-0 z-0">
          {variant === 'video' && videoUrl && (
            <video
              className="hero-unified__video absolute inset-0 w-full h-full object-cover"
              src={videoUrl}
              autoPlay
              muted
              loop
              playsInline
            />
          )}
          {variant === 'image' && imageUrl && (
            <img
              className="hero-unified__image absolute inset-0 w-full h-full object-cover"
              src={imageUrl}
              alt={title || ''}
              loading="eager"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement.style.background = 'linear-gradient(135deg, var(--accent, #3b82f6), #1a1a2e)';
              }}
            />
          )}
          <div className="hero-unified__overlay absolute inset-0 bg-black/50" />
        </div>
      )}

      {/* Decorative gradient orbs for text variant */}
      {!isMedia && (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-[80vw] h-[80vw] rounded-full bg-[var(--accent,#1f4dff)]/[0.06] blur-[100px]" />
          <div className="absolute -bottom-1/3 -left-1/4 w-[60vw] h-[60vw] rounded-full bg-[var(--accent,#1f4dff)]/[0.04] blur-[80px]" />
        </div>
      )}

      {/* Content layer */}
      <div className="hero-unified__content relative z-10 max-w-[820px] mx-auto px-6 lg:px-12 py-24 md:py-32 text-center">
        {icon && !isMedia && (
          <div className="hero-unified__icon mb-6 text-5xl" dangerouslySetInnerHTML={{ __html: icon }} />
        )}
        {eyebrow && (
          <p className="hero-unified__eyebrow uppercase tracking-[0.2em] text-xs font-medium text-[var(--accent,#1f4dff)] mb-4">
            {eyebrow}
          </p>
        )}
        {title && (
          <h1 className="hero-unified__title text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6"
              style={{ fontFamily: 'var(--font-heading, inherit)' }}>
            {title}
          </h1>
        )}
        {subtitle && (
          <p className={`hero-unified__subtitle text-lg md:text-xl leading-relaxed max-w-[600px] mx-auto mb-10 ${isMedia ? 'text-white/80' : 'text-[var(--muted,#6b7280)]'}`}>
            {subtitle}
          </p>
        )}
        {(cta || ctaSecondary) && (
          <div className="hero-unified__actions flex flex-wrap items-center justify-center gap-4">
            {cta && (
              <a
                href={ctaHref || '#products'}
                className="hero-unified__cta hero-unified__cta--primary inline-flex items-center px-8 py-3.5 text-base font-semibold rounded-full bg-[var(--accent,#1f4dff)] text-white no-underline shadow-lg shadow-[var(--accent,#1f4dff)]/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[var(--accent,#1f4dff)]/30 transition-all duration-300"
              >
                {cta}
              </a>
            )}
            {ctaSecondary && (
              <a
                href={ctaSecondaryHref || '#features'}
                className={`hero-unified__cta hero-unified__cta--secondary inline-flex items-center px-8 py-3.5 text-base font-semibold rounded-full no-underline border-2 transition-all duration-300 hover:-translate-y-0.5 ${isMedia ? 'border-white/40 text-white hover:bg-white/10' : 'border-[var(--border,#e5e7eb)] text-[var(--text,#1c1c1c)] hover:border-[var(--accent,#1f4dff)]/30 hover:bg-[var(--accent,#1f4dff)]/5'}`}
              >
                {ctaSecondary}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
