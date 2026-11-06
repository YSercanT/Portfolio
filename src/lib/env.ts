import "server-only";
import { z } from "zod";

// Server settings from env vars. They're checked the first time something reads
// them, so the build works without secrets but a bad config still fails early.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),

  PLAYGROUND_RATE_LIMIT: z.coerce.number().int().positive().default(20),
  PLAYGROUND_RATE_WINDOW_SEC: z.coerce.number().int().positive().default(60),
  LOGIN_RATE_LIMIT: z.coerce.number().int().positive().default(5),
  LOGIN_RATE_WINDOW_SEC: z.coerce.number().int().positive().default(900),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}
