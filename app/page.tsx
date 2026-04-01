import Image from "next/image";
import Link from "next/link";

import { AtAGlanceFloatingPaths } from "@/components/backgrounds/FloatingPaths";
import { TopographyBackground } from "@/components/backgrounds/TopographyBackground";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { OperatingNoteCard } from "@/components/discover/OperatingNoteCard";
import {
  HeroColumnStagger,
  HeroEntrance,
  HeroLineItem,
  HeroStaggerChild,
  HeroStaggerRoot,
} from "@/components/hero/HeroEntrance";
import { PartnersMarquee } from "@/components/hero/PartnersMarquee";
import { ScrollMouseHint } from "@/components/hero/ScrollMouseHint";
import { SectionReveal } from "@/components/hero/SectionReveal";
import { StaggerItem, StaggerOnView } from "@/components/hero/StaggerOnView";
import { Button, Container, SectionLabel, Tag } from "@/components/ui";

const tickerItems = [
  "Public memos",
  "On-chain datasets",
  "Protocol reviews",
  "Deep tech briefs",
  "Risk scenarios",
  "Primary research",
  "Open methodologies",
  "Hardware–software",
  "Long-form notes",
  "Selective capital",
];

const focusSteps = [
  {
    n: "01",
    title: "Research is the product",
    body: "We publish memos, models, and datasets you can trace—protocol economics, security assumptions, frontier compute, and explicit what-has-to-be-true statements.",
  },
  {
    n: "02",
    title: "Crypto & deep tech, on purpose",
    body: "Narrow mandate: L1/L2 and DeFi plumbing, wallets and infra, AI systems, robotics, and adjacent hardware—we say no to everything else.",
  },
  {
    n: "03",
    title: "Capital, when it follows",
    body: "We are not a spray-and-pray fund. The team stays small; deploying capital is rare and only after the research work is already standing on its own.",
  },
];

const team = [
  {
    handle: "Gemchanger",
    image: "/gemchange_jojo.png",
    role: "Research & markets",
    city: "Barcelona",
    xUrl: "https://x.com/gemchange_ltd",
    blurb:
      "Finance graduate with energy-sector experience in oil, plus time in venture. Covers how markets, liquidity, and narratives meet institutional reality.",
  },
  {
    handle: "Feuter",
    image: "/feuter.jpg",
    role: "Analytics & company research",
    city: "Montréal",
    xUrl: "https://x.com/feuters",
    blurb:
      "HEC student with VC exposure—deep on analytics, modelling, and company analysis. Former owner of a contracting business; brings operator judgment to diligence.",
  },
  {
    handle: "Kafka",
    image: "/kafka.jpg",
    role: "Technical research",
    city: "Montréal",
    xUrl: "https://x.com/wenkafka",
    blurb:
      "Computer science at Université de Montréal; hands-on engineering with projects spanning YC- and Paradigm-style stacks. Codes, reviews, and stress-tests assumptions.",
  },
];

const trusted = [
  "Founders",
  "Labs",
  "Protocols",
  "DAOs",
  "Infrastructure",
  "Deep tech",
];

/** Single in-page nav for “Why we exist” — avoids duplicating header links in two places. */
const whyWeExistNav = [
  { href: "/#thesis", label: "Thesis" },
  { href: "/#work", label: "Approach" },
  { href: "/#team", label: "Team" },
  { href: "/writing", label: "Writing" },
  { href: "/#discover", label: "Contact" },
] as const;

function WhyWeExistSectionNav() {
  return (
    <nav className="mt-6 flex flex-wrap gap-2" aria-label="On this page">
      {whyWeExistNav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="inline-flex items-center gap-1.5 border border-zinc-300 bg-white px-2.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-700 transition-colors hover:border-zinc-500 hover:text-zinc-900"
        >
          {item.label}
          <span className="text-zinc-500" aria-hidden>
            ↗
          </span>
        </Link>
      ))}
    </nav>
  );
}

