import "server-only";
import OpenAI from 'openai';
import { env } from '@/lib/env';

// Centralized OpenAI client configuration using validated environment variables
export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});
