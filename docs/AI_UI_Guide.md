# AI UI & Design System Guide

This guide is for **any AI tool** (Cursor, Subframe, Lovable, or others) that generates or refines UI in this repo.

It summarizes the design system contract from `/docs/LLM_CONTEXT.md` and ADR-014/015, and incorporates ADR-017 for external AI tool integration and sync.

---

⚠️ **Assistant Instruction**  
When preparing Cursor prompts based on this document:

- Default to **Minimal Plus level** (intent + critical requirements + guardrails + verify).
- Include business rules that can't be inferred from code (thresholds, limits, algorithms).
- Use **Standard or Detailed** only if explicitly requested or introducing new patterns/libraries.
- Do **not** include implementation details Cursor can infer from existing patterns.

---

## AI Assistant Prompting Style & Cursor Prompt Guidelines

When generating Cursor prompts, follow these principles:

- **Default to brevity:** Provide intent, scope, and essential guardrails only.
- **Do not** include line-by-line code, SQL, or prescriptive implementation unless explicitly asked.
- **Always include:**
  - Scope (e.g., "Chunk 3 – Multi-Source Aggregation" from `docs/DECISIONS.md`)
  - Guardrails (server-only, category enum, barrel imports, no new deps, etc.)
  - Doc update notes (what to mark in `DECISIONS.md` or `LLM_CONTEXT.md`)
  - Quick Verify reference (typecheck/dev or Mini Test Plan)

### Prompt Detail Levels

- **Minimal (avoid - often too vague)**
  - State WHAT to build without critical requirements
  - Missing business rules that can't be inferred
  - ~3-5 lines total
  - Risk: May require multiple iterations

- **Minimal Plus (preferred default) ✅**
  - State WHAT to build + critical business requirements
  - Include non-inferrable rules (limits, thresholds, algorithms)
  - Reference existing patterns/files to modify
  - Essential guardrails only (no new deps, type safety)
  - ~6-10 lines total
  - Let Cursor infer implementation from codebase patterns

- **Standard (when introducing new patterns)**
  - Add technical architecture decisions
  - Specify integration points and data flow
  - ~10-20 lines total
  - Use for: new libraries, new architectural patterns, breaking changes

- **Detailed (rare - only for critical/novel work)**
  - Include type definitions or algorithmic steps
  - Explain complex business logic
  - ~20+ lines
  - Use only for: security-critical, safety-sensitive, or completely novel features

### Example Minimal Plus Prompt

Implement [Feature] from docs/DECISIONS.md.
Create [file]:

[main function signature + return type]
Business rules: [specific non-inferrable requirements]
[where to extract/integrate existing code]
Guardrails: [essential constraints only]

Update [integration points].
Update docs/DECISIONS.md: Mark [Chunk] ✅
Verify: [simple test]

---

## Current Story Generation Features

### Word Count Optimization (5-Minute Reading Experience)

- **Preschool**: 100-300 words (2-3 minutes reading time)
- **Early Elementary**: 200-500 words (3-4 minutes reading time)
- **Elementary**: 300-800 words (4-5 minutes reading time)

### Story Generation Flow

1. **Homepage**: Browse news articles with category filtering
2. **ArticleCard**: Click "Generate Story" button
3. **AI Processing**: OpenAI creates child-friendly allegorical story
4. **Paste Page**: Display generated story with discussion questions (paste form hidden for focus)
5. **Save/Share**: Users can save or share the generated stories

### Key Components

- **NewsFeed**: Grid layout with skeleton loading and pull-to-refresh
- **CategoryFilter**: Multi-select filtering with URL persistence
- **ArticleCard**: News article display with generation button
- **StoryOutput**: Generated story display with questions
- **Suspense Boundaries**: Proper loading states for useSearchParams

## 1. Design System Contract (summary)

> Full rules live in `/docs/LLM_CONTEXT.md` and ADR-014/015 in `/docs/DECISIONS.md`.  
> For external AI tool workflows, see ADR-017.

- **Imports**: Use only `@/components/ui/*` primitives (shadcn over Radix).
- **Composition layers**:
  - Atoms → `components/ui/*`
  - Molecules → `components/patterns/*`
  - Screens → `components/screens/*`
- **Styling**: Tailwind utilities mapped to tokens in `/styles/tokens.css` and `tailwind.config.ts`.
  - No inline hex colors or arbitrary px spacing.
- **Accessibility**:
  - Always use `<Label htmlFor>` with inputs
  - Use Radix primitives (Dialog, Tooltip, Toast) for focus management and ARIA semantics
  - Keep focus rings visible
- **Microinteractions**:
  - Motion tokens: `--motion-fast`, `--motion-medium`, `--motion-slow`, `--ease-standard`, `--ease-emphasized`
  - Use `<Spinner />` and `<Skeleton />` for loading/placeholder states
  - Respect `prefers-reduced-motion`
