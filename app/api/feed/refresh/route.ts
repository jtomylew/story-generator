import { NextRequest, NextResponse } from "next/server";
import {
  fetchAggregatedFeed,
  type ArticleInput,
  type ArticleCategory,
} from "@/lib/feeds";
import { getDb, insertArticles } from "@/lib/db";

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

interface RefreshResponse {
  refreshed: string[];
  counts: Record<string, number>;
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
 * GET /api/feed/refresh
 *
 * Query parameters:
 * - category?: ArticleCategory | 'all' (default: 'all')
 * - limit?: number (default: 20)
 *
 * Headers:
 * - x-refresh-key?: string (required if FEED_REFRESH_KEY env var is set)
 */
export async function GET(request: NextRequest) {
  try {
    // Optional authentication check
    const refreshKey = process.env.FEED_REFRESH_KEY;
    if (refreshKey) {
      const providedKey = request.headers.get("x-refresh-key");
      if (providedKey !== refreshKey) {
        return NextResponse.json(
          { error: "Invalid refresh key" },
          { status: 401 },
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");
    const limitParam = searchParams.get("limit");

    // Validate category
    let categories: ArticleCategory[] | undefined;
    if (categoryParam) {
      if (categoryParam === "all") {
        categories = undefined; // All categories
      } else if (VALID_CATEGORIES.includes(categoryParam as ArticleCategory)) {
        categories = [categoryParam as ArticleCategory];
      } else {
        return NextResponse.json(
          {
            error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(
              ", ",
            )} or 'all'`,
          },
          { status: 400 },
        );
      }
    } else {
      categories = undefined; // Default to all categories
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

    // Determine which categories to refresh
    const categoriesToRefresh = categories || VALID_CATEGORIES;
    const refreshed: string[] = [];
    const counts: Record<string, number> = {};

    // Refresh each category in parallel
    const refreshPromises = categoriesToRefresh.map(async (category) => {
      try {
        // Fetch fresh articles for this category
        const result = await fetchAggregatedFeed({
          categories: [category],
          maxTotal: limit * 2, // Fetch more to account for diversity filtering
        });

        if (result.errors.length > 0) {
          console.warn(
            `Feed aggregation errors for ${category}:`,
            result.errors,
          );
        }

        // Apply diversity algorithm (max 2 per source)
        const diverseArticles = applyDiversity(result.items);

        // Sort by published_at DESC (nulls last)
        const sortedArticles = diverseArticles.sort((a, b) => {
          if (!a.published_at && !b.published_at) return 0;
          if (!a.published_at) return 1;
          if (!b.published_at) return -1;
          return (
            new Date(b.published_at).getTime() -
            new Date(a.published_at).getTime()
          );
        });

        // Limit to requested amount
        const finalArticles = sortedArticles.slice(0, limit);

        // Insert articles idempotently (database handles deduplication by url_hash)
        if (finalArticles.length > 0) {
          const insertedCount = await insertArticles(finalArticles);
          counts[category] = insertedCount;
        } else {
          counts[category] = 0;
        }

        // Update feed cache
        const db = getDb();
        const cacheKey = `feed:${category}:${limit}`;
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48); // 48h TTL per ADR-028

        await db
          .from("feed_cache")
          .upsert({
            cache_key: cacheKey,
            payload: finalArticles,
            expires_at: expiresAt.toISOString(),
          })
          .select();

        refreshed.push(category);
        return { category, success: true, count: finalArticles.length };
      } catch (error) {
        console.error(`Error refreshing category ${category}:`, error);
        return { category, success: false, error: error.message };
      }
    });

    // Wait for all refreshes to complete
    const results = await Promise.allSettled(refreshPromises);

    // Process results
    const successful = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => (result as PromiseFulfilledResult<any>).value);

    const failed = results
      .filter((result) => result.status === "rejected")
      .map((result) => (result as PromiseRejectedResult).reason);

    if (failed.length > 0) {
      console.error("Some category refreshes failed:", failed);
    }

    const response = NextResponse.json({
      refreshed,
      counts,
    } as RefreshResponse);

    return response;
  } catch (error) {
    console.error("Feed refresh API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
