/**
 * Paste parsers for Graphics Studio — shared by client UI and server-side validation
 * (graphics assist API). Row ids are generated here; client display uses these objects as-is.
 */

export type MatrixCol = { id: string; label: string };
export type MatrixRow = { id: string; label: string; cells: number[] };

export type BarRow = { id: string; label: string; c: number; d: number };
export type DotRow = {
  id: string;
  label: string;
  baseline: number;
  dPrime: number;
  cPrime: number;
};

export type FlowShape = "round" | "rect" | "diamond";
export type FlowNode = {
  id: string;
  label: string;
  shape: FlowShape;
};
export type FlowEdge = { id: string; fromId: string; toId: string; label: string };

export type ChartPasteKind = "bar" | "dot" | "matrix" | "flow";

let idSeq = 0;
/** Row/node ids for studio tables and paste rows (client + server parsers). */
export function nid(prefix: string) {
  idSeq += 1;
  return `${prefix}_${idSeq}_${Math.random().toString(36).slice(2, 6)}`;
}

/** Tab-separated preferred; otherwise comma-separated (no embedded commas in cells). */
export function splitDataLine(line: string): string[] {
  const t = line.trim();
  if (!t) return [];
  if (t.includes("\t")) return t.split("\t").map((s) => s.trim());
  return t.split(",").map((s) => s.trim());
}

