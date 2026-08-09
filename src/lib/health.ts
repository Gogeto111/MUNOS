import { logger } from "@/lib/logger";

interface HealthCheck {
  status: "ok" | "error" | "degraded";
  latencyMs?: number;
  message?: string;
}

interface HealthReport {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  checks: {
    database: HealthCheck;
    ai: HealthCheck;
    env: HealthCheck;
  };
}

let cachedReport: HealthReport | null = null;
let lastCheck = 0;
const CACHE_TTL_MS = 30_000; // Re-check every 30 seconds

/**
 * Startup health validation ï¿½ï¿½ï¿½ ï¿½?" checks DB, AI, and env configuration.
 * Caches the result for 30s to avoid hammering the DB on every request.
 */
export async function getHealthReport(): Promise<HealthReport> {
  const now = Date.now();
  if (cachedReport && now - lastCheck < CACHE_TTL_MS) {
    return cachedReport;
  }

  const checks: HealthReport["checks"] = {
    database: { status: "ok" },
    ai: { status: "ok" },
    env: { status: "ok" },
  };

  // Database check
  const dbStart = Date.now();
  try {
    const { getDb } = await import("@/lib/prisma");
    await getDb().$queryRaw`SELECT 1`;
    checks.database = { status: "ok", latencyMs: Date.now() - dbStart };
  } catch (error) {
    checks.database = {
      status: "error",
      latencyMs: Date.now() - dbStart,
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }

  // AI check
  const aiStart = Date.now();
  try {
    const { isAiConfigured } = await import("@/lib/env");
    if (!isAiConfigured) {
      checks.ai = { status: "degraded", message: "API key not configured" };
    } else {
      // Just verify the key exists ï¿½ï¿½ï¿½ ï¿½?" don't make a real API call on health check
      checks.ai = { status: "ok", latencyMs: Date.now() - aiStart };
    }
  } catch {
    checks.ai = { status: "degraded", message: "AI module unavailable" };
  }

  // Env check
  try {
    const { validateProductionEnv } = await import("@/lib/env");
    const envResult = validateProductionEnv();
    if (!envResult.ok) {
      checks.env = {
        status: "degraded",
        message: `Missing: ${envResult.missing.join(", ")}`,
      };
    }
  } catch {
    checks.env = { status: "degraded", message: "Env validation failed" };
  }

  const allStatuses = Object.values(checks).map((c) => c.status);
  const overall: HealthReport["status"] =
    allStatuses.every((s) => s === "ok")
      ? "healthy"
      : allStatuses.some((s) => s === "error")
        ? "unhealthy"
        : "degraded";

  const report: HealthReport = {
    status: overall,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
  };

  cachedReport = report;
  lastCheck = now;

  if (overall !== "healthy") {
    logger.warn("[health] System degraded", { status: overall, checks });
  }

  return report;
}
