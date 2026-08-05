import { logger } from "@/lib/logger";

interface AiUsageEntry {
  userId: string;
  feature: string;
  tokens: number;
  timestamp: number;
}

/**
 * In-memory AI usage tracker. Logs token consumption per user/feature.
 * In production, this should be backed by a DB table or analytics service.
 */
const usageLog: AiUsageEntry[] = [];
const MAX_LOG_SIZE = 10_000;

export function trackAiUsage(userId: string, feature: string, tokens: number) {
  usageLog.push({ userId, feature, tokens, timestamp: Date.now() });

  // Trim if too large
  if (usageLog.length > MAX_LOG_SIZE) {
    usageLog.splice(0, usageLog.length - MAX_LOG_SIZE);
  }

  logger.info("[ai-usage]", { userId, feature, tokens });
}

export function getAiUsageSummary(userId: string, windowMs = 86_400_000) {
  const cutoff = Date.now() - windowMs;
  const userEntries = usageLog.filter(
    (e) => e.userId === userId && e.timestamp >= cutoff,
  );

  const byFeature: Record<string, { count: number; totalTokens: number }> = {};
  let totalTokens = 0;

  for (const entry of userEntries) {
    if (!byFeature[entry.feature]) {
      byFeature[entry.feature] = { count: 0, totalTokens: 0 };
    }
    byFeature[entry.feature].count += 1;
    byFeature[entry.feature].totalTokens += entry.tokens;
    totalTokens += entry.tokens;
  }

  return {
    userId,
    windowMs,
    totalRequests: userEntries.length,
    totalTokens,
    byFeature,
  };
}

/** Get system-wide usage for the admin dashboard. */
export function getSystemAiUsage(windowMs = 86_400_000) {
  const cutoff = Date.now() - windowMs;
  const recent = usageLog.filter((e) => e.timestamp >= cutoff);

  const byUser: Record<string, { count: number; totalTokens: number }> = {};
  const byFeature: Record<string, { count: number; totalTokens: number }> = {};
  let totalTokens = 0;

  for (const entry of recent) {
    if (!byUser[entry.userId]) {
      byUser[entry.userId] = { count: 0, totalTokens: 0 };
    }
    byUser[entry.userId].count += 1;
    byUser[entry.userId].totalTokens += entry.tokens;

    if (!byFeature[entry.feature]) {
      byFeature[entry.feature] = { count: 0, totalTokens: 0 };
    }
    byFeature[entry.feature].count += 1;
    byFeature[entry.feature].totalTokens += entry.tokens;

    totalTokens += entry.tokens;
  }

  return {
    windowMs,
    totalRequests: recent.length,
    totalTokens,
    uniqueUsers: Object.keys(byUser).length,
    byUser,
    byFeature,
  };
}