export function parseNumberLoose(s: string): number | null {
  const n = Number(String(s).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function clampScore01(s: string): number | null {
  const n = Math.round(Number(s.trim()));
  if (!Number.isFinite(n)) return null;
  if (n < 0 || n > 2) return null;
  return n;
}

export type BarPasteResult =
  | { ok: true; rows: BarRow[]; legendC?: string; legendD?: string }
  | { ok: false; error: string };

export function parseBarPaste(text: string): BarPasteResult {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { ok: false, error: "Paste at least one data row." };

  let i0 = 0;
  let legendC: string | undefined;
  let legendD: string | undefined;
  const head = splitDataLine(lines[0]);
  if (head.length >= 3) {
    const n1 = parseNumberLoose(head[1]);
    const n2 = parseNumberLoose(head[2]);
    if (n1 === null || n2 === null) {
      legendC = head[1] || undefined;
      legendD = head[2] || undefined;
      i0 = 1;
    }
  }

  const rows: BarRow[] = [];
  for (let i = i0; i < lines.length; i++) {
    const p = splitDataLine(lines[i]);
    if (p.length < 3) {
      return {
        ok: false,
        error: `Line ${i + 1}: need 3 columns — label, first series, second series (tab or comma).`,
      };
    }
    const c = parseNumberLoose(p[1]);
    const d = parseNumberLoose(p[2]);
    if (c === null || d === null) {
      return {
        ok: false,
        error: `Line ${i + 1}: columns 2 and 3 must be numbers (got "${p[1]}", "${p[2]}").`,
      };
    }
    rows.push({
      id: nid("br"),
      label: p[0] || `Category ${i + 1}`,
      c: Math.round(c),
      d: Math.round(d),
    });
  }
  if (!rows.length) return { ok: false, error: "No numeric data rows found." };
  return { ok: true, rows, legendC, legendD };
}

export type DotPasteResult =
  | { ok: true; rows: DotRow[] }
  | { ok: false; error: string };

function normHeaderCell(s: string): string {
  return s
    .toLowerCase()
    .replace(/['′`]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export function parseDotPaste(text: string): DotPasteResult {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { ok: false, error: "Paste at least one row." };

  const head = splitDataLine(lines[0]);
  let labelIdx = 0;
  let bIdx = 1;
  let dIdx = 2;
  let cIdx = 3;
  let start = 0;

  if (head.length >= 4) {
    const map = new Map<string, number>();
    head.forEach((h, j) => map.set(normHeaderCell(h), j));
    const hasNum = head.slice(1).some((h) => parseNumberLoose(h) !== null);
    if (!hasNum) {
      start = 1;
      labelIdx = map.get("label") ?? map.get("row") ?? map.get("name") ?? 0;
      bIdx = map.get("baseline") ?? map.get("base") ?? 1;
      dIdx = map.get("dprime") ?? map.get("d") ?? 2;
      cIdx = map.get("cprime") ?? map.get("c") ?? 3;
    }
  }

  const rows: DotRow[] = [];
  for (let i = start; i < lines.length; i++) {
    const p = splitDataLine(lines[i]);
    if (p.length < 4) {
      return {
        ok: false,
        error: `Line ${i + 1}: need 4 values — label, baseline, D′, C′ (tab or comma).`,
      };
    }
    const label = (p[labelIdx] ?? "").trim() || `Row ${i + 1}`;
    const b = parseNumberLoose(p[bIdx] ?? "");
    const d = parseNumberLoose(p[dIdx] ?? "");
    const c = parseNumberLoose(p[cIdx] ?? "");
    if (b === null || d === null || c === null) {
      return {
        ok: false,
        error: `Line ${i + 1}: baseline, D′, and C′ must be numbers.`,
      };
    }
    rows.push({
      id: nid("dr"),
      label,
      baseline: Math.round(b),
      dPrime: Math.round(d),
      cPrime: Math.round(c),
    });
  }
  if (!rows.length) return { ok: false, error: "No data rows found." };
  return { ok: true, rows };
}

export type MatrixPasteResult =
  | { ok: true; cols: MatrixCol[]; rows: MatrixRow[] }
  | { ok: false; error: string };

export function parseMatrixPaste(text: string): MatrixPasteResult {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    return {
      ok: false,
      error: "Need a header row (column names) and at least one data row.",
    };
  }
  const header = splitDataLine(lines[0]);
  if (header.length < 2) {
    return {
      ok: false,
      error: "Header row needs a row-label column plus one or more phase columns.",
    };
  }
  const colLabels = header.slice(1).map((c, j) => c || `Column ${j + 1}`);
  const cols: MatrixCol[] = colLabels.map((label) => ({ id: nid("mc"), label }));

  const rows: MatrixRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const p = splitDataLine(lines[i]);
    if (p.length !== colLabels.length + 1) {
      return {
        ok: false,
        error: `Line ${i + 1}: expected ${colLabels.length + 1} columns (row label + ${colLabels.length} scores), got ${p.length}.`,
      };
    }
    const label = (p[0] ?? "").trim() || `Row ${i}`;
    const cells: number[] = [];
    for (let j = 1; j < p.length; j++) {
      const sc = clampScore01(p[j] ?? "");
      if (sc === null) {
        return {
          ok: false,
          error: `Line ${i + 1}, column ${j + 1}: score must be 0, 1, or 2 (got "${p[j]}").`,
        };
      }
      cells.push(sc);
    }
    rows.push({ id: nid("mr"), label, cells });
  }
  if (!rows.length) return { ok: false, error: "No data rows." };
  return { ok: true, cols, rows };
}

export type FlowPasteResult =
  | { ok: true; direction: "LR" | "TB"; nodes: FlowNode[]; edges: FlowEdge[] }
  | { ok: false; error: string };

function parseShape(s: string): FlowShape | null {
  const x = s.toLowerCase().trim();
  if (x === "round" || x === "terminal" || x === "capsule") return "round";
  if (x === "rect" || x === "rectangle" || x === "box") return "rect";
  if (x === "diamond" || x === "decision") return "diamond";
  return null;
}

export function parseFlowPaste(text: string): FlowPasteResult {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { ok: false, error: "Paste at least one line." };

  let direction: "LR" | "TB" = "LR";
  const nodeDraft: { id: string; label: string; shape: FlowShape }[] = [];
  const edgeDraft: { fromId: string; toId: string; label: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const p = splitDataLine(lines[i]);
    if (!p.length) continue;

    if (p.length === 1 && (p[0] === "LR" || p[0] === "TB")) {
      direction = p[0];
      continue;
    }
    if (p[0].toUpperCase() === "D" && p[1] && (p[1] === "LR" || p[1] === "TB")) {
      direction = p[1] as "LR" | "TB";
      continue;
    }

    if (p[0].toUpperCase() === "N") {
      if (p.length === 4) {
        const id = (p[1] ?? "").trim() || nid("fn");
        const label = (p[2] ?? "").trim() || "Step";
        const shape = parseShape(p[3] ?? "");
        if (!shape) {
          return {
            ok: false,
            error: `Line ${i + 1}: unknown shape "${p[3]}" (use round, rect, or diamond).`,
          };
        }
        nodeDraft.push({ id, label, shape });
      } else if (p.length === 3) {
        const label = (p[1] ?? "").trim() || "Step";
        const shape = parseShape(p[2] ?? "");
        if (!shape) {
          return {
            ok: false,
            error: `Line ${i + 1}: unknown shape "${p[2]}" (use round, rect, or diamond).`,
          };
        }
        nodeDraft.push({ id: nid("fn"), label, shape });
      } else {
        return {
          ok: false,
          error: `Line ${i + 1}: use "N\\tlabel\\tshape" or "N\\tid\\tlabel\\tshape".`,
        };
      }
      continue;
    }

    if (p[0].toUpperCase() === "E") {
      if (p.length < 3) {
        return {
          ok: false,
          error: `Line ${i + 1}: use "E\\tfromNodeId\\ttoNodeId\\toptionalEdgeLabel".`,
        };
      }
      edgeDraft.push({
        fromId: (p[1] ?? "").trim(),
        toId: (p[2] ?? "").trim(),
        label: (p[3] ?? "").trim(),
      });
      continue;
    }

    return {
      ok: false,
      error: `Line ${i + 1}: unknown row — use D (direction), N (node), or E (edge).`,
    };
  }

  if (!nodeDraft.length) {
    return { ok: false, error: "Add at least one node line starting with N." };
  }

  const nodes: FlowNode[] = nodeDraft.map((n) => ({ ...n }));
  const idSet = new Set(nodes.map((n) => n.id));
  if (idSet.size !== nodes.length) {
    return { ok: false, error: "Duplicate node ids — each N line id must be unique." };
  }

  const edges: FlowEdge[] = [];
  for (let k = 0; k < edgeDraft.length; k++) {
    const e = edgeDraft[k];
    if (!e.fromId || !e.toId) {
      return { ok: false, error: `Edge ${k + 1}: from and to ids cannot be empty.` };
    }
    if (!idSet.has(e.fromId)) {
      return { ok: false, error: `Edge ${k + 1}: no node with id "${e.fromId}".` };
    }
    if (!idSet.has(e.toId)) {
      return { ok: false, error: `Edge ${k + 1}: no node with id "${e.toId}".` };
    }
    edges.push({
      id: nid("fe"),
      fromId: e.fromId,
      toId: e.toId,
      label: e.label,
    });
  }

  return { ok: true, direction, nodes, edges };
}

/** Server/client: validate raw paste text for a chart kind (same rules as Apply paste). */
export function validatePasteForChart(
  kind: ChartPasteKind,
  text: string
): { ok: true } | { ok: false; error: string } {
  const t = text.trim();
  if (!t) return { ok: false, error: "Empty paste text." };
  switch (kind) {
    case "bar": {
      const r = parseBarPaste(t);
      return r.ok ? { ok: true } : r;
    }
    case "dot": {
      const r = parseDotPaste(t);
      return r.ok ? { ok: true } : r;
    }
    case "matrix": {
      const r = parseMatrixPaste(t);
      return r.ok ? { ok: true } : r;
    }
    case "flow": {
      const r = parseFlowPaste(t);
      return r.ok ? { ok: true } : r;
    }
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}
