import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/prisma";
import { cleanText, chunkText } from "@/lib/ai/chunk";
import { embedTexts } from "@/lib/ai/embeddings";
import { encodeEmbedding } from "@/lib/ai/embedding-math";

export type AiSourceType = "USER" | "CORPUS" | "CRAWLED" | "LIVE";

export interface StoredDocumentInput {
  workspaceId?: string;
  isCorpus?: boolean;
  sourceType?: AiSourceType;
  title: string;
  source: string;
  fileKey?: string;
  fileUrl?: string;
  originUrl?: string;
  retrievedAt?: Date;
  metadata?: Record<string, unknown> | null;
  text: string;
}

/**
 * Chunks + embeds one document's text and persists it (with its chunks) as an
 * AiDocument row. Shared by the research library, the UN corpus seed, the
 * official-source crawler, and the live-feed sync.
 */
export async function storeDocument(
  input: StoredDocumentInput,
): Promise<{ id: string; chunkCount: number }> {
  const chunks = chunkText(input.text);
  const embeddings = await embedTexts(chunks.map((chunk) => chunk.content));
  const document = await getDb().aiDocument.create({
    data: {
      workspaceId: input.workspaceId ?? null,
      isCorpus: input.isCorpus ?? false,
      sourceType: input.sourceType ?? "USER",
      title: input.title,
      source: input.source,
      fileKey: input.fileKey ?? null,
      fileUrl: input.fileUrl ?? null,
      originUrl: input.originUrl ?? null,
      retrievedAt: input.retrievedAt ?? null,
      metadata: (input.metadata ?? undefined) as
        | Prisma.InputJsonValue
        | undefined,
      chunkCount: chunks.length,
      chunks: {
        create: chunks.map((chunk, index) => ({
          content: chunk.content,
          heading: chunk.heading,
          chunkIndex: index,
          embedding: encodeEmbedding(embeddings[index]),
        })),
      },
    },
    select: { id: true },
  });
  return { id: document.id, chunkCount: chunks.length };
}

/** Finds an already-ingested remote document so re-syncs skip duplicates. */
export async function findRemoteDocument(
  workspaceId: string,
  sourceType: AiSourceType,
  originUrl: string,
): Promise<{ id: string } | null> {
  return getDb().aiDocument.findFirst({
    where: { workspaceId, sourceType, originUrl },
    select: { id: true },
  });
}

/** Normalizes and dedupes a remote document before storing it. */
export async function ingestRemoteDocument(input: StoredDocumentInput & {
  workspaceId: string;
  sourceType: "CRAWLED" | "LIVE";
  originUrl: string;
}): Promise<{ added: boolean; chunkCount: number }> {
  const cleaned = cleanText(input.text);
  if (cleaned.length < 240) {
    return { added: false, chunkCount: 0 };
  }
  const existing = await findRemoteDocument(
    input.workspaceId,
    input.sourceType,
    input.originUrl,
  );
  if (existing) return { added: false, chunkCount: 0 };
  const stored = await storeDocument({ ...input, text: cleaned });
  return { added: true, chunkCount: stored.chunkCount };
}
