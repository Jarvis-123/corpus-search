# CorpusSearch

[![CI](https://github.com/Jarvis-123/corpus-search/actions/workflows/ci.yml/badge.svg)](https://github.com/Jarvis-123/corpus-search/actions/workflows/ci.yml)
[![intent routing: query-intent-router](https://img.shields.io/npm/v/query-intent-router?label=query-intent-router)](https://www.npmjs.com/package/query-intent-router)

**Markdown corpus keyword search** with snippet UI — **no LLM**.

Fictional Acme Corp handbook (same shape as internal ops docs, zero employer IP).

## Features

- Load markdown files with YAML frontmatter from `corpus/sample/`
- Token scoring + title boost + intent-aware category boost
- Sentence-level snippet extraction
- Next.js demo UI

Intent classification comes from [`query-intent-router`](https://www.npmjs.com/package/query-intent-router) on npm ([source](https://github.com/Jarvis-123/intent-router)). Mapping each intent to corpus categories stays here, since those categories belong to this corpus.

**Live demo:** https://corpus-search.vercel.app · **Repository:** https://github.com/Jarvis-123/corpus-search

## Quick start

```bash
npm install
npm run dev
```

## API

`POST /api/search` with `{ "query": "remote work policy" }`

Returns `{ query, intent, hits: [{ doc, score, snippet }] }`.

A query that shares no terms with the corpus returns every document at `score 0`, so the UI shows the corpus to browse rather than presenting unrelated documents as matches. The intent boost only breaks ties between documents the query already matched.

## Test

```bash
npm test
```

## License

MIT
