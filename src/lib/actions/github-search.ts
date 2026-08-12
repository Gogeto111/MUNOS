"use server";

export async function searchMUNRepos(query: string, limit = 5) {
  try {
    const res = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query + " model united nations")}&sort=stars&order=desc&per_page=${limit}`,
      { headers: { Accept: "application/vnd.github.v3+json" }, signal: AbortSignal.timeout(10_000) },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (
      data.items?.map((repo: {
        name: string;
        full_name: string;
        description: string | null;
        stargazers_count: number;
        html_url: string;
        language: string | null;
        updated_at: string;
      }) => ({
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        stars: repo.stargazers_count,
        url: repo.html_url,
        language: repo.language,
        updatedAt: repo.updated_at,
      })) ?? []
    );
  } catch {
    return [];
  }
}
