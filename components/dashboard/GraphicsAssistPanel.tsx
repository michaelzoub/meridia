"use client";

import { Loader2, MessageSquare } from "lucide-react";
import { useCallback, useState } from "react";
import type { ChartPasteKind } from "@/lib/graphics-paste-parsers";
import { cn } from "@/lib/utils";

const TOK = {
  textPrimary: "#8B5A2B",
  textMuted: "rgba(139, 90, 43, 0.72)",
  cardBorder: "#E8E4DC",
  pageTint: "#F9F7F2",
} as const;

const RAD = { outer: "rounded-none" as const };

const KIND_LABEL: Record<ChartPasteKind, string> = {
  bar: "Bar chart",
  dot: "Dot plot",
  matrix: "Matrix",
  flow: "Flow",
};

export function GraphicsAssistPanel({
  chartKind,
  onApplyTsv,
}: {
  chartKind: ChartPasteKind;
  onApplyTsv: (tsv: string) => void;
}) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/graphics-assist", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chartKind, message: trimmed }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        tsv?: string;
        error?: string;
        detail?: string;
      };
      if (!res.ok) {
        const detail =
          typeof data.detail === "string" && data.detail.trim()
            ? data.detail
            : undefined;
        setError(detail || data.error || `Request failed (${res.status})`);
        return;
      }
      if (!data.ok || typeof data.tsv !== "string") {
        setError("Unexpected response from assistant.");
        return;
      }
      onApplyTsv(data.tsv);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, [chartKind, message, onApplyTsv]);

  return (
    <div
      className={cn("border bg-white p-4 font-sans", RAD.outer)}
      style={{ borderColor: TOK.cardBorder }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <MessageSquare
          className="size-3.5 shrink-0"
          strokeWidth={1.75}
          style={{ color: TOK.textPrimary }}
          aria-hidden
        />
        <p
          className="text-[11px] font-medium uppercase tracking-widest"
          style={{ color: TOK.textMuted }}
        >
          Data assist
        </p>
        <span
          className="text-[12px] font-medium"
          style={{ color: TOK.textPrimary }}
        >
          {KIND_LABEL[chartKind]}
        </span>
      </div>
      <p className="mt-2 text-[13px] leading-snug" style={{ color: TOK.textMuted }}>
        Describe the numbers or structure you want. The server validates output with the same rules as
        paste — only applies if it parses.
      </p>
      <label className="mt-3 block">
        <span className="sr-only">Prompt</span>
        <textarea
          className={cn(
            "min-h-[88px] w-full resize-y border px-3 py-2 text-[13px] outline-none",
            RAD.outer
          )}
          style={{
            borderColor: TOK.cardBorder,
            background: TOK.pageTint,
            color: TOK.textPrimary,
          }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. Three categories: Control 12 and 8, Treatment A 15 and 11, Treatment B 9 and 14…"
          disabled={loading}
        />
      </label>
      {error && (
        <p
          className="mt-2 text-[13px] leading-snug"
          style={{ color: "#b45309" }}
          role="alert"
        >
          {error}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void submit()}
          disabled={loading || !message.trim()}
          className={cn(
            "inline-flex items-center gap-2 border px-4 py-2 text-[13px] font-medium",
            RAD.outer
          )}
          style={{
            borderColor: TOK.textPrimary,
            background: loading || !message.trim() ? "#f4f4f5" : TOK.textPrimary,
            color: loading || !message.trim() ? "#71717a" : "#fff",
          }}
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : null}
          {loading ? "Generating…" : "Generate & apply"}
        </button>
      </div>
    </div>
  );
}
