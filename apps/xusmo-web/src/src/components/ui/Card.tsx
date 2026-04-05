interface CardProps {
  children: React.ReactNode;
  glass?: boolean;
  hover?: boolean;
  className?: string;
}

export default function Card({
  children,
  glass = false,
  hover = true,
  className = "",
}: CardProps) {
  return (
    <div
      className={`
        rounded-2xl p-6
        ${
          glass
            ? "bg-white/5 backdrop-blur-xl border border-white/10"
            : "bg-white border border-surface-border"
        }
        ${
          hover
            ? "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-card-hover"
            : ""
        }
        shadow-card
        ${className}
      `}
    >
      {children}
    </div>
  );
}
