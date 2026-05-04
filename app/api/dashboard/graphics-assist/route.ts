import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { buildAssistSystemPrompt } from "@/lib/graphics-assist-prompts";
import {
  validatePasteForChart,
  type ChartPasteKind,
} from "@/lib/graphics-paste-parsers";

const MAX_MESSAGE_CHARS = 6000;
const MODEL = process.env.OPENAI_GRAPHICS_MODEL ?? "gpt-4o-mini";

function extractTsvFromModelJson(raw: string): string | null {
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

  let body: { chartKind?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const chartKind = body.chartKind as ChartPasteKind | undefined;
  const message = typeof body.message === "string" ? body.message : "";
  const kinds: ChartPasteKind[] = ["bar", "dot", "matrix", "flow"];
  if (!chartKind || !kinds.includes(chartKind)) {
    return NextResponse.json({ error: "Invalid chartKind" }, { status: 400 });
  }
  if (!message.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json(
      { error: `Message too long (max ${MAX_MESSAGE_CHARS})` },
      { status: 400 }
    );
  }

  const userContent = `Chart kind: ${chartKind}\n\nUser request:\n${message.trim()}`;

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      max_completion_tokens: 1024,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildAssistSystemPrompt(chartKind) },
        { role: "user", content: userContent },
      ],
    }),
  });

  if (!openaiRes.ok) {
    const errText = await openaiRes.text();
    console.warn("[graphics-assist] OpenAI error", openaiRes.status);
    return NextResponse.json(
      { error: "Assistant request failed", detail: errText.slice(0, 240) },
      { status: 502 }
    );
  }

  const completion = (await openaiRes.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const rawContent = completion.choices?.[0]?.message?.content ?? "";
  const tsvExtracted = extractTsvFromModelJson(rawContent);
  if (tsvExtracted === null) {
    console.warn("[graphics-assist] bad JSON shape");
    return NextResponse.json(
      { error: "Model did not return valid JSON with a tsv string." },
      { status: 422 }
    );
  }

  const validated = validatePasteForChart(chartKind, tsvExtracted);
  if (!validated.ok) {
    console.warn("[graphics-assist] parse failed", chartKind);
    return NextResponse.json(
      { error: "Generated data failed validation", detail: validated.error },
      { status: 422 }
    );
  }

  console.info("[graphics-assist] ok", chartKind);
  return NextResponse.json({ ok: true, tsv: tsvExtracted });
}
