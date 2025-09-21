#!/bin/bash

# Directory verification script
# This script ensures we're in the correct project directory

PROJECT_ROOT="/Users/jonathanlewis/Library/Mobile Documents/com~apple~CloudDocs/Coding_Projects/story-generator"

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ ERROR: Not in project directory. Expected package.json not found."
    echo "📍 Current directory: $(pwd)"
    echo "🔄 Changing to project directory: $PROJECT_ROOT"
    cd "$PROJECT_ROOT" || {
        echo "❌ CRITICAL: Failed to change to project directory"
        exit 1
    }
    echo "✅ Successfully changed to project directory: $(pwd)"
else
    echo "✅ Confirmed in project directory: $(pwd)"
fi

# Verify package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ CRITICAL: package.json still not found after directory change"
    echo "📁 Directory contents:"
    ls -la
    exit 1
fi

echo "🎯 Ready to run commands in project directory"
