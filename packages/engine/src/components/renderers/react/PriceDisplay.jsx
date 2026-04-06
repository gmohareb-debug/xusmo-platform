export function PriceDisplay({ price, originalPrice, currency = '$', period }) {
  return (
    <div className="flex items-baseline flex-wrap gap-2">
      <span className="flex items-baseline">
        <span className="text-sm font-medium" style={{ color: 'var(--text, #1c1c1c)' }}>
          {currency}
        </span>
        <span
          className="text-2xl md:text-3xl font-bold"
          style={{ color: 'var(--text, #1c1c1c)' }}
        >
          {price}
        </span>
      </span>
      {originalPrice && (
        <span className="flex items-baseline line-through" style={{ color: 'var(--muted, #6b7280)' }}>
          <span className="text-xs">{currency}</span>
          <span className="text-base">{originalPrice}</span>
        </span>
      )}
      {period && (
        <span className="text-sm" style={{ color: 'var(--muted, #6b7280)' }}>
          /{period}
        </span>
      )}
    </div>
  );
}
