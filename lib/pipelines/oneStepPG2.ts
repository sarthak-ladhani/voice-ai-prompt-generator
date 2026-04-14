import { chat, DEFAULT_MODELS, type Provider } from "@/lib/llm";
import { VOICE_GUIDE_PG2 } from "@/lib/prompts/loader";
import type { Inputs, PipelineResult } from "@/lib/schema";
import { renderInputsBlock, stripFences } from "./oneStep";

export async function runOneStepPG2(inputs: Inputs, provider: Provider = "anthropic", apiKey?: string): Promise<PipelineResult> {
  const model = DEFAULT_MODELS[provider].oneStepPG2;
  const system = `You are a senior voice AI prompt engineer. Read the voice prompting guide below, then produce a complete production-ready system prompt for a voice agent based on the user's inputs.

Output ONLY the final system prompt in plain Markdown. No code fences. No commentary.

<VOICE_GUIDE>
${VOICE_GUIDE_PG2()}
</VOICE_GUIDE>`;

  const user = renderInputsBlock(inputs);
  const res = await chat({ provider, model, system, user, maxTokens: 4096, temperature: 0.4, apiKey });

  return {
    pipeline: "1b",
    prompt: stripFences(res.text),
    meta: {
      pipeline: "1b",
      steps: [
        {
          name: "oneStepPG2",
          model: res.model,
          provider: res.provider,
          inputTokens: res.inputTokens,
          outputTokens: res.outputTokens,
          latencyMs: res.latencyMs,
        },
      ],
      totalLatencyMs: res.latencyMs,
      totalInputTokens: res.inputTokens,
      totalOutputTokens: res.outputTokens,
    },
  };
}
