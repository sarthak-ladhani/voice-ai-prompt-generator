import Anthropic from "@anthropic-ai/sdk";
import type { ChatRequest } from "./index";

let envClient: Anthropic | null = null;

function getClient(apiKey?: string): Anthropic {
  if (apiKey) return new Anthropic({ apiKey });
  if (!envClient) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
    envClient = new Anthropic({ apiKey: key });
  }
  return envClient;
}

export async function chatAnthropic(req: ChatRequest) {
  const c = getClient(req.apiKey);
  const userContent = req.json
    ? `${req.user}\n\nReturn ONLY a single valid JSON object. No prose, no markdown fences.`
    : req.user;

  const res = await c.messages.create({
    model: req.model,
    max_tokens: req.maxTokens ?? 4096,
    temperature: req.temperature ?? 0.4,
    system: req.system,
    messages: [{ role: "user", content: userContent }],
  });

  const text = res.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();

  return {
    text,
    inputTokens: res.usage.input_tokens,
    outputTokens: res.usage.output_tokens,
  };
}
