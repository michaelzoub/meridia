"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type { ReactNodeViewProps } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { renderKatexToHtml } from "@/lib/katex-html";

function decodeDataLatex(raw: string | null): string {
  if (raw == null || raw === "") return "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function LatexBlockView({ node, updateAttributes, selected, ref }: ReactNodeViewProps) {
  const latex = (node.attrs.latex as string) ?? "";
  const html = renderKatexToHtml(latex, true);

  return (
    <NodeViewWrapper
      ref={ref}
      as="div"
      className={cn(
        "my-4 overflow-x-auto border border-zinc-200 bg-zinc-50 px-3 py-2",
        selected && "outline outline-2 -outline-offset-2 outline-cyan-600"
      )}
      onDoubleClick={() => {
        const next = window.prompt("LaTeX (display math)", latex);
        if (next !== null) updateAttributes({ latex: next });
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </NodeViewWrapper>
  );
}

function LatexInlineView({ node, updateAttributes, selected, ref }: ReactNodeViewProps) {
  const latex = (node.attrs.latex as string) ?? "";
  const html = renderKatexToHtml(latex, false);

  return (
    <NodeViewWrapper
      ref={ref}
      as="span"
      className={cn(
        "inline align-middle",
        selected && "outline outline-2 -outline-offset-1 outline-cyan-600"
      )}
      onDoubleClick={() => {
        const next = window.prompt("LaTeX (inline math)", latex);
        if (next !== null) updateAttributes({ latex: next });
      }}
    >
      <span className="inline-block" dangerouslySetInnerHTML={{ __html: html }} />
    </NodeViewWrapper>
  );
}

export const LatexBlock = Node.create({
  name: "latexBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      latex: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-latex-block=""]',
        getAttrs: (el) => {
          if (!(el instanceof HTMLElement)) return false;
          return { latex: decodeDataLatex(el.getAttribute("data-latex")) };
        },
      },
      {
        tag: "div[data-latex-block]",
        getAttrs: (el) => {
          if (!(el instanceof HTMLElement)) return false;
          return { latex: decodeDataLatex(el.getAttribute("data-latex")) };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const latex = (node.attrs.latex as string) ?? "";
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-latex-block": "",
        "data-latex": encodeURIComponent(latex),
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LatexBlockView);
  },
});

export const LatexInline = Node.create({
  name: "latexInline",
  group: "inline",
  inline: true,
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      latex: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-latex-inline=""]',
        getAttrs: (el) => {
          if (!(el instanceof HTMLElement)) return false;
          return { latex: decodeDataLatex(el.getAttribute("data-latex")) };
        },
      },
      {
        tag: "span[data-latex-inline]",
        getAttrs: (el) => {
          if (!(el instanceof HTMLElement)) return false;
          return { latex: decodeDataLatex(el.getAttribute("data-latex")) };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const latex = (node.attrs.latex as string) ?? "";
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-latex-inline": "",
        "data-latex": encodeURIComponent(latex),
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LatexInlineView);
  },
});
