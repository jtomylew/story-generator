import { NextRequest, NextResponse } from "next/server";
import {
  fetchAggregatedFeed,
  type ArticleInput,
  type ArticleCategory,
} from "@/lib/feeds";
import { diversify } from "@/lib/diversity";
import { filterUnsafe } from "@/lib/safety";

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
    safety_applied: boolean;
    safety_filtered: number;
    lastUpdated: string;
  };
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
    let articles: (ArticleInput & { id: string })[];
    let cacheHit = false;
    let diversityApplied = false;
    let safetyApplied = false;
    let safetyFiltered = 0;

    // Generate mock articles based on categories
    const mockArticles: (ArticleInput & { id: string })[] = [
      {
        id: "mock-article-1",
        title: "Breakthrough in Quantum Computing",
        content:
          "Scientists have made a significant breakthrough in quantum computing technology...",
        source: "Science Daily",
        url: "https://example.com/quantum-computing",
        published_at: new Date().toISOString(),
        category: "science" as ArticleCategory,
      },
      {
        id: "mock-article-2",
        title: "New Species Discovered in Amazon Rainforest",
        content:
          "Researchers have discovered a new species of frog in the Amazon rainforest...",
        source: "Nature News",
        url: "https://example.com/new-species",
        published_at: new Date().toISOString(),
        category: "nature" as ArticleCategory,
      },
      {
        id: "mock-article-3",
        title: "Olympic Games Update",
        content: "The latest updates from the Olympic Games...",
        source: "Sports Central",
        url: "https://example.com/olympics",
        published_at: new Date().toISOString(),
        category: "sports" as ArticleCategory,
      },
      {
        id: "mock-article-4",
        title: "New Art Exhibition Opens",
        content:
          "A new art exhibition featuring contemporary artists opens this week...",
        source: "Arts Weekly",
        url: "https://example.com/art-exhibition",
        published_at: new Date().toISOString(),
        category: "arts" as ArticleCategory,
      },
      {
        id: "mock-article-5",
        title: "Educational Technology Trends",
        content:
          "The latest trends in educational technology are transforming classrooms...",
        source: "EdTech News",
        url: "https://example.com/edtech-trends",
        published_at: new Date().toISOString(),
        category: "education" as ArticleCategory,
      },
      {
        id: "mock-article-6",
        title: "AI Breakthrough in Healthcare",
        content:
          "Artificial intelligence is revolutionizing healthcare with new diagnostic tools...",
        source: "Tech Today",
        url: "https://example.com/ai-healthcare",
        published_at: new Date().toISOString(),
        category: "technology" as ArticleCategory,
      },
      {
        id: "mock-article-7",
        title: "Endangered Species Recovery Program",
        content:
          "A new program is helping endangered species recover in the wild...",
        source: "Wildlife News",
        url: "https://example.com/endangered-species",
        published_at: new Date().toISOString(),
        category: "animals" as ArticleCategory,
      },
      {
        id: "mock-article-8",
        title: "International Peace Treaty Signed",
        content:
          "World leaders have signed a historic peace treaty to end the long-standing conflict between nations. The agreement includes provisions for refugee resettlement and military withdrawal from occupied territories.",
        source: "Global News",
        url: "https://example.com/peace-treaty",
        published_at: new Date().toISOString(),
        category: "positive" as ArticleCategory,
      },
      {
        id: "mock-article-9",
        title: "Domestic Violence Support Program",
        content:
          "A new support program has been launched to help victims of domestic violence and sexual assault. The program provides counseling and legal assistance to survivors.",
        source: "Community News",
        url: "https://example.com/domestic-violence",
        published_at: new Date().toISOString(),
        category: "positive" as ArticleCategory,
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

    // Apply safety filtering FIRST
    const safetyResult = filterUnsafe(articles);
    articles = safetyResult.articles;
    safetyApplied = safetyResult.meta.safetyApplied;
    safetyFiltered = safetyResult.meta.filteredCount;

    // Apply diversity algorithm AFTER safety filtering
    const diversityResult = diversify(articles, {
      maxPerSource: 2,
      freshnessDecayHours: 48,
      categoryRotation: true,
    });
    
    articles = diversityResult.articles;
    diversityApplied = diversityResult.diversityApplied;
    
    // Update applied categories from diversity result
    if (diversityResult.appliedCategories.length > 0) {
      appliedCategories = diversityResult.appliedCategories;
    }

    // Limit to requested amount
    articles = articles.slice(0, limit);

    // Generate last updated timestamp
    const lastUpdated = new Date().toISOString();

    // Check for If-Modified-Since header
    const ifModifiedSince = request.headers.get("if-modified-since");
    if (ifModifiedSince) {
      const lastModified = new Date(ifModifiedSince);
      const currentTime = new Date(lastUpdated);

      // If content hasn't changed in the last 5 minutes, return 304
      if (currentTime.getTime() - lastModified.getTime() < 5 * 60 * 1000) {
        return new NextResponse(null, { status: 304 });
      }
    }

    const response = NextResponse.json({
      articles,
      meta: {
        cache_hit: cacheHit,
        appliedCategories: appliedCategories,
        total: articles.length,
        diversity_applied: diversityApplied,
        safety_applied: safetyApplied,
        safety_filtered: safetyFiltered,
        lastUpdated: lastUpdated,
      },
    } as FeedResponse);

    // Set cache headers
    response.headers.set("X-Cache", cacheHit ? "HIT" : "MISS");
    response.headers.set("Last-Modified", lastUpdated);
    response.headers.set("Cache-Control", "public, max-age=300"); // 5 minutes

    return response;
  } catch (error) {
    console.error("Feed API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
