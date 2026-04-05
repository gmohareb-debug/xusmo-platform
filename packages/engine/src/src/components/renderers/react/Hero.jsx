export function Hero({ variant = 'text', title, subtitle, cta, ctaSecondary, ctaHref, ctaSecondaryHref, imageUrl, videoUrl, icon, eyebrow }) {
  const isMedia = variant === 'video' || variant === 'image'

  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${isMedia ? 'text-white' : 'text-[var(--text,#1c1c1c)]'}`}>
      {/* Background — media variants */}
      {isMedia && (
        <div className="absolute inset-0 z-0">
          {variant === 'video' && videoUrl && (
            <video
              className="absolute inset-0 w-full h-full object-cover"
              src={videoUrl}
              autoPlay
              muted
              loop
              playsInline
            />
          )}
          {variant === 'image' && imageUrl && (
            <img
              className="absolute inset-0 w-full h-full object-cover"
              src={imageUrl}
              alt={title || ''}
              loading="eager"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement.style.background = 'linear-gradient(135deg, var(--accent, #3b82f6), #1a1a2e)';
              }}
            />
          )}
          {/* Multi-stop cinematic overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
        </div>
      )}

      {/* Gradient mesh background — text variant */}
      {!isMedia && (
        <div className="absolute inset-0 -z-10 overflow-hidden" style={{ background: 'var(--bg, #ffffff)' }}>
          <div
            className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] rounded-full opacity-[0.08] blur-[120px]"
            style={{ background: 'var(--accent, #3b82f6)' }}
          />
          <div
            className="absolute -bottom-[15%] -left-[15%] w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[100px]"
            style={{ background: 'var(--accent, #3b82f6)' }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.04] blur-[80px]"
            style={{ background: 'linear-gradient(135deg, var(--accent, #3b82f6), #a855f7)' }}
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-[920px] mx-auto px-6 lg:px-12 py-32 md:py-40 text-center">
        {icon && !isMedia && (
          <div className="mb-8 text-5xl" dangerouslySetInnerHTML={{ __html: icon }} />
        )}

        {eyebrow && (
          <div className="mb-6 flex items-center justify-center">
            <span
              className="inline-block uppercase tracking-[0.2em] text-sm font-medium pb-2"
              style={{
                color: isMedia ? 'rgba(255,255,255,0.9)' : 'var(--accent, #3b82f6)',
                borderBottom: isMedia ? '2px solid rgba(255,255,255,0.3)' : '2px solid var(--accent, #3b82f6)',
              }}
            >
              {eyebrow}
            </span>
          </div>
        )}

        {title && (
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-8"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            {title}
          </h1>
        )}

        {subtitle && (
          <p className={`text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-12 ${isMedia ? 'text-white/85' : 'text-[var(--muted,#6b7280)]'}`}>
            {subtitle}
          </p>
        )}

        {(cta || ctaSecondary) && (
          <div className="flex flex-wrap items-center justify-center gap-5">
            {cta && (
              <a
                href={ctaHref || '#products'}
                className="inline-flex items-center px-8 py-4 text-base font-semibold rounded-full text-white no-underline hover:-translate-y-0.5 transition-all duration-300"
                style={{
                  background: 'var(--accent, #3b82f6)',
                  boxShadow: '0 8px 32px -4px var(--accent, #3b82f6)',
                }}
              >
                {cta}
              </a>
            )}
            {ctaSecondary && (
              <a
                href={ctaSecondaryHref || '#features'}
                className={`inline-flex items-center px-8 py-4 text-base font-semibold rounded-full no-underline border-2 transition-all duration-300 hover:-translate-y-0.5 ${isMedia ? 'border-white/30 text-white hover:bg-white/10 hover:border-white/50' : 'border-[var(--border,#e5e7eb)] text-[var(--text,#1c1c1c)] hover:border-[var(--accent,#3b82f6)] hover:shadow-lg'}`}
              >
                {ctaSecondary}
              </a>
            )}
          </div>
        )}
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 z-10 pointer-events-none"
        style={{
          background: isMedia
            ? 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.6))'
            : 'linear-gradient(to bottom, transparent, var(--bg, #ffffff))',
        }}
      />
    </section>
  )
}
