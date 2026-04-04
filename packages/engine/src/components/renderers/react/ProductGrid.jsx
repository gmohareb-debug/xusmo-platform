import { onImgError } from './imgFallback'

export function ProductGrid({ title, products = [] }) {
  return (
    <section>
      {title && (
        <div className="text-center mb-14">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text,#1c1c1c)]"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            {title}
          </h2>
        </div>
      )}

      {products.length === 0 && (
        <p className="text-center text-[var(--muted,#6b7280)] py-16 text-lg">No products to display.</p>
      )}

      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product, index) => (
            <a
              key={index}
              className="group block bg-[var(--surface,#fff)] rounded-2xl border border-[var(--border,#e5e7eb)] overflow-hidden no-underline text-[var(--text,#1c1c1c)] hover:-translate-y-1.5 transition-all duration-500"
              href={product.href || '#'}
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 20px 40px -12px rgba(0,0,0,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
            >
              {product.image && (
                <div className="aspect-square overflow-hidden bg-gray-50">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    src={product.image}
                    alt={product.name || ''}
                    onError={e => onImgError(e, 400, 400)}
                  />
                </div>
              )}
              <div className="p-6 space-y-3">
                {product.name && (
                  <h3 className="text-base font-semibold leading-snug m-0">{product.name}</h3>
                )}
                {product.price && (
                  <span className="block text-xl font-bold" style={{ color: 'var(--accent, #3b82f6)' }}>
                    {product.price}
                  </span>
                )}
                {product.description && (
                  <p className="text-sm text-[var(--muted,#6b7280)] leading-relaxed m-0 line-clamp-2">{product.description}</p>
                )}
                <div className="flex items-center justify-between pt-3">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all duration-300" style={{ color: 'var(--accent, #3b82f6)' }}>
                    {product.ctaLabel || 'View Details'}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  {product.cartLabel && (
                    <button
                      className="text-xs font-semibold px-4 py-2 rounded-full border-none cursor-pointer transition-all duration-300"
                      style={{
                        background: 'var(--accent, #3b82f6)',
                        color: '#fff',
                        opacity: 0.9,
                      }}
                      onMouseEnter={(e) => { e.target.style.opacity = '1'; e.target.style.transform = 'scale(1.05)'; }}
                      onMouseLeave={(e) => { e.target.style.opacity = '0.9'; e.target.style.transform = 'scale(1)'; }}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
                    >
                      {product.cartLabel}
                    </button>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
