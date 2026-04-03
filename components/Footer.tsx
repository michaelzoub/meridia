"use client";

import Link from "next/link";

import { FooterCornerSquarcles } from "@/components/backgrounds/FooterCornerSquarcles";
import { SectionReveal } from "@/components/hero/SectionReveal";
import { Container } from "@/components/ui";
import { SOCIAL_X_URL } from "@/lib/site";

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
          <div className="grid gap-12 md:grid-cols-[1fr_1fr_1fr_auto] md:items-start md:gap-10">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  {col.title}
                </p>
                <nav className="mt-4 space-y-2" aria-label={col.title}>
                  {col.links.map((l) => {
                    const cls =
                      "block font-sans text-sm font-medium text-zinc-100 transition-colors hover:text-white";

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

            <div className="md:justify-self-end">
              <a
                href="mailto:support@adhdcapital.xyz"
                className="block font-sans text-sm font-semibold text-white underline decoration-zinc-600 underline-offset-4 transition-colors hover:decoration-zinc-400"
              >
                support@adhdcapital.xyz
              </a>
              <a
                href={SOCIAL_X_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block font-sans text-sm font-semibold text-white underline decoration-zinc-600 underline-offset-4 transition-colors hover:decoration-zinc-400"
              >
                @CapitalADHD
              </a>
            </div>
          </div>

          <div className="mt-14 border-t border-zinc-800 pt-10">
            <p className="max-w-4xl font-serif-display text-xs leading-relaxed text-zinc-500">
              ADHD Capital publishes research and commentary for informational and educational
              purposes only and does not provide investment advice, investment recommendations, or
              an offer or solicitation to buy or sell any security or financial instrument. Any
              investment activity is high risk; do your own diligence and consult qualified
              advisors.
            </p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              © {new Date().getFullYear()} ADHD Capital. All rights reserved.
            </p>
          </div>
        </Container>
      </SectionReveal>
    </footer>
  );
}
