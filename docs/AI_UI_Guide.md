# AI UI & Design System Guide

This guide is for **any AI tool** (Cursor, Subframe, Lovable, or others) that generates or refines UI in this repo.

It summarizes the design system contract from `/docs/LLM_CONTEXT.md` and ADR-014/015, and incorporates ADR-017 for external AI tool integration and sync.

---

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
- **Documentation**: Storybook stories will be automatically created when compatibility is restored (currently disabled due to Next.js 15.5.3 compatibility issues).

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
- Storybook stories will be automatically created when compatibility is restored

### Refine a Pattern

Create or refine components/patterns/StoryForm.tsx.

- Compose from @/components/ui/\* only
- Keep props strongly typed
- Storybook stories will be automatically created when compatibility is restored

### Refine a Screen

Refine components/screens/GenerateStory.tsx.

- Improve spacing and hierarchy using Tailwind tokens
- Extract StoryForm and StoryPreview into components/patterns/
- Compose them back into GenerateStory.tsx
- Storybook stories will be automatically created when compatibility is restored

### Update Tokens / Theme

Adjust brand colors in /styles/tokens.css.

- Do not edit component code directly
- Update Design System/Overview story to show new swatches

### Accessibility Review

Ensure inputs, dialogs, and tooltips follow Radix semantics.

- Add <Label htmlFor/> to inputs
- Ensure focus rings and aria-\* attributes
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
npm run typecheck
npm run ban:raw-primitives   # no raw <button>, <input>, etc. outside /ui
npm run find:strays          # no deep imports
npm run find:duplicates      # no duplicate component files
npm run storybook:check      # automatically check Storybook compatibility
```

### Git Workflow (summary)

```bash
git checkout main && git pull
git checkout -b feat/<name>             # normal work
# or
git checkout -b sync/subframe-YYYYMMDD  # rare controlled sync

# make changes…

# run preflight, then:
git add -A && git commit -m "feat: <what changed>"
git push -u origin HEAD
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

# Reminders

`/docs/LLM_CONTEXT.md` is the master contract. ADR-014/015 define DS rules. ADR-017 governs how external AI tools (Subframe, Lovable, v0, Cursor) map to the repo.

This doc is a **tool-agnostic playbook** for applying those decisions across different AI tools.
