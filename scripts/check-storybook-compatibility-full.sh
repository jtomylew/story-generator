#!/bin/bash

# Full Storybook Compatibility Check Script
# This script does a complete installation test (slower but thorough)
# Exit codes: 0 = compatible, 1 = incompatible, 2 = error

set -e

echo "🔍 Running full Storybook compatibility test..."

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
echo "🧪 Testing full Storybook installation..."

# Create a temporary directory for testing
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

# Initialize a test package.json
cat > package.json << 'EOF'
{
  "name": "storybook-compatibility-test",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "next": "^15.5.3",
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  }
}
EOF

# Install Next.js and React
echo "📦 Installing Next.js and React..."
npm install --silent

# Try to install Storybook
echo "📦 Testing Storybook installation..."
if npm install --save-dev storybook@latest @storybook/nextjs@latest --silent; then
    echo "✅ Storybook installation successful!"
    echo "🧪 Testing Storybook initialization..."
    
    # Try to run storybook init
    if npx storybook@latest init --yes > /dev/null 2>&1; then
        echo "✅ Storybook initialization successful!"
        echo "🧪 Testing Storybook build..."
        
        # Try to build
        if npm run build-storybook --silent; then
            echo "✅ Storybook build successful!"
            echo ""
            echo "🎉 Storybook is compatible with your current setup!"
            echo "You can safely run: npm run storybook:install"
            # Cleanup and exit with success
            cd - > /dev/null
            rm -rf "$TEMP_DIR"
            exit 0
        else
            echo "❌ Storybook build failed"
            echo "Compatibility issues may still exist"
            # Cleanup and exit with incompatibility
            cd - > /dev/null
            rm -rf "$TEMP_DIR"
            exit 1
        fi
    else
        echo "❌ Storybook initialization failed"
        echo "Compatibility issues detected"
        # Cleanup and exit with incompatibility
        cd - > /dev/null
        rm -rf "$TEMP_DIR"
        exit 1
    fi
else
    echo "❌ Storybook installation failed"
    echo "Compatibility issues detected"
    # Cleanup and exit with incompatibility
    cd - > /dev/null
    rm -rf "$TEMP_DIR"
    exit 1
fi

# This should never be reached due to exit statements above
# But just in case, cleanup and exit with error
cd - > /dev/null
rm -rf "$TEMP_DIR"
exit 2
