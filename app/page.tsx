// @subframe/sync-disable
"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Article } from "@/lib/db";
import {
  NewsFeed,
  Page,
  SectionHeader,
  NavTabs,
  CategoryFilter,
} from "@/components";

const navigationTabs = [
  { label: "News Feed", href: "/" },
  { label: "Paste Article", href: "/paste" },
];

const AVAILABLE_CATEGORIES = [
  "science",
  "nature",
  "sports",
  "arts",
  "education",
  "technology",
  "animals",
];

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | undefined>();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Initialize selected categories from URL params
  useEffect(() => {
    const categoriesParam = searchParams.get("categories");
    if (categoriesParam) {
      const categories = categoriesParam
        .split(",")
        .map((c) => c.trim().toLowerCase())
        .filter((c) => AVAILABLE_CATEGORIES.includes(c));
      setSelectedCategories(categories);
    }
  }, [searchParams]);

  // Fetch articles function
  const fetchArticles = useCallback(async () => {
    try {
      const categoriesParam =
        selectedCategories.length > 0 ? selectedCategories.join(",") : "";
      const url = categoriesParam
        ? `/api/feed?categories=${encodeURIComponent(categoriesParam)}`
        : "/api/feed";

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
        setLastUpdated(data.meta?.lastUpdated || new Date().toISOString());
      }
    } catch (error) {
      console.error("Failed to fetch articles:", error);
      throw error;
    }
  }, [selectedCategories]);

  // Fetch articles when categories change
  useEffect(() => {
    const loadArticles = async () => {
      setIsLoading(true);
      try {
        await fetchArticles();
      } finally {
        setIsLoading(false);
      }
    };

    loadArticles();
  }, [fetchArticles]);

  const handleCategoryChange = useCallback(
    (categories: string[]) => {
      setSelectedCategories(categories);

      // Update URL with new categories
      const params = new URLSearchParams(searchParams.toString());
      if (categories.length > 0) {
        params.set("categories", categories.sort().join(","));
      } else {
        params.delete("categories");
      }

      const newUrl = params.toString() ? `?${params.toString()}` : "/";
      router.push(newUrl);
    },
    [searchParams, router],
  );

  const handleGenerateStory = useCallback(async (article: Article) => {
    setGeneratingId(article.id);

    try {
      // Navigate to paste page with article content
      // This is a simplified approach - in a real implementation,
      // you might want to pass the article data via URL params or state
      window.location.href = `/paste?article=${encodeURIComponent(article.content)}`;
    } catch (error) {
      console.error("Failed to generate story:", error);
    } finally {
      setGeneratingId(undefined);
    }
  }, []);

  return (
    <div className="space-y-6">
      <NavTabs tabs={navigationTabs} className="mb-6" />

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-3">Filter by Category</h2>
          <CategoryFilter
            categories={AVAILABLE_CATEGORIES}
            selected={selectedCategories}
            onChange={handleCategoryChange}
          />
        </div>

        <NewsFeed
          articles={articles}
          onGenerateStory={handleGenerateStory}
          generatingId={generatingId}
          isLoading={isLoading}
          selectedCategories={selectedCategories}
          onRefresh={fetchArticles}
          lastUpdated={lastUpdated}
        />
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="space-y-6">
      <div className="flex space-x-1">
        {navigationTabs.map((tab) => (
          <div
            key={tab.label}
            className="px-4 py-2 text-sm font-medium text-muted-foreground border-b-2 border-transparent"
          >
            {tab.label}
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-3">Filter by Category</h2>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-20 bg-neutral-200 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card text-card-foreground shadow-sm"
            >
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
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Page>
        <SectionHeader
          title="Story Weaver"
          description="Transform news into magical tales for young minds"
        />

        <Suspense fallback={<LoadingFallback />}>
          <HomeContent />
        </Suspense>
      </Page>
    </div>
  );
}
