# Storybook Reinstallation Guide

## Overview

Storybook was temporarily removed from this project due to Next.js 15.5.3 + Storybook 8.6.14 compatibility issues. This guide provides instructions for reinstalling Storybook once the compatibility issues are resolved.

## Current Status

- **Issue**: Webpack hook compatibility problem causing "Cannot read properties of undefined (reading 'tap')" error
- **Status**: Storybook removed from project (see ADR-021 in DECISIONS.md)
- **Automated Monitoring**: Storybook compatibility is automatically checked in all preflight workflows
- **Alternative**: Component inspection available via main application at `http://localhost:3000`

## Automated Compatibility Monitoring

Storybook compatibility is automatically checked in:

- **Local Development**: `npm run preflight` includes `npm run storybook:check`
- **Git Hooks**: Pre-commit and pre-push hooks check compatibility
- **CI/CD**: GitHub Actions workflow monitors compatibility status
- **Manual Check**: `npm run storybook:check` (quick) or `npm run storybook:check:full` (thorough) for on-demand testing

## Quick Reinstallation

### Option 1: Automated Script (Recommended)

```bash
# Run the automated installation script
./scripts/install-storybook.sh
```

This script will:

- Install all necessary Storybook packages
- Create configuration files
- Add scripts to package.json
- Create sample story files
- Update ESLint and Prettier configurations

### Option 2: Manual Installation

If you prefer manual installation or need to customize the setup:

#### 1. Install Packages

```bash
npm install --save-dev \
  storybook@latest \
  @storybook/nextjs@latest \
  @storybook/addon-essentials@latest \
  @storybook/addon-interactions@latest \
  @storybook/addon-a11y@latest
```

#### 2. Create Configuration

Create `.storybook/main.ts`:

```typescript
import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../components/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  typescript: {
    check: false,
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
  staticDirs: ["../public"],
};

export default config;
```

Create `.storybook/preview.ts`:

```typescript
import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
```

#### 3. Add Scripts to package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "//:storybook": "— Storybook sanity —",
    "storybook": "storybook dev -p 6006",
    "storybook:build": "storybook build -o .sb-out"
  }
}
```

Update the `preflight:full` script to include Storybook build:

```json
{
  "scripts": {
    "preflight:full": "npm run typecheck && npm run lint && npm run format:check && npm run ban:raw-primitives && npm run find:strays && npm run find:duplicates && npm run storybook:build"
  }
}
```

#### 4. Update Configuration Files

**ESLint Configuration** (`eslint.config.mjs`):
Add these ignores to the ignores array:

```javascript
"storybook-static/**",
".sb-out/**",
```

**Prettier Configuration** (`.prettierignore`):
Create `.prettierignore` with:

```
storybook-static/
.sb-out/
```

## Sample Story Files

The installation script creates these sample stories:

### UI Components

- `components/ui/Button.stories.tsx` - Button component variations

### Patterns

- `components/patterns/StoryForm.stories.tsx` - Form component with different states
- `components/patterns/StoryOutput.stories.tsx` - Output component variations

### Design System

- `stories/DesignSystem.stories.tsx` - Design system overview

## Usage

After installation:

1. **Start Storybook**:

   ```bash
   npm run storybook
   ```

2. **View Stories**: Visit `http://localhost:6006`

3. **Build Stories**:
   ```bash
   npm run storybook:build
   ```

## Troubleshooting

### Common Issues

1. **Webpack Compatibility Error**:
   - This is the original issue that caused Storybook removal
   - Check if Next.js and Storybook versions are compatible
   - Consider downgrading Next.js or upgrading Storybook

2. **Missing Dependencies**:

   ```bash
   npm install
   ```

3. **Port Already in Use**:
   ```bash
   npm run storybook -- --port 6007
   ```

### Verification

Run the preflight checks to ensure everything is working:

```bash
npm run preflight:full
```

## When to Reinstall

Reinstall Storybook when:

- ✅ **Automated Check Passes**: `npm run storybook:check` returns success
- ✅ **CI/CD Confirms**: GitHub Actions shows "Storybook compatibility confirmed"
- ✅ **Preflight Passes**: All preflight checks including Storybook compatibility pass
- ✅ **Team Ready**: Component documentation and testing is needed

The automated monitoring will notify you immediately when compatibility is restored!

## Alternative Component Inspection

While Storybook is unavailable, use these alternatives:

1. **Main Application**: `http://localhost:3000`
2. **Component Files**: Browse `/components` directory
3. **Browser Dev Tools**: Inspect components in the main app
4. **TypeScript**: Use IDE features for component exploration

## Files Created/Modified

The installation process affects these files:

### Created

- `.storybook/main.ts`
- `.storybook/preview.ts`
- `.prettierignore`
- `components/ui/Button.stories.tsx`
- `components/patterns/StoryForm.stories.tsx`
- `components/patterns/StoryOutput.stories.tsx`
- `stories/DesignSystem.stories.tsx`

### Modified

- `package.json` (scripts and dependencies)
- `eslint.config.mjs` (ignores)

## Support

For issues with Storybook reinstallation:

1. Check the [Storybook documentation](https://storybook.js.org/docs)
2. Review ADR-021 in `docs/DECISIONS.md`
3. Check Next.js and Storybook compatibility matrix
4. Consider using the main application for component inspection

---

_Last updated: Week 2, Day 6 - Story Weaver Project_
