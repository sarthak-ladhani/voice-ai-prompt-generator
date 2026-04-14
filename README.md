# Voice AI Prompt Generator

Generate production-ready system prompts for Voice AI agents (Vapi, Retell, Bland, ElevenLabs, LiveKit, Twilio, etc.) from minimal inputs. Compares **1-step**, **2-step (SOP → render)**, and **3-step (+ critique)** pipelines side-by-side so you can decide on effort-vs-impact for production.

## Setup

```bash
# Node 20+ required
npm install
cp .env.example .env.local   # then fill in keys
npm run dev                  # http://localhost:3000
```

Environment variables:

- `ANTHROPIC_API_KEY` — required for Anthropic provider
- `OPENAI_API_KEY` — required for OpenAI provider

## Usage

### Web UI

Open `http://localhost:3000`. Pick industry, use case, write a main goal, choose a pipeline, hit Generate. Toggle **Advanced** to edit the intermediate SOP between steps. Use **Compare all** to run 1/2/3-step on the same input.

### Backend API

`POST /api/generate`

```json
{
  "inputs": {
    "industry": "Healthcare",
    "useCase": "Appointment reminder / confirmation",
    "mainGoal": "Confirm or reschedule dental appointments...",
    "agentName": "Maya",
    "companyName": "BrightSmile Dental",
    "language": "English"
  },
  "pipeline": "2",
  "provider": "anthropic"
}
```

Response: `{ results: [{ pipeline, prompt, sop?, meta }] }`. `meta` contains per-step latency and token counts so you can do effort-impact analysis.

`pipeline` can be `"1"`, `"2"`, `"3"`, or `"all"`. With `"2"` or `"3"` you may also pass `editedSOP` to skip Step 1.

### Fixture sweep (CLI)

```bash
npx tsx scripts/runFixtures.ts                       # all fixtures × all pipelines, Anthropic
npx tsx scripts/runFixtures.ts --provider openai     # OpenAI
npx tsx scripts/runFixtures.ts --fixture 0           # one fixture × all pipelines
```

Outputs to `./out/`.

## Architecture

```
app/
  page.tsx                       # UI shell
  components/GeneratorClient.tsx # form + results
  api/generate/route.ts          # POST endpoint (also the public API)

lib/
  llm/                           # provider-agnostic chat() + Anthropic/OpenAI adapters
  prompts/                       # voice_prompting_guide.md + step system prompts (THE core assets)
  pipelines/                     # oneStep, twoStep, threeStep — pure functions
  taxonomy/                      # industry + use-case dropdowns
  schema.ts                      # Zod schemas for Inputs, SOP, request/result
  fixtures.ts                    # representative inputs for A/B testing
```

The prompt-engineering knowledge lives in **`lib/prompts/voice_prompting_guide.md`** — iterate there to improve quality across all pipelines simultaneously.
