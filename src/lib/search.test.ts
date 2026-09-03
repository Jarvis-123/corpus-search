import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DOCUMENT_INTENTS, classifyIntent } from "query-intent-router";
import { INTENT_CATEGORY_BOOST, loadCorpus, searchCorpus } from "./search.js";

describe("corpus loading", () => {
  it("parses frontmatter into complete documents", () => {
    const docs = loadCorpus();
    assert.ok(docs.length > 0, "corpus should not be empty");

    for (const doc of docs) {
      assert.ok(doc.id.length > 0, "missing id");
      assert.ok(doc.title.length > 0, `${doc.id} has no title`);
      assert.ok(doc.category.length > 0, `${doc.id} has no category`);
      assert.ok(doc.body.length > 0, `${doc.id} has no body`);
      assert.ok(!doc.body.startsWith("---"), `${doc.id} kept its frontmatter in the body`);
      assert.ok(!doc.title.startsWith("title:"), `${doc.id} title was not unwrapped`);
    }
  });

  it("gives every document a unique id", () => {
    const ids = loadCorpus().map((d) => d.id);
    assert.equal(new Set(ids).size, ids.length, "duplicate document ids");
  });
});

describe("intent boost table", () => {
  it("covers every intent the classifier can return", () => {
    for (const intent of DOCUMENT_INTENTS) {
      assert.ok(INTENT_CATEGORY_BOOST[intent], `no boost categories for ${intent}`);
    }
  });

  it("keeps at least one real category behind every intent", () => {
    // A renamed category would silently disable the boost for that intent.
    const categories = new Set(loadCorpus().map((d) => d.category));
    for (const intent of DOCUMENT_INTENTS) {
      const matched = (INTENT_CATEGORY_BOOST[intent] ?? []).filter((c) => categories.has(c));
      assert.ok(matched.length > 0, `no document matches the ${intent} boost`);
    }
  });
});

describe("ranking", () => {
  it("weighs a title match above a body-only match", () => {
    // "reimbursement" sits in one title, and classifies as procedure, so the
    // policy category earns no boost here.
    assert.equal(classifyIntent("reimbursement"), "procedure");
    const hits = searchCorpus("reimbursement", 8);
    assert.equal(hits[0].doc.id, "expense-policy");
    assert.equal(hits[0].score, 3, "one point for the body plus two for the title");
  });

  it("returns hits in descending score order", () => {
    for (const query of ["policy approval reporting", "onboarding email owner", "remote work"]) {
      const scores = searchCorpus(query, 8).map((h) => h.score);
      for (let i = 1; i < scores.length; i += 1) {
        assert.ok(scores[i] <= scores[i - 1], `"${query}" returned ${scores.join(",")} out of order`);
      }
    }
  });

  it("surfaces the right document for each example query", () => {
    const expected: Array<[string, string]> = [
      ["What is the remote work policy?", "remote-work-policy"],
      ["How do I get an offer approved?", "offer-approval"],
      ["How many open reqs do we have?", "headcount-reporting"],
    ];
    for (const [query, id] of expected) {
      assert.equal(searchCorpus(query, 3)[0].doc.id, id, `"${query}" ranked the wrong document first`);
    }
  });

  it("lifts the directory document for an ownership question", () => {
    // Contact intent boosts the directory category.
    assert.equal(classifyIntent("Who owns expense policy exceptions?"), "contact");
    const ids = searchCorpus("Who owns expense policy exceptions?", 3).map((h) => h.doc.id);
    assert.ok(ids.includes("people-directory"), `directory missing from ${ids.join(", ")}`);
  });

  it("honours the result limit", () => {
    assert.equal(searchCorpus("policy", 1).length, 1);
    assert.ok(searchCorpus("policy", 100).length <= loadCorpus().length);
  });
});

describe("queries that match nothing", () => {
  it("scores every document zero rather than inventing a match", () => {
    // The intent boost alone must not make a document look relevant, or the
    // UI shows "score 1" for a query that hit no terms at all.
    for (const hit of searchCorpus("zzzz qqqq vvvv", 8)) {
      assert.equal(hit.score, 0, `${hit.doc.id} scored ${hit.score} for a nonsense query`);
    }
  });

  it("falls back to the corpus list so there is something to browse", () => {
    const hits = searchCorpus("zzzz qqqq vvvv", 8);
    assert.equal(hits.length, loadCorpus().length);
  });

  it("treats an empty query as matching nothing", () => {
    for (const hit of searchCorpus("", 8)) assert.equal(hit.score, 0);
  });
});

describe("snippets", () => {
  it("draws from the sentence containing the query terms", () => {
    const hits = searchCorpus("onboarding", 8);
    assert.match(hits[0].snippet, /onboarding/i);
  });

  it("never exceeds the snippet cap", () => {
    for (const query of ["policy approval onboarding reporting", "remote work", "escalation owner"]) {
      for (const hit of searchCorpus(query, 8)) {
        assert.ok(hit.snippet.length <= 220, `snippet of ${hit.snippet.length} chars`);
      }
    }
  });

  it("still returns a snippet when nothing matches", () => {
    for (const hit of searchCorpus("zzzz qqqq", 8)) {
      assert.ok(hit.snippet.length > 0, `${hit.doc.id} produced an empty snippet`);
    }
  });
});
