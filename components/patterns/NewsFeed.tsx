"use client";

import React from "react";
import type { Article } from "@/lib/db";
import { ArticleCard, ArticleCardSkeleton, EmptyState } from "@/components";
import { Button } from "@/components/ui";

interface NewsFeedProps {
  articles: Article[];
  onGenerateStory: (article: Article) => void;
  generatingId?: string;
  isLoading?: boolean;
  selectedCategories?: string[];
}

export function NewsFeed({
  articles,
  onGenerateStory,
  generatingId,
  isLoading = false,
  selectedCategories = [],
}: NewsFeedProps) {
  // Show loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <ArticleCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  // Show empty state
  if (articles.length === 0) {
    const hasSelectedCategories = selectedCategories.length > 0;

    return (
      <EmptyState
        icon="📰"
        title={
          hasSelectedCategories ? "No Articles Found" : "No Articles Available"
        }
        description={
          hasSelectedCategories
            ? `No articles found for the selected categories: ${selectedCategories.join(", ")}. Try selecting different categories or clear all filters.`
            : "We're working on bringing you fresh news articles. Check back soon!"
        }
        action={
          <Button
            onClick={() => window.location.reload()}
            variant="brand-primary"
          >
            Refresh
          </Button>
        }
      />
    );
  }

  // Show articles grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          onGenerateStory={onGenerateStory}
          isGenerating={article.id === generatingId}
        />
      ))}
    </div>
  );
}
