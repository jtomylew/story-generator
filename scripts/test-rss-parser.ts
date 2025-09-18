#!/usr/bin/env node

/**
 * Test script for RSS Parser
 * Tests parsing of curated feeds and displays results
 */

import Parser from "rss-parser";

// Simple RSS parser for testing (without server-only imports)
class TestRSSParser {
  private parser: Parser;

  constructor() {
    this.parser = new Parser({
      timeout: 10000,
      headers: {
        "User-Agent": "Story Generator RSS Parser/1.0",
      },
    });
  }

  async parseFeed(feedUrl: string, category: string) {
    try {
      const feed = await this.parser.parseURL(feedUrl);
      const articles: any[] = [];

      for (const item of feed.items) {
        if (!item.link || !item.title) {
          continue;
        }

        // Normalize URL
        const normalizedUrl = this.normalizeUrl(item.link);
        if (!normalizedUrl) {
          continue;
        }

        // Extract source
        const source = this.extractSource(normalizedUrl);

        // Clean content
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

  private normalizeUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname.toLowerCase()}${urlObj.pathname}`;
    } catch {
      return null;
    }
  }

  private extractSource(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.toLowerCase().replace(/^www\./, "");
    } catch {
      return "unknown";
    }
  }

  private cleanContent(content: string): string {
    return content
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
}

async function testRSSParser() {
  console.log("🔍 Testing RSS Parser...\n");

  const parser = new TestRSSParser();
  let totalArticles = 0;

  // Test Science Daily feed
  try {
    console.log("📰 Testing Science Daily feed (science category):");
    const scienceArticles = await parser.parseFeed(
      "https://www.sciencedaily.com/rss/all.xml",
      "science",
    );
    console.log(`   Found ${scienceArticles.length} articles`);

    if (scienceArticles.length > 0) {
      const sample = scienceArticles[0];
      console.log(`   Sample: "${sample.title}"`);
      console.log(`   Source: ${sample.source}`);
      console.log(`   URL: ${sample.url}`);
      console.log(`   Published: ${sample.published_at || "N/A"}\n`);
    }
    totalArticles += scienceArticles.length;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test Good News Network feed
  try {
    console.log("📰 Testing Good News Network feed (positive category):");
    const positiveArticles = await parser.parseFeed(
      "https://www.goodnewsnetwork.org/feed/",
      "positive",
    );
    console.log(`   Found ${positiveArticles.length} articles`);

    if (positiveArticles.length > 0) {
      const sample = positiveArticles[0];
      console.log(`   Sample: "${sample.title}"`);
      console.log(`   Source: ${sample.source}`);
      console.log(`   URL: ${sample.url}`);
      console.log(`   Published: ${sample.published_at || "N/A"}\n`);
    }
    totalArticles += positiveArticles.length;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  console.log(
    `✅ RSS Parser test completed. Total articles parsed: ${totalArticles}`,
  );

  if (totalArticles === 0) {
    console.log(
      "⚠️  No articles were parsed. Check network connectivity and feed URLs.",
    );
    process.exit(1);
  }
}

// Run the test
testRSSParser().catch((error) => {
  console.error("❌ Test failed:", error.message);
  process.exit(1);
});
