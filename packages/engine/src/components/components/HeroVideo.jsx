export function HeroVideo({ title, subtitle, videoUrl, cta, ctaHref }) {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video background */}
      <div className="absolute inset-0 z-0">
        {videoUrl && (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            crossOrigin="anonymous"
          />
        )}
        {/* Dark gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 lg:px-12 py-32 md:py-40 max-w-[920px] mx-auto">
        {title && (
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-8 text-white"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-12 text-white" style={{ opacity: 0.85 }}>
            {subtitle}
          </p>
        )}
        {cta && (
          <a
            href={ctaHref || '#cta'}
            className="inline-flex items-center px-8 py-4 text-base font-semibold rounded-full text-white no-underline hover:-translate-y-0.5 transition-all duration-300"
            style={{
              background: 'var(--accent, #3b82f6)',
              boxShadow: '0 8px 32px -4px var(--accent, #3b82f6)',
            }}
          >
            {cta}
          </a>
        )}
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.6))' }}
      />
    </section>
  );
}
