/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Each unique key (e.g. userId or IP) gets a window of `windowMs`
 * milliseconds during which at most `max` requests are allowed.
 *
 * WARNING: In-memory — resets on server restart and does not share state
 * across serverless instances. Replace with Redis-backed limiter for
 * production multi-instance deployments.
 */

interface WindowEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, WindowEntry>();

// Periodic cleanup to prevent memory leaks from stale entries.
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

export interface RateLimitConfig {
  /** Maximum requests allowed within the window. */
  max: number;
  /** Window duration in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check (and increment) the rate limit for a given key.
 * Returns whether the request is allowed and relevant headers.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  cleanup();

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.max - 1, resetAt: now + config.windowMs };
  }

  if (entry.count >= config.max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: config.max - entry.count, resetAt: entry.resetAt };
}

/**
 * Helper: extract a rate-limit key from a request.
 * Uses authenticated userId if available, falls back to IP.
 */
export function rateLimitKey(userId: string | null, ip: string | null): string {
  return userId ?? ip ?? "anonymous";
}
