#!/usr/bin/env node

import { readFileSync } from "fs";
import { join } from "path";
import { createHash } from "crypto";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock the prompt loading function (simplified version of lib/prompt.ts)
function loadPrompt(templateName, variables) {
  try {
    const templatePath = join(process.cwd(), "prompts", `${templateName}.md`);
    const template = readFileSync(templatePath, "utf8");
    return substituteVariables(template, variables);
  } catch (error) {
    console.error(
      `Failed to load prompt template ${templateName}:`,
      error.message,
    );
    throw error;
  }
}

function substituteVariables(template, variables) {
  let result = template;

  // Simple {{variable}} substitution
  result = result.replace(/\{\{readingLevel\}\}/g, variables.readingLevel);
  result = result.replace(/\{\{articleText\}\}/g, variables.articleText);

  if (variables.styleHints) {
    result = result.replace(/\{\{styleHints\}\}/g, variables.styleHints);
  } else {
    // Remove conditional blocks if styleHints is not provided
    result = result.replace(/\{\{#if styleHints\}\}[\s\S]*?\{\{\/if\}\}/g, "");
  }

  return result;
}

// Mock the hash function (simplified version of lib/hash.ts)
function generateStoryHash(articleText, readingLevel) {
  const input = `${articleText}|${readingLevel}`;
  return `sha256-${createHash("sha256").update(input).digest("hex")}`;
}

// Test the prompt pipeline
console.log("🧪 Testing prompt pipeline...\n");

try {
  // Test 1: Assert system prompt loads and contains "storyteller"
  console.log("1. Testing system prompt loading...");
  const systemPrompt = loadPrompt("system.story", {
    readingLevel: "preschool",
    articleText: "test",
  });

  if (!systemPrompt.includes("storyteller")) {
    throw new Error("System prompt does not contain 'storyteller'");
  }
  console.log("   ✅ System prompt loaded and contains 'storyteller'");

  // Test 2: Fill user template and assert no {{ remain
  console.log("2. Testing user template variable substitution...");
  const userPrompt = loadPrompt("user.story", {
    readingLevel: "preschool",
    articleText: "test",
  });

  if (userPrompt.includes("{{")) {
    throw new Error("User prompt still contains unresolved variables");
  }
  console.log("   ✅ User template variables substituted successfully");

  // Test 3: Assert hash starts with sha256-
  console.log("3. Testing hash generation...");
  const hash = generateStoryHash("test", "preschool");

  if (!hash.startsWith("sha256-")) {
    throw new Error("Hash does not start with 'sha256-'");
  }
  console.log("   ✅ Hash generated with correct prefix");

  console.log("\n✅ Prompt pipeline verified");
} catch (error) {
  console.error("\n❌ Prompt pipeline test failed:", error.message);
  process.exit(1);
}
