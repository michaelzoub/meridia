"use client";

import type { Chart, Plugin } from "chart.js";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Title,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import {
  ArrowDownToLine,
  BarChart3,
  CircleDot,
  Copy,
  Download,
  GitBranch,
  Grid3x3,
  Layers,
  MessageSquare,
  Minus,
  Plus,
  PlusCircle,
  Shapes,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Bar } from "react-chartjs-2";
import { GraphicsAssistPanel } from "@/components/dashboard/GraphicsAssistPanel";
import {
  nid,
  parseBarPaste,
  parseDotPaste,
  parseMatrixPaste,
  parseFlowPaste,
  type BarRow,
  type DotRow,
  type FlowEdge,
  type FlowNode,
  type FlowShape,
  type MatrixCol,
  type MatrixRow,
} from "@/lib/graphics-paste-parsers";
import { cn } from "@/lib/utils";

export type { FlowNode, FlowEdge, FlowShape } from "@/lib/graphics-paste-parsers";

/** Editorial research chart tokens (do not substitute near-greens / near-corals). */
const TOK = {
  pageBg: "#F9F7F2",
  cardBg: "#FFFFFF",
  cardBorder: "#E8E4DC",
  cell0: "#EFEBE0",
  cell1: "#80CBC4",
  cell2: "#EF6C51",
  gutter: "#F9F7F2",
  textPrimary: "#8B5A2B",
  textSecondary: "rgba(139, 90, 43, 0.72)",
  barPrimary: "#C87137",
  barSecondary: "#E6B87D",
  gridLine: "rgba(236, 234, 230, 0.55)",
  plotBg: "#FFFFFF",
} as const;

const FONT_SANS =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/** Exported chart plot area — solid white. */
const EXPORT_BG = TOK.plotBg;

/** Solid white canvas behind bars so PNG / clipboard export is never transparent. */
const barWhiteBgPlugin: Plugin<"bar"> = {
  id: "studioBarWhiteBg",
  beforeDraw(chart) {
    const { ctx } = chart;
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = EXPORT_BG;
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  },
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Title,
  barWhiteBgPlugin
);

function ensureSvgOpaqueWhiteRoot(svg: SVGSVGElement) {
  svg.style.backgroundColor = EXPORT_BG;
  const first = svg.firstElementChild;
  const fill =
    first?.tagName === "rect"
      ? (first as SVGRectElement).getAttribute("fill")?.toLowerCase()
      : "";
  const covers =
    fill === "#ffffff" ||
    fill === "#fff" ||
    fill === "white" ||
    fill === EXPORT_BG.toLowerCase();
  if (covers) return;
  const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  r.setAttribute("width", "100%");
  r.setAttribute("height", "100%");
  r.setAttribute("fill", EXPORT_BG);
  svg.insertBefore(r, svg.firstChild);
}

function wrapCanvasLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const trial = current ? `${current} ${w}` : w;
    if (ctx.measureText(trial).width <= maxWidth) current = trial;
    else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

/** Paint SVG into a canvas (data URL first — fixes many blob:-URL raster failures). */
async function svgToPaintable(
  svg: SVGSVGElement,
  scale: number
): Promise<{ canvas: HTMLCanvasElement; lw: number; lh: number }> {
  ensureSvgOpaqueWhiteRoot(svg);
  const clone = svg.cloneNode(true) as SVGSVGElement;

  let lw: number;
  let lh: number;

  try {
    const bbox = svg.getBBox();
    const pad = 22;
    const vw = bbox.width + pad * 2;
    const vh = bbox.height + pad * 2;
    const vx = bbox.x - pad;
    const vy = bbox.y - pad;
    clone.setAttribute("viewBox", `${vx} ${vy} ${vw} ${vh}`);
    lw = Math.max(1, Math.ceil(vw));
    lh = Math.max(1, Math.ceil(vh));
  } catch {
    const rect = svg.getBoundingClientRect();
    lw = Math.max(1, Math.ceil(rect.width || 520));
    lh = Math.max(1, Math.ceil(rect.height || 380));
  }

  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(lw));
  clone.setAttribute("height", String(lh));

  const serialized = new XMLSerializer().serializeToString(clone);

  let revokeUrl: string | undefined;
  let src: string;
  try {
    const encoded = encodeURIComponent(serialized);
    if (encoded.length >= 1_350_000) throw new Error("svg-too-large-for-data-url");
    src = "data:image/svg+xml;charset=utf-8," + encoded;
  } catch {
    const blob = new Blob([serialized], {
      type: "image/svg+xml;charset=utf-8",
    });
    src = URL.createObjectURL(blob);
    revokeUrl = src;
  }

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const im = new Image();
    im.decoding = "async";
    im.onload = () => resolve(im);
    im.onerror = () =>
      reject(new Error("SVG could not be loaded as an image for export."));
    im.src = src;
  });

  if (revokeUrl) URL.revokeObjectURL(revokeUrl);

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(lw * scale);
  canvas.height = Math.ceil(lh * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");

  ctx.fillStyle = EXPORT_BG;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return { canvas, lw, lh };
}

async function rasterizeSvgToPngBlob(svg: SVGSVGElement): Promise<Blob> {
  const { canvas } = await svgToPaintable(svg, 2);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("PNG encode failed"));
      },
      "image/png",
      1
    );
  });
}

/** Match app variation (home): crisp edges, thin rules — globals use --radius: 0 */
const RAD = {
  outer: "rounded-none" as const,
  control: "rounded-none",
};

/** Studio-wide UI tints derived from editorial tokens (dot plot, flow, chrome). */
const COL = {
  accent: TOK.barPrimary,
  secondaryFill: TOK.barSecondary,
  tint: TOK.pageBg,
  label: TOK.textPrimary,
  onAccentText: TOK.textPrimary,
  dPrimeDot: TOK.cell1,
  baselineDot: TOK.textPrimary,
  cPrimeDot: TOK.barPrimary,
  connector: "rgba(139, 90, 43, 0.22)",
  zeroLine: "rgba(139, 90, 43, 0.38)",
  axisTick: TOK.textPrimary,
  gridLine: TOK.gridLine,
  ruleHome: TOK.cardBorder,
} as const;

const BORDER_TIGHT = TOK.cardBorder;

function matrixScoreFill(score: number): string {
  const s = Math.max(0, Math.min(2, Math.round(Number.isFinite(score) ? score : 0)));
  if (s === 2) return TOK.cell2;
  if (s === 1) return TOK.cell1;
  return TOK.cell0;
}

async function flowCompositeToPngBlob(
  svg: SVGSVGElement,
  meta: {
    title: string;
    footer: string;
    xLabel?: string;
    yLabel?: string;
  }
): Promise<Blob> {
  const SCALE = 2;
  const { canvas: diagCanvas, lw, lh } = await svgToPaintable(svg, SCALE);

  const padX = 52;
  const padTop = 28;
  const padBottom = 34;
  const gapRule = 10;
  const gapMid = 14;
  const gapFoot = 14;

  const maxTextWidth = Math.max(lw, 700);

  const measureEl = document.createElement("canvas");
  const mctx = measureEl.getContext("2d");
  if (!mctx) throw new Error("Canvas unsupported");

  mctx.font = `700 18px ${FONT_SANS}`;
  const titleLines = meta.title.trim()
    ? wrapCanvasLines(mctx, meta.title.trim(), maxTextWidth - padX * 2)
    : [];

  const subtitleParts = [
    meta.yLabel?.trim() ?? "",
    meta.xLabel?.trim() ?? "",
  ].filter(Boolean);
  const subtitle = subtitleParts.join(" · ");

  mctx.font = `500 11px ${FONT_SANS}`;
  const subLines = subtitle
    ? wrapCanvasLines(mctx, subtitle.toUpperCase(), maxTextWidth - padX * 2)
    : [];

  mctx.font = `italic 13px ${FONT_SANS}`;
  const footerLines = meta.footer.trim()
    ? wrapCanvasLines(mctx, meta.footer.trim(), maxTextWidth - padX * 2)
    : [];

  const titleBlock =
    titleLines.length > 0 ? titleLines.length * 22 + (subLines.length ? 14 : 18) : 0;
  const subBlock =
    subLines.length > 0
      ? subLines.length * 15 + (titleLines.length ? gapMid : gapRule)
      : 0;
  const footerBlock =
    footerLines.length > 0 ? footerLines.length * 21 + gapFoot : 0;

  const contentW = Math.ceil(Math.max(lw + padX * 2, maxTextWidth));
  const contentH = Math.ceil(
    padTop + titleBlock + subBlock + lh + footerBlock + padBottom
  );

  const out = document.createElement("canvas");
  out.width = contentW * SCALE;
  out.height = contentH * SCALE;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");

  ctx.scale(SCALE, SCALE);
  ctx.fillStyle = EXPORT_BG;
  ctx.fillRect(0, 0, contentW, contentH);

  let y = padTop;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  if (titleLines.length) {
    ctx.fillStyle = TOK.textPrimary;
    ctx.font = `700 18px ${FONT_SANS}`;
    titleLines.forEach((line, i) => {
      ctx.fillText(line, contentW / 2, y + 17 + i * 22);
    });
    y += titleLines.length * 22 + (subLines.length ? 12 : 16);
  }

  if (subLines.length) {
    ctx.fillStyle = TOK.textSecondary;
    ctx.font = `500 11px ${FONT_SANS}`;
    const prevLetter = ctx.letterSpacing;
    ctx.letterSpacing = "0.08em";
    subLines.forEach((line, i) => {
      ctx.fillText(line, contentW / 2, y + 11 + i * 15);
    });
    ctx.letterSpacing = prevLetter;
    y += subLines.length * 15 + gapMid;
  } else if (!titleLines.length) {
    y += gapRule;
  }

  const dx = Math.floor((contentW - lw) / 2);
  ctx.drawImage(
    diagCanvas,
    0,
    0,
    diagCanvas.width,
    diagCanvas.height,
    dx,
    y,
    lw,
    lh
  );
  y += lh + gapFoot;

  if (footerLines.length) {
    ctx.fillStyle = TOK.textSecondary;
    ctx.font = `italic 13px ${FONT_SANS}`;
    footerLines.forEach((line, i) => {
      ctx.fillText(line, contentW / 2, y + 14 + i * 21);
    });
  }

  return new Promise((resolve, reject) => {
    out.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("PNG encode failed"));
      },
      "image/png",
      1
    );
  });
}

type TabId = "bar" | "dot" | "flow" | "matrix";

/** Top-level studio area: chart editors vs LLM assist. */
type StudioSectionTab = "graphics" | "assist";

type DataEntryMode = "manual" | "paste";

const PASTE_PLACEHOLDER_BAR = `Quarter\tSeries A\tSeries B
Q1\t42\t33
Q2\t52\t46`;

const PASTE_PLACEHOLDER_DOT = `Label\tBaseline\tD'\tC'
Player A\t22\t45\t72`;

const PASTE_PLACEHOLDER_MATRIX = `\tDiscover\tDesign\tBuild
Row A\t0\t1\t2
Row B\t1\t0\t2`;

const PASTE_PLACEHOLDER_FLOW = `LR
N\tn1\tStart\tround
N\tn2\tWork\trect
E\tn1\tn2`;

