#!/bin/bash

# Safe development server startup script
# This script ensures we're always in the correct directory

# Set the absolute project path
PROJECT_ROOT="/Users/jonathanlewis/Library/Mobile Documents/com~apple~CloudDocs/Coding_Projects/story-generator"

# Function to verify we're in the correct directory
verify_directory() {
    if [ ! -f "package.json" ]; then
        echo "❌ ERROR: Not in project directory. Expected package.json not found."
        echo "📍 Current directory: $(pwd)"
        echo "🔄 Changing to project directory: $PROJECT_ROOT"
        cd "$PROJECT_ROOT" || {
            echo "❌ CRITICAL: Failed to change to project directory"
            exit 1
        }
        echo "✅ Successfully changed to project directory"
    else
        echo "✅ Confirmed in project directory: $(pwd)"
    fi
}

# Function to kill existing dev servers
kill_existing_servers() {
    echo "🔄 Checking for existing Next.js dev servers..."
    if pgrep -f "next dev" > /dev/null; then
        echo "⚠️  Found existing Next.js dev server, stopping it..."
        pkill -f "next dev"
        sleep 2
    fi
    
    # Also kill any process on port 3000
    if lsof -ti:3000 > /dev/null 2>&1; then
        echo "⚠️  Found process on port 3000, stopping it..."
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

# Main execution
echo "🚀 Starting Story Generator Development Server"
echo "=============================================="

# Step 1: Verify directory
verify_directory

# Step 2: Kill existing servers
kill_existing_servers

# Step 3: Verify package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ CRITICAL: package.json not found in $(pwd)"
    echo "📁 Directory contents:"
    ls -la
    exit 1
fi

# Step 4: Start the development server
echo "🎯 Starting Next.js development server..."
echo "📍 Working directory: $(pwd)"
echo "🌐 Server will be available at: http://localhost:3000"
echo ""

npm run dev
