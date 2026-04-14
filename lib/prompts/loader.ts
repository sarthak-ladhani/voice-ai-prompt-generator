import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "lib", "prompts");
const cache = new Map<string, string>();

function load(name: string): string {
  if (cache.has(name)) return cache.get(name)!;
  const text = fs.readFileSync(path.join(dir, name), "utf8");
  cache.set(name, text);
  return text;
}

export const VOICE_GUIDE = () => load("voice_prompting_guide_pg1.md");
export const VOICE_GUIDE_PG2 = () => load("voice_prompting_guide_pg2.md");
export const SOP_SYSTEM = () => load("sop_system_prompt.md");
export const RENDER_SYSTEM = () => load("render_system_prompt.md");
export const CRITIQUE_SYSTEM = () => load("critique_rubric.md");
