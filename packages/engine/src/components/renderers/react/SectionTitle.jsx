export function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="section-title text-center max-w-2xl mx-auto mb-12">
      {eyebrow && (
        <span className="section-title-eyebrow inline-block uppercase tracking-[0.2em] text-xs font-medium text-[var(--accent,#1f4dff)] mb-3">
          {eyebrow}
        </span>
      )}
      {title && (
        <h2 className="section-title-heading text-3xl md:text-4xl font-bold tracking-tight mb-4"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}>
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="section-title-subtitle text-base md:text-lg text-[var(--muted,#6b7280)] leading-relaxed max-w-xl mx-auto m-0">
          {subtitle}
        </p>
      )}
    </div>
  );
}
