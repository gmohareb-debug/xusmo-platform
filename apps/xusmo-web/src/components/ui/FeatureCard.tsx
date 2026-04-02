import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  className = "",
}: FeatureCardProps) {
  return (
    <div
      className={`
        group rounded-2xl bg-white border border-surface-border p-6
        shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover
        ${className}
      `}
    >
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors duration-300 group-hover:bg-primary-600 group-hover:text-white">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-display text-lg font-semibold text-neutral-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>
    </div>
  );
}
