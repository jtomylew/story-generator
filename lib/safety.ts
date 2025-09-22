import type { ArticleInput } from "./db";

// Light keyword/NER screen for obviously unsafe topics
const UNSAFE_KEYWORDS = [
  // Violence
  "violence",
  "violent",
  "attack",
  "assault",
  "murder",
  "kill",
  "death",
  "die",
  "dead",
  "weapon",
  "gun",
  "knife",
  "bomb",
  "explosion",
  "war",
  "battle",
  "fight",
  "fighting",

  // Adult content
  "sex",
  "sexual",
  "porn",
  "adult",
  "nude",
  "naked",
  "intimate",

  // Drugs and alcohol
  "drug",
  "drugs",
  "cocaine",
  "heroin",
  "marijuana",
  "alcohol",
  "drunk",
  "drinking",

  // Self-harm
  "suicide",
  "self-harm",
  "cutting",
  "overdose",

  // Hate speech indicators
  "hate",
  "racist",
  "discrimination",
  "prejudice",
  "bigotry",
];

// Feed-specific filtering categories
const BLOCKED_KEYWORDS = [
  // Domestic/sexual violence (no allegorical value)
  "domestic violence",
  "sexual assault",
  "rape",
  "abuse",
  "molestation",
  "harassment",
  "stalking",
  "trafficking",
  "exploitation",
];

const HARD_NEWS_KEYWORDS = [
  // War/conflict topics (allowed but tagged)
  "war",
  "conflict",
  "battle",
  "military",
  "soldier",
  "troops",
  "combat",
  "invasion",
  "occupation",
  "ceasefire",
  "peace treaty",
  "diplomacy",
  "sanctions",
  "refugee",
  "displacement",
];

const SEVERITY_KEYWORDS = [
  // Death/attack keywords (raise score but don't auto-block)
  "killed",
  "murdered",
  "assassinated",
  "executed",
  "massacre",
  "terrorist",
  "terrorism",
  "bombing",
  "shooting",
  "mass shooting",
  "casualties",
  "fatalities",
  "injured",
  "wounded",
];

const CONTEXT_SAFE_WORDS = [
  // These words might appear in safe contexts
  "news",
  "article",
  "story",
  "report",
  "event",
  "situation",
  "problem",
  "issue",
  "help",
  "support",
  "community",
  "education",
  "awareness",
  "prevention",
];

export function maybeRefuse(input: string): {
  refuse: boolean;
  reason?: string;
} {
  const lowerInput = input.toLowerCase();

  // Check for unsafe keywords
  const foundUnsafe = UNSAFE_KEYWORDS.filter((keyword) =>
    lowerInput.includes(keyword.toLowerCase()),
  );

  if (foundUnsafe.length > 0) {
    // Check if the context might be safe (educational, news reporting, etc.)
    const hasSafeContext = CONTEXT_SAFE_WORDS.some((safeWord) =>
      lowerInput.includes(safeWord.toLowerCase()),
    );

    if (!hasSafeContext) {
      return {
        refuse: true,
        reason: `Content contains potentially inappropriate topics: ${foundUnsafe.join(", ")}. Please provide a different news article.`,
      };
    }
  }

  // Check for excessive length (might be trying to bypass filters)
  if (input.length > 10000) {
    return {
      refuse: true,
      reason:
        "Article text is too long. Please provide a shorter, more focused news article.",
    };
  }

  // Check for minimum meaningful content
  if (input.trim().length < 50) {
    return {
      refuse: true,
      reason:
        "Article text is too short. Please provide a more detailed news article.",
    };
  }

  return { refuse: false };
}

// Feed content filtering interfaces
export interface FeedSafetyResult {
  safe: boolean;
  reasons: string[];
  ageScore: number; // 0-100 (<60 kid-friendly, 60-79 teen, 80+ adult)
  severity: "low" | "medium" | "high";
}

export interface FeedFilterResult<T extends ArticleInput = ArticleInput> {
  articles: T[];
  meta: {
    filteredCount: number;
    safetyApplied: boolean;
  };
}

