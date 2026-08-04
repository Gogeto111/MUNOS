import "server-only";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { writeFile, mkdir } from "node:fs/promises";
import { getStorageClient } from "@/lib/storage";
import { env } from "@/lib/env";
import { publicEnv } from "@/lib/public-env";
import { STORAGE_BUCKET } from "@/lib/constants";

const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

const MAX_BYTES = 15 * 1024 * 1024;

export interface UploadResult {
  url: string;
  key: string;
}

export interface UploadError {
  error: string;
}

function extFromMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "application/pdf":
      return "pdf";
    default:
      return "bin";
  }
}

export async function uploadConferenceAsset(
  file: File,
  folder: string,
): Promise<UploadResult | UploadError> {
  if (!ALLOWED_IMAGE_MIME.has(file.type)) {
    return { error: "Only images and PDFs are supported." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "File is too large (max 15 MB)." };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const name = `${randomUUID()}.${extFromMime(file.type)}`;

  // Prefer Supabase storage when configured.
  const client = getStorageClient();
  if (client) {
    const key = `${folder}/${name}`;
    const { error } = await client.storage
      .from(STORAGE_BUCKET)
      .upload(key, bytes, { contentType: file.type });
    if (error) return { error: `Upload failed: ${error.message}` };
    return { url: `${publicEnv.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${key}`, key };
  }

  // Fallback: local filesystem (dev / self-hosted).
  const relative = path.join("uploads", folder, name);
  const absolute = path.join(process.cwd(), "public", relative);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, bytes);
  return { url: `/${relative.split(path.sep).join("/")}`, key: relative };
}

export function isStorageConfiguredForUpload(): boolean {
  return Boolean(publicEnv.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

// Workspace attachments accept documents in addition to images/PDFs.
const ALLOWED_WORKSPACE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
]);

function extFromWorkspaceMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "application/pdf":
      return "pdf";
    case "text/plain":
      return "txt";
    case "text/markdown":
      return "md";
    case "text/csv":
      return "csv";
    case "application/msword":
      return "doc";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "docx";
    case "application/vnd.ms-excel":
      return "xls";
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return "xlsx";
    case "application/vnd.ms-powerpoint":
      return "ppt";
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return "pptx";
    case "application/zip":
      return "zip";
    default:
      return "bin";
  }
}

export async function uploadWorkspaceFile(
  file: File,
  folder: string,
): Promise<UploadResult | UploadError> {
  if (!ALLOWED_WORKSPACE_MIME.has(file.type)) {
    return { error: "Unsupported file type." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "File is too large (max 15 MB)." };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const name = `${randomUUID()}.${extFromWorkspaceMime(file.type)}`;

  const client = getStorageClient();
  if (client) {
    const key = `${folder}/${name}`;
    const { error } = await client.storage
      .from(STORAGE_BUCKET)
      .upload(key, bytes, { contentType: file.type });
    if (error) return { error: `Upload failed: ${error.message}` };
    return { url: `${publicEnv.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${key}`, key };
  }

  const relative = path.join("uploads", folder, name);
  const absolute = path.join(process.cwd(), "public", relative);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, bytes);
  return { url: `/${relative.split(path.sep).join("/")}`, key: relative };
}
