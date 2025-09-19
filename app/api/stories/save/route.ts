import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateDeviceId } from "@/lib/device";
import { reqHash } from "@/lib/hash";

export const runtime = "nodejs";

const SaveStorySchema = z.object({
  articleHash: z.string().min(1, "Article hash is required"),
  readingLevel: z
    .enum(["preschool", "early-elementary", "elementary"])
    .optional(),
  story: z.string().min(1, "Story is required"),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const body = await request.json();
    const validatedData = SaveStorySchema.parse(body);

    // For now, simulate story saving without database
    const mockStoryId = `mock-story-${Date.now()}`;

    console.log(
      `Mock saving story: ${validatedData.articleHash} (${validatedData.readingLevel || "elementary"})`,
    );

    return NextResponse.json(
      { ok: true, id: mockStoryId },
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