- **Typing**: Strong TypeScript only (no `any`).
- **Documentation**: Add or update Storybook stories for each component (default + at least one variant). _Note: Storybook temporarily disabled due to Next.js 15.5.3 compatibility issues - test via main application at `http://localhost:3000`. Storybook stories will be automatically created when compatibility is restored._

---

## 2. Mapping Table (Subframe → Repo DS)

| **Subframe Construct** | **Repo Equivalent**           | **Target Path in Repo**                                            | **Notes**                                                                                         |
| ---------------------- | ----------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Pages**              | Screens                       | `components/screens/*`                                             | One per top-level route (e.g. `GenerateStory.tsx`). Screens compose patterns.                     |
| **Components**         | UI Primitives **or** Patterns | `components/ui/*` (atoms) <br> `components/patterns/*` (molecules) | Atomic (button, input, card) → UI. Composed block (form, preview) → Patterns.                     |
| **Themes**             | Tokens                        | `/styles/tokens.css` + `tailwind.config.(ts                        | js)`                                                                                              | Subframe themes are sketches; source of truth = repo tokens. Apply manually if useful. |
| **Templates**          | Patterns **or** Screens       | `components/patterns/*` <br> `components/screens/*`                | Small reusable layout → Pattern. Full-page scaffold → Screen. Do not create a "templates" folder. |

## 3. Prompt Templates

Use these when asking an AI tool to make changes.

- **Always begin with the global context:** Use `/docs/LLM_CONTEXT.md`, ADR-014/015 (DS rules), and ADR-017 (tool integration & sync) as context.
- Update **existing** components in place; do not create duplicates or add new UI libraries.
- Imports must come from `@/components/ui/*` and styling must use Tailwind tokens.

### Refine a Primitive

### Refine a Primitive

Update components/ui/button.tsx.

- Add microinteractions using motion tokens
- Preserve shadcn structure and exports
- Update its Storybook story with default, disabled, and loading states (temporarily test via main app)
- Storybook stories will be automatically created when compatibility is restored

### Refine a Pattern

Create or refine components/patterns/StoryForm.tsx.

- Compose from @/components/ui/\* only
- Keep props strongly typed
- Add Storybook story with default and error states (temporarily test via main app)
- Storybook stories will be automatically created when compatibility is restored

### Refine a Screen

Refine components/screens/GenerateStory.tsx.

- Improve spacing and hierarchy using Tailwind tokens
- Extract StoryForm and StoryPreview into components/patterns/
- Compose them back into GenerateStory.tsx
- Add or update Storybook stories for screen + patterns (temporarily test via main app)
- Storybook stories will be automatically created when compatibility is restored

### Update Tokens / Theme

Adjust brand colors in /styles/tokens.css.

- Do not edit component code directly
- Update Design System/Overview story to show new swatches

### Accessibility Review

Ensure inputs, dialogs, and tooltips follow Radix semantics.

- Add <Label htmlFor/> to inputs
- Ensure focus rings and aria-\* attributes
- Update Storybook stories with accessibility notes (temporarily test via main app)
- Storybook stories will be automatically created when compatibility is restored

---

## 4. Workflow Integration (External Tools + Preflight Checks)

This section defines how to integrate visual prototyping tools (Cursor, Subframe, Lovable, v0, etc.) with our codebase without creating duplicates or messy divergence.

### Source of Truth

- **Repo is canonical.** All external tools must update existing files in place under canonical paths:
  - `components/ui/*` (primitives)
  - `components/patterns/*` (molecules)
  - `components/screens/*` (screens)

### Decision Tree

- **Exploring a design idea?** → Prototype visually in Subframe/Figma/v0. Do not import code. Take screenshots/exports for reference.
- **Refining an existing component?** → Use Cursor with explicit file paths and the standard header to modify the file in place.
- **Building something new?** → Prototype visually, then recreate with our primitives/patterns in Cursor.
- **Blocked and need scaffolding?** → Controlled sync from Subframe (see below).

### Controlled Sync (Exception Only)

- Use **only** on a branch named `sync/subframe-YYYYMMDD`.
- Run:
  ```bash
  npx @subframe/cli@latest sync --all
  ```
- Immediately run the preflight checks (below).
- Manually map files into the correct folders; never accept new folders outside /components/ui|patterns|screens.
- Add `// @subframe/sync-disable` to protect files from overwrite.

### Preflight Checklist (run before any PR/merge)

```bash
npm run typecheck            # essential TypeScript validation
npm run format:check         # code formatting validation
npm run ban:raw-primitives   # no raw <button>, <input>, etc. outside /ui
npm run find:strays          # no deep imports
npm run find:duplicates      # no duplicate component files
npm run storybook:check      # automatically check Storybook compatibility
# Note: All checks are available via `npm run preflight` for convenience
```