/** Concrete snapshot of research outputs—replaces the old decorative 4×4 grid. */
function HeroResearchPanel() {
  const rows = [
    {
      label: "Primary outputs",
      body: "Long-form memos, scenario tables, and dashboards you can reproduce.",
    },
    {
      label: "Domains",
      body: "L1/L2 economics, DeFi & custody risk, wallets & infra, frontier AI, robotics.",
    },
    {
      label: "Methods",
      body: "Chain-native metrics, adversarial reviews, and open methodology notes.",
    },
    {
      label: "Capital",
      body: "Optional and selective—only when research conviction is already explicit.",
    },
  ];

  return (
    <div className="w-full max-w-md border border-zinc-300 bg-white p-6 shadow-sm lg:ml-auto">
      <Tag>Research practice</Tag>
      <h3 className="mt-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-800">
        What we actually ship
      </h3>
      <p className="mt-2 font-serif-display text-sm leading-relaxed text-zinc-600">
        No abstract lattice—this is the work product: research artifacts first, everything else
        follows.
      </p>
      <ul className="mt-5 space-y-4 border-t border-zinc-200 pt-5">
        {rows.map((row) => (
          <li key={row.label} className="text-left">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
              {row.label}
            </p>
            <p className="mt-1 text-sm leading-snug text-zinc-900">{row.body}</p>
          </li>
        ))}
      </ul>
      <div className="mt-5 h-1 w-full bg-[var(--gradient-button)]" />
    </div>
  );
}

