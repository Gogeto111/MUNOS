"use server";

import { getDb } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, fail, toActionError, type ActionState } from "@/lib/actions";
import { cleanText } from "@/lib/ai/chunk";
import { extractPdfText } from "@/lib/ai/pdf";
import { storeDocument } from "@/lib/ai/store-document";
import { deleteStoredObject, readStoredObject } from "@/lib/storage";
import { UNCHARTER, UDHR, UNCLOS } from "@/lib/ai/corpus/texts";

const CORPUS_ENTRIES = [
  { title: "UN Charter", source: "UN Charter (public domain)", text: UNCHARTER },
  {
    title: "Universal Declaration of Human Rights",
    source: "UDHR (public domain)",
    text: UDHR,
  },
  {
    title: "UNCLOS (selected articles)",
    source: "UNCLOS (public domain)",
    text: UNCLOS,
  },
];

async function assertOwnsWorkspace(userId: string, workspaceId: string) {
  const workspace = await getDb().workspace.findFirst({
    where: { id: workspaceId, userId },
    select: { id: true },
  });
  if (!workspace) throw new Error("Workspace not found.");
}

export async function listAiDocuments(
  workspaceId: string,
): Promise<
  ActionState<{
    documents: {
      id: string;
      title: string;
      source: string;
      sourceType: string;
      isCorpus: boolean;
      status: string;
      chunkCount: number;
      fileUrl: string | null;
      originUrl: string | null;
      createdAt: Date;
    }[];
    corpusSeeded: boolean;
  }>
> {
  try {
    const user = await requireUser();
    await assertOwnsWorkspace(user.id, workspaceId);

    const [documents, corpusCount] = await Promise.all([
      getDb().aiDocument.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          source: true,
          sourceType: true,
          isCorpus: true,
          status: true,
          chunkCount: true,
          fileUrl: true,
          originUrl: true,
          createdAt: true,
        },
      }),
      getDb().aiDocument.count({ where: { isCorpus: true } }),
    ]);

    return ok("Library loaded.", { documents, corpusSeeded: corpusCount > 0 });
  } catch (error) {
    return toActionError(error);
  }
}

/** Loads the bundled UN texts into the shared corpus (idempotent). */
export async function seedCorpus(): Promise<ActionState<{ chunkCount: number }>> {
  try {
    await requireUser();

    const existing = await getDb().aiDocument.count({ where: { isCorpus: true } });
    if (existing > 0) return ok("Built-in UN sources are already loaded.", { chunkCount: 0 });

    let total = 0;
    for (const entry of CORPUS_ENTRIES) {
      const stored = await storeDocument({
        sourceType: "CORPUS",
        isCorpus: true,
        title: entry.title,
        source: entry.source,
        text: entry.text,
      });
      total += stored.chunkCount;
    }

    return ok("Built-in UN sources indexed.", { chunkCount: total });
  } catch (error) {
    return toActionError(error);
  }
}

/**
 * Parses a previously uploaded PDF (registered via the upload route), chunks
 * and embeds its text, and stores it in the workspace's research library.
 */
export async function ingestDocument(
  workspaceId: string,
  input: { key: string; url: string; fileName: string },
): Promise<ActionState<{ documentId: string; chunkCount: number }>> {
  try {
    const user = await requireUser();
    await assertOwnsWorkspace(user.id, workspaceId);

    const key = String(input.key ?? "").trim();
    const fileName = String(input.fileName ?? "").trim();
    const url = String(input.url ?? "").trim();
    if (!key) return fail("No stored file key provided.");
    if (!fileName) return fail("File name is required.");

    const bytes = await readStoredObject(key);
    if (!bytes) return fail("Could not read the uploaded file.");

    const cleaned = cleanText(await extractPdfText(bytes));
    if (!cleaned) return fail("No extractable text found in that PDF.");

    const stored = await storeDocument({
      workspaceId,
      title: fileName.replace(/\.pdf$/i, "").trim() || "Background guide",
      source: fileName,
      fileKey: key,
      fileUrl: url,
      text: cleaned,
    });

    return ok("Document indexed.", {
      documentId: stored.id,
      chunkCount: stored.chunkCount,
    });
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteAiDocument(
  workspaceId: string,
  documentId: string,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    await assertOwnsWorkspace(user.id, workspaceId);

    const document = await getDb().aiDocument.findFirst({
      where: { id: documentId, workspaceId, isCorpus: false },
      select: { id: true, fileKey: true },
    });
    if (!document) throw new Error("Document not found.");

    await getDb().aiDocument.delete({ where: { id: documentId } });

    // Best-effort removal of the underlying stored PDF.
    await deleteStoredObject(document.fileKey ?? "");

    return ok("Document removed.");
  } catch (error) {
    return toActionError(error);
  }
}
