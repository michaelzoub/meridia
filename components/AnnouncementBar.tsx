"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";

import { Container } from "@/components/ui";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  const dismiss = useCallback(() => setVisible(false), []);

  return (
    <AnimatePresence mode="popLayout">
      {visible ? (
        <motion.div
          key="announcement"
          layout
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="border-b border-white/10 bg-black"
        >
          <Container className="flex flex-col gap-2 py-2.5 md:flex-row md:items-center md:gap-8 md:py-2.5">
            {/* Row 1 mobile: label + CTA | dismiss. Desktop: merged into one row with message between */}
            <div className="flex items-center justify-between gap-4 md:contents">
              <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 md:shrink-0">
                <span className="shrink-0 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500 md:text-[11px]">
                  Research memo
                </span>
                <Link
                  href="/#thesis"
                  className="shrink-0 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-white underline decoration-white/35 underline-offset-4 transition-colors hover:decoration-[var(--color-accent-cyan)] md:text-[11px]"
                >
                  Read thesis →
                </Link>
              </div>
              <button
                type="button"
                onClick={dismiss}
                className="shrink-0 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:text-zinc-300 md:hidden"
                aria-label="Dismiss announcement"
              >
                Dismiss
              </button>
            </div>
            <p className="max-w-none text-center font-mono text-[10px] font-medium uppercase leading-snug tracking-[0.1em] text-zinc-400 md:min-w-0 md:flex-1 md:text-left md:text-[11px] md:leading-normal md:tracking-[0.14em]">
              Why crypto, fintech, deep tech, and anything in between rewards obsessive due
              diligence.
            </p>
            <button
              type="button"
              onClick={dismiss}
              className="hidden shrink-0 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:text-zinc-300 md:block"
              aria-label="Dismiss announcement"
            >
              Dismiss
            </button>
          </Container>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
