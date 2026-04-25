import type { Metadata } from "next";
import Image from "next/image";

import { AuroraBackground } from "@/components/backgrounds/AuroraBackground";
import { AtAGlanceFloatingPaths } from "@/components/backgrounds/FloatingPaths";
import GameOfLife from "@/components/backgrounds/GameOfLife";
import OpenNetworkAnimation from "@/components/backgrounds/OpenNetworkAnimation";
import TreeAnimation from "@/components/backgrounds/TreeAnimation";
import PixelBlast from "@/components/backgrounds/PixelBlast";
import PixelHammer from "@/components/backgrounds/PixelHammer";
import PixelMountain from "@/components/backgrounds/PixelMountain";
import Threads from "@/components/backgrounds/Threads";
import { TopographyBackground } from "@/components/backgrounds/TopographyBackground";
import { FlickeringGrid } from "@/components/effects/FlickeringGrid";
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

// ── Palette ──────────────────────────────────────────────────────────────────
const HERO_BG = "#f5f4f0"; // matches TopographyBackground fill
const WHITE = "#ffffff";
const INK = "#111111";
const DARK_SECTION = "#0e0e0e";
const RULE = "#e0dcd8";
const MUTED = "#8a8680";
const DIM = "#b8b4b0";
const AMBER = "#c47a30";

// ── Font helpers (matching homepage font conventions) ─────────────────────────
// Inline mixing of Instrument Serif italic + Geist Sans semibold — same technique
// as homepage: `font-serif-display text-[1.05em] font-semibold italic`.
function Serif({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-serif-display font-semibold italic">{children}</span>
  );
}

function Faded({ children }: { children: React.ReactNode }) {
  return <span style={{ color: DIM }}>{children}</span>;
}

function Accent({ children }: { children: React.ReactNode }) {
  return <span style={{ color: AMBER }}>{children}</span>;
}

// ── Data ─────────────────────────────────────────────────────────────────────
const researchAreas = [
  {
    label: "Crypto & protocols",
    sub: "L1/L2 · DeFi · Custody",
    body: "Protocol economics, security assumptions, on-chain metrics, and the adversarial edge cases that standard diligence misses.",
    // PixelBlast (cyan) — same palette used on homepage "Collective" card
    bg: (
      <PixelBlast
        variant="square"
        pixelSize={2}
        color="#cffafe"
        patternScale={2}
        patternDensity={1}
        pixelSizeJitter={0}
        enableRipples
        rippleSpeed={0.38}
        rippleThickness={0.12}
        rippleIntensityScale={1.4}
        liquid={false}
        speed={0.48}
        edgeFade={0.28}
        transparent
      />
    ),
  },
  {
    label: "Fintech rails",
    sub: "Payments · Wallets · Settlement",
    body: "Cross-border infrastructure, wallet stacks, regulatory surface area—traced at the implementation level.",
    // PixelBlast (warm amber) — distinct from cyan card
    bg: (
      <PixelBlast
        variant="square"
        pixelSize={2}
        color="#fde68a"
        patternScale={2}
        patternDensity={1}
        pixelSizeJitter={0}
        enableRipples
        rippleSpeed={0.35}
        rippleThickness={0.12}
        rippleIntensityScale={1.3}
        liquid={false}
        speed={0.44}
        edgeFade={0.3}
        transparent
      />
    ),
  },
  {
    label: "Frontier AI",
    sub: "Agents · Compute · Inference",
    body: "Agent pipelines, inference hardware, emerging compute paradigms. We stress-test architecture—not just the demo.",
    // FlickeringGrid — signals the "AI" / computational character
    bg: (
      <FlickeringGrid
        className="absolute inset-0 h-full w-full"
        color="rgb(196, 122, 48)"
        squareSize={3}
        gridGap={7}
        flickerChance={0.05}
        maxOpacity={0.18}
      />
    ),
  },
  {
    label: "Robotics & deep tech",
    sub: "Hardware–software · Sensors",
    body: "Embedded systems, physical-digital interfaces, and the hardware layers adjacent to financial infrastructure.",
    // Threads — flowing, organic feel for hardware/physical layer
    bg: (
      <Threads
        color={[0.77, 0.6, 0.38]}
        amplitude={0.8}
        distance={0}
        enableMouseInteraction
      />
    ),
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
    Bg: PixelMountain,
  },
  {
    handle: "Kafka",
    image: "/kafka.jpg",
    role: "Technical research",
    city: "NYC",
    xUrl: "https://x.com/wenkafka",
    blurb:
      "Computer science background; hands-on engineering with projects spanning YC- and Paradigm-style stacks. Codes, reviews, and stress-tests assumptions.",
    Bg: PixelHammer,
  },
];

