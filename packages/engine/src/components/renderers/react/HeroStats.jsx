export function HeroStats({ stats }) {
  if (!stats || stats.length === 0) return null;

  return (
    <section className="hero-stats">
      <div className="hero-stats-row flex flex-wrap items-center justify-center gap-8 md:gap-16 py-8 md:py-12 border-y border-[var(--border,#e5e7eb)]">
        {stats.map((stat, index) => (
          <div key={index} className="hero-stats-item flex flex-col items-center text-center gap-1">
            <span className="hero-stats-value text-3xl md:text-4xl font-bold text-[var(--accent,#1f4dff)] leading-none tracking-tight">
              {stat.value}
            </span>
            <span className="hero-stats-label text-sm text-[var(--muted,#6b7280)] font-medium">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
