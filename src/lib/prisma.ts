import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient | null {
  if (!env.DATABASE_URL) return null;
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

/**
 * Prisma singleton — reused across hot-reloads in dev to avoid exhausting
 * connection pools, and a single instance in production. Returns `null`
 * (without connecting) when DATABASE_URL is not configured.
 */
export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}

/** Returns the configured client or throws a clear, actionable error. */
export function getDb(): PrismaClient {
  if (!prisma) {
    throw new Error(
      "DATABASE_NOT_CONFIGURED: set DATABASE_URL in .env (see .env.example).",
    );
  }
  return prisma;
}
