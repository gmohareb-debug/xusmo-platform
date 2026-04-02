type Width = "narrow" | "default" | "wide";

interface ContainerProps {
  children: React.ReactNode;
  width?: Width;
  className?: string;
}

const widthStyles: Record<Width, string> = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
};

export default function Container({
  children,
  width = "default",
  className = "",
}: ContainerProps) {
  return (
    <div className={`mx-auto px-6 sm:px-8 ${widthStyles[width]} ${className}`}>
      {children}
    </div>
  );
}
