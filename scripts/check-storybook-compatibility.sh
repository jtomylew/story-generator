#!/bin/bash

# Storybook Compatibility Check Script
# Run this script to test if Storybook can be installed without compatibility issues

set -e

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
    
    # Try to run storybook init
    echo "🧪 Testing Storybook initialization..."
    if npx storybook@latest init --yes --silent; then
        echo "✅ Storybook initialization successful!"
        
        # Try to build
        echo "🧪 Testing Storybook build..."
        if npm run build-storybook --silent; then
            echo "✅ Storybook build successful!"
            echo ""
            echo "🎉 Storybook is compatible with your current setup!"
            echo "You can safely run: npm run storybook:install"
        else
            echo "❌ Storybook build failed"
            echo "Compatibility issues may still exist"
        fi
    else
        echo "❌ Storybook initialization failed"
        echo "Compatibility issues detected"
    fi
else
    echo "❌ Storybook installation failed"
    echo "Compatibility issues detected"
fi

# Cleanup
cd - > /dev/null
rm -rf "$TEMP_DIR"

echo ""
echo "📚 For more information, see docs/STORYBOOK_REINSTALL.md"
