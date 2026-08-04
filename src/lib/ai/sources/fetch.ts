import "server-only";

export const FETCH_TIMEOUT_MS = 15_000;
export const MAX_BODY_BYTES = 12 * 1024 * 1024; // 12 MB cap on crawled bodies

const USER_AGENT =
  "MUNOSResearchBot/1.0 (+https://munos.app; educational Model UN research crawler)";

class FetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FetchError";
  }
}

function decodeBody(buffer: Buffer, contentType: string): string {
  const charset = (contentType.match(/charset=([^;\s]+)/i)?.[1] ?? "").toLowerCase();
  if (charset && /(iso-8859-1|latin-?1)/i.test(charset)) {
    return buffer.toString("latin1");
  }
  return buffer.toString("utf8");
}

/** Fetches a remote resource with a timeout and a hard size cap. */
async function fetchResource(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  let response: Response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { "user-agent": USER_AGENT, accept: "*/*" },
      redirect: "follow",
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "network error";
    throw new FetchError(`Could not reach ${url}: ${reason}`);
  }
  if (!response.ok) {
    throw new FetchError(`HTTP ${response.status} for ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > MAX_BODY_BYTES) {
    throw new FetchError(`Body too large (${buffer.byteLength} bytes) for ${url}`);
  }
  return { buffer, contentType: response.headers.get("content-type") ?? "" };
}

/** Fetches a text document (HTML page, RSS feed). */
export async function fetchText(url: string): Promise<string> {
  const { buffer, contentType } = await fetchResource(url);
  return decodeBody(buffer, contentType);
}

/** Fetches raw bytes (e.g. a background-guide PDF). */
export async function fetchBytes(url: string): Promise<Uint8Array> {
  const { buffer } = await fetchResource(url);
  return new Uint8Array(buffer);
}
