import { readFileSync, accessSync, constants } from "fs";
import path from "path";
const mustExist = (p) => {
  try {
    accessSync(p, constants.R_OK);
  } catch {
    console.error(`❌ Missing: ${p}`);
    process.exit(1);
  }
};
const mustMatch = (p, re, msg) => {
  const t = readFileSync(p, "utf8");
  if (!re.test(t)) {
    console.error(`❌ ${msg} (${p})`);
    process.exit(1);
  }
};

// 1) Prompt files
mustExist(path.resolve("prompts/system.story.md"));
mustExist(path.resolve("prompts/user.story.md"));

// 2) Route + Node runtime + imports + headers
const route = path.resolve("app/api/generate/route.ts");
mustExist(route);
mustMatch(
  route,
  /export\s+const\s+runtime\s*=\s*["']nodejs["']/,
  "route.ts must export runtime = 'nodejs'",
);
mustMatch(
  route,
  /from\s+["']@\/lib\/prompt["']/,
  "route.ts must import @/lib/prompt",
);
mustMatch(
  route,
  /from\s+["']@\/lib\/openai["']/,
  "route.ts must import @/lib/openai",
);
mustMatch(
  route,
  /from\s+["']@\/lib\/schema["']/,
  "route.ts must import @/lib/schema",
);
mustMatch(route, /X-Cache/, "route.ts should set X-Cache header");
mustMatch(route, /X-Model/, "route.ts should set X-Model header");
mustMatch(route, /X-Request/, "route.ts should set X-Request header");

// 3) Core libs
const openai = path.resolve("lib/openai.ts");
mustExist(openai);
mustMatch(
  openai,
  /export\s+function\s+createClient\s*\(/,
  "lib/openai.ts must export createClient(...)",
);

const schema = path.resolve("lib/schema.ts");
mustExist(schema);
mustMatch(
  schema,
  /['"]preschool['"]/,
  "readingLevel enum must include 'preschool'",
);
mustMatch(
  schema,
  /['"]early-elementary['"]/,
  "readingLevel enum must include 'early-elementary'",
);
mustMatch(
  schema,
  /['"]elementary['"]/,
  "readingLevel enum must include 'elementary'",
);
mustMatch(
  schema,
  /export\s+const\s+GenerateReq\s*=/,
  "lib/schema.ts must export GenerateReq",
);
mustMatch(
  schema,
  /export\s+const\s+GenerateRes\s*=/,
  "lib/schema.ts must export GenerateRes",
);

mustExist(path.resolve("lib/postcheck.ts"));
mustExist(path.resolve("lib/hash.ts"));
mustExist(path.resolve("lib/cache.ts"));
mustExist(path.resolve("lib/safety.ts"));

console.log(
  "✅ Verification passed: prompts + validation wired for current reading levels.",
);
