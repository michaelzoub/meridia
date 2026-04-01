"use client";

import { motion, useReducedMotion } from "motion/react";

type Props = { labels: readonly string[] };

/**
 * Infinite horizontal scroll — duplicated track + motion `x: -50%` for a dependable loop.
 * (CSS-only marquee was easy to miss at 50s+; this stays linear and visible.)
 */
export function PartnersMarquee({ labels }: Props) {
  const reduceMotion = useReducedMotion();
  const loop = [...labels, ...labels];

  const itemClass =
    "whitespace-nowrap font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-700 md:text-[11px]";

  return (
    <div className="relative mt-6 overflow-hidden py-2">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-[#e8eaed] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-[#e8eaed] to-transparent" />
      {reduceMotion ? (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 md:justify-start">
          {labels.map((label) => (
            <span key={label} className={itemClass}>
              {label}
            </span>
          ))}
        </div>
      ) : (
        <motion.div
          className="flex w-max items-center gap-10 md:gap-16"
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{
            duration: 36,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
          }}
        >
          {loop.map((label, i) => (
            <span key={`${label}-${i}`} className={itemClass}>
              {label}
            </span>
          ))}
        </motion.div>
      )}
    </div>
  );
}
