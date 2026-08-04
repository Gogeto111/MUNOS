import "server-only";
import { PDFParse } from "pdf-parse";

/**
 * Extracts plain text from PDF bytes. Used by the research-library ingestion
 * pipeline and the official-source crawler (background guides, rules of
 * procedure, UN documents).
 */
export async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const parser = new PDFParse({ data: bytes });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}
