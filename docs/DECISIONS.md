A lightweight running log of technical decisions, tradeoffs, and status snapshots for the **Allegorical News → Kids' 5-Minute Stories** app.

**How to use this doc:**

- Add short entries as decisions are made; keep it skimmable
- Reference ADRs by number for context in future conversations
- Pairs with `/docs/LLM_CONTEXT.md` (handoff packet for Cursor/LLMs)

**Legend:** ✅ done · ⏳ in progress · 🔜 planned · ❌ abandoned · ↻ superseded

**Cursor Update Prompts:**

- **Daily work completion**: "I just finished working on [brief description of what I built]. Update docs/DECISIONS.md to reflect what I actually implemented today. Determine if this completes an existing ADR, modifies it, replaces it, or requires a new ADR. Update status icons and content appropriately."
- **Weekly summary**: "Update the current week summary in docs/DECISIONS.md to reflect all completed work and current project status."
- **New technical debt**: "I discovered a new limitation: [brief description]. Add this to the technical debt section in docs/DECISIONS.md and suggest when to address it."

---

## Week 1 Summary ✅

**Goals**

- Learn full-stack + AI tools in 20–30 min chunks
- Build an MVP that turns pasted news text into age-appropriate allegorical stories with animal characters

**What we shipped**

- ✅ Environment setup: Cursor, OpenAI, Vercel, GitHub, Next.js app scaffolding
- ✅ API: basic story generation endpoint calling OpenAI
- ✅ UI: textarea input, generate button, story display
- ✅ Reading levels: Preschool / Early Elementary / Elementary selection
- ✅ Prompt iteration: tested on real articles; improved style and constraints
- ✅ Styling polish: kid-friendly, storybook feel (Tailwind)
- ✅ Deployment: live on Vercel at **[https://story-generator-xyz.vercel.app/]**

**Status snapshot**

- Built: paste → pick level → generate → read; deployed
- Gaps: no caching/persistence; minimal safety checks; prompts embedded in code; no tests/telemetry; manual paste only

---

## Week 2 Summary ✅

**Goals**

- Establish professional code quality and type safety
- Implement robust error handling and request lifecycle management
- Create scalable architecture foundation

**What we shipped**

- ✅ Environment validation: Zod schema validation with server-only imports
- ✅ API contract validation: Comprehensive request/response schemas with structured errors
- ✅ Type-safe architecture: Full TypeScript migration with RequestState union types
- ✅ Request lifecycle: AbortController implementation for memory safety
- ✅ Centralized services: OpenAI client abstraction with validated environment
- ✅ Component extraction: StoryForm and StoryOutput with proper contracts and accessibility
- ✅ Documentation: ADR-based decision tracking and project documentation
- ✅ GitHub integration: Professional commit history and version control

**Status snapshot**

- Built: modular, type-safe, production-ready architecture with component separation
- Gaps: prompt externalization, caching, persistence, analytics

---

## Architecture Decision Records (ADRs)

### ADR-001: Framework Selection (Next.js + Tailwind) ✅

**Week 1, Day 1**

- **Decision**: Next.js (App Router) + Tailwind CSS
- **Rationale**: Built-in API routes eliminate separate backend; learning simplicity; Vercel optimization
- **Alternatives considered**: Create React App + Express, Remix, SvelteKit
- **Learning outcome**: Single codebase for frontend/backend reduced complexity significantly
- **Files**: `app/`, `tailwind.config.js`

### ADR-002: Development Workflow (Cursor + Daily Sessions) ✅

**Week 1, Day 1**

- **Decision**: Daily 30-minute coding sessions using Cursor IDE with AI assistance
- **Rationale**: AI assistance ideal for syntax learning while understanding logic; manageable time commitment
- **Alternatives considered**: VS Code with Copilot, Replit for rapid prototyping, Lovable for no-code
- **Learning balance**: Chose actual coding over no-code tools for skill development
- **Outcome**: Successfully built full-stack app without extensive coding background

### ADR-003: AI Provider Selection (OpenAI) ✅

**Week 1, Day 2**

- **Decision**: OpenAI API (GPT-4) for story generation
- **Rationale**: Most mature and reliable for consistent story quality during learning phase
- **Cost consideration**: Chose quality over economy for development
- **Alternatives considered**: Claude, local models, cheaper GPT variants
- **Implementation**: Basic API integration with hardcoded prompts initially
- **Files**: API route in `app/api/` (to be abstracted in Week 2)

### ADR-004: Target Audience & Content Strategy ✅

**Week 1, Day 3**

- **Decision**: Parents with children under 10; animal allegories; gentle tone; 2 discussion questions
- **Rationale**: Clear use case that avoids complex news summarization challenges
- **Content approach**: Inspired by Aesop's fables tradition adapted for current events
- **Safety strategy**: No real names, places, or political specifics; focus on universal values
- **Validation method**: Tested with real news articles across different topics

### ADR-005: Reading Level Specification ✅

**Week 1, Day 4**

- **Decision**: Three-tier system with specific word counts and complexity levels:
    - Preschool (3-5): 250-400 words, simple sentences, basic emotions
    - Early Elementary (5-7): 350-550 words, problem-solving themes
    - Elementary (7-10): 450-700 words, complex plots, nuanced emotions
- **Rationale**: Clear developmental appropriateness with distinct vocabulary levels
- **Alternative considered**: Single story with difficulty slider
- **Implementation**: Prompt engineering to adjust vocabulary and sentence structure

### ADR-006: Deployment Strategy (Vercel) ✅

**Week 1, Day 7**

- **Decision**: Vercel with auto-deploy from GitHub main branch
- **Rationale**: Zero-config deployment for Next.js; generous free tier; seamless GitHub integration
- **Alternatives considered**: Netlify, Railway, Render, AWS
- **Environment handling**: Manual setup in Vercel dashboard (improved in ADR-007)
- **Outcome**: Successful deployment with working environment variables

---

## Week 2 Decisions: Code Organization & Validation

### ADR-007: Environment Variable Management ✅

**Week 2, Day 1**

- **Decision**: Zod validation with server-only imports and tracked .env.example
- **Previous limitation**: Direct process.env access without validation caused potential runtime errors
- **Implementation**:
    - `.env.example` committed to repo (names only, no secrets)
    - `lib/env.ts` with Zod validation using safeParse()
    - Server-only imports prevent client-side exposure
    - Updated API routes to use validated `env.OPENAI_API_KEY`
    - Added `server-only` package dependency
- **Rationale**: Fail fast on missing vars; simplify onboarding; improve security
- **Learning outcome**: Successfully implemented type-safe environment variable access with clear error messages
- **Files**: `.env.example`, `lib/env.ts`, updated `app/api/generate-story/route.js`

### ADR-008: API Request/Response Validation ✅

**Week 2, Day 1**

- **Decision**: Zod schemas for API contract validation in `lib/schema.ts`
- **API contract**:
    - Request: `{ articleText: string (≥50 chars), readingLevel: enum }`
    - Response: `{ story, ageBand, newsSummary, sourceHash, model, tokens?, safety, cached, createdAt }`
    - Errors: 400 (BadRequest with validation issues), 429 (RateLimited), 500 (Internal)
- **Previous limitation**: No input validation or structured error responses
- **Implementation**:
    - Created `lib/schema.ts` with `GenerateReq` and `GenerateRes` schemas
    - Updated API route to use `GenerateReq.safeParse()` for validation
    - Implemented `formatZodIssues()` helper for clean error formatting
    - Updated frontend to send `articleText` instead of `newsStory`
    - Added reading level mapping from UI format to API format
    - All responses now use `NextResponse.json()` for consistency
- **Rationale**: Beginner-proof inputs; consistent error shapes; safer refactors
- **Learning outcome**: Successfully implemented comprehensive API validation with clear error messages
- **Files**: `lib/schema.ts`, updated `app/api/generate-story/route.js`, updated `app/page.js`

### ADR-009: Type-Safe Architecture with Request State Management ✅

**Week 2, Day 1**

- **Decision**: Implement comprehensive type system with RequestState union and centralized services
- **Previous limitation**: Mixed JavaScript/TypeScript with no request lifecycle management
- **Implementation**:
    - Created `lib/types.ts` for type-only exports from Zod schemas
    - Created `lib/ui-types.ts` with `RequestState` union and `ApiError` interface
    - Created `lib/openai.ts` with centralized OpenAI client using validated env
    - Refactored `app/page.js` → `app/page.tsx` with full TypeScript
    - Implemented `AbortController` for request cancellation and cleanup
    - Created consistent `/api/generate` endpoint
    - Added proper error mapping to `ApiError` shape
- **Rationale**: Type safety, better error handling, request lifecycle management, memory safety
- **Learning outcome**: Successfully implemented professional-grade type-safe architecture
- **Files**: `lib/types.ts`, `lib/ui-types.ts`, `lib/openai.ts`, `app/page.tsx`, `app/api/generate/route.js`

### ADR-010: OpenAI Client Abstraction ✅

**Week 2, Day 1**

- **Decision**: Centralized OpenAI client configuration in `lib/openai.ts`
- **Previous limitation**: API client setup repeated in route handlers
- **Implementation**: 
    - Created `lib/openai.ts` with server-only import
    - Configured client using validated environment variables from ADR-007
    - Updated all API routes to use centralized client
- **Rationale**: Single source of truth for AI configuration; easier testing and modification
- **Learning outcome**: Successfully centralized OpenAI client with proper environment validation
- **Files**: `lib/openai.ts`, updated API routes

### ADR-011: Component Extraction & Architecture ✅

**Week 2, Day 2**

- **Decision**: Extract StoryForm and StoryOutput components with proper contracts and accessibility
- **Previous limitation**: Monolithic page component with mixed concerns
- **Implementation**:
    - `components/StoryForm.tsx`: Client component with validation, hotkeys, and a11y
    - `components/StoryOutput.tsx`: Clean state rendering with error handling
    - Converted API route to TypeScript with `runtime = "nodejs"`
    - Fixed TypeScript path aliases in `tsconfig.json`
    - Maintained fetch logic in page component with AbortController
- **Rationale**: Separation of concerns, reusability, better testing, accessibility compliance
- **Learning outcome**: Successfully implemented modular component architecture with proper TypeScript support
- **Files**: `components/StoryForm.tsx`, `components/StoryOutput.tsx`, `app/api/generate/route.ts`, `app/page.tsx`, `tsconfig.json`

### ADR-013: Prompt Management Strategy 🔜

**Week 2, Day 3**

- **Decision**: External markdown files for prompt templates
- **Implementation**:
    - `prompts/system.story.md` for role and guardrails
    - `prompts/user.story.md` for template with placeholders
    - File reading in API routes with `runtime = "nodejs"`
- **Previous limitation**: Hardcoded prompts mixed with application logic
- **Rationale**: Versionable prompts; easy A/B testing; no code redeploy for text tweaks
- **Learning outcome**: Understanding of file system operations in serverless environments
- **Files**: `prompts/`, `lib/prompt.ts`, updated API routes

### ADR-012: Documentation Structure ✅

**Week 2, Day 1**

- **Decision**: Dual documentation approach
    - `LLM_CONTEXT.md` for AI handoffs and project overview
    - `DECISIONS.md` for detailed decision tracking and rationale
- **Implementation**:
    - Created `docs/` folder structure
    - Implemented comprehensive `docs/DECISIONS.md` with ADR format
    - Added status tracking with emoji indicators (✅ ⏳ 🔜 ❌ ↻)
    - Included update prompts for daily/weekly maintenance
    - Documented all architectural decisions from Week 1 and Week 2
- **Rationale**: Different audiences need different levels of detail
- **Maintenance strategy**: Daily updates to DECISIONS.md; weekly updates to LLM_CONTEXT.md
- **Learning outcome**: Established professional documentation habits with clear decision tracking
- **Files**: `docs/DECISIONS.md`

---

## Current Status & Technical Debt

**Completed capabilities**

- ✅ Functional story generation with three reading levels
- ✅ Responsive web interface with kid-friendly design
- ✅ Production deployment with automated CI/CD
- ✅ Type-safe architecture with comprehensive error handling
- ✅ Request lifecycle management with memory safety
- ✅ Environment validation and centralized service configuration
- ✅ Modular component architecture with proper separation of concerns
- ✅ Professional documentation and version control

**Known limitations & planned mitigations**

- **No caching** → Add 24h cache by `hash(articleText|level)` (Week 3: Upstash Redis or DB TTL) 🔜
- **No persistence** → Add database for saved stories + user identification (Week 3: Supabase) 🔜
- **Minimal safety** → Add `lib/safety.ts` pre/post content checks + polite refusal path (Week 3) 🔜
- **Word-range drift** → Post-check word count & structure; regenerate if out of bounds (Week 2) 🔜
- **Manual paste only** → Add URL ingestion with article extraction (Week 4: Readability.js) 🔜
- **No analytics/monitoring** → Add error tracking and usage analytics (Week 4: Sentry + PostHog) 🔜
- **Hardcoded prompts** → Externalize to markdown files for versioning (Week 2: ADR-013) 🔜
- **No response validation** → Implement GenerateRes schema validation before returning (Week 2) 🔜

---

## Next Phase Planning (30-minute chunks)

**Week 2: Code Quality & Organization**

1. Environment + request validation (ADR-007/008) ✅
2. Type-safe architecture + request state management (ADR-009) ✅
3. OpenAI client abstraction (ADR-010) ✅
4. Documentation completion (ADR-012) ✅
5. Component extraction (ADR-011) ✅
6. Prompt externalization (ADR-013) 🔜
7. API response validation + word count validation 🔜
8. Testing and redeployment 🔜

**Week 3: Data & User Features**

- Database integration (Supabase) for story persistence 🔜
- Basic user identification and story history 🔜
- Story rating system for AI improvement 🔜
- Caching implementation for performance 🔜

**Week 4: Enhanced Features & Polish**

- DALL-E illustration generation for stories 🔜
- URL article ingestion capability 🔜
- Story export and sharing functionality 🔜
- Analytics and error monitoring 🔜

---

## Changelog (append-only)

- **Week 2, Day 2**: Completed ADR-011 - extracted StoryForm and StoryOutput components with proper contracts, accessibility, and TypeScript support; converted API route to TypeScript with runtime export; fixed path aliases; committed to GitHub ✅
- **Week 2, Day 1**: Completed ADR-009/010 - implemented comprehensive type-safe architecture with RequestState union, centralized OpenAI client, AbortController for request cancellation, and full TypeScript migration; committed to GitHub ✅
- **Week 2, Day 1**: Completed ADR-007/008/012 - implemented environment validation, API schema validation, and documentation structure; all marked as complete ✅
- **Week 2, Day 1**: Added ADR-007/008 for environment and request validation; marked as in progress
- **Week 1 completion**: Deployed MVP; recorded ADR-001 through ADR-006
- **Project start**: Initial documentation structure established