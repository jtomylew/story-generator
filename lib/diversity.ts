import "server-only";
import type { ArticleInput, ArticleCategory } from "./db";

export interface DiversityOptions {
  maxPerSource?: number;
  freshnessDecayHours?: number;
  categoryRotation?: boolean;
}

export interface DiversityResult<T extends ArticleInput = ArticleInput> {
  articles: T[];
  appliedCategories: string[];
  diversityApplied: boolean;
}

/**
 * Apply diversity algorithm to articles with category rotation, source limits, and freshness scoring
 *
 * Business rules:
 * - Max 2 articles per source (configurable)
 * - 48h freshness decay scoring (newer articles preferred)
 * - Category rotation to ensure balanced representation
 * - Pure function with no side effects
 */
export function diversify<T extends ArticleInput>(
  articles: T[],
  options: DiversityOptions = {},
): DiversityResult<T> {
  const {
    maxPerSource = 2,
    freshnessDecayHours = 48,
    categoryRotation = true,
  } = options;

  if (articles.length === 0) {
    return {
      articles: [],
      appliedCategories: [],
      diversityApplied: false,
    };
  }

  // Calculate freshness scores (newer articles get higher scores)
  const now = new Date();
  const freshnessDecayMs = freshnessDecayHours * 60 * 60 * 1000;

  const articlesWithScores = articles.map((article) => {
    let freshnessScore = 1.0; // Default score for articles without published_at

    if (article.published_at) {
      const publishedDate = new Date(article.published_at);
      const ageMs = now.getTime() - publishedDate.getTime();

      if (ageMs > 0 && ageMs < freshnessDecayMs) {
        // Linear decay: newer articles get higher scores
        freshnessScore = 1.0 - ageMs / freshnessDecayMs;
      } else if (ageMs >= freshnessDecayMs) {
        // Articles older than decay period get minimal score
        freshnessScore = 0.1;
      }
    }

    return {
      ...article,
      freshnessScore,
    };
  });

  // Sort by freshness score (descending) for initial ordering
  articlesWithScores.sort((a, b) => b.freshnessScore - a.freshnessScore);

  // Apply source diversity (max articles per source)
  const sourceCounts: Record<string, number> = {};
  const sourceDiverseArticles: typeof articlesWithScores = [];

  for (const article of articlesWithScores) {
    const source = article.source;
    const currentCount = sourceCounts[source] || 0;

    if (currentCount < maxPerSource) {
      sourceCounts[source] = currentCount + 1;
      sourceDiverseArticles.push(article);
    }
  }

  // Apply category rotation if enabled
  let finalArticles: typeof articlesWithScores;
  let appliedCategories: string[] = [];

  if (categoryRotation && sourceDiverseArticles.length > 0) {
    // Group articles by category
    const categoryGroups: Record<string, typeof articlesWithScores> = {};
    for (const article of sourceDiverseArticles) {
      if (!categoryGroups[article.category]) {
        categoryGroups[article.category] = [];
      }
      categoryGroups[article.category].push(article);
    }

    // Rotate through categories to ensure balanced representation
    const categories = Object.keys(categoryGroups);
    appliedCategories = categories;

    if (categories.length > 1) {
      const rotatedArticles: typeof articlesWithScores = [];
      const maxPerCategory = Math.ceil(
        sourceDiverseArticles.length / categories.length,
      );

      // Round-robin through categories
      for (let i = 0; i < maxPerCategory; i++) {
        for (const category of categories) {
          const categoryArticles = categoryGroups[category];
          if (categoryArticles && categoryArticles[i]) {
            rotatedArticles.push(categoryArticles[i]);
          }
        }
      }

      finalArticles = rotatedArticles;
    } else {
      finalArticles = sourceDiverseArticles;
    }
  } else {
    finalArticles = sourceDiverseArticles;
    appliedCategories = [
      ...new Set(sourceDiverseArticles.map((a) => a.category)),
    ];
  }

  // Remove the freshnessScore property before returning
  const cleanArticles: T[] = finalArticles.map(
    ({ freshnessScore, ...article }) => article as unknown as T,
  );

  return {
    articles: cleanArticles,
    appliedCategories,
    diversityApplied: true,
  };
}

/**
 * Get diversity statistics for articles
 */
export function getDiversityStats(articles: ArticleInput[]): {
  sourceCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  totalSources: number;
  totalCategories: number;
} {
  const sourceCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};

  for (const article of articles) {
    sourceCounts[article.source] = (sourceCounts[article.source] || 0) + 1;
    categoryCounts[article.category] =
      (categoryCounts[article.category] || 0) + 1;
  }

  return {
    sourceCounts,
    categoryCounts,
    totalSources: Object.keys(sourceCounts).length,
    totalCategories: Object.keys(categoryCounts).length,
  };
}
