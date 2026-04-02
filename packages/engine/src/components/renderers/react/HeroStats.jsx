export function HeroStats({ stats }) {
  if (!stats || stats.length === 0) return null;

  return (
    <section className="hero-stats">
      <div className="hero-stats-row">
        {stats.map((stat, index) => (
          <div key={index} className="hero-stats-item">
            <span className="hero-stats-value">{stat.value}</span>
            <span className="hero-stats-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
