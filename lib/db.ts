import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { env } from "./env";

// Server-only database client using service role key
export function getDb() {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase environment variables not configured");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Article types
export type ArticleCategory =
  | "science"
  | "nature"
  | "sports"
  | "arts"
  | "education"
  | "technology"
  | "animals"
  | "positive";

export interface ArticleInput {
  url: string;
  title: string;
  content: string;
  source: string;
  category: ArticleCategory;
  published_at?: string;
}

export interface Article {
  id: string;
  url: string;
  url_hash: string;
  title: string;
  content: string;
  source: string;
  category: ArticleCategory;
  published_at: string | null;
  extracted_at: string;
  meta: Record<string, any>;
}

// Article helper functions
export async function insertArticles(rows: ArticleInput[]): Promise<number> {
  const db = getDb();

  const { data, error } = await db
    .from("articles")
    .insert(
      rows.map((row) => ({
        url: row.url,
        title: row.title,
        content: row.content,
        source: row.source,
        category: row.category,
        published_at: row.published_at || null,
      })),
    )
    .select("id");

  if (error) {
    throw new Error(`Failed to insert articles: ${error.message}`);
  }

  return data?.length || 0;
}

export async function getRecentArticles(params: {
  category?: string;
  limit?: number;
  source?: string;
}): Promise<Article[]> {
  const db = getDb();

  let query = db
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false });

  if (params.category) {
    query = query.eq("category", params.category);
  }

  if (params.source) {
    query = query.eq("source", params.source);
  }

  if (params.limit) {
    query = query.limit(params.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch articles: ${error.message}`);
  }

  return data || [];
}

// Conversion tracking types
export interface ConvertedArticle {
  id: string;
  device_id: string;
  article_hash: string;
  story_id: string;
  converted_at: string;
}

// Conversion tracking functions
/**
 * Generate a stable hash for an article (SHA-256 of URL or source+title)
 * Used for deduplication and tracking converted articles
 */
export function hashArticle(article: ArticleInput): string {
  // Use URL if available, otherwise fall back to source+title
  const content = article.url || `${article.source}:${article.title}`;
  return createHash("sha256").update(content).digest("hex");
}

/**
 * Mark an article as converted by a device
 * Creates a record in converted_articles table
 */
export async function markArticleConverted(
  deviceId: string,
  articleHash: string,
  storyId: string,
): Promise<void> {
  const db = getDb();

  const { error } = await db.from("converted_articles").insert({
    device_id: deviceId,
    article_hash: articleHash,
    story_id: storyId,
  });

  if (error) {
    // If it's a unique constraint violation, that's okay (already converted)
    if (error.code === "23505") {
      console.log(`Article already converted by device ${deviceId}`);
      return;
    }
    throw new Error(`Failed to mark article as converted: ${error.message}`);
  }
}

/**
 * Get all article hashes that have been converted by a device
 * Returns a Set for efficient lookup
 */
export async function getConvertedHashes(
  deviceId: string,
): Promise<Set<string>> {
  const db = getDb();

  const { data, error } = await db
    .from("converted_articles")
    .select("article_hash")
    .eq("device_id", deviceId);

  if (error) {
    throw new Error(`Failed to fetch converted articles: ${error.message}`);
  }

  return new Set(data?.map((row) => row.article_hash) || []);
}

/**
 * Get conversion history for a device
 * Returns full conversion records with story details
 */
export async function getConversionHistory(
  deviceId: string,
  limit: number = 50,
): Promise<ConvertedArticle[]> {
  const db = getDb();

  const { data, error } = await db
    .from("converted_articles")
    .select("*")
    .eq("device_id", deviceId)
    .order("converted_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch conversion history: ${error.message}`);
  }

  return data || [];
}
