// @subframe/sync-disable
"use client";

import { useState, useEffect, useCallback } from "react";
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

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | undefined>();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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

  // Fetch articles when categories change
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
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
        }
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [selectedCategories]);

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
    <div className="min-h-screen bg-background">
      <Page>
        <SectionHeader
          title="Story Weaver"
          description="Transform news into magical tales for young minds"
        />

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
            />
          </div>
        </div>
      </Page>
    </div>
  );
}
