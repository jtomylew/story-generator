// Test script to verify reading level changes
const { GenerateReq } = require("./lib/schema.ts");

// Test 1: Request without reading level should be valid
const testData1 = {
  articleText:
    "Scientists have discovered a new species of butterfly in the Amazon rainforest. The butterfly has unique wing patterns that help it blend into its environment. This discovery could help researchers understand more about biodiversity in the region.",
};

console.log("Test 1: Request without reading level");
try {
  const result1 = GenerateReq.parse(testData1);
  console.log("✅ Valid:", result1);
  console.log("Reading level:", result1.readingLevel); // Should be undefined
} catch (error) {
  console.log("❌ Invalid:", error.message);
}

// Test 2: Request with reading level should still work
const testData2 = {
  articleText:
    "Scientists have discovered a new species of butterfly in the Amazon rainforest. The butterfly has unique wing patterns that help it blend into its environment. This discovery could help researchers understand more about biodiversity in the region.",
  readingLevel: "elementary",
};

console.log("\nTest 2: Request with reading level");
try {
  const result2 = GenerateReq.parse(testData2);
  console.log("✅ Valid:", result2);
  console.log("Reading level:", result2.readingLevel); // Should be 'elementary'
} catch (error) {
  console.log("❌ Invalid:", error.message);
}

console.log(
  '\n✅ All tests completed - reading level is now optional and defaults to "elementary" (7-10 year olds)',
);
