---
⚠️ **Assistant Instruction**  
When preparing Cursor prompts based on this document:  
- Default to **Minimal level** (intent + guardrails + doc update + verify).  
- Use **Standard or Detailed** only if explicitly requested or if the chunk introduces brand-new patterns, libraries, or safety-critical logic.  
- Do **not** include line-by-line code unless explicitly asked. Cursor should infer implementation from ADRs, this guide, and existing codebase patterns.
---

Allegorical News → Kids' 5-Minute Stories

## Executive Summary

- **\*What**: Web app that turns news articles into age-appropriate allegorical stories for kids under 10
- **Tech Stack**: Next.js + TypeScript + OpenAI API + Vercel
- **Current Status**: ✅ MVP deployed; ✅ Design system foundation and cascade complete; ✅ UI modernized to shadcn/ui standards; ✅ Story persistence with Supabase; ✅ Production deployment infrastructure; 📜 Planned: Feed-first UI with multi-source aggregation (RSS, URL extraction, optional News API) and import options
- **API**: POST /api/generate {articleText, readingLevel} → {story, metadata}; POST /api/stories/save; GET /api/stories
- **Next**: Enhanced user experience, analytics, performance optimization

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

- **Framework:** Next.js 15.5.3 (App Router) + Tailwind CSS
- **Language:** TypeScript (fully migrated)
- **AI provider:** OpenAI API (model configurable per environment)
- **Hosting:** Vercel (auto-deploy from GitHub)
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **Validation:** Zod (env + request/response schemas)
- **UI Components:** shadcn/ui + Radix primitives with barrel exports; Card component with Header/Title/Content/Footer
- **Documentation:** Storybook 8.6.14 (temporarily disabled due to compatibility issues)
- **Prompts:** Markdown files loaded server-side (`fs`)
- **Caching:** Request hashing with in-memory cache
- **Optional (planned):** Upstash Redis (enhanced cache), Sentry/PostHog (telemetry)

---

## Environment variables

Keep real secrets in `.env.local` (git-ignored). Commit a template in `.env.example`.

**Required**

- `OPENAI_API_KEY` — OpenAI secret key
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-only)

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

## Repository layout (current)

```
/app
  /page.tsx
  /api/generate/route.ts  # POST {articleText, readingLevel} → story payload
/components
  /index.ts              # Root barrel export
  /ui/                   # shadcn/ui primitives (atoms)
    /index.ts            # UI barrel export
    /Button.tsx
    /Avatar.tsx
    /... (other primitives)
  /patterns/             # Molecules
    /index.ts            # Patterns barrel export
    /StoryForm.tsx
    /StoryOutput.tsx
    /NewsFeed.tsx        # Planned: main feed component
    /ArticleCard.tsx     # Planned: individual article display
    /CategoryFilter.tsx  # Planned: category selection chips
    /ImportModal.tsx     # Planned: import options modal
    /layouts/

Note: all imports must go through barrel (import { NewsFeed } from "@/components").
  /screens/              # Screens/Sections
    /index.ts            # Screens barrel export
    /GenerateStory.tsx
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
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["components/*"]
    }
  }
}
```

**Import pattern:** Use canonical barrel imports:

