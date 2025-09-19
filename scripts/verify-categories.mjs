#!/usr/bin/env node

/**
 * Category Filtering Verification Script
 *
 * Tests the category filtering functionality:
 * - /api/feed returns meta object with appliedCategories
 * - ?categories filters correctly
 * - appliedCategories matches request
 * - Error handling for invalid categories
 * - Performance checks
 */

import { readFileSync } from "fs";
import { join } from "path";

const PROJECT_ROOT = process.cwd();
const BASE_URL = "http://localhost:3000";

// Test cases
const TEST_CASES = [
  {
    name: "No categories (all)",
    url: "/api/feed",
    expectedCategories: [],
  },
  {
    name: "Single category",
    url: "/api/feed?categories=science",
    expectedCategories: ["science"],
  },
  {
    name: "Multiple categories",
    url: "/api/feed?categories=science,technology",
    expectedCategories: ["science", "technology"],
  },
  {
    name: "Categories with whitespace",
    url: "/api/feed?categories=science, technology",
    expectedCategories: ["science", "technology"],
  },
  {
    name: "Case insensitive",
    url: "/api/feed?categories=Science,TECHNOLOGY",
    expectedCategories: ["science", "technology"],
  },
  {
    name: "Empty string",
    url: "/api/feed?categories=",
    expectedCategories: [],
  },
];

const ERROR_TEST_CASES = [
  {
    name: "Invalid category",
    url: "/api/feed?categories=invalid",
    expectedStatus: 400,
  },
  {
    name: "Mixed valid/invalid categories",
    url: "/api/feed?categories=science,invalid,technology",
    expectedStatus: 400,
  },
];

async function makeRequest(url) {
  const fullUrl = `${BASE_URL}${url}`;
  const startTime = Date.now();

  try {
    const response = await fetch(fullUrl);
    const duration = Date.now() - startTime;
    const data = await response.json();

    return {
      status: response.status,
      data,
      duration,
      success: response.ok,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      status: 0,
      data: null,
      duration,
      success: false,
      error: error.message,
    };
  }
}

async function verifyCategoryFiltering() {
  console.log("🔍 Verifying Category Filtering (Chunk 9)...\n");

  let allTestsPassed = true;
  let totalTests = 0;
  let passedTests = 0;

  // Test valid category filtering
  console.log("📋 Testing valid category filtering:");
  for (const testCase of TEST_CASES) {
    totalTests++;
    console.log(`\n${totalTests}. ${testCase.name}`);
    console.log(`   URL: ${testCase.url}`);

    const result = await makeRequest(testCase.url);

    if (!result.success) {
      console.error(
        `   ❌ Request failed: ${result.error || `HTTP ${result.status}`}`,
      );
      allTestsPassed = false;
      continue;
    }

    // Check response structure
    if (!result.data.meta) {
      console.error("   ❌ Response missing meta object");
      allTestsPassed = false;
      continue;
    }

    if (!Array.isArray(result.data.meta.appliedCategories)) {
      console.error("   ❌ appliedCategories is not an array");
      allTestsPassed = false;
      continue;
    }

    // Check applied categories match expected
    const actualCategories = result.data.meta.appliedCategories.sort();
    const expectedCategories = testCase.expectedCategories.sort();

    if (
      JSON.stringify(actualCategories) !== JSON.stringify(expectedCategories)
    ) {
      console.error(`   ❌ Categories mismatch:`);
      console.error(`      Expected: [${expectedCategories.join(", ")}]`);
      console.error(`      Actual: [${actualCategories.join(", ")}]`);
      allTestsPassed = false;
      continue;
    }

    // Check performance (should be < 500ms)
    if (result.duration > 500) {
      console.warn(
        `   ⚠️  Slow response: ${result.duration}ms (expected < 500ms)`,
      );
    }

    // Check articles array exists
    if (!Array.isArray(result.data.articles)) {
      console.error("   ❌ Articles is not an array");
      allTestsPassed = false;
      continue;
    }

    console.log(`   ✅ Categories: [${actualCategories.join(", ")}]`);
    console.log(`   ✅ Articles: ${result.data.articles.length}`);
    console.log(`   ✅ Duration: ${result.duration}ms`);
    console.log(`   ✅ Cache: ${result.data.meta.cache_hit ? "HIT" : "MISS"}`);
    passedTests++;
  }

  // Test error handling
  console.log("\n📋 Testing error handling:");
  for (const testCase of ERROR_TEST_CASES) {
    totalTests++;
    console.log(`\n${totalTests}. ${testCase.name}`);
    console.log(`   URL: ${testCase.url}`);

    const result = await makeRequest(testCase.url);

    if (result.status !== testCase.expectedStatus) {
      console.error(
        `   ❌ Expected status ${testCase.expectedStatus}, got ${result.status}`,
      );
      allTestsPassed = false;
      continue;
    }

    if (!result.data.error) {
      console.error("   ❌ Expected error message in response");
      allTestsPassed = false;
      continue;
    }

    console.log(`   ✅ Status: ${result.status}`);
    console.log(`   ✅ Error: ${result.data.error}`);
    passedTests++;
  }

  // Test edge cases
  console.log("\n📋 Testing edge cases:");

  // Test extremely long category list
  totalTests++;
  console.log(`\n${totalTests}. Extremely long category list`);
  const longCategories = Array(20).fill("science").join(",");
  const longResult = await makeRequest(
    `/api/feed?categories=${longCategories}`,
  );

  if (!longResult.success) {
    console.error(
      `   ❌ Long category list failed: ${longResult.error || `HTTP ${longResult.status}`}`,
    );
    allTestsPassed = false;
  } else {
    console.log(`   ✅ Long category list handled successfully`);
    passedTests++;
  }

  // Test special characters
  totalTests++;
  console.log(`\n${totalTests}. Special characters in categories`);
  const specialResult = await makeRequest(
    "/api/feed?categories=science%20tech,invalid@category",
  );

  if (specialResult.status !== 400) {
    console.error(
      `   ❌ Expected 400 for special characters, got ${specialResult.status}`,
    );
    allTestsPassed = false;
  } else {
    console.log(`   ✅ Special characters properly rejected`);
    passedTests++;
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log(`📊 Test Results: ${passedTests}/${totalTests} passed`);

  if (allTestsPassed) {
    console.log("🎉 All category filtering tests passed!");
    console.log("✅ Chunk 9 implementation is working correctly");
    process.exit(0);
  } else {
    console.log("❌ Some category filtering tests failed");
    console.log("Please review the errors above and fix them");
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/feed`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log("🚀 Starting category filtering verification...");

  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.error(
      "❌ Development server is not running on http://localhost:3000",
    );
    console.error("Please start the server with: npm run dev");
    process.exit(1);
  }

  await verifyCategoryFiltering();
}

main().catch((error) => {
  console.error("❌ Verification failed:", error);
  process.exit(1);
});