function Ticker() {
  const doubled = [...tickerItems, ...tickerItems];
  return (
    <div className="relative overflow-hidden border-y border-zinc-200 bg-zinc-100 py-3">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-zinc-100 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-zinc-100 to-transparent" />
      <div className="flex w-max animate-marquee gap-16 md:gap-20 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-600">
        {doubled.map((label, i) => (
          <span
            key={`${label}-${i}`}
            className="whitespace-nowrap bg-[var(--gradient-brand)] bg-clip-text text-transparent"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="hero-surface relative flex min-h-[calc(100svh-6.5rem)] flex-col overflow-hidden md:min-h-[calc(100svh-7rem)]">
          <TopographyBackground
            lineCount={22}
            lineColor="rgba(130, 205, 235, 0.38)"
            backgroundColor="#e8eaed"
            speed={0.85}
            strokeWidth={0.65}
          />
          <HeroEntrance>
            <Container className="flex flex-1 flex-col py-10 pb-0 md:py-14">
              <HeroStaggerRoot className="flex flex-1 flex-col">
                <HeroStaggerChild className="grid flex-1 grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-10">
                  <div className="flex gap-5 md:gap-6">
                    <div
                      className="hidden w-px shrink-0 bg-gradient-to-b from-zinc-400 via-zinc-300 to-transparent md:block md:min-h-[200px]"
                      aria-hidden
                    />
                    <HeroColumnStagger className="min-w-0 flex-1">
                      <HeroLineItem>
                        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-600">
                          @CapitalADHD · Research collective
                        </p>
                      </HeroLineItem>
                      <HeroLineItem className="mt-5">
                        <h1 className="max-w-xl font-sans text-[clamp(2rem,5.5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight text-zinc-900">
                          A{" "}
                          <span className="font-serif-display text-[1.05em] font-semibold italic text-zinc-900">
                            research
                          </span>{" "}
                          firm for crypto & deep tech
                        </h1>
                      </HeroLineItem>
                      <HeroLineItem className="mt-6">
                        <p className="max-w-md font-serif-display text-base leading-relaxed text-zinc-700 md:text-lg">
                          We start with public, rigorous work—protocols, infrastructure, and
                          technical stacks where evidence beats narrative. Capital is secondary and
                          selective.
                        </p>
                      </HeroLineItem>
                      <HeroLineItem className="mt-8">
                        <div className="flex flex-wrap gap-3">
                          <Button href="/#discover">Collaborate</Button>
                          <Button href="/#thesis" variant="secondary">
                            Read our approach
                          </Button>
                        </div>
                      </HeroLineItem>
                      <HeroLineItem>
                        <ScrollMouseHint />
                      </HeroLineItem>
                    </HeroColumnStagger>
                  </div>
                  <HeroStaggerChild className="relative w-full">
                    <HeroResearchPanel />
                  </HeroStaggerChild>
                </HeroStaggerChild>

                <HeroStaggerChild className="mt-14 border-t border-zinc-300/80 pt-10 md:mt-16 md:pt-12">
                  <p className="text-center font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-600">
                    We work alongside
                  </p>
                  <PartnersMarquee labels={trusted} />
                </HeroStaggerChild>
              </HeroStaggerRoot>
            </Container>
          </HeroEntrance>
        </section>

        <Ticker />

        <SectionReveal amount={0.08}>
          <section className="border-b border-zinc-200 bg-white py-16 md:py-24 mesh-bg">
            <Container>
              <div className="max-w-3xl">
                <SectionLabel>Why we exist</SectionLabel>
                <h2 className="font-sans text-3xl font-semibold leading-tight tracking-tight text-zinc-900 md:text-4xl lg:text-[2.75rem]">
                  The best crypto and deep tech outcomes are{" "}
                  <span className="font-serif-display italic text-zinc-800">under-published</span>,
                  not under-hyped.
                </h2>
              </div>
              <div className="mt-12 border border-dashed border-zinc-300 bg-zinc-50 p-4 md:p-8">
                <p className="max-w-2xl font-serif-display text-lg leading-relaxed text-zinc-700">
                  We bias toward teams who want reviewers that read code, cite sources, and write the
                  uncomfortable questions into the appendix—whether or not a check ever follows.
                </p>
                <WhyWeExistSectionNav />
              </div>
            </Container>
          </section>
        </SectionReveal>

        <SectionReveal amount={0.08} delay={0.04}>
          <section className="relative overflow-hidden border-b border-zinc-200 bg-white py-16 md:py-24">
            <AtAGlanceFloatingPaths />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white from-35% via-white/92 to-sky-50/35" />
            <Container className="relative z-[1]">
              <div className="border border-dashed border-zinc-400 bg-white/95 p-5 md:p-10 lg:p-12">
                <div className="max-w-3xl">
                  <SectionLabel>At a glance</SectionLabel>
                  <h2 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl lg:max-w-[42rem]">
                    One research desk,{" "}
                    <span className="font-semibold text-cyan-800">rare capital</span>, no touring
                    roadshow.
                  </h2>
                  <p className="mt-4 max-w-2xl font-serif-display text-base leading-relaxed text-zinc-700 md:text-lg">
                    One bar, shared definitions of proof, and artifacts you can stress-test. We
                    default to memos, models, and traceable work—roadshows and vanity decks are the
                    exception.
                  </p>
                </div>
                <div className="mt-10 grid gap-6 md:mt-12 md:grid-cols-3">
                  <div className="border border-zinc-200 bg-white p-7 md:p-8">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                      Collective
                    </p>
                    <p className="mt-4 font-sans text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
                      <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="bg-[var(--gradient-brand)] bg-clip-text text-transparent tabular-nums">
                          03
                        </span>
                        <span className="font-normal text-zinc-400">·</span>
                        <span>One research bar</span>
                      </span>
                    </p>
                    <p className="mt-4 font-serif-display text-sm leading-relaxed text-zinc-600">
                      Three seats covering markets, systems, and publishing—one standard of rigor,
                      no siloed “opinions without work product.”
                    </p>
                  </div>
                  <div className="border border-zinc-200 bg-white p-7 md:p-8">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                      Geography
                    </p>
                    <p className="mt-4 font-sans text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
                      Montréal <span className="text-zinc-500">×2</span> · Barcelona{" "}
                      <span className="text-zinc-500">×1</span>
                    </p>
                    <p className="mt-4 font-serif-display text-sm leading-relaxed text-zinc-600">
                      Built across North America and Europe—remote-first review cycles with on-site
                      time when hardware or lab work demands it.
                    </p>
                  </div>
                  <div className="border border-zinc-200 bg-white p-7 md:p-8">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                      Mandate
                    </p>
                    <p className="mt-4 font-sans text-lg font-semibold leading-snug tracking-tight text-zinc-900 md:text-xl">
                      Crypto &amp; deep tech only
                    </p>
                    <p className="mt-4 font-serif-display text-sm leading-relaxed text-zinc-600">
                      L1/L2 and DeFi plumbing, wallets and infra, frontier AI, robotics, and adjacent
                      hardware. If it falls outside that perimeter, we are not the right desk—saying no
                      is part of the product.
                    </p>
                  </div>
                </div>
              </div>
            </Container>
          </section>
        </SectionReveal>

        <SectionReveal amount={0.07}>
          <section id="thesis" className="scroll-mt-24 border-b border-zinc-200 bg-white py-16 md:py-24">
            <Container>
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-0">
                <div className="lg:border-r lg:border-dashed lg:border-zinc-300 lg:pr-12">
                  <SectionLabel>Research thesis</SectionLabel>
                  <h2 className="font-sans text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
                    ADHD Capital
                  </h2>
                  <p className="mt-4 font-serif-display leading-relaxed text-zinc-700">
                    We are a research collective first—crypto networks and deep tech only. When we
                    deploy capital, it is early, concentrated, and always downstream of work you can
                    read and stress-test.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-2">
                    <Tag>Thesis</Tag>
                    <Tag showArrow>Request memo</Tag>
                  </div>
                  <div className="mt-8">
                    <Button href="/#discover" variant="secondary">
                      Share context
                    </Button>
                  </div>
                </div>
                <StaggerOnView id="work" className="space-y-4 scroll-mt-24 lg:pl-12">
                  {focusSteps.map((step) => (
                    <StaggerItem key={step.n}>
                      <div className="border border-zinc-200 bg-zinc-50 p-5 transition-colors hover:border-cyan-400/60 md:p-6">
                        <div className="flex gap-4">
                          <span className="font-mono text-xs text-[var(--color-accent-cyan)]">
                            {step.n}
                          </span>
                          <div>
                            <h3 className="font-sans text-base font-medium text-zinc-900">
                              {step.title}
                            </h3>
                            <p className="mt-2 font-serif-display text-sm leading-relaxed text-zinc-700">
                              {step.body}
                            </p>
                          </div>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerOnView>
              </div>
            </Container>
          </section>
        </SectionReveal>

        <SectionReveal amount={0.08}>
          <section id="team" className="scroll-mt-24 border-b border-zinc-200 bg-white py-16 md:py-24">
            <Container>
              <SectionLabel>Team</SectionLabel>
              <h2 className="max-w-2xl font-sans text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
                Three seats.{" "}
                <span className="font-semibold text-cyan-800">One research bar</span>.
              </h2>
              <p className="mt-3 max-w-2xl font-serif-display text-sm leading-relaxed text-zinc-600 md:text-base">
                The people behind the desk—operators and researchers who publish before they pitch.
              </p>
              <StaggerOnView className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10 lg:gap-12">
                {team.map((member) => (
                  <StaggerItem key={member.handle}>
                    <article className="flex h-full flex-col overflow-hidden border border-zinc-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                      <div className="flex justify-center px-7 pt-7 md:justify-start md:px-7">
                        <div className="relative aspect-[4/5] w-[min(100%,10rem)] shrink-0 bg-zinc-100 ring-1 ring-zinc-200/90 sm:w-[10.5rem] md:w-[9.25rem] lg:w-[10rem]">
                          <Image
                            src={member.image}
                            alt={`${member.handle}, ${member.role}`}
                            fill
                            sizes="(max-width: 768px) 160px, 200px"
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col px-7 pb-7 pt-6">
                        <div className="h-px w-10 bg-zinc-900/85" />
                        <p className="mt-4 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-900">
                          {member.handle}
                          <span className="mx-1.5 font-normal text-zinc-400">·</span>
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
                          className="mt-6 inline-flex w-fit font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-700 underline decoration-zinc-300 underline-offset-4 transition-colors hover:text-cyan-900 hover:decoration-cyan-700/60"
                        >
                          Profile on X ↗
                        </a>
                      </div>
                    </article>
                  </StaggerItem>
                ))}
              </StaggerOnView>
            </Container>
          </section>
        </SectionReveal>

        <SectionReveal amount={0.08}>
        <section id="discover" className="scroll-mt-24 bg-white py-20 md:py-28">
          <Container className="grid gap-10 md:grid-cols-2 md:items-stretch md:gap-8">
            <div className="flex flex-col justify-center border border-dashed border-zinc-400 bg-white p-4 md:p-8">
              <SectionLabel>Contact</SectionLabel>
              <h2 className="mt-2 font-sans text-3xl font-semibold leading-tight tracking-tight text-zinc-950 md:text-4xl">
                Building in <span className="text-cyan-800">crypto</span> or{" "}
                <span className="text-cyan-800">deep tech</span>?
              </h2>
              <p className="mt-4 font-serif-display text-base leading-relaxed text-zinc-800">
                Share the problem, what is already built, and what you want pressure-tested. We reply
                when the research can add real leverage—capital is downstream and optional.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  href="https://x.com/CapitalADHD"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="primary"
                >
                  Message on X
                </Button>
                <Button href="mailto:hello@adhdcapital.xyz" variant="secondary">
                  Email us
                </Button>
              </div>
            </div>
            <OperatingNoteCard>
              <div className="p-6 md:p-8">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Operating note
                </p>
                <p className="mt-6 font-sans text-xl font-semibold leading-snug text-zinc-50">
                  Frontier tech rewards teams that can show mechanism, not just momentum. Our default
                  output is research you can fork—not a deck you admire once.
                </p>
                <p className="mt-4 font-serif-display text-base leading-relaxed text-zinc-400">
                  When we allocate, it is narrow, repeatable, and always late in the process—never a
                  substitute for the work product.
                </p>
              </div>
            </OperatingNoteCard>
          </Container>
        </section>
        </SectionReveal>
      </main>
      <Footer />
    </>
  );
}
