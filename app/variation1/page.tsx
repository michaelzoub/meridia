import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { AtAGlanceFloatingPaths } from "@/components/backgrounds/FloatingPaths";
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
import type { PartnerMarqueeItem } from "@/components/hero/PartnersMarquee";
import { ScrollMouseHint } from "@/components/hero/ScrollMouseHint";
import { SectionReveal } from "@/components/hero/SectionReveal";
import { StaggerItem, StaggerOnView } from "@/components/hero/StaggerOnView";
import { Ripple } from "@/registry/magicui/ripple";
import { Button, Container, Tag } from "@/components/ui";
import Earth from "@/components/ui/globe";
import { BackgroundBeams } from "@/components/backgrounds/BackgroundBeams";
import { SOCIAL_X_URL } from "@/lib/site";

import { WarmPartnersMarquee } from "./warm-marquee";

const STRIP_MANDATE = "Crypto, fintech, deep tech, and anything in between";

const partnersMarqueeLabels = [
  { label: "Founders", voice: "serif" },
  { label: "Crypto", voice: "accent" },
  { label: "Fintech", voice: "mono" },
  { label: "Deep tech", voice: "serif" },
  { label: "Spearheaders", voice: "sans" },
  { label: "Protocols", voice: "accent" },
  { label: "DAOs", voice: "serif" },
  { label: "Labs", voice: "mono" },
  { label: "Infrastructure", voice: "mono" },
  { label: "Token teams", voice: "sans" },
  { label: "Frontier AI", voice: "accent" },
  { label: "Robotics", voice: "mono" },
  { label: "Custody & wallets", voice: "mono" },
  { label: "Solo researchers", voice: "serif" },
  { label: "Institutions", voice: "sans" },
] as const satisfies readonly PartnerMarqueeItem[];

/** Extra mono strip items merged into the single “We work alongside” marquee. */
const researchTickerLabels = [
  "Public memos",
  "On-chain datasets",
  "Protocol reviews",
  "Open methodologies",
  "Long-form notes",
  "Selective capital",
] as const;

const combinedMarqueeLabels = [
  ...partnersMarqueeLabels,
  ...researchTickerLabels.map((label) => ({ label, voice: "mono" as const })),
] as const satisfies readonly PartnerMarqueeItem[];

const focusSteps = [
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

/** Matches floating-path / topography rust-sand (#c9a87c family). */
const WARM_PIXEL_ACCENT: [number, number, number] = [201, 168, 124];

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
      "Computer science background; hands-on engineering with projects spanning YC- and Paradigm-style stacks. Codes, reviews, and stress-tests assumptions.",
  },
];

const warmNav = [
  { href: "/variation1#thesis", label: "Thesis" },
  { href: "/variation1#glance", label: "Glance" },
  { href: "/variation1#team", label: "Team" },
  { href: "/writing", label: "Writing" },
  { href: "/variation1#contact", label: "Contact" },
] as const;

const btnPrimaryWarm =
  "!rounded-none border-0 !bg-[#1d1d1d] !text-[#f5f2ed] !bg-none hover:!opacity-[0.92] active:!opacity-90";
const btnSecondaryWarm =
  "!rounded-none !border !border-stone-400 !bg-white/90 !text-[#1d1d1d] hover:!border-stone-500 hover:!bg-white";

export const metadata: Metadata = {
  title: "Meridia — Variation (warm)",
  description:
    "Meridia: an alternate, warmer presentation—research-led, humane, and oriented toward the future we want to build together.",
  robots: { index: false, follow: true },
};

function WarmSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-stone-600">
      {children}
    </p>
  );
}

function WarmSectionNav() {
  return (
    <nav className="mt-6 flex flex-wrap gap-2" aria-label="On this page">
      {warmNav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="inline-flex items-center gap-1.5 border border-stone-400/80 bg-white/80 px-3 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-stone-700 transition-colors hover:border-stone-600 hover:text-stone-900"
        >
          {item.label}
          <span className="text-stone-500" aria-hidden>
            ↗
          </span>
        </Link>
      ))}
    </nav>
  );
}

