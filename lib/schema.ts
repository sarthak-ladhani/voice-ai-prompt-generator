import { z } from "zod";

export const InputsSchema = z.object({
  industry: z.string().min(1, "Industry is required"),
  useCase: z.string().min(1, "Use case is required"),
  mainGoal: z.string().min(5, "Describe the main goal in a sentence or two"),
  /** Optional extras the form may collect later. */
  agentName: z.string().optional(),
  companyName: z.string().optional(),
  language: z.string().optional(),
});
export type Inputs = z.infer<typeof InputsSchema>;

export const SOPSchema = z.object({
  agent: z.object({
    name: z.string(),
    role: z.string(),
    company: z.string(),
    persona: z.array(z.string()).min(2),
    tone: z.array(z.string()).min(2),
  }),
  objective: z.string(),
  successCriteria: z.array(z.string()).min(1),
  openingLine: z.string(),
  conversationPhases: z
    .array(
      z.object({
        name: z.string(),
        objective: z.string(),
        examplePhrasings: z.array(z.string()).min(1),
      }),
    )
    .min(2),
  informationToCollect: z
    .array(
      z.object({
        field: z.string(),
        why: z.string(),
        howToAsk: z.string(),
        readBack: z.boolean().default(false),
      }),
    )
    .default([]),
  businessRules: z.array(z.string()).default([]),
  knowledgeBoundaries: z.object({
    knows: z.array(z.string()).default([]),
    doesNotDo: z.array(z.string()).default([]),
  }),
  tools: z
    .array(
      z.object({
        name: z.string(),
        whenToCall: z.string(),
        args: z.string().optional(),
      }),
    )
    .default([]),
  escalation: z.object({
    triggers: z.array(z.string()).min(1),
    handoffLine: z.string(),
  }),
  edgeCases: z.array(z.object({ situation: z.string(), handling: z.string() })).default([]),
  compliance: z.array(z.string()).default([]),
  closingLine: z.string(),
  language: z.string().default("English"),
});
export type SOP = z.infer<typeof SOPSchema>;

export const PipelineSchema = z.enum(["1", "1b", "2", "3", "all"]);
export type Pipeline = z.infer<typeof PipelineSchema>;

export const GenerateRequestSchema = z.object({
  inputs: InputsSchema,
  pipeline: PipelineSchema.default("2"),
  /** When provided (advanced toggle), use this SOP instead of generating one. */
  editedSOP: SOPSchema.optional(),
  /** Optional per-step model overrides. */
  provider: z.enum(["anthropic", "openai"]).default("anthropic"),
  /** API key from UI. Falls back to server env var if not provided. */
  apiKey: z.string().optional(),
});
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

export interface PipelineMeta {
  pipeline: "1" | "1b" | "2" | "3";
  steps: Array<{
    name: string;
    model: string;
    provider: string;
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
  }>;
  totalLatencyMs: number;
  totalInputTokens: number;
  totalOutputTokens: number;
}

export interface PipelineResult {
  pipeline: "1" | "1b" | "2" | "3";
  prompt: string;
  sop?: SOP;
  meta: PipelineMeta;
}
