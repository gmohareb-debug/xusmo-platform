"use client";

import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "link";
type Size = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  href?: string;
  arrow?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-500 hover:shadow-glow active:bg-primary-700 disabled:bg-primary-300",
  secondary:
    "border-2 border-primary-300 text-primary-700 hover:bg-primary-50 hover:border-primary-400 active:bg-primary-100",
  ghost:
    "text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200",
  link:
    "text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline p-0",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-4 py-2 text-sm rounded-lg gap-1.5",
  md: "px-6 py-3 text-sm rounded-lg gap-2",
  lg: "px-8 py-4 text-base rounded-xl gap-2",
  xl: "px-10 py-5 text-lg rounded-xl gap-2.5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      arrow = false,
      className = "",
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center font-semibold
          transition-all duration-300 ease-out
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500
          disabled:cursor-not-allowed disabled:opacity-50
          ${variant === "primary" ? "hover:-translate-y-0.5" : ""}
          ${variantStyles[variant]}
          ${variant !== "link" ? sizeStyles[size] : ""}
          ${className}
        `}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        {children}
        {arrow && (
          <svg
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
