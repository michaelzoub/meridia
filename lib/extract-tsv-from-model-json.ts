/** Parse assistant JSON output `{ "tsv": "..." }` (optional markdown fence). */
export function extractTsvFromModelJson(raw: string): string | null {
  let s = raw.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/;
  const m = s.match(fence);
  if (m) s = m[1].trim();
  try {
    const j = JSON.parse(s) as unknown;
    if (typeof j !== "object" || j === null || !("tsv" in j)) return null;
    const tsv = (j as { tsv: unknown }).tsv;
    return typeof tsv === "string" ? tsv : null;
  } catch {
    return null;
  }
}
