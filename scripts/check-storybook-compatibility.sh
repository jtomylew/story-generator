#!/bin/bash

# Storybook Compatibility Check Script
# Run this script to test if Storybook can be installed without compatibility issues
# Exit codes: 0 = compatible, 1 = incompatible, 2 = error

set -e

# Check if we're in CI mode (less verbose output)
CI_MODE=${CI:-false}
VERBOSE=${VERBOSE:-true}

if [ "$VERBOSE" = "true" ]; then
    echo "🔍 Checking Storybook compatibility with current setup..."
    
    # Check Node.js version
    echo "📋 Node.js version:"
    node --version
    
    # Check npm version
    echo "📋 npm version:"
    npm --version
    
    # Check Next.js version
    echo "📋 Next.js version:"
    npm list next --depth=0
    
    # Check React version
    echo "📋 React version:"
    npm list react --depth=0
    
    echo ""
    echo "🧪 Testing Storybook installation..."
else
    echo "🔍 Checking Storybook compatibility..."
fi

# Quick compatibility check based on known issues
# This is much faster than full installation testing

# Check if we have the problematic Next.js version
NEXT_VERSION=$(npm list next --depth=0 2>/dev/null | grep "next@" | sed 's/.*@//' | head -1)
REACT_VERSION=$(npm list react --depth=0 2>/dev/null | grep "react@" | sed 's/.*@//' | head -1)

if [ "$VERBOSE" = "true" ]; then
    echo "📋 Detected Next.js: $NEXT_VERSION"
    echo "📋 Detected React: $REACT_VERSION"
fi

# Known compatibility issues:
# - Next.js 15.5.3 + Storybook 8.6.14 has webpack hook issues
# - React 19.1.1 + Storybook 8.6.14 has compatibility problems

if [[ "$NEXT_VERSION" == "15.5.3" ]] && [[ "$REACT_VERSION" == "19.1.1" ]]; then
    if [ "$VERBOSE" = "true" ]; then
        echo "❌ Known compatibility issue detected"
        echo "Next.js 15.5.3 + React 19.1.1 + Storybook 8.6.14 has webpack hook conflicts"
        echo "Compatibility issues detected"
    else
        echo "❌ Storybook compatibility issues detected (Next.js 15.5.3 + React 19.1.1)"
    fi
    exit 1
fi

# If we get here, the versions might be compatible
# For now, we'll be conservative and assume issues exist until proven otherwise
if [ "$VERBOSE" = "true" ]; then
    echo "⚠️  Storybook compatibility unknown for this version combination"
    echo "Run full test with: VERBOSE=true npm run storybook:check:full"
    echo "Compatibility issues may still exist"
else
    echo "⚠️  Storybook compatibility unknown - issues may still exist"
fi
exit 1