### Git Workflow (summary)

```bash
git checkout main && git pull
git checkout -b feat/<name>             # normal work
# or
git checkout -b sync/subframe-YYYYMMDD  # rare controlled sync

# make changes…

# Git hooks handle validation automatically:
git add -A && git commit -m "feat: <what changed>"  # ~1.6s (format check)
git push -u origin HEAD                              # ~2.9s (typecheck)
# Open PR → squash → merge into main (deploys via Vercel)
```

### .gitignore Rules

```bash
.subframe/
subframe-components/
*-backup.tsx
*.generated.tsx
components/temp/
components/draft/
```

### Cursor Prompt Stub

```sql
You are updating an existing component in a DS-constrained repo.

Constraints:
- Use ONLY imports from "@/components" (barrel).
- Update THIS file in place: <path/to/file.tsx>.
- Compose from primitives in components/ui/* and patterns in components/patterns/*.
- Do not create new folders or files. Do not add new deps.
- Add/Update a Storybook story for this component (default + one variant). *Temporarily test via main app.*
- Storybook stories will be automatically created when compatibility is restored.

Task:
<what to change / screenshot reference / behavior>

After change: explain the diff briefly.
```

---

## 5. Quick Verify Steps

When an AI tool makes changes, ask it to also:

1. Run `npm run typecheck` → confirm 0 errors.
2. Run `npm run storybook:check` → confirm Storybook compatibility status.
3. Run `npm run dev` → confirm app boots on `http://localhost:3000`.
4. Summarize which files changed and why.

---

## Troubleshooting

### Shell Environment Issues

**Problem**: AI tools may encounter `zsh:1: command not found: dump_zsh_state` errors when running git commands.

**Solution**: Use bash to bypass shell configuration issues:

```bash
# Instead of: git add .
bash -c "cd '/path/to/project' && git add ."

# Instead of: git commit -m "message"
bash -c "cd '/path/to/project' && git commit -m 'message'"

# Instead of: git push origin main
bash -c "cd '/path/to/project' && git push origin main"
```

**Note**: This issue only affects AI tool shell sessions, not normal developer terminal usage.

### Directory Navigation Issues

**Problem**: AI tools may lose working directory context and end up in root directory (`/`) instead of the project directory.

**Symptoms**:

- Commands work initially, then fail with "not a git repository"
- `pwd` shows `/` instead of project directory
- Need to repeatedly re-navigate with full paths
- npm commands fail with "Could not read package.json: Error: ENOENT: no such file or directory, open '/Users/jonathanlewis/package.json'"

**Solution**: Always use absolute paths in bash commands:

```bash
# Always include the full project path
bash -c "cd '/Users/jonathanlewis/Library/Mobile Documents/com~apple~CloudDocs/Coding_Projects/story-generator' && git status"
bash -c "cd '/Users/jonathanlewis/Library/Mobile Documents/com~apple~CloudDocs/Coding_Projects/story-generator' && git add ."
bash -c "cd '/Users/jonathanlewis/Library/Mobile Documents/com~apple~CloudDocs/Coding_Projects/story-generator' && npm run dev"
```

**Prevention**: Use the full project path in every bash command to avoid directory context loss.

**Best Practices**:

1. Always verify directory before running commands: `pwd && ls -la package.json`
2. Use explicit `cd` commands with full paths before npm commands
3. Kill existing processes before starting new ones: `pkill -f "next dev"`
4. Add error handling for directory operations: `cd "$PROJECT_ROOT" || { echo "Failed to change directory"; exit 1; }`

**For AI Tools**: Always use the foolproof bash pattern to prevent this recurring issue:

```bash
# ✅ RECOMMENDED: Always use this pattern for any npm/git commands
bash -c "cd '/Users/jonathanlewis/Library/Mobile Documents/com~apple~CloudDocs/Coding_Projects/story-generator' && [COMMAND]"

# Examples:
bash -c "cd '/Users/jonathanlewis/Library/Mobile Documents/com~apple~CloudDocs/Coding_Projects/story-generator' && npm run dev"
bash -c "cd '/Users/jonathanlewis/Library/Mobile Documents/com~apple~CloudDocs/Coding_Projects/story-generator' && git status"
bash -c "cd '/Users/jonathanlewis/Library/Mobile Documents/com~apple~CloudDocs/Coding_Projects/story-generator' && npm run build"
```

This pattern ensures:

- ✅ Always in correct directory
- ✅ No shell session context loss
- ✅ Handles spaces in path correctly
- ✅ Works for npm, git, and any other commands

---

# Reminders

`/docs/LLM_CONTEXT.md` is the master contract. ADR-014/015 define DS rules. ADR-017 governs how external AI tools (Subframe, Lovable, v0, Cursor) map to the repo.

This doc is a **tool-agnostic playbook** for applying those decisions across different AI tools.
