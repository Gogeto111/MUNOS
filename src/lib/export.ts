import type { ResolutionData } from "@/components/workspace/resolution-preview";

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToMarkdown(content: string, filename: string) {
  const name = filename.endsWith(".md") ? filename : `${filename}.md`;
  downloadFile(content, name, "text/markdown");
}

export function exportToPlainText(content: string, filename: string) {
  const name = filename.endsWith(".txt") ? filename : `${filename}.txt`;
  downloadFile(content, name, "text/plain");
}

export async function copyToClipboard(content: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch {
    return false;
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "[DATE]";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatResolutionForExport(resolution: ResolutionData): string {
  const lines: string[] = [];

  lines.push(resolution.committee || "[Committee Name]");
  lines.push(resolution.topic || "[Topic]");
  lines.push("");

  if (resolution.sponsors.length > 0) {
    lines.push(`Sponsors: ${resolution.sponsors.join(", ")}`);
  }
  if (resolution.signatories.length > 0) {
    lines.push(`Signatories: ${resolution.signatories.join(", ")}`);
  }
  lines.push(`Date: ${formatDate(resolution.date)}`);
  lines.push("");
  lines.push("");

  if (resolution.preambulatoryClauses.length > 0) {
    resolution.preambulatoryClauses.forEach((clause, idx) => {
      const comma = idx < resolution.preambulatoryClauses.length - 1 ? "," : ",";
      lines.push(`    ${clause.keyword} ${clause.text}${comma}`);
    });
    lines.push("");
  }

  if (resolution.operativeClauses.length > 0) {
    resolution.operativeClauses.forEach((clause, idx) => {
      const isFinal = idx === resolution.operativeClauses.length - 1;
      const punctuation = isFinal ? "." : ";";
      const num = idx + 1;

      if (clause.subClauses.length === 0) {
        lines.push(`    ${num}. ${clause.keyword} ${clause.text}${punctuation}`);
      } else {
        lines.push(`    ${num}. ${clause.keyword} ${clause.text}`);
        clause.subClauses.forEach((sub) => {
          lines.push(`        (${sub.letter}) ${sub.text}${punctuation}`);
        });
      }
    });
    lines.push("");
  }

  if (resolution.finalClause) {
    lines.push("");
    lines.push(`    ${resolution.finalClause}`);
  } else {
    lines.push("");
    lines.push(
      `    This resolution, adopted by ${resolution.committee || "[Committee]"} on ${formatDate(resolution.date)}, shall enter into force immediately upon adoption.`,
    );
  }

  return lines.join("\n");
}
