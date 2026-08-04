import "server-only";
import { embedText } from "@/lib/ai/embeddings";
import { searchChunks, type RetrievedChunk } from "@/lib/ai/vector";

/**
 * Embeds a query and retrieves the closest chunks from the workspace's
 * research library plus the shared UN corpus. Best-effort: a retrieval
 * failure (no embedding key, empty library, DB hiccup) degrades to no
 * sources rather than aborting the generation.
 */
export async function retrieveContext(
  workspaceId: string,
  query: string,
  limit = 6,
): Promise<RetrievedChunk[]> {
  try {
    const queryEmbedding = await embedText(query);
    return await searchChunks(workspaceId, queryEmbedding, limit);
  } catch {
    return [];
  }
}