function mqLabel(raw: string) {
  const t = raw.trim().replace(/"/g, '\\"').replace(/\n/g, " ");
  if (!t.length) return '""';
  if (/^[A-Za-z0-9]+$/.test(t)) return t;
  return `"${t}"`;
}

function flowDiagramToText(
  direction: "LR" | "TB",
  nodes: FlowNode[],
  edges: FlowEdge[]
): string {
  if (nodes.length === 0) {
    return [`flowchart ${direction}`, '  stub["Tap Add step"]'].join("\n");
  }
  const lines: string[] = [`flowchart ${direction}`];

  for (const n of nodes) {
    const lab = mqLabel(n.label);
    switch (n.shape) {
      case "round":
        lines.push(`  ${n.id}([${lab}])`);
        break;
      case "rect":
        lines.push(`  ${n.id}[${lab}]`);
        break;
      case "diamond":
        lines.push(`  ${n.id}{${lab}}`);
        break;
    }
  }

  for (const e of edges) {
    const raw = e.label.trim().replace(/"/g, "'").replace(/\|/g, " ");
    if (!raw.length) lines.push(`  ${e.fromId} --> ${e.toId}`);
    else lines.push(`  ${e.fromId} -->|"${raw}"| ${e.toId}`);
  }

  return lines.join("\n");
}

const FLOW_SEED: { nodes: FlowNode[]; edges: FlowEdge[] } = {
  nodes: [
    { id: "flow_n1", label: "Start", shape: "round" },
    { id: "flow_n2", label: "Thinking", shape: "rect" },
    { id: "flow_n3", label: "Running verifier", shape: "rect" },
    { id: "flow_n4", label: "Iterate?", shape: "diamond" },
  ],
  edges: [
    { id: "flow_e1", fromId: "flow_n1", toId: "flow_n2", label: "" },
    { id: "flow_e2", fromId: "flow_n2", toId: "flow_n3", label: "" },
    { id: "flow_e3", fromId: "flow_n3", toId: "flow_n4", label: "" },
    { id: "flow_e4", fromId: "flow_n4", toId: "flow_n2", label: "again" },
  ],
};

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className={cn("mb-4 border-b pb-3", RAD.outer)} style={{ borderColor: BORDER_TIGHT }}>
      <p
        className="font-sans uppercase"
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.1em",
          color: COL.label,
        }}
      >
        {eyebrow}
      </p>
      <h2
        className="font-sans"
        style={{ fontSize: 17, fontWeight: 600, color: TOK.textPrimary }}
      >
        {title}
      </h2>
    </div>
  );
}

function CustomBarLegend({ cLegend, dLegend }: { cLegend: string; dLegend: string }) {
  return (
    <div
      className={cn("mt-4 flex flex-wrap gap-6 font-sans", RAD.outer)}
      style={{
        fontSize: 12,
        fontWeight: 500,
        color: TOK.textPrimary,
      }}
    >
      <span className="inline-flex items-center gap-2">
        <span
          className="inline-block shrink-0 rounded-none"
          style={{ width: 14, height: 14, backgroundColor: TOK.barPrimary }}
          aria-hidden
        />
        {cLegend}
      </span>
      <span className="inline-flex items-center gap-2">
        <span
          className="inline-block shrink-0 rounded-none"
          style={{ width: 14, height: 14, backgroundColor: TOK.barSecondary }}
          aria-hidden
        />
        {dLegend}
      </span>
    </div>
  );
}

function CaptionFields({
  title,
  setTitle,
  xLabel,
  setXLabel,
  yLabel,
  setYLabel,
  footer,
  setFooter,
  note,
}: {
  title: string;
  setTitle: (v: string) => void;
  xLabel: string;
  setXLabel: (v: string) => void;
  yLabel: string;
  setYLabel: (v: string) => void;
  footer: string;
  setFooter: (v: string) => void;
  note?: string;
}) {
  const fld = cn(
    "mt-1 w-full border bg-white px-3 py-2 text-sm text-[#8B5A2B] outline-none",
    RAD.outer
  );
  return (
    <div className="space-y-3 border-t pt-4 font-sans" style={{ borderColor: BORDER_TIGHT }}>
      {note && (
        <p className="text-[12px] leading-relaxed text-zinc-600">{note}</p>
      )}
      <label className="block">
        <span className={labelSpanStyle}>Graphic title</span>
        <input className={fld} value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={labelSpanStyle}>X-axis / bottom lane label</span>
          <input className={fld} value={xLabel} onChange={(e) => setXLabel(e.target.value)} />
        </label>
        <label className="block">
          <span className={labelSpanStyle}>Y-axis / row label</span>
          <input className={fld} value={yLabel} onChange={(e) => setYLabel(e.target.value)} />
        </label>
      </div>
      <label className="block">
        <span className={labelSpanStyle}>Footer caption (below graphic)</span>
        <textarea
          className={cn(fld, "min-h-[72px] resize-y font-serif-display italic")}
          rows={2}
          value={footer}
          onChange={(e) => setFooter(e.target.value)}
          placeholder='e.g. "Try to run as many experiments as possible."'
        />
      </label>
    </div>
  );
}

const labelSpanStyle =
  "text-[11px] font-medium uppercase tracking-[0.1em] block text-[#8B5A2B]";

function DataEntryModeTabs({
  idPrefix,
  value,
  onChange,
}: {
  idPrefix: string;
  value: DataEntryMode;
  onChange: (v: DataEntryMode) => void;
}) {
  const btn = (mode: DataEntryMode, label: string) => (
    <button
      key={mode}
      type="button"
      role="tab"
      aria-selected={value === mode}
      id={`${idPrefix}-tab-${mode}`}
      aria-controls={`${idPrefix}-panel-${mode}`}
      className={cn(
        "inline-flex min-h-[40px] flex-1 items-center justify-center border px-4 py-2 font-sans text-xs font-medium transition-colors sm:text-[13px]",
        RAD.outer,
        value === mode
          ? "border-[#8B5A2B] bg-[#8B5A2B] text-white"
          : "border-[#E8E4DC] bg-white text-zinc-800"
      )}
      style={value === mode ? undefined : { color: TOK.textPrimary }}
      onClick={() => onChange(mode)}
    >
      {label}
    </button>
  );
  return (
    <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="How to enter data">
      {btn("manual", "Manual entry")}
      {btn("paste", "Paste data")}
    </div>
  );
}

