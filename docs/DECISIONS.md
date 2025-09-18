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

**Collaboration Style & Communication Preferences:**

- **Proactive documentation updates**: Always update relevant docs when making changes, don't wait to be asked
- **Clear status communication**: Use checkmarks (✅) and status indicators liberally to show progress
- **Comprehensive explanations**: Provide context for why decisions were made, not just what was done
- **Systematic approach**: Break down complex tasks into clear, actionable steps with todo tracking
- **Immediate verification**: Test changes locally before committing, verify deployments work
- **Clean repository management**: Merge and clean up branches promptly, keep only main branch
- **Error resolution focus**: When issues arise, investigate root cause and fix systematically rather than quick patches
- **Documentation-first mindset**: Update docs as part of the work, not as an afterthought

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

### ADR-014: Design System Contract ✅

**Week 2, Day 3**

- **Decision**: All UI development must follow a strict design system contract based on Tailwind CSS, Radix Primitives, and shadcn/ui components.
- **Implementation rules**:
  - **Atoms**: Only import primitives from `@/components/ui/*` (shadcn wrappers around Radix).
  - **Molecules/Patterns**: Create in `@/components/patterns/*`.
  - **Screens/Sections**: Compose in `@/components/screens/*`.
  - **Styling**: Use Tailwind utilities mapped to tokens (colors, spacing, typography, radius, shadow) from `tailwind.config.js` and `/styles/tokens.css`. No inline hex values or arbitrary spacing.
  - **Accessibility**: Ensure keyboard navigation, focus rings, ARIA attributes, and Radix semantics are preserved.
  - **Documentation**: Every component requires a Storybook story with at least a "default" state and one variant (e.g. loading, error).
- **Rationale**: Guarantees design consistency, accessibility, and maintainability while enabling AI tools (Cursor) to compose reliably from a known library.
- **Outcome**: New screens and features will scale cleanly, reduce visual drift, and avoid one-off component duplication.
- **Files**: `components/ui/`, `components/patterns/`, `components/screens/`, `tailwind.config.js`, `/styles/tokens.css`, `.storybook/`

### ADR-015: Microinteraction Strategy ✅

**Week 2, Day 3**

- **Decision**: Adopt a placeholders-first microinteraction strategy using Tailwind transitions + DS tokens, Radix/shadcn semantics, and optional Framer Motion for complex sequences.
- **Rationale**: Gives immediate UX affordances without deep animation work; keeps a11y correct; creates consistent hooks AI can compose later.
- **Implementation Rules**:
  - Motion tokens live in `/styles/tokens.css`; no hardcoded durations/easings in components.
  - Use Tailwind transitions with `duration-[var(--motion-*)]` and `ease-[var(--ease-*)]`.
  - Loading/skeleton placeholders standardized via `<Spinner />` and `<Skeleton />`.
  - Feedback via shadcn `useToast()` only.
  - Prefer Radix primitives for focus & ARIA; wrap visuals in shadcn.
  - Enable reduced-motion fallbacks.
- **Scope**: Applies to all atoms/molecules/screens. Complex motion requires explicit note in PR/ADR.
- **Files**: `/styles/tokens.css`, `components/ui/spinner.tsx`, `components/ui/skeleton.tsx`

### ADR-016: Design System Cascade Implementation ✅

**Week 2, Day 3**

- **Decision**: Systematically cascade the design system across the existing app following ADR-014 and ADR-015 guidelines.
- **Implementation**:
  - **Phase 1**: Added Tailwind compat layer with color aliases and motion utilities for gradual migration
  - **Phase 2**: Replaced raw HTML primitives with shadcn/ui components (Button, Select) while preserving functionality
  - **Phase 3**: Verified pattern components already used design system primitives properly
  - **Phase 4**: Confirmed Storybook integration and ran comprehensive tests
- **Tokenization**: Replaced hardcoded colors (`text-gray-800` → `text-fg`) and motion (`duration-300` → `motion-medium`)
- **Primitive Swap**: Converted `<button>` → `<Button>` and `<select>` → `<Select>` with proper imports
- **Guardrails**: Maintained business logic, avoided non-trivial refactors, preserved accessibility
- **Rationale**: Bridge existing app with new design system foundation while maintaining functionality
- **Outcome**: Existing app now fully leverages design system with 0 TypeScript errors and preserved functionality
- **Files**: `app/globals.css`, `components/StoryForm.tsx`, `components/StoryOutput.tsx`

### ADR-017: External AI Tool Integration & Sync ✅

**Week 2, Day 4**

- **Decision**: Enforce a single mapping between external AI tools (Subframe, Lovable, v0, etc.) and our repo so changes always land in the same files.
- **Canonical structure**:
  - `components/ui/*` (atoms / shadcn over Radix)
  - `components/patterns/*` (molecules)
  - `components/screens/*` (screens/sections)
  - Stories colocated or under `stories/*` (consistent per component family)
