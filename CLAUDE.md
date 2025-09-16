# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

Essential commands for development workflow:

- `npm run dev` - Start Next.js development server
- `npm run build` - Build production application
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint with zero warnings policy
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run preflight` - Full pre-commit validation (typecheck + lint + format + duplicate checks)
- `npm run verify:prompts` - Validate prompt files and API route structure

**Always run `npm run preflight` before committing changes** to ensure code quality and consistency.

## Architecture Overview

This is a Next.js 15.5.3 application using App Router that generates children's stories from news articles via OpenAI API.

### Core Flow

1. User submits news article text + reading level (preschool/early-elementary/elementary)
2. API validates input, checks cache, loads external prompt templates
3. OpenAI generates allegorical story with exactly 2 discussion questions
4. Response validated for word count limits and structure
5. Result cached and returned with metadata headers

### Key Directories

- **`/app/api/generate/`** - Main API endpoint (POST only, Node.js runtime required)
- **`/lib/`** - Core business logic modules
- **`/prompts/`** - External Markdown prompt templates loaded via `fs`
- **`/components/`** - React components with strict barrel export pattern
- **`/docs/`** - Comprehensive documentation including LLM_CONTEXT.md

### Import Patterns

**Always use canonical barrel imports:**

```typescript
// ✅ Correct
import { Button, StoryForm, GenerateStory } from "@/components";

// ❌ Avoid deep paths
import { StoryForm } from "@/components/patterns/StoryForm";
```

### Component Structure

- **`/components/ui/`** - shadcn/ui primitives (atoms)
- **`/components/patterns/`** - Molecule components
- **`/components/screens/`** - Page-level screens

## API Contract

**POST /api/generate**

- Request: `{articleText: string, readingLevel: "preschool"|"early-elementary"|"elementary"}`
- Response: Story with metadata, word count validation, exactly 2 questions
- Headers: X-Cache (HIT/MISS), X-Model, X-Request (hash)
- Runtime: Node.js (required for fs prompt loading)

## Environment Variables

Required in `.env.local`:

- `OPENAI_API_KEY` - OpenAI API key
- `MODEL_NAME` - Optional, defaults to "gpt-4o"

## Critical Requirements

1. **Prompt Files**: External templates in `/prompts/` loaded via `lib/prompt.ts`
2. **Post-validation**: Word count must match reading level ranges
3. **Exactly 2 questions**: API enforces this structure
4. **Barrel exports**: All component imports use `@/components` pattern
5. **Node runtime**: API route requires `export const runtime = "nodejs"`

## Reading Level Word Limits

- Preschool (3-5): 250-400 words
- Early Elementary (5-7): 350-550 words
- Elementary (7-10): 450-700 words

## Quality Gates

Use verification script: `npm run verify:prompts` checks prompt files exist and API route has correct imports/headers.

For detailed architecture and prompt engineering guidance, see `docs/LLM_CONTEXT.md`.
