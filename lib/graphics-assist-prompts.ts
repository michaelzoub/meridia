import type { ChartPasteKind } from "@/lib/graphics-paste-parsers";

/** Instructions aligned with `graphics-paste-parsers.ts` — keep in sync when parsers change. */

export const GRAPHICS_ASSIST_RULES: Record<ChartPasteKind, string> = {
  bar: `BAR CHART paste format (TAB-separated preferred; comma OK if cells have no commas):
- Each DATA row: Label<TAB>number<TAB>number (two numeric series).
- Optional HEADER row first: if columns 2–3 are NOT numbers, they become legend labels for the two series; following rows are data.
- Numbers may include commas (e.g. 1,234); they become integers after rounding.
Example:
Quarter\tSeries A\tSeries B
Q1\t42\t33`,

  dot: `DOT PLOT paste format (TAB-separated preferred):
- Each DATA row: Label<TAB>baseline<TAB>Dprime<TAB>Cprime (four numeric columns; decimals OK; rounded when stored).
- Optional HEADER row if columns 2–4 are names, not numbers.

**Benchmark / evaluation tables** (correct %, incorrect %, F1, extraneous, etc.):
- baseline = primary **accuracy / fully correct** % (0–100, higher is better).
- D′ = **F1** or another quality score already on 0–100 (higher is better).
- C′ = a third **higher-is-better** score on 0–100. For "fully incorrect %" or any **lower-is-better** error rate, use **C′ = 100 − that percentage** so it aligns with baseline/D′. Never put raw high error % in C′ next to low correct % — that falsely widens rows (e.g. Haiku with ~13% correct and ~71% incorrect should not use 71 as C′; use ~29 for 100−71).
- If the source has only two metrics plus labels, derive a third comparable score or repeat with clear semantics—do not mix incompatible scales.

Example:
Model\tBaseline\tD'\tC'
Alpha\t66\t82\t29`,

  matrix: `LIFECYCLE MATRIX paste format:
- Row 1 HEADER: first cell row-label column (may be empty); remaining cells = column phase names.
- Each DATA row: rowLabel<TAB>score<TAB>score... — scores MUST be only 0, 1, or 2 (heatmap levels).
- Same number of columns as header for every row.
Example:
\tDiscover\tDesign\tBuild
Row A\t0\t1\t2`,

  flow: `FLOW CHART — EITHER programmatic paste OR Mermaid (matches on-screen preview):

Paste format (TAB-separated fields):
- Direction line: LR or TB (or D\tLR / D\tTB).
- Nodes: N\tid\tlabel\tshape (shape: round | rect | diamond) OR N\tlabel\tshape for auto ids.
- Edges: E\tfromNodeId\ttoNodeId\toptionalEdgeLabel — ids must match N lines.

Mermaid-style (optional; same as studio preview):
- First line: flowchart LR or flowchart TB (graph LR / graph TD also OK).
- Nodes: id([Label]) round terminal; id[Label] rectangle; id{Label} diamond.
- Edges: fromId --> toId OR fromId -->|"label"| toId

Use ONE format per response — both normalize to the same diagram.`,
};

export function buildAssistSystemPrompt(kind: ChartPasteKind): string {
  const rule = GRAPHICS_ASSIST_RULES[kind];
  return `You convert natural-language requests into paste-ready data for one graphics widget.

${rule}

Hard rules:
- Respond with a single JSON object only (no markdown fences). Shape: {"tsv":"<string>"}
- The "tsv" value must be ONE string with lines separated by newline characters \\n. Use literal TAB characters \\t between columns inside each line.
- Do not include explanations, keys other than "tsv", or trailing commentary.
- Ensure the TSV strictly satisfies the rules above so it passes programmatic validation.`;
}

/** Vision path: transcribe table/diagram from a screenshot into the same TSV shape. */
export function buildImageExtractSystemPrompt(kind: ChartPasteKind): string {
  const rule = GRAPHICS_ASSIST_RULES[kind];
  return `You are given an image that may show a spreadsheet fragment, data table, chart-with-values, or handwritten grid.

Read the image and transcribe the structured data into paste-ready text for one graphics widget.

${rule}

Hard rules:
- Respond with a single JSON object only (no markdown fences). Shape: {"tsv":"<string>"}
- The "tsv" value must be ONE string with lines separated by \\n. Use TAB \\t between columns on each line.
- Guess illegible cells conservatively; prefer leaving a row out over inventing numbers.
- Do not include explanations outside the JSON.
- Ensure the TSV strictly satisfies the rules above so it passes programmatic validation.`;
}
