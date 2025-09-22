"use client";

import React from "react";
import type { ArticleInput } from "@/lib/feeds";
import { Card, Badge, Button, SkeletonText } from "@/components";

interface ArticleCardProps {
  article: ArticleInput;
  onGenerateStory: (article: ArticleInput) => void;
  isGenerating?: boolean;
  converted?: boolean;
}

// Helper function to format relative time
function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "Recently";

  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
  return `${Math.floor(diffInDays / 30)}mo ago`;
}

// Helper function to get badge variant based on category
function getCategoryVariant(
  category: string,
): "brand" | "neutral" | "error" | "warning" | "success" {
  switch (category) {
    case "science":
    case "technology":
      return "brand";
    case "nature":
    case "animals":
      return "success";
    case "sports":
      return "warning";
    case "arts":
    case "education":
      return "neutral";
    case "positive":
      return "success";
    default:
      return "neutral";
  }
}

// Helper function to capitalize category for display
function capitalizeCategory(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function ArticleCard({
  article,
  onGenerateStory,
  isGenerating = false,
  converted = false,
}: ArticleCardProps) {
  const handleGenerateStory = () => {
    if (!isGenerating && !converted) {
      onGenerateStory(article);
    }
  };

  return (
    <Card
      className={`group transition-all duration-[var(--motion-medium)] ease-[var(--ease-standard)] ${
        converted
          ? "cursor-default opacity-75"
          : "cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-brand-200 active:scale-[0.98] active:transition-none"
      }`}
      onClick={handleGenerateStory}
      role="button"
      tabIndex={0}
      aria-label={`Generate story from article: ${article.title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleGenerateStory();
        }
      }}
    >
      <Card.Header>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Card.Title className="text-lg leading-tight line-clamp-2 group-hover:text-brand-600 transition-colors duration-[var(--motion-fast)]">
              {article.title}
            </Card.Title>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">
                {article.source}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {formatRelativeTime(article.published_at)}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Badge variant={getCategoryVariant(article.category)}>
              {capitalizeCategory(article.category)}
            </Badge>
            {converted && (
              <Badge variant="success" className="text-xs">
                Already converted
              </Badge>
            )}
          </div>
        </div>
      </Card.Header>

      <Card.Content>
        <div className="flex justify-center">
          <Button
            onClick={(e) => {
              e.stopPropagation(); // Prevent double-triggering
              handleGenerateStory();
            }}
            disabled={isGenerating || converted}
            variant={converted ? "neutral-secondary" : "brand-primary"}
            size="medium"
            loading={isGenerating}
            className="min-w-[140px] transition-all duration-[var(--motion-fast)] ease-[var(--ease-standard)] hover:scale-105 group-hover:shadow-md"
          >
            {isGenerating
              ? "Weaving..."
              : converted
                ? "Already Converted"
                : "Generate Story"}
          </Button>
        </div>
      </Card.Content>
    </Card>
  );
}

// Loading state component for ArticleCard
export function ArticleCardSkeleton() {
  return (
    <Card>
      <Card.Header>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            <SkeletonText size="subheader" className="h-6" />
            <SkeletonText size="label" className="h-4 w-32" />
          </div>
          <SkeletonText size="label" className="h-6 w-16 rounded-md" />
        </div>
      </Card.Header>

      <Card.Content>
        <div className="flex justify-center">
          <SkeletonText size="label" className="h-10 w-32 rounded-md" />
        </div>
      </Card.Content>
    </Card>
  );
}
