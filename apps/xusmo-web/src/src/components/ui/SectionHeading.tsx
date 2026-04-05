interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  dark?: boolean;
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  dark = false,
  className = "",
}: SectionHeadingProps) {
  return (
    <div
      className={`
        ${align === "center" ? "text-center" : "text-left"}
        ${className}
      `}
    >
      {eyebrow && (
        <p
          className={`
            text-sm font-semibold tracking-widest uppercase mb-3
            ${dark ? "text-primary-300" : "text-primary-600"}
          `}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`
          font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight
          ${dark ? "text-white" : "text-neutral-900"}
        `}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`
            mt-4 text-lg sm:text-xl max-w-2xl leading-relaxed
            ${align === "center" ? "mx-auto" : ""}
            ${dark ? "text-neutral-300" : "text-neutral-500"}
          `}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
