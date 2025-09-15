import "server-only";
import OpenAI from "openai";
import { env } from "@/lib/env";

// Centralized OpenAI client configuration using validated environment variables
export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export interface ClientOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  seed?: number;
}

export function createClient(opts?: ClientOptions) {
  const client = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    timeout: 30000, // 30 second timeout
  });

  return {
    client,
    async chatCompletionsCreate(
      params: Omit<OpenAI.Chat.Completions.ChatCompletionCreateParams, "model">,
    ) {
      const maxRetries = 3;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await client.chat.completions.create({
            model: opts?.model || "gpt-4o",
            temperature: opts?.temperature || 0.7,
            max_tokens: opts?.maxTokens || 1000,
            seed: opts?.seed,
            ...params,
          });
          return response as OpenAI.Chat.Completions.ChatCompletion;
        } catch (error: any) {
          lastError = error;

          // Retry on rate limits and server errors
          if (
            error.status === 429 ||
            (error.status >= 500 && error.status < 600)
          ) {
            const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff, max 10s
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }

          // Don't retry on client errors (4xx except 429)
          throw error;
        }
      }

      throw lastError;
    },

    // Extension point for streaming (not implemented yet)
    async chatCompletionsCreateStream(
      params: OpenAI.Chat.Completions.ChatCompletionCreateParams,
    ) {
      // TODO: Implement streaming when needed
      throw new Error("Streaming not implemented yet");
    },
  };
}