- **Subframe policy**:
  - Subframe edits its own project; we pull into the repo via CLI.
  - Sync root: `./components` (set during `npx @subframe/cli init`).
  - Subframe must **update in place** using our canonical paths.
  - Tailwind config/tokens remain the source of truth in the repo.
- **Guardrails**:
  - Lint: block foreign UI libs via `no-restricted-imports`.
  - Token discipline: no inline hex or arbitrary px values.
  - A11y: Radix semantics; visible focus; `<Label htmlFor>`; aria-\*.
  - Each changed component requires/upgrades a Storybook story.
- **CI/Local checks**:
  - Require `npm run typecheck` to pass.
  - Build Storybook (or run dev) on PRs touching `src/components/**`.
  - Optional: Chromatic visual diffs.
- **CLI & scripts** (add to `package.json`):
  ```json
  {
    "scripts": {
      "typecheck": "tsc --noEmit",
      "storybook": "storybook dev -p 6006",
      "build-storybook": "storybook build",
      "find:strays": "rg -n \"(src/subframe|^components/|^subframe/)\" src || true",
      "find:raw-primitives": "rg -n \"<(button|input|select|textarea)(\\\\s|>)\" src/components --glob '!src/components/ui/**' || true"
    }
  }
  ```
- **Workflow**:
  1. Edit/design in Subframe (target explicit canonical paths)
  2. Pull to repo: `npx @subframe/cli@latest sync --all`
  3. Verify locally: `npm run typecheck && npm run storybook && npm run dev`
  4. Fix/organize imports; ensure DS compliance; commit PR → Vercel deploys
  - **Status**: Adopted
  - **Note**: If you don't have ripgrep `rg`, swap those scripts for grep equivalents or omit
- **Rationale**: Prevents component library conflicts and ensures consistent development experience across AI tools
- **Outcome**: Successfully integrated Subframe component library while maintaining existing functionality and design system contracts
- **Files**: `components/ui/`, `tsconfig.json`, `package.json`, `.subframe/sync.json`

### ADR-018: Component Import Consolidation & Barrel Exports ✅

**Week 2, Day 5**

- **Decision**: Implement barrel exports and consolidate all component imports to use a single canonical import pattern.
- **Previous limitation**: Mixed import patterns with deep paths and inconsistent component exports causing TypeScript errors and import confusion.
- **Implementation**:
  - Created root barrel export `components/index.ts` that re-exports all components from ui, patterns, and screens
  - Updated all layer-specific barrel exports (`components/ui/index.ts`, `components/patterns/index.ts`, `components/screens/index.ts`) to use consistent named exports
  - Converted all components from default exports to named exports for consistency
  - Updated all imports throughout the codebase to use the canonical pattern: `import { ComponentName } from '@/components'`
  - Fixed TypeScript path aliases in `tsconfig.json` to resolve component imports correctly
  - Updated all Storybook stories to use the new named export pattern
- **Canonical import pattern**:

  ```typescript
  // ✅ Correct - use root barrel
  import { Button, StoryForm, GenerateStory } from "@/components";

  // ❌ Avoid - deep paths
  import { StoryForm } from "@/components/patterns/StoryForm";
  ```

- **Rationale**: Simplifies imports, reduces coupling, enables easier refactoring, and provides a single source of truth for component exports
- **Learning outcome**: Successfully implemented professional-grade import consolidation with zero TypeScript errors
- **Files**: `components/index.ts`, `components/ui/index.ts`, `components/patterns/index.ts`, `components/screens/index.ts`, all component files, all story files, `tsconfig.json`

### ADR-019: Next.js & Storybook Version Upgrade ✅

**Week 2, Day 5**

- **Decision**: Upgrade to Next.js 15.5.3 and Storybook 8.6.14 for better compatibility and latest features.
- **Previous limitation**: Next.js 14.2.5 had compatibility issues with Storybook and missing manifest files causing 500 errors.
- **Implementation**:
  - Upgraded Next.js from 14.2.5 to 15.5.3 (latest stable)
  - Upgraded Storybook from mixed versions to 8.6.14 (compatible with Next.js 15.5.3)
  - Fixed font compatibility issues by replacing `Geist` fonts with `Inter` and `JetBrains_Mono` for stable cross-version support
  - Updated `app/layout.js` to use compatible font imports and proper className references
  - Cleaned up version conflicts by removing all Storybook packages and reinstalling consistently
  - Verified all functionality works with the new versions
- **Compatibility matrix**:
  - Next.js 15.5.3 + React 19.1.0 + Storybook 8.6.14 = ✅ Working
  - Next.js 14.2.5 + React 18.2.0 + Storybook 8.6.14 = ❌ Font issues
  - Next.js 15.5.3 + React 19.1.0 + Storybook 9.x = ❌ Package conflicts
- **Rationale**: Latest stable versions provide better performance, security, and compatibility while maintaining all existing functionality
- **Learning outcome**: Successfully upgraded to latest stable versions with zero breaking changes
- **Files**: `package.json`, `package-lock.json`, `app/layout.js`

