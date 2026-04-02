import { useEffect, useState, useCallback } from "react";
import { getTheme } from "../theme";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface Props {
  stat_1_number?: string;
  stat_1_label?: string;
  stat_2_number?: string;
  stat_2_label?: string;
  stat_3_number?: string;
  stat_3_label?: string;
  stat_4_number?: string;
  stat_4_label?: string;
}

/**
 * Parses a stat string like "500+", "99.9%", "50+", "24/7".
 * Returns { numericValue, prefix, suffix, isNumeric, decimals }.
 */
function parseStat(raw: string) {
  const match = raw.match(/^([^0-9]*?)(\d+(?:\.\d+)?)(.*)$/);
  if (!match) {
    return { numericValue: 0, prefix: "", suffix: raw, isNumeric: false, decimals: 0 };
  }
  const prefix = match[1];
  const numStr = match[2];
  const suffix = match[3];
  const numericValue = parseFloat(numStr);
  const decimalPart = numStr.includes(".") ? numStr.split(".")[1].length : 0;
  return { numericValue, prefix, suffix, isNumeric: true, decimals: decimalPart };
}

function useCountUp(target: number, decimals: number, duration: number, shouldStart: boolean) {
  const [value, setValue] = useState(0);

  const animate = useCallback(() => {
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      setValue(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  useEffect(() => {
    if (shouldStart && target > 0) {
      animate();
    }
  }, [shouldStart, target, animate]);

  if (decimals > 0) {
    return value.toFixed(decimals);
  }
  return Math.round(value).toString();
}

function StatItem({
  rawNumber,
  label,
  visible,
}: {
  rawNumber: string;
  label: string;
  visible: boolean;
}) {
  const t = getTheme();
  const mono = "JetBrains Mono, Fira Code, monospace";
  const parsed = parseStat(rawNumber);
  const countedValue = useCountUp(parsed.numericValue, parsed.decimals, 2000, visible);

  const displayValue = parsed.isNumeric
    ? `${parsed.prefix}${countedValue}${parsed.suffix}`
    : rawNumber;

  return (
    <div style={{ textAlign: "center", flex: "1 1 0" }}>
      <p
        style={{
          fontSize: "clamp(3rem, 8vw, 5rem)",
          fontWeight: 900,
          color: t.colors.accent,
          fontFamily: t.fonts.heading,
          margin: 0,
          lineHeight: 1,
        }}
      >
        {displayValue}
      </p>

      {/* Accent underline */}
      <div
        style={{
          width: "40px",
          height: "2px",
          background: t.colors.accent,
          margin: "1rem auto 0.75rem auto",
        }}
      />

      <p
        style={{
          fontSize: "0.75rem",
          color: "rgba(255,255,255,0.4)",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          fontFamily: mono,
          margin: 0,
        }}
      >
        {label}
      </p>
    </div>
  );
}

export function StatsProof({
  stat_1_number = "500+",
  stat_1_label = "Projects Delivered",
  stat_2_number = "99.9%",
  stat_2_label = "Client Satisfaction",
  stat_3_number = "50+",
  stat_3_label = "Team Members",
  stat_4_number = "24/7",
  stat_4_label = "Support Available",
}: Props) {
  const t = getTheme();
  const { ref, visible } = useScrollReveal(0.2);
  const mono = "JetBrains Mono, Fira Code, monospace";

  const stats = [
    { number: stat_1_number, label: stat_1_label },
    { number: stat_2_number, label: stat_2_label },
    { number: stat_3_number, label: stat_3_label },
    { number: stat_4_number, label: stat_4_label },
  ];

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{
        padding: "7rem 2rem",
        background: "#0a0a0a",
        fontFamily: t.fonts.body,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        {/* Section label */}
        <p
          style={{
            fontFamily: mono,
            fontSize: "0.8rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: t.colors.accent,
            margin: "0 0 3rem 0",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.7s ease",
          }}
        >
          By the Numbers
        </p>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "2rem",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
          }}
        >
          {stats.map((s, i) => (
            <StatItem
              key={i}
              rawNumber={s.number}
              label={s.label}
              visible={visible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
