import { NextRequest, NextResponse } from "next/server";
import {
  fetchAggregatedFeed,
  type ArticleInput,
  type ArticleCategory,
} from "@/lib/feeds";
import { getDb } from "@/lib/db";

// Valid categories from our enum
const VALID_CATEGORIES: ArticleCategory[] = [
  "science",
  "nature",
  "sports",
  "arts",
  "education",
  "technology",
  "animals",
  "positive",
];

interface FeedResponse {
  articles: ArticleInput[];
  meta: {
    cache_hit: boolean;
    appliedCategories: string[];
    total: number;
    diversity_applied: boolean;
  };
}

/**
 * Apply diversity algorithm: max 2 articles per source
 */
function applyDiversity(articles: ArticleInput[]): ArticleInput[] {
  const sourceCounts: Record<string, number> = {};
  const diverseArticles: ArticleInput[] = [];

  for (const article of articles) {
    const source = article.source;
    const currentCount = sourceCounts[source] || 0;

    if (currentCount < 2) {
      sourceCounts[source] = currentCount + 1;
      diverseArticles.push(article);
    }
  }

  return diverseArticles;
}

/**
 * GET /api/feed
 *
 * Query parameters:
 * - categories?: string (comma-separated list of categories, default: all categories)
 * - limit?: number (default: 20, max: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoriesParam = searchParams.get("categories");
    const limitParam = searchParams.get("limit");

    // Parse and validate categories
    let appliedCategories: string[] = [];
    if (categoriesParam) {
      const categories = categoriesParam
        .split(",")
        .map((c) => c.trim().toLowerCase())
        .filter((c) => c.length > 0);

      // Validate each category
      const invalidCategories = categories.filter(
        (c) => !VALID_CATEGORIES.includes(c as ArticleCategory),
      );
      if (invalidCategories.length > 0) {
        return NextResponse.json(
          {
            error: `Invalid categories: ${invalidCategories.join(", ")}. Must be one of: ${VALID_CATEGORIES.join(", ")}`,
          },
          { status: 400 },
        );
      }

      appliedCategories = categories;
    }

    // Validate and set limit
    let limit = 20; // default
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
        return NextResponse.json(
          { error: "Limit must be a number between 1 and 50" },
          { status: 400 },
        );
      }
      limit = parsedLimit;
    }

    // Generate cache key
    const cacheKey = `feed:${appliedCategories.length > 0 ? appliedCategories.sort().join(",") : "all"}:${limit}`;

    // Check cache first
    const db = getDb();
    const { data: cachedData, error: cacheError } = await db
      .from("feed_cache")
      .select("*")
      .eq("cache_key", cacheKey)
      .gt("expires_at", new Date().toISOString())
      .single();

    let articles: ArticleInput[];
    let cacheHit = false;
    let diversityApplied = false;

    if (cachedData && !cacheError) {
      // Cache hit
      cacheHit = true;
      articles = cachedData.payload as ArticleInput[];
    } else {
      // Cache miss - fetch fresh data
      const categories =
        appliedCategories.length > 0
          ? (appliedCategories as ArticleCategory[])
          : undefined;
      const result = await fetchAggregatedFeed({
        categories,
        maxTotal: limit * 2, // Fetch more to account for diversity filtering
      });

      if (result.errors.length > 0) {
        console.warn("Feed aggregation errors:", result.errors);
      }

      // Apply diversity algorithm (max 2 per source)
      articles = applyDiversity(result.items);
      diversityApplied = true;

      // Limit to requested amount
      articles = articles.slice(0, limit);

      // Cache the result with 1 hour TTL
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await db
        .from("feed_cache")
        .upsert({
          cache_key: cacheKey,
          payload: articles,
          expires_at: expiresAt.toISOString(),
        })
        .select();
    }

    const response = NextResponse.json({
      articles,
      meta: {
        cache_hit: cacheHit,
        appliedCategories: appliedCategories,
        total: articles.length,
        diversity_applied: diversityApplied,
      },
    } as FeedResponse);

    // Set cache header
    response.headers.set("X-Cache", cacheHit ? "HIT" : "MISS");

    return response;
  } catch (error) {
    console.error("Feed API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