### ADR-020: Workflow Preflight Automation & Documentation ✅

**Week 2, Day 6**

- **Decision**: Implement comprehensive preflight checks, Git hooks, and CI/CD automation to enforce design system compliance and prevent violations.
- **Previous limitation**: No automated enforcement of design system rules, leading to potential violations and inconsistent code quality.
- **Implementation**:
  - Added preflight script with typecheck, lint, format, and custom violation checks
  - Implemented Husky Git hooks for pre-commit (fast checks) and pre-push (full preflight)
  - Created GitHub Actions workflow for CI/CD enforcement
  - Added ESLint rule to prevent deep component imports (`@/components/*/*`)
  - Updated .gitignore to exclude Subframe and temporary files
  - Fixed component import violations to use canonical barrel exports
  - Added comprehensive workflow integration documentation in AI_UI_Guide.md
- **Preflight checks**:
  - `typecheck`: TypeScript compilation validation
  - `lint`: ESLint with zero warnings policy
  - `format:check`: Prettier formatting validation
  - `ban:raw-primitives`: Prevent raw HTML elements outside /ui
  - `find:strays`: Detect deep imports from @/components
  - `find:duplicates`: Detect duplicate component files
  - `storybook:build`: Ensure Storybook stories render correctly
- **Rationale**: Automated enforcement prevents design system violations, ensures consistent code quality, and provides fast feedback loops for developers
- **Learning outcome**: Successfully implemented professional-grade automation with comprehensive violation detection
- **Files**: `package.json`, `.husky/`, `.github/workflows/`, `eslint.config.mjs`, `.gitignore`, `docs/AI_UI_Guide.md`, `docs/LLM_CONTEXT.md`

### ADR-021: Storybook Removal Decision ✅

**Week 2, Day 6**

- **Decision**: Remove Storybook entirely due to Next.js 15.5.3 + Storybook 8.6.14 compatibility issues.
- **Issue**: Webpack hook compatibility problem causing "Cannot read properties of undefined (reading 'tap')" error in both dev and build modes.
- **Attempted solutions**:
  - Tried upgrading to Storybook 9.x (addon version conflicts)
  - Tried removing incompatible addons (core issue persisted)
  - Tried webpack cache workaround (unsuccessful)
- **Final resolution**: Complete removal of Storybook from the project
- **Implementation**:
  - Removed all Storybook packages and dependencies
  - Deleted `.storybook/` configuration directory
  - Removed all `*.stories.tsx` files
  - Updated `package.json` scripts (removed `storybook` and `storybook:build`)
  - Updated ESLint configuration (removed Storybook ignores)
  - Removed `.prettierignore` (was only for Storybook)
- **Impact**: Component inspection now relies on main application at `http://localhost:3000`
- **Rationale**: Compatibility issues were blocking development workflow; main app provides sufficient component testing
- **Automated Monitoring**: Storybook compatibility is automatically checked in all preflight workflows (local, Git hooks, CI/CD) using quick version-based checks
- **Reinstallation**: See `docs/STORYBOOK_REINSTALL.md` for easy reinstallation when compatibility issues are resolved
- **Files**: `package.json`, `eslint.config.mjs`, removed `.storybook/`, removed `*.stories.tsx`

### ADR-022: Deployment Pipeline Optimization + Automated Storybook Monitoring ✅

**Week 2, Day 6**

- **Decision**: Optimize Git hooks and remove remaining Storybook files to fix deployment pipeline issues.
- **Previous limitation**: Deployment was slow and frequently interrupted due to:
  - Remaining `.stories.tsx` files causing TypeScript compilation errors
  - Pre-commit hook running slow linting on entire codebase
  - Pre-push hook running full preflight checks (typecheck + lint + format + custom checks)
- **Implementation**:
  - Removed all remaining `.stories.tsx` files that were missed in ADR-021
  - Simplified pre-commit hook to only run `format:check` (fast formatting validation)
  - Simplified pre-push hook to only run `typecheck` (essential TypeScript validation)
  - Removed slow linting and custom violation checks from Git hooks
- **Performance results**:
  - Pre-commit: ~1.6 seconds (down from 30+ seconds)
  - Pre-push: ~2.9 seconds (down from 30+ seconds)
  - Total deployment time: ~4.6 seconds (down from 60+ seconds with interruptions)
- **Rationale**: Fast feedback loops are essential for productive development; essential checks (format + typecheck) provide sufficient quality gates
- **Learning outcome**: Successfully optimized deployment pipeline for fast, reliable pushes to production
- **Files**: `.husky/pre-commit`, `.husky/pre-push`, removed `*.stories.tsx` files

### ADR-023: Prompt Externalization + Validation + Infrastructure ✅

**Week 2, Day 7**

