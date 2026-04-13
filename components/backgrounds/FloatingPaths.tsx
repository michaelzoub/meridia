"use client";

import { motion } from "motion/react";
import { useMemo } from "react";

/** Sky-300 — reads as a light blue line on white when strokeOpacity is low. */
const DEFAULT_STROKE = "#7dd3fc";

function FloatingPaths({
  position,
  stroke = DEFAULT_STROKE,
}: {
  position: 1 | -1;
  /** Override line color (e.g. warm terracotta for alternate themes). */
  stroke?: string;
}) {
  const paths = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        width: 0.35 + i * 0.028,
        opacity: 0.12 + i * 0.016,
        duration: 22 + (i % 10) * 1.35,
      })),
    [position],
  );

  return (
    <svg
      aria-hidden
      className="absolute inset-0 h-full w-full min-h-[140%]"
      fill="none"
      viewBox="0 0 696 316"
      preserveAspectRatio="xMidYMid slice"
    >
      {paths.map((path) => (
        <motion.path
          key={path.id}
          d={path.d}
          stroke={stroke}
          strokeWidth={path.width}
          strokeOpacity={path.opacity}
          initial={{ pathLength: 0.25, opacity: 0.18 }}
          animate={{
            pathLength: [0.25, 1, 0.25],
            opacity: [0.12, 0.38, 0.12],
            pathOffset: [0, 1, 0],
          }}
          transition={{
            duration: path.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      ))}
    </svg>
  );
}

/** Mirrored path sets for the “At a glance” band. */
export function AtAGlanceFloatingPaths({
  strokeColor,
}: {
  /** Optional stroke color; defaults to the cool sky line used on the main site. */
  strokeColor?: string;
} = {}) {
  const stroke = strokeColor ?? DEFAULT_STROKE;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <FloatingPaths position={1} stroke={stroke} />
      <FloatingPaths position={-1} stroke={stroke} />
    </div>
  );
}
