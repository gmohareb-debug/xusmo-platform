import { onImgError } from './imgFallback'

export function ContentCard({ image, title, description, link }) {
  return (
    <div className="bg-[var(--surface,#fff)] rounded-2xl border border-[var(--border,#e5e7eb)] overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {image && (
        <div className="overflow-hidden aspect-[16/10]">
          <img
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            src={image}
            alt={title || ""}
            onError={e => onImgError(e, 400, 300)}
          />
        </div>
      )}
      <div className="p-6 lg:p-8">
        {title && (
          <h3 className="text-lg font-semibold text-[var(--text,#1c1c1c)] mb-2 m-0 leading-snug">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-[var(--muted,#6b7280)] leading-relaxed m-0 mb-4">
            {description}
          </p>
        )}
        {link && link.href && (
          <a
            className="inline-flex items-center gap-1.5 text-sm font-semibold no-underline hover:gap-2.5 transition-all duration-200"
            style={{ color: "var(--accent, #3b82f6)" }}
            href={link.href}
          >
            {link.label || "Read more"}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