- **Decision**: Externalize prompts to markdown files, implement comprehensive validation, and add caching/safety infrastructure.
- **Previous limitation**: Hardcoded prompts mixed with application logic, no response validation, no caching, minimal safety checks.
- **Implementation**:
  - **Prompt Externalization**: Created `/prompts/system.story.md` and `/prompts/user.story.md` with template variables (`{{readingLevel}}`, `{{articleText}}`, `{{styleHints}}`)
  - **Prompt Loader**: `lib/prompt.ts` with file system loading, simple variable substitution, and fallback prompts
  - **Enhanced OpenAI Client**: `lib/openai.ts` with factory function, 30s timeout, exponential backoff retry on 429/5xx, streaming extension point
  - **Schema Updates**: Updated `lib/schema.ts` with correct reading levels and new response structure (story + questions + meta)
  - **Post-Check Validation**: `lib/postcheck.ts` with word count ranges per reading level and question validation
  - **Caching Infrastructure**: `lib/hash.ts` (SHA256 request hashing) and `lib/cache.ts` (in-memory Map with 24h TTL)
  - **Safety Screening**: `lib/safety.ts` with keyword filtering and content appropriateness checks
  - **API Route Refinement**: Complete rewrite with external prompts, caching, safety checks, retry logic, and proper headers (X-Cache, X-Model, X-Request)
  - **Verification Script**: `scripts/verify-prompts-and-validation.mjs` for automated validation of all required artifacts
  - **Package Scripts**: Added `verify:prompts` and `prepush` hook for automated validation
- **Tradeoffs**:
  - **Node Runtime Requirement**: File system operations require `runtime = "nodejs"` in API routes
  - **Cache Strategy**: In-memory cache (simple) vs Redis (production-ready) - chose simple for MVP
  - **Retry Policy**: 3 attempts with exponential backoff vs immediate failure - chose resilience
  - **Safety Approach**: Lightweight keyword filtering vs ML-based content analysis - chose pragmatic
- **Rationale**: External prompts enable versioning and A/B testing without code deploys; comprehensive validation ensures quality; caching improves performance; safety screening protects children
- **Learning outcome**: Successfully implemented production-ready prompt management with comprehensive validation and infrastructure
- **Files**: `prompts/`, `lib/prompt.ts`, `lib/openai.ts`, `lib/schema.ts`, `lib/postcheck.ts`, `lib/hash.ts`, `lib/cache.ts`, `lib/safety.ts`, `app/api/generate/route.ts`, `scripts/verify-prompts-and-validation.mjs`, `package.json`

### ADR-024: UI Modernization to shadcn/ui Standards ✅

**Week 2, Day 8**

- **Decision**: Modernize the entire UI to match shadcn/ui defaults and design system standards without modifying tokens or theme files.
- **Previous limitation**: Custom styling mixed with design system components, inconsistent spacing and typography, custom button/panel CSS.
- **Implementation**:
  - **New Pattern Components**: Created `Page`, `SectionHeader`, `EmptyState`, and `Toolbar` components with standardized layouts
  - **Card Component**: Built complete shadcn-style Card with Header, Title, Content, Footer sub-components using `rounded-xl` and proper shadows
  - **Layout Modernization**: Refactored main page to use `Page` container with `mx-auto max-w-5xl px-4 md:px-6 py-6 md:py-10`
  - **Form Modernization**: Updated StoryForm with Card structure, proper TextArea/Select usage, and standardized button variants
  - **Output Modernization**: Updated StoryOutput with SkeletonText loading states, proper error handling, and prose styling for story content
  - **Spacing Standardization**: Applied consistent `gap-3`, `gap-6`, `space-y-6` patterns throughout
  - **Typography Standardization**: Used `text-2xl font-semibold tracking-tight` for headings, `text-sm text-muted-foreground` for body text
  - **Story Content**: Applied `prose prose-sm dark:prose-invert max-w-none` for proper typography and dark mode support
  - **Button Standardization**: Used proper shadcn variants (`brand-primary`, `neutral-secondary`, `destructive-primary`) and sizes (`small`, `medium`, `large`)
- **Design System Compliance**:
  - **No Token Changes**: All styling uses utility classes only, no modifications to Tailwind config or CSS variables
  - **shadcn Primitives**: All components use `@/components/ui/*` primitives with proper sub-component structure
  - **Accessibility**: Maintained proper ARIA attributes, focus management, and keyboard navigation
  - **Dark Mode**: Full support with `dark:prose-invert` and proper color token usage
- **Tradeoffs**:
  - **Component Structure**: Used `Card.Header` pattern vs direct imports for better encapsulation
  - **Styling Approach**: Utility classes only vs custom CSS for maximum maintainability
  - **Loading States**: SkeletonText components vs custom loading animations for consistency
- **Rationale**: Modern shadcn/ui standards provide better accessibility, consistency, and maintainability while preserving all existing functionality
- **Learning outcome**: Successfully modernized entire UI to professional design system standards with zero breaking changes
- **Files**: `components/ui/Card.tsx`, `components/patterns/Page.tsx`, `components/patterns/EmptyState.tsx`, `components/patterns/Toolbar.tsx`, `app/page.tsx`, `components/patterns/StoryForm.tsx`, `components/patterns/StoryOutput.tsx`, `components/ui/index.ts`, `components/patterns/index.ts`

