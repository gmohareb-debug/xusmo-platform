import { onImgError } from './imgFallback'

export function ProductDetail({ images = [], name, price, description, specs = [], inStock }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      <div>
        {images.length > 0 && (
          <div className="rounded-2xl overflow-hidden mb-4">
            <img
              className="w-full h-auto object-cover aspect-square"
              src={images[0]}
              alt={name}
              onError={e => onImgError(e, 600, 600)}
            />
          </div>
        )}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {images.map((src, index) => (
              <div key={index} className="rounded-xl overflow-hidden border border-[var(--border,#e5e7eb)] cursor-pointer hover:ring-2 hover:ring-[var(--accent,#3b82f6)] transition-all">
                <img
                  className="w-full h-full object-cover aspect-square"
                  src={src}
                  alt={`${name} ${index + 1}`}
                  onError={e => onImgError(e, 150, 150)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-6">
        <h1
          className="text-3xl md:text-4xl font-bold text-[var(--text,#1c1c1c)] m-0"
          style={{ fontFamily: "var(--font-heading, inherit)" }}
        >
          {name}
        </h1>
        <p className="text-2xl font-bold text-[var(--text,#1c1c1c)]">{price}</p>
        <div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
              inStock
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${inStock ? "bg-emerald-500" : "bg-red-500"}`} />
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>
        {description && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted,#6b7280)] mb-2">Description</h3>
            <p className="text-base text-[var(--muted,#6b7280)] leading-relaxed m-0">{description}</p>
          </div>
        )}
        {specs.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted,#6b7280)] mb-3">Specifications</h3>
            <div className="rounded-xl border border-[var(--border,#e5e7eb)] overflow-hidden">
              {specs.map((spec, index) => (
                <div
                  key={index}
                  className={`flex items-center p-3.5 text-sm ${index % 2 === 0 ? "bg-[var(--surface,#f8f9fa)]" : ""} ${index < specs.length - 1 ? "border-b border-[var(--border,#e5e7eb)]" : ""}`}
                >
                  <span className="font-medium text-[var(--text,#1c1c1c)] w-1/3">{spec.label}</span>
                  <span className="text-[var(--muted,#6b7280)]">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
