"use client";

import { useState, useEffect } from "react";
import { Page, SectionHeader, Card, EmptyState } from "@/components";

interface Story {
  id: string;
  articleHash: string;
  readingLevel: string;
  createdAt: string;
  snippet: string;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatReadingLevel(level: string): string {
  const levels = {
    preschool: "Preschool",
    "early-elementary": "Early Elementary",
    elementary: "Elementary",
  };
  return levels[level as keyof typeof levels] || level;
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch("/api/stories");
        if (response.ok) {
          const data = await response.json();
          setStories(data);
        }
      } catch (error) {
        console.error("Failed to fetch stories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, []);

  if (isLoading) {
    return (
      <Page>
        <SectionHeader
          title="Your Saved Stories"
          description="Browse through your previously generated stories"
        />
        <EmptyState
          icon="⏳"
          title="Loading stories..."
          description="Please wait while we fetch your saved stories"
        />
      </Page>
    );
  }

  return (
    <Page>
      <SectionHeader
        title="Your Saved Stories"
        description="Browse through your previously generated stories"
      />

      {stories.length === 0 ? (
        <EmptyState
          icon="📚"
          title="No stories yet"
          description="Generate and save your first story to see it here!"
        />
      ) : (
        <Card>
          <Card.Content>
            <div className="space-y-4">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="border-b border-border pb-4 last:border-b-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-sm">
                        Story #{story.articleHash.substring(0, 8)}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {formatReadingLevel(story.readingLevel)} •{" "}
                        {formatDate(story.createdAt)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {story.snippet}
                  </p>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}
    </Page>
  );
}
