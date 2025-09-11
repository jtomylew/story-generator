# AI UI & Design System Guide

This guide is for **any AI tool** (Cursor, Subframe, Lovable, or others) that generates or refines UI in this repo.  

It summarizes the design system contract from `/docs/LLM_CONTEXT.md` and ADR-014/015, and incorporates ADR-017 for external AI tool integration and sync.

---

## 1. Design System Contract (summary)

> Full rules live in `/docs/LLM_CONTEXT.md` and ADR-014/015 in `/docs/DECISIONS.md`.  
> For external AI tool workflows, see ADR-017.

- **Imports**: Use only `@/components/ui/*` primitives (shadcn over Radix).  
- **Composition layers**:
  - Atoms → `src/components/ui/*`
  - Molecules → `src/components/patterns/*`
  - Screens → `src/components/screens/*`
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
- **Documentation**: Add or update Storybook stories for each component (default + at least one variant).

---
## 2. Mapping Table (Subframe --> Rep DS)

| **Subframe Construct** | **Repo Equivalent**           | **Target Path in Repo**                                               | **Notes**                                                                                              |
| ---------------------- | ----------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Pages**              | Screens                       | `src/components/screens/*`                                            | One per top-level route (e.g. `generate-story.tsx`). Pages should be thin and compose patterns.        |
| **Components**         | UI Primitives **or** Patterns | `src/components/ui/*` (atoms) `src/components/patterns/*` (molecules) | If atomic (button, input, card) → UI. If composed block (form, preview) → Patterns.                    |
| **Themes**             | Tokens                        | `/styles/tokens.css` + `tailwind.config.ts`                           | Subframe themes are sketches; source of truth = repo tokens. Apply manually if useful.                 |
| **Templates**          | Patterns **or** Screens       | `src/components/patterns/*` `src/components/screens/*`                | If small reusable layout → Pattern. If full-page scaffold → Screen. Don’t create a “templates” folder. |
## 3. Prompt Templates

Use these when asking an AI tool to make changes.  
- **Always begin with the global context:** Use `/docs/LLM_CONTEXT.md`, ADR-014/015 (DS rules), and ADR-017 (tool integration & sync) as context.  
- Update **existing** components in place; do not create duplicates or add new UI libraries.  
- Imports must come from `@/components/ui/*` and styling must use Tailwind tokens.

### Refine a Primitive
### Refine a Primitive
Update src/components/ui/button.tsx.
- Add microinteractions using motion tokens
- Preserve shadcn structure and exports
- Update its Storybook story with default, disabled, and loading states
### Refine a Pattern
Create or refine src/components/patterns/StoryForm.tsx.
- Compose from @/components/ui/* only
- Keep props strongly typed
- Add Storybook story with default and error states
### Refine a Screen 
Refine src/components/screens/generate-story.tsx.

- Improve spacing and hierarchy using Tailwind tokens
- Extract StoryForm and StoryPreview into src/components/patterns/
- Compose them back into generate-story.tsx
- Add or update Storybook stories for screen + patterns

### Update Tokens / Theme
Adjust brand colors in /styles/tokens.css.
- Do not edit component code directly
- Update Design System/Overview story to show new swatches

### Accessibility Review
Ensure inputs, dialogs, and tooltips follow Radix semantics.
- Add <Label htmlFor/> to inputs
- Ensure focus rings and aria-* attributes
- Update Storybook stories with accessibility notes

---

## 4. Usage Notes

- Always update **existing components in place**. Do not create duplicates.  
- Preserve logic and API calls; focus only on styling, structure, and DS compliance.  
- Review diffs in GitHub → merge → Vercel auto-deploys.

---
## 5. Quick Verify Steps

When an AI tool makes changes, ask it to also:

1. Run `npm run typecheck` → confirm 0 errors.  
2. Run `npm run storybook` → confirm updated components render.  
3. Run `npm run dev` → confirm app boots on `http://localhost:3000`.  
4. Summarize which files changed and why.  

---

# Reminders
`/docs/LLM_CONTEXT.md` is the master contract. ADR-014/015 define DS rules. ADR-017 governs how external AI tools (Subframe, Lovable, v0, Cursor) map to the repo.  

This doc is a **tool-agnostic playbook** for applying those decisions across different AI tools.
