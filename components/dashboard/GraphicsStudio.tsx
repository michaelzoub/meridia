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
  BookMarked,
  CircleDot,
  Copy,
  Download,
  GitBranch,
  Layers,
  Minus,
  Plus,
  PlusCircle,
  Shapes,
  Trash2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import { cn } from "@/lib/utils";
import { ResourcePoolIcons } from "./resource-pool-icons";

/** Exported previews sit on solid white — never transparent. */
const EXPORT_BG = "#ffffff";

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

const COL = {
  accent: "#c9722a",
  secondaryFill: "#e8b87a",
  tint: "#faeeda",
  label: "#9a6b3a",
  onAccentText: "#854f0b",
  dPrimeDot: "#6b9fd4",
  baselineDot: "#2c2c2a",
  cPrimeDot: "#c9722a",
  connector: "rgba(201,114,42,0.25)",
  zeroLine: "rgba(136,135,128,0.5)",
  axisTick: "#888780",
  gridLine: "rgba(136,135,128,0.15)",
  ruleHome: "#e0dcd8",
} as const;

const BORDER_TIGHT = COL.ruleHome;

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

  mctx.font =
    '500 17px var(--font-instrument-serif), Georgia, "Times New Roman", serif';
  const titleLines = meta.title.trim()
    ? wrapCanvasLines(mctx, meta.title.trim(), maxTextWidth - padX * 2)
    : [];

  const subtitleParts = [
    meta.yLabel?.trim() ?? "",
    meta.xLabel?.trim() ?? "",
  ].filter(Boolean);
  const subtitle = subtitleParts.join(" · ");

  mctx.font =
    '500 11px var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif';
  const subLines = subtitle
    ? wrapCanvasLines(mctx, subtitle.toUpperCase(), maxTextWidth - padX * 2)
    : [];

  mctx.font = 'italic 13px Georgia, "Times New Roman", serif';
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
    ctx.fillStyle = "#111111";
    ctx.font =
      '500 17px var(--font-instrument-serif), Georgia, "Times New Roman", serif';
    titleLines.forEach((line, i) => {
      ctx.fillText(line, contentW / 2, y + 17 + i * 22);
    });
    y += titleLines.length * 22 + (subLines.length ? 12 : 16);
  }

  if (subLines.length) {
    ctx.fillStyle = COL.label;
    ctx.font =
      '500 11px var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif';
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
    ctx.fillStyle = "#8a8680";
    ctx.font = 'italic 13px Georgia, "Times New Roman", serif';
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

type TabId = "bar" | "dot" | "flow";

type BarRow = { id: string; label: string; c: number; d: number };
type DotRow = {
  id: string;
  label: string;
  baseline: number;
  dPrime: number;
  cPrime: number;
};

type FlowShape = "round" | "rect" | "diamond";
export type FlowNode = {
  id: string;
  label: string;
  shape: FlowShape;
};
export type FlowEdge = { id: string; fromId: string; toId: string; label: string };

let idSeq = 0;
function nid(prefix: string) {
  idSeq += 1;
  return `${prefix}_${idSeq}_${Math.random().toString(36).slice(2, 6)}`;
}

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

const DESIGN_INSTRUCTIONS = `See dashboard copy for palette and typography anchors. Sections below use editable titles, axis captions, and footers like the negotiation / pipeline graphics.`;

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
        style={{ fontSize: 17, fontWeight: 500, color: "#111111" }}
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
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: COL.label,
      }}
    >
      <span className="inline-flex items-center gap-2">
        <span
          className="inline-block shrink-0"
          style={{ width: 14, height: 14, backgroundColor: COL.accent }}
          aria-hidden
        />
        {cLegend}
      </span>
      <span className="inline-flex items-center gap-2">
        <span
          className="inline-block shrink-0"
          style={{ width: 14, height: 14, backgroundColor: COL.secondaryFill }}
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
    "mt-1 w-full border bg-white px-3 py-2 text-sm text-[#111] outline-none",
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
  "text-[11px] font-medium uppercase tracking-[0.1em] block text-[#9a6b3a]";

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
        className="px-2 py-2 text-[#854f0b] hover:bg-[#faf5eb]"
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
        className="px-2 py-2 text-[#854f0b] hover:bg-[#faf5eb]"
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
    { id: "flow" as const, label: "Flow chart", icon: GitBranch },
  ];

  const [tab, setTab] = useState<TabId>("bar");
  const [copied, setCopied] = useState<null | "bar" | "dot" | "flow">(null);

  const flashCopied = useCallback((key: "bar" | "dot" | "flow") => {
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
          backgroundColor: COL.accent,
          borderRadius: 3,
          borderSkipped: false,
        },
        {
          label: barLegendD,
          data: barParsed.dData,
          backgroundColor: COL.secondaryFill,
          borderRadius: 3,
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
      plugins: {
        legend: { display: false },
        title: {
          display: Boolean(barTitle.trim()),
          text: barTitle.trim(),
          color: "#111111",
          font: { size: 16, weight: 500 },
          padding: { top: 0, bottom: 12 },
        },
        tooltip: {
          backgroundColor: COL.tint,
          titleColor: COL.onAccentText,
          bodyColor: COL.label,
          borderColor: BORDER_TIGHT,
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
          ticks: { font: { size: 11 }, color: COL.axisTick },
          grid: { display: false },
          title: {
            display: Boolean(barXL.trim()),
            text: barXL.trim(),
            color: COL.label,
            font: { size: 11, weight: 500 },
            padding: { top: 8 },
          },
        },
        y: {
          ticks: { font: { size: 12 }, color: COL.axisTick },
          grid: { color: COL.gridLine },
          title: {
            display: Boolean(barYL.trim()),
            text: barYL.trim(),
            color: COL.label,
            font: { size: 11, weight: 500 },
            padding: { bottom: 8 },
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

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: "base",
          themeVariables: {
            fontFamily:
              'var(--font-geist-sans, ui-sans-serif), system-ui, sans-serif',
            primaryColor: "#fdf9f3",
            primaryTextColor: COL.onAccentText,
            primaryBorderColor: COL.accent,
            lineColor: COL.label,
            secondaryColor: EXPORT_BG,
            tertiaryColor: EXPORT_BG,
            background: EXPORT_BG,
            mainBkg: EXPORT_BG,
            nodeBorder: COL.accent,
            clusterBkg: EXPORT_BG,
            titleColor: COL.onAccentText,
            edgeLabelBackground: "#fdf9f3",
          },
          flowchart: {
            curve: "basis",
            htmlLabels: false,
            padding: 22,
            useMaxWidth: true,
            nodeSpacing: 56,
            rankSpacing: 72,
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
    const padTop = dotTitle.trim() ? 40 : 10;
    const padBottom =
      28 + (dotXL.trim() ? 22 : 0) + (dotFoot.trim() ? 30 : 0);
    const padX = 56;
    const rowH = 44;
    const h = padTop + Math.max(parsedDots.length, 1) * rowH + padBottom + 24;
    const w = 640;
    const plotW = w - padX * 2;
    const vals = parsedDots.flatMap((r) => [r.baseline, r.dPrime, r.cPrime]);
    const vmin = vals.length ? Math.min(0, ...vals) : 0;
    const vmax = vals.length ? Math.max(100, ...vals) : 100;
    const span = vmax - vmin || 1;

    const xFor = (v: number) => padX + ((v - vmin) / span) * plotW;

    return (
      <svg
        id="dashboard-dot-svg"
        width="100%"
        viewBox={`0 0 ${w} ${h}`}
        aria-label={dotTitle || "Dot plot visualization"}
      >
        <title>{dotTitle || "Dot plot"}</title>
        <rect width="100%" height="100%" fill={EXPORT_BG} />
        {dotTitle.trim() && (
          <text
            x={w / 2}
            y={22}
            textAnchor="middle"
            fill="#111111"
            fontSize={16}
            fontWeight={500}
            fontFamily="var(--font-geist-sans, system-ui)"
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
                y={padTop - (dotTitle.trim() ? 12 : 4)}
                textAnchor="middle"
                fill={COL.axisTick}
                fontSize={11}
                fontFamily="var(--font-geist-sans, system-ui)"
              >
                {Math.round(tick)}
              </text>
              <line
                x1={xFor(tick)}
                y1={padTop + 10}
                x2={xFor(tick)}
                y2={h - padBottom + 8}
                stroke={COL.gridLine}
                strokeWidth={1}
              />
            </g>
          )
        )}
        {dotYL.trim() && (
          <text
            x={12}
            y={padTop + (parsedDots.length * rowH) / 2}
            fill={COL.label}
            fontSize={11}
            fontWeight={500}
            fontFamily="var(--font-geist-sans, system-ui)"
            transform={`rotate(-90 12 ${padTop + (parsedDots.length * rowH) / 2})`}
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
                x={dotYL.trim() ? 28 : padX / 2 + 14}
                y={cy}
                dominantBaseline="middle"
                fill={COL.label}
                fontSize={13}
                fontWeight={500}
                fontFamily="var(--font-geist-sans, system-ui)"
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
            fill={COL.label}
            fontSize={11}
            fontWeight={500}
            fontFamily="var(--font-geist-sans, system-ui)"
          >
            {dotXL}
          </text>
        )}
        {dotFoot.trim() && (
          <text
            x={w / 2}
            y={h - 10}
            textAnchor="middle"
            fill="#8a8680"
            fontSize={13}
            fontStyle="italic"
            fontFamily="var(--font-instrument-serif, Georgia, serif)"
          >
            {dotFoot}
          </text>
        )}
      </svg>
    );
  }, [parsedDots, dotTitle, dotXL, dotYL, dotFoot]);

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
    <div style={{ background: COL.tint }} className={cn("min-h-[inherit] pb-14", RAD.outer)}>
      <div className="border-b px-6 py-5" style={{ borderColor: BORDER_TIGHT }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-4">
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
              <h1 className="mt-2 font-sans" style={{ fontSize: 17, fontWeight: 500, color: "#111" }}>
                Create graphics & flow charts
              </h1>
              <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-zinc-600">
                Editors below mirror the headline / axis / footer pattern from negotiation and
                pipeline slides: set the title, annotate horizontal and vertical meanings, then add a
                short note under the graphic. Everything is driven by fields and buttons—no diagram
                code to paste. (The old decorative icon strip under this heading was removed; it was
                not connected to the chart data.)
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={cn(
                    "inline-flex items-center gap-2 border px-4 py-2 font-sans text-[13px] font-medium transition-colors",
                    RAD.outer,
                    tab === id
                      ? "border-[#111] bg-[#111] text-white"
                      : "border-[#dcd6cf] bg-white text-zinc-800 hover:border-zinc-500"
                  )}
                >
                  <Icon className="size-3.5 shrink-0" strokeWidth={1.75} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-8 border-t pt-5 text-[13px] leading-snug text-zinc-700" style={{ borderColor: BORDER_TIGHT }}>
            <div className="flex max-w-xl items-start gap-2">
              <BookMarked className="mt-0.5 size-4 shrink-0 text-[#9a6b3a]" strokeWidth={1.75} />
              <details className="group border bg-white px-4 py-3" style={{ borderColor: BORDER_TIGHT }}>
                <summary className="cursor-pointer list-none font-sans text-[13px] font-medium text-zinc-800 [&::-webkit-details-marker]:hidden">
                  Brand presets (palette & type)
                </summary>
                <pre
                  className="mt-3 max-h-[32vh] overflow-auto whitespace-pre-wrap border-t pt-3 font-mono text-[11px] text-zinc-700"
                  style={{ borderColor: BORDER_TIGHT }}
                >
                  {DESIGN_INSTRUCTIONS}
                </pre>
              </details>
            </div>
            <div className="min-w-[min(100%,340px)] flex-1">
              <div className="flex items-start gap-2">
                <Layers className="mt-1 size-4 shrink-0 text-[#9a6b3a]" aria-hidden strokeWidth={1.75} />
                <div>
                  <p className="font-sans uppercase" style={{ fontSize: 11, letterSpacing: "0.1em", color: COL.label, fontWeight: 500 }}>
                    Resource buckets (examples)
                  </p>
                  <ResourcePoolIcons />
                  <p className="mt-3 text-[13px] leading-relaxed text-zinc-600">
                    <strong className="font-medium text-[#854f0b]">Energy</strong>,{" "}
                    <strong className="font-medium text-[#854f0b]">focus blocks</strong>, and{" "}
                    <strong className="font-medium text-[#854f0b]">time windows</strong> mirror how
                    negotiation graphics count books, hats, or balls—they are abstract inventories you
                    can trade, spend, or protect. Rename them when you illustrate a concrete game; the
                    shapes are interchangeable legend tiles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {tab === "bar" && (
          <section className={cn("border bg-white p-6", RAD.outer)} style={{ borderColor: BORDER_TIGHT }}>
            <div style={{ borderTop: `3px solid ${COL.accent}`, marginTop: -1, paddingTop: 2 }}>
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
                    className="inline-flex items-center gap-2 border bg-white px-3 py-2 text-xs font-medium text-[#854f0b]"
                    style={{ borderColor: BORDER_TIGHT }}
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

              <div className="mt-6 aspect-[16/9] max-h-[320px] min-h-[220px] w-full bg-white px-2">
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
                  className="inline-flex items-center gap-2 border border-[#854f0b] bg-[#faeeda] px-3 py-2 font-sans text-xs font-medium text-[#854f0b]"
                  style={{ borderColor: BORDER_TIGHT }}
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
          <section className={cn("border bg-white p-6", RAD.outer)} style={{ borderColor: BORDER_TIGHT, borderTop: `3px solid ${COL.secondaryFill}` }}>
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

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,minmax(0,420px)]">
              <div>
                <div className={cn("border", RAD.outer)} style={{ borderColor: BORDER_TIGHT, overflow: "auto" }}>
                  <div className="p-4">
                    <div className="-mx-1 overflow-auto">{dotVisualization}</div>
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
                      <span className="size-3.5 shrink-0 rounded-full" style={{ border: `1px solid ${COL.secondaryFill}`, background: COL.baselineDot }} /> Baseline
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="size-3.5 shrink-0 rounded-full" style={{ border: `1px solid ${COL.secondaryFill}`, background: COL.dPrimeDot }} /> D′
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="size-3.5 shrink-0 rounded-full" style={{ border: `1px solid ${COL.secondaryFill}`, background: COL.cPrimeDot }} /> C′
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t p-4" style={{ borderColor: BORDER_TIGHT }}>
                    <button
                      type="button"
                      onClick={dotSvgExport}
                      className="inline-flex items-center gap-2 border border-[#854f0b] bg-[#faeeda] px-3 py-2 font-sans text-xs font-medium text-[#854f0b]"
                      style={{ borderColor: BORDER_TIGHT }}
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
                    {copied === "dot" ? (
                      <span className="text-xs font-medium text-emerald-800">Copied</span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
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
                    className="inline-flex items-center gap-2 border bg-white px-3 py-2 text-xs font-medium text-[#854f0b]"
                    style={{ borderColor: BORDER_TIGHT }}
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
            </div>

            <div className="mt-12 grid gap-6 border-t pt-10 md:grid-cols-2" style={{ borderColor: BORDER_TIGHT }}>
              <PlayerCard accent={COL.accent} name="Player A panel" chip="Accent strip · orange" />
              <PlayerCard accent={COL.secondaryFill} name="Player B panel" chip="Accent strip · tan" />
            </div>
          </section>
        )}

        {tab === "flow" && (
          <section className={cn("border bg-white p-6", RAD.outer)} style={{ borderColor: BORDER_TIGHT }}>
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

            <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(340px,1fr)]">
              <div
                className="rounded-xl border p-6 md:p-8"
                style={{
                  borderColor: "#e8dfd6",
                  background: COL.tint,
                  boxShadow: "none",
                }}
              >
                <div
                  className="rounded-lg border bg-white p-6 md:p-10"
                  style={{ borderColor: BORDER_TIGHT }}
                >
                  {(flowTitle.trim() ||
                    flowXL.trim() ||
                    flowYL.trim()) && (
                    <header className="pb-6 text-center md:pb-8">
                      {flowTitle.trim() ? (
                        <h3 className="font-serif-display text-[17px] font-medium leading-snug tracking-[0.02em] text-[#111] md:text-[18px]">
                          {flowTitle}
                        </h3>
                      ) : null}
                      {(flowXL.trim() || flowYL.trim()) && (
                        <p
                          className={cn(
                            "mx-auto max-w-2xl font-sans text-[11px] font-medium uppercase leading-relaxed tracking-[0.14em]",
                            flowTitle.trim() ? "mt-4" : ""
                          )}
                          style={{ color: COL.label }}
                        >
                          {[flowYL.trim(), flowXL.trim()].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </header>
                  )}

                  <div
                    className={cn(
                      "flex min-h-[300px]",
                      flowTitle.trim() || flowXL.trim() || flowYL.trim()
                        ? "mt-8 md:mt-10"
                        : ""
                    )}
                  >
                    {flowYL.trim() ? (
                      <div
                        className="flex w-[2.75rem] shrink-0 items-center justify-center md:w-14"
                        style={{
                          background: "#fdfcfa",
                          writingMode: "vertical-rl",
                          transform: "rotate(180deg)",
                        }}
                      >
                        <span className="font-sans text-[11px] font-medium uppercase tracking-[0.12em]" style={{ color: COL.label }}>
                          {flowYL}
                        </span>
                      </div>
                    ) : null}
                    <div
                      ref={flowWrapRef}
                      className="min-h-[280px] min-w-0 flex-1 overflow-auto bg-white px-4 py-8 md:px-12 md:py-10"
                    />
                  </div>

                  {flowFoot.trim() ? (
                    <footer className="mt-8 pt-6 text-center md:mt-10 md:pt-8">
                      <p className="mx-auto max-w-xl font-serif-display text-[14px] italic leading-relaxed text-[#8a8680] md:text-[15px]">
                        {flowFoot}
                      </p>
                    </footer>
                  ) : null}

                  {flowError ? (
                    <p className="px-2 py-4 font-mono text-xs text-red-600 md:px-0">
                      {flowError}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-2 p-4 pt-6 md:p-5 md:pt-8">
                  <button
                    type="button"
                    onClick={() => void downloadFlowPng()}
                    className="inline-flex items-center gap-2 border border-[#854f0b] bg-[#faeeda] px-3 py-2 font-sans text-xs font-medium text-[#854f0b]"
                    style={{ borderColor: BORDER_TIGHT }}
                  >
                    <ArrowDownToLine className="size-4" /> Download PNG
                  </button>
                  <button
                    type="button"
                    onClick={() => void copyFlowPng()}
                    className="inline-flex items-center gap-2 border bg-white px-3 py-2 font-sans text-xs font-medium text-zinc-800"
                    style={{ borderColor: BORDER_TIGHT }}
                    title="Copy raster image (PNG, solid white background)"
                  >
                    <Copy className="size-4" aria-hidden /> Copy PNG
                  </button>
                  <button
                    type="button"
                    onClick={downloadFlowSvg}
                    className="inline-flex items-center gap-2 border bg-white px-3 py-2 font-sans text-xs font-medium text-[#854f0b]"
                    style={{ borderColor: BORDER_TIGHT }}
                  >
                    <ArrowDownToLine className="size-4" /> Download SVG
                  </button>
                  <button
                    type="button"
                    onClick={() => void copyFlowSvgText()}
                    className="inline-flex items-center gap-2 border bg-white px-3 py-2 font-sans text-xs font-medium text-zinc-800"
                    style={{ borderColor: BORDER_TIGHT }}
                    title="Copy SVG markup (opaque white background)"
                  >
                    <Copy className="size-4" aria-hidden /> Copy SVG
                  </button>
                  {copied === "flow" ? (
                    <span className="text-xs font-medium text-emerald-800">Copied</span>
                  ) : null}
                  </div>
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
                            ? "border-[#111] bg-[#111] text-white"
                            : "border-[#dcd6cf] bg-white text-zinc-800",
                          RAD.outer
                        )}
                      >
                        {d === "LR" ? "Left → right" : "Top → bottom"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={labelSpanStyle}>Steps</span>
                    <button
                      type="button"
                      className={cn(
                        "inline-flex items-center gap-1 border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em]",
                        RAD.outer,
                        COL.onAccentText
                      )}
                      style={{ borderColor: BORDER_TIGHT, background: COL.tint }}
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
                      RAD.outer,
                      COL.onAccentText
                    )}
                    style={{ borderColor: BORDER_TIGHT, background: COL.tint }}
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
                      RAD.outer,
                      COL.onAccentText
                    )}
                    style={{ borderColor: BORDER_TIGHT, background: COL.tint }}
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
                    className="inline-flex items-center gap-2 border bg-[#111] px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-white"
                    style={{ borderColor: "#111" }}
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
            </div>
          </section>
        )}
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
        <p className="font-sans text-[13px] font-medium text-[#111]">{name}</p>
        <span
          className="mt-4 inline-flex font-sans text-[13px] font-medium"
          style={{
            background: COL.tint,
            color: COL.onAccentText,
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
