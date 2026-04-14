/**
 * CLI: run all fixtures through all three pipelines and print a comparison table.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=... npx tsx scripts/runFixtures.ts
 *   ANTHROPIC_API_KEY=... npx tsx scripts/runFixtures.ts --fixture 0 --pipeline 2
 *   OPENAI_API_KEY=... npx tsx scripts/runFixtures.ts --provider openai
 *
 * Outputs are written to ./out/<fixture>-<pipeline>.md
 */
import fs from "node:fs";
import path from "node:path";
import { FIXTURES } from "../lib/fixtures";
import { runOneStep } from "../lib/pipelines/oneStep";
import { runTwoStep } from "../lib/pipelines/twoStep";
import { runThreeStep } from "../lib/pipelines/threeStep";

type Provider = "anthropic" | "openai";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const provider = (arg("provider") ?? "anthropic") as Provider;
  const onlyFixture = arg("fixture");
  const onlyPipeline = arg("pipeline");

  const outDir = path.join(process.cwd(), "out");
  fs.mkdirSync(outDir, { recursive: true });

  const fixtures = onlyFixture ? [FIXTURES[Number(onlyFixture)]] : FIXTURES;
  const pipelines = onlyPipeline ? [onlyPipeline] : ["1", "2", "3"];

  for (const f of fixtures) {
    console.log(`\n=== ${f.name} ===`);
    for (const p of pipelines) {
      const start = Date.now();
      try {
        const result =
          p === "1"
            ? await runOneStep(f.inputs, provider)
            : p === "2"
              ? await runTwoStep(f.inputs, provider)
              : await runThreeStep(f.inputs, provider);
        const file = path.join(
          outDir,
          `${f.name.replace(/\W+/g, "-").toLowerCase()}-pipeline${p}.md`,
        );
        fs.writeFileSync(file, result.prompt);
        console.log(
          `  pipeline ${p}: ${(Date.now() - start) / 1000}s · ${
            result.meta.totalInputTokens + result.meta.totalOutputTokens
          } tok → ${path.relative(process.cwd(), file)}`,
        );
      } catch (e) {
        console.error(`  pipeline ${p}: ERROR`, (e as Error).message);
      }
    }
  }
}

main();
