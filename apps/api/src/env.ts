import { z } from "zod";

const envSchema = z.object({
  STORAGE_DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  // An empty value (e.g. a blank line in .env) counts as unset.
  MIN_CLI_VERSION: z.preprocess((v) => (v === "" ? undefined : v), z.string().min(1).default("0.0.0")),
});

export function loadEnv(source: Record<string, string | undefined> = process.env) {
  return envSchema.parse(source);
}

export type Env = ReturnType<typeof loadEnv>;
