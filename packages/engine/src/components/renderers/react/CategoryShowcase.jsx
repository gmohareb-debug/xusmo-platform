import { onImgError } from './imgFallback'

export function CategoryShowcase({ title, categories }) {
  return (
    <section className="max-w-6xl mx-auto">
      {title && (
        <div className="text-center mb-14">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text,#1c1c1c)]"
            style={{ fontFamily: "var(--font-heading, inherit)" }}
          >
            {title}
          </h2>
        </div>
      )}
      {categories && categories.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((cat, index) => (
            <a
              key={index}
              className="group relative block aspect-[4/3] rounded-2xl overflow-hidden no-underline"
              href={cat.href || "#"}
            >
              {cat.image && (
                <img
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  src={cat.image}
                  alt={cat.name || ""}
                  onError={e => onImgError(e, 400, 300)}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {cat.name && (
                <span className="absolute bottom-4 left-4 right-4 text-white font-semibold text-base md:text-lg drop-shadow-lg">
                  {cat.name}
                </span>
              )}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
