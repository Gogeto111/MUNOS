/**
 * Pure embedding math, kept free of server-only and database imports so it
 * can be unit-tested in isolation. Bytes are float32 little-endian — the same
 * layout pgvector would use, so a later swap only touches the column type.
 */

/** Packs float32s (little-endian) into bytes for the `Bytes` embedding column. */
export function encodeEmbedding(values: number[]): Uint8Array<ArrayBuffer> {
  const buffer = new ArrayBuffer(values.length * 4);
  const view = new DataView(buffer);
  for (let i = 0; i < values.length; i++) view.setFloat32(i * 4, values[i], true);
  return new Uint8Array(buffer);
}

/** Unpacks a stored embedding back into float32s. */
export function decodeEmbedding(buffer: Uint8Array): number[] {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const out = new Array<number>(buffer.length / 4);
  for (let i = 0; i < out.length; i++) out[i] = view.getFloat32(i * 4, true);
  return out;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dot / denominator;
}
