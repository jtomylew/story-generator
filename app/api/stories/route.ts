import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getOrCreateDeviceId } from "@/lib/device";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50); // Max 50

    const deviceId = await getOrCreateDeviceId();
    const supabase = getDb();

    const { data, error } = await supabase
      .from("stories")
      .select("id, article_hash, reading_level, created_at, story")
      .eq("device_id", deviceId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        {
          message: "Failed to fetch stories",
          code: "INTERNAL_ERROR",
        },
        {
          status: 500,
          headers: {
            "X-Request-Id": requestId,
            "X-Duration": `${Date.now() - startTime}ms`,
          },
        },
      );
    }

    // Transform data to include snippet
    const stories = data.map((story) => ({
      id: story.id,
      articleHash: story.article_hash,
      readingLevel: story.reading_level,
      createdAt: story.created_at,
      snippet:
        story.story.substring(0, 160) + (story.story.length > 160 ? "..." : ""),
    }));

    return NextResponse.json(stories, {
      status: 200,
      headers: {
        "X-Request-Id": requestId,
        "X-Duration": `${Date.now() - startTime}ms`,
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      {
        status: 500,
        headers: {
          "X-Request-Id": requestId,
          "X-Duration": `${Date.now() - startTime}ms`,
        },
      },
    );
  }
}
