"use client";

import Link from "next/link";

import { FooterCornerSquarcles } from "@/components/backgrounds/FooterCornerSquarcles";
import { SectionReveal } from "@/components/hero/SectionReveal";
import { Container } from "@/components/ui";
import { SOCIAL_X_HANDLE_DISPLAY, SOCIAL_X_URL } from "@/lib/site";

const columns = [
  {
    title: "Research —",
    links: [
      { label: "Writing", href: "/writing" },
      { label: "Thesis", href: "/#thesis" },
      { label: "Approach", href: "/#work" },
      { label: "Team", href: "/#team" },
    ],
  },
  {
    title: "Work with us —",
    links: [
      { label: "Contact", href: "/#discover" },
      { label: "Research & updates", href: SOCIAL_X_URL, external: true },
    ],
  },
  {
    title: "Legal —",
    links: [
      { label: "Privacy", href: "/legal#privacy" },
      { label: "Terms", href: "/legal#terms" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-zinc-800 bg-black text-white">
      <FooterCornerSquarcles />

      <SectionReveal amount={0.1} delay={0.04} className="relative z-[1] py-16 md:py-20">
        <Container>
          {/*
           * Two-column layout:
           * Left  — oversized italic brand mark + legal disclaimer directly below
           * Right — nav columns + contact links
           */}
          <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-16">

            {/* ── Left: brand mark + legal ── */}
            <div className="min-w-0 overflow-hidden">
              <p
                className="font-serif-display italic leading-[0.92] tracking-tight select-none"
                style={{ fontSize: "clamp(4.5rem, 16vw, 15rem)", color: "#1e1e1e" }}
                aria-hidden
              >
                Caliga
              </p>

              <div className="mt-8 max-w-lg space-y-3">
                <p className="font-serif-display text-xs leading-relaxed text-zinc-500">
                  Caliga publishes research and commentary for informational and educational
                  purposes only and does not provide investment advice, investment recommendations,
                  or an offer or solicitation to buy or sell any security or financial instrument.
                  Any investment activity is high risk; do your own diligence and consult qualified
                  advisors.
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                  © {new Date().getFullYear()} Caliga. All rights reserved.
                </p>
              </div>
            </div>

            {/* ── Right: nav grid 2×2 + contact in second row ── */}
            <div className="grid grid-cols-2 gap-x-10 gap-y-10">
              {columns.map((col) => (
                <div key={col.title}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    {col.title}
                  </p>
                  <nav className="mt-4 space-y-2" aria-label={col.title}>
                    {col.links.map((l) => {
                      const cls =
                        "block font-sans text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-300";

                      if ("disabled" in l && l.disabled) {
                        return (
                          <span key={l.label} className="block font-sans text-sm text-zinc-600">
                            {l.label}
                          </span>
                        );
                      }

                      if ("external" in l && l.external) {
                        return (
                          <a
                            key={l.label}
                            href={l.href}
                            className={cls}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {l.label}
                          </a>
                        );
                      }

                      return (
                        <Link key={l.label} href={l.href} className={cls}>
                          {l.label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}

              {/* Contact — 4th column, same vertical alignment as nav */}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  Contact —
                </p>
                <div className="mt-4 space-y-2">
                  <a
                    href="mailto:hello@caliga.xyz"
                    className="block font-sans text-sm font-medium text-zinc-500 underline decoration-zinc-700 underline-offset-4 transition-colors hover:text-zinc-300 hover:decoration-zinc-500"
                  >
                    hello@caliga.xyz
                  </a>
                  <a
                    href={SOCIAL_X_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block font-sans text-sm font-medium text-zinc-500 underline decoration-zinc-700 underline-offset-4 transition-colors hover:text-zinc-300 hover:decoration-zinc-500"
                  >
                    {SOCIAL_X_HANDLE_DISPLAY}
                  </a>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </SectionReveal>
    </footer>
  );
}
