interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  from?: string;
  to?: string;
}

export default function GradientText({
  children,
  className = "",
  from = "from-primary-500",
  to = "to-primary-300",
}: GradientTextProps) {
  return (
    <span
      className={`
        bg-gradient-to-r ${from} ${to}
        bg-clip-text text-transparent
        ${className}
      `}
    >
      {children}
    </span>
  );
}
