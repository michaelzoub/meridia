"use client";

import type { ReactNode } from "react";

import { FlickeringGrid } from "@/components/effects/FlickeringGrid";

export function ThesisAiCallout({ children }: { children: ReactNode }) {
  return (
    <div className="relative mt-5 min-h-[132px] overflow-hidden border border-cyan-500/40 bg-white">
      <FlickeringGrid
        className="absolute inset-0 min-h-full"
        color="rgb(125, 211, 252)"
        squareSize={3}
        gridGap={7}
        flickerChance={0.055}
        maxOpacity={0.28}
      />
      <div className="relative z-[1] px-4 py-3">{children}</div>
    </div>
  );
}
