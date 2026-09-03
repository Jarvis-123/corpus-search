import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { type DocumentIntent, classifyIntent } from "query-intent-router";
import type { CorpusDoc, SearchHit } from "@/lib/types";

const CORPUS_DIR = join(process.cwd(), "corpus", "sample");

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  if (!raw.startsWith("---\n")) return { meta: {}, body: raw.trim() };
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) return { meta: {}, body: raw.trim() };
  const block = raw.slice(4, end);
  const body = raw.slice(end + 5).trim();
  const meta: Record<string, string> = {};
  for (const line of block.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { meta, body };
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function snippetFor(query: string, body: string, max = 220): string {
  const qTokens = tokenize(query);
  const sentences = body.split(/(?<=[.!?])\s+/);
  let best = sentences[0] ?? body.slice(0, max);
  let bestScore = 0;
  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    const score = qTokens.reduce((n, t) => (lower.includes(t) ? n + 1 : n), 0);
    if (score > bestScore) {
      bestScore = score;
      best = sentence;
    }
  }
  const trimmed = best.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
}

let cachedDocs: CorpusDoc[] | null = null;

export function loadCorpus(): CorpusDoc[] {
  if (cachedDocs) return cachedDocs;
  const files = readdirSync(CORPUS_DIR).filter((f) => f.endsWith(".md"));
  cachedDocs = files.map((file) => {
    const raw = readFileSync(join(CORPUS_DIR, file), "utf8");
    const { meta, body } = parseFrontmatter(raw);
    const id = meta.id ?? file.replace(/\.md$/, "");
    return {
      id,
      title: meta.title ?? id,
      category: meta.category ?? "general",
      body,
    };
  });
  return cachedDocs;
}

/** Corpus categories each intent favours — specific to this corpus, not the classifier. */
export const INTENT_CATEGORY_BOOST: Partial<Record<DocumentIntent, string[]>> = {
  procedure: ["procedure", "workflow"],
  template: ["template", "comms"],
  policy: ["policy", "compliance"],
  metric: ["reporting", "analytics"],
  contact: ["directory", "escalation"],
};

export function searchCorpus(query: string, limit = 8): SearchHit[] {
  const trimmed = query.trim();
  const intent = classifyIntent(trimmed);
  const docs = loadCorpus();
  const qTokens = tokenize(trimmed);
  const boostCategories = INTENT_CATEGORY_BOOST[intent] ?? [];

  const scored = docs
    .map((doc) => {
      const haystack = `${doc.title} ${doc.category} ${doc.body}`.toLowerCase();
      let score = 0;
      for (const token of qTokens) {
        if (haystack.includes(token)) score += 1;
        if (doc.title.toLowerCase().includes(token)) score += 2;
      }
      // Breaks ties between documents the query already matched; it must not
      // manufacture a match for a query that hit nothing.
      if (score > 0 && boostCategories.includes(doc.category)) score += 1;
      return { doc, score, snippet: snippetFor(trimmed, doc.body) };
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return docs.slice(0, limit).map((doc) => ({
      doc,
      score: 0,
      snippet: snippetFor(trimmed, doc.body),
    }));
  }
  return scored.slice(0, limit);
}
