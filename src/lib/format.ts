import { format, formatDistanceToNowStrict } from "date-fns";

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy · h:mm a");
}

export function timeAgo(date: Date | string): string {
  return formatDistanceToNowStrict(new Date(date), { addSuffix: true });
}

export function initials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.trim().charAt(0) ?? "";
  const last = lastName?.trim().charAt(0) ?? "";
  return `${first}${last}`.toUpperCase() || "M";
}

export function displayName(firstName: string | null, lastName: string | null): string {
  const full = [firstName, lastName].filter(Boolean).join(" ");
  return full.trim() || "Anonymous Delegate";
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Lightweight slug sanitizer for live text inputs. Unlike slugify it keeps
 * consecutive separators, so the user can still type freely (e.g. a draft
 * slug like "geneva--2026") while illegal characters are stripped.
 */
export function sanitizeSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}
