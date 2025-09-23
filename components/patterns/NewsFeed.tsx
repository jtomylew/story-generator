"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Article } from "@/lib/db";
import { ArticleCard, ArticleCardSkeleton, EmptyState } from "@/components";
import { Button, Toast } from "@/components/ui";

interface NewsFeedProps {
  articles: Article[];
  onGenerateStory: (article: Article) => void;
  generatingId?: string;
  isLoading?: boolean;
  selectedCategories?: string[];
  onRefresh?: () => Promise<void>;
  lastUpdated?: string;
}

// Local SkeletonCard component matching ArticleCard dimensions
function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-6 bg-neutral-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
          </div>
          <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="p-6 pt-0">
        <div className="flex justify-center">
          <div className="h-10 w-32 bg-neutral-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function NewsFeed({
  articles,
  onGenerateStory,
  generatingId,
  isLoading = false,
  selectedCategories = [],
  onRefresh,
  lastUpdated,
}: NewsFeedProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [lastItemHash, setLastItemHash] = useState<string>("");
  const [isVisible, setIsVisible] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const autoRefreshInterval = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Track visibility for pausing auto-refresh
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Auto-refresh every 30 minutes (or 30 seconds for testing)
  useEffect(() => {
    if (!onRefresh || !isVisible) return;

    const interval = 30 * 1000; // 30 seconds for testing (change to 30 * 60 * 1000 for production)

    autoRefreshInterval.current = setInterval(async () => {
      if (!isVisible || isRefreshing) return;

      try {
        await onRefresh();
        // Check if there are new articles
        const currentHash = articles.length > 0 ? articles[0].id : "";
        if (
          currentHash &&
          currentHash !== lastItemHash &&
          lastItemHash !== ""
        ) {
          setToastMessage("New articles available!");
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        }
        setLastItemHash(currentHash);
      } catch (error) {
        console.error("Auto-refresh failed:", error);
      }
    }, interval);

    return () => {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
    };
  }, [onRefresh, isVisible, isRefreshing, articles, lastItemHash]);

  // Update lastItemHash when articles change
  useEffect(() => {
    if (articles.length > 0) {
      setLastItemHash(articles[0].id);
    }
  }, [articles]);

  // Touch event handlers for pull-to-refresh
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (window.scrollY > 0 || isRefreshing) return;
      touchStartY.current = e.touches[0].clientY;
    },
    [isRefreshing],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (window.scrollY > 0 || isRefreshing || !onRefresh) return;

      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - touchStartY.current);
      const maxDistance = 100;

      setPullDistance(Math.min(distance, maxDistance));

      if (distance > 70) {
        e.preventDefault();
      }
    },
    [isRefreshing, onRefresh],
  );

  const handleTouchEnd = useCallback(async () => {
    if (window.scrollY > 0 || isRefreshing || !onRefresh) {
      setPullDistance(0);
      return;
    }

    if (pullDistance > 70) {
      setIsRefreshing(true);
      setPullDistance(0);

      try {
        await onRefresh();
      } catch (error) {
        console.error("Refresh failed:", error);
        setToastMessage("Refresh failed. Please try again.");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } finally {
        setIsRefreshing(false);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, isRefreshing, onRefresh]);

  // Debounced refresh handler
  const handleManualRefresh = useCallback(async () => {
    if (isRefreshing || !onRefresh) return;

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(async () => {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error("Manual refresh failed:", error);
      } finally {
        setIsRefreshing(false);
      }
    }, 300);
  }, [isRefreshing, onRefresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  // Show loading state with skeletons
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={`skeleton-${index}`} />
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
            onClick={handleManualRefresh}
            variant="brand-primary"
            disabled={isRefreshing}
            loading={isRefreshing}
          >
            {isRefreshing ? "Finding fresh stories..." : "Refresh"}
          </Button>
        }
      />
    );
  }

  // Show articles grid with pull-to-refresh
  return (
    <>
      <div
        ref={containerRef}
        className="relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${pullDistance * 0.5}px)`,
          transition: pullDistance > 0 ? "none" : "transform 0.3s ease-out",
        }}
      >
        {/* Pull-to-refresh indicator */}
        {pullDistance > 0 && (
          <div className="flex justify-center items-center py-4 text-sm text-muted-foreground">
            {pullDistance > 70 ? (
              <span>Release to refresh</span>
            ) : (
              <span>Pull to refresh</span>
            )}
          </div>
        )}

        {/* Refresh spinner */}
        {isRefreshing && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600"></div>
          </div>
        )}

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
      </div>

      {/* Toast for new articles */}
      {showToast && (
        <Toast
          title="New Articles"
          description={toastMessage}
          variant="brand"
          className="fixed top-4 right-4 z-50"
        />
      )}
    </>
  );
}
