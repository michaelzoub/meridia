"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/dashboard/login") {
    return <>{children}</>;
  }

  const nav = [
    { href: "/dashboard/writing", label: "Writing", icon: FileText },
    { href: "/dashboard/graphics", label: "Graphics", icon: BarChart3 },
  ] as const;

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-white px-6 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
          Caliga / Dashboard
        </p>
        <nav className="flex items-center gap-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/dashboard/writing"
                ? pathname?.startsWith("/dashboard/writing")
                : pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex items-center gap-2 border px-3 py-1.5 font-sans text-xs font-medium transition-colors",
                  active
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:text-zinc-900"
                )}
              >
                <Icon className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
      </header>
      {children}
    </div>
  );
}
