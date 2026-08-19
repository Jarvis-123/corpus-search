/** Lightweight intent tag for search ranking (no LLM). */
export const SEARCH_INTENTS = ["procedure", "template", "policy", "metric", "contact"] as const;
export type SearchIntent = (typeof SEARCH_INTENTS)[number];

export function classifySearchIntent(query: string): SearchIntent {
  const q = query.trim();
  if (!q) return "procedure";
  if (/\b(who owns|poc|contact|owner|escalat)\b/i.test(q)) return "contact";
  if (/\b(policy|compliance|allowed|rule)\b/i.test(q)) return "policy";
  if (/\b(draft|template|email|wording)\b/i.test(q)) return "template";
  if (/\b(how many|count|metric|report)\b/i.test(q)) return "metric";
  if (/\b(how (do|to)|step|process|procedure)\b/i.test(q)) return "procedure";
  return "procedure";
}

export const INTENT_CATEGORY_BOOST: Partial<Record<SearchIntent, string[]>> = {
  procedure: ["procedure", "workflow"],
  template: ["template", "comms"],
  policy: ["policy", "compliance"],
  metric: ["reporting", "analytics"],
  contact: ["directory", "escalation"],
};
