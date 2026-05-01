import type { Metadata } from "next";
import Image from "next/image";

import PixelHammer from "@/components/backgrounds/PixelHammer";
import PixelMountain from "@/components/backgrounds/PixelMountain";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  HeroColumnStagger,
  HeroEntrance,
  HeroLineItem,
  HeroStaggerChild,
  HeroStaggerRoot,
} from "@/components/hero/HeroEntrance";
import { SectionReveal } from "@/components/hero/SectionReveal";
import { StaggerItem, StaggerOnView } from "@/components/hero/StaggerOnView";
import { Container } from "@/components/ui";
import { SOCIAL_X_URL } from "@/lib/site";

const VOID = "#0d0d0d";
const VOID_SURFACE = "#141414";
const VOID_BORDER = "#242424";
const CREAM = "#ede9e0";
const CREAM_MUTED = "#9e9890";
const CREAM_DIM = "#6a6460";
const LIFT = "#1e1e1e";

const stats = [
  { value: "2", label: "Research seats" },
  { value: "10+", label: "Active domains" },
  { value: "SG × NYC", label: "Coverage" },
  { value: "0", label: "Vanity decks" },
];

const pillars = [
  {
    n: "01",
    label: "Protocol economics",
    body: "L1/L2 incentive design, DeFi mechanism review, custody and settlement risk.",
  },
  {
    n: "02",
    label: "Fintech infrastructure",
    body: "Payment rails, wallet stacks, cross-border settlement, regulatory surface area.",
  },
  {
    n: "03",
    label: "Frontier AI systems",
    body: "Agent pipelines, inference hardware, emerging compute paradigms.",
  },
  {
    n: "04",
    label: "Robotics & deep tech",
    body: "Hardware–software integration, sensor stacks, embedded systems adjacent to finance.",
  },
];

const team = [
  {
    handle: "Feuter",
    image: "/feuter.jpg",
    role: "Analytics & company research",
    city: "Singapore",
    xUrl: "https://x.com/feuters",
    blurb:
      "Graduate training with VC exposure—deep on analytics, modelling, and company analysis. Operator judgment meets institutional rigor.",
  },
  {
    handle: "Kafka",
    image: "/kafka.jpg",
    role: "Technical research",
    city: "NYC",
    xUrl: "https://x.com/wenkafka",
    blurb:
      "Computer science background; hands-on engineering across YC- and Paradigm-style stacks. Reads the code, stress-tests the assumptions.",
  },
];

export const metadata: Metadata = {
  title: "Caliga — The frontier, clearly",
  description:
    "A research collective at the frontier of crypto, fintech, deep tech, and frontier AI. We publish first, invest second.",
  robots: { index: false, follow: true },
};

function Underline({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="underline decoration-[3px] underline-offset-[10px]"
      style={{ textDecorationColor: CREAM }}
    >
      {children}
    </span>
  );
}

function LightU({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="underline decoration-[2.5px] underline-offset-[8px]"
      style={{ textDecorationColor: VOID }}
    >
      {children}
    </span>
  );
}

