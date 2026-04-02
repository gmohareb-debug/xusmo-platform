"use client";

import { useEffect, useRef, useState } from "react";

type Direction = "up" | "left" | "right" | "fade" | "scale";

interface AnimatedSectionProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
}

const directionStyles: Record<Direction, { hidden: string; visible: string }> = {
  up: {
    hidden: "opacity-0 translate-y-8",
    visible: "opacity-100 translate-y-0",
  },
  left: {
    hidden: "opacity-0 -translate-x-8",
    visible: "opacity-100 translate-x-0",
  },
  right: {
    hidden: "opacity-0 translate-x-8",
    visible: "opacity-100 translate-x-0",
  },
  fade: {
    hidden: "opacity-0",
    visible: "opacity-100",
  },
  scale: {
    hidden: "opacity-0 scale-95",
    visible: "opacity-100 scale-100",
  },
};

export default function AnimatedSection({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const styles = directionStyles[direction];

  return (
    <div
      ref={ref}
      className={`
        transition-all duration-700 ease-out h-full
        ${isVisible ? styles.visible : styles.hidden}
        ${className}
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
