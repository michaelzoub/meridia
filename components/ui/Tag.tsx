import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type TagProps = {
  children: ReactNode;
  className?: string;
  showArrow?: boolean;
  /** When set, Tag renders as a link with focus/hover affordances. */
  href?: string;
} & Pick<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel">;

const baseClass =
  "inline-flex items-center gap-1.5 border border-[var(--color-tag-border)] bg-[var(--color-tag-bg)] px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-700";

const linkClass =
  "transition-[border-color,background-color,color] duration-200 hover:border-cyan-500/40 hover:bg-cyan-50/50 hover:text-cyan-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cyan)]";

/** Paradigm-style: square, mono, uppercase */
export function Tag({
  children,
  className = "",
  showArrow = false,
  href,
  target,
  rel,
}: TagProps) {
  const content = (
    <>
      {children}
      {showArrow ? <span className="text-zinc-500" aria-hidden>↗</span> : null}
    </>
  );

  if (href) {
    const isExternal = href.startsWith("http") || href.startsWith("mailto:");
    if (isExternal) {
      return (
        <a
          href={href}
          target={target ?? (href.startsWith("http") ? "_blank" : undefined)}
          rel={rel ?? (href.startsWith("http") ? "noopener noreferrer" : undefined)}
          className={`${baseClass} ${linkClass} ${className}`.trim()}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={`${baseClass} ${linkClass} ${className}`.trim()}>
        {content}
      </Link>
    );
  }

  return <span className={`${baseClass} ${className}`.trim()}>{content}</span>;
}
