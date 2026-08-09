import { NextResponse } from "next/server";
import { performWebSearch } from "@/lib/actions/web-search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  const searches = [
    `${query} MUN conference 2025 2026 registration`,
    `${query} Model United Nations conference details venue fees`,
    `site:munplanet.com OR site:bestdelegate.com ${query}`,
  ];

  const results: Array<{
    title: string;
    url: string;
    snippet: string;
    source: string;
  }> = [];

  for (const search of searches) {
    const result = await performWebSearch(search, 5);
    if (result.status === "success") {
      for (const r of result.data) {
        if (!results.find((existing) => existing.url === r.link)) {
          results.push({
            title: r.title,
            url: r.link,
            snippet: r.snippet,
            source: "web",
          });
        }
      }
    }
  }

  return NextResponse.json({ results });
}
