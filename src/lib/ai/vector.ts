import "server-only";
import { getDb } from "@/lib/prisma";
import { cosineSimilarity, decodeEmbedding } from "@/lib/ai/embedding-math";

export interface RetrievedChunk {
  id: string;
  content: string;
  heading: string | null;
  title: string;
  source: string;
  similarity: number;
}

/**
 * Brute-force cosine search over the workspace's chunks plus the shared UN
 * corpus. Personal-scale (hundreds–thousands of chunks) keeps this fast; a
 * production swap to pgvector only touches this function + the column type.
 */
export async function searchChunks(
  workspaceId: string,
  queryEmbedding: number[],
  limit = 6,
): Promise<RetrievedChunk[]> {
  const db = getDb();
  if (!db) return [];

  const rows = await db.aiChunk.findMany({
    where: {
      embedding: { not: null },
      document: {
        OR: [{ workspaceId }, { isCorpus: true }],
      },
    },
    select: {
      id: true,
      content: true,
      heading: true,
      embedding: true,
      document: { select: { title: true, source: true } },
    },
  });

  const scored: RetrievedChunk[] = [];
  for (const row of rows) {
    if (!row.embedding) continue;
    scored.push({
      id: row.id,
      content: row.content,
      heading: row.heading,
      title: row.document.title,
      source: row.document.source,
      similarity: cosineSimilarity(queryEmbedding, decodeEmbedding(row.embedding)),
    });
  }

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, limit);
}
