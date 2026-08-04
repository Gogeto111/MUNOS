/**
 * Heading-aware text chunking for the RAG pipeline.
 * Rough token estimate (~4 chars/token) — good enough for embedding budgets.
 */

export const CHUNK_TARGET_TOKENS = 600;
export const CHUNK_OVERLAP_TOKENS = 100;

export interface TextChunk {
  content: string;
  heading: string | null;
  tokenCount: number;
}

export function estimateTokens(text: string): number {
  const length = text.replace(/\s+/g, " ").trim().length;
  return Math.max(1, Math.ceil(length / 4));
}

/**
 * Normalizes raw PDF extraction output: strips control characters (including
 * form feeds), trims trailing spaces on each line, and collapses runs of
 * blank lines so the chunker sees clean paragraph blocks.
 */
export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Detects whether a trimmed block is a section heading. */
export function detectHeading(block: string): string | null {
  const single = block.replace(/\s+/g, " ").trim();
  if (!single || single.includes("\n")) return null;

  // Markdown headings: "# Chapter I"
  if (/^#{1,6}\s+/.test(single)) {
    return single.replace(/^#{1,6}\s+/, "").trim();
  }

  // Short Title-Case / UPPER-CASE lines ending in ":" e.g. "Article 2:".
  if (/^[A-Z0-9][^:.?!]*:$/.test(single) && single.split(" ").length <= 12) {
    return single.slice(0, -1).trim();
  }

  return null;
}

/** Returns the last ~`tokens`-worth of text, trimmed at a sentence boundary. */
function tailByTokens(text: string, tokens: number): string {
  const chars = tokens * 4;
  if (text.length <= chars) return text;
  let tail = text.slice(-chars).replace(/^[^\n]+?\s+/, "");
  const boundary = tail.search(/[.!?](?:\s|\n|$)/);
  if (boundary > 0 && boundary < tail.length - 1) {
    tail = tail.slice(0, boundary + 1);
  }
  return tail.trim();
}

export function chunkText(
  text: string,
  options?: { targetTokens?: number; overlapTokens?: number },
): TextChunk[] {
  const target = options?.targetTokens ?? CHUNK_TARGET_TOKENS;
  const overlap = options?.overlapTokens ?? CHUNK_OVERLAP_TOKENS;

  const blocks = text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const chunks: TextChunk[] = [];
  let current = "";
  let heading: string | null = null;

  const push = () => {
    const content = current.trim();
    if (!content) return;
    chunks.push({ content, heading, tokenCount: estimateTokens(content) });
  };

  for (const block of blocks) {
    const detected = detectHeading(block);
    if (detected) {
      push();
      current = "";
      heading = detected;
      continue;
    }

    const joined = current ? `${current}\n\n${block}` : block;
    if (current && estimateTokens(joined) > target) {
      push();
      const seed = tailByTokens(current, overlap);
      current = seed ? `${seed}\n\n${block}` : block;
    } else {
      current = joined;
    }
  }

  push();
  return chunks;
}
