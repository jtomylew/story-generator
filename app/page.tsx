// @subframe/sync-disable
"use client";

import { useState, useEffect, useCallback } from "react";
import type { Article } from "@/lib/db";
import { NewsFeed, Page, SectionHeader, NavTabs } from "@/components";

const navigationTabs = [
  { label: "News Feed", href: "/" },
  { label: "Paste Article", href: "/paste" },
];

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | undefined>();

  // Fetch articles on component mount
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch("/api/feed");
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
  }, []);

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

          <NewsFeed
            articles={articles}
            onGenerateStory={handleGenerateStory}
            generatingId={generatingId}
            isLoading={isLoading}
          />
        </div>
      </Page>
    </div>
  );
}
