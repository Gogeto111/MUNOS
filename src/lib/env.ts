import "server-only";
import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  CLERK_SECRET_KEY: z.string().optional().default(""),
  CLERK_WEBHOOK_SECRET: z.string().optional().default(""),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(""),
  SUPABASE_URL: z.string().optional().default(""),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional().default(""),
  AI_MODEL: z.string().optional().default("gemini-2.5-flash"),
  NEXT_PUBLIC_APP_URL: z.string().optional().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional().default(""),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().default(""),
});

const devSchema = z.object({
  DATABASE_URL: z.string().optional().default(""),
  CLERK_SECRET_KEY: z.string().optional().default(""),
  CLERK_WEBHOOK_SECRET: z.string().optional().default(""),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(""),
  SUPABASE_URL: z.string().optional().default(""),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional().default(""),
  AI_MODEL: z.string().optional().default("gemini-2.5-flash"),
  NEXT_PUBLIC_APP_URL: z.string().optional().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional().default(""),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().default(""),
});

const isProd = process.env.NODE_ENV === "production";
const schema = isProd ? serverSchema : devSchema;

const result = schema.safeParse(process.env);

if (!result.success) {
  const errors = result.error.flatten().fieldErrors;
  const msg = `[env] Invalid environment variables:\n${Object.entries(errors).map(([k, v]) => `  ${k}: ${v?.join(", ")}`).join("\n")}`;
  if (isProd) {
    // In production, fail hard — missing env vars cause silent data leaks.
    console.error(msg);
    throw new Error(msg);
  } else {
    console.warn(msg);
  }
}

/**
 * Server-only environment. Importing this module from a Client Component
 * throws at build time — a hard guarantee that secrets never leak.
 */
export const env = result.success
  ? result.data
  : ({} as z.infer<typeof serverSchema>);

export const isServerConfigured = Boolean(
  env.DATABASE_URL && env.CLERK_SECRET_KEY,
);

export const isAiConfigured = Boolean(env.GOOGLE_GENERATIVE_AI_API_KEY);

export const isStorageConfigured = Boolean(
  env.SUPABASE_SERVICE_ROLE_KEY && env.SUPABASE_URL,
);

/** Production-ready checks — all critical services must be configured. */
export function validateProductionEnv() {
  const missing: string[] = [];
  if (!env.DATABASE_URL) missing.push("DATABASE_URL");
  if (!env.CLERK_SECRET_KEY) missing.push("CLERK_SECRET_KEY");
  if (!env.SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!env.SUPABASE_URL) missing.push("SUPABASE_URL");
  if (missing.length > 0) {
    console.warn(`[env] Missing production env vars: ${missing.join(", ")}`);
    return { ok: false as const, missing };
  }
  return { ok: true as const, missing: [] };
}
