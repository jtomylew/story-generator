import { Page, SectionHeader, Card, EmptyState } from "@/components";
import { getDb } from "@/lib/db";
import { getOrCreateDeviceId } from "@/lib/device";

interface Story {
  id: string;
  articleHash: string;
  readingLevel: string;
  createdAt: string;
  snippet: string;
}

async function getStories(): Promise<Story[]> {
  const deviceId = await getOrCreateDeviceId();
  const supabase = getDb();

  const { data, error } = await supabase
    .from("stories")
    .select("id, article_hash, reading_level, created_at, story")
    .eq("device_id", deviceId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Database error:", error);
    return [];
  }

  return data.map((story) => ({
    id: story.id,
    articleHash: story.article_hash,
    readingLevel: story.reading_level,
    createdAt: story.created_at,
    snippet:
      story.story.substring(0, 160) + (story.story.length > 160 ? "..." : ""),
  }));
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

export default async function StoriesPage() {
  const stories = await getStories();

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
