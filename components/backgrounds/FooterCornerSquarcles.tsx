"use client";

import { motion } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

export type FooterCornerSquarclesProps = {
  className?: string;
};

/** Equilateral triangle path centered at (cx, cy) with circumradius R, pointing up. */
function trianglePath(cx: number, cy: number, R: number): string {
  const sq3_2 = Math.sqrt(3) / 2;
  const x1 = cx;
  const y1 = cy - R;
  const x2 = cx + R * sq3_2;
  const y2 = cy + R / 2;
  const x3 = cx - R * sq3_2;
  const y3 = cy + R / 2;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)} Z`;
}

type Layer = { d: string; sw: number; times: number[]; pathLength: number[] };

const LAYER_COUNT = 10;
const INWARD_FR = 0.42;
const HOLD_FR = 0.06;
const OUTWARD_FR = 0.42;

function buildLayerKeyframes(i: number): { times: number[]; pathLength: number[] } {
  const tIn0 = (i / LAYER_COUNT) * INWARD_FR;
  const tIn1 = ((i + 1) / LAYER_COUNT) * INWARD_FR;
  const tHold0 = INWARD_FR;
  const tHold1 = INWARD_FR + HOLD_FR;
  const tOut0 = tHold1 + ((9 - i) / LAYER_COUNT) * OUTWARD_FR;
  const tOut1 = tHold1 + ((10 - i) / LAYER_COUNT) * OUTWARD_FR;

  return {
    times: [0, tIn0, tIn1, tOut0, tOut1, 1],
    pathLength: [0, 0, 1, 1, 0, 0],
  };
}

/** Concentric triangles — outer → center draw, hold, center → outer erase, loop. Flat gray strokes, no glow. */
export const FooterCornerSquarcles = React.memo(({ className }: FooterCornerSquarclesProps) => {
  const layers = React.useMemo<Layer[]>(() => {
    const cx = 268;
    const cy = 278;
    const out: Layer[] = [];
    for (let i = 0; i < LAYER_COUNT; i++) {
      const R = 210 - i * 19;
      const d = trianglePath(cx, cy, R);
      const { times, pathLength } = buildLayerKeyframes(i);
      out.push({
        d,
        sw: Math.max(0.55, 0.95 - i * 0.05),
        times,
        pathLength,
      });
    }
    return out;
  }, []);

  const cycleDuration = 14;

  return (
    <div
      className={cn(
        "pointer-events-none absolute right-0 top-0 h-[min(52vw,480px)] w-[min(100vw,600px)] select-none overflow-hidden md:h-[440px] md:w-[600px]",
        className,
      )}
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "160px 160px",
        }}
      />

      <div className="absolute right-0 top-0 size-[min(118vw,620px)] max-md:size-[min(125vw,640px)] translate-x-1/2 -translate-y-1/2 md:size-[min(110vw,600px)]">
        <svg
          className="h-full w-full"
          viewBox="0 0 540 520"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {layers.map((layer, i) => (
            <motion.path
              key={i}
              d={layer.d}
              fill="none"
              stroke="rgba(161, 161, 170, 0.42)"
              strokeWidth={layer.sw}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: layer.pathLength }}
              transition={{
                duration: cycleDuration,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
                times: layer.times,
              }}
            />
          ))}
        </svg>
      </div>

      <div className="absolute right-2 top-2 h-1 w-1 bg-zinc-400/80" />
    </div>
  );
});

FooterCornerSquarcles.displayName = "FooterCornerSquarcles";