/**
 * Filter content for feed articles with age-appropriate scoring
 *
 * Business rules:
 * - Allow: war/conflict topics (tag as 'hard_news', educational value)
 * - Block: domestic/sexual violence (no allegorical value)
 * - Severity hints: death/attack raise score but don't auto-block
 * - Age scoring: 0-100 (<60 kid-friendly, 60-79 teen, 80+ adult)
 * - Guardrails: case-insensitive, don't mutate, deterministic
 */
export function feedContentFilter(article: ArticleInput): FeedSafetyResult {
  const text = `${article.title} ${article.content}`.toLowerCase();
  const reasons: string[] = [];
  let ageScore = 0;
  let severity: "low" | "medium" | "high" = "low";

  // Check for blocked keywords (domestic/sexual violence - no allegorical value)
  const foundBlocked = BLOCKED_KEYWORDS.filter((keyword) =>
    text.includes(keyword.toLowerCase()),
  );

  if (foundBlocked.length > 0) {
    return {
      safe: false,
      reasons: [`Contains blocked content: ${foundBlocked.join(", ")}`],
      ageScore: 100, // Maximum adult score
      severity: "high",
    };
  }

  // Check for hard news keywords (war/conflict - allowed but tagged)
  const foundHardNews = HARD_NEWS_KEYWORDS.filter((keyword) =>
    text.includes(keyword.toLowerCase()),
  );

  if (foundHardNews.length > 0) {
    reasons.push(`Hard news content: ${foundHardNews.join(", ")}`);
    ageScore += 30; // Moderate increase for war/conflict topics
    severity = "medium";
  }

  // Check for severity keywords (death/attack - raise score but don't auto-block)
  const foundSeverity = SEVERITY_KEYWORDS.filter((keyword) =>
    text.includes(keyword.toLowerCase()),
  );

  if (foundSeverity.length > 0) {
    reasons.push(`Severity indicators: ${foundSeverity.join(", ")}`);
    ageScore += foundSeverity.length * 15; // 15 points per severity keyword
    severity = "high";
  }

  // Check for general unsafe keywords (from original list)
  const foundUnsafe = UNSAFE_KEYWORDS.filter((keyword) =>
    text.includes(keyword.toLowerCase()),
  );

  if (foundUnsafe.length > 0) {
    // Check if context might be safe (educational, news reporting, etc.)
    const hasSafeContext = CONTEXT_SAFE_WORDS.some((safeWord) =>
      text.includes(safeWord.toLowerCase()),
    );

    if (hasSafeContext) {
      reasons.push(
        `Contains sensitive topics in news context: ${foundUnsafe.join(", ")}`,
      );
      ageScore += foundUnsafe.length * 10; // 10 points per unsafe keyword
      if (severity === "low") severity = "medium";
    } else {
      // No safe context - block the content
      return {
        safe: false,
        reasons: [`Contains inappropriate content: ${foundUnsafe.join(", ")}`],
        ageScore: 90,
        severity: "high",
      };
    }
  }

  // Cap age score at 100
  ageScore = Math.min(ageScore, 100);

  return {
    safe: true,
    reasons,
    ageScore,
    severity,
  };
}

/**
 * Filter unsafe articles from a list, returning safe articles with metadata
 */
export function filterUnsafe<T extends ArticleInput>(
  articles: T[],
): FeedFilterResult<T> {
  const safeArticles: T[] = [];
  let filteredCount = 0;

  for (const article of articles) {
    const safetyResult = feedContentFilter(article);

    if (safetyResult.safe) {
      safeArticles.push(article);
    } else {
      filteredCount++;
      // Log filtered articles for monitoring (in production, this could go to analytics)
      console.log(
        `Filtered article: ${article.title} - Reasons: ${safetyResult.reasons.join(", ")}`,
      );
    }
  }

  return {
    articles: safeArticles,
    meta: {
      filteredCount,
      safetyApplied: true,
    },
  };
}
