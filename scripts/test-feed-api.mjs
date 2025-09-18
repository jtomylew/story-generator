#!/usr/bin/env node

/**
 * Test script for Feed API Endpoint
 * Tests the /api/feed endpoint to verify caching and diversity
 */

async function testFeedAPI() {
  console.log("🔍 Testing Feed API Endpoint...\n");

  const baseUrl = "http://localhost:3000";
  const testUrl = `${baseUrl}/api/feed?limit=5`;

  try {
    console.log("📡 Testing first request (should be MISS)...");
    const response1 = await fetch(testUrl);
    const data1 = await response1.json();
    const cacheHeader1 = response1.headers.get("X-Cache");

    console.log(`   Status: ${response1.status}`);
    console.log(`   X-Cache: ${cacheHeader1}`);
    console.log(`   Articles: ${data1.articles?.length || 0}`);
    console.log(`   Cache Hit: ${data1.meta?.cache_hit}`);
    console.log(`   Diversity Applied: ${data1.meta?.diversity_applied}`);

    if (data1.articles && data1.articles.length > 0) {
      console.log(`\n📰 Sample articles:`);
      data1.articles.slice(0, 3).forEach((article, index) => {
        console.log(`   ${index + 1}. "${article.title}"`);
        console.log(
          `      Source: ${article.source} | Category: ${article.category}`,
        );
      });

      // Check diversity (max 2 per source)
      const sourceCounts = {};
      data1.articles.forEach((article) => {
        sourceCounts[article.source] = (sourceCounts[article.source] || 0) + 1;
      });

      console.log(`\n📊 Source distribution:`);
      Object.entries(sourceCounts).forEach(([source, count]) => {
        console.log(`   ${source}: ${count} articles`);
      });

      const maxPerSource = Math.max(...Object.values(sourceCounts));
      console.log(`   Max per source: ${maxPerSource} (should be ≤ 2)`);
    }

    console.log(`\n⏱️  Waiting 2 seconds before second request...`);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log(`\n📡 Testing second request (should be HIT)...`);
    const response2 = await fetch(testUrl);
    const data2 = await response2.json();
    const cacheHeader2 = response2.headers.get("X-Cache");

    console.log(`   Status: ${response2.status}`);
    console.log(`   X-Cache: ${cacheHeader2}`);
    console.log(`   Articles: ${data2.articles?.length || 0}`);
    console.log(`   Cache Hit: ${data2.meta?.cache_hit}`);

    // Verify cache behavior
    if (cacheHeader1 === "MISS" && cacheHeader2 === "HIT") {
      console.log(`\n✅ Cache behavior verified: MISS → HIT`);
    } else {
      console.log(
        `\n⚠️  Unexpected cache behavior: ${cacheHeader1} → ${cacheHeader2}`,
      );
    }

    // Test category filter
    console.log(`\n📡 Testing category filter (science)...`);
    const categoryUrl = `${baseUrl}/api/feed?category=science&limit=3`;
    const response3 = await fetch(categoryUrl);
    const data3 = await response3.json();

    console.log(`   Status: ${response3.status}`);
    console.log(`   Articles: ${data3.articles?.length || 0}`);
    console.log(`   Category: ${data3.meta?.category}`);

    if (data3.articles && data3.articles.length > 0) {
      const allScience = data3.articles.every(
        (article) => article.category === "science",
      );
      console.log(`   All articles are science: ${allScience}`);
    }

    console.log(`\n✅ Feed API test completed successfully!`);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("\n💡 Make sure the dev server is running: npm run dev");
    process.exit(1);
  }
}

// Run the test
testFeedAPI().catch((error) => {
  console.error("❌ Test failed:", error.message);
  process.exit(1);
});
