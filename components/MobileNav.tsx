"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { Button } from "@/components/ui";

export type MobileNavLink = {
  label: string;
  href: string;
};

type Props = {
  links: readonly MobileNavLink[];
};

/** Primary nav + CTAs for viewports below `md` only. Desktop layout is unchanged. */
export function MobileNav({ links }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative z-[3] ml-auto md:hidden">
      <button
        type="button"
        id="mobile-nav-toggle"
        onClick={() => setOpen((v) => !v)}
        className="rounded-none border border-zinc-400 bg-white px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50"
        aria-expanded={open}
        aria-controls="mobile-primary-nav"
      >
        {open ? "Close" : "Menu"}
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-[100] bg-black/25 md:hidden"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <motion.div
              id="mobile-primary-nav"
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-nav-toggle"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-[calc(100%+0.5rem)] z-[101] w-[min(100vw-1.25rem,19rem)] border border-zinc-300 bg-zinc-100 shadow-lg"
            >
              <nav
                className="flex max-h-[min(72vh,28rem)] flex-col overflow-y-auto overscroll-contain px-4 py-3"
                aria-label="Mobile primary"
              >
                {links.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="border-b border-zinc-200 py-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-800 last-of-type:border-b-0"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mt-2 flex flex-col gap-2 border-t border-zinc-300 pt-4">
                  <Button
                    href="https://x.com/CapitalADHD"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="primary"
                    className="w-full justify-center !px-4 !py-3 !text-[10px] font-mono uppercase tracking-[0.14em]"
                    onClick={() => setOpen(false)}
                  >
                    Research &amp; updates
                  </Button>
                  <Button
                    variant="ghost"
                    href="https://x.com/CapitalADHD"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full justify-center !px-3 !py-2.5 font-mono !text-[10px] uppercase tracking-wide text-zinc-700 !no-underline"
                    onClick={() => setOpen(false)}
                  >
                    @CapitalADHD
                  </Button>
                </div>
              </nav>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
