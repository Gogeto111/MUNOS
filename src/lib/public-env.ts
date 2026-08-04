import { z } from "zod";

const publicSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional().default(""),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional().default(""),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().default(""),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .optional()
    .default("http://localhost:3000"),
});

const result = publicSchema.safeParse(process.env);

if (!result.success) {
  console.error(
    "[env] Invalid public environment variables:",
    result.error.flatten().fieldErrors,
  );
}

/** Public-safe environment — safe to import from Client Components. */
export const publicEnv = result.success
  ? result.data
  : ({} as z.infer<typeof publicSchema>);

export const isAuthConfigured = Boolean(
  publicEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY,
);
export const isStorageConfigured = Boolean(
  publicEnv.NEXT_PUBLIC_SUPABASE_URL &&
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
