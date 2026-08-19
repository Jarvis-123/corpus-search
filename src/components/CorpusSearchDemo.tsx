"use client";

import { useState } from "react";
import type { SearchResponse } from "@/lib/types";

const EXAMPLES = [
  "offer approval workflow",
  "remote work policy",
  "who owns expense exceptions",
  "onboarding checklist",
];

export function CorpusSearchDemo() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function search(next?: string) {
    const value = (next ?? query).trim();
    if (!value) return;
    setLoading(true);
    setError(null);
    setQuery(value);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: value }),
      });
      const data = (await res.json()) as SearchResponse & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-10 md:py-14">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          No LLM · MIT
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">CorpusSearch</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Keyword search + snippet extraction over a fictional Acme Corp markdown corpus.
          Intent tag only affects ranking — no model calls.
        </p>
      </header>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <label htmlFor="q" className="text-sm font-medium text-[var(--muted)]">Search</label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="e.g. expense policy"
            className="flex-1 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          <button
            type="button"
            onClick={() => search()}
            disabled={loading}
            className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => search(ex)}
              className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)] hover:border-[var(--accent)]"
            >
              {ex}
            </button>
          ))}
        </div>
      </section>

      {error ? (
        <p className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {result ? (
        <section className="space-y-4">
          <p className="text-sm text-[var(--muted)]">
            Intent tag: <span className="font-semibold text-[var(--fg)]">{result.intent}</span>
            · {result.hits.length} hits
          </p>
          <ul className="space-y-3">
            {result.hits.map((hit) => (
              <li
                key={hit.doc.id}
                className="rounded-xl border border-[var(--border)] bg-white p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{hit.doc.title}</p>
                  <span className="rounded-full bg-[var(--bg)] px-2 py-0.5 text-xs text-[var(--muted)]">
                    {hit.doc.category}
                  </span>
                  <span className="text-xs text-[var(--muted)]">score {hit.score}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{hit.snippet}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