export const metadata: Metadata = {
  title: "Caliga — Research before the revolution is obvious",
  description:
    "A research collective for the technology that changes everything. Caliga covers crypto, fintech, deep tech, and frontier AI.",
  robots: { index: false, follow: true },
};

export default function Variation5Page() {
  return (
    <div style={{ background: HERO_BG }} className="text-[#111111]">
      <Header />
      <main>
        {/* ─── HERO: TopographyBackground + mixed Fraîche typography ─── */}
        <HeroEntrance>
          <section className="relative flex min-h-[calc(100svh-6.5rem)] flex-col justify-center overflow-hidden py-16 md:min-h-[calc(100svh-7rem)] md:py-24">
            {/* Topographic animation — same component as homepage hero */}
            <TopographyBackground
              lineCount={20}
              lineColor="rgba(180, 140, 60, 0.18)"
              backgroundColor={HERO_BG}
              speed={0.8}
              strokeWidth={0.6}
            />

            <Container className="relative z-[1]">
              <HeroStaggerRoot>
                <HeroStaggerChild>
                  <HeroColumnStagger className="max-w-4xl">
                    <HeroLineItem>
                      <p
                        className="mb-8 font-mono text-[11px] uppercase tracking-[0.2em]"
                        style={{ color: MUTED }}
                      >
                        Caliga · Research collective
                      </p>
                    </HeroLineItem>

                    {/*
                     * Fraîche technique — matches homepage pattern exactly:
                     * `font-sans font-semibold` base, with inline
                     * `font-serif-display font-semibold italic` spans for the serif words.
                     * Faded words use the DIM colour for visual rhythm.
                     */}
                    <HeroLineItem>
                      <h1
                        className="font-sans font-semibold leading-[1.08] tracking-tight"
                        style={{
                          fontSize: "clamp(2rem, 5.5vw, 3.75rem)",
                          color: INK,
                        }}
                      >
                        <Faded>We research the</Faded>{" "}
                        <Serif>technologies</Serif>
                        <br />
                        <Faded>that are</Faded> rewriting the
                        <br />
                        <Accent>fabric of tech</Accent>—<Serif>before</Serif>
                        <br />
                        <Faded>the</Faded>{" "}
                        <Serif>revolution becomes obvious.</Serif>
                      </h1>
                    </HeroLineItem>

                    <HeroLineItem className="mt-8">
                      <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
                        <p
                          className="font-serif-display text-base leading-relaxed md:text-lg"
                          style={{ color: "#4a4540" }}
                        >
                          Caliga is a two-seat research collective at the
                          frontier of crypto, fintech, deep tech, and frontier
                          AI. We publish before we pitch—and we pitch rarely.
                        </p>
                        <div className="flex flex-col justify-center gap-4">
                          <p
                            className="font-mono text-[11px] uppercase tracking-[0.2em]"
                            style={{ color: MUTED }}
                          >
                            Crypto · Fintech · Deep tech · Frontier AI
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <a
                              href="/variation5#contact"
                              className="inline-flex items-center px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] font-medium transition-opacity hover:opacity-80"
                              style={{ background: INK, color: WHITE }}
                            >
                              Collaborate
                            </a>
                            <a
                              href="/variation5#research"
                              className="inline-flex items-center border px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] font-medium transition-colors hover:border-[#111]"
                              style={{ borderColor: RULE, color: INK }}
                            >
                              Our research
                            </a>
                          </div>
                        </div>
                      </div>
                    </HeroLineItem>
                  </HeroColumnStagger>
                </HeroStaggerChild>
              </HeroStaggerRoot>
            </Container>
          </section>
        </HeroEntrance>

        {/* ─── DARK MANIFESTO ─── */}
        <SectionReveal amount={0.06}>
          <section
            className="relative overflow-hidden py-20 md:py-32"
            style={{ background: DARK_SECTION }}
          >
            {/* Aurora — very faint gray shimmer on near-black, barely visible */}
            <AuroraBackground
              animationSpeed={90}
              opacity={0.13}
              colors={["#2a2a2a", "#383838", "#454545", "#303030", "#252525"]}
            />
            <Container>
              <p
                className="mb-8 font-mono text-[10px] font-medium uppercase tracking-[0.22em]"
                style={{ color: "#555" }}
              >
                Why we exist
              </p>

              {/*
               * Fraîche mid-sentence style switch:
               * Some words in font-serif-display italic (Instrument Serif),
               * others in font-sans semibold (Geist Sans),
               * some faded with opacity — all at font-semibold weight.
               */}
              <h2
                className="max-w-4xl font-sans font-semibold leading-[1.12] tracking-tight"
                style={{
                  fontSize: "clamp(1.9rem, 4.5vw, 3.75rem)",
                  color: WHITE,
                }}
              >
                The best outcomes are{" "}
                <span style={{ color: "#3a3a3a" }}>nothing short of</span>{" "}
                <span
                  className="font-serif-display font-semibold italic"
                  style={{ color: WHITE }}
                >
                  under-published,
                </span>{" "}
                <span style={{ color: "#3a3a3a" }}>under-researched, and</span>{" "}
                <span
                  className="font-serif-display font-semibold italic"
                  style={{ color: AMBER }}
                >
                  over-waited-for.
                </span>
              </h2>

              <div className="mt-12 grid gap-8 lg:grid-cols-2">
                <p
                  className="font-serif-display text-lg leading-relaxed"
                  style={{ color: "#8a8880" }}
                >
                  Frontier technology creates information asymmetry at scale.
                  The teams that understand mechanism—not just
                  momentum—consistently reach outcomes the market misses. We
                  exist to correct that asymmetry.
                </p>
                <p
                  className="font-serif-display text-base leading-relaxed"
                  style={{ color: "#6a6662" }}
                >
                  We bias toward founders who want reviewers that read code,
                  cite sources, and write the uncomfortable questions into the
                  appendix—whether or not a check ever follows. Capital is
                  downstream and optional.
                </p>
              </div>
            </Container>
          </section>
        </SectionReveal>

        {/* ─── RESEARCH AREAS (commented out) ─── */}
        {(false as boolean) && <SectionReveal amount={0.07}>
          <section
            id="research"
            className="scroll-mt-24 border-b border-t py-16 md:py-24"
            style={{ background: "#f8f7f4", borderColor: RULE }}
          >
            <Container>
              <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
                <div className="lg:col-span-4">
                  <p
                    className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.22em]"
                    style={{ color: MUTED }}
                  >
                    Research areas
                  </p>
                  <h2
                    className="font-sans font-semibold leading-tight tracking-tight text-3xl md:text-4xl"
                    style={{ color: INK }}
                  >
                    We are guided by <Serif>four clear</Serif> domains.
                  </h2>
                  <p
                    className="mt-5 font-serif-display text-base leading-relaxed"
                    style={{ color: "#5a5550" }}
                  >
                    Within each, a single bar: primary research, open
                    methodology, and explicit what-has-to-be-true statements. We
                    say no when the work doesn&apos;t fit.
                  </p>
                </div>

                <div className="lg:col-span-8">
                  <StaggerOnView className="grid gap-6 sm:grid-cols-2">
                    {researchAreas.map((area, i) => (
                      <StaggerItem key={area.label}>
                        {/* relative + overflow-hidden so bg animation is clipped to card */}
                        <div
                          className="relative overflow-hidden border p-6"
                          style={{ borderColor: RULE, background: WHITE }}
                        >
                          {/* Background animation — pointer-events-none so it doesn't block text */}
                          <div
                            className="pointer-events-none absolute inset-0"
                            aria-hidden
                          >
                            {area.bg}
                          </div>
                          <div className="relative">
                            <p
                              className="font-mono text-[10px] font-medium uppercase tracking-[0.16em]"
                              style={{ color: MUTED }}
                            >
                              {area.sub}
                            </p>
                            <h3
                              className="mt-3 font-sans text-lg font-semibold tracking-tight"
                              style={{ color: INK }}
                            >
                              {area.label}
                            </h3>
                            <p
                              className="mt-2 font-serif-display text-sm leading-relaxed"
                              style={{ color: "#6a6560" }}
                            >
                              {area.body}
                            </p>
                            <div
                              className="mt-5 h-px w-12"
                              style={{ background: i % 2 === 0 ? AMBER : INK }}
                            />
                          </div>
                        </div>
                      </StaggerItem>
                    ))}
                  </StaggerOnView>
                </div>
              </div>
            </Container>
          </section>
        </SectionReveal>}

        {/* ─── THE METHOD ─── */}
        <SectionReveal amount={0.06}>
          <section
            className="relative overflow-hidden border-b py-16 md:py-24"
            style={{ background: WHITE, borderColor: RULE }}
          >
            {/* Conway's Game of Life — dark cells on white, very subtle */}
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <GameOfLife cellSize={4} color="#111111" speed={650} opacity={0.028} density={0.14} />
            </div>
            <Container>
              <div className="mx-auto max-w-4xl">
                <p
                  className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-center"
                  style={{ color: MUTED }}
                >
                  The method
                </p>
                <h2
                  className="font-sans font-semibold leading-tight tracking-tight text-3xl md:text-4xl text-center"
                  style={{ color: INK }}
                >
                  Research <Serif>first.</Serif>{" "}
                  <span style={{ color: DIM }}>Capital is</span>{" "}
                  <span style={{ color: AMBER }}>downstream</span>{" "}
                  <span style={{ color: DIM }}>and optional.</span>
                </h2>
                <p
                  className="mx-auto mt-6 max-w-2xl font-serif-display text-base leading-relaxed text-center md:text-lg"
                  style={{ color: "#5a5550" }}
                >
                  When we deploy capital it is early, concentrated, and always
                  downstream of work you can read and stress-test. We publish
                  memos, models, and datasets you can trace—protocol economics,
                  security assumptions, frontier compute.
                </p>

                {/* Three method pillars — agent-assisted card has FlickeringGrid */}
                <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
                  {/* Open methodology */}
                  <div className="relative overflow-hidden border p-6" style={{ borderColor: RULE, background: WHITE }}>
                    <div className="pointer-events-none absolute inset-0" aria-hidden>
                      <OpenNetworkAnimation color="#111111" opacity={0.09} nodeCount={11} />
                    </div>
                    <div className="relative">
                      <p
                        className="font-sans font-semibold text-sm"
                        style={{ color: INK }}
                      >
                        Open methodology
                      </p>
                      <p
                        className="mt-2 font-serif-display text-sm leading-relaxed"
                        style={{ color: MUTED }}
                      >
                        Sources cited. Steps reproducible. No black box.
                      </p>
                    </div>
                  </div>

                  {/* Adversarial review */}
                  <div className="relative overflow-hidden border p-6" style={{ borderColor: RULE, background: WHITE }}>
                    <div className="pointer-events-none absolute inset-0" aria-hidden>
                      <TreeAnimation color="#111111" opacity={0.12} />
                    </div>
                    <div className="relative">
                      <p
                        className="font-sans font-semibold text-sm"
                        style={{ color: INK }}
                      >
                        Adversarial review
                      </p>
                      <p
                        className="mt-2 font-serif-display text-sm leading-relaxed"
                        style={{ color: MUTED }}
                      >
                        Uncomfortable questions go in the appendix.
                      </p>
                    </div>
                  </div>

                  {/* Agent-assisted — FlickeringGrid background signals the AI/computational character */}
                  <div
                    className="relative overflow-hidden border p-6"
                    style={{ borderColor: RULE, background: WHITE }}
                  >
                    <div
                      className="pointer-events-none absolute inset-0"
                      aria-hidden
                    >
                      <FlickeringGrid
                        className="absolute inset-0 h-full w-full"
                        color="rgb(196, 122, 48)"
                        squareSize={3}
                        gridGap={7}
                        flickerChance={0.06}
                        maxOpacity={0.2}
                      />
                    </div>
                    <div className="relative">
                      <p
                        className="font-sans font-semibold text-sm"
                        style={{ color: INK }}
                      >
                        Agent-assisted synthesis
                      </p>
                      <p
                        className="mt-2 font-serif-display text-sm leading-relaxed"
                        style={{ color: MUTED }}
                      >
                        AI on the desk—rigor scales without becoming opaque.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </section>
        </SectionReveal>

        {/* ─── TEAM: PixelMountain + PixelHammer, equal heights ─── */}
        <SectionReveal amount={0.07}>
          <section
            id="team"
            className="scroll-mt-24 border-b py-16 md:py-24"
            style={{ background: "#f8f7f4", borderColor: RULE }}
          >
            <Container>
              <p
                className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.22em]"
                style={{ color: MUTED }}
              >
                Team
              </p>
              <h2
                className="font-sans font-semibold leading-tight tracking-tight text-3xl md:text-4xl"
                style={{ color: INK }}
              >
                Two seats. <Serif>One research bar.</Serif>
              </h2>
              <p
                className="mt-3 max-w-2xl font-serif-display text-sm leading-relaxed md:text-base"
                style={{ color: MUTED }}
              >
                Operators and researchers who publish before they pitch.
              </p>

              {/*
               * items-stretch (CSS grid default) ensures both columns reach equal row height.
               * Each article is h-full so it fills the grid cell.
               */}
              <StaggerOnView className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:gap-12">
                {team.map((member) => {
                  const { Bg } = member;
                  return (
                    <StaggerItem key={member.handle} className="h-full">
                      <article className="relative flex h-full flex-col overflow-hidden border border-zinc-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                        {/* PixelMountain or PixelHammer — warm orangeish-brown accent */}
                        <div
                          className="pointer-events-none absolute inset-0 opacity-70"
                          aria-hidden
                        >
                          <Bg accentRgb={[201, 168, 124]} />
                        </div>

                        <div className="relative flex justify-center px-7 pt-7 md:justify-start">
                          <div className="relative aspect-[4/5] w-[min(100%,10rem)] shrink-0 overflow-hidden bg-zinc-100 ring-1 ring-zinc-200/90 sm:w-[10.5rem] md:w-[9.25rem] lg:w-[10rem]">
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
                          <div className="h-px w-10 bg-zinc-900/85" />
                          <p className="mt-4 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-900">
                            {member.handle}
                            <span className="mx-1.5 font-normal text-zinc-400">
                              ·
                            </span>
                            <span className="text-zinc-500">{member.city}</span>
                          </p>
                          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                            Founder
                          </p>
                          <h3 className="mt-3 font-sans text-lg font-semibold tracking-tight text-zinc-900">
                            {member.role}
                          </h3>
                          <p className="mt-3 flex-1 font-serif-display text-sm leading-relaxed text-zinc-600">
                            {member.blurb}
                          </p>
                          <a
                            href={member.xUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 inline-flex w-fit font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-700 underline decoration-zinc-300 underline-offset-4 transition-colors hover:text-zinc-900"
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
            style={{ background: DARK_SECTION }}
          >
            <Container>
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
                <div>
                  <p
                    className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.22em]"
                    style={{ color: "#555" }}
                  >
                    Contact
                  </p>
                  <h2
                    className="font-sans font-semibold leading-tight tracking-tight text-3xl md:text-4xl"
                    style={{ color: WHITE }}
                  >
                    Let&apos;s go further <Serif>together.</Serif>
                  </h2>
                  <p
                    className="mt-5 font-serif-display text-base leading-relaxed md:text-lg"
                    style={{ color: "#8a8880" }}
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
                      style={{ background: WHITE, color: INK }}
                    >
                      Message on X
                    </a>
                    <a
                      href="mailto:hello@efimov.xyz"
                      className="inline-flex items-center border px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] font-medium transition-colors hover:border-white"
                      style={{ borderColor: "#2a2a2a", color: WHITE }}
                    >
                      Email us
                    </a>
                  </div>
                </div>

                <div
                  className="relative overflow-hidden border p-8 md:p-10"
                  style={{ borderColor: "#1e1e1e" }}
                >
                  {/* Warm floating paths — orangeish-brown (#c9a87c) on near-black */}
                  <AtAGlanceFloatingPaths strokeColor="#c9a87c" />
                  <div className="relative">
                  <p
                    className="font-mono text-[11px] font-medium uppercase tracking-[0.16em]"
                    style={{ color: "#555" }}
                  >
                    Operating note
                  </p>
                  <p
                    className="mt-6 font-sans text-xl font-semibold leading-snug"
                    style={{ color: WHITE }}
                  >
                    Frontier tech rewards teams that can show mechanism, not
                    just momentum.
                  </p>
                  <p
                    className="mt-4 font-serif-display text-base leading-relaxed"
                    style={{ color: "#8a8880" }}
                  >
                    Our default output is research you can fork—not a deck you
                    admire once. When we allocate, it is narrow, repeatable, and
                    always late in the process.
                  </p>
                  </div>
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
