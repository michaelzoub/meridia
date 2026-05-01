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

const CREAM = "#ece8df";
const INK = "#111111";
const WARM_MUTED = "#7a7068";
const WARM_BORDER = "#ccc5bb";

const researchPillars = [
  {
    n: "01",
    label: "Primary research",
    body: "Long-form memos, scenario tables, and reproducible dashboards. Sources cited, method open, steps traceable.",
  },
  {
    n: "02",
    label: "Technical depth",
    body: "Chain-native metrics, adversarial reviews, agent-assisted synthesis. We read the code—not just the deck.",
  },
  {
    n: "03",
    label: "Selective capital",
    body: "Early, concentrated, always downstream of work you can stress-test. We say no far more than yes.",
  },
];

const domains = [
  { label: "Crypto & protocols", detail: "L1/L2, DeFi, custody" },
  { label: "Fintech rails", detail: "Infrastructure, wallets" },
  { label: "Frontier AI", detail: "Systems, agents, compute" },
  { label: "Robotics", detail: "Hardware–software layers" },
];

const approachSteps = [
  {
    n: "01",
    title: "Research is the product",
    body: "We publish memos, models, and datasets you can trace—protocol economics, security assumptions, frontier compute, and explicit what-has-to-be-true statements. The method stays inspectable.",
  },
  {
    n: "02",
    title: "Deliberate scope",
    body: "Crypto networks, fintech rails, L1/L2 and DeFi plumbing, wallets and infra, AI systems, robotics, and the messy layers in between—we say no when the work doesn't match the bar.",
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
      "Graduate training with VC exposure—deep on analytics, modelling, and company analysis. Former owner of a contracting business; brings operator judgment to diligence.",
  },
  {
    handle: "Kafka",
    image: "/kafka.jpg",
    role: "Technical research",
    city: "NYC",
    xUrl: "https://x.com/wenkafka",
    blurb:
      "Computer science background; hands-on engineering. Codes, reviews, and stress-tests assumptions across protocol and infrastructure stacks.",
  },
];

export const metadata: Metadata = {
  title: "Caliga — Research at the frontier",
  description:
    "Research and capital that finds the frontier before the crowd. Caliga is a research collective covering crypto, fintech, deep tech, and frontier AI.",
  robots: { index: false, follow: true },
};

function U({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="underline decoration-[3px] underline-offset-[10px]"
      style={{ textDecorationColor: INK }}
    >
      {children}
    </span>
  );
}

function DarkU({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="underline decoration-[2px] underline-offset-[8px]"
      style={{ textDecorationColor: CREAM }}
    >
      {children}
    </span>
  );
}