function PasteDataBlock({
  id,
  hint,
  example,
  value,
  onChange,
  onApply,
  onClear,
  error,
  embedded,
}: {
  id: string;
  hint: ReactNode;
  example: string;
  value: string;
  onChange: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
  error: string | null;
  /** When true, omit top rule and “Paste data” title (shown under Paste tab). */
  embedded?: boolean;
}) {
  return (
    <div
      className={cn(embedded ? "mt-0" : "mt-6 border-t pt-4")}
      style={embedded ? undefined : { borderColor: BORDER_TIGHT }}
    >
      {!embedded ? (
        <span className={labelSpanStyle}>Paste data</span>
      ) : null}
      <div
        className={cn("text-[12px] leading-relaxed", embedded ? "mt-0" : "mt-2")}
        style={{ color: "rgba(139, 90, 43, 0.75)" }}
      >
        {hint}
      </div>
      <textarea
        id={id}
        spellCheck={false}
        className="mt-2 min-h-[128px] w-full resize-y border bg-white px-3 py-2 font-mono text-[11px] leading-relaxed outline-none md:text-[12px]"
        style={{ borderColor: TOK.cardBorder, color: TOK.textPrimary }}
        placeholder={example}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error ? (
        <p className="mt-2 text-[12px] text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onApply}
          className="inline-flex items-center gap-2 border px-3 py-2 font-sans text-xs font-medium"
          style={{
            borderColor: TOK.cardBorder,
            background: TOK.pageBg,
            color: TOK.textPrimary,
          }}
        >
          Apply paste
        </button>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-2 border bg-white px-3 py-2 font-sans text-xs font-medium"
          style={{ borderColor: TOK.cardBorder, color: TOK.textSecondary }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function StepControl({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (n: number) => void;
}) {
  const dec = () => onChange(Math.max(min ?? Number.NEGATIVE_INFINITY, value - 1));
  const inc = () => onChange(Math.min(max ?? Number.POSITIVE_INFINITY, value + 1));
  return (
    <div
      className="inline-flex border border-[#cccccc]"
      style={{ borderRadius: 0 }}
    >
      <button
        type="button"
        className="px-2 py-2 text-[#8B5A2B] hover:bg-[#F9F7F2]"
        onClick={dec}
        aria-label="Decrease by one"
      >
        <Minus className="size-4" aria-hidden strokeWidth={1.75} />
      </button>
      <span className="min-w-[2.75rem] select-none px-2 py-2 text-center text-sm tabular-nums">
        {value}
      </span>
      <button
        type="button"
        className="px-2 py-2 text-[#8B5A2B] hover:bg-[#F9F7F2]"
        onClick={inc}
        aria-label="Increase by one"
      >
        <Plus className="size-4" aria-hidden strokeWidth={1.75} />
      </button>
    </div>
  );
}

export function GraphicsStudio() {
  const tabs = [
    { id: "bar" as const, label: "Bar chart", icon: BarChart3 },
    { id: "dot" as const, label: "Dot plot", icon: CircleDot },
    { id: "matrix" as const, label: "Lifecycle matrix", icon: Grid3x3 },
    { id: "flow" as const, label: "Flow chart", icon: GitBranch },
  ];

  const [tab, setTab] = useState<TabId>("bar");
  const [studioSection, setStudioSection] = useState<StudioSectionTab>("graphics");
  const [copied, setCopied] = useState<null | "bar" | "dot" | "flow" | "matrix">(
    null
  );

  const flashCopied = useCallback((key: "bar" | "dot" | "flow" | "matrix") => {
    setCopied(key);
    window.setTimeout(() => setCopied(null), 2200);
  }, []);

  const [barRows, setBarRows] = useState<BarRow[]>([
    { id: nid("br"), label: "Q1", c: 42, d: 33 },
    { id: nid("br"), label: "Q2", c: 52, d: 46 },
    { id: nid("br"), label: "Q3", c: 48, d: 41 },
    { id: nid("br"), label: "Q4", c: 61, d: 53 },
  ]);
  const [barLegendC, setBarLegendC] = useState("Condition C");
  const [barLegendD, setBarLegendD] = useState("Condition D");

  const [barTitle, setBarTitle] = useState("Grouped comparison");
  const [barXL, setBarXL] = useState("Quarter");
  const [barYL, setBarYL] = useState("Count");
  const [barFoot, setBarFoot] = useState(
    "Subtotals summarize the two series shown in brand colors."
  );

  const barChartRef = useRef<Chart<"bar"> | null>(null);

  const [dotRows, setDotRows] = useState<DotRow[]>([
    { id: nid("dr"), label: "Player A", baseline: 22, dPrime: 45, cPrime: 72 },
    { id: nid("dr"), label: "Player B", baseline: 28, dPrime: 40, cPrime: 65 },
    { id: nid("dr"), label: "Player C", baseline: 18, dPrime: 50, cPrime: 58 },
  ]);
  const [dotTitle, setDotTitle] = useState("Priming trajectory");
  const [dotXL, setDotXL] = useState("Score scale");
  const [dotYL, setDotYL] = useState("Trials");
  const [dotFoot, setDotFoot] = useState(
    "Connectors emphasize movement from baseline toward D′ and C′."
  );

  const [matrixCols, setMatrixCols] = useState<MatrixCol[]>([
    { id: nid("mc"), label: "Discover" },
    { id: nid("mc"), label: "Design" },
    { id: nid("mc"), label: "Build" },
    { id: nid("mc"), label: "Ship" },
    { id: nid("mc"), label: "Learn" },
  ]);
  const [matrixRows, setMatrixRows] = useState<MatrixRow[]>([
    { id: nid("mr"), label: "Problem framing", cells: [0, 1, 2, 1, 0] },
    { id: nid("mr"), label: "Evidence", cells: [1, 2, 1, 0, 1] },
    { id: nid("mr"), label: "Execution", cells: [2, 1, 0, 2, 1] },
    { id: nid("mr"), label: "Stakeholders", cells: [0, 0, 1, 1, 2] },
  ]);
  const [matrixTitle, setMatrixTitle] = useState("Capability lifecycle matrix");
  const [matrixXL, setMatrixXL] = useState("Program phase");
  const [matrixYL, setMatrixYL] = useState("Workstream");
  const [matrixFoot, setMatrixFoot] = useState(
    "Discrete scores: absent, partial or supporting, and central capability."
  );

  const [flowDirection, setFlowDirection] = useState<"LR" | "TB">("LR");
  const [flowNodes, setFlowNodes] = useState<FlowNode[]>(() =>
    FLOW_SEED.nodes.map((n) => ({ ...n }))
  );
  const [flowEdges, setFlowEdges] = useState<FlowEdge[]>(() =>
    FLOW_SEED.edges.map((e) => ({ ...e }))
  );

  const [edgeDraft, setEdgeDraft] = useState<{
    fromId: string;
    toId: string;
    label: string;
  }>({ fromId: "", toId: "", label: "" });

  const flowText = useMemo(
    () => flowDiagramToText(flowDirection, flowNodes, actualEdges(flowEdges)),
    [flowDirection, flowNodes, flowEdges]
  );

  const [flowTitle, setFlowTitle] = useState("Experiment cadence");
  const [flowXL, setFlowXL] = useState("Process step");
  const [flowYL, setFlowYL] = useState("Lane");
  const [flowFoot, setFlowFoot] = useState(
    "Use steps and connectors to rehearse branching before exporting SVG."
  );

  const flowWrapRef = useRef<HTMLDivElement>(null);
  const flowMountId = useId().replace(/:/g, "");
  const [flowError, setFlowError] = useState<string | null>(null);

  const [pasteBar, setPasteBar] = useState("");
  const [pasteBarErr, setPasteBarErr] = useState<string | null>(null);
  const [pasteDot, setPasteDot] = useState("");
  const [pasteDotErr, setPasteDotErr] = useState<string | null>(null);
  const [pasteMatrix, setPasteMatrix] = useState("");
  const [pasteMatrixErr, setPasteMatrixErr] = useState<string | null>(null);
  const [pasteFlow, setPasteFlow] = useState("");
  const [pasteFlowErr, setPasteFlowErr] = useState<string | null>(null);

  const [barDataMode, setBarDataMode] = useState<DataEntryMode>("manual");
  const [dotDataMode, setDotDataMode] = useState<DataEntryMode>("manual");
  const [matrixDataMode, setMatrixDataMode] = useState<DataEntryMode>("manual");
  const [flowDataMode, setFlowDataMode] = useState<DataEntryMode>("manual");

  const applyBarPaste = useCallback(() => {
    setPasteBarErr(null);
    const r = parseBarPaste(pasteBar);
    if (!r.ok) {
      setPasteBarErr(r.error);
      return;
    }
    setBarRows(r.rows);
    if (r.legendC) setBarLegendC(r.legendC);
    if (r.legendD) setBarLegendD(r.legendD);
    setPasteBar("");
    setBarDataMode("manual");
  }, [pasteBar]);

  const applyDotPaste = useCallback(() => {
    setPasteDotErr(null);
    const r = parseDotPaste(pasteDot);
    if (!r.ok) {
      setPasteDotErr(r.error);
      return;
    }
    setDotRows(r.rows);
    setPasteDot("");
    setDotDataMode("manual");
  }, [pasteDot]);

  const applyMatrixPaste = useCallback(() => {
    setPasteMatrixErr(null);
    const r = parseMatrixPaste(pasteMatrix);
    if (!r.ok) {
      setPasteMatrixErr(r.error);
      return;
    }
    setMatrixCols(r.cols);
    setMatrixRows(r.rows);
    setPasteMatrix("");
    setMatrixDataMode("manual");
  }, [pasteMatrix]);

  const applyFlowPaste = useCallback(() => {
    setPasteFlowErr(null);
    const r = parseFlowPaste(pasteFlow);
    if (!r.ok) {
      setPasteFlowErr(r.error);
      return;
    }
    setFlowDirection(r.direction);
    setFlowNodes(r.nodes);
    setFlowEdges(r.edges);
    setEdgeDraft({ fromId: "", toId: "", label: "" });
    setPasteFlow("");
    setFlowDataMode("manual");
  }, [pasteFlow]);

  const applyAssistTsv = useCallback(
    (tsv: string) => {
      if (tab === "bar") {
        setPasteBarErr(null);
        const r = parseBarPaste(tsv);
        if (!r.ok) {
          setPasteBarErr(r.error);
          return;
        }
        setBarRows(r.rows);
        if (r.legendC) setBarLegendC(r.legendC);
        if (r.legendD) setBarLegendD(r.legendD);
        setBarDataMode("manual");
      } else if (tab === "dot") {
        setPasteDotErr(null);
        const r = parseDotPaste(tsv);
        if (!r.ok) {
          setPasteDotErr(r.error);
          return;
        }
        setDotRows(r.rows);
        setDotDataMode("manual");
      } else if (tab === "matrix") {
        setPasteMatrixErr(null);
        const r = parseMatrixPaste(tsv);
        if (!r.ok) {
          setPasteMatrixErr(r.error);
          return;
        }
        setMatrixCols(r.cols);
        setMatrixRows(r.rows);
        setMatrixDataMode("manual");
      } else {
        setPasteFlowErr(null);
        const r = parseFlowPaste(tsv);
        if (!r.ok) {
          setPasteFlowErr(r.error);
          return;
        }
        setFlowDirection(r.direction);
        setFlowNodes(r.nodes);
        setFlowEdges(r.edges);
        setEdgeDraft({ fromId: "", toId: "", label: "" });
        setFlowDataMode("manual");
      }
    },
    [tab]
  );

  const barParsed = useMemo(
    () => ({
      labels: barRows.map((r) => r.label),
      cData: barRows.map((r) => r.c),
      dData: barRows.map((r) => r.d),
    }),
    [barRows]
  );

  const barData = useMemo(
    () => ({
      labels: barParsed.labels,
      datasets: [
        {
          label: barLegendC,
          data: barParsed.cData,
          backgroundColor: TOK.barPrimary,
          borderColor: "transparent",
          borderWidth: 0,
          borderRadius: 0,
          borderSkipped: false,
        },
        {
          label: barLegendD,
          data: barParsed.dData,
          backgroundColor: TOK.barSecondary,
          borderColor: "transparent",
          borderWidth: 0,
          borderRadius: 0,
          borderSkipped: false,
        },
      ],
    }),
    [barParsed, barLegendC, barLegendD]
  );

  const barOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      devicePixelRatio: typeof window !== "undefined" ? window.devicePixelRatio : 1,
      plugins: {
        legend: { display: false },
        title: {
          display: Boolean(barTitle.trim()),
          text: barTitle.trim(),
          color: TOK.textPrimary,
          font: {
            size: 18,
            weight: 700,
            family: FONT_SANS,
          },
          padding: { top: 0, bottom: 14 },
        },
        tooltip: {
          backgroundColor: TOK.cardBg,
          titleColor: TOK.textPrimary,
          bodyColor: TOK.textPrimary,
          borderColor: TOK.cardBorder,
          borderWidth: 1,
          callbacks: {
            label(it: TooltipItem<"bar">) {
              return `${it.dataset.label ?? ""}: ${it.parsed.y}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            font: { size: 12, weight: 500, family: FONT_SANS },
            color: TOK.textPrimary,
          },
          grid: { display: false, drawOnChartArea: false },
          border: { color: TOK.cardBorder },
          title: {
            display: Boolean(barXL.trim()),
            text: barXL.trim(),
            color: TOK.textPrimary,
            font: { size: 12, weight: 500, family: FONT_SANS },
            padding: { top: 10 },
          },
        },
        y: {
          ticks: {
            font: { size: 12, weight: 500, family: FONT_SANS },
            color: TOK.textPrimary,
          },
          grid: {
            color: TOK.gridLine,
            drawTicks: false,
            lineWidth: 1,
          },
          border: { display: false },
          title: {
            display: Boolean(barYL.trim()),
            text: barYL.trim(),
            color: TOK.textPrimary,
            font: { size: 12, weight: 500, family: FONT_SANS },
            padding: { bottom: 10 },
          },
        },
      },
    }),
    [barTitle, barXL, barYL]
  );

  useEffect(() => {
    if (tab !== "flow") return;
    let cancelled = false;

    async function draw() {
      setFlowError(null);
      const host = flowWrapRef.current;
      if (!host) return;

      host.innerHTML = `<div class="flex min-h-[200px] items-center justify-center px-4 text-[11px] font-medium uppercase tracking-[0.1em]" style="color:${COL.label}">Rendering preview…</div>`;

      try {
        const mermaid = (await import("mermaid")).default;

        const source = flowText.trim() || flowDiagramToText(flowDirection, [], []);

        /** Mermaid accepts hex in themeVariables only (no rgba). */
        const edgeHex = "#B89A84";

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: "base",
          themeVariables: {
            darkMode: false,
            fontFamily: FONT_SANS,
            fontSize: "13px",
            background: TOK.plotBg,
            mainBkg: TOK.plotBg,
            textColor: TOK.textPrimary,
            primaryColor: TOK.plotBg,
            primaryTextColor: TOK.textPrimary,
            primaryBorderColor: TOK.cardBorder,
            secondaryColor: TOK.cell0,
            secondaryTextColor: TOK.textPrimary,
            secondaryBorderColor: TOK.barPrimary,
            tertiaryColor: TOK.pageBg,
            tertiaryTextColor: TOK.textPrimary,
            tertiaryBorderColor: TOK.cardBorder,
            lineColor: edgeHex,
            defaultLinkColor: edgeHex,
            nodeBorder: TOK.cardBorder,
            nodeTextColor: TOK.textPrimary,
            clusterBkg: TOK.pageBg,
            clusterBorder: TOK.cardBorder,
            titleColor: TOK.textPrimary,
            edgeLabelBackground: TOK.cell0,
            edgeLabelColor: TOK.textPrimary,
            noteBkgColor: TOK.cell0,
            noteTextColor: TOK.textPrimary,
            noteBorderColor: TOK.cardBorder,
          },
          flowchart: {
            curve: "linear",
            htmlLabels: false,
            padding: 20,
            useMaxWidth: true,
            nodeSpacing: 64,
            rankSpacing: 80,
            diagramPadding: 12,
          },
        });

        host.innerHTML = "";

        const id = `${flowMountId}_${Date.now().toString(36)}`;

        const { svg, bindFunctions } = await mermaid.render(id, source, host);

        if (cancelled || !flowWrapRef.current) return;
        flowWrapRef.current.innerHTML = svg;

        bindFunctions?.(flowWrapRef.current);

        flowWrapRef.current.querySelectorAll("svg").forEach((el) => {
          ensureSvgOpaqueWhiteRoot(el as SVGSVGElement);
          el.style.maxWidth = "100%";
          el.style.height = "auto";
        });
      } catch (e) {
        if (!cancelled && flowWrapRef.current) {
          flowWrapRef.current.innerHTML = "";
          const msg = e instanceof Error ? e.message : String(e);
          setFlowError(msg);
        }
      }
    }

    queueMicrotask(() => {
      void draw();
    });

    return () => {
      cancelled = true;
    };
  }, [tab, flowText, flowDirection, flowMountId]);

  /** Wire first edge placeholders when nodes load — fix edges with empty endpoints */
  const parsedDots = dotRows;

  const dotVisualization = useMemo(() => {
    const hasTitle = Boolean(dotTitle.trim());
    /** Title (~y22, 18px) and x-axis value ticks must not share the same band — was padTop 40 with ticks at y28. */
    const padTop = hasTitle ? 56 : 18;
    const titleBaselineY = 22;
    const xTickLabelY = hasTitle ? 46 : 12;
    const padBottom =
      28 + (dotXL.trim() ? 22 : 0) + (dotFoot.trim() ? 30 : 0);
    /** Left strip for vertical Y caption ("Trials"); row labels sit to its right, never under the plot. */
    const yCaptionStrip = dotYL.trim() ? 36 : 0;
    /** Reserved width for row names (right-aligned); keeps dots / zero line off label text. */
    const labelColumnW = 212;
    const plotRightPad = 48;
    const w = 720;
    const plotLeft = yCaptionStrip + labelColumnW;
    const rowH = 44;
    const h = padTop + Math.max(parsedDots.length, 1) * rowH + padBottom + 24;
    const plotW = Math.max(140, w - plotLeft - plotRightPad);
    const vals = parsedDots.flatMap((r) => [r.baseline, r.dPrime, r.cPrime]);
    const vmin = vals.length ? Math.min(0, ...vals) : 0;
    const vmax = vals.length ? Math.max(100, ...vals) : 100;
    const span = vmax - vmin || 1;

    const xFor = (v: number) => plotLeft + ((v - vmin) / span) * plotW;

    return (
      <svg
        id="dashboard-dot-svg"
        className="mx-auto block w-full max-w-[720px]"
        width="100%"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
        aria-label={dotTitle || "Dot plot visualization"}
      >
        <title>{dotTitle || "Dot plot"}</title>
        <rect width="100%" height="100%" fill={EXPORT_BG} />
        {hasTitle && (
          <text
            x={w / 2}
            y={titleBaselineY}
            textAnchor="middle"
            fill={TOK.textPrimary}
            fontSize={18}
            fontWeight={700}
            fontFamily={FONT_SANS}
          >
            {dotTitle}
          </text>
        )}
        <line
          x1={xFor(0)}
          y1={padTop}
          x2={xFor(0)}
          y2={h - padBottom + 8}
          stroke={COL.zeroLine}
          strokeWidth={1}
        />
        {[vmin, vmin + span * 0.25, vmin + span * 0.5, vmin + span * 0.75, vmax].map(
          (tick) => (
            <g key={`tick-${tick}`}>
              <text
                x={xFor(tick)}
                y={xTickLabelY}
                textAnchor="middle"
                fill={TOK.textPrimary}
                fontSize={12}
                fontWeight={500}
                fontFamily={FONT_SANS}
              >
                {Math.round(tick)}
              </text>
            </g>
          )
        )}
        {dotYL.trim() && (
          <text
            x={Math.max(12, yCaptionStrip / 2)}
            y={padTop + (parsedDots.length * rowH) / 2}
            fill={TOK.textPrimary}
            fontSize={12}
            fontWeight={500}
            fontFamily={FONT_SANS}
            transform={`rotate(-90 ${Math.max(12, yCaptionStrip / 2)} ${padTop + (parsedDots.length * rowH) / 2})`}
          >
            {dotYL}
          </text>
        )}
        {parsedDots.map((row, ri) => {
          const cy = padTop + rowH * ri + rowH / 2 + 6;
          const ordered = [
            { x: xFor(row.baseline), fill: COL.baselineDot },
            { x: xFor(row.dPrime), fill: COL.dPrimeDot },
            { x: xFor(row.cPrime), fill: COL.cPrimeDot },
          ];

          return (
            <g key={row.id}>
              <path
                d={`M ${xFor(row.baseline)} ${cy} L ${xFor(row.dPrime)} ${cy} L ${xFor(row.cPrime)} ${cy}`}
                fill="none"
                stroke={COL.connector}
                strokeWidth={4}
              />
              <text
                x={plotLeft - 12}
                y={cy}
                textAnchor="end"
                dominantBaseline="middle"
                fill={TOK.textPrimary}
                fontSize={13}
                fontWeight={500}
                fontFamily={FONT_SANS}
              >
                {row.label}
              </text>
              {ordered.map((p, ix) => (
                <circle
                  key={ix}
                  cx={p.x}
                  cy={cy}
                  r={6}
                  fill={p.fill}
                  stroke="#ffffff"
                  strokeWidth={1}
                />
              ))}
            </g>
          );
        })}
        {dotXL.trim() && (
          <text
            x={w / 2}
            y={h - (dotFoot.trim() ? 36 : 12)}
            textAnchor="middle"
            fill={TOK.textPrimary}
            fontSize={12}
            fontWeight={500}
            fontFamily={FONT_SANS}
          >
            {dotXL}
          </text>
        )}
        {dotFoot.trim() && (
          <text
            x={w / 2}
            y={h - 10}
            textAnchor="middle"
            fill="rgba(139, 90, 43, 0.72)"
            fontSize={13}
            fontStyle="italic"
            fontFamily={FONT_SANS}
          >
            {dotFoot}
          </text>
        )}
      </svg>
    );
  }, [parsedDots, dotTitle, dotXL, dotYL, dotFoot]);

  const matrixVisualization = useMemo(() => {
    const nR = Math.max(matrixRows.length, 1);
    const nC = Math.max(matrixCols.length, 1);
    const w = 780;
    const ml = 132;
    const mr = 36;
    const gap = 8;
    const cellH = 36;
    const innerH = nR * cellH + (nR - 1) * gap;
    const innerW = w - ml - mr;
    const cellW = (innerW - (nC - 1) * gap) / nC;
    const colHeaderH = 34;
    const titleH = matrixTitle.trim() ? 42 : 10;
    const legendH = 40;
    const footerH = matrixFoot.trim() ? 34 : 12;
    const mt = 18;
    const matrixTop = mt + titleH;
    const matrixBgY = matrixTop + colHeaderH;
    const h = matrixBgY + innerH + legendH + footerH + 18;
    const rx = Math.min(10, cellW * 0.15, cellH * 0.24);

    const rowCells = (r: MatrixRow) =>
      matrixCols.map((_, j) => {
        const raw = r.cells[j];
        const v =
          typeof raw === "number" && Number.isFinite(raw)
            ? Math.round(raw)
            : 0;
        return Math.max(0, Math.min(2, v));
      });

    const legendY = matrixBgY + innerH + 10;
    const legendItems: { fill: string; label: string }[] = [
      { fill: TOK.cell0, label: "0 absent" },
      { fill: TOK.cell1, label: "1 partial/supporting" },
      { fill: TOK.cell2, label: "2 central capability" },
    ];

    return (
      <svg
        id="dashboard-matrix-svg"
        className="mx-auto block w-full max-w-[780px]"
        width="100%"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
        aria-label={matrixTitle || "Lifecycle matrix"}
      >
        <title>{matrixTitle || "Lifecycle matrix"}</title>
        <rect width="100%" height="100%" fill={TOK.cardBg} />
        {matrixTitle.trim() ? (
          <text
            x={w / 2}
            y={mt + 26}
            textAnchor="middle"
            fill={TOK.textPrimary}
            fontSize={18}
            fontWeight={700}
            fontFamily={FONT_SANS}
          >
            {matrixTitle}
          </text>
        ) : null}
        {(matrixXL.trim() || matrixYL.trim()) && (
          <text
            x={w / 2}
            y={matrixTop - 4}
            textAnchor="middle"
            fill="rgba(139, 90, 43, 0.72)"
            fontSize={11}
            fontWeight={500}
            fontFamily={FONT_SANS}
          >
            {[matrixYL.trim(), matrixXL.trim()].filter(Boolean).join(" · ")}
          </text>
        )}
        {matrixCols.map((col, j) => {
          const cx = ml + j * (cellW + gap) + cellW / 2;
          return (
            <text
              key={col.id}
              x={cx}
              y={matrixTop + 22}
              textAnchor="middle"
              fill={TOK.textPrimary}
              fontSize={12}
              fontWeight={500}
              fontFamily={FONT_SANS}
            >
              {col.label}
            </text>
          );
        })}
        <rect
          x={ml}
          y={matrixBgY}
          width={innerW}
          height={innerH}
          fill={TOK.gutter}
        />
        {matrixYL.trim() ? (
          <text
            x={10}
            y={matrixBgY + innerH / 2}
            textAnchor="start"
            fill="rgba(139, 90, 43, 0.72)"
            fontSize={11}
            fontWeight={500}
            fontFamily={FONT_SANS}
            transform={`rotate(-90 10 ${matrixBgY + innerH / 2})`}
          >
            {matrixYL}
          </text>
        ) : null}
        {matrixRows.map((row, ri) => {
          const scores = rowCells(row);
          const labelY = matrixBgY + ri * (cellH + gap) + cellH / 2 + 5;
          return (
            <g key={row.id}>
              <text
                x={ml - 10}
                y={labelY}
                textAnchor="end"
                fill={TOK.textPrimary}
                fontSize={12}
                fontWeight={500}
                fontFamily={FONT_SANS}
              >
                {row.label}
              </text>
              {scores.map((sc, j) => {
                const x = ml + j * (cellW + gap);
                const y = matrixBgY + ri * (cellH + gap);
                return (
                  <rect
                    key={`${row.id}_${j}`}
                    x={x}
                    y={y}
                    width={cellW}
                    height={cellH}
                    rx={rx}
                    ry={rx}
                    fill={matrixScoreFill(sc)}
                  />
                );
              })}
            </g>
          );
        })}
        <g aria-label="Score legend">
          {legendItems.map((it, i) => {
            const x0 = ml + i * 168;
            return (
              <g key={it.label}>
                <rect
                  x={x0}
                  y={legendY}
                  width={20}
                  height={20}
                  rx={6}
                  ry={6}
                  fill={it.fill}
                />
                <text
                  x={x0 + 28}
                  y={legendY + 15}
                  fill={TOK.textPrimary}
                  fontSize={11}
                  fontWeight={500}
                  fontFamily={FONT_SANS}
                >
                  {it.label}
                </text>
              </g>
            );
          })}
        </g>
        {matrixFoot.trim() ? (
          <text
            x={w / 2}
            y={h - 10}
            textAnchor="middle"
            fill="rgba(139, 90, 43, 0.72)"
            fontSize={12}
            fontStyle="italic"
            fontFamily={FONT_SANS}
          >
            {matrixFoot}
          </text>
        ) : null}
      </svg>
    );
  }, [matrixRows, matrixCols, matrixTitle, matrixXL, matrixYL, matrixFoot]);

  const dotSvgExport = () => {
    const el = document.getElementById("dashboard-dot-svg");
    if (!el || !(el instanceof SVGSVGElement)) return;
    ensureSvgOpaqueWhiteRoot(el);
    const serializer = new XMLSerializer();
    const svg = serializer.serializeToString(el);
    const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n`, svg], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dot-plot.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadBarPng = useCallback(() => {
    const chart = barChartRef.current;
    if (!chart) return;
    chart.draw();
    const url = chart.toBase64Image("image/png", 1);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bar-chart.png";
    a.click();
  }, []);

  const copyBarPng = useCallback(async () => {
    const chart = barChartRef.current;
    if (!chart || typeof ClipboardItem === "undefined") return;
    try {
      /** Promise-based payload keeps Chromium’s clipboard write inside user gesture. */
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": (async () => {
            chart.draw();
            const url = chart.toBase64Image("image/png", 1);
            const res = await fetch(url);
            return res.blob();
          })(),
        }),
      ]);
      flashCopied("bar");
    } catch (err) {
      console.error(err);
      try {
        chart.draw();
        const url = chart.toBase64Image("image/png", 1);
        const res = await fetch(url);
        const blob = await res.blob();
        const dl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = dl;
        a.download = "bar-chart.png";
        a.click();
        URL.revokeObjectURL(dl);
        alert(
          "Clipboard blocked copying images — downloaded bar-chart.png instead."
        );
      } catch {
        alert("Could not copy or save — use Download PNG.");
      }
    }
  }, [flashCopied]);

  const downloadFlowSvg = useCallback(() => {
    const wrap = flowWrapRef.current?.querySelector("svg");
    if (!(wrap instanceof SVGSVGElement)) return;
    ensureSvgOpaqueWhiteRoot(wrap);
    const blob = new Blob(
      [`<?xml version="1.0" encoding="UTF-8"?>\n`, wrap.outerHTML],
      { type: "image/svg+xml;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flowchart.svg";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const copyDotSvgText = useCallback(async () => {
    const el = document.getElementById("dashboard-dot-svg");
    if (!el || !(el instanceof SVGSVGElement)) return;
    ensureSvgOpaqueWhiteRoot(el);
    try {
      await navigator.clipboard.writeText(
        new XMLSerializer().serializeToString(el)
      );
      flashCopied("dot");
    } catch {
      alert("Could not copy SVG — allow clipboard access or use Download SVG.");
    }
  }, [flashCopied]);

  const downloadDotPng = useCallback(async () => {
    const el = document.getElementById("dashboard-dot-svg");
    if (!el || !(el instanceof SVGSVGElement)) return;
    ensureSvgOpaqueWhiteRoot(el);
    try {
      const blob = await rasterizeSvgToPngBlob(el);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dot-plot@2x.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Could not save PNG.");
    }
  }, []);

  const copyDotPng = useCallback(async () => {
    const el = document.getElementById("dashboard-dot-svg");
    if (!el || !(el instanceof SVGSVGElement)) return;
    ensureSvgOpaqueWhiteRoot(el);
    if (typeof ClipboardItem === "undefined") return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": (async () => rasterizeSvgToPngBlob(el))(),
        }),
      ]);
      flashCopied("dot");
    } catch {
      try {
        const blob = await rasterizeSvgToPngBlob(el);
        const dl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = dl;
        a.download = "dot-plot@2x.png";
        a.click();
        URL.revokeObjectURL(dl);
        alert("Clipboard blocked — downloaded dot-plot@2x.png instead.");
      } catch {
        alert("Could not copy or save PNG.");
      }
    }
  }, [flashCopied]);

  const matrixSvgExport = useCallback(() => {
    const el = document.getElementById("dashboard-matrix-svg");
    if (!el || !(el instanceof SVGSVGElement)) return;
    ensureSvgOpaqueWhiteRoot(el);
    const svg = new XMLSerializer().serializeToString(el);
    const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n`, svg], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lifecycle-matrix.svg";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const copyMatrixSvgText = useCallback(async () => {
    const el = document.getElementById("dashboard-matrix-svg");
    if (!el || !(el instanceof SVGSVGElement)) return;
    ensureSvgOpaqueWhiteRoot(el);
    try {
      await navigator.clipboard.writeText(
        `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(el)}`
      );
      flashCopied("matrix");
    } catch {
      alert("Could not copy SVG — allow clipboard access or use Download SVG.");
    }
  }, [flashCopied]);

  const downloadMatrixPng = useCallback(async () => {
    const el = document.getElementById("dashboard-matrix-svg");
    if (!el || !(el instanceof SVGSVGElement)) return;
    ensureSvgOpaqueWhiteRoot(el);
    try {
      const blob = await rasterizeSvgToPngBlob(el);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "lifecycle-matrix@2x.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Could not save PNG.");
    }
  }, []);

  const copyMatrixPng = useCallback(async () => {
    const el = document.getElementById("dashboard-matrix-svg");
    if (!el || !(el instanceof SVGSVGElement)) return;
    ensureSvgOpaqueWhiteRoot(el);
    if (typeof ClipboardItem === "undefined") return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": (async () => rasterizeSvgToPngBlob(el))(),
        }),
      ]);
      flashCopied("matrix");
    } catch {
      try {
        const blob = await rasterizeSvgToPngBlob(el);
        const dl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = dl;
        a.download = "lifecycle-matrix@2x.png";
        a.click();
        URL.revokeObjectURL(dl);
        alert("Clipboard blocked — downloaded lifecycle-matrix@2x.png instead.");
      } catch {
        alert("Could not copy or save PNG.");
      }
    }
  }, [flashCopied]);

  const copyFlowSvgText = useCallback(async () => {
    const wrap = flowWrapRef.current?.querySelector("svg");
    if (!(wrap instanceof SVGSVGElement)) {
      alert("Nothing to copy yet — wait for the diagram to finish rendering.");
      return;
    }
    ensureSvgOpaqueWhiteRoot(wrap);
    try {
      await navigator.clipboard.writeText(
        `<?xml version="1.0" encoding="UTF-8"?>\n${wrap.outerHTML}`
      );
      flashCopied("flow");
    } catch {
      alert("Could not copy SVG — allow clipboard access or use Download SVG.");
    }
  }, [flashCopied]);

  const downloadFlowPng = useCallback(async () => {
    const wrap = flowWrapRef.current?.querySelector("svg");
    if (!(wrap instanceof SVGSVGElement)) {
      alert("Nothing to save yet — wait for the diagram to finish rendering.");
      return;
    }
    try {
      const blob = await flowCompositeToPngBlob(wrap, {
        title: flowTitle,
        footer: flowFoot,
        xLabel: flowXL,
        yLabel: flowYL,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "flowchart.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Could not save PNG — try SVG export, or check the browser console.");
    }
  }, [flowTitle, flowFoot, flowXL, flowYL]);

  const copyFlowPng = useCallback(async () => {
    if (!flowWrapRef.current?.querySelector("svg")) {
      alert("Nothing to copy yet — wait for the diagram to finish rendering.");
      return;
    }
    if (typeof ClipboardItem === "undefined") {
      alert("Copying images needs a secure page (HTTPS) and Clipboard support.");
      return;
    }
    const meta = {
      title: flowTitle,
      footer: flowFoot,
      xLabel: flowXL,
      yLabel: flowYL,
    };
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": (async () => {
            const svg = flowWrapRef.current?.querySelector("svg");
            if (!(svg instanceof SVGSVGElement)) {
              throw new Error("Diagram disappeared before copy.");
            }
            return flowCompositeToPngBlob(svg, meta);
          })(),
        }),
      ]);
      flashCopied("flow");
    } catch (err) {
      console.error(err);
      try {
        const svg = flowWrapRef.current?.querySelector("svg");
        if (!(svg instanceof SVGSVGElement)) throw new Error("No svg");
        const blob = await flowCompositeToPngBlob(svg, meta);
        const dl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = dl;
        a.download = "flowchart.png";
        a.click();
        URL.revokeObjectURL(dl);
        alert(
          "Clipboard blocked copying images — downloaded flowchart.png instead."
        );
      } catch {
        alert("Could not copy or save — use Download PNG.");
      }
    }
  }, [flashCopied, flowTitle, flowFoot, flowXL, flowYL]);

  const addBarRow = () =>
    setBarRows((prev) => [
      ...prev,
      { id: nid("br"), label: `Item ${prev.length + 1}`, c: 0, d: 0 },
    ]);

  function addCommittedFlowEdge() {
    if (!edgeDraft.fromId || !edgeDraft.toId || edgeDraft.fromId === edgeDraft.toId) return;
    setFlowEdges((prev) => [
      ...prev.filter((e) => e.fromId !== ""),
      {
        id: nid("fe"),
        fromId: edgeDraft.fromId,
        toId: edgeDraft.toId,
        label: edgeDraft.label,
      },
    ]);
    setEdgeDraft({ fromId: "", toId: "", label: "" });
  }

  return (
    <div style={{ background: TOK.pageBg }} className={cn("min-h-[inherit] pb-14", RAD.outer)}>
      <div className="border-b px-6 py-5" style={{ borderColor: BORDER_TIGHT }}>
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p
                className="flex items-center gap-2 font-sans uppercase"
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  color: COL.label,
                }}
              >
                <Shapes className="size-3.5" strokeWidth={1.75} aria-hidden />
                Studio overview
              </p>
              <h1 className="mt-2 font-sans" style={{ fontSize: 17, fontWeight: 600, color: TOK.textPrimary }}>
                Create graphics & flow charts
              </h1>
            </div>

            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Graphic type">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={cn(
                    "inline-flex items-center gap-2 border px-4 py-2 font-sans text-[13px] font-medium transition-colors",
                    RAD.outer,
                    tab === id
                      ? "border-[#8B5A2B] bg-[#8B5A2B] text-white"
                      : "border-[#E8E4DC] bg-white text-zinc-800 hover:border-[#8B5A2B]/40"
                  )}
                >
                  <Icon className="size-3.5 shrink-0" strokeWidth={1.75} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div
            className="mt-5 flex flex-wrap gap-2 border-t pt-5"
            style={{ borderColor: BORDER_TIGHT }}
            role="tablist"
            aria-label="Studio section"
          >
            <button
              type="button"
              role="tab"
              aria-selected={studioSection === "graphics"}
              id="studio-section-tab-graphics"
              aria-controls="studio-section-panel-graphics"
              onClick={() => setStudioSection("graphics")}
              className={cn(
                "inline-flex items-center gap-2 border px-4 py-2 font-sans text-[13px] font-medium transition-colors",
                RAD.outer,
                studioSection === "graphics"
                  ? "border-[#8B5A2B] bg-[#8B5A2B] text-white"
                  : "border-[#E8E4DC] bg-white text-zinc-800 hover:border-[#8B5A2B]/40"
              )}
            >
              <Layers className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
              Graphics
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={studioSection === "assist"}
              id="studio-section-tab-assist"
              aria-controls="studio-section-panel-assist"
              onClick={() => setStudioSection("assist")}
              className={cn(
                "inline-flex items-center gap-2 border px-4 py-2 font-sans text-[13px] font-medium transition-colors",
                RAD.outer,
                studioSection === "assist"
                  ? "border-[#8B5A2B] bg-[#8B5A2B] text-white"
                  : "border-[#E8E4DC] bg-white text-zinc-800 hover:border-[#8B5A2B]/40"
              )}
            >
              <MessageSquare className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
              Data assist
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {studioSection === "assist" ? (
          <div
            id="studio-section-panel-assist"
            role="tabpanel"
            aria-labelledby="studio-section-tab-assist"
          >
            <GraphicsAssistPanel chartKind={tab} onApplyTsv={applyAssistTsv} />
          </div>
        ) : null}

        {studioSection === "graphics" ? (
          <div
            id="studio-section-panel-graphics"
            role="tabpanel"
            aria-labelledby="studio-section-tab-graphics"
          >
        {tab === "bar" && (
          <section className={cn("border bg-white p-6", RAD.outer)} style={{ borderColor: BORDER_TIGHT }}>
            <div style={{ borderTop: `3px solid ${TOK.barPrimary}`, marginTop: -1, paddingTop: 2 }}>
              <SectionHeader eyebrow="Bar chart" title="Grouped series" />

              <CaptionFields
                title={barTitle}
                setTitle={setBarTitle}
                xLabel={barXL}
                setXLabel={setBarXL}
                yLabel={barYL}
                setYLabel={setBarYL}
                footer={barFoot}
                setFooter={setBarFoot}
                note={undefined}
              />

              <DataEntryModeTabs
                idPrefix="studio-bar-data"
                value={barDataMode}
                onChange={setBarDataMode}
              />

              <div
                id="studio-bar-data-panel-manual"
                role="tabpanel"
                aria-labelledby="studio-bar-data-tab-manual"
                hidden={barDataMode !== "manual"}
              >
              <label className="mt-6 block border-t pt-4" style={{ borderColor: BORDER_TIGHT }}>
                <span className={labelSpanStyle}>Legend wording</span>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <input
                    className="w-full border bg-white px-3 py-2 text-sm outline-none"
                    style={{ borderColor: BORDER_TIGHT }}
                    value={barLegendC}
                    onChange={(e) => setBarLegendC(e.target.value)}
                  />
                  <input
                    className="w-full border bg-white px-3 py-2 text-sm outline-none"
                    style={{ borderColor: BORDER_TIGHT }}
                    value={barLegendD}
                    onChange={(e) => setBarLegendD(e.target.value)}
                  />
                </div>
              </label>

              <div className="mt-6 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={labelSpanStyle}>Categories & values</span>
                  <button
                    type="button"
                    onClick={addBarRow}
                    className="inline-flex items-center gap-2 border bg-white px-3 py-2 text-xs font-medium"
                    style={{ borderColor: BORDER_TIGHT, color: TOK.textPrimary }}
                  >
                    <PlusCircle className="size-4" /> Add category
                  </button>
                </div>
                {barRows.map((row, idx) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-1 items-center gap-3 border p-3 sm:grid-cols-[1fr_auto_auto_auto]"
                    style={{ borderColor: BORDER_TIGHT }}
                  >
                    <input
                      aria-label={`Category ${idx + 1} name`}
                      className="w-full border bg-[#fcf8f3] px-3 py-2 text-sm outline-none"
                      style={{ borderColor: BORDER_TIGHT }}
                      value={row.label}
                      onChange={(e) =>
                        setBarRows((rs) =>
                          rs.map((r) =>
                            r.id === row.id ? { ...r, label: e.target.value } : r
                          )
                        )
                      }
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[11px]" style={{ color: COL.label }}>
                        {barLegendC}
                      </span>
                      <StepControl
                        value={row.c}
                        onChange={(c) =>
                          setBarRows((rs) =>
                            rs.map((r) => (r.id === row.id ? { ...r, c } : r))
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px]" style={{ color: COL.label }}>
                        {barLegendD}
                      </span>
                      <StepControl
                        value={row.d}
                        onChange={(d) =>
                          setBarRows((rs) =>
                            rs.map((r) => (r.id === row.id ? { ...r, d } : r))
                          )
                        }
                      />
                    </div>
                    <button
                      type="button"
                      className="inline-flex justify-center gap-2 border px-3 py-2 text-xs uppercase tracking-[0.08em] text-zinc-600"
                      style={{ borderColor: BORDER_TIGHT }}
                      onClick={() => setBarRows((rs) => rs.filter((r) => r.id !== row.id))}
                      disabled={barRows.length <= 1}
                    >
                      <Trash2 className="size-4" /> Remove
                    </button>
                  </div>
                ))}
              </div>
              </div>

              <div
                id="studio-bar-data-panel-paste"
                role="tabpanel"
                aria-labelledby="studio-bar-data-tab-paste"
                hidden={barDataMode !== "paste"}
                className="border-t pt-4"
                style={{ borderColor: BORDER_TIGHT }}
              >
                <PasteDataBlock
                  embedded
                  id="studio-paste-bar"
                  hint={
                    <>
                      Paste from a spreadsheet: <strong>tab</strong> or <strong>comma</strong>{" "}
                      between cells. Optional first row: if columns 2–3 are not numbers, they update
                      the two series names; otherwise every row is data (label, value A, value B).
                    </>
                  }
                  example={PASTE_PLACEHOLDER_BAR}
                  value={pasteBar}
                  onChange={setPasteBar}
                  onApply={applyBarPaste}
                  onClear={() => {
                    setPasteBar("");
                    setPasteBarErr(null);
                  }}
                  error={pasteBarErr}
                />
              </div>

              <div
                className="mt-6 flex aspect-[16/9] max-h-[320px] min-h-[220px] w-full items-center justify-center border bg-white px-2 py-2"
                style={{ borderColor: TOK.cardBorder }}
              >
                {barParsed.labels.length > 0 ? (
                  <Bar ref={barChartRef} data={barData} options={barOptions} />
                ) : (
                  <p style={{ color: COL.label }} className="text-sm">
                    Add at least one category.
                  </p>
                )}
              </div>

              <CustomBarLegend cLegend={barLegendC} dLegend={barLegendD} />

              {barFoot.trim() && (
                <p className="mt-6 text-center font-serif-display italic text-[14px] text-zinc-600">
                  {barFoot}
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={downloadBarPng}
                  className="inline-flex items-center gap-2 border px-3 py-2 font-sans text-xs font-medium"
                  style={{
                    borderColor: TOK.cardBorder,
                    background: TOK.pageBg,
                    color: TOK.textPrimary,
                  }}
                  disabled={barParsed.labels.length === 0}
                >
                  <Download className="size-4" aria-hidden /> Download PNG
                </button>
                <button
                  type="button"
                  onClick={() => void copyBarPng()}
                  className="inline-flex items-center gap-2 border bg-white px-3 py-2 font-sans text-xs font-medium text-zinc-800"
                  style={{ borderColor: BORDER_TIGHT }}
                  disabled={
                    barParsed.labels.length === 0 ||
                    typeof ClipboardItem === "undefined"
                  }
                  title="Copy raster graphic (solid white background)"
                >
                  <Copy className="size-4" aria-hidden /> Copy PNG
                </button>
                {copied === "bar" ? (
                  <span className="text-xs font-medium text-emerald-800">Copied</span>
                ) : null}
              </div>
            </div>
          </section>
        )}

        {tab === "dot" && (
          <section className={cn("border bg-white p-6", RAD.outer)} style={{ borderColor: BORDER_TIGHT, borderTop: `3px solid ${TOK.cell1}` }}>
            <SectionHeader eyebrow="Dot plot" title="Trajectory across states" />

            <CaptionFields
              title={dotTitle}
              setTitle={setDotTitle}
              xLabel={dotXL}
              setXLabel={setDotXL}
              yLabel={dotYL}
              setYLabel={setDotYL}
              footer={dotFoot}
              setFooter={setDotFoot}
            />

            <DataEntryModeTabs
              idPrefix="studio-dot-data"
              value={dotDataMode}
              onChange={setDotDataMode}
            />

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,minmax(0,420px)]">
              <div>
                <div className={cn("border", RAD.outer)} style={{ borderColor: BORDER_TIGHT, overflow: "hidden" }}>
                  <div className="p-4">
                    <div className="flex w-full justify-center">
                      <div className="w-full min-w-0 max-w-[720px]">{dotVisualization}</div>
                    </div>
                  </div>
                  <div
                    className="flex flex-wrap gap-6 border-t px-4 py-3 font-sans uppercase"
                    style={{
                      borderColor: BORDER_TIGHT,
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: "0.1em",
                      color: COL.label,
                      background: EXPORT_BG,
                    }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="size-3.5 shrink-0 rounded-full" style={{ border: `1px solid ${TOK.barSecondary}`, background: COL.baselineDot }} /> Baseline
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="size-3.5 shrink-0 rounded-full" style={{ border: `1px solid ${TOK.barSecondary}`, background: COL.dPrimeDot }} /> D′
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="size-3.5 shrink-0 rounded-full" style={{ border: `1px solid ${TOK.barSecondary}`, background: COL.cPrimeDot }} /> C′
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t p-4" style={{ borderColor: BORDER_TIGHT }}>
                    <button
                      type="button"
                      onClick={dotSvgExport}
                      className="inline-flex items-center gap-2 border px-3 py-2 font-sans text-xs font-medium"
                      style={{
                        borderColor: TOK.cardBorder,
                        background: TOK.pageBg,
                        color: TOK.textPrimary,
                      }}
                      disabled={!parsedDots.length}
                    >
                      <ArrowDownToLine className="size-4" /> Download SVG
                    </button>
                    <button
                      type="button"
                      onClick={() => void copyDotSvgText()}
                      className="inline-flex items-center gap-2 border bg-white px-3 py-2 font-sans text-xs font-medium text-zinc-800"
                      style={{ borderColor: BORDER_TIGHT }}
                      disabled={!parsedDots.length}
                      title="Copy SVG markup (opaque white background)"
                    >
                      <Copy className="size-4" aria-hidden /> Copy SVG
                    </button>
                    <button
                      type="button"
                      onClick={() => void downloadDotPng()}
                      className="inline-flex items-center gap-2 border px-3 py-2 font-sans text-xs font-medium"
                      style={{
                        borderColor: TOK.cardBorder,
                        background: TOK.pageBg,
                        color: TOK.textPrimary,
                      }}
                      disabled={!parsedDots.length}
                    >
                      <Download className="size-4" aria-hidden /> PNG @2×
                    </button>
                    <button
                      type="button"
                      onClick={() => void copyDotPng()}
                      className="inline-flex items-center gap-2 border bg-white px-3 py-2 font-sans text-xs font-medium text-zinc-800"
                      style={{ borderColor: BORDER_TIGHT }}
                      disabled={
                        !parsedDots.length || typeof ClipboardItem === "undefined"
                      }
                      title="Copy raster image (PNG, solid white background)"
                    >
                      <Copy className="size-4" aria-hidden /> Copy PNG
                    </button>
                    {copied === "dot" ? (
                      <span className="text-xs font-medium text-emerald-800">Copied</span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div
                  id="studio-dot-data-panel-manual"
                  role="tabpanel"
                  aria-labelledby="studio-dot-data-tab-manual"
                  hidden={dotDataMode !== "manual"}
                >
                <div className="flex items-center justify-between gap-2">
                  <span className={labelSpanStyle}>Rows</span>
                  <button
                    type="button"
                    onClick={() =>
                      setDotRows((rows) => [
                        ...rows,
                        {
                          id: nid("dr"),
                          label: `Row ${rows.length + 1}`,
                          baseline: 10,
                          dPrime: 20,
                          cPrime: 30,
                        },
                      ])
                    }
                    className="inline-flex items-center gap-2 border bg-white px-3 py-2 text-xs font-medium"
                    style={{ borderColor: BORDER_TIGHT, color: TOK.textPrimary }}
                  >
                    <PlusCircle className="size-4" /> Add row
                  </button>
                </div>
                {dotRows.map((row) => (
                  <div
                    key={row.id}
                    className="space-y-2 border p-4"
                    style={{ borderColor: BORDER_TIGHT }}
                  >
                    <input
                      className="w-full border bg-[#fcf8f3] px-3 py-2 text-sm outline-none"
                      style={{ borderColor: BORDER_TIGHT }}
                      value={row.label}
                      onChange={(e) =>
                        setDotRows((rs) =>
                          rs.map((r) =>
                            r.id === row.id ? { ...r, label: e.target.value } : r
                          )
                        )
                      }
                    />
                    <div className="grid gap-3 sm:grid-cols-3">
                      {(
                        [["baseline", row.baseline], ["dPrime", row.dPrime], ["cPrime", row.cPrime]] as const
                      ).map(([key]) => (
                        <div key={key} className="flex flex-col gap-1">
                          <span className="text-[11px]" style={{ color: COL.label }}>
                            {key === "baseline"
                              ? "Baseline"
                              : key === "dPrime"
                              ? "D′"
                              : "C′"}
                          </span>
                          <StepControl
                            value={row[key]}
                            onChange={(n) =>
                              setDotRows((rs) =>
                                rs.map((r) =>
                                  r.id === row.id ? { ...r, [key]: n } : r
                                )
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="inline-flex gap-2 text-xs uppercase tracking-[0.08em] text-zinc-600"
                      onClick={() => setDotRows((rs) => rs.filter((r) => r.id !== row.id))}
                      disabled={dotRows.length <= 1}
                    >
                      <XCircle className="size-4" /> Remove row
                    </button>
                  </div>
                ))}
                </div>

                <div
                  id="studio-dot-data-panel-paste"
                  role="tabpanel"
                  aria-labelledby="studio-dot-data-tab-paste"
                  hidden={dotDataMode !== "paste"}
                  className="border-t pt-4"
                  style={{ borderColor: BORDER_TIGHT }}
                >
                  <PasteDataBlock
                    embedded
                    id="studio-paste-dot"
                    hint={
                      <>
                        Four columns: label, baseline, D′, C′. Optional header row with names like{" "}
                        <code className="font-mono text-[11px]">Baseline</code>,{" "}
                        <code className="font-mono text-[11px]">D&apos;</code> /{" "}
                        <code className="font-mono text-[11px]">D</code>,{" "}
                        <code className="font-mono text-[11px]">C&apos;</code> /{" "}
                        <code className="font-mono text-[11px]">C</code> — column order is detected from
                        the header.
                      </>
                    }
                    example={PASTE_PLACEHOLDER_DOT}
                    value={pasteDot}
                    onChange={setPasteDot}
                    onApply={applyDotPaste}
                    onClear={() => {
                      setPasteDot("");
                      setPasteDotErr(null);
                    }}
                    error={pasteDotErr}
                  />
                </div>
              </div>
            </div>

            <div className="mt-12 grid gap-6 border-t pt-10 md:grid-cols-2" style={{ borderColor: BORDER_TIGHT }}>
              <PlayerCard accent={COL.accent} name="Player A panel" chip="Accent strip · orange" />
              <PlayerCard accent={COL.secondaryFill} name="Player B panel" chip="Accent strip · tan" />
            </div>
          </section>
        )}

        {tab === "matrix" && (
          <section
            className={cn("border bg-white p-6", RAD.outer)}
            style={{ borderColor: BORDER_TIGHT, borderTop: `3px solid ${TOK.cell2}` }}
          >
            <SectionHeader
              eyebrow="Lifecycle matrix"
              title="Discrete 3-level heatmap"
            />

            <CaptionFields
              title={matrixTitle}
              setTitle={setMatrixTitle}
              xLabel={matrixXL}
              setXLabel={setMatrixXL}
              yLabel={matrixYL}
              setYLabel={setMatrixYL}
              footer={matrixFoot}
              setFooter={setMatrixFoot}
              note="Cells use the fixed palette only (0 / 1 / 2). Legend is embedded in SVG exports bottom-left."
            />

            <DataEntryModeTabs
              idPrefix="studio-matrix-data"
              value={matrixDataMode}
              onChange={setMatrixDataMode}
            />

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,minmax(0,460px)]">
              <div
                className={cn("border overflow-hidden", RAD.outer)}
                style={{ borderColor: TOK.cardBorder, background: TOK.cardBg }}
              >
                <div className="p-4" style={{ background: TOK.pageBg }}>
                  <div className="overflow-auto rounded-none border bg-white p-3" style={{ borderColor: TOK.cardBorder }}>
                    <div className="flex w-full justify-center">
                      <div className="w-full min-w-0 max-w-[780px]">{matrixVisualization}</div>
                    </div>
                  </div>
                </div>
                <div
                  className="flex flex-wrap items-center gap-2 border-t p-4"
                  style={{ borderColor: BORDER_TIGHT }}
                >
                  <button
                    type="button"
                    onClick={matrixSvgExport}
                    className="inline-flex items-center gap-2 border px-3 py-2 font-sans text-xs font-medium"
                    style={{
                      borderColor: TOK.cardBorder,
                      background: TOK.pageBg,
                      color: TOK.textPrimary,
                    }}
                  >
                    <ArrowDownToLine className="size-4" /> Download SVG
                  </button>
                  <button
                    type="button"
                    onClick={() => void copyMatrixSvgText()}
                    className="inline-flex items-center gap-2 border bg-white px-3 py-2 font-sans text-xs font-medium"
                    style={{ borderColor: TOK.cardBorder, color: TOK.textPrimary }}
                    title="Copy SVG (text elements, UTF-8)"
                  >
                    <Copy className="size-4" aria-hidden /> Copy SVG
                  </button>
                  <button
                    type="button"
                    onClick={() => void downloadMatrixPng()}
                    className="inline-flex items-center gap-2 border px-3 py-2 font-sans text-xs font-medium"
                    style={{
                      borderColor: TOK.cardBorder,
                      background: TOK.pageBg,
                      color: TOK.textPrimary,
                    }}
                  >
                    <Download className="size-4" /> PNG @2×
                  </button>
                  <button
                    type="button"
                    onClick={() => void copyMatrixPng()}
                    className="inline-flex items-center gap-2 border bg-white px-3 py-2 font-sans text-xs font-medium"
                    style={{ borderColor: TOK.cardBorder, color: TOK.textPrimary }}
                    disabled={typeof ClipboardItem === "undefined"}
                  >
                    <Copy className="size-4" /> Copy PNG
                  </button>
                  {copied === "matrix" ? (
                    <span className="text-xs font-medium text-emerald-800">Copied</span>
                  ) : null}
                </div>
              </div>

              <div className="space-y-4">
                <div
                  id="studio-matrix-data-panel-manual"
                  role="tabpanel"
                  aria-labelledby="studio-matrix-data-tab-manual"
                  hidden={matrixDataMode !== "manual"}
                >
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMatrixCols((cs) => [
                        ...cs,
                        { id: nid("mc"), label: `Phase ${cs.length + 1}` },
                      ]);
                      setMatrixRows((rs) =>
                        rs.map((r) => ({ ...r, cells: [...r.cells, 0] }))
                      );
                    }}
                    className="inline-flex items-center gap-2 border bg-white px-3 py-2 text-xs font-medium"
                    style={{ borderColor: BORDER_TIGHT, color: TOK.textPrimary }}
                  >
                    <PlusCircle className="size-4" /> Add column
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMatrixCols((cs) =>
                        cs.length <= 1 ? cs : cs.slice(0, -1)
                      );
                      setMatrixRows((rs) =>
                        rs.map((r) => ({
                          ...r,
                          cells:
                            r.cells.length <= 1
                              ? r.cells
                              : r.cells.slice(0, -1),
                        }))
                      );
                    }}
                    disabled={matrixCols.length <= 1}
                    className="inline-flex items-center gap-2 border bg-white px-3 py-2 text-xs font-medium disabled:opacity-40"
                    style={{ borderColor: BORDER_TIGHT, color: TOK.textPrimary }}
                  >
                    Remove last column
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setMatrixRows((rs) => [
                        ...rs,
                        {
                          id: nid("mr"),
                          label: `Stream ${rs.length + 1}`,
                          cells: matrixCols.map(() => 0),
                        },
                      ])
                    }
                    className="inline-flex items-center gap-2 border bg-white px-3 py-2 text-xs font-medium"
                    style={{ borderColor: BORDER_TIGHT, color: TOK.textPrimary }}
                  >
                    <PlusCircle className="size-4" /> Add row
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setMatrixRows((rs) =>
                        rs.length <= 1 ? rs : rs.slice(0, -1)
                      )
                    }
                    disabled={matrixRows.length <= 1}
                    className="inline-flex items-center gap-2 border bg-white px-3 py-2 text-xs font-medium disabled:opacity-40"
                    style={{ borderColor: BORDER_TIGHT, color: TOK.textPrimary }}
                  >
                    Remove last row
                  </button>
                </div>

                <div className="space-y-2">
                  <span className={labelSpanStyle}>Column headers</span>
                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${Math.max(matrixCols.length, 1)}, minmax(0,1fr))`,
                    }}
                  >
                    {matrixCols.map((col, ci) => (
                      <input
                        key={col.id}
                        aria-label={`Column ${ci + 1} label`}
                        className="border bg-white px-2 py-2 text-sm outline-none"
                        style={{ borderColor: BORDER_TIGHT, color: TOK.textPrimary }}
                        value={col.label}
                        onChange={(e) =>
                          setMatrixCols((cs) =>
                            cs.map((c) =>
                              c.id === col.id ? { ...c, label: e.target.value } : c
                            )
                          )
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className={labelSpanStyle}>Rows & scores (0–2)</span>
                  {matrixRows.map((row) => (
                    <div
                      key={row.id}
                      className="space-y-2 border p-3"
                      style={{ borderColor: BORDER_TIGHT }}
                    >
                      <input
                        className="w-full border bg-white px-3 py-2 text-sm outline-none"
                        style={{ borderColor: BORDER_TIGHT, color: TOK.textPrimary }}
                        value={row.label}
                        onChange={(e) =>
                          setMatrixRows((rs) =>
                            rs.map((r) =>
                              r.id === row.id ? { ...r, label: e.target.value } : r
                            )
                          )
                        }
                      />
                      <div
                        className="grid gap-2"
                        style={{
                          gridTemplateColumns: `repeat(${Math.max(matrixCols.length, 1)}, minmax(0,1fr))`,
                        }}
                      >
                        {matrixCols.map((col, ci) => (
                          <label key={col.id} className="flex flex-col gap-1">
                            <span className="text-[10px] font-medium uppercase tracking-[0.08em]" style={{ color: "rgba(139, 90, 43, 0.72)" }}>
                              {col.label || `C${ci + 1}`}
                            </span>
                            <select
                              className="border bg-white px-2 py-2 text-sm outline-none"
                              style={{ borderColor: BORDER_TIGHT, color: TOK.textPrimary }}
                              value={row.cells[ci] ?? 0}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                setMatrixRows((rs) =>
                                  rs.map((r) =>
                                    r.id === row.id
                                      ? {
                                          ...r,
                                          cells: matrixCols.map((_, j) =>
                                            j === ci
                                              ? v
                                              : (r.cells[j] ?? 0)
                                          ),
                                        }
                                      : r
                                  )
                                );
                              }}
                            >
                              <option value={0}>0 · absent</option>
                              <option value={1}>1 · partial / supporting</option>
                              <option value={2}>2 · central capability</option>
                            </select>
                          </label>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="inline-flex gap-2 text-xs uppercase tracking-[0.08em] text-zinc-600"
                        onClick={() =>
                          setMatrixRows((rs) => rs.filter((r) => r.id !== row.id))
                        }
                        disabled={matrixRows.length <= 1}
                      >
                        <XCircle className="size-4" /> Remove row
                      </button>
                    </div>
                  ))}
                </div>
                </div>

                <div
                  id="studio-matrix-data-panel-paste"
                  role="tabpanel"
                  aria-labelledby="studio-matrix-data-tab-paste"
                  hidden={matrixDataMode !== "paste"}
                  className="border-t pt-4"
                  style={{ borderColor: BORDER_TIGHT }}
                >
                  <PasteDataBlock
                    embedded
                    id="studio-paste-matrix"
                    hint={
                      <>
                        First row: empty top-left cell (or any label), then <strong>column</strong> names.
                        Each following row: row label, then scores <strong>0</strong>, <strong>1</strong>, or{" "}
                        <strong>2</strong> only — tab- or comma-separated.
                      </>
                    }
                    example={PASTE_PLACEHOLDER_MATRIX}
                    value={pasteMatrix}
                    onChange={setPasteMatrix}
                    onApply={applyMatrixPaste}
                    onClear={() => {
                      setPasteMatrix("");
                      setPasteMatrixErr(null);
                    }}
                    error={pasteMatrixErr}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {tab === "flow" && (
          <section
            className={cn("border bg-white p-6", RAD.outer)}
            style={{ borderColor: BORDER_TIGHT, borderTop: `3px solid ${TOK.barPrimary}` }}
          >
            <SectionHeader eyebrow="Flowchart" title="Compose with steps & arrows" />

            <CaptionFields
              title={flowTitle}
              setTitle={setFlowTitle}
              xLabel={flowXL}
              setXLabel={setFlowXL}
              yLabel={flowYL}
              setYLabel={setFlowYL}
              footer={flowFoot}
              setFooter={setFlowFoot}
              note="These captions frame the diagram below and are baked into PNG exports (title rule + subtitle + footer)."
            />

            <DataEntryModeTabs
              idPrefix="studio-flow-data"
              value={flowDataMode}
              onChange={setFlowDataMode}
            />

            <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(340px,1fr)]">
              <div
                className={cn("overflow-hidden border", RAD.outer)}
                style={{
                  borderColor: TOK.cardBorder,
                  background: TOK.cardBg,
                  boxShadow: "none",
                }}
              >
                <div
                  className="border-b px-5 py-5 md:px-6 md:py-6"
                  style={{ borderColor: TOK.cardBorder, background: TOK.cardBg }}
                >
                  {(flowTitle.trim() ||
                    flowXL.trim() ||
                    flowYL.trim()) && (
                    <header className="text-center">
                      {flowTitle.trim() ? (
                        <h3
                          className="font-sans text-[18px] font-bold leading-snug tracking-[0.01em] md:text-[19px]"
                          style={{ color: TOK.textPrimary }}
                        >
                          {flowTitle}
                        </h3>
                      ) : null}
                      {(flowXL.trim() || flowYL.trim()) && (
                        <p
                          className={cn(
                            "mx-auto max-w-2xl font-sans text-[11px] font-medium uppercase leading-relaxed tracking-[0.12em]",
                            flowTitle.trim() ? "mt-3" : ""
                          )}
                          style={{ color: "rgba(139, 90, 43, 0.72)" }}
                        >
                          {[flowYL.trim(), flowXL.trim()].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </header>
                  )}
                </div>

                <div className="p-4" style={{ background: TOK.pageBg }}>
                  <div
                    className={cn(
                      "flex min-h-[300px] overflow-hidden border bg-white",
                      RAD.outer
                    )}
                    style={{ borderColor: TOK.cardBorder }}
                  >
                    {flowYL.trim() ? (
                      <div
                        className="flex w-[2.75rem] shrink-0 items-center justify-center border-r md:w-14"
                        style={{
                          background: TOK.pageBg,
                          borderColor: TOK.cardBorder,
                          writingMode: "vertical-rl",
                          transform: "rotate(180deg)",
                        }}
                      >
                        <span
                          className="font-sans text-[11px] font-medium uppercase tracking-[0.12em]"
                          style={{ color: TOK.textPrimary }}
                        >
                          {flowYL}
                        </span>
                      </div>
                    ) : null}
                    <div className="min-h-[280px] min-w-0 flex-1 overflow-auto px-4 py-6 md:px-8 md:py-8">
                      <div
                        ref={flowWrapRef}
                        className="flex min-h-[240px] w-full justify-center [&>svg]:mx-auto [&>svg]:block [&>svg]:h-auto [&>svg]:max-w-full"
                      />
                    </div>
                  </div>
                </div>

                {flowFoot.trim() ? (
                  <footer
                    className="border-t px-5 py-5 text-center md:px-6"
                    style={{ borderColor: TOK.cardBorder, background: TOK.cardBg }}
                  >
                    <p
                      className="mx-auto max-w-xl font-sans text-[13px] italic leading-relaxed md:text-[14px]"
                      style={{ color: "rgba(139, 90, 43, 0.72)" }}
                    >
                      {flowFoot}
                    </p>
                  </footer>
                ) : null}

                {flowError ? (
                  <p
                    className="border-t px-4 py-4 font-mono text-xs text-red-600 md:px-5"
                    style={{ borderColor: TOK.cardBorder, background: TOK.cardBg }}
                  >
                    {flowError}
                  </p>
                ) : null}

                <div
                  className="flex flex-wrap items-center gap-2 border-t p-4 md:p-5"
                  style={{ borderColor: TOK.cardBorder, background: TOK.cardBg }}
                >
                  <button
                    type="button"
                    onClick={() => void downloadFlowPng()}
                    className="inline-flex items-center gap-2 border px-3 py-2 font-sans text-xs font-medium"
                    style={{
                      borderColor: TOK.cardBorder,
                      background: TOK.pageBg,
                      color: TOK.textPrimary,
                    }}
                  >
                    <ArrowDownToLine className="size-4" /> Download PNG
                  </button>
                  <button
                    type="button"
                    onClick={() => void copyFlowPng()}
                    className="inline-flex items-center gap-2 border bg-white px-3 py-2 font-sans text-xs font-medium"
                    style={{ borderColor: TOK.cardBorder, color: TOK.textPrimary }}
                    title="Copy raster image (PNG, solid white background)"
                  >
                    <Copy className="size-4" aria-hidden /> Copy PNG
                  </button>
                  <button
                    type="button"
                    onClick={downloadFlowSvg}
                    className="inline-flex items-center gap-2 border bg-white px-3 py-2 font-sans text-xs font-medium"
                    style={{ borderColor: TOK.cardBorder, color: TOK.textPrimary }}
                  >
                    <ArrowDownToLine className="size-4" /> Download SVG
                  </button>
                  <button
                    type="button"
                    onClick={() => void copyFlowSvgText()}
                    className="inline-flex items-center gap-2 border bg-white px-3 py-2 font-sans text-xs font-medium"
                    style={{ borderColor: TOK.cardBorder, color: TOK.textPrimary }}
                    title="Copy SVG markup (opaque white background)"
                  >
                    <Copy className="size-4" aria-hidden /> Copy SVG
                  </button>
                  {copied === "flow" ? (
                    <span className="text-xs font-medium text-emerald-800">Copied</span>
                  ) : null}
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <p className={labelSpanStyle}>Layout direction</p>
                  <div className="mt-2 flex gap-2">
                    {(["LR", "TB"] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setFlowDirection(d)}
                        className={cn(
                          "flex-1 border px-4 py-2 text-xs font-medium uppercase tracking-[0.08em]",
                          flowDirection === d
                            ? "border-[#8B5A2B] bg-[#8B5A2B] text-white"
                            : "border-[#E8E4DC] bg-white",
                          RAD.outer
                        )}
                        style={
                          flowDirection === d
                            ? undefined
                            : { color: TOK.textPrimary }
                        }
                      >
                        {d === "LR" ? "Left → right" : "Top → bottom"}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  id="studio-flow-data-panel-manual"
                  role="tabpanel"
                  aria-labelledby="studio-flow-data-tab-manual"
                  hidden={flowDataMode !== "manual"}
                >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={labelSpanStyle}>Steps</span>
                    <button
                      type="button"
                      className={cn(
                        "inline-flex items-center gap-1 border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em]",
                        RAD.outer
                      )}
                      style={{
                        borderColor: TOK.cardBorder,
                        background: TOK.pageBg,
                        color: TOK.textPrimary,
                      }}
                      onClick={() =>
                        setFlowNodes((nodes) => [
                          ...nodes,
                          { id: nid("fn"), label: "New step", shape: "rect" },
                        ])
                      }
                    >
                      <Plus className="size-3.5" /> Rectangle
                    </button>
                  </div>
                  <button
                    type="button"
                    className={cn(
                      "mr-2 inline-flex items-center gap-1 border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em]",
                      RAD.outer
                    )}
                    style={{
                      borderColor: TOK.cardBorder,
                      background: TOK.pageBg,
                      color: TOK.textPrimary,
                    }}
                    onClick={() =>
                      setFlowNodes((nodes) => [
                        ...nodes,
                        { id: nid("fn"), label: "Start / end", shape: "round" },
                      ])
                    }
                  >
                    <Plus className="size-3.5" /> Capsule terminal
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-1 border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em]",
                      RAD.outer
                    )}
                    style={{
                      borderColor: TOK.cardBorder,
                      background: TOK.pageBg,
                      color: TOK.textPrimary,
                    }}
                    onClick={() =>
                      setFlowNodes((nodes) => [
                        ...nodes,
                        { id: nid("fn"), label: "Decision", shape: "diamond" },
                      ])
                    }
                  >
                    <Plus className="size-3.5" /> Decision
                  </button>

                  {flowNodes.map((node) => (
                    <div
                      key={node.id}
                      className="flex flex-wrap items-start gap-2 border p-3"
                      style={{ borderColor: BORDER_TIGHT }}
                    >
                      <input
                        className="min-w-[120px] flex-1 border bg-[#fcf8f3] px-3 py-2 text-sm outline-none"
                        style={{ borderColor: BORDER_TIGHT }}
                        value={node.label}
                        onChange={(e) =>
                          setFlowNodes((ns) =>
                            ns.map((n) =>
                              n.id === node.id ? { ...n, label: e.target.value } : n
                            )
                          )
                        }
                      />
                      <select
                        className="border bg-white px-2 py-2 text-xs outline-none"
                        style={{ borderColor: BORDER_TIGHT }}
                        value={node.shape}
                        onChange={(e) =>
                          setFlowNodes((ns) =>
                            ns.map((n) =>
                              n.id === node.id
                                ? { ...n, shape: e.target.value as FlowShape }
                                : n
                            )
                          )
                        }
                      >
                        <option value="rect">Rectangle</option>
                        <option value="round">Terminal</option>
                        <option value="diamond">Decision</option>
                      </select>
                      <button
                        type="button"
                        className="border px-2 py-2 text-zinc-500"
                        style={{ borderColor: BORDER_TIGHT }}
                        onClick={() => {
                          setFlowNodes((ns) => ns.filter((n) => n.id !== node.id));
                          setFlowEdges((es) =>
                            es.filter((e) => e.fromId !== node.id && e.toId !== node.id)
                          );
                        }}
                        disabled={flowNodes.length <= 1}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t pt-6" style={{ borderColor: BORDER_TIGHT }}>
                  <span className={labelSpanStyle}>Connectors</span>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <select
                      className="border bg-white px-3 py-2 text-sm outline-none"
                      style={{ borderColor: BORDER_TIGHT }}
                      value={edgeDraft.fromId}
                      onChange={(e) =>
                        setEdgeDraft((d) => ({ ...d, fromId: e.target.value }))
                      }
                    >
                      <option value="">From…</option>
                      {flowNodes.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.label || n.id}
                        </option>
                      ))}
                    </select>
                    <select
                      className="border bg-white px-3 py-2 text-sm outline-none"
                      style={{ borderColor: BORDER_TIGHT }}
                      value={edgeDraft.toId}
                      onChange={(e) =>
                        setEdgeDraft((d) => ({ ...d, toId: e.target.value }))
                      }
                    >
                      <option value="">To…</option>
                      {flowNodes.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.label || n.id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    className="w-full border bg-white px-3 py-2 text-sm outline-none"
                    style={{ borderColor: BORDER_TIGHT }}
                    placeholder="Optional edge label (e.g. yes)"
                    value={edgeDraft.label}
                    onChange={(e) =>
                      setEdgeDraft((d) => ({ ...d, label: e.target.value }))
                    }
                  />
                  <button
                    type="button"
                    onClick={addCommittedFlowEdge}
                    className="inline-flex items-center gap-2 border px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-white"
                    style={{ borderColor: TOK.barPrimary, background: TOK.barPrimary }}
                  >
                    <Plus className="size-4" /> Add arrow
                  </button>

                  <ul className="space-y-2 text-sm">
                    {actualEdges(flowEdges).map((e) => {
                      const fromN = flowNodes.find((n) => n.id === e.fromId);
                      const toN = flowNodes.find((n) => n.id === e.toId);
                      return (
                        <li
                          key={e.id}
                          className="flex flex-wrap items-center justify-between gap-2 border px-3 py-2"
                          style={{ borderColor: BORDER_TIGHT }}
                        >
                          <span className="text-zinc-700">
                            {fromN?.label ?? e.fromId} → {toN?.label ?? e.toId}
                            {e.label.trim() ? ` (“${e.label}”)` : ""}
                          </span>
                          <button
                            type="button"
                            className="text-xs text-red-600"
                            onClick={() =>
                              setFlowEdges((es) => es.filter((x) => x.id !== e.id))
                            }
                          >
                            Remove
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                </div>

                <div
                  id="studio-flow-data-panel-paste"
                  role="tabpanel"
                  aria-labelledby="studio-flow-data-tab-paste"
                  hidden={flowDataMode !== "paste"}
                  className="border-t pt-4"
                  style={{ borderColor: BORDER_TIGHT }}
                >
                  <PasteDataBlock
                    embedded
                    id="studio-paste-flow"
                    hint={
                      <>
                        Line-based format (tab or comma). Start with <code className="font-mono text-[11px]">LR</code> or{" "}
                        <code className="font-mono text-[11px]">TB</code> (or <code className="font-mono text-[11px]">D</code>{" "}
                        + direction). <strong>N</strong> = node: <code className="font-mono text-[11px]">N	&lt;id&gt;	&lt;label&gt;	&lt;shape&gt;</code>{" "}
                        (<code className="font-mono text-[11px]">round</code>, <code className="font-mono text-[11px]">rect</code>,{" "}
                        <code className="font-mono text-[11px]">diamond</code>) or <code className="font-mono text-[11px]">N	&lt;label&gt;	&lt;shape&gt;</code>{" "}
                        for auto ids. <strong>E</strong> = edge:{" "}
                        <code className="font-mono text-[11px]">E	&lt;fromId&gt;	&lt;toId&gt;	&lt;optional label&gt;</code> — ids must match{" "}
                        <strong>N</strong> lines.
                      </>
                    }
                    example={PASTE_PLACEHOLDER_FLOW}
                    value={pasteFlow}
                    onChange={setPasteFlow}
                    onApply={applyFlowPaste}
                    onClear={() => {
                      setPasteFlow("");
                      setPasteFlowErr(null);
                    }}
                    error={pasteFlowErr}
                  />
                </div>
              </div>
            </div>
          </section>
        )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function actualEdges(edges: FlowEdge[]) {
  return edges.filter((e) => e.fromId && e.toId);
}

function PlayerCard({
  accent,
  name,
  chip,
}: {
  accent: string;
  name: string;
  chip: string;
}) {
  return (
    <figure
      className={cn("border bg-white p-5", RAD.outer)}
      style={{
        borderWidth: "0.5px",
        borderStyle: "solid",
        borderColor: BORDER_TIGHT,
        borderTopWidth: 3,
        borderTopColor: accent,
      }}
    >
      <figcaption>
        <p className="font-sans text-[13px] font-medium" style={{ color: TOK.textPrimary }}>
          {name}
        </p>
        <span
          className="mt-4 inline-flex font-sans text-[13px] font-medium"
          style={{
            background: TOK.pageBg,
            color: TOK.textPrimary,
            border: `1px solid ${BORDER_TIGHT}`,
            padding: "8px 12px",
          }}
        >
          {chip}
        </span>
      </figcaption>
    </figure>
  );
}
