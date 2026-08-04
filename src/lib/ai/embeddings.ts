import "server-only";
import { google } from "@ai-sdk/google";
import { embedMany } from "ai";
import { isAiConfigured } from "@/lib/env";

export const EMBED_MODEL = "gemini-embedding-001";
export const EMBED_DIM = 3072;
export const EMBED_BATCH_SIZE = 100;

/**
 * Embeds a batch of texts via Google Gemini. Batches to stay under the API's
 * per-request input limit. Throws `AI_NOT_CONFIGURED` when no key is present.
 */
export async function embedTexts(values: string[]): Promise<number[][]> {
  if (!isAiConfigured) {
    throw new Error("AI_NOT_CONFIGURED");
  }
  const embeddings: number[][] = [];
  for (let i = 0; i < values.length; i += EMBED_BATCH_SIZE) {
    const batch = values.slice(i, i + EMBED_BATCH_SIZE);
    const { embeddings: batchEmbeddings } = await embedMany({
      model: google.textEmbeddingModel(EMBED_MODEL),
      values: batch,
    });
    embeddings.push(...batchEmbeddings);
  }
  return embeddings;
}

export async function embedText(value: string): Promise<number[]> {
  const [embedding] = await embedTexts([value]);
  return embedding;
}
