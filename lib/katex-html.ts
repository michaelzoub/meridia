import katex from "katex";

export function renderKatexToHtml(latex: string, displayMode: boolean): string {
  const trimmed = latex.trim();
  if (!trimmed) {
    return displayMode
      ? '<span class="text-zinc-400">Empty equation</span>'
      : '<span class="text-zinc-400">?</span>';
  }
  try {
    return katex.renderToString(trimmed, {
      throwOnError: false,
      displayMode,
      strict: "ignore",
    });
  } catch {
    return '<span class="text-red-600">Invalid LaTeX</span>';
  }
}
