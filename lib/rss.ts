import "server-only";
import Parser from "rss-parser";
import type { ArticleInput, ArticleCategory } from "./db";

// Re-export types for use in other modules
export type { ArticleInput, ArticleCategory } from "./db";

// RSS Feed Parser for news article aggregation
export class RSSFeedParser {
  private parser: Parser;

  constructor() {
    this.parser = new Parser({
      timeout: 10000, // 10 second timeout
      headers: {
        "User-Agent": "Story Generator RSS Parser/1.0",
      },
    });
  }

  /**
   * Parse RSS feed and return normalized articles ready for database insertion
   */
  async parseFeed(
    feedUrl: string,
    forcedCategory?: ArticleCategory,
  ): Promise<ArticleInput[]> {
    try {
      const feed = await this.parser.parseURL(feedUrl);
      const articles: ArticleInput[] = [];

      for (const item of feed.items) {
        if (!item.link || !item.title) {
          continue; // Skip items without required fields
        }

        // Normalize URL: lowercase, strip query/fragment
        const normalizedUrl = this.normalizeUrl(item.link);
        if (!normalizedUrl) {
          continue; // Skip invalid URLs
        }

        // Extract source from URL (canonical domain, no www)
        const source = this.extractSource(normalizedUrl);

        // Determine category
        const category = forcedCategory || this.inferCategory(item, source);

        // Clean content (strip HTML if present)
        const content = this.cleanContent(
          item.contentSnippet || item.content || "",
        );

        // Parse published date
        const publishedAt = item.pubDate
          ? new Date(item.pubDate).toISOString()
          : undefined;

        articles.push({
          url: normalizedUrl,
          title: item.title.trim(),
          content: content.trim(),
          source,
          category,
          published_at: publishedAt,
        });
      }

      return articles;
    } catch (error) {
      throw new Error(
        `Failed to parse RSS feed ${feedUrl}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Normalize URL: lowercase, strip query parameters and fragments
   */
  normalizeUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname.toLowerCase()}${urlObj.pathname}`;
    } catch {
      return null;
    }
  }

  /**
   * Extract canonical domain from URL (remove www prefix)
   */
  private extractSource(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.toLowerCase().replace(/^www\./, "");
    } catch {
      return "unknown";
    }
  }

  /**
   * Infer category from item content and source
   */
  private inferCategory(item: any, source: string): ArticleCategory {
    const title = (item.title || "").toLowerCase();
    const content = (item.contentSnippet || item.content || "").toLowerCase();
    const text = `${title} ${content}`;

    // Source-based categorization
    if (source.includes("sciencedaily")) return "science";
    if (source.includes("goodnewsnetwork")) return "positive";
    if (source.includes("edutopia")) return "education";
    if (source.includes("nationalgeographic")) return "nature";
    if (source.includes("si.com")) return "sports";

    // Content-based categorization
    if (
      text.includes("science") ||
      text.includes("research") ||
      text.includes("study")
    ) {
      return "science";
    }
    if (
      text.includes("nature") ||
      text.includes("animal") ||
      text.includes("environment")
    ) {
      return "nature";
    }
    if (
      text.includes("sport") ||
      text.includes("game") ||
      text.includes("team")
    ) {
      return "sports";
    }
    if (
      text.includes("art") ||
      text.includes("music") ||
      text.includes("creative")
    ) {
      return "arts";
    }
    if (
      text.includes("school") ||
      text.includes("student") ||
      text.includes("learn")
    ) {
      return "education";
    }
    if (
      text.includes("tech") ||
      text.includes("computer") ||
      text.includes("digital")
    ) {
      return "technology";
    }
    if (
      text.includes("good news") ||
      text.includes("positive") ||
      text.includes("happy")
    ) {
      return "positive";
    }

    // Default fallback
    return "science";
  }

  /**
   * Clean content by stripping HTML tags and normalizing whitespace
   */
  private cleanContent(content: string): string {
    return content
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  }
}

/**
 * Standalone URL normalization function for reuse across modules
 */
export function normalizeUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname.toLowerCase()}${urlObj.pathname}`;
  } catch {
    return null;
  }
}

// Curated RSS feeds for different categories
export const CURATED_FEEDS = {
  science: ["https://www.sciencedaily.com/rss/all.xml"],
  positive: ["https://www.goodnewsnetwork.org/feed/"],
  education: ["https://www.edutopia.org/rss.xml"],
  nature: ["https://www.nationalgeographic.com/kids/feed/"],
  sports: ["https://www.si.com/rss/si_kids.rss"],
} as const;
