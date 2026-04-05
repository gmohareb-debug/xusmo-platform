export function HeroStats({ stats }) {
  if (!stats || stats.length === 0) return null;

  return (
    <section className="relative">
      <div className="flex flex-wrap items-stretch justify-center">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center">
            {/* Divider between stats */}
            {index > 0 && (
              <div className="hidden sm:block w-px h-16 mx-8 md:mx-14 bg-[var(--border,#e5e7eb)]" />
            )}
            <div className="flex flex-col items-center text-center px-6 py-4">
              <span
                className="text-4xl md:text-5xl font-bold leading-none tracking-tight"
                style={{ color: 'var(--accent, #3b82f6)' }}
              >
                {stat.value}
              </span>
              <span className="text-sm text-[var(--muted,#6b7280)] font-medium mt-2 uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
