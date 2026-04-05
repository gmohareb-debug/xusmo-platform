import { onImgError } from './imgFallback'

export function TrustBadges({ title, logos }) {
  if (!logos || logos.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto">
      {title && (
        <div className="text-center mb-10">
          <h2 className="text-sm md:text-base font-medium uppercase tracking-widest text-[var(--muted,#6b7280)]">
            {title}
          </h2>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
        {logos.map((logo, index) => (
          <div key={index} className="flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
            <img
              className="h-10 md:h-12 w-auto object-contain"
              src={logo.src}
              alt={logo.alt || "Partner logo"}
              onError={e => onImgError(e, 120, 40)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
