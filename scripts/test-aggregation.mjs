#!/usr/bin/env node

/**
 * Test script for Multi-Source Aggregation
 * Tests fetching and aggregating articles from multiple RSS feeds
 */

import Parser from "rss-parser";
import { createHash } from "crypto";

// Simplified test implementation without server-only imports
const CURATED_FEEDS = {
  science: ["https://www.sciencedaily.com/rss/all.xml"],
  positive: ["https://www.goodnewsnetwork.org/feed/"],
  education: ["https://www.edutopia.org/rss.xml"],
  nature: ["https://www.nationalgeographic.com/kids/feed/"],
  sports: ["https://www.si.com/rss/si_kids.rss"],
};

function normalizeUrl(url) {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname.toLowerCase()}${urlObj.pathname}`;
  } catch {
    return null;
  }
}

function extractSource(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

function cleanContent(content) {
  return content
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function testAggregation() {
  console.log("🔍 Testing Multi-Source Aggregation...\n");

  const parser = new Parser({
    timeout: 10000,
    headers: {
      "User-Agent": "Story Generator RSS Parser/1.0",
    },
  });

  const allArticles = [];
  const errors = [];

  // Collect all feed URLs
  const feedUrls = [];
  for (const [category, feeds] of Object.entries(CURATED_FEEDS)) {
    for (const url of feeds) {
      feedUrls.push({ url, category });
    }
  }

  console.log(`📡 Fetching ${feedUrls.length} feeds in parallel...`);

  // Fetch all feeds in parallel
  const feedPromises = feedUrls.map(async ({ url, category }) => {
    try {
      const feed = await parser.parseURL(url);
      const articles = [];

      for (const item of feed.items) {
        if (!item.link || !item.title) continue;

        const normalizedUrl = normalizeUrl(item.link);
        if (!normalizedUrl) continue;

        const source = extractSource(normalizedUrl);
        const content = cleanContent(item.contentSnippet || item.content || "");
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

      return { articles, url, category };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errors.push({ url, message });
      return { articles: [], url, category };
    }
  });

  const results = await Promise.allSettled(feedPromises);

  // Collect all articles
  for (const result of results) {
    if (result.status === "fulfilled" && result.value.articles.length > 0) {
      allArticles.push(...result.value.articles);
    }
  }

  // Deduplicate by URL hash
  const seenHashes = new Set();
  const deduplicatedArticles = [];

  for (const article of allArticles) {
    const normalizedUrl = normalizeUrl(article.url);
    if (!normalizedUrl) continue;

    const urlHash = createHash("sha256").update(normalizedUrl).digest("hex");

    if (!seenHashes.has(urlHash)) {
      seenHashes.add(urlHash);
      deduplicatedArticles.push(article);
    }
  }

  // Sort by published_at DESC (nulls last)
  const sortedArticles = deduplicatedArticles.sort((a, b) => {
    if (!a.published_at && !b.published_at) return 0;
    if (!a.published_at) return 1;
    if (!b.published_at) return -1;
    return (
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
  });

  // Apply limit
  const finalArticles = sortedArticles.slice(0, 20);

  console.log(`📊 Results:`);
  console.log(`   Total items: ${finalArticles.length}`);
  console.log(`   Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log(`\n❌ Feed Errors:`);
    errors.forEach(({ url, message }) => {
      console.log(`   ${url}: ${message}`);
    });
  }

  if (finalArticles.length > 0) {
    // Get source statistics
    const sourceStats = {};
    for (const article of finalArticles) {
      sourceStats[article.source] = (sourceStats[article.source] || 0) + 1;
    }

    const topSources = Object.entries(sourceStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    console.log(`\n📈 Top 3 sources by count:`);
    topSources.forEach(([source, count]) => {
      console.log(`   ${source}: ${count} articles`);
    });

    console.log(`\n📰 Sample articles:`);
    finalArticles.slice(0, 3).forEach((article, index) => {
      console.log(`   ${index + 1}. "${article.title}"`);
      console.log(
        `      Source: ${article.source} | Category: ${article.category}`,
      );
      console.log(`      Published: ${article.published_at || "N/A"}`);
      console.log(`      URL: ${article.url}\n`);
    });
  }

  console.log(`✅ Aggregation test completed successfully!`);

  if (finalArticles.length === 0) {
    console.log(
      "⚠️  No articles were aggregated. Check network connectivity and feed URLs.",
    );
    process.exit(1);
  }
}

// Run the test
testAggregation().catch((error) => {
  console.error("❌ Test failed:", error.message);
  process.exit(1);
});
