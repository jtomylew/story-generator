import "server-only";
import { createHash } from "crypto";
import {
  RSSFeedParser,
  normalizeUrl,
  type ArticleInput,
  type ArticleCategory,
} from "./rss";

// Extended curated feeds with more sources for better diversity
export const CURATED_FEEDS: Record<ArticleCategory, string[]> = {
  science: [
    "https://www.sciencedaily.com/rss/all.xml",
    "https://feeds.feedburner.com/ScienceDaily",
  ],
  positive: [
    "https://www.goodnewsnetwork.org/feed/",
    "https://feeds.feedburner.com/GoodNewsNetwork",
  ],
  education: [
    "https://www.edutopia.org/rss.xml",
    "https://feeds.feedburner.com/Edutopia",
  ],
  nature: [
    "https://www.nationalgeographic.com/kids/feed/",
    "https://feeds.nationalgeographic.com/ng/News/News_Main",
  ],
  sports: [
    "https://www.si.com/rss/si_kids.rss",
    "https://feeds.feedburner.com/SportsIllustrated",
  ],
  arts: [
    "https://www.arts.gov/rss.xml",
    "https://feeds.feedburner.com/ArtsJournal",
  ],
  technology: [
    "https://feeds.feedburner.com/TechCrunch",
    "https://feeds.feedburner.com/ArsTechnica",
  ],
  animals: [
    "https://www.nationalgeographic.com/animals/feed/",
    "https://feeds.feedburner.com/NationalGeographicAnimals",
  ],
} as const;

export interface AggregatedOptions {
  categories?: ArticleCategory[];
  perSourceCap?: number;
  perCategoryCap?: number;
  maxTotal?: number;
}

export interface AggregatedResult {
  items: ArticleInput[];
  errors: Array<{ url: string; message: string }>;
}

/**
 * Fetch and aggregate articles from multiple RSS feeds
 */
export async function fetchAggregatedFeed(
  options: AggregatedOptions = {},
): Promise<AggregatedResult> {
  const {
    categories = Object.keys(CURATED_FEEDS) as ArticleCategory[],
    maxTotal = 50,
  } = options;

  const parser = new RSSFeedParser();
  const allArticles: ArticleInput[] = [];
  const errors: Array<{ url: string; message: string }> = [];

  // Collect all feed URLs for the requested categories
  const feedUrls: Array<{ url: string; category: ArticleCategory }> = [];
  for (const category of categories) {
    const feeds = CURATED_FEEDS[category];
    if (feeds) {
      for (const url of feeds) {
        feedUrls.push({ url, category });
      }
    }
  }

  // Fetch all feeds in parallel using Promise.allSettled
  const feedPromises = feedUrls.map(async ({ url, category }) => {
    try {
      const articles = await parser.parseFeed(url, category);
      return { articles, url, category };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errors.push({ url, message });
      return { articles: [], url, category };
    }
  });

  const results = await Promise.allSettled(feedPromises);

  // Collect all articles from successful fetches
  for (const result of results) {
    if (result.status === "fulfilled" && result.value.articles.length > 0) {
      allArticles.push(...result.value.articles);
    }
  }

  // Deduplicate by URL hash (same as database url_hash)
  const seenHashes = new Set<string>();
  const deduplicatedArticles: ArticleInput[] = [];

  for (const article of allArticles) {
    const normalizedUrl = normalizeUrl(article.url);
    if (!normalizedUrl) continue;

    const urlHash = createHash("sha256").update(normalizedUrl).digest("hex");

    if (!seenHashes.has(urlHash)) {
      seenHashes.add(urlHash);
      deduplicatedArticles.push(article);
    }
  }

  // Sort by published_at DESC (nulls last, stable sort)
  const sortedArticles = deduplicatedArticles.sort((a, b) => {
    // Handle null/undefined published_at by pushing to end
    if (!a.published_at && !b.published_at) return 0;
    if (!a.published_at) return 1;
    if (!b.published_at) return -1;

    // Sort by date descending (newest first)
    return (
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
  });

  // Apply maxTotal limit
  const finalArticles = sortedArticles.slice(0, maxTotal);

  return {
    items: finalArticles,
    errors,
  };
}

/**
 * Get source statistics from aggregated articles
 */
export function getSourceStats(
  articles: ArticleInput[],
): Record<string, number> {
  const stats: Record<string, number> = {};

  for (const article of articles) {
    stats[article.source] = (stats[article.source] || 0) + 1;
  }

  return stats;
}
