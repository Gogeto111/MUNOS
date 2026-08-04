import { describe, expect, it } from "vitest";
import {
  CHUNK_OVERLAP_TOKENS,
  CHUNK_TARGET_TOKENS,
  chunkText,
  cleanText,
  detectHeading,
  estimateTokens,
} from "@/lib/ai/chunk";

describe("estimateTokens", () => {
  it("counts roughly four characters per token", () => {
    expect(estimateTokens("hello world")).toBe(3);
  });

  it("never returns zero for empty or tiny input", () => {
    expect(estimateTokens("")).toBe(1);
    expect(estimateTokens("a")).toBe(1);
  });
});

describe("cleanText", () => {
  it("strips control characters including form feeds", () => {
    expect(cleanText("a\u000cb\n\n\n\n  b  ")).toBe("ab\n\n  b");
  });

  it("trims trailing spaces before newlines", () => {
    expect(cleanText("line  \nnext")).toBe("line\nnext");
  });

  it("collapses runs of blank lines to a single separator", () => {
    expect(cleanText("one\n\n\n\n\n\ntwo")).toBe("one\n\ntwo");
  });
});

describe("detectHeading", () => {
  it("detects markdown headings", () => {
    expect(detectHeading("# Preamble")).toBe("Preamble");
    expect(detectHeading("## Article 2")).toBe("Article 2");
  });

  it("detects short label lines ending in a colon", () => {
    expect(detectHeading("Article 2:")).toBe("Article 2");
  });

  it("rejects full sentences and multi-line blocks", () => {
    expect(detectHeading("The quick brown fox jumps over the lazy dog.")).toBeNull();
    expect(detectHeading("Article 2.")).toBeNull();
    expect(detectHeading("What is this?:")).toBeNull();
    expect(detectHeading("line one\nline two")).toBeNull();
    expect(detectHeading("")).toBeNull();
  });
});

describe("chunkText", () => {
  it("assigns the current heading to subsequent chunks", () => {
    const text =
      "# Preamble\n\nPreamble body text here.\n\n# Article 2\n\nArticle 2 content here.";
    const chunks = chunkText(text);
    expect(chunks[0].heading).toBe("Preamble");
    expect(chunks[0].content).toContain("Preamble body text");
    expect(chunks[1].heading).toBe("Article 2");
    expect(chunks[1].content).toContain("Article 2 content");
  });

  it("splits long documents into bounded chunks with overlap", () => {
    const blocks = Array.from(
      { length: 12 },
      (_, index) => `Paragraph ${index + 1}: ` + "word ".repeat(300),
    ).join("\n\n");

    const chunks = chunkText(blocks, { targetTokens: 100, overlapTokens: 20 });

    expect(chunks.length).toBeGreaterThan(3);
    for (const chunk of chunks) {
      expect(chunk.content.length).toBeGreaterThan(0);
      expect(chunk.tokenCount).toBeLessThan(500);
    }
    // Later chunks reuse the tail of earlier text for overlap continuity.
    const tail = chunks[0].content.slice(-60);
    expect(chunks[1].content.slice(0, 60)).toContain(tail.slice(0, 20));
  });

  it("uses the exported defaults when no options are provided", () => {
    expect(CHUNK_TARGET_TOKENS).toBe(600);
    expect(CHUNK_OVERLAP_TOKENS).toBe(100);
    const chunks = chunkText("One paragraph only.");
    expect(chunks.length).toBe(1);
    expect(chunks[0].content).toBe("One paragraph only.");
  });
});
