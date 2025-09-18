#!/usr/bin/env node

/**
 * Test script for Feed Refresh API Endpoint
 * Tests the /api/feed/refresh endpoint to verify refresh behavior
 */

async function testFeedRefresh() {
  console.log("🔍 Testing Feed Refresh API Endpoint...\n");

  const baseUrl = "http://localhost:3000";

  try {
    // Test 1: Refresh all categories with default limit
    console.log("📡 Testing refresh all categories (default limit)...");
    const refreshUrl1 = `${baseUrl}/api/feed/refresh`;
    const response1 = await fetch(refreshUrl1);
    const data1 = await response1.json();

    console.log(`   Status: ${response1.status}`);
    console.log(
      `   Refreshed categories: ${data1.refreshed?.join(", ") || "none"}`,
    );
    console.log(`   Article counts:`);
    if (data1.counts) {
      Object.entries(data1.counts).forEach(([category, count]) => {
        console.log(`     ${category}: ${count} articles`);
      });
    }

    // Test 2: Refresh specific category with custom limit
    console.log(`\n📡 Testing refresh specific category (science, limit=5)...`);
    const refreshUrl2 = `${baseUrl}/api/feed/refresh?category=science&limit=5`;
    const response2 = await fetch(refreshUrl2);
    const data2 = await response2.json();

    console.log(`   Status: ${response2.status}`);
    console.log(
      `   Refreshed categories: ${data2.refreshed?.join(", ") || "none"}`,
    );
    console.log(`   Article counts:`);
    if (data2.counts) {
      Object.entries(data2.counts).forEach(([category, count]) => {
        console.log(`     ${category}: ${count} articles`);
      });
    }

    // Test 3: Verify cache behavior after refresh
    console.log(`\n📡 Testing cache behavior after refresh...`);
    const feedUrl = `${baseUrl}/api/feed?category=science&limit=5`;

    // First request should be HIT (from refresh)
    const feedResponse1 = await fetch(feedUrl);
    const feedData1 = await feedResponse1.json();
    const cacheHeader1 = feedResponse1.headers.get("X-Cache");

    console.log(`   Feed API Status: ${feedResponse1.status}`);
    console.log(`   X-Cache: ${cacheHeader1}`);
    console.log(`   Articles: ${feedData1.articles?.length || 0}`);
    console.log(`   Cache Hit: ${feedData1.meta?.cache_hit}`);

    // Second request should also be HIT
    const feedResponse2 = await fetch(feedUrl);
    const feedData2 = await feedResponse2.json();
    const cacheHeader2 = feedResponse2.headers.get("X-Cache");

    console.log(`   Second request X-Cache: ${cacheHeader2}`);
    console.log(`   Second request Cache Hit: ${feedData2.meta?.cache_hit}`);

    // Verify cache behavior
    if (cacheHeader1 === "HIT" && cacheHeader2 === "HIT") {
      console.log(`\n✅ Cache behavior verified: HIT → HIT (refresh working)`);
    } else {
      console.log(
        `\n⚠️  Unexpected cache behavior: ${cacheHeader1} → ${cacheHeader2}`,
      );
    }

    // Test 4: Test invalid category
    console.log(`\n📡 Testing invalid category...`);
    const invalidUrl = `${baseUrl}/api/feed/refresh?category=invalid`;
    const invalidResponse = await fetch(invalidUrl);
    const invalidData = await invalidResponse.json();

    console.log(`   Status: ${invalidResponse.status}`);
    console.log(`   Error: ${invalidData.error || "none"}`);

    if (invalidResponse.status === 400) {
      console.log(`   ✅ Invalid category properly rejected`);
    } else {
      console.log(`   ⚠️  Expected 400 status for invalid category`);
    }

    // Test 5: Test invalid limit
    console.log(`\n📡 Testing invalid limit...`);
    const invalidLimitUrl = `${baseUrl}/api/feed/refresh?limit=100`;
    const invalidLimitResponse = await fetch(invalidLimitUrl);
    const invalidLimitData = await invalidLimitResponse.json();

    console.log(`   Status: ${invalidLimitResponse.status}`);
    console.log(`   Error: ${invalidLimitData.error || "none"}`);

    if (invalidLimitResponse.status === 400) {
      console.log(`   ✅ Invalid limit properly rejected`);
    } else {
      console.log(`   ⚠️  Expected 400 status for invalid limit`);
    }

    console.log(`\n✅ Feed Refresh API test completed successfully!`);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("\n💡 Make sure the dev server is running: npm run dev");
    process.exit(1);
  }
}

// Run the test
testFeedRefresh().catch((error) => {
  console.error("❌ Test failed:", error.message);
  process.exit(1);
});
