import { chatAnthropic } from "./anthropic";
import { chatOpenAI } from "./openai";

export type Provider = "anthropic" | "openai";

export interface ChatRequest {
  provider: Provider;
  model: string;
  system: string;
  user: string;
  /** Force JSON object output when supported. */
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
  /** Per-request API key from UI. Falls back to env var if not set. */
  apiKey?: string;
}

export interface ChatResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
  /** ms */
  latencyMs: number;
  provider: Provider;
  model: string;
}

export async function chat(req: ChatRequest): Promise<ChatResponse> {
  const start = Date.now();
  const res =
    req.provider === "anthropic" ? await chatAnthropic(req) : await chatOpenAI(req);
  return { ...res, latencyMs: Date.now() - start, provider: req.provider, model: req.model };
}

/** Default model per role. Override by passing explicit models from caller. */
export const DEFAULT_MODELS = {
  anthropic: {
    sop: "claude-sonnet-4-6",
    render: "claude-opus-4-6",
    critique: "claude-sonnet-4-6",
    oneStep: "claude-opus-4-6",
    oneStepPG2: "claude-opus-4-6",
  },
  openai: {
    sop: "gpt-5.4",
    render: "gpt-5.4",
    critique: "gpt-5.4",
    oneStep: "gpt-5.4",
    oneStepPG2: "gpt-5.4",
  },
} as const;
