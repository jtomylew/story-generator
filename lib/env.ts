import "server-only";
import { z } from "zod";

const EnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, "Missing OPENAI_API_KEY"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Story Weaver"),
  NODE_ENV: z.enum(["development","test","production"]).default("development"),
  DATABASE_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
});

const parsed = EnvSchema.safeParse({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  SENTRY_DSN: process.env.SENTRY_DSN,
});

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables. See server logs for details.");
}

export const env = parsed.data;
