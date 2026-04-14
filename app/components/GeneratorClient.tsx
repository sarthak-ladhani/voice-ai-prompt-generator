"use client";

import { useState } from "react";
import type { PipelineResult, SOP } from "@/lib/schema";

interface Props {
  industries: string[];
  useCases: string[];
}

type Pipeline = "1" | "1b" | "2" | "3" | "all";

export default function GeneratorClient({ industries, useCases }: Props) {
  const [industry, setIndustry] = useState(industries[0]);
  const [industryOther, setIndustryOther] = useState("");
  const [useCase, setUseCase] = useState(useCases[0]);
  const [useCaseOther, setUseCaseOther] = useState("");
  const [mainGoal, setMainGoal] = useState("");
  const [agentName, setAgentName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [language, setLanguage] = useState("English");
  const [pipeline, setPipeline] = useState<Pipeline>("2");
  const [provider, setProvider] = useState<"anthropic" | "openai">("anthropic");
  const [advanced, setAdvanced] = useState(false);
  const [editedSOPText, setEditedSOPText] = useState("");

  const [apiKey, setApiKey] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PipelineResult[]>([]);

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      let editedSOP: SOP | undefined;
      if (advanced && editedSOPText.trim()) {
        try {
          editedSOP = JSON.parse(editedSOPText);
        } catch {
          throw new Error("Edited SOP is not valid JSON");
        }
      }
      const body = {
        inputs: {
          industry: industry === "Other" ? industryOther : industry,
          useCase: useCase === "Other" ? useCaseOther : useCase,
          mainGoal,
          agentName: agentName || undefined,
          companyName: companyName || undefined,
          language: language || undefined,
        },
        pipeline,
        provider,
        editedSOP,
        apiKey: apiKey || undefined,
      };
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setResults(data.results);
      // If we just got an SOP from a 2/3-step run, surface it for editing
      const firstWithSop = data.results.find((r: PipelineResult) => r.sop);
      if (firstWithSop?.sop) setEditedSOPText(JSON.stringify(firstWithSop.sop, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <header className="mb-6">
        <div className="flex items-baseline justify-between gap-6">
          <h1 className="text-2xl font-semibold whitespace-nowrap">Voice AI Prompt Generator</h1>
          <input
            type="password"
            className="w-56 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
            placeholder="API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Generate production-ready voice agent prompts. Compare 1-step, 2-step, and 3-step pipelines.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form onSubmit={onGenerate} className="space-y-4 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
        <Field label="Industry">
          <select className={inputCls} value={industry} onChange={(e) => setIndustry(e.target.value)}>
            {industries.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
          {industry === "Other" && (
            <input
              className={`${inputCls} mt-2`}
              placeholder="Specify industry"
              value={industryOther}
              onChange={(e) => setIndustryOther(e.target.value)}
              required
            />
          )}
        </Field>

        <Field label="Use Case">
          <select className={inputCls} value={useCase} onChange={(e) => setUseCase(e.target.value)}>
            {useCases.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
          {useCase === "Other" && (
            <input
              className={`${inputCls} mt-2`}
              placeholder="Specify use case"
              value={useCaseOther}
              onChange={(e) => setUseCaseOther(e.target.value)}
              required
            />
          )}
        </Field>

        <Field label="Main Goal">
          <textarea
            className={`${inputCls} min-h-[96px]`}
            placeholder="What do you want this voice agent to accomplish? Be specific."
            value={mainGoal}
            onChange={(e) => setMainGoal(e.target.value)}
            required
            minLength={5}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Agent Name (optional)">
            <input className={inputCls} value={agentName} onChange={(e) => setAgentName(e.target.value)} />
          </Field>
          <Field label="Company (optional)">
            <input className={inputCls} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </Field>
        </div>

        <Field label="Language">
          <input className={inputCls} value={language} onChange={(e) => setLanguage(e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Pipeline">
            <select className={inputCls} value={pipeline} onChange={(e) => setPipeline(e.target.value as Pipeline)}>
              <option value="1">1-step PG1</option>
              <option value="1b">1-step PG2</option>
              <option value="2">2-step (SOP → render)</option>
              <option value="3">3-step (+ critique)</option>
              <option value="all">Compare all</option>
            </select>
          </Field>
          <Field label="Provider">
            <select
              className={inputCls}
              value={provider}
              onChange={(e) => setProvider(e.target.value as "anthropic" | "openai")}
            >
              <option value="anthropic">Anthropic</option>
              <option value="openai">OpenAI</option>
            </select>
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={advanced} onChange={(e) => setAdvanced(e.target.checked)} />
          Advanced — edit SOP between steps
        </label>

        {advanced && (
          <Field label="Edited SOP (JSON) — leave blank to auto-generate">
            <textarea
              className={`${inputCls} min-h-[160px] font-mono text-xs`}
              value={editedSOPText}
              onChange={(e) => setEditedSOPText(e.target.value)}
              placeholder="Run once to populate, then edit and re-run."
            />
          </Field>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-black text-white py-2 text-sm font-medium disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {loading ? "Generating…" : "Generate"}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      <section className="space-y-4">
        {results.length === 0 && !loading && (
          <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center text-sm text-neutral-500">
            Fill the form and hit Generate. Output will appear here.
          </div>
        )}

        {loading && (
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-8 text-center text-sm">
            Generating… (large pipelines can take 30–90s)
          </div>
        )}

        <div className={results.length > 1 ? "grid gap-4 xl:grid-cols-3" : "grid gap-4"}>
          {results.map((r) => (
            <ResultCard key={r.pipeline} result={r} />
          ))}
        </div>
      </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20";

function ResultCard({ result }: { result: PipelineResult }) {
  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="font-semibold">
          {result.pipeline === "1b" ? "1-step PG2" : `${result.pipeline}-step${result.pipeline === "1" ? " PG1" : ""}`}
        </h3>
        <div className="text-xs text-neutral-500">
          {(result.meta.totalLatencyMs / 1000).toFixed(1)}s ·{" "}
          {result.meta.totalInputTokens} in · {result.meta.totalOutputTokens} out
        </div>
      </div>
      <details className="mb-2 text-xs text-neutral-500">
        <summary className="cursor-pointer">Steps</summary>
        <ul className="mt-1 space-y-0.5">
          {result.meta.steps.map((s, i) => (
            <li key={i}>
              <code>{s.name}</code> · {s.model} · {s.latencyMs}ms · in {s.inputTokens} / out {s.outputTokens}
            </li>
          ))}
        </ul>
      </details>
      <button
        onClick={() => navigator.clipboard.writeText(result.prompt)}
        className="mb-2 rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1 text-xs"
      >
        Copy prompt
      </button>
      <pre className="whitespace-pre-wrap rounded bg-neutral-100 dark:bg-neutral-900 p-3 text-xs leading-relaxed max-h-[600px] overflow-auto">
        {result.prompt}
      </pre>
    </div>
  );
}
