import OpenAI from "openai";
import type { ChatRequest } from "./index";

let envClient: OpenAI | null = null;

function getClient(apiKey?: string): OpenAI {
  if (apiKey) return new OpenAI({ apiKey });
  if (!envClient) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY is not set");
    envClient = new OpenAI({ apiKey: key });
  }
  return envClient;
}

export async function chatOpenAI(req: ChatRequest) {
  const c = getClient(req.apiKey);
  const res = await c.chat.completions.create({
    model: req.model,
    temperature: req.temperature ?? 0.4,
    max_completion_tokens: req.maxTokens ?? 4096,
    response_format: req.json ? { type: "json_object" } : undefined,
    messages: [
      { role: "system", content: req.system },
      { role: "user", content: req.user },
    ],
  });

  const text = (res.choices[0]?.message?.content ?? "").trim();
  return {
    text,
    inputTokens: res.usage?.prompt_tokens ?? 0,
    outputTokens: res.usage?.completion_tokens ?? 0,
  };
}
