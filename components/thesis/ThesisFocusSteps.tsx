"use client";

import { Fragment } from "react";
import { ArrowDown } from "lucide-react";

import { StaggerItem, StaggerOnView } from "@/components/hero/StaggerOnView";

export type FocusStep = { n: string; title: string; body: string };

/** Flat divider with centered arrow—sits on the dashed rule (research-practice / hero reference). */
function StepDivider() {
  return (
    <div className="relative flex min-h-12 items-center justify-center md:min-h-14" aria-hidden>
      <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-zinc-300" />
      <div className="relative bg-white px-4">
        <ArrowDown className="h-4 w-4 text-cyan-800" strokeWidth={1.5} />
      </div>
    </div>
  );
}

export function ThesisFocusSteps({ steps }: { steps: readonly FocusStep[] }) {
  return (
    <StaggerOnView id="work" className="scroll-mt-24 lg:pl-12">
      <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
        Approach
      </p>
      <div className="border border-dashed border-zinc-400 bg-white">
        {steps.map((step, i) => (
          <Fragment key={step.n}>
            <StaggerItem>
              <div className="px-7 py-8 md:px-10 md:py-9">
                <div className="flex gap-5 md:gap-6">
                  <span className="shrink-0 font-mono text-xs tabular-nums text-cyan-800 md:text-sm">
                    {step.n}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-sans text-base font-semibold tracking-tight text-zinc-900">
                      {step.title}
                    </h3>
                    <p className="mt-2 font-serif-display text-sm leading-relaxed text-zinc-700">
                      {step.body}
                    </p>
                  </div>
                </div>
              </div>
            </StaggerItem>
            {i < steps.length - 1 ? <StepDivider /> : null}
          </Fragment>
        ))}
      </div>
    </StaggerOnView>
  );
}