function WarmHeroPanel() {
  const rows = [
    {
      label: "Primary outputs",
      body: "Long-form memos, scenario tables, and dashboards you can reproduce.",
    },
    {
      label: "Domains",
      body: "On-chain and fintech rails, L1/L2 economics, DeFi & custody risk, wallets & infra, frontier AI, robotics.",
    },
    {
      label: "Methods",
      body: "Chain-native metrics, adversarial reviews, agent-assisted synthesis, and open methodology notes.",
    },
  ];

  return (
    <div className="relative w-full max-w-xl border border-stone-400/60 bg-gradient-to-br from-white via-[#faf7f2] to-[#f0e8de] lg:ml-auto">
      <div className="border-l-4 border-amber-900/75 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
        <span className="inline-block border border-amber-900/25 bg-amber-50/80 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-amber-950">
          Research practice
        </span>
        <h3 className="mt-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-800">
          What we actually ship
        </h3>
        <p className="mt-2 font-serif-display text-sm leading-relaxed text-stone-700">
          No abstract lattice—this is the work product: research artifacts first, everything else
          follows.
        </p>
        <ul className="mt-5 space-y-4 border-t border-stone-300/60 pt-5">
          {rows.map((row) => (
            <li key={row.label} className="text-left">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-amber-900/85">
                {row.label}
              </p>
              <p className="mt-1 font-serif-display text-sm leading-snug text-[#1d1d1d]">{row.body}</p>
            </li>
          ))}
        </ul>
        <div className="mt-5 space-y-0.5 border-t border-stone-300/50 pt-4">
          <div className="h-px w-full max-w-[280px] bg-amber-900/25" />
          <div className="h-px w-full max-w-[220px] bg-stone-600/20" />
          <div className="h-px w-full max-w-[160px] bg-stone-500/15" />
        </div>
      </div>
    </div>
  );
}

