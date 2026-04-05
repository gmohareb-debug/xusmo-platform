import { onImgError } from './imgFallback'

export function ProductCard({ image, name, price, originalPrice, badge, href }) {
  const cardContent = (
    <div className="group bg-[var(--surface,#fff)] rounded-2xl border border-[var(--border,#e5e7eb)] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative overflow-hidden aspect-square">
        {badge && (
          <span
            className="absolute top-3 left-3 z-10 inline-block px-3 py-1 text-xs font-bold text-white rounded-full"
            style={{ background: "var(--accent, #3b82f6)" }}
          >
            {badge}
          </span>
        )}
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={image}
          alt={name || "Product"}
          onError={e => onImgError(e, 400, 400)}
        />
      </div>
      <div className="p-5">
        <h3 className="text-base font-semibold text-[var(--text,#1c1c1c)] mb-2 m-0 leading-snug line-clamp-2">
          {name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-[var(--text,#1c1c1c)]">{price}</span>
          {originalPrice && (
            <span className="text-sm text-[var(--muted,#6b7280)] line-through">
              {originalPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a className="block no-underline" href={href}>
        {cardContent}
      </a>
    );
  }

  return cardContent;
}