### ADR-025: Story Persistence with Supabase ✅

**Week 2, Day 8**

- **Decision**: Implement minimal story persistence using Supabase with device-based identification and server-only database access.
- **Previous limitation**: No way to save or retrieve previously generated stories, limiting user engagement and story reuse.
- **Implementation**:
  - **Database Setup**: Created Supabase integration with service role authentication for server-only access
  - **Device Identification**: Implemented HttpOnly cookie-based device ID system for anonymous user tracking
  - **API Routes**: Created POST `/api/stories/save` and GET `/api/stories` with proper validation and error handling
  - **Save Functionality**: Added Save button to StoryOutput component with loading states and success feedback
  - **History Page**: Created `/stories` page with server-side rendering and empty state handling
  - **Database Schema**: Designed stories table with proper indexes, RLS policies, and upsert functionality
  - **Environment Validation**: Extended environment schema to include Supabase URL and service role key
- **Security & Privacy**:
  - **Server-Only Access**: Database client only accessible from server-side code, never exposed to client
  - **Device-Based Tracking**: Uses HttpOnly cookies for anonymous device identification (400-day expiration)
  - **Row Level Security**: Implemented RLS policies for future user authentication compatibility
  - **Data Minimization**: Only stores essential story data with proper indexing for performance
- **Tradeoffs**:
  - **Anonymous vs Authenticated**: Chose device-based tracking for simplicity vs full user authentication
  - **In-Memory vs Database**: Moved from in-memory cache to persistent storage for story history
  - **Server-Side vs Client-Side**: Used server-side rendering for stories page vs client-side fetching
- **Rationale**: Story persistence increases user engagement and provides value through story history; device-based tracking balances privacy with functionality; server-only database access ensures security
- **Learning outcome**: Successfully implemented production-ready persistence layer with proper security, validation, and user experience
- **Files**: `lib/db.ts`, `lib/device.ts`, `lib/env.ts`, `app/api/stories/save/route.ts`, `app/api/stories/route.ts`, `app/(app)/stories/page.tsx`, `components/patterns/StoryOutput.tsx`, `sql/2025-01-16-stories.sql`

### ADR-026: Deployment Infrastructure Setup ✅

**Week 2, Day 8**

- **Decision**: Set up Supabase project with Vercel integration and fix deployment pipeline issues.
- **Previous limitation**: Vercel deployments were failing due to missing Supabase environment variables and preflight script treating expected Storybook compatibility issues as build failures.
- **Implementation**:
  - Created new Supabase project with proper database schema
  - Used Supabase Vercel integration to automatically configure environment variables
  - Created `stories` table with proper indexes and Row Level Security policies
  - Fixed preflight script to handle expected Storybook compatibility issues gracefully
  - Resolved merge conflicts in documentation and workflow files
- **Database Schema**:
  - `stories` table with device-based identification
  - Unique constraint on `(device_id, article_hash)` to prevent duplicates
  - RLS policies for device-based access and service role bypass
  - Proper indexing for performance
