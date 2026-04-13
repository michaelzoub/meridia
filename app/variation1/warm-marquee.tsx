"use client";

import { motion, useReducedMotion } from "motion/react";

import type { PartnerMarqueeItem } from "@/components/hero/PartnersMarquee";

const base = "whitespace-nowrap";

function voiceClass(voice: PartnerMarqueeItem["voice"]): string {
  switch (voice) {
    case "serif":
      return `${base} font-serif-display text-[clamp(0.8rem,2.2vw,0.98rem)] font-semibold italic tracking-tight text-[#1d1d1d]`;
    case "mono":
      return `${base} font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-amber-950/90 md:text-[11px]`;
    case "accent":
      return `${base} bg-gradient-to-r from-amber-800 via-orange-800 to-stone-800 bg-clip-text text-sm font-semibold uppercase tracking-[0.12em] text-transparent md:text-base`;
    default:
      return `${base} font-sans text-sm font-semibold uppercase tracking-[0.12em] text-stone-800 md:text-base`;
  }
}

type Props = { labels: readonly PartnerMarqueeItem[]; fadeFromClass?: string };

/** Same behavior as {@link PartnersMarquee}, with a warm cream fade and terracotta accents. */
export function WarmPartnersMarquee({
  labels,
  fadeFromClass = "from-[#f5f2ed]",
}: Props) {
  const reduceMotion = useReducedMotion();
  const loop = [...labels, ...labels];

  return (
    <div className="relative mt-6 overflow-hidden py-2">
      <div
        className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r ${fadeFromClass} to-transparent`}
      />
      <div
        className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l ${fadeFromClass} to-transparent`}
      />
      {reduceMotion ? (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-3 md:justify-start">
          {labels.map((item) => (
            <span key={item.label} className={voiceClass(item.voice)}>
              {item.label}
            </span>
          ))}
        </div>
      ) : (
        <motion.div
          className="flex w-max items-baseline gap-10 md:gap-16"
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{
            duration: 36,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
          }}
        >
          {loop.map((item, i) => (
            <span key={`${item.label}-${item.voice}-${i}`} className={voiceClass(item.voice)}>
              {item.label}
            </span>
          ))}
        </motion.div>
      )}
    </div>
  );
}
