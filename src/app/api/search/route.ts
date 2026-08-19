import { NextResponse } from "next/server";
import { classifySearchIntent } from "@/lib/intent";
import { searchCorpus } from "@/lib/search";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { query?: string };
    const query = body.query?.trim();
    if (!query) {
      return NextResponse.json({ error: "Query is required." }, { status: 400 });
    }

    const intent = classifySearchIntent(query);
    const hits = searchCorpus(query);

    return NextResponse.json({ query, intent, hits });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
