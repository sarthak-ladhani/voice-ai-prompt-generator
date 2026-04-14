import { NextRequest, NextResponse } from "next/server";
import { GenerateRequestSchema, type PipelineResult } from "@/lib/schema";
import { runOneStep } from "@/lib/pipelines/oneStep";
import { runOneStepPG2 } from "@/lib/pipelines/oneStepPG2";
import { runTwoStep } from "@/lib/pipelines/twoStep";
import { runThreeStep } from "@/lib/pipelines/threeStep";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = GenerateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
  }

  const { inputs, pipeline, editedSOP, provider, apiKey } = parsed.data;

  try {
    if (pipeline === "all") {
      const [one, onePG2, two, three] = await Promise.all([
        runOneStep(inputs, provider, undefined, apiKey),
        runOneStepPG2(inputs, provider, apiKey),
        runTwoStep(inputs, provider, editedSOP, apiKey),
        runThreeStep(inputs, provider, editedSOP, apiKey),
      ]);
      return NextResponse.json({ results: [one, onePG2, two, three] });
    }

    let result: PipelineResult;
    if (pipeline === "1") result = await runOneStep(inputs, provider, undefined, apiKey);
    else if (pipeline === "1b") result = await runOneStepPG2(inputs, provider, apiKey);
    else if (pipeline === "2") result = await runTwoStep(inputs, provider, editedSOP, apiKey);
    else result = await runThreeStep(inputs, provider, editedSOP, apiKey);

    return NextResponse.json({ results: [result] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
