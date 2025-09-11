Allegorical News → Kids' 5-Minute Stories
## Executive Summary
* ***What**: Web app that turns news articles into age-appropriate allegorical stories for kids under 10  
* **Tech Stack**: Next.js + TypeScript + OpenAI API + Vercel  
* **Current Status**: ✅ MVP deployed; ✅ Design system foundation and cascade complete  
* **API**: POST /api/generate {articleText, readingLevel} → {story, metadata}  
* **Next**: Prompt files, caching, database persistence

## Purpose (what we're building)
Turn a current news article (pasted text for now) into a gentle, age-appropriate allegorical story for kids under 10, ending with two discussion questions. This project is also a learning vehicle: progress in 20–30 minute chunks, ship small, iterate fast.

## Audience & guardrails
- Audience: Parents + kids <10
- Style: Animal/fantasy allegories; warm, hopeful tone
- Safety: No real names/places; no graphic, frightening, or political propaganda content
- Output: Title, Story (within level word range), exactly 2 kid-friendly questions

## Reading levels & word ranges
- **Preschool (3–5):** 250–400 words; very simple sentences & emotions
- **Early Elementary (5–7):** 350–550 words; simple problem solving
- **Elementary (7–10):** 450–700 words; slightly more complex plots & feelings

---

## Tech stack (current + near-term)
- **Framework:** Next.js (App Router) + Tailwind CSS
- **Language:** TypeScript (migrating if not already)
- **AI provider:** OpenAI API (model configurable per environment)
- **Hosting:** Vercel (auto-deploy from GitHub)
- **Validation:** Zod (env + request/response schemas)
- **Prompts:** Markdown files loaded server-side (`fs`)
- **Optional (planned):** Upstash Redis (cache), Supabase/Vercel Postgres (persistence), Sentry/PostHog (telemetry)

---

## Environment variables
Keep real secrets in `.env.local` (git-ignored). Commit a template in `.env.example`.

**Required**
- `OPENAI_API_KEY` — OpenAI secret key

**Public (client-safe)**
- `NEXT_PUBLIC_APP_NAME` — app name for UI (default "Story Weaver")

**Optional**
- `DATABASE_URL` — Postgres connection string
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — Redis REST creds
- `SENTRY_DSN` — error tracking DSN

**Rules**
- Secrets **never** in client code (only `NEXT_PUBLIC_*` can be used in the browser)
- Validate env at startup (`lib/env.ts`) and fail fast if missing/invalid

---

## Repository layout (target)
```
/app
  /page.tsx
  /api/generate/route.ts  # POST {articleText, readingLevel} → story payload
/components
  StoryForm.tsx
  StoryOutput.tsx
/lib
  env.ts          # Zod-validated env access (server-only)
  openai.ts       # OpenAI client wrapper
  prompt.ts       # load templates + fill placeholders
  schema.ts       # Zod request/response schemas
  safety.ts       # pre/post content checks & refusals
  summarize.ts    # 2–5 sentence neutral summary
  hash.ts         # stable cache key (e.g., sha256)
  cache.ts        # Upstash/DB cache helpers
/prompts
  system.story.md # role, guardrails, refusal policy
  user.story.md   # template with {{placeholders}}
/docs
  LLM_CONTEXT.md  # this file
  DECISIONS.md    # running decisions log
/tests
  prompt.test.ts
  contract.test.ts
.env.example
```

**Path alias:** ensure `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  }
}
```

## API Contract
**Route:** POST /api/generate
**Request JSON**

```json
{
  "articleText": "string, >= 50 chars",
  "readingLevel": "preschool" | "early-elementary" | "elementary"
}
```

**Response JSON (200)**
```json
{
  "story": "string",
  "ageBand": "preschool" | "early-elementary" | "elementary",
  "newsSummary": "2–5 sentence neutral summary",
  "sourceHash": "sha256-of-articleText",
  "model": "string (e.g., gpt-4.1-mini)",
  "tokens": { "prompt": 0, "completion": 0 },
  "safety": { "flagged": false, "reasons": [] },
  "cached": false,
  "createdAt": "ISO timestamp"
}
```

**Errors**
- 400: {"error":"BadRequest","issues":[...]} (Zod validation details)
- 429: {"error":"RateLimited"}
- 500: {"error":"Internal"}

**Headers**
- X-Cache: HIT|MISS
- X-Model:  [model-name]
- X-Request: [uuid]
## Prompt files (structure)
**/prompts/system.story.md**
- Role: children's storyteller
- Hard rules: no real places/people, avoid scary/graphic/political propaganda, match reading level strictly, end with exactly 2 questions
- Refusal: for very sensitive topics, return a brief, warm refusal with a gentler suggestion

**/prompts/user.story.md** (template with placeholders)
```
READING LEVEL: {{readingLevel}}  # Preschool | Early Elementary | Elementary

NEWS SUMMARY (neutral, 2–5 sentences):
{{newsSummary}}

OUTPUT FORMAT (strict):
Title: [whimsical title]
Story: [{{minWords}}–{{maxWords}} words, one block; dialogue allowed]
Questions:
1) [first question]
2) [second question]
```

