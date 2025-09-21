# Directory Issue Solution

## Problem Analysis

The recurring directory issue where npm commands fail with "Could not read package.json: Error: ENOENT: no such file or directory, open '/Users/jonathanlewis/package.json'" is caused by:

1. **Shell Session State**: Terminal sessions can lose working directory context
2. **Cursor IDE Behavior**: AI tools may start commands from unexpected directories
3. **Path Resolution**: Commands may resolve relative paths incorrectly

## Root Cause

The issue occurs because:

- Commands are sometimes executed from `/Users/jonathanlewis/` instead of the project directory
- The project directory has spaces in the path: `/Users/jonathanlewis/Library/Mobile Documents/com~apple~CloudDocs/Coding_Projects/story-generator`
- Shell sessions can lose context between commands

## Comprehensive Solution

### 1. Always Use Absolute Paths

**For AI Tools and Scripts:**

```bash
# Always use the full project path
cd "/Users/jonathanlewis/Library/Mobile Documents/com~apple~CloudDocs/Coding_Projects/story-generator"
npm run dev
```

**For Shell Scripts:**

```bash
#!/bin/bash
# Always set the working directory explicitly
PROJECT_ROOT="/Users/jonathanlewis/Library/Mobile Documents/com~apple~CloudDocs/Coding_Projects/story-generator"
cd "$PROJECT_ROOT" || exit 1
npm run dev
```

### 2. Environment Variable Approach

Create a `.envrc` file in the project root:

```bash
# .envrc
export PROJECT_ROOT="/Users/jonathanlewis/Library/Mobile Documents/com~apple~CloudDocs/Coding_Projects/story-generator"
export PATH="$PROJECT_ROOT/node_modules/.bin:$PATH"
```

### 3. Package.json Scripts Enhancement

Add a `dev:safe` script that ensures correct directory:

```json
{
  "scripts": {
    "dev:safe": "cd \"/Users/jonathanlewis/Library/Mobile Documents/com~apple~CloudDocs/Coding_Projects/story-generator\" && npm run dev",
    "dev": "next dev"
  }
}
```

### 4. Shell Script Wrapper

Create a `start-dev.sh` script:

```bash
#!/bin/bash
PROJECT_ROOT="/Users/jonathanlewis/Library/Mobile Documents/com~apple~CloudDocs/Coding_Projects/story-generator"
cd "$PROJECT_ROOT" || { echo "Failed to change to project directory"; exit 1; }
npm run dev
```

## Implementation Plan

### Phase 1: Immediate Fixes

1. ✅ Update all AI tool commands to use absolute paths
2. ✅ Create directory verification in scripts
3. ✅ Add error handling for directory changes

### Phase 2: Long-term Solutions

1. Create project-specific shell configuration
2. Add directory validation to package.json scripts
3. Implement automated directory detection

### Phase 3: Prevention

1. Update documentation with directory handling best practices
2. Add directory checks to all shell scripts
3. Create troubleshooting guide

## Best Practices for AI Tools

### Always Use Bash with Absolute Paths (RECOMMENDED)

```bash
# ✅ CORRECT: Always use bash with absolute path
bash -c "cd '/Users/jonathanlewis/Library/Mobile Documents/com~apple~CloudDocs/Coding_Projects/story-generator' && npm run dev"

# ✅ CORRECT: For any npm command
bash -c "cd '/Users/jonathanlewis/Library/Mobile Documents/com~apple~CloudDocs/Coding_Projects/story-generator' && npm run build"

# ✅ CORRECT: For git commands
bash -c "cd '/Users/jonathanlewis/Library/Mobile Documents/com~apple~CloudDocs/Coding_Projects/story-generator' && git status"
```

### Always Verify Directory

```bash
# Before running any npm command
pwd
ls -la package.json
```

### Use Absolute Paths (Alternative)

```bash
# Instead of: npm run dev
cd "/Users/jonathanlewis/Library/Mobile Documents/com~apple~CloudDocs/Coding_Projects/story-generator" && npm run dev
```

### Error Handling

```bash
# Always check if directory change succeeded
cd "$PROJECT_ROOT" || { echo "Failed to change directory"; exit 1; }
```

## Troubleshooting Commands

### Check Current Directory

```bash
pwd
ls -la package.json
```

### Verify Project Structure

```bash
ls -la
ls -la components/
ls -la app/
```

### Kill Existing Processes

```bash
pkill -f "next dev"
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
```

### Start Fresh

```bash
cd "/Users/jonathanlewis/Library/Mobile Documents/com~apple~CloudDocs/Coding_Projects/story-generator"
npm run dev
```

## Prevention Checklist

- [ ] Always use absolute paths in AI tool commands
- [ ] Verify directory before running npm commands
- [ ] Kill existing processes before starting new ones
- [ ] Use explicit `cd` commands with full paths
- [ ] Add error handling for directory operations
- [ ] Document directory requirements in scripts

## Files to Update

1. **Documentation**: Update all markdown files with directory handling
2. **Scripts**: Add directory validation to all shell scripts
3. **Package.json**: Add safe scripts with absolute paths
4. **AI Tool Instructions**: Update prompts to include directory handling

This solution addresses the root cause and provides multiple layers of protection against directory issues.
