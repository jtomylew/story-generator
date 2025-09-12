#!/bin/bash

# Storybook Installation Script
# Run this script when Next.js 15.5.3 + Storybook compatibility issues are resolved

set -e

echo "🎨 Installing Storybook for Story Weaver..."

# Install Storybook packages
echo "📦 Installing Storybook packages..."
npm install --save-dev \
  storybook@latest \
  @storybook/nextjs@latest \
  @storybook/addon-essentials@latest \
  @storybook/addon-interactions@latest \
  @storybook/addon-a11y@latest

# Create .storybook directory
echo "📁 Creating Storybook configuration..."
mkdir -p .storybook

# Create main.ts configuration
cat > .storybook/main.ts << 'EOF'
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
EOF

# Create preview.ts configuration
cat > .storybook/preview.ts << 'EOF'
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
EOF

# Add Storybook scripts to package.json
echo "📝 Adding Storybook scripts to package.json..."

# Use Node.js to safely update package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Add Storybook scripts
pkg.scripts = pkg.scripts || {};
pkg.scripts['//:storybook'] = '— Storybook sanity —';
pkg.scripts['storybook'] = 'storybook dev -p 6006';
pkg.scripts['storybook:build'] = 'storybook build -o .sb-out';

// Update preflight:full to include storybook:build
if (pkg.scripts['preflight:full']) {
  pkg.scripts['preflight:full'] = pkg.scripts['preflight:full'] + ' && npm run storybook:build';
}

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

# Create .prettierignore for Storybook
echo "🎨 Creating .prettierignore for Storybook..."
cat > .prettierignore << 'EOF'
storybook-static/
.sb-out/
EOF

# Update ESLint configuration
echo "🔧 Updating ESLint configuration..."
node -e "
const fs = require('fs');
const content = fs.readFileSync('eslint.config.mjs', 'utf8');

// Add Storybook ignores to ESLint
const updatedContent = content.replace(
  'next-env.d.ts,',
  'next-env.d.ts,\n      \"storybook-static/**\",\n      \".sb-out/**\",'
);

fs.writeFileSync('eslint.config.mjs', updatedContent);
"

# Create sample story files
echo "📚 Creating sample story files..."

# Button story
mkdir -p components/ui
cat > components/ui/Button.stories.tsx << 'EOF'
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: {
      control: { type: "select" },
      options: ["default", "sm", "lg", "icon"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button",
  },
};

export const Primary: Story = {
  args: {
    variant: "default",
    children: "Primary Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary", 
    children: "Secondary Button",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large Button",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    children: "Small Button",
  },
};
EOF

# StoryForm story
mkdir -p components/patterns
cat > components/patterns/StoryForm.stories.tsx << 'EOF'
import type { Meta, StoryObj } from "@storybook/react";
import { StoryForm } from "./StoryForm";

const meta: Meta<typeof StoryForm> = {
  title: "Patterns/StoryForm",
  component: StoryForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    isSubmitting: {
      control: { type: "boolean" },
    },
    defaultText: {
      control: { type: "text" },
    },
    defaultLevel: {
      control: { type: "select" },
      options: ["preschool", "early-elementary", "elementary"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: (req) => console.log("Form submitted:", req),
  },
};

export const WithDefaultText: Story = {
  args: {
    defaultText: "This is a sample news article about a magical adventure...",
    defaultLevel: "elementary",
    onSubmit: (req) => console.log("Form submitted:", req),
  },
};

export const Submitting: Story = {
  args: {
    isSubmitting: true,
    onSubmit: (req) => console.log("Form submitted:", req),
  },
};
EOF

# StoryOutput story
cat > components/patterns/StoryOutput.stories.tsx << 'EOF'
import type { Meta, StoryObj } from "@storybook/react";
import { StoryOutput } from "./StoryOutput";

const meta: Meta<typeof StoryOutput> = {
  title: "Patterns/StoryOutput",
  component: StoryOutput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: {
    state: { status: "idle" },
    onReset: () => console.log("Reset clicked"),
  },
};

export const Loading: Story = {
  args: {
    state: {
      status: "loading",
      req: {
        articleText: "Sample article text...",
        readingLevel: "elementary",
      },
    },
    onReset: () => console.log("Reset clicked"),
  },
};

export const Success: Story = {
  args: {
    state: {
      status: "success",
      req: {
        articleText: "Sample article text...",
        readingLevel: "elementary",
      },
      res: {
        story: "Once upon a time, in a magical land far away, there lived a brave little hero...",
        ageBand: "elementary",
        newsSummary: "Sample news article about an adventure",
        sourceHash: "abc123",
        model: "gpt-4o",
        safety: { flagged: false, reasons: [] },
        cached: false,
        createdAt: new Date().toISOString(),
      },
    },
    onReset: () => console.log("Reset clicked"),
  },
};

export const Error: Story = {
  args: {
    state: {
      status: "error",
      req: {
        articleText: "Sample article text...",
        readingLevel: "elementary",
      },
      error: {
        message: "Something went wrong while generating the story.",
        code: "INTERNAL_ERROR",
      },
    },
    onReset: () => console.log("Reset clicked"),
  },
};
EOF

# Design System overview story
mkdir -p stories
cat > stories/DesignSystem.stories.tsx << 'EOF'
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Design System/Overview",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Story Weaver Design System</h1>
        <p className="text-lg text-gray-600">
          A comprehensive design system for creating magical stories for young minds.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">UI Components</h2>
          <p className="text-gray-600">Basic building blocks like buttons, inputs, and form elements.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Patterns</h2>
          <p className="text-gray-600">Reusable component combinations like forms and outputs.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Screens</h2>
          <p className="text-gray-600">Complete page layouts and full-screen components.</p>
        </div>
      </div>
    </div>
  ),
};
EOF

echo "✅ Storybook installation complete!"
echo ""
echo "🚀 Next steps:"
echo "1. Run 'npm run storybook' to start the development server"
echo "2. Visit http://localhost:6006 to view your stories"
echo "3. Add more stories in the components/**/*.stories.tsx files"
echo ""
echo "📚 Available stories:"
echo "- UI/Button - Button component variations"
echo "- Patterns/StoryForm - Form component with different states"
echo "- Patterns/StoryOutput - Output component variations"
echo "- Design System/Overview - Design system overview"
echo ""
echo "🎨 Happy storytelling!"
