import "server-only";
import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().optional().default(""),
  CLERK_SECRET_KEY: z.string().optional().default(""),
  CLERK_WEBHOOK_SECRET: z.string().optional().default(""),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(""),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional().default(""),
  AI_MODEL: z.string().optional().default("gemini-2.5-flash"),
});

const result = serverSchema.safeParse(process.env);

if (!result.success) {
  console.error(
    "[env] Invalid server environment variables:",
    result.error.flatten().fieldErrors,
  );
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
