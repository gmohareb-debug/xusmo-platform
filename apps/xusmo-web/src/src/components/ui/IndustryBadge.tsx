import type { LucideIcon } from "lucide-react";

interface IndustryBadgeProps {
  icon: LucideIcon;
  name: string;
  dark?: boolean;
  className?: string;
}

export default function IndustryBadge({
  icon: Icon,
  name,
  dark = false,
  className = "",
}: IndustryBadgeProps) {
  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-full border
        px-4 py-2 text-sm font-medium
        transition-all duration-300
        cursor-default
        ${className}
      `}
      style={
        dark
          ? {
              backgroundColor: "#16132B",
              borderColor: "#2A2545",
              color: "#C7D2FE",
            }
          : {
              backgroundColor: "#ffffff",
              borderColor: "#E8E6E1",
              color: "#404040",
            }
      }
    >
      <Icon className="h-4 w-4" />
      <span>{name}</span>
    </div>
  );
}