export default function Variation2Page() {
  return (
    <div style={{ background: CREAM }} className="text-[#111111]">
      <Header />
      <main>
        {/* ─── HERO ─── */}
        <HeroEntrance>
          <section className="relative flex min-h-[calc(100svh-6.5rem)] flex-col overflow-hidden py-14 md:min-h-[calc(100svh-7rem)] md:py-20">
            <HeroStaggerRoot className="flex flex-1 flex-col justify-between gap-16">
              {/* Top: massive headline */}
              <Container>
                <HeroStaggerChild>
                  <HeroColumnStagger>
                    <HeroLineItem>
                      <p
                        className="font-mono text-[11px] uppercase tracking-[0.22em]"
                        style={{ color: WARM_MUTED }}
                      >
                        Caliga · Research collective
                      </p>
                    </HeroLineItem>
                    <HeroLineItem className="mt-7">
                      <h1
                        className="font-sans font-black leading-[1.00] tracking-[-0.025em]"
                        style={{
                          fontSize: "clamp(2.75rem, 8.5vw, 6.25rem)",
                          color: INK,
                        }}
                      >
                        Research that sees the <U>future</U> before it&apos;s{" "}
                        <U>obvious</U>
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
                      style={{ color: "#3d3830" }}
                    >
                      Technology is rewriting the rules of finance and human
                      coordination. Caliga exists to understand those rules
                      before they&apos;re written—and back the people writing
                      them.
                    </p>
                    <div className="flex flex-col justify-end gap-6">
                      <p
                        className="font-mono text-[11px] uppercase tracking-[0.2em]"
                        style={{ color: WARM_MUTED }}
                      >
                        Crypto · Fintech · Deep tech · Frontier AI · Robotics
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <a
                          href="/variation2#contact"
                          className="inline-flex items-center px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] font-medium transition-opacity hover:opacity-80"
                          style={{ background: INK, color: CREAM }}
                        >
                          Collaborate
                        </a>
                        <a
                          href="/variation2#approach"
                          className="inline-flex items-center border px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] font-medium transition-colors hover:border-[#111111]"
                          style={{ borderColor: WARM_BORDER, color: INK }}
                        >
                          Our approach
                        </a>
                      </div>
                    </div>
                  </div>
                </HeroStaggerChild>
              </Container>
            </HeroStaggerRoot>
          </section>
        </HeroEntrance>

        {/* ─── DARK FEATURE CARD ─── */}
        <SectionReveal amount={0.06}>
          <div className="px-4 md:px-6 lg:px-8">
            <div className="p-10 md:p-16 lg:p-20" style={{ background: INK }}>
              <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
                <div>
                  <p
                    className="mb-6 font-mono text-[10px] uppercase tracking-[0.22em]"
                    style={{ color: "#6a6a6a" }}
                  >
                    Research practice
                  </p>
                  <h2
                    className="font-sans font-bold leading-[1.06] tracking-tight"
                    style={{
                      fontSize: "clamp(1.85rem, 4vw, 3.25rem)",
                      color: CREAM,
                    }}
                  >
                    Rigorous work ships <DarkU>first</DarkU>. Capital follows.
                  </h2>
                  <p
                    className="mt-6 font-serif-display text-base leading-relaxed md:text-lg"
                    style={{ color: "#a8a29c" }}
                  >
                    We publish memos, models, and datasets you can
                    trace—protocol economics, security assumptions, frontier
                    compute. Evidence beats narrative, every time.
                  </p>
                </div>
                <div>
                  {researchPillars.map((item) => (
                    <div
                      key={item.n}
                      className="flex gap-6 border-t py-7"
                      style={{ borderColor: "#222222" }}
                    >
                      <span
                        className="shrink-0 pt-0.5 font-mono text-xs"
                        style={{ color: "#555555" }}
                      >
                        {item.n}
                      </span>
                      <div>
                        <p
                          className="font-sans text-sm font-semibold"
                          style={{ color: CREAM }}
                        >
                          {item.label}
                        </p>
                        <p
                          className="mt-1.5 font-serif-display text-sm leading-relaxed"
                          style={{ color: "#8a847e" }}
                        >
                          {item.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SectionReveal>

        {/* ─── WHY WE EXIST ─── */}
        <SectionReveal amount={0.07}>
          <section className="py-20 md:py-32" style={{ background: CREAM }}>
            <Container>
              <div className="grid items-start gap-14 lg:grid-cols-12 lg:gap-16">
                <div className="lg:col-span-5">
                  <p
                    className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em]"
                    style={{ color: WARM_MUTED }}
                  >
                    Why we exist
                  </p>
                  <h2
                    className="font-sans font-bold leading-[1.06] tracking-tight"
                    style={{
                      fontSize: "clamp(1.85rem, 4vw, 3.25rem)",
                      color: INK,
                    }}
                  >
                    The best outcomes are{" "}
                    <span
                      className="underline decoration-[2.5px] underline-offset-[8px]"
                      style={{ textDecorationColor: INK }}
                    >
                      under-published
                    </span>
                    , not under-hyped.
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:pt-16">
                  <p
                    className="font-serif-display text-lg leading-relaxed md:text-xl"
                    style={{ color: "#3d3830" }}
                  >
                    Frontier technology creates information asymmetry at scale.
                    The teams that understand mechanism—not just
                    momentum—consistently reach outcomes the market misses.
                  </p>
                  <p
                    className="mt-5 font-serif-display text-base leading-relaxed"
                    style={{ color: WARM_MUTED }}
                  >
                    We bias toward founders who want reviewers that read code,
                    cite sources, and write the uncomfortable questions into the
                    appendix. Capital is downstream and optional.
                  </p>
                  <div
                    className="mt-10 grid grid-cols-2 gap-5 border-t pt-8 sm:grid-cols-4"
                    style={{ borderColor: WARM_BORDER }}
                  >
                    {domains.map((d) => (
                      <div key={d.label}>
                        <p
                          className="font-sans text-sm font-semibold"
                          style={{ color: INK }}
                        >
                          {d.label}
                        </p>
                        <p
                          className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em]"
                          style={{ color: WARM_MUTED }}
                        >
                          {d.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Container>
          </section>
        </SectionReveal>

        {/* ─── BOLD FUTURE STATEMENT ─── */}
        <SectionReveal amount={0.06}>
          <section
            className="border-b border-t py-20 md:py-28"
            style={{ background: "#e4dfd6", borderColor: WARM_BORDER }}
          >
            <Container>
              <blockquote className="max-w-5xl">
                <p
                  className="font-sans font-bold leading-[1.1] tracking-tight"
                  style={{
                    fontSize: "clamp(1.65rem, 3.8vw, 2.85rem)",
                    color: INK,
                  }}
                >
                  &ldquo;The next decade will be defined by who understood the
                  technology before it was{" "}
                  <span
                    className="underline decoration-[2.5px] underline-offset-[7px]"
                    style={{ textDecorationColor: INK }}
                  >
                    consensus
                  </span>
                  —and who acted on that understanding first.&rdquo;
                </p>
                <footer className="mt-8 flex items-center gap-3">
                  <div
                    className="h-px w-8"
                    style={{ background: WARM_MUTED }}
                  />
                  <p
                    className="font-mono text-[11px] uppercase tracking-[0.18em]"
                    style={{ color: WARM_MUTED }}
                  >
                    Caliga · Research thesis
                  </p>
                </footer>
              </blockquote>
            </Container>
          </section>
        </SectionReveal>

        {/* ─── APPROACH ─── */}
        <SectionReveal amount={0.07}>
          <section
            id="approach"
            className="scroll-mt-24 py-20 md:py-28"
            style={{ background: CREAM }}
          >
            <Container>
              <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
                <div>
                  <p
                    className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em]"
                    style={{ color: WARM_MUTED }}
                  >
                    Approach
                  </p>
                  <h2
                    className="font-sans font-bold leading-[1.06] tracking-tight"
                    style={{
                      fontSize: "clamp(1.85rem, 4vw, 3.25rem)",
                      color: INK,
                    }}
                  >
                    One research bar.{" "}
                    <span
                      className="underline decoration-[2.5px] underline-offset-[8px]"
                      style={{ textDecorationColor: INK }}
                    >
                      No shortcuts
                    </span>
                    .
                  </h2>
                  <p
                    className="mt-5 font-serif-display text-base leading-relaxed"
                    style={{ color: "#3d3830" }}
                  >
                    When we deploy capital it is early, concentrated, and always
                    downstream of work you can read and stress-test. Capital is
                    secondary and selective.
                  </p>
                </div>
                <div
                  className="border"
                  style={{ borderColor: WARM_BORDER, background: "white" }}
                >
                  {approachSteps.map((step, i, arr) => (
                    <div key={step.n}>
                      <div className="px-7 py-8 md:px-10 md:py-9">
                        <div className="flex gap-5">
                          <span
                            className="shrink-0 pt-0.5 font-mono text-xs"
                            style={{ color: WARM_MUTED }}
                          >
                            {step.n}
                          </span>
                          <div>
                            <h3
                              className="font-sans text-base font-semibold tracking-tight"
                              style={{ color: INK }}
                            >
                              {step.title}
                            </h3>
                            <p
                              className="mt-2 font-serif-display text-sm leading-relaxed"
                              style={{ color: "#5a5550" }}
                            >
                              {step.body}
                            </p>
                          </div>
                        </div>
                      </div>
                      {i < arr.length - 1 && (
                        <div
                          className="border-t"
                          style={{ borderColor: WARM_BORDER }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Container>
          </section>
        </SectionReveal>

        {/* ─── TEAM ─── */}
        <SectionReveal amount={0.07}>
          <section
            id="team"
            className="scroll-mt-24 border-t py-20 md:py-28"
            style={{ background: "#e4dfd6", borderColor: WARM_BORDER }}
          >
            <Container>
              <p
                className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em]"
                style={{ color: WARM_MUTED }}
              >
                Team
              </p>
              <h2
                className="font-sans font-bold leading-[1.06] tracking-tight"
                style={{ fontSize: "clamp(1.85rem, 4vw, 3.25rem)", color: INK }}
              >
                Two seats.{" "}
                <span
                  className="underline decoration-[2.5px] underline-offset-[8px]"
                  style={{ textDecorationColor: INK }}
                >
                  One research bar.
                </span>
              </h2>
              <p
                className="mt-3 max-w-2xl font-serif-display text-sm leading-relaxed md:text-base"
                style={{ color: WARM_MUTED }}
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
                          borderColor: WARM_BORDER,
                          background: "white",
                        }}
                      >
                        <div
                          className="pointer-events-none absolute inset-0 opacity-40"
                          aria-hidden
                        >
                          <CardBg />
                        </div>
                        <div className="relative flex justify-center px-7 pt-7 md:justify-start">
                          <div
                            className="relative aspect-[4/5] w-[min(100%,10rem)] shrink-0 overflow-hidden ring-1 sm:w-[10.5rem] md:w-[9.25rem] lg:w-[10rem]"
                            style={
                              {
                                background: "#e0dbd3",
                                ringColor: WARM_BORDER,
                              } as React.CSSProperties
                            }
                          >
                            <Image
                              src={member.image}
                              alt={`${member.handle}, ${member.role}`}
                              fill
                              sizes="(max-width: 768px) 160px, 200px"
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <div className="relative flex flex-1 flex-col px-7 pb-7 pt-6">
                          <div
                            className="h-px w-10"
                            style={{ background: INK + "cc" }}
                          />
                          <p
                            className="mt-4 font-mono text-[10px] font-medium uppercase tracking-[0.2em]"
                            style={{ color: INK }}
                          >
                            {member.handle}
                            <span
                              className="mx-1.5 font-normal"
                              style={{ color: "#b0a89e" }}
                            >
                              ·
                            </span>
                            <span style={{ color: WARM_MUTED }}>
                              {member.city}
                            </span>
                          </p>
                          <p
                            className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em]"
                            style={{ color: "#b0a89e" }}
                          >
                            Founder
                          </p>
                          <h3
                            className="mt-3 font-sans text-lg font-semibold tracking-tight"
                            style={{ color: INK }}
                          >
                            {member.role}
                          </h3>
                          <p
                            className="mt-3 flex-1 font-serif-display text-sm leading-relaxed"
                            style={{ color: "#5a5550" }}
                          >
                            {member.blurb}
                          </p>
                          <a
                            href={member.xUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 inline-flex w-fit font-mono text-[10px] uppercase tracking-[0.16em] underline underline-offset-4 transition-opacity hover:opacity-60"
                            style={{
                              color: WARM_MUTED,
                              textDecorationColor: WARM_BORDER,
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
            className="scroll-mt-24 py-20 md:py-28"
            style={{ background: INK, color: CREAM }}
          >
            <Container>
              <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
                <div>
                  <p
                    className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em]"
                    style={{ color: "#666666" }}
                  >
                    Contact
                  </p>
                  <h2
                    className="font-sans font-bold leading-[1.06] tracking-tight"
                    style={{
                      fontSize: "clamp(1.85rem, 4vw, 3.25rem)",
                      color: CREAM,
                    }}
                  >
                    Building at the <DarkU>frontier</DarkU>?
                  </h2>
                  <p
                    className="mt-5 font-serif-display text-base leading-relaxed md:text-lg"
                    style={{ color: "#a8a29c" }}
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
                      style={{ background: CREAM, color: INK }}
                    >
                      Message on X
                    </a>
                    <a
                      href="mailto:hello@efimov.xyz"
                      className="inline-flex items-center border px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] font-medium transition-colors hover:border-white"
                      style={{ borderColor: "#333333", color: CREAM }}
                    >
                      Email us
                    </a>
                  </div>
                </div>
                <div
                  className="border p-8 md:p-10"
                  style={{ borderColor: "#2a2a2a" }}
                >
                  <p
                    className="font-mono text-[11px] uppercase tracking-[0.16em]"
                    style={{ color: "#555555" }}
                  >
                    Operating note
                  </p>
                  <p
                    className="mt-6 font-sans text-xl font-semibold leading-snug"
                    style={{ color: CREAM }}
                  >
                    Frontier tech rewards teams that can show mechanism, not
                    just momentum. Our default output is research you can
                    fork—not a deck you admire once.
                  </p>
                  <p
                    className="mt-4 font-serif-display text-base leading-relaxed"
                    style={{ color: "#8a847e" }}
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
