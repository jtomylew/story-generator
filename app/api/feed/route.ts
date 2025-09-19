import { NextRequest, NextResponse } from "next/server";
import {
  fetchAggregatedFeed,
  type ArticleInput,
  type ArticleCategory,
} from "@/lib/feeds";

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

    // For now, skip cache and return mock data for testing
    let articles: ArticleInput[];
    let cacheHit = false;
    let diversityApplied = false;

    // Generate mock articles based on categories
    const mockArticles: ArticleInput[] = [
      {
        title: "Breakthrough in Quantum Computing",
        content:
          "Scientists have made a significant breakthrough in quantum computing technology...",
        source: "Science Daily",
        url: "https://example.com/quantum-computing",
        published_at: new Date().toISOString(),
        category: "science" as ArticleCategory,
      },
      {
        title: "New Species Discovered in Amazon Rainforest",
        content:
          "Researchers have discovered a new species of frog in the Amazon rainforest...",
        source: "Nature News",
        url: "https://example.com/new-species",
        published_at: new Date().toISOString(),
        category: "nature" as ArticleCategory,
      },
      {
        title: "Olympic Games Update",
        content: "The latest updates from the Olympic Games...",
        source: "Sports Central",
        url: "https://example.com/olympics",
        published_at: new Date().toISOString(),
        category: "sports" as ArticleCategory,
      },
      {
        title: "New Art Exhibition Opens",
        content:
          "A new art exhibition featuring contemporary artists opens this week...",
        source: "Arts Weekly",
        url: "https://example.com/art-exhibition",
        published_at: new Date().toISOString(),
        category: "arts" as ArticleCategory,
      },
      {
        title: "Educational Technology Trends",
        content:
          "The latest trends in educational technology are transforming classrooms...",
        source: "EdTech News",
        url: "https://example.com/edtech-trends",
        published_at: new Date().toISOString(),
        category: "education" as ArticleCategory,
      },
      {
        title: "AI Breakthrough in Healthcare",
        content:
          "Artificial intelligence is revolutionizing healthcare with new diagnostic tools...",
        source: "Tech Today",
        url: "https://example.com/ai-healthcare",
        published_at: new Date().toISOString(),
        category: "technology" as ArticleCategory,
      },
      {
        title: "Endangered Species Recovery Program",
        content:
          "A new program is helping endangered species recover in the wild...",
        source: "Wildlife News",
        url: "https://example.com/endangered-species",
        published_at: new Date().toISOString(),
        category: "animals" as ArticleCategory,
      },
    ];

    // Filter articles by categories if specified
    if (appliedCategories.length > 0) {
      articles = mockArticles.filter((article) =>
        appliedCategories.includes(article.category),
      );
    } else {
      articles = mockArticles;
    }

    // Limit to requested amount
    articles = articles.slice(0, limit);

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