**Server note:** Any route that reads prompt files must run on Node runtime:
```ts
export const runtime = "nodejs";
```
## Generation flow (server)
1. Validate request with Zod (lib/schema.ts)
2. Pre-safety check (block/soften too-sensitive topics)
3. Summarize raw article → neutral 2–5 sentence newsSummary
4. Cache check by hash(articleText|readingLevel) → fast return if HIT
5. Build prompt (system + user) and call OpenAI
6. Post-check: enforce word range, verify exactly 2 questions, tone guardrails
7. Persist/cache payload (cache 24h; DB optional)
8. Respond with JSON + headers
## Design System Contract (AI instructions)

When generating or refactoring code, **always follow these rules**:

- **Imports**: Use only `@/components/ui/*` (shadcn/ui primitives built on Radix).  
- **Composition**:  
  - Atoms → `ui`  
  - Molecules → `patterns`  
  - Screens/Sections → `screens`  
- **Styling**: Use Tailwind utilities mapped to tokens (defined in `tailwind.config.js` and `/styles/tokens.css`).  
  - Never use raw hex codes or arbitrary spacing values.  
- **Accessibility**:  
  - Maintain ARIA labels, keyboard focus, semantic roles.  
  - Respect Radix behavior for dialogs, tooltips, menus, etc.  
- **Documentation**: Add/update a Storybook story for every component created or modified.  
- **Typing**: Strong TypeScript types only (`no any`).  
- **Error/Loading states**: Provide at least one variant story for each component.  
- **If missing primitive**: Propose a new component in `/components/ui` and document it in Storybook.

**Default expectation**: Any request to “build a new screen” or “refactor UI” must comply with this contract. If ambiguity arises, default to ADR-014 in `DECISIONS.md`.  
### Microinteraction Contract (placeholders-first)

When implementing or scaffolding UI, add **hooks/slots** for microinteractions but keep visuals minimal.

**Motion tokens (use, don’t hardcode):**
- `--motion-fast: 120ms`
- `--motion-medium: 200ms`
- `--motion-slow: 320ms`
- `--ease-standard: cubic-bezier(0.2, 0, 0, 1)`
- `--ease-emphasized: cubic-bezier(0.2, 0, 0, 1.2)`

**Default behaviors (opt-in later):**
- Hover/press: Tailwind `transition-*` with `duration-[var(--motion-fast)]` and `ease-[var(--ease-standard)]`.
- Focus: visible ring via DS tokens; never remove outlines.
- Loading: use `<Spinner />` or `<Skeleton />` placeholders (no ad-hoc spinners).
- Feedback: use `useToast()` (shadcn) placeholders for success/error; no custom toasts.
- Entry/Exit: basic Tailwind opacity/translate; for complex sequences, prefer Framer Motion **only** when specified.
- Respect reduced motion: wrap any animated sequences in `@media (prefers-reduced-motion: reduce)` fallbacks.

**Scaffold-only props** (okay to stub now):
- `isLoading`, `isActive`, `isPressed`, `isInvalid`, `hasChanges` → render states; animation optional for now.

**Radix-first a11y:**
- Use Radix primitives (Dialog, Tooltip, Toast) for focus trapping/ARIA; style via shadcn.

## Status snapshot (update as you go)
- ✅ MVP shipped: paste → select level → generate → read; deployed on Vercel
- ✅ Zod env + request validation complete
- ✅ Type-safe architecture with RequestState management
- ✅ Design system foundation with tokenized styling and UI primitives
- ✅ Design system cascade across existing app with preserved functionality
- 🔜 Prompts moved to files; load via fs
- 🔜 Cache (24h) by (hash, level)
- 🔜 Post-checks (word range, exactly 2 questions)
- 🔜 Persistence (stories table) + "Save story"
- 🔜 Telemetry (Sentry, PostHog)
- 🔜 URL/RSS ingestion (Readability + rss-parser)
## Quality gates (post-checks)
- Structure: Title present; exactly 2 questions
- Word range matches reading level
- No real names/places; no graphic or frightening content
- Tone: gentle, age-appropriate
- On failure: regenerate once or return polite refusal
## Mini test plan (fast, repeatable)
- Keep 5 seed articles (science, local, sports, neutral national, human interest)
- For each level, assert:
    - Word count within band
    - 2 questions present
    - Banned terms absent (configurable list)
