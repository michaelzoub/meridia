"use client";

import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

function enhanceLatexRoots(root: HTMLElement) {
  root.querySelectorAll("[data-latex-block]").forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const encoded = el.getAttribute("data-latex");
    if (encoded == null) return;
    let source = "";
    try {
      source = decodeURIComponent(encoded);
    } catch {
      source = encoded;
    }
    const trimmed = source.trim();
    if (!trimmed) {
      el.innerHTML = "";
      return;
    }
    try {
      el.innerHTML = katex.renderToString(trimmed, {
        throwOnError: false,
        displayMode: true,
        strict: "ignore",
      });
    } catch {
      el.textContent = source;
    }
  });

  root.querySelectorAll("[data-latex-inline]").forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const encoded = el.getAttribute("data-latex");
    if (encoded == null) return;
    let source = "";
    try {
      source = decodeURIComponent(encoded);
    } catch {
      source = encoded;
    }
    const trimmed = source.trim();
    if (!trimmed) {
      el.innerHTML = "";
      return;
    }
    try {
      el.innerHTML = katex.renderToString(trimmed, {
        throwOnError: false,
        displayMode: false,
        strict: "ignore",
      });
    } catch {
      el.textContent = source;
    }
  });
}

export function ArticleHtmlBody({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    enhanceLatexRoots(el);
  }, [html]);

  return (
    <div
      ref={ref}
      className={cn(className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
