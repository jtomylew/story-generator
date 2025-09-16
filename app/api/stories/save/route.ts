import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { getOrCreateDeviceId } from "@/lib/device";
import { reqHash } from "@/lib/hash";

export const runtime = "nodejs";

const SaveStorySchema = z.object({
  articleHash: z.string().min(1, "Article hash is required"),
  readingLevel: z.enum(["preschool", "early-elementary", "elementary"]),
  story: z.string().min(1, "Story is required"),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const body = await request.json();
    const validatedData = SaveStorySchema.parse(body);

    const deviceId = await getOrCreateDeviceId();
    const supabase = getDb();

    // Upsert the story
    const { data, error } = await supabase
      .from("stories")
      .upsert(
        {
          device_id: deviceId,
          article_hash: validatedData.articleHash,
          reading_level: validatedData.readingLevel,
          story: validatedData.story,
        },
        {
          onConflict: "device_id,article_hash",
        },
      )
      .select("id")
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        {
          message: "Failed to save story",
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

    return NextResponse.json(
      { ok: true, id: data.id },
      {
        status: 200,
        headers: {
          "X-Request-Id": requestId,
          "X-Duration": `${Date.now() - startTime}ms`,
        },
      },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Invalid request data",
          code: "VALIDATION_ERROR",
          issues: error.errors,
        },
        {
          status: 400,
          headers: {
            "X-Request-Id": requestId,
            "X-Duration": `${Date.now() - startTime}ms`,
          },
        },
      );
    }

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