```typescript
// ✅ Correct - use root barrel
import { Button, StoryForm, GenerateStory } from "@/components";

// ❌ Avoid - deep paths
import { StoryForm } from "@/components/patterns/StoryForm";
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
- X-Model: [model-name]
- X-Request: [uuid]

**Route:** POST /api/stories/save
**Request JSON**

```json
{
  "articleHash": "string (sha256 hash of article text)",
  "readingLevel": "preschool" | "early-elementary" | "elementary",
  "story": "string (full story text)"
}
```

**Response JSON (200)**

```json
{
  "ok": true,
  "id": "uuid"
}
```

**Errors**

- 400: {"message":"Invalid request data","code":"VALIDATION_ERROR","issues":[...]}
- 500: {"message":"Failed to save story","code":"INTERNAL_ERROR"}

**Headers**

- X-Request-Id: [uuid]
- X-Duration: [ms]

**Route:** GET /api/stories
**Query Parameters**

- limit: number (default 10, max 50)

**Response JSON (200)**

```json
[
  {
    "id": "uuid",
    "articleHash": "string",
    "readingLevel": "preschool" | "early-elementary" | "elementary",
    "createdAt": "ISO timestamp",
    "snippet": "string (first 160 chars + ...)"
  }
]
```

**Errors**

- 500: {"message":"Failed to fetch stories","code":"INTERNAL_ERROR"}

**Headers**

- X-Request-Id: [uuid]
- X-Duration: [ms]

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

### Prompt Variables

| Variable           | Type              | Description                                    | Example Values                                      |
| ------------------ | ----------------- | ---------------------------------------------- | --------------------------------------------------- |
| `{{readingLevel}}` | string            | Target age group for story complexity          | `"preschool"`, `"early-elementary"`, `"elementary"` |
| `{{articleText}}`  | string            | Raw news article content to transform          | Any news article text (≥50 chars)                   |
| `{{styleHints}}`   | string (optional) | Additional style guidance for story generation | Custom instructions for tone, characters, etc.      |

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

### Tool Adapters (Agnostic + Subframe-specific)

**Always-on rules for any AI tool (Cursor, Subframe, Lovable, v0):**

- Update **existing files in place**; do **not** create duplicates.
- Canonical paths:
  - Atoms (primitives): `components/ui/*`
  - Molecules (patterns): `components/patterns/*`
  - Screens: `components/screens/*`
- Imports must be `@/components/ui/*` (shadcn over Radix).
- Styling must use Tailwind **tokens** from `/styles/tokens.css` + `tailwind.config.ts`. No inline hex or arbitrary px.
- A11y: Radix semantics; keep focus rings; connect `<Label htmlFor>`; add aria-\*.
- Microinteractions: use motion tokens (`--motion-fast/medium/slow`, `--ease-*`), `<Spinner />`, `<Skeleton />`.
- **Subframe note**: Subframe edits are pulled via CLI; it must target the canonical paths above. To prevent overwrites, a file may include `// @subframe/sync-disable` at the top.

**Subframe adapter (when using Subframe):**

- Subframe project path must mirror repo structure. Treat these as the _only_ valid paths:
  - `components/ui/*`
  - `components/patterns/*`
  - `components/screens/*`
- When asked to **“update in place”**, overwrite those exact files/paths.
- Do **not** modify Tailwind config; respect tokens as the source of truth.
- If a file should never be overwritten, it will include at top:
  - ```ts
    // @subframe/sync-disable
    ```

**Standard Task Header (paste before any request):**

> Use `/docs/LLM_CONTEXT.md` + ADR-014/ADR-015.  
> **Update existing files in place** at the explicit paths I list.  
> Use `@/components/ui/*` primitives and Tailwind tokens.  
> Add or update a Storybook story (default + one variant).  
> Preserve logic and APIs; no new libraries.

## Status snapshot (update as you go)

- ✅ MVP shipped: paste → select level → generate → read; deployed on Vercel
- ✅ Zod env + request validation complete
- ✅ Type-safe architecture with RequestState management
- ✅ Design system foundation with tokenized styling and UI primitives
- ✅ Design system cascade across existing app with preserved functionality
- ✅ Component import consolidation with barrel exports and canonical import patterns
- ✅ Next.js 15.5.3 and Storybook 8.6.14 upgrade with full compatibility
- ✅ External AI tool integration (Subframe) with canonical component structure
- ✅ Deployment pipeline optimization with fast Git hooks (4.6s total deployment time)
- 🔜 Prompts moved to files; load via fs
- 🔜 Cache (24h) by (hash, level)
- 🔜 Post-checks (word range, exactly 2 questions)
- 🔜 Persistence (stories table) + "Save story"
- 🔜 Telemetry (Sentry, PostHog)
- 🔜 URL/RSS ingestion (Readability + rss-parser)
- 📜 News feed with content diversity + safety filtering (planned)

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

### Feed-Specific Tests

- RSS parsing with curated feeds returns articles
- Safety filter (lib/safety.ts) blocks violent keywords
- Diversity algorithm enforces max 2 per source
- Category filters return correct subsets
- Converted articles are excluded per device_id

## Next tasks (30-minute chunks)

**Phase 1 feed infrastructure only:**

- Chunk 1: Database setup (articles + feed_cache tables with indexes, device_id)
- Chunk 2: RSS parser setup (lib/rss.ts)
- Chunk 3: Multi-source aggregation (lib/feeds.ts, CURATED_FEEDS, dedup)
- Chunk 4: Feed API endpoint (app/api/feed/route.ts)
- Chunk 5: Feed refresh logic (app/api/feed/refresh/route.ts, cron/TTL)

For full roadmap see DECISIONS.md.

## Non-goals (for now)

- User auth/accounts
- Vector search or long-term knowledge base
- Complex moderation pipelines
- Mobile apps (web first)

## How to use this context (Cursor/LLMs)

> **Note:** For full workflow integration and preflight rules, see AI_UI_Guide.md. LLMs must always update existing files in place, use barrel imports (@/components), and never create new folders or dependencies.

- Do not rewrite this file unless asked; treat it as source of truth
- When implementing a task, cite the sections you follow (e.g., "API contract", "Prompt files")
- Prefer small, isolated diffs to keep 20–30 min cadence
- If something is ambiguous, propose a default and update /docs/DECISIONS.md

### Chunk Execution Shortcut

When a request says **"Implement Chunk X from docs/DECISIONS.md"**:

- Treat `/docs/DECISIONS.md`, `/docs/AI_UI_Guide.md`, and `/docs/LLM_CONTEXT.md` as the authoritative context.
- Follow all relevant ADRs (e.g. ADR-014 design system, ADR-015 microinteractions, ADR-017 external tool sync, ADR-018 barrel imports, ADR-028 feed-first plan).
- Update existing files in place; use barrel imports only.
- Always update `/docs/DECISIONS.md`:
  - Mark the chunk as ⏳ (in progress) or ✅ (completed).
  - Add a one-line summary of what was built under ADR-028.
- After completing the work, apply **Quick Verify Steps** (typecheck, dev server boot, Mini Test Plan).
- Summarize which files changed and why.

This allows a minimal prompt:

Implement Chunk X – [short description] from docs/DECISIONS.md Feature Roadmap.

## Cursor Prompt Guidelines (Summary)

- **Minimal is default:** intent + guardrails + doc update note + simple verify.
- **Standard:** add explicit constraints and file references if necessary.
- **Detailed:** only when introducing brand-new patterns, libraries, or complex logic.

Minimal prompt skeleton:
Implement [Chunk Name] from docs/DECISIONS.md.

Create [file path]:
• [what it does]
• [key guardrails]
Return: [expected output]

Update docs/DECISIONS.md: Mark [Chunk] ✅
Verify: [quick check]

Cursor should infer validation, error handling, and async patterns from ADRs and `AI_UI_Guide.md`.  
See **AI_UI_Guide.md → AI Assistant Prompting Style & Cursor Prompt Guidelines** for the full ladder.

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

- `npm run typecheck` ends with **0 errors**
- `npm run dev` shows **Ready** banner; app loads
- 400 curl returns `{ message, code: "BAD_REQUEST", issues }`
- 500 (temporary throw) shows `{ message: "boom", code: "INTERNAL_ERROR" }` in UI
- AbortController cancels prior request (Network shows **canceled**)
- Missing `OPENAI_API_KEY` fails fast with a clear error

---

## 5) Collaboration Style & Communication Preferences

**Working Approach:**

- **Proactive documentation**: Update docs as part of the work, not as an afterthought
- **Systematic problem-solving**: Break down complex issues into clear, actionable steps
- **Immediate verification**: Test changes locally before committing, verify deployments work
- **Clean repository management**: Merge and clean up branches promptly, keep only main branch

**Communication Style:**

- **Clear status indicators**: Use checkmarks (✅) and progress indicators liberally
- **Comprehensive context**: Explain why decisions were made, not just what was done
- **Error resolution focus**: Investigate root cause and fix systematically rather than quick patches
- **Documentation-first mindset**: Always update relevant docs when making changes

**Preferred Workflow:**

- **Todo tracking**: Use structured task lists for complex multi-step work
- **Immediate feedback**: Test and verify changes before moving to next steps
- **Clean commits**: Make focused commits with clear messages
- **Complete handoffs**: Ensure all work is properly documented and committed
