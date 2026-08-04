import { describe, expect, it } from "vitest";
import {
  cosineSimilarity,
  decodeEmbedding,
  encodeEmbedding,
} from "@/lib/ai/embedding-math";

describe("encodeEmbedding / decodeEmbedding", () => {
  it("round-trips float32 values losslessly", () => {
    const values = [0.5, -1, 2.25, 0, 3.75];
    expect(decodeEmbedding(encodeEmbedding(values))).toEqual(values);
  });

  it("stores four bytes per value", () => {
    expect(encodeEmbedding([1, 2, 3]).length).toBe(12);
  });

  it("decodes an empty buffer to an empty array", () => {
    expect(decodeEmbedding(new Uint8Array(0))).toEqual([]);
  });
});

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1, 10);
  });

  it("returns 1 for parallel vectors regardless of scale", () => {
    expect(cosineSimilarity([3, 4], [6, 8])).toBeCloseTo(1, 10);
  });

  it("returns 0 for orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 10);
  });

  it("returns -1 for opposite vectors", () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1, 10);
  });

  it("returns 0 when either vector has zero magnitude", () => {
    expect(cosineSimilarity([0, 0], [1, 0])).toBe(0);
    expect(cosineSimilarity([1, 0], [0, 0])).toBe(0);
  });
});
