export type CorpusDoc = {
  id: string;
  title: string;
  category: string;
  body: string;
};

export type SearchHit = {
  doc: CorpusDoc;
  score: number;
  snippet: string;
};

export type SearchResponse = {
  query: string;
  intent: string;
  hits: SearchHit[];
};
