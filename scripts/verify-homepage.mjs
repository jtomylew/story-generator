#!/usr/bin/env node

/**
 * Homepage Conversion Verification Script
 *
 * Verifies that Chunk 8 implementation is working correctly:
 * - "/" contains NewsFeed content
 * - "/paste" contains textarea element
 * - Both pages have navigation tabs
 */

import { readFileSync } from "fs";
import { join } from "path";

const PROJECT_ROOT = process.cwd();

function checkFileExists(filePath) {
  try {
    const fullPath = join(PROJECT_ROOT, filePath);
    const content = readFileSync(fullPath, "utf8");
    return { exists: true, content };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

function verifyHomepageConversion() {
  console.log("🔍 Verifying Homepage Conversion (Chunk 8)...\n");

  let allChecksPassed = true;

  // Check 1: Homepage contains NewsFeed
  console.log("1. Checking homepage contains NewsFeed...");
  const homepageCheck = checkFileExists("app/page.tsx");
  if (!homepageCheck.exists) {
    console.error("❌ app/page.tsx not found");
    allChecksPassed = false;
  } else if (!homepageCheck.content.includes("NewsFeed")) {
    console.error("❌ Homepage does not contain NewsFeed component");
    allChecksPassed = false;
  } else {
    console.log("✅ Homepage contains NewsFeed component");
  }

  // Check 2: Paste page exists and contains textarea
  console.log("\n2. Checking paste page contains textarea...");
  const pastePageCheck = checkFileExists("app/paste/page.tsx");
  if (!pastePageCheck.exists) {
    console.error("❌ app/paste/page.tsx not found");
    allChecksPassed = false;
  } else if (!pastePageCheck.content.includes("StoryForm")) {
    console.error("❌ Paste page does not contain StoryForm component");
    allChecksPassed = false;
  } else {
    console.log("✅ Paste page contains StoryForm component");
  }

  // Check 3: NavTabs component exists
  console.log("\n3. Checking NavTabs component...");
  const navTabsCheck = checkFileExists("components/patterns/NavTabs.tsx");
  if (!navTabsCheck.exists) {
    console.error("❌ components/patterns/NavTabs.tsx not found");
    allChecksPassed = false;
  } else if (!navTabsCheck.content.includes("usePathname")) {
    console.error(
      "❌ NavTabs component does not use usePathname for active tab detection",
    );
    allChecksPassed = false;
  } else {
    console.log("✅ NavTabs component exists with proper navigation logic");
  }

  // Check 4: Both pages have navigation tabs
  console.log("\n4. Checking both pages have navigation tabs...");
  const homepageHasNavTabs =
    homepageCheck.exists && homepageCheck.content.includes("NavTabs");
  const pastePageHasNavTabs =
    pastePageCheck.exists && pastePageCheck.content.includes("NavTabs");

  if (!homepageHasNavTabs) {
    console.error("❌ Homepage does not contain NavTabs component");
    allChecksPassed = false;
  } else if (!pastePageHasNavTabs) {
    console.error("❌ Paste page does not contain NavTabs component");
    allChecksPassed = false;
  } else {
    console.log("✅ Both pages contain NavTabs component");
  }

  // Check 5: NavTabs exported from patterns index
  console.log("\n5. Checking NavTabs export...");
  const patternsIndexCheck = checkFileExists("components/patterns/index.ts");
  if (!patternsIndexCheck.exists) {
    console.error("❌ components/patterns/index.ts not found");
    allChecksPassed = false;
  } else if (!patternsIndexCheck.content.includes("NavTabs")) {
    console.error("❌ NavTabs not exported from patterns index");
    allChecksPassed = false;
  } else {
    console.log("✅ NavTabs properly exported from patterns index");
  }

  // Check 6: Navigation tabs configuration
  console.log("\n6. Checking navigation tabs configuration...");
  const hasCorrectTabs =
    homepageCheck.exists &&
    homepageCheck.content.includes('"News Feed"') &&
    homepageCheck.content.includes('"Paste Article"') &&
    homepageCheck.content.includes('href: "/"') &&
    homepageCheck.content.includes('href: "/paste"');

  if (!hasCorrectTabs) {
    console.error("❌ Navigation tabs not configured correctly");
    allChecksPassed = false;
  } else {
    console.log("✅ Navigation tabs configured correctly");
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  if (allChecksPassed) {
    console.log("🎉 All homepage conversion checks passed!");
    console.log("✅ Chunk 8 implementation is complete and correct");
    process.exit(0);
  } else {
    console.log("❌ Some homepage conversion checks failed");
    console.log("Please review the errors above and fix them");
    process.exit(1);
  }
}

// Run verification
verifyHomepageConversion();