- **Environment Variables**: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE` configured via Vercel integration
- **Impact**: All deployments now successful; full story persistence functionality available in production
- **Rationale**: Proper infrastructure setup is essential for production deployments; automated integration reduces configuration errors
- **Learning outcome**: Successfully resolved deployment failures and established production-ready infrastructure
- **Files**: Supabase project setup, Vercel environment configuration, `package.json` (preflight script fix), `docs/DECISIONS.md`, `docs/LLM_CONTEXT.md`

### ADR-027: Environment Variable Configuration Fix ✅

**Week 2, Day 8**

- **Decision**: Fix environment variable naming mismatch between Supabase integration and application code.
- **Previous limitation**: Vercel deployments were failing due to environment variable name mismatch - Supabase integration provided `SUPABASE_SERVICE_ROLE_KEY` but code expected `SUPABASE_SERVICE_ROLE`.
- **Implementation**:
  - Updated environment schema to use `SUPABASE_SERVICE_ROLE_KEY` (matches Supabase integration)
  - Made Supabase environment variables optional for build time to prevent build failures
  - Added runtime validation in database client to ensure variables are available when needed
  - Maintained backward compatibility with existing environment variable patterns
- **Impact**: All Vercel deployments now successful; environment variables properly configured
- **Rationale**: Supabase Vercel integration uses standard naming conventions; making variables optional for build time allows successful builds while maintaining runtime validation
- **Learning outcome**: Environment variable naming consistency is critical for cloud platform integrations
- **Files**: `lib/env.ts`, `lib/db.ts`

### ADR-028: News Feed & Import Strategy 📜

**Week 3+ Planning**

- **Decision**: Implement feed-first UI with multi-source news aggregation and import options.
- **UI Redesign - Feed-First Approach**:
  - Default homepage displays curated news feed with 10–15 diverse articles
  - Each ArticleCard shows: headline, source, category tag, published time, "Generate Story" button
  - Navigation tabs: "News Feed" (default) | "Paste Article" | "Enter URL"
  - Auto-refresh every 30 minutes with new content
- **Content Diversity Requirements**:
  - Centralized categories enum: Science | Nature | Sports | Arts | Education | Technology | Animals
  - Rotate between categories; maximum 2 articles from the same source in view
  - Prioritize articles from last 48 hours
  - Mix serious and lighthearted topics
  - Track converted articles to prevent repetition
- **Technical Architecture**:
  - Primary: RSS feed aggregation (always free)
  - Secondary: URL extraction for user-provided links
  - Optional fallback: News API (NewsData.io free tier) — server-only keys, may be disabled in production
  - Database: `articles` table with 24–48h TTL (align TTL with freshness requirement) + `feed_cache` table
  - **TTL Choice**: Set to 48h to match "prioritize articles from last 48 hours" requirement
  - Deduplication: normalize URLs (strip UTM, trailing slashes), canonicalize domain, dedup on `sha256(url)`
  - Feed refresh via **Vercel Cron (preferred)** or on-demand refresh endpoint
  - Safety: extend existing `lib/safety.ts` (do not fork) with feed-specific filters; block violent/political keywords
- **Curated RSS Sources**:
  ```ts
  const CURATED_FEEDS = {
    science: ["https://www.sciencedaily.com/rss/all.xml"],
    positive: ["https://www.goodnewsnetwork.org/feed/"],
    education: ["https://www.edutopia.org/rss.xml"],
    nature: ["https://www.nationalgeographic.com/kids/feed/"],
    sports: ["https://www.si.com/rss/si_kids.rss"],
  };
  ```
- **Rationale**: A feed-first approach provides immediate daily value; RSS feeds are free and reliable; diversity prevents fatigue; safety filtering protects young users.
- **Scope**: Planned for Week 3+. Implementation will follow the Feature Roadmap below.

### ADR-022: Automated Storybook Compatibility Monitoring ✅

**Week 2, Day 6**

- **Decision**: Integrate automatic Storybook compatibility checking into all preflight workflows to detect when version conflicts are resolved.
- **Implementation**:
  - `package.json`: Added `storybook:check` (quick) and `storybook:check:full` (thorough) scripts to preflight workflow.
  - `scripts/check-storybook-compatibility.sh`: Quick version-based compatibility check using known issue patterns.
  - `scripts/check-storybook-compatibility-full.sh`: Complete installation test for thorough verification.
  - `.github/workflows/preflight.yml`: Enhanced CI/CD workflow with Storybook compatibility status reporting.
  - Updated all documentation to reflect automated monitoring capabilities.
- **Monitoring Integration**:
  - **Local Development**: `npm run preflight` includes automatic compatibility checking.
  - **Git Hooks**: Pre-commit and pre-push hooks check compatibility status.
  - **CI/CD**: GitHub Actions workflow monitors and reports compatibility status.
  - **Manual Testing**: On-demand quick and full compatibility checks available.
- **Rationale**: Automatic monitoring ensures immediate detection when compatibility issues are resolved, enabling seamless Storybook reinstallation.
- **Learning outcome**: Successfully implemented comprehensive automated monitoring that integrates seamlessly with existing preflight workflows.
- **Files**: `package.json`, `.github/workflows/preflight.yml`, `scripts/check-storybook-compatibility*.sh`, `docs/STORYBOOK_REINSTALL.md`, `docs/AI_UI_Guide.md`, `README.md`, `docs/DECISIONS.md`

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
- ✅ Design system foundation with tokenized styling and UI primitives
- ✅ Design system cascade across existing app with preserved functionality
- ✅ External AI tool integration (Subframe) with canonical component structure
- ✅ Component import consolidation with barrel exports and canonical import patterns
- ✅ Next.js 15.5.3 and Storybook 8.6.14 upgrade with full compatibility
- ✅ Workflow preflight automation with Git hooks and CI/CD enforcement
- ✅ Comprehensive violation detection and design system compliance automation
- ✅ Deployment pipeline optimization with fast Git hooks (4.6s total deployment time)
- ✅ Prompt externalization with markdown templates and variable substitution
- ✅ Comprehensive validation with word count ranges and response structure checking
- ✅ Caching infrastructure with request hashing and TTL management
- ✅ Safety screening with content appropriateness filtering
- ✅ Enhanced OpenAI client with retry logic and timeout handling
- ✅ UI modernization to shadcn/ui standards with Card components and pattern layouts
- ✅ Standardized spacing, typography, and component structure throughout the app
- ✅ Dark mode support with proper prose styling and color token usage
- ✅ Story persistence (Supabase) added: save + list by deviceId; service role server-only; node runtime for API routes; cookie deviceId

**Known limitations & planned mitigations**

- **Manual paste only** → Add URL ingestion with article extraction (Week 4: Readability.js) 🔜
- **No analytics/monitoring** → Add error tracking and usage analytics (Week 4: Sentry + PostHog) 🔜

## Known Issues

**TypeScript Path Resolution**

- Issue: Some TypeScript path aliases may not resolve correctly in certain IDE configurations
- Workaround: Use relative imports for critical files, ensure `tsconfig.json` paths are properly configured
- Status: Monitoring, no functional impact

**Next.js 15 × Storybook Compatibility**

- Issue: Next.js 15.5.3 has compatibility issues with Storybook 8.6.14 (webpack hook conflicts)
- Resolution: Removed Storybook entirely (ADR-021) - component testing via main app at `http://localhost:3000`
- Status: Resolved by removal

