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
          <div className="py-2.5 text-[11px] text-zinc-500">
            <Container className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center font-mono uppercase tracking-[0.16em] md:justify-between md:text-left">
              <span className="text-zinc-600">Research memo</span>
              <span className="text-zinc-400">
                Why early-stage crypto and deep tech rewards obsessive due diligence.
              </span>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 md:justify-end">
                <Link
                  href="/#thesis"
                  className="text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-[var(--color-accent-cyan)]"
                >
                  Read thesis →
                </Link>
                <button
                  type="button"
                  onClick={dismiss}
                  className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 underline-offset-4 transition-colors hover:text-zinc-300"
                  aria-label="Dismiss announcement"
                >
                  Dismiss
                </button>
              </div>
            </Container>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
