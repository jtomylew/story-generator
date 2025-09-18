"use client";

import React from "react";
import type { Article } from "@/lib/db";
import { ArticleCard, ArticleCardSkeleton, EmptyState } from "@/components";

interface NewsFeedProps {
  articles: Article[];
  onGenerateStory: (article: Article) => void;
  generatingId?: string;
  isLoading?: boolean;
}

export function NewsFeed({
  articles,
  onGenerateStory,
  generatingId,
  isLoading = false,
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
    return (
      <EmptyState
        icon="📰"
        title="No Articles Available"
        description="We're working on bringing you fresh news articles. Check back soon!"
        action={
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-500 transition-colors duration-[var(--motion-fast)]"
          >
            Refresh
          </button>
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