export default function Variation1Page() {
  return (
    <div className="bg-[#f5f2ed] text-[#1d1d1d]">
      <Header />
      <main className="flex-1">
        {/* Hero: asym grid + animated topography */}
        <section className="relative flex min-h-[calc(100svh-6.5rem)] flex-col overflow-hidden md:min-h-[calc(100svh-7rem)]">
          <TopographyBackground
            lineCount={24}
            lineColor="rgba(160, 110, 75, 0.32)"
            backgroundColor="#f5f2ed"
            speed={0.75}
            strokeWidth={0.55}
          />
          <HeroEntrance>
            <Container className="relative z-[1] flex flex-1 flex-col py-10 pb-0 md:py-14">
              <HeroStaggerRoot className="flex flex-1 flex-col">
                <HeroStaggerChild className="grid flex-1 grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-6 lg:gap-y-14">
                  <div className="relative flex gap-5 md:gap-6 lg:col-span-7">
                    <div
                      className="hidden w-px shrink-0 bg-gradient-to-b from-amber-900/35 via-stone-400/50 to-transparent md:block md:min-h-[220px]"
                      aria-hidden
                    />
                    <HeroColumnStagger className="min-w-0 flex-1">
                      <HeroLineItem>
                        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-stone-600">
                          Meridia · Research collective
                        </p>
                      </HeroLineItem>
                      <HeroLineItem className="mt-5">
                        <p className="mb-3 inline-flex items-center gap-2 border border-stone-400/60 bg-white/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-stone-600">
                          <span className="text-amber-900" aria-hidden>
                            ◎
                          </span>
                          Wrong first, clearer later—that is the work
                        </p>
                        <h1 className="max-w-xl font-serif-display text-[clamp(2.15rem,5.2vw,3.65rem)] font-semibold leading-[1.06] tracking-tight text-[#1d1d1d]">
                          A future worth building,{" "}
                          <span className="not-italic text-stone-800">one memo at a time</span>
                        </h1>
                        <p className="mt-4 max-w-lg font-sans text-lg font-medium leading-snug text-stone-800 md:text-xl">
                          A research firm for {STRIP_MANDATE.toLowerCase()}
                        </p>
                      </HeroLineItem>
                      <HeroLineItem className="mt-6">
                        <p className="max-w-md font-serif-display text-base leading-relaxed text-stone-700 md:text-lg">
                          We are not here to intimidate—we publish, iterate, and correct in public.
                          Evidence beats narrative; capital follows rigor, quietly.
                        </p>
                      </HeroLineItem>
                      <HeroLineItem className="mt-8">
                        <div className="flex flex-wrap gap-3">
                          <Button href="/variation1#contact" className={btnPrimaryWarm}>
                            Collaborate
                          </Button>
                          <Button href="/variation1#thesis" variant="secondary" className={btnSecondaryWarm}>
                            Read our approach
                          </Button>
                        </div>
                      </HeroLineItem>
                      <HeroLineItem>
                        <ScrollMouseHint />
                      </HeroLineItem>
                    </HeroColumnStagger>
                  </div>

                  <HeroStaggerChild className="relative w-full lg:col-span-5 lg:mt-6">
                    <div className="relative">
                      <div
                        className="pointer-events-none absolute -right-3 -top-3 hidden h-16 w-16 border border-dashed border-amber-900/25 lg:block"
                        aria-hidden
                      />
                      <WarmHeroPanel />
                    </div>
                  </HeroStaggerChild>
                </HeroStaggerChild>

                <HeroStaggerChild className="mt-14 border-t border-stone-300/50 pt-10 md:mt-16 md:pt-12">
                  <p className="text-center font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-stone-600 md:text-[11px]">
                    We work alongside
                  </p>
                  <WarmPartnersMarquee labels={combinedMarqueeLabels} />
                </HeroStaggerChild>
              </HeroStaggerRoot>
            </Container>
          </HeroEntrance>
        </section>

        <SectionReveal amount={0.08}>
          <section
            id="ethos"
            className="relative border-b border-stone-300/50 bg-[#f0ebe3] py-16 md:py-24"
            style={{
              backgroundImage: [
                "radial-gradient(ellipse 90% 55% at 15% 0%, rgba(180, 120, 70, 0.09), transparent)",
                "radial-gradient(ellipse 70% 45% at 100% 20%, rgba(120, 80, 50, 0.06), transparent)",
              ].join(", "),
            }}
          >
            <Container>
              <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-5">
                  <WarmSectionLabel>Why we exist</WarmSectionLabel>
                  <h2 className="mt-3 font-serif-display text-3xl font-semibold leading-[1.12] tracking-tight text-[#1d1d1d] md:text-4xl lg:text-[2.65rem]">
                    The best outcomes are{" "}
                    <span className="italic text-stone-800">under-published</span>, not under-hyped.
                  </h2>
                </div>

              </div>

              <div className="mt-12">
                <div className="relative overflow-hidden border border-dashed border-stone-400/80 bg-[#faf6f0] p-6 md:p-10">
                  <div className="pointer-events-none absolute inset-0 opacity-80" aria-hidden>
                    <Ripple tone="warm" />
                  </div>
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#faf6f0] to-transparent"
                    aria-hidden
                  />
                  <p className="relative max-w-2xl font-serif-display text-lg leading-relaxed text-stone-800">
                    We bias toward teams who want reviewers that read code, cite sources, and write the
                    uncomfortable questions into the appendix—whether or not a check ever follows.
                  </p>
                  <WarmSectionNav />
                </div>
              </div>
            </Container>
          </section>
        </SectionReveal>

        <SectionReveal amount={0.08} delay={0.04}>
          <section
            id="glance"
            className="scroll-mt-24 relative overflow-hidden border-b border-stone-300/50 bg-[#f5f2ed] py-16 md:py-24"
          >
            <AtAGlanceFloatingPaths strokeColor="#c9a87c" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#f5f2ed] from-30% via-[#f5f2ed]/94 to-[#ebe4db]/90" />
            <Container className="relative z-[1]">
              <div className="max-w-3xl">
                <WarmSectionLabel>At a glance</WarmSectionLabel>
                <h2 className="mt-2 font-serif-display text-3xl font-semibold tracking-tight text-[#1d1d1d] md:text-4xl lg:max-w-[40rem] lg:leading-[1.15]">
                  One research desk, <span className="text-amber-950">rare capital</span>, no touring
                  roadshow.
                </h2>
                <p className="mt-4 max-w-2xl font-serif-display text-base leading-relaxed text-stone-700 md:text-lg">
                  One bar, shared definitions of proof, and artifacts you can stress-test. Memos and
                  models first—vanity decks are the exception.
                </p>
              </div>

              <div className="mt-12 grid gap-6 md:mt-14 md:grid-cols-2">
                <div className="relative overflow-hidden border border-dashed border-stone-400/90 bg-white p-8">
                  <div className="pointer-events-none absolute inset-0 opacity-90" aria-hidden>
                    <PixelBlast
                      variant="square"
                      pixelSize={2}
                      color="#f5e6d3"
                      patternScale={2}
                      patternDensity={1}
                      pixelSizeJitter={0}
                      enableRipples
                      rippleSpeed={0.38}
                      rippleThickness={0.12}
                      rippleIntensityScale={1.45}
                      liquid={false}
                      speed={0.48}
                      edgeFade={0.28}
                      transparent
                    />
                  </div>
                  <div className="relative">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">
                      Collective
                    </p>
                    <p className="mt-4 font-sans text-2xl font-semibold tracking-tight text-[#1d1d1d] md:text-3xl">
                      One research bar
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-950/85">
                      Two seats · one standard
                    </p>
                    <p className="mt-4 font-serif-display text-sm leading-relaxed text-stone-600">
                      Two seats covering analytics and technical systems—one standard of rigor, no siloed
                      opinions without work product.
                    </p>
                  </div>
                </div>

                <div className="relative overflow-hidden border border-dashed border-stone-400/90 bg-white p-8">
                  <div className="relative z-[1]">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">
                      Geography
                    </p>
                    <p className="mt-4 font-sans text-2xl font-semibold tracking-tight text-[#1d1d1d] md:text-3xl">
                      Singapore <span className="text-stone-500">×1</span> · NYC{" "}
                      <span className="text-stone-500">×1</span>
                    </p>
                    <p className="mt-4 font-serif-display text-sm leading-relaxed text-stone-600">
                      Built across Asia and North America—remote-first review cycles with on-site time when
                      hardware or lab work demands it.
                    </p>
                  </div>
                  <div className="relative mt-8 border-t border-stone-200/90 pt-8">
                    <div className="flex justify-center">
                      <Earth className="h-[120px] w-auto max-w-[240px] opacity-50" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mt-6 overflow-hidden border border-dashed border-stone-400/90 bg-white p-8 md:p-10">
                <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
                  <Threads
                    color={[201 / 255, 168 / 255, 124 / 255]}
                    amplitude={1}
                    distance={0}
                    enableMouseInteraction
                  />
                </div>
                <div className="relative max-w-4xl">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">Mandate</p>
                  <p className="mt-4 font-sans text-xl font-semibold leading-snug tracking-tight text-[#1d1d1d] md:text-2xl">
                    {STRIP_MANDATE}
                  </p>
                  <p className="mt-5 font-serif-display text-sm leading-relaxed text-stone-700 md:text-base">
                    L1/L2 and DeFi plumbing, fintech and custody rails, wallets and infra, frontier AI,
                    robotics, and adjacent hardware. If it falls outside that perimeter, we are not the
                    right desk—saying no is part of the product.
                  </p>
                </div>
              </div>
            </Container>
          </section>
        </SectionReveal>

        <SectionReveal amount={0.07}>
          <section
            id="thesis"
            className="scroll-mt-24 border-b border-stone-300/50 bg-[#faf7f2] py-16 md:py-24"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 80% 50% at 50% -15%, rgba(146, 64, 14, 0.06), transparent)",
            }}
          >
            <Container>
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-0">
                <div className="min-w-0 lg:border-r lg:border-dashed lg:border-stone-300 lg:pr-12">
                  <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                    Research thesis
                  </p>
                  <h2 className="font-serif-display text-3xl font-semibold tracking-tight text-[#1d1d1d] md:text-4xl">
                    <span className="bg-gradient-to-r from-amber-900 to-stone-800 bg-clip-text text-transparent">
                      Meridia
                    </span>
                  </h2>
                  <p className="mt-4 font-serif-display text-base leading-relaxed text-stone-800">
                    When we deploy capital it is{" "}
                    <span className="font-semibold text-amber-950">early, concentrated</span>, and always
                    downstream of work you can read and stress-test.
                  </p>
                  <div className="relative mt-5 min-h-[120px] overflow-hidden border border-amber-900/25 bg-white">
                    <FlickeringGrid
                      className="absolute inset-0 min-h-full"
                      color="rgb(146, 64, 14)"
                      squareSize={3}
                      gridGap={7}
                      flickerChance={0.05}
                      maxOpacity={0.22}
                    />
                    <div className="relative z-[1] px-4 py-3">
                      <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-amber-950">
                        AI on the desk
                      </p>
                      <p className="mt-2 font-serif-display text-sm leading-relaxed text-stone-800">
                        We spearhead research workflows with{" "}
                        <span className="font-semibold text-[#5c2e0e]">AI agents</span>—custom pipelines
                        for ingestion, stress-testing, and publication—so rigor scales without becoming
                        opaque.
                      </p>
                    </div>
                  </div>
                  <div className="mt-8 flex flex-wrap gap-2">
                    <Tag
                      href="/writing"
                      className="!rounded-none border-stone-400 bg-stone-100/80 text-stone-800"
                    >
                      Thesis
                    </Tag>
                    <Tag
                      showArrow
                      href="mailto:hello@efimov.xyz?subject=Memo%20request%20%E2%80%94%20Meridia"
                      className="!rounded-none border-stone-400 bg-white text-stone-800"
                    >
                      Request memo
                    </Tag>
                  </div>
                </div>

                <StaggerOnView id="work" className="scroll-mt-24 lg:pl-12">
                  <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                    Approach
                  </p>
                  <div className="border border-dashed border-stone-400 bg-white">
                    {focusSteps.map((step, i) => (
                      <div key={step.n}>
                        <StaggerItem>
                          <div className="px-7 py-8 md:px-10 md:py-9">
                            <div className="flex gap-5 md:gap-6">
                              <span className="shrink-0 font-mono text-xs tabular-nums text-amber-900 md:text-sm">
                                {step.n}
                              </span>
                              <div className="min-w-0">
                                <h3 className="font-sans text-base font-semibold tracking-tight text-[#1d1d1d]">
                                  {step.title}
                                </h3>
                                <p className="mt-2 font-serif-display text-sm leading-relaxed text-stone-700">
                                  {step.body}
                                </p>
                              </div>
                            </div>
                          </div>
                        </StaggerItem>
                        {i < focusSteps.length - 1 ? (
                          <div
                            className="relative flex min-h-12 items-center justify-center md:min-h-14"
                            aria-hidden
                          >
                            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-stone-300" />
                            <div className="relative border border-stone-300 bg-white px-3 py-1">
                              <span className="block text-amber-900">↓</span>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </StaggerOnView>
              </div>
            </Container>
          </section>
        </SectionReveal>

        <SectionReveal amount={0.08}>
          <section
            id="team"
            className="scroll-mt-24 border-b border-stone-300/50 bg-[#f5f2ed] py-16 md:py-24"
          >
            <Container>
              <WarmSectionLabel>Team</WarmSectionLabel>
              <h2 className="max-w-2xl font-serif-display text-3xl font-semibold tracking-tight text-[#1d1d1d] md:text-4xl">
                Two seats. <span className="text-amber-950">One research bar</span>.
              </h2>
              <p className="mt-3 max-w-2xl font-serif-display text-sm leading-relaxed text-stone-600 md:text-base">
                The people behind the desk—operators and researchers who publish before they pitch.
              </p>
              <StaggerOnView className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:gap-12">
                {team.map((member, i) => {
                  return (
                    <StaggerItem key={member.handle}>
                      <article className="relative flex h-full flex-col overflow-hidden border border-stone-300/90 bg-white shadow-[0_1px_2px_rgba(45,35,25,0.06)]">
                        <div className="pointer-events-none absolute inset-0 opacity-65" aria-hidden>
                          {i === 0 ? (
                            <PixelMountain accentRgb={WARM_PIXEL_ACCENT} />
                          ) : (
                            <PixelHammer accentRgb={WARM_PIXEL_ACCENT} />
                          )}
                        </div>
                        <div className="relative flex justify-center px-7 pt-7 md:justify-start md:px-7">
                          <div className="relative aspect-[4/5] w-[min(100%,10rem)] shrink-0 overflow-hidden bg-stone-100 ring-1 ring-stone-300/90 sm:w-[10.5rem] md:w-[9.25rem] lg:w-[10rem]">
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
                          <div className="h-px w-10 bg-stone-800/85" />
                          <p className="mt-4 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#1d1d1d]">
                            {member.handle}
                            <span className="mx-1.5 font-normal text-stone-400">·</span>
                            <span className="text-stone-500">{member.city}</span>
                          </p>
                          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-stone-400">
                            Founder
                          </p>
                          <h3 className="mt-3 font-sans text-lg font-semibold tracking-tight text-[#1d1d1d]">
                            {member.role}
                          </h3>
                          <p className="mt-3 flex-1 font-serif-display text-sm leading-relaxed text-stone-600">
                            {member.blurb}
                          </p>
                          <a
                            href={member.xUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 inline-flex w-fit font-mono text-[10px] uppercase tracking-[0.16em] text-stone-700 underline decoration-stone-300 underline-offset-4 transition-colors hover:text-amber-950 hover:decoration-amber-800/50"
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

        <SectionReveal amount={0.08}>
          <section id="contact" className="scroll-mt-24 bg-[#f0ebe3] py-20 md:py-28">
            <Container className="grid gap-10 md:grid-cols-2 md:items-stretch md:gap-8">
              <div className="flex flex-col justify-center border border-dashed border-[#b45309]/45 bg-[#faf6f0] p-6 md:p-9">
                <WarmSectionLabel>Contact</WarmSectionLabel>
                <h2 className="mt-2 font-serif-display text-3xl font-semibold leading-tight tracking-tight text-[#1d1d1d] md:text-4xl">
                  Building in <span className="text-amber-950">crypto</span>,{" "}
                  <span className="text-amber-950">fintech</span>,{" "}
                  <span className="text-amber-950">deep tech</span>—or anywhere in between?
                </h2>
                <p className="mt-4 font-serif-display text-base leading-relaxed text-stone-800">
                  Share the problem, what is already built, and what you want pressure-tested. We reply
                  when the research can add real leverage—capital is downstream and optional.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    href={SOCIAL_X_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="primary"
                    className={btnPrimaryWarm}
                  >
                    Message on X
                  </Button>
                  <Button href="mailto:hello@efimov.xyz" variant="secondary" className={btnSecondaryWarm}>
                    Email us
                  </Button>
                </div>
              </div>
              <article className="relative flex min-h-[min(22rem,70vh)] flex-col justify-center overflow-hidden border border-dashed border-[#c4713f]/45 bg-[#2a231c] text-[#f5f2ed]">
                <BackgroundBeams tone="terracotta" className="opacity-95" />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-950/25 via-transparent to-stone-950/45"
                  aria-hidden
                />
                <div className="relative z-[1] p-6 md:p-9">
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                    Operating note
                  </p>
                  <p className="mt-6 font-sans text-xl font-semibold leading-snug text-[#faf6f0]">
                    Frontier tech rewards teams that can show mechanism, not just momentum. Our default
                    output is research you can fork—not a deck you admire once.
                  </p>
                  <p className="mt-4 font-serif-display text-base leading-relaxed text-stone-400">
                    When we allocate, it is narrow, repeatable, and always late in the process—never a
                    substitute for the work product.
                  </p>
                </div>
              </article>
            </Container>
          </section>
        </SectionReveal>
      </main>
      <Footer />
    </div>
  );
}
