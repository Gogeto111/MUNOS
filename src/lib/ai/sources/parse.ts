/**
 * Pure parsers for the live-intelligence pipeline: HTML -> text, RSS/Atom
 * feed -> items, and PDF-link discovery. No network, no dependencies, fully
 * unit-testable.
 */

export interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

const ENTITY_MAP: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
  "&ndash;": "–",
  "&mdash;": "—",
};

export function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_match, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&#x([0-9a-fA-F]+);/g, (_match, code: string) =>
      String.fromCodePoint(parseInt(code, 16)),
    )
    .replace(
      /&(amp|lt|gt|quot|#39|apos|nbsp|ndash|mdash);/g,
      (match) => ENTITY_MAP[match] ?? match,
    );
}

/**
 * Converts raw HTML to readable text: drops scripts/styles, turns block
 * elements into line breaks, strips tags, decodes entities, and collapses
 * whitespace.
 */
export function htmlToText(html: string): string {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");

  const withBreaks = withoutScripts
    .replace(
      /<\s*(br|p|div|li|tr|section|article|blockquote|h[1-6]|table|thead|tbody|ul|ol)\b[^>]*>/gi,
      "\n",
    )
    .replace(/<\s*\/\s*(p|div|li|tr|section|article|blockquote|h[1-6]|table|ul|ol)\s*>/gi, "\n");

  const text = withBreaks
    .replace(/<\s*td\b[^>]*>/gi, " | ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[^\S\n]+/g, " ")
    .replace(/ *\| +/g, " | ");

  return decodeEntities(text)
    .trim()
    .replace(/\n{3,}/g, "\n\n");
}

function readTag(block: string, name: string): string {
  const pattern = new RegExp(
    `<${name}(?:[^>]*)>([\\s\\S]*?)<\\/${name}>`,
    "i",
  );
  const match = block.match(pattern);
  return match ? match[1] : "";
}

function readLink(block: string): string {
  const inTag = block.match(/<link[^>]*>/i)?.[0] ?? "";
  const href = inTag.match(/href\s*=\s*["']([^"']+)["']/i)?.[1];
  if (href) return href;
  const direct = block.match(/<link[^>]*>([^<]+)<\/link>/i)?.[1];
  return direct ?? "";
}

function readItem(block: string): RssItem | null {
  const title = decodeEntities(
    readTag(block, "title")
      .replace(/<[^>]+>/g, "")
      .trim(),
  );
  const link = readLink(block).trim();
  const rawDescription = readTag(block, "description") || readTag(block, "summary");
  const description = htmlToText(
    rawDescription.replace(/<!\[CDATA\[/gi, "").replace(/\]\]>/g, ""),
  );
  const pubDate =
    readTag(block, "pubDate") || readTag(block, "updated") || readTag(block, "date");
  if (!title && !link) return null;
  return {
    title,
    link,
    description,
    pubDate: pubDate.trim(),
  };
}

/**
 * Parses an RSS 2.0 (<item>) or Atom (<entry>) feed into plain items.
 * Best-effort: malformed entries are skipped, never fatal.
 */
export function parseRssFeed(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const blockPattern = /<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/(?:item|entry)>/gi;
  for (const match of xml.matchAll(blockPattern)) {
    const item = readItem(match[2]);
    if (item) items.push(item);
  }
  return items;
}

/** Resolves a possibly-relative href against a base URL. */
export function absoluteUrl(href: string, base: string): string | null {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

/**
 * Finds absolute URLs of likely background-guide / rules-of-procedure PDFs on
 * a crawled page. Keyword-bearing and PDF links rank first, results are
 * deduped and capped to `limit`, preserving document order within a score.
 */
export function extractPdfLinks(html: string, base: string, limit = 8): string[] {
  const candidateScores = new Map<string, number>();
  const hrefPattern = /href\s*=\s*["']([^"']+)["']/gi;
  for (const match of html.matchAll(hrefPattern)) {
    const raw = match[1];
    if (!/\.pdf(?:\?|$)/i.test(raw) && !/background|guide|rules|procedure/i.test(raw)) {
      continue;
    }
    const resolved = absoluteUrl(raw, base);
    if (!resolved || !/^https?:/i.test(resolved)) continue;

    const lower = resolved.toLowerCase();
    let score = 0;
    if (/\.pdf(?:\?|$)/i.test(resolved)) score += 3;
    if (/background|guide|rules|procedure|handbook|manual/i.test(lower)) score += 4;
    if (!candidateScores.has(resolved)) candidateScores.set(resolved, score);
  }

  return [...candidateScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([url]) => url);
}

/** Human-readable document title derived from a URL's last path segment. */
export function titleFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const segment = decodeURIComponent(
      parsed.pathname.split("/").filter(Boolean).pop() ?? "",
    )
      .replace(/\.(pdf|html?|php|aspx?|docx?)$/i, "")
      .replace(/[-_+]+/g, " ")
      .trim();
    if (segment) return segment;
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
