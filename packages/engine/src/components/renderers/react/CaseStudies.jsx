import { onImgError } from './imgFallback'

export function CaseStudies({ title, studies = [] }) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {studies.map((study, index) => (
          <a
            key={index}
            href={study.href || "#"}
            className="group block bg-[var(--surface,#fff)] rounded-2xl border border-[var(--border,#e5e7eb)] overflow-hidden no-underline text-[var(--text,#1c1c1c)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            {study.image && (
              <div className="overflow-hidden aspect-[16/10]">
                <img
                  src={study.image}
                  alt={study.title || ""}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={e => onImgError(e, 600, 400)}
                />
              </div>
            )}
            <div className="p-6 lg:p-8">
              {study.client && (
                <span
                  className="inline-block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "var(--accent, #3b82f6)" }}
                >
                  {study.client}
                </span>
              )}
              {study.title && (
                <h3 className="text-lg font-semibold mb-2 leading-snug m-0">
                  {study.title}
                </h3>
              )}
              {study.description && (
                <p className="text-sm text-[var(--muted,#6b7280)] leading-relaxed m-0">
                  {study.description}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
