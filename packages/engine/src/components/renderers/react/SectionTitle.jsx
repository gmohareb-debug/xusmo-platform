export function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="section-title">
      {eyebrow && <span className="section-title-eyebrow">{eyebrow}</span>}
      {title && <h2 className="section-title-heading">{title}</h2>}
      {subtitle && <p className="section-title-subtitle">{subtitle}</p>}
    </div>
  );
}