export default function Variation3Page() {
  return (
    <div style={{ background: VOID }} className="text-[#ede9e0]">
      <Header />
      <main>
        {/* ─── HERO ─── */}
        <HeroEntrance>
          <section
            className="relative flex min-h-[calc(100svh-6.5rem)] flex-col overflow-hidden py-14 md:min-h-[calc(100svh-7rem)] md:py-20"
            style={{ background: VOID }}
          >
            {/* Subtle grid texture */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
                backgroundSize: "80px 80px",
              }}
              aria-hidden
            />

            <HeroStaggerRoot className="relative flex flex-1 flex-col justify-between gap-16">
              {/* Top: massive headline */}
              <Container>
                <HeroStaggerChild>
                  <HeroColumnStagger>
                    <HeroLineItem>
                      <p
                        className="font-mono text-[11px] uppercase tracking-[0.22em]"
                        style={{ color: CREAM_DIM }}
                      >
                        Caliga · Research collective
                      </p>
                    </HeroLineItem>
                    <HeroLineItem className="mt-7">
                      <h1
                        className="font-sans font-black leading-[1.00] tracking-[-0.025em]"
                        style={{
                          fontSize: "clamp(2.75rem, 8.5vw, 6.25rem)",
                          color: CREAM,
                        }}
                      >
                        The <Underline>frontier</Underline>, clearly.
                        <br />
                        Capital, <Underline>carefully</Underline>.
                      </h1>
                    </HeroLineItem>
                  </HeroColumnStagger>
                </HeroStaggerChild>
              </Container>

              {/* Bottom: description + CTA */}
              <Container>
                <HeroStaggerChild>
                  <div className="grid gap-10 lg:grid-cols-2 lg:gap-20">
                    <p
                      className="font-serif-display text-lg leading-relaxed md:text-xl"
                      style={{ color: CREAM_MUTED }}
                    >
                      The most consequential technologies of the next decade are
                      being built right now—in crypto protocols, fintech rails,
                      and frontier AI. We research these systems with rigor and
                      act with precision.
                    </p>
                    <div className="flex flex-col justify-end gap-6">
                      <div
                        className="grid grid-cols-2 gap-4 border-t pt-6 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
                        style={{ borderColor: VOID_BORDER }}
                      >
                        {stats.map((s) => (
                          <div key={s.label}>
                            <p
                              className="font-sans text-xl font-black tracking-tight"
                              style={{ color: CREAM }}
                            >
                              {s.value}
                            </p>
                            <p
                              className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em]"
                              style={{ color: CREAM_DIM }}
                            >
                              {s.label}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <a
                          href="/variation3#contact"
                          className="inline-flex items-center px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] font-medium transition-opacity hover:opacity-80"
                          style={{ background: CREAM, color: VOID }}
                        >
                          Collaborate
                        </a>
                        <a
                          href="/variation3#domains"
                          className="inline-flex items-center border px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] font-medium transition-colors hover:border-[#ede9e0]"
                          style={{ borderColor: VOID_BORDER, color: CREAM }}
                        >
                          Our research
                        </a>
                      </div>
                    </div>
                  </div>
                </HeroStaggerChild>
              </Container>
            </HeroStaggerRoot>
          </section>
        </HeroEntrance>

        {/* ─── LIGHT FEATURE BREAK (Anthropic-style inversion) ─── */}
        <SectionReveal amount={0.06}>
          <div className="px-4 md:px-6 lg:px-8">
            <div className="p-10 md:p-16 lg:p-20" style={{ background: CREAM }}>
              <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
                <div>
                  <p
                    className="mb-6 font-mono text-[10px] uppercase tracking-[0.22em]"
                    style={{ color: "#8a847e" }}
                  >
                    Why research-first
                  </p>
                  <h2
                    className="font-sans font-bold leading-[1.06] tracking-tight"
                    style={{
                      fontSize: "clamp(1.85rem, 4vw, 3.25rem)",
                      color: VOID,
                    }}
                  >
                    We publish <LightU>before</LightU> we pitch. Always.
                  </h2>
                  <p
                    className="mt-6 font-serif-display text-base leading-relaxed md:text-lg"
                    style={{ color: "#4a4540" }}
                  >
                    Frontier technology moves too fast for surface-level
                    diligence. We go deep so that when we act, the work is
                    already done—and you can read every step.
                  </p>
                </div>
                <div>
                  <p
                    className="mb-6 font-mono text-[10px] uppercase tracking-[0.22em]"
                    style={{ color: "#8a847e" }}
                  >
                    The method
                  </p>
                  <ul className="space-y-6">
                    {[
                      {
                        label: "Open methodology",
                        body: "Sources cited. Steps reproducible. No black box.",
                      },
                      {
                        label: "Adversarial review",
                        body: "We write the uncomfortable questions into the appendix.",
                      },
                      {
                        label: "Agent-assisted synthesis",
                        body: "AI on the desk—rigor scales without becoming opaque.",
                      },
                    ].map((item) => (
                      <li key={item.label} className="flex gap-4">
                        <div
                          className="mt-2 h-1.5 w-1.5 shrink-0"
                          style={{ background: VOID }}
                          aria-hidden
                        />
                        <div>
                          <p
                            className="font-sans text-sm font-semibold"
                            style={{ color: VOID }}
                          >
                            {item.label}
                          </p>
                          <p
                            className="mt-1 font-serif-display text-sm leading-relaxed"
                            style={{ color: "#6a6460" }}
                          >
                            {item.body}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </SectionReveal>

        {/* ─── DOMAINS ─── */}
        <SectionReveal amount={0.07}>
          <section
            id="domains"
            className="scroll-mt-24 py-20 md:py-32"
            style={{ background: VOID }}
          >
            <Container>
              <p
                className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em]"
                style={{ color: CREAM_DIM }}
              >
                Research domains
              </p>
              <h2
                className="max-w-3xl font-sans font-bold leading-[1.06] tracking-tight"
                style={{
                  fontSize: "clamp(1.85rem, 4vw, 3.25rem)",
                  color: CREAM,
                }}
              >
                The most consequential <Underline>technologies</Underline> of
                the next decade.
              </h2>
              <div className="mt-14 grid gap-0">
                {pillars.map((p, i) => (
                  <div
                    key={p.n}
                    className="grid grid-cols-[3rem_1fr] gap-6 border-t py-8 md:grid-cols-[4rem_1fr_1fr] md:gap-10"
                    style={{ borderColor: VOID_BORDER }}
                  >
                    <span
                      className="font-mono text-xs pt-1"
                      style={{ color: CREAM_DIM }}
                    >
                      {p.n}
                    </span>
                    <h3
                      className="font-sans text-lg font-semibold tracking-tight"
                      style={{ color: CREAM }}
                    >
                      {p.label}
                    </h3>
                    <p
                      className="font-serif-display text-sm leading-relaxed"
                      style={{ color: CREAM_MUTED }}
                    >
                      {p.body}
                    </p>
                  </div>
                ))}
                <div
                  className="border-t"
                  style={{ borderColor: VOID_BORDER }}
                />
              </div>
            </Container>
          </section>
        </SectionReveal>

        {/* ─── FUTURE MANIFESTO ─── */}
        <SectionReveal amount={0.06}>
          <section
            className="border-b border-t py-20 md:py-28"
            style={{ background: VOID_SURFACE, borderColor: VOID_BORDER }}
          >
            <Container>
              <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
                <div className="lg:col-span-7">
                  <blockquote>
                    <p
                      className="font-sans font-bold leading-[1.08] tracking-tight"
                      style={{
                        fontSize: "clamp(1.7rem, 4vw, 3rem)",
                        color: CREAM,
                      }}
                    >
                      &ldquo;We are living through the fastest rewrite of
                      financial infrastructure in human history. Most are
                      watching. We&apos;re <Underline>inside it</Underline>
                      .&rdquo;
                    </p>
                    <footer className="mt-8 flex items-center gap-3">
                      <div
                        className="h-px w-8"
                        style={{ background: CREAM_DIM }}
                      />
                      <p
                        className="font-mono text-[11px] uppercase tracking-[0.18em]"
                        style={{ color: CREAM_DIM }}
                      >
                        Caliga · Research thesis
                      </p>
                    </footer>
                  </blockquote>
                </div>
                <div className="lg:col-span-5 lg:flex lg:flex-col lg:justify-end">
                  <div
                    className="border-l-2 pl-6"
                    style={{ borderColor: VOID_BORDER }}
                  >
                    <p
                      className="font-serif-display text-base leading-relaxed"
                      style={{ color: CREAM_MUTED }}
                    >
                      Crypto, fintech, and deep tech are not separate bets. They
                      are a single thesis: the infrastructure layer of the next
                      economy is being built right now, and the window to
                      understand it clearly is narrow.
                    </p>
                    <p
                      className="mt-4 font-serif-display text-sm leading-relaxed"
                      style={{ color: CREAM_DIM }}
                    >
                      We exist to keep that window open—through research anyone
                      can read and capital deployed with discipline.
                    </p>
                  </div>
                </div>
              </div>
            </Container>
          </section>
        </SectionReveal>

        {/* ─── TEAM ─── */}
        <SectionReveal amount={0.07}>
          <section
            id="team"
            className="scroll-mt-24 py-20 md:py-28"
            style={{ background: VOID }}
          >
            <Container>
              <p
                className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em]"
                style={{ color: CREAM_DIM }}
              >
                Team
              </p>
              <h2
                className="font-sans font-bold leading-[1.06] tracking-tight"
                style={{
                  fontSize: "clamp(1.85rem, 4vw, 3.25rem)",
                  color: CREAM,
                }}
              >
                Two seats. <Underline>One research bar.</Underline>
              </h2>
              <p
                className="mt-3 max-w-2xl font-serif-display text-base leading-relaxed"
                style={{ color: CREAM_MUTED }}
              >
                Operators and researchers who publish before they pitch.
              </p>
              <StaggerOnView className="mt-14 grid gap-8 md:grid-cols-2">
                {team.map((member, i) => {
                  const CardBg = i === 0 ? PixelMountain : PixelHammer;
                  return (
                    <StaggerItem key={member.handle}>
                      <article
                        className="relative flex h-full flex-col overflow-hidden border"
                        style={{
                          borderColor: VOID_BORDER,
                          background: VOID_SURFACE,
                        }}
                      >
                        <div
                          className="pointer-events-none absolute inset-0 opacity-20"
                          aria-hidden
                        >
                          <CardBg accentRgb={[237, 233, 224]} />
                        </div>
                        <div className="relative flex justify-center px-7 pt-7 md:justify-start">
                          <div
                            className="relative aspect-[4/5] w-[min(100%,10rem)] shrink-0 overflow-hidden ring-1 sm:w-[10.5rem] md:w-[9.25rem] lg:w-[10rem]"
                            style={
                              { background: "#1e1e1e" } as React.CSSProperties
                            }
                          >
                            <Image
                              src={member.image}
                              alt={`${member.handle}, ${member.role}`}
                              fill
                              sizes="(max-width: 768px) 160px, 200px"
                              className="object-cover opacity-90"
                            />
                          </div>
                        </div>
                        <div className="relative flex flex-1 flex-col px-7 pb-7 pt-6">
                          <div
                            className="h-px w-10"
                            style={{ background: CREAM + "55" }}
                          />
                          <p
                            className="mt-4 font-mono text-[10px] font-medium uppercase tracking-[0.2em]"
                            style={{ color: CREAM }}
                          >
                            {member.handle}
                            <span
                              className="mx-1.5 font-normal"
                              style={{ color: CREAM_DIM }}
                            >
                              ·
                            </span>
                            <span style={{ color: CREAM_MUTED }}>
                              {member.city}
                            </span>
                          </p>
                          <p
                            className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em]"
                            style={{ color: CREAM_DIM }}
                          >
                            Founder
                          </p>
                          <h3
                            className="mt-3 font-sans text-lg font-semibold tracking-tight"
                            style={{ color: CREAM }}
                          >
                            {member.role}
                          </h3>
                          <p
                            className="mt-3 flex-1 font-serif-display text-sm leading-relaxed"
                            style={{ color: CREAM_MUTED }}
                          >
                            {member.blurb}
                          </p>
                          <a
                            href={member.xUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 inline-flex w-fit font-mono text-[10px] uppercase tracking-[0.16em] underline underline-offset-4 transition-opacity hover:opacity-60"
                            style={{
                              color: CREAM_MUTED,
                              textDecorationColor: VOID_BORDER,
                            }}
                          >
                            Profile on X ↗
                          </a>
                        </div>
                      </article>
                    </StaggerItem>
                  );
                })}
              </StaggerOnView>
            </Container>
          </section>
        </SectionReveal>

        {/* ─── CONTACT ─── */}
        <SectionReveal amount={0.07}>
          <section
            id="contact"
            className="scroll-mt-24 border-t py-20 md:py-28"
            style={{ background: CREAM, borderColor: "#ccc5bb" }}
          >
            <Container>
              <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
                <div>
                  <p
                    className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em]"
                    style={{ color: "#8a847e" }}
                  >
                    Contact
                  </p>
                  <h2
                    className="font-sans font-bold leading-[1.06] tracking-tight"
                    style={{
                      fontSize: "clamp(1.85rem, 4vw, 3.25rem)",
                      color: VOID,
                    }}
                  >
                    Building at the <LightU>frontier</LightU>?
                  </h2>
                  <p
                    className="mt-5 font-serif-display text-base leading-relaxed md:text-lg"
                    style={{ color: "#4a4540" }}
                  >
                    Share the problem, what&apos;s already built, and what you
                    want pressure-tested. We reply when the research can add
                    real leverage—capital is downstream and optional.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <a
                      href={SOCIAL_X_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] font-medium transition-opacity hover:opacity-80"
                      style={{ background: VOID, color: CREAM }}
                    >
                      Message on X
                    </a>
                    <a
                      href="mailto:hello@efimov.xyz"
                      className="inline-flex items-center border px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] font-medium transition-colors hover:border-[#111]"
                      style={{ borderColor: "#ccc5bb", color: VOID }}
                    >
                      Email us
                    </a>
                  </div>
                </div>
                <div
                  className="border p-8 md:p-10"
                  style={{ borderColor: "#ccc5bb", background: "white" }}
                >
                  <p
                    className="font-mono text-[11px] uppercase tracking-[0.16em]"
                    style={{ color: "#8a847e" }}
                  >
                    Operating note
                  </p>
                  <p
                    className="mt-6 font-sans text-xl font-semibold leading-snug"
                    style={{ color: VOID }}
                  >
                    Frontier tech rewards teams that can show mechanism, not
                    just momentum. Our default output is research you can
                    fork—not a deck you admire once.
                  </p>
                  <p
                    className="mt-4 font-serif-display text-base leading-relaxed"
                    style={{ color: "#6a6460" }}
                  >
                    When we allocate, it is narrow, repeatable, and always late
                    in the process—never a substitute for the work product.
                  </p>
                </div>
              </div>
            </Container>
          </section>
        </SectionReveal>
      </main>
      <Footer />
    </div>
  );
}
