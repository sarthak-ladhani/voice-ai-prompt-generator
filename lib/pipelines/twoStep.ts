import { chat, DEFAULT_MODELS, type Provider } from "@/lib/llm";
import { VOICE_GUIDE, SOP_SYSTEM, RENDER_SYSTEM } from "@/lib/prompts/loader";
import { SOPSchema, type Inputs, type PipelineResult, type SOP } from "@/lib/schema";
import { renderInputsBlock, stripFences } from "./oneStep";

export async function generateSOP(inputs: Inputs, provider: Provider = "anthropic", apiKey?: string): Promise<{
  sop: SOP;
  rawText: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  model: string;
  provider: string;
}> {
  const model = DEFAULT_MODELS[provider].sop;
  const res = await chat({
    provider,
    model,
    system: SOP_SYSTEM(),
    user: renderInputsBlock(inputs),
    json: true,
    maxTokens: 4096,
    temperature: 0.3,
    apiKey,
  });
  const json = extractJson(res.text);
  const sop = SOPSchema.parse(json);
  return { sop, rawText: res.text, ...res };
}

export async function renderPromptFromSOP(
  sop: SOP,
  provider: Provider = "anthropic",
  apiKey?: string,
): Promise<{
  prompt: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  model: string;
  provider: string;
}> {
  const model = DEFAULT_MODELS[provider].render;
  const user = `<SOP>
${JSON.stringify(sop, null, 2)}
</SOP>

<VOICE_GUIDE>
${VOICE_GUIDE()}
</VOICE_GUIDE>`;
  const res = await chat({
    provider,
    model,
    system: RENDER_SYSTEM(),
    user,
    maxTokens: 4096,
    temperature: 0.4,
    apiKey,
  });
  return { prompt: stripFences(res.text), ...res };
}

export async function runTwoStep(
  inputs: Inputs,
  provider: Provider = "anthropic",
  editedSOP?: SOP,
  apiKey?: string,
): Promise<PipelineResult> {
  const sopRes = editedSOP
    ? null
    : await generateSOP(inputs, provider, apiKey);
  const sop = editedSOP ?? sopRes!.sop;
  const renderRes = await renderPromptFromSOP(sop, provider, apiKey);

  const steps = [];
  if (sopRes) {
    steps.push({
      name: "sop",
      model: sopRes.model,
      provider: sopRes.provider,
      inputTokens: sopRes.inputTokens,
      outputTokens: sopRes.outputTokens,
      latencyMs: sopRes.latencyMs,
    });
  }
  steps.push({
    name: "render",
    model: renderRes.model,
    provider: renderRes.provider,
    inputTokens: renderRes.inputTokens,
    outputTokens: renderRes.outputTokens,
    latencyMs: renderRes.latencyMs,
  });

  return {
    pipeline: "2",
    prompt: renderRes.prompt,
    sop,
    meta: {
      pipeline: "2",
      steps,
      totalLatencyMs: steps.reduce((a, s) => a + s.latencyMs, 0),
      totalInputTokens: steps.reduce((a, s) => a + s.inputTokens, 0),
      totalOutputTokens: steps.reduce((a, s) => a + s.outputTokens, 0),
    },
  };
}

function extractJson(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // Try to find first {...} block.
    const m = trimmed.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("LLM did not return parseable JSON");
    return JSON.parse(m[0]);
  }
}
