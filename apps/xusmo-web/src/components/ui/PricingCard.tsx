import Badge from "./Badge";
import Button from "./Button";

interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
  badge?: string;
  note?: string;
  className?: string;
}

export default function PricingCard({
  name,
  price,
  period = "/mo",
  description,
  features,
  cta,
  ctaHref,
  highlighted = false,
  badge,
  note,
  className = "",
}: PricingCardProps) {
  return (
    <div
      className={`
        relative rounded-2xl p-8 bg-white border
        border-surface-border shadow-sm hover:-translate-y-1 hover:shadow-lg
        transition-all duration-300
        h-full flex flex-col
        ${className}
      `}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="gradient">{badge}</Badge>
        </div>
      )}

      <h3 className="font-display text-xl font-bold text-neutral-900 mb-2">
        {name}
      </h3>
      <p className="text-sm text-neutral-500 mb-6">{description}</p>

      <div className="mb-6">
        <span className="font-display text-4xl font-bold text-neutral-900">
          {price}
        </span>
        {period && (
          <span className="text-neutral-500 text-sm ml-1">{period}</span>
        )}
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-3 text-sm text-neutral-600"
          >
            <svg
              className="h-5 w-5 shrink-0 text-primary-500 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <a href={ctaHref} className="block mt-auto">
        <button
          className="w-full rounded-xl px-8 py-4 text-base font-semibold transition-all duration-300"
          style={{ backgroundColor: "#4F46E5", color: "#ffffff" }}
        >
          {cta} &rarr;
        </button>
      </a>

      {note && (
        <p className="mt-3 text-xs text-neutral-400 text-center">{note}</p>
      )}
    </div>
  );
}
