type Variant = "solid" | "outline" | "gradient" | "pulse";

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  solid:
    "bg-primary-100 text-primary-700",
  outline:
    "border border-primary-300 text-primary-600",
  gradient:
    "bg-gradient-to-r from-primary-500 to-primary-400 text-white",
  pulse:
    "bg-accent-100 text-accent-700 animate-pulse",
};

export default function Badge({
  children,
  variant = "solid",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
