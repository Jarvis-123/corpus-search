# CorpusSearch

**Markdown corpus keyword search** with snippet UI — **no LLM**.

Fictional Acme Corp handbook (same shape as internal ops docs, zero employer IP).

## Features

- Load markdown files with YAML frontmatter from `corpus/sample/`
- Token scoring + title boost + intent-aware category boost
- Sentence-level snippet extraction
- Next.js demo UI

Pair with [IntentRouter](https://github.com/Jarvis-123/intent-router) for shared intent rules; this repo inlines a minimal classifier for the demo.

**Live demo:** https://corpus-search.vercel.app · **Repository:** https://github.com/Jarvis-123/corpus-search

## Quick start

```bash
npm install
npm run dev
```

## API

`POST /api/search` with `{ "query": "remote work policy" }`

Returns `{ query, intent, hits: [{ doc, score, snippet }] }`.

## License

MIT