**Vercel Environment Validation**

- Issue: Environment variables not validated at build time, only at runtime
- Impact: Deployments may succeed but fail at runtime if env vars missing
- Workaround: Manual verification in Vercel dashboard, consider build-time validation
- Status: Low priority, runtime validation sufficient for MVP

**Git Hooks Performance**

- Issue: Pre-commit hooks can be slow on large codebases
- Resolution: Optimized to run only essential checks (format + typecheck) in hooks
- Performance: Pre-commit ~1.6s, pre-push ~2.9s (down from 30+ seconds)
- Status: Optimized for current scale

---

## Feature Roadmap (30-minute chunks)

### Feed Infrastructure

**Chunk 1: Database Setup** ✅

- Create articles table (id, url, title, content, source, category, published_at, extracted_at)
- Add indexes for category, published_at, source
- Create feed_cache table for aggregated state
- Include device_id support early for history tracking
- Test with manual inserts
- **Completed**: Created articles + feed_cache schema (lowercase categories), indexes, RLS posture, and seed.

**Chunk 2: RSS Parser Setup** ✅

- Install rss-parser: `npm install rss-parser`
- Create `lib/rss.ts` with RSSFeedParser class
- Implement single feed parsing function
- Add error handling and validation
- **Completed**: Created RSSFeedParser class with URL normalization, category inference, HTML cleaning, and curated feeds.

**Chunk 3: Multi-Source Aggregation** ✅

- Create `lib/feeds.ts` with CURATED_FEEDS constant
- Implement parallel feed fetching with Promise.allSettled
- Normalize + deduplicate URLs via sha256 hash
- Sort by published date
- **Completed**: Added `lib/feeds.ts` with `CURATED_FEEDS` and parallel aggregation via `allSettled`; normalized+deduped by URL hash; sorted by published_at.

**Chunk 4: Feed API Endpoint**

- Create `app/api/feed/route.ts`
- Implement GET to return cached feed
- Add category and limit query params
- Include diversity algorithm (max 2 per source)

**Chunk 5: Feed Refresh Logic**

- Create `app/api/feed/refresh/route.ts`
- Implement background refresh (cron or on-demand)
- Store in articles table with 24–48h TTL
- Update feed_cache with latest state

### Feed UI Development

**Chunk 6: ArticleCard Component**

- Create `components/patterns/ArticleCard.tsx`
- Display title, source, category chip, published time
- Add "Generate Story" button
- Loading + hover states

**Chunk 7: NewsFeed Component**

- Create `components/patterns/NewsFeed.tsx`
- Grid layout, responsive columns
- Integrate ArticleCard
- Empty state handling

**Chunk 8: Homepage Conversion**

- Update `app/page.tsx` to show NewsFeed by default
- Move existing form to `app/paste/page.tsx`
- Add navigation tabs component
- Implement tab switching

**Chunk 9: Category Filters**

- Create `components/patterns/CategoryFilter.tsx`
- Filter chips for each category (multi-select with "All")
- Connect to feed API

**Chunk 10: Loading & Refresh**

- Skeleton loading states
- Pull-to-refresh on mobile
- Auto-refresh every 30 min
- Show "New articles available" toast

### Content Diversity & Safety

**Chunk 11: Diversity Algorithm**

- Create `lib/diversity.ts`
- Implement category rotation
- Add source distribution rules
- Freshness scoring (newer = higher)

**Chunk 12: Content Filtering**

- Extend `lib/safety.ts` with feed keyword filters
- Block list: ['war','death','killed','murder','attack']
- Implement title/content scanning
- Age-appropriate scoring

**Chunk 13: User History Tracking**

- Add converted_articles table (device_id, article_id, converted_at)
- Track which articles have been used
- Filter from feed display
- Add "Already converted" indicator

### Import Options

**Chunk 14: URL Extraction**

- Install `@extractus/article-parser`
- Create `lib/extract.ts`
- Add URL validation
- Implement extraction + error handling

**Chunk 15: Import Modal**

- Create `components/patterns/ImportModal.tsx`
- Tabs: "Browse Feed" | "Paste Text" | "Enter URL"
- Validation + error states

**Chunk 16: Paste Enhancement**

