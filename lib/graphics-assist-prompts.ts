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
- Each DATA row needs exactly 4 columns: Label<TAB>baseline<TAB>Dprime<TAB>Cprime (semantic names D′/C′ are editorial).
- Optional HEADER row: Label, Baseline, D or D', C or C' — recognized column names; skip header if columns 2–4 look like names not numbers.
- All three numeric columns must be parseable numbers (decimals OK; stored rounded).
Example:
Model\tBaseline\tD'\tC'
Alpha\t0\t45\t72`,

  matrix: `LIFECYCLE MATRIX paste format:
- Row 1 HEADER: first cell row-label column (may be empty); remaining cells = column phase names.
- Each DATA row: rowLabel<TAB>score<TAB>score... — scores MUST be only 0, 1, or 2 (heatmap levels).
- Same number of columns as header for every row.
Example:
\tDiscover\tDesign\tBuild
Row A\t0\t1\t2`,

  flow: `FLOW CHART paste format (line-based; TAB between fields):
- Optional direction line first: LR or TB — OR line "D\tLR" / "D\tTB".
- Node lines start with N:
  - N\tid\tlabel\tshape — shapes: round | rect | diamond
  - OR N\tlabel\tshape — auto-generated ids
- Edge lines: E\tfromNodeId\ttoNodeId\toptionalLabel — ids must match N lines exactly.
- At least one N line required.
Example:
LR
N\tn1\tStart\tround
N\tn2\tStep\trect
E\tn1\tn2`,
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
