"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

async function copyRichText(html: string) {
  await navigator.clipboard.write([
    new ClipboardItem({
      "text/html": new Blob([html], { type: "text/html" }),
      "text/plain": new Blob([stripHtml(html)], { type: "text/plain" }),
    }),
  ]);
}

function CopyButton({
  label,
  onCopy,
}: {
  label: string;
  onCopy: () => Promise<void>;
}) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 border border-zinc-300 px-5 py-3 font-sans text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900"
    >
      {copied ? (
        <Check size={14} className="text-cyan-700" />
      ) : (
        <Copy size={14} />
      )}
      {copied ? "Copied!" : label}
    </button>
  );
}

export default function PublishSuccessActions({
  html,
  slug,
}: {
  html: string;
  slug: string;
}) {
  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/writing/${slug}`;

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400">
          Copy content
        </p>
        <p className="mb-4 font-sans text-sm text-zinc-600">
          Paste directly into Substack or X Article editor — rich formatting is
          preserved.
        </p>
        <div className="flex flex-wrap gap-3">
          <CopyButton
            label="Copy for Substack"
            onCopy={() => copyRichText(html)}
          />
          <CopyButton
            label="Copy for X Articles"
            onCopy={() => copyRichText(html)}
          />
        </div>
      </div>

      <div className="border-t border-zinc-200 pt-6">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400">
          Public URL
        </p>
        <div className="flex items-center gap-3">
          <a
            href={`/writing/${slug}`}
            className="font-mono text-sm text-cyan-700 underline underline-offset-4 hover:text-cyan-900"
            target="_blank"
            rel="noopener noreferrer"
          >
            /writing/{slug}
          </a>
          <CopyButton
            label="Copy URL"
            onCopy={() => navigator.clipboard.writeText(publicUrl)}
          />
        </div>
      </div>
    </div>
  );
}
