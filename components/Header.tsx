import Image from "next/image";
import Link from "next/link";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { MobileNav } from "@/components/MobileNav";
import { Button, Container } from "@/components/ui";

const nav = [
  { label: "Thesis", href: "/#thesis" },
  { label: "Approach", href: "/#work" },
  { label: "Team", href: "/#team" },
  { label: "Writing", href: "/writing" },
  { label: "Company", href: "/#discover", hasCaret: true },
] as const;

const mobileNavLinks = nav.map(({ label, href }) => ({ label, href }));

export function Header() {
  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-50 border-b border-zinc-300/70 bg-zinc-100/95 backdrop-blur-md backdrop-saturate-150">
        <Container className="relative flex h-14 min-w-0 items-center gap-3 md:h-16 md:gap-4">
          <Link
            href="/"
            className="relative z-[2] flex min-w-0 max-w-[min(68%,220px)] shrink items-center outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cyan)] md:max-w-none"
            aria-label="ADHD Capital home"
          >
            <Image
              src="/adhd_logo-nobg.png"
              alt=""
              width={220}
              height={55}
              className="h-10 w-auto max-w-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)] md:h-11"
              priority
            />
          </Link>
          <nav
            className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 md:flex"
            aria-label="Primary"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-600 transition-colors hover:text-zinc-900"
              >
                {item.label}
                {"hasCaret" in item && item.hasCaret ? (
                  <span className="text-[9px] text-zinc-400" aria-hidden>
                    ▾
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>
          <div className="ml-auto hidden shrink-0 items-center gap-2 sm:gap-3 md:flex">
            <Button
              href="https://x.com/CapitalADHD"
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              className="!px-4 !py-2.5 font-mono text-[10px] uppercase tracking-[0.14em]"
            >
              Research & updates
            </Button>
            <Button
              variant="ghost"
              href="https://x.com/CapitalADHD"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] uppercase tracking-wider !px-2 !py-2 text-zinc-600 sm:!px-3"
            >
              @CapitalADHD
            </Button>
          </div>
          <MobileNav links={mobileNavLinks} />
        </Container>
      </header>
    </>
  );
}
