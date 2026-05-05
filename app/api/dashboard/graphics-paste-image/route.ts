import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { buildImageExtractSystemPrompt } from "@/lib/graphics-assist-prompts";
import { extractTsvFromModelJson } from "@/lib/extract-tsv-from-model-json";
import {
  validatePasteForChart,
  type ChartPasteKind,
} from "@/lib/graphics-paste-parsers";

/** Same default as text assist; must support vision (e.g. gpt-4o-mini). */
const MODEL = process.env.OPENAI_GRAPHICS_MODEL ?? "gpt-4o-mini";
/** ~10 MiB raw base64 payload guard */
const MAX_BASE64_CHARS = 14_000_000;

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("dashboard_token")?.value;
  if (token !== process.env.DASHBOARD_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key?.trim()) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured on the server." },
      { status: 503 }
    );
  }

  let body: {
    chartKind?: string;
    imageBase64?: string;
    mimeType?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const chartKind = body.chartKind as ChartPasteKind | undefined;
  const kinds: ChartPasteKind[] = ["bar", "dot", "matrix", "flow"];
  if (!chartKind || !kinds.includes(chartKind)) {
    return NextResponse.json({ error: "Invalid chartKind" }, { status: 400 });
  }

  const imageBase64 =
    typeof body.imageBase64 === "string" ? body.imageBase64.trim() : "";
  if (!imageBase64.length) {
    return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });
  }
  if (imageBase64.length > MAX_BASE64_CHARS) {
    return NextResponse.json(
      { error: "Image too large — try a smaller screenshot." },
      { status: 400 }
    );
  }

  const mimeRaw = typeof body.mimeType === "string" ? body.mimeType.trim() : "";
  const mimeType =
    mimeRaw && /^image\/(png|jpe?g|gif|webp)$/i.test(mimeRaw)
      ? mimeRaw.toLowerCase().replace("image/jpg", "image/jpeg")
      : "image/png";

  const dataUrl = `data:${mimeType};base64,${imageBase64}`;

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.1,
      max_completion_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildImageExtractSystemPrompt(chartKind) },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Chart kind: ${chartKind}\nExtract paste-ready TSV from this image.`,
            },
            {
              type: "image_url",
              image_url: { url: dataUrl },
            },
          ],
        },
      ],
    }),
  });

  if (!openaiRes.ok) {
    const errText = await openaiRes.text();
    console.warn("[graphics-paste-image] OpenAI error", openaiRes.status);
    return NextResponse.json(
      { error: "Image extract request failed", detail: errText.slice(0, 240) },
      { status: 502 }
    );
  }

  const completion = (await openaiRes.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const rawContent = completion.choices?.[0]?.message?.content ?? "";
  const tsvExtracted = extractTsvFromModelJson(rawContent);
  if (tsvExtracted === null) {
    console.warn("[graphics-paste-image] bad JSON shape");
    return NextResponse.json(
      { error: "Model did not return valid JSON with a tsv string." },
      { status: 422 }
    );
  }

  const validated = validatePasteForChart(chartKind, tsvExtracted);
  if (!validated.ok) {
    console.warn("[graphics-paste-image] parse failed", chartKind);
    return NextResponse.json(
      { error: "Extracted data failed validation", detail: validated.error },
      { status: 422 }
    );
  }

  console.info("[graphics-paste-image] ok", chartKind);
  return NextResponse.json({ ok: true, tsv: tsvExtracted });
}
