import { Star } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  name: string;
  business: string;
  industry: string;
  rating?: number;
  className?: string;
}

export default function TestimonialCard({
  quote,
  name,
  business,
  industry,
  rating = 5,
  className = "",
}: TestimonialCardProps) {
  return (
    <div
      className={`
        rounded-2xl bg-white border border-surface-border p-6 sm:p-8
        shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover
        ${className}
      `}
    >
      {/* Stars */}
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating
                ? "fill-accent-400 text-accent-400"
                : "fill-neutral-200 text-neutral-200"
            }`}
          />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-neutral-700 leading-relaxed mb-6">
        &ldquo;{quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-neutral-900 text-sm">{name}</p>
          <p className="text-neutral-500 text-xs">
            {business} &middot; {industry}
          </p>
        </div>
      </div>
    </div>
  );
}
