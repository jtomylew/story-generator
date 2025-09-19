#!/bin/bash

# Safe Development Server Starter
# This script ensures the dev server starts from the correct directory

set -e

# Project root directory (absolute path)
PROJECT_ROOT="/Users/jonathanlewis/Library/Mobile Documents/com~apple~CloudDocs/Coding_Projects/story-generator"

echo "🚀 Starting Story Generator Development Server..."
echo "📁 Project directory: $PROJECT_ROOT"

# Verify we can access the project directory
if [ ! -d "$PROJECT_ROOT" ]; then
    echo "❌ Error: Project directory not found: $PROJECT_ROOT"
    exit 1
fi

# Change to project directory
cd "$PROJECT_ROOT" || {
    echo "❌ Error: Failed to change to project directory"
    exit 1
}

# Verify package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in project directory"
    exit 1
fi

echo "✅ Project directory verified"
echo "📦 Package.json found"

# Kill any existing dev server processes
echo "🔄 Checking for existing dev server processes..."
if pgrep -f "next dev" > /dev/null; then
    echo "⚠️  Found existing dev server processes, stopping them..."
    pkill -f "next dev" || true
    sleep 2
fi

# Kill any processes on port 3000
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "⚠️  Found processes on port 3000, stopping them..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo "✅ Cleaned up existing processes"

# Start the development server
echo "🚀 Starting Next.js development server..."
echo "🌐 Server will be available at: http://localhost:3000"
echo ""

npm run dev
