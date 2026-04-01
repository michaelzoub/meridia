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
          className="w-full border-b border-white/10 bg-black"
        >
          <Container className="max-w-none px-3 py-2 md:px-8 md:py-2.5 lg:px-12">
            {/* Mobile: single row, memo + thesis left, dismiss right (text only). Desktop: 3-col + caption. */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-3 lg:gap-5">
              <div className="flex min-h-10 w-full items-center justify-between gap-2 md:contents md:min-h-0">
                <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-x-2.5 sm:gap-x-3 md:min-w-0 md:flex-initial md:justify-self-start">
                  <span className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white md:text-[11px] md:font-medium md:tracking-[0.16em]">
                    Research memo
                  </span>
                  <Link
                    href="/#thesis"
                    className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white underline decoration-white/40 underline-offset-[3px] transition-colors hover:decoration-[var(--color-accent-cyan)] md:text-[11px] md:font-medium"
                  >
                    Read thesis →
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={dismiss}
                  className="shrink-0 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400 transition-colors hover:text-white md:hidden"
                  aria-label="Dismiss announcement"
                >
                  Dismiss
                </button>
              </div>
              <p className="hidden max-w-none text-center font-mono text-[10px] font-medium uppercase leading-snug tracking-[0.1em] text-zinc-400 md:block md:min-w-0 md:flex-1 md:text-left md:text-[11px] md:leading-normal md:tracking-[0.14em]">
                Why crypto, fintech, deep tech, and anything in between rewards obsessive due diligence.
              </p>
              <button
                type="button"
                onClick={dismiss}
                className="hidden shrink-0 justify-self-end py-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400 transition-colors hover:text-white md:block"
                aria-label="Dismiss announcement"
              >
                Dismiss
              </button>
            </div>
          </Container>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