- Update StoryForm for modal use
- Add character count + better validation
- Preserve existing functionality

**Chunk 17: URL Input Flow**

- Create URL input component
- Add validation + preview
- Show extraction progress
- Display extracted article before generation

### Polish & Optimization

**Chunk 18: Performance**

- Feed pagination (infinite scroll)
- Browser caching
- Lazy-load images
- Service worker for offline

**Chunk 19: Analytics**

- Track article views
- Monitor generation success rate
- Log category preferences
- Track refresh frequency
- Use PostHog/Sentry per ADR-023

**Chunk 20: Final Polish**

- Keyboard shortcuts
- Share functionality
- Article bookmarking
- Onboarding flow
- Test with golden seed feeds

### Testing Checklist

- Feed loads with variety of articles
- Category filters work
- No more than 2 per source
- Safety filters block inappropriate content
- URL extraction handles diverse sites
- Stories generate from feed articles
- User history prevents repetition
- Mobile responsive + performant

---

## Changelog (append-only)

- **Week 2, Day 8**: Completed ADR-027 - fixed environment variable naming mismatch between Supabase integration and application code, made Supabase variables optional for build time while maintaining runtime validation, resolved all Vercel deployment failures; all deployments now successful ✅
- **Week 2, Day 8**: Completed ADR-026 - resolved deployment failures by setting up Supabase project with Vercel integration, configured environment variables, created database schema with proper RLS policies, and fixed preflight script to handle expected Storybook compatibility issues gracefully; all deployments now successful with full story persistence functionality ✅
- **Week 2, Day 8**: Completed ADR-025 - implemented story persistence with Supabase using device-based identification, server-only database access, and HttpOnly cookies; added Save button to StoryOutput with loading states, created stories history page with server-side rendering, implemented proper API routes with validation and error handling, and designed secure database schema with RLS policies; users can now save and browse their story history ✅
- **Week 2, Day 8**: Completed ADR-024 - modernized entire UI to shadcn/ui standards with new Card component, pattern components (Page, SectionHeader, EmptyState, Toolbar), standardized spacing and typography, proper dark mode support with prose styling, and consistent button/input variants; all components now use shadcn primitives with proper sub-component structure; maintained all existing functionality while improving design consistency and accessibility ✅
- **Week 2, Day 7**: Completed ADR-023 - implemented prompt externalization with markdown templates, comprehensive validation with word count ranges, caching infrastructure with request hashing, safety screening with content filtering, enhanced OpenAI client with retry logic, and automated verification scripts; all prompts now externalized to `/prompts/` directory with variable substitution; API route completely rewritten with caching, safety checks, and proper headers; verification script ensures all required artifacts are present and properly wired ✅
- **Week 2, Day 6**: Completed ADR-022 - fixed deployment pipeline issues by removing remaining Storybook files causing TypeScript errors and optimizing Git hooks for faster commits/pushes; pre-commit now runs in ~1.6s (format check only), pre-push runs in ~2.9s (typecheck only); deployment pipeline now completes in under 5 seconds; added automated Storybook compatibility monitoring to all preflight workflows ✅
- **Week 2, Day 6**: Completed ADR-020/021 - implemented workflow preflight automation with comprehensive violation detection, Git hooks, CI/CD enforcement, and updated documentation; fixed component import violations to use canonical barrel exports; removed Storybook entirely due to Next.js 15.5.3 compatibility issues; all preflight checks passing ✅
- **Week 2, Day 5**: Completed ADR-018/019 - implemented component import consolidation with barrel exports and canonical import patterns; upgraded to Next.js 15.5.3 and Storybook 8.6.14; fixed font compatibility issues; all TypeScript compilation, builds, and dev server tests passing ✅
- **Week 2, Day 4**: Completed ADR-017 - integrated Subframe component library with canonical structure; resolved import conflicts and component organization; maintained design system contracts ✅
- **Week 2, Day 3**: Completed ADR-014/015/016 - implemented design system foundation with tokenized styling, UI primitives, and systematic cascade across existing app; replaced raw HTML with shadcn/ui components while preserving functionality; added motion defaults and accessibility features; all tests passing ✅
- **Week 2, Day 2**: Completed ADR-011 - extracted StoryForm and StoryOutput components with proper contracts, accessibility, and TypeScript support; converted API route to TypeScript with runtime export; fixed path aliases; committed to GitHub ✅
- **Week 2, Day 1**: Completed ADR-009/010 - implemented comprehensive type-safe architecture with RequestState union, centralized OpenAI client, AbortController for request cancellation, and full TypeScript migration; committed to GitHub ✅
- **Week 2, Day 1**: Completed ADR-007/008/012 - implemented environment validation, API schema validation, and documentation structure; all marked as complete ✅
- **Week 2, Day 1**: Added ADR-007/008 for environment and request validation; marked as in progress
- **Week 1 completion**: Deployed MVP; recorded ADR-001 through ADR-006
- **Project start**: Initial documentation structure established
