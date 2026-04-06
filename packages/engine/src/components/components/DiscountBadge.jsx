export function DiscountBadge({ text, type = 'sale' }) {
  const colors = {
    sale: { bg: '#ef4444', color: '#fff' },
    new: { bg: 'var(--accent, #3b82f6)', color: '#fff' },
    hot: { bg: '#f97316', color: '#fff' },
  };
  const scheme = colors[type] || colors.sale;

  return (
    <span
      className="inline-block px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wide"
      style={{ backgroundColor: scheme.bg, color: scheme.color }}
    >
      {text}
    </span>
  );
}
