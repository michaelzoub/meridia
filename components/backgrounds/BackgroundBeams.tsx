"use client";

import { motion } from "motion/react";
import React from "react";

import { cn } from "@/lib/utils";

export type BackgroundBeamsProps = {
  className?: string;
  /** Warm terracotta strokes for Caliga / variation1 dark panels. Default: neutral zinc/white. */
  tone?: "neutral" | "terracotta";
};

const pathData = [
  "M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875",
  "M-358 -213C-358 -213 -290 192 174 319C638 446 706 851 706 851",
  "M-336 -237C-336 -237 -268 168 196 295C660 422 728 827 728 827",
  "M-314 -261C-314 -261 -246 144 218 271C682 398 750 803 750 803",
  "M-292 -285C-292 -285 -224 120 240 247C704 374 772 779 772 779",
  "M-270 -309C-270 -309 -202 96 262 223C726 350 794 755 794 755",
  "M-248 -333C-248 -333 -180 72 284 199C748 326 816 731 816 731",
  "M-226 -357C-226 -357 -158 48 306 175C770 302 838 707 838 707",
  "M-204 -381C-204 -381 -136 24 328 151C792 278 860 683 860 683",
  "M-182 -405C-182 -405 -114 0 350 127C814 254 882 659 882 659",
  "M-160 -429C-160 -429 -92 -24 372 103C836 230 904 635 904 635",
  "M-138 -453C-138 -453 -70 -48 394 79C858 206 926 611 926 611",
  "M-116 -477C-116 -477 -48 -72 416 55C880 182 948 587 948 587",
  "M-94 -501C-94 -501 -26 -96 438 31C902 158 970 563 970 563",
  "M-72 -525C-72 -525 -4 -120 460 7C924 134 992 539 992 539",
  "M-50 -549C-50 -549 18 -144 482 -17C946 110 1014 515 1014 515",
  "M-28 -573C-28 -573 40 -168 504 -41C968 86 1036 491 1036 491",
  "M-6 -597C-6 -597 62 -192 526 -65C990 62 1058 467 1058 467",
  "M16 -621C16 -621 84 -216 548 -89C1012 38 1080 443 1080 443",
  "M38 -645C38 -645 106 -240 570 -113C1034 14 1102 419 1102 419",
];

const animations = pathData.map((_, i) => ({
  duration: 4 + (i % 5) * 0.8,
  delay: i * 0.15,
}));

/** Animated beam paths — neutral zinc/white or warm terracotta (dark surfaces; no purple/teal). */
export const BackgroundBeams = React.memo(
  ({ className, tone = "neutral" }: BackgroundBeamsProps) => {
    const idPrefix = tone === "terracotta" ? "beam-t" : "beam-n";
    const staticStroke =
      tone === "terracotta" ? "rgba(212, 165, 116, 0.14)" : "white";

    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 h-full w-full overflow-hidden",
          className,
        )}
      >
        <svg
          aria-hidden
          className="absolute h-full w-full min-h-[120%] min-w-full"
          fill="none"
          viewBox="0 0 696 316"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <g opacity={tone === "terracotta" ? 0.09 : 0.06}>
            {pathData.map((d, i) => (
              <path
                key={`static-${idPrefix}-${i}`}
                d={d}
                stroke={staticStroke}
                strokeWidth="0.5"
              />
            ))}
          </g>

          {pathData.map((d, i) => (
            <motion.path
              key={`beam-${idPrefix}-${i}`}
              d={d}
              stroke={`url(#${idPrefix}-gradient-${i})`}
              strokeWidth="0.85"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1],
                opacity: [0, 0.35, 0.35, 0],
              }}
              transition={{
                duration: animations[i].duration,
                delay: animations[i].delay,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          ))}

          <defs>
            {pathData.map((_, i) => (
              <linearGradient
                key={`beam-gradient-def-${idPrefix}-${i}`}
                id={`${idPrefix}-gradient-${i}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                {tone === "terracotta" ? (
                  <>
                    <stop offset="0%" stopColor="#7c2d12" stopOpacity="0" />
                    <stop offset="22%" stopColor="#c4713f" stopOpacity="0.55" />
                    <stop offset="48%" stopColor="#e8b896" stopOpacity="0.45" />
                    <stop offset="72%" stopColor="#b45309" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#fafafa" stopOpacity="0" />
                    <stop offset="25%" stopColor="#e4e4e7" stopOpacity="0.85" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.55" />
                    <stop offset="75%" stopColor="#d4d4d8" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="#fafafa" stopOpacity="0" />
                  </>
                )}
              </linearGradient>
            ))}
          </defs>
        </svg>
      </div>
    );
  },
);

BackgroundBeams.displayName = "BackgroundBeams";
