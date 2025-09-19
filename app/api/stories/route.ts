import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDeviceId } from "@/lib/device";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50); // Max 50

    // For now, return mock data to avoid Supabase dependency
    const mockStories = [
      {
        id: "mock-story-1",
        articleHash: "abc12345",
        readingLevel: "elementary",
        createdAt: new Date().toISOString(),
        snippet:
          "Once upon a time, in a magical forest far away, there lived a brave little rabbit who loved to explore...",
      },
      {
        id: "mock-story-2",
        articleHash: "def67890",
        readingLevel: "preschool",
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        snippet:
          "The sun was shining bright in the sky, and all the animals in the meadow were playing together happily...",
      },
    ];

    return NextResponse.json(mockStories.slice(0, limit), {
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
