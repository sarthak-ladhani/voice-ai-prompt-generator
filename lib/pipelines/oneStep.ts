import { chat, DEFAULT_MODELS, type Provider } from "@/lib/llm";
import { VOICE_GUIDE } from "@/lib/prompts/loader";
import type { Inputs, PipelineResult } from "@/lib/schema";

export async function runOneStep(inputs: Inputs, provider: Provider = "anthropic", _editedSOP?: unknown, apiKey?: string): Promise<PipelineResult> {
  const model = DEFAULT_MODELS[provider].oneStep;
  const system = `You are a senior voice AI prompt engineer. Read the voice prompting guide below, then produce a complete production-ready system prompt for a voice agent based on the user's inputs.

Output ONLY the final system prompt in plain Markdown. No code fences. No commentary.

<VOICE_GUIDE>
${VOICE_GUIDE()}
</VOICE_GUIDE>`;

  const user = renderInputsBlock(inputs);
  const res = await chat({ provider, model, system, user, maxTokens: 4096, temperature: 0.4, apiKey });

  return {
    pipeline: "1",
    prompt: stripFences(res.text),
    meta: {
      pipeline: "1",
      steps: [
        {
          name: "oneStep",
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

export function renderInputsBlock(inputs: Inputs): string {
  return `<INPUTS>
industry: ${inputs.industry}
useCase: ${inputs.useCase}
mainGoal: ${inputs.mainGoal}
agentName: ${inputs.agentName ?? "(infer a friendly first name)"}
companyName: ${inputs.companyName ?? "(infer or leave as the company name placeholder)"}
language: ${inputs.language ?? "English"}
</INPUTS>`;
}

export function stripFences(text: string): string {
  return text.replace(/^```(?:markdown|md)?\s*/i, "").replace(/```\s*$/i, "").trim();
}
