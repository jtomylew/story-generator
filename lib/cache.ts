import { GenerateRes } from "@/lib/schema";

interface CacheEntry {
  data: GenerateRes;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

// Simple in-memory cache with TTL
const cache = new Map<string, CacheEntry>();

const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function get(key: string): GenerateRes | null {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  // Check if entry has expired
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function set(
  key: string,
  data: GenerateRes,
  ttl: number = DEFAULT_TTL,
): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

export function clear(): void {
  cache.clear();
}

export function size(): number {
  return cache.size;
}