- Snapshot "golden" stories; alert on large diffs (manual review)
## Next tasks (20–30 min chunks)
1. Add .env.example + lib/env.ts (Zod) and switch to env.OPENAI_API_KEY
2. Add lib/schema.ts and validate body in /api/generate
3. Extract prompts to /prompts/* and load them (Node runtime)
4. Implement hash.ts + cache.ts; return X-Cache header
5. Add post-checks for word range & question count; regen on fail
6. Add minimal safety.ts (keywords/NER) + refusal path
7. Persist to DB (optional) and add "Save story" button
8. Add Sentry/PostHog; log model, tokens, cache hits
## Non-goals (for now)
- User auth/accounts
- Vector search or long-term knowledge base
- Complex moderation pipelines
- Mobile apps (web first)
## How to use this context (Cursor/LLMs)
- Do not rewrite this file unless asked; treat it as source of truth
- When implementing a task, cite the sections you follow (e.g., "API contract", "Prompt files")
- Prefer small, isolated diffs to keep 20–30 min cadence
- If something is ambiguous, propose a default and update /docs/DECISIONS.md

# LLM Test Instruction Style Guide

When you (the LLM) provide tests, **always** follow this structure. Be explicit about **where** to run actions and **what** result to expect.

## 1) Required Format (use these sections)

### **Purpose**
One sentence on what we’re validating.

### **Prereqs**
- Repo at project root (`story-generator`) with `npm` installed
- Dev server not running unless stated
### **Terminal — Cursor (commands to paste)**
`# each command in its own fenced block # include comments on what it should do`

**Expected output:**
- Bullet list or a short code block showing the **first meaningful line** and/or **success line**.
### **Browser — what to click**
- URL to open (e.g., `http://localhost:3000`)
- Exact user actions (paste text, click button, keyboard shortcut)
- Console/Network checks (what to look for

**Expected result:**
- What should appear/change on screen (success + error states)
### **Editor — temporary toggles (and how to undo)**
- File path and the single line to add/remove
- Reminder to revert the change
### **Troubleshooting**
- Top 2–3 common issues with exact fixes

---
## 2) Canonical Examples

### A. TypeScript compiles cleanly
**Purpose**  
Verify the project type-checks.

**Terminal — Cursor**
`npm run typecheck`

**Expected output**
- If script exists: ends with `Found 0 errors.`
- If script missing: `npm error Missing script: "typecheck"` → **Fix:**
    `npm pkg set scripts.typecheck="tsc --noEmit" npm i -D typescript @types/react @types/node npm run typecheck`

---
### B. Dev server boots
**Purpose**  
Run Next.js locally and confirm it starts.

**Terminal — Cursor**
`npm run dev`

**Expected output**
- Shows a Next.js banner with:
    - `Local: http://localhost:3000`
    - `Ready in <n>ms`
- Leave this terminal **running**.

**Browser**
- Open `http://localhost:3000`

**Expected result**
- Page renders without red errors in the console.

---

### C. API validation (400) and internal error (500)

**Purpose**  
Ensure API returns consistent error shapes `{ message, code, issues? }`.

**Prereqs**
- Dev server running in another terminal

**Terminal — Cursor — 400 Bad Request**
`curl -s -X POST http://localhost:3000/api/generate \   -H 'Content-Type: application/json' -d '{}' | jq`

**Expected output**
`{ "message": "Invalid request", "code": "BAD_REQUEST", "issues": { ... } }`

**Editor — force a 500 temporarily**
- Open `app/api/generate/route.ts`
- At the top of `POST`, add: `throw new Error("boom")`

**Browser → refresh**  
**Expected result**
- UI shows a friendly error state, surfacing:
    - `message: "boom"`
    - `code: "INTERNAL_ERROR"`

**Undo**
- Remove the temporary `throw` line.

---

### D. AbortController cancels prior request
**Purpose**  
Ensure repeated submissions cancel the previous fetch.

**Browser**
1. Open `http://localhost:3000`
2. Paste valid text (> 50 chars)
3. Click **Generate**
4. Immediately click **Generate** again (or press **Cmd/Ctrl+Enter**)

**Expected result**
- Only **one** story renders.
- DevTools → Network: first request shows **(canceled)**.

**Troubleshooting**
- If two results render: ensure fetch lives **only** in `app/page.tsx` and button disables while submitting.

---

### E. Environment fail-fast (missing `OPENAI_API_KEY`)
**Purpose**  
App should error clearly when key is missing.

**Terminal — Cursor**
`# macOS/Linux for this shell only OPENAI_API_KEY= npm run dev`

**Expected output**
- Server does **not** start; shows a clear error originating from `lib/env.ts` (e.g., “OPENAI_API_KEY is missing”).

**Restore**
- Stop with **Ctrl+C** and run `npm run dev` again (with your real `.env.local`).

---

## 3) Writing Tips for LLMs
- **Always label the surface**: start each step with **Terminal — Cursor**, **Browser**, or **Editor**.
- **Show minimal outputs**: don’t dump full logs; show the one or two lines that prove success/failure.
- **Give exact file paths** and exact code to paste for any temp changes.
- **Pair every temp change with an Undo step.**
- **Prefer copy-paste commands** over prose; add one-line comments above commands if needed.
- **Assume macOS** shell. If Windows differs, include a brief PowerShell variant.

---

## 4) Example “Done Done” Gate (checklist)

-  `npm run typecheck` ends with **0 errors** 
-  `npm run dev` shows **Ready** banner; app loads
-  400 curl returns `{ message, code: "BAD_REQUEST", issues }`
-  500 (temporary throw) shows `{ message: "boom", code: "INTERNAL_ERROR" }` in UI
-  AbortController cancels prior request (Network shows **canceled**)
-  Missing `OPENAI_API_KEY` fails fast with a clear error