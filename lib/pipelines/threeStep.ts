import { chat, DEFAULT_MODELS, type Provider } from "@/lib/llm";
import { CRITIQUE_SYSTEM } from "@/lib/prompts/loader";
import type { Inputs, PipelineResult, SOP } from "@/lib/schema";
import { runTwoStep } from "./twoStep";
import { stripFences } from "./oneStep";

export async function runThreeStep(
  inputs: Inputs,
  provider: Provider = "anthropic",
  editedSOP?: SOP,
  apiKey?: string,
): Promise<PipelineResult> {
  const two = await runTwoStep(inputs, provider, editedSOP, apiKey);

  const model = DEFAULT_MODELS[provider].critique;
  const res = await chat({
    provider,
    model,
    system: CRITIQUE_SYSTEM(),
    user: `<DRAFT_PROMPT>\n${two.prompt}\n</DRAFT_PROMPT>`,
    maxTokens: 4096,
    temperature: 0.3,
    apiKey,
  });

  const refined = stripFences(res.text);
  const steps = [
    ...two.meta.steps,
    {
      name: "critique",
      model: res.model,
      provider: res.provider,
      inputTokens: res.inputTokens,
      outputTokens: res.outputTokens,
      latencyMs: res.latencyMs,
    },
  ];

  return {
    pipeline: "3",
    prompt: refined,
    sop: two.sop,
    meta: {
      pipeline: "3",
      steps,
      totalLatencyMs: steps.reduce((a, s) => a + s.latencyMs, 0),
      totalInputTokens: steps.reduce((a, s) => a + s.inputTokens, 0),
      totalOutputTokens: steps.reduce((a, s) => a + s.outputTokens, 0),
    },
  };
}
