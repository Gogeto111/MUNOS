import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import path from "node:path";
import { readFile, unlink } from "node:fs/promises";
import { env } from "@/lib/env";
import { publicEnv } from "@/lib/public-env";
import { STORAGE_BUCKET } from "@/lib/constants";

let cachedClient: SupabaseClient | null = null;

/**
 * Server-side Supabase client authenticated with the service role key.
 * Used exclusively to issue short-lived signed upload URLs and to delete
 * objects — never exposed to the browser.
 */
export function getStorageClient(): SupabaseClient | null {
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  if (cachedClient) return cachedClient;

  cachedClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}

/**
 * Removes a single stored object (used when an owning entity is deleted).
 * Works for both Supabase Storage and the local `public/uploads` fallback.
 * Best-effort: never throws — callers treat object removal as non-fatal.
 */
export async function deleteStoredObject(key: string): Promise<void> {
  const safe = key.replace(/^\/+|\/+$/g, "");
  if (!safe) return;

  const client = getStorageClient();
  if (client) {
    const { error } = await client.storage.from(STORAGE_BUCKET).remove([safe]);
    if (error) console.error("[storage] remove object failed:", error.message);
    return;
  }

  const publicRoot = path.resolve(process.cwd(), "public");
  const target = path.resolve(publicRoot, safe);
  if (!target.startsWith(publicRoot)) {
    console.error("[storage] local remove rejected (path escape):", safe);
    return;
  }
  try {
    await unlink(target);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("[storage] local remove failed:", (error as Error).message);
    }
  }
}

/** Public URL for a stored object (bucket is public-read). */
export function getPublicFileUrl(path: string): string {
  const base = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
}

/**
 * Reads the raw bytes of a stored object back from Supabase Storage or the
 * local `public/uploads` fallback. Returns `null` when the object is missing.
 * Used by the AI research-library ingestion pipeline.
 */
export async function readStoredObject(key: string): Promise<Uint8Array | null> {
  const safe = key.replace(/^\/+|\/+$/g, "");
  if (!safe) return null;

  const client = getStorageClient();
  if (client) {
    const { data, error } = await client.storage.from(STORAGE_BUCKET).download(safe);
    if (error) {
      console.error("[storage] download failed:", error.message);
      return null;
    }
    return new Uint8Array(await data.arrayBuffer());
  }

  const publicRoot = path.resolve(process.cwd(), "public");
  const target = path.resolve(publicRoot, safe);
  if (!target.startsWith(publicRoot)) return null;
  try {
    return await readFile(target);
  } catch {
    return null;
  }
}

/**
 * Removes every object inside a storage prefix (used on account deletion).
 * Supabase's `remove` deletes only exact path matches, so we list the folder
 * (paged) and remove each object individually.
 */
export async function removeUserStoragePrefix(prefix: string): Promise<void> {
  const client = getStorageClient();
  if (!client) return;

  const base = prefix.replace(/^\/+|\/+$/g, "");
  if (!base) return; // never clear the whole bucket

  const bucket = client.storage.from(STORAGE_BUCKET);
  const paths: string[] = [];
  const limit = 1000;
  let offset = 0;

  for (;;) {
    const { data, error } = await bucket.list(base, { limit, offset });
    if (error) {
      console.error("[storage] remove prefix list failed:", error.message);
      return;
    }
    if (!data || data.length === 0) break;
    for (const item of data) {
      // Folders have id === null; files have an id.
      if (item.id) paths.push(`${base}/${item.name}`);
    }
    if (data.length < limit) break;
    offset += data.length;
  }

  for (let i = 0; i < paths.length; i += limit) {
    const chunk = paths.slice(i, i + limit);
    const { error } = await bucket.remove(chunk);
    if (error) {
      console.error("[storage] remove prefix failed:", error.message);
      return;
    }
  }
}

const SAFE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB

export const uploadPolicy = {
  mimeTypes: SAFE_MIME_TYPES,
  maxBytes: MAX_UPLOAD_BYTES,
  maxBytesLabel: "15 MB",
};
