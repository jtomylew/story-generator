import { createClient } from "@supabase/supabase-js";
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
