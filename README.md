This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

**If you encounter directory issues** (npm commands fail with "Could not read package.json"), use the safe script:

```bash
npm run dev:safe
# or use the shell script wrapper
./scripts/start-dev.sh
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

### Story Generation

Transform news articles into engaging, age-appropriate stories for children:

- **AI-powered storytelling**: Uses OpenAI to create magical, educational stories from real news
- **Reading level targeting**: Stories tailored for Preschool, Early Elementary, and Elementary levels
- **5-minute reading experience**: Word counts optimized for comfortable reading sessions
  - Preschool: 100-300 words (2-3 minutes)
  - Early Elementary: 200-500 words (3-4 minutes)
  - Elementary: 300-800 words (4-5 minutes)
- **Discussion questions**: Each story includes 2 thoughtful questions for learning
- **One-click generation**: Simply click "Generate Story" on any news article
- **Smart UI**: When viewing a generated story, the paste form is hidden to focus on the story

### Category Filtering

The homepage includes a category filter system that allows you to filter news articles by topic:

- **Available categories**: Science, Nature, Sports, Arts, Education, Technology, Animals
- **Multi-select functionality**: Choose multiple categories or select "All" to show everything
- **URL persistence**: Filter selections are saved in the URL for sharing and bookmarking
- **Keyboard accessible**: Full keyboard navigation support with Tab, Enter, and Space keys

### Loading & Refresh System

The application includes a comprehensive loading and refresh system:

- **Skeleton loading states**: Custom skeleton components during data loading
- **Pull-to-refresh**: Mobile-friendly pull-to-refresh functionality (70px threshold)
- **Auto-refresh**: Automatic content refresh every 30 minutes (30 seconds for testing)
- **Toast notifications**: User-friendly notifications for new content
- **Performance optimized**: Last-Modified headers, 304 Not Modified support, and caching

### Troubleshooting Directory Issues

If you experience recurring directory issues where npm commands fail, see [docs/DIRECTORY_ISSUE_SOLUTION.md](docs/DIRECTORY_ISSUE_SOLUTION.md) for comprehensive solutions and prevention strategies.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Component Development

### Storybook (Currently Disabled)

Storybook was temporarily removed due to Next.js 15.5.3 compatibility issues. **Compatibility is automatically monitored** in all preflight workflows.

**To reinstall when compatibility is resolved:**

```bash
npm run storybook:install
```

**To check current compatibility status:**

```bash
npm run storybook:check          # Quick version-based check
npm run storybook:check:full     # Complete installation test
```

See [docs/STORYBOOK_REINSTALL.md](docs/STORYBOOK_REINSTALL.md) for detailed instructions.

### Component Inspection

While Storybook is unavailable, inspect components via:

- Main application at `http://localhost:3000`
- Component files in `/components` directory
- Browser dev tools

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Test commit to verify GitHub Actions workflow

# Test commit to verify GitHub Actions workflow
