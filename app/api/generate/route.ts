import "server-only";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { GenerateReq, GenerateRes, formatZodIssues } from "@/lib/schema";
import { createClient } from "@/lib/openai";
import { loadPrompt } from "@/lib/prompt";
import { postCheck } from "@/lib/postcheck";
import { reqHash } from "@/lib/hash";
import { get, set } from "@/lib/cache";
import { maybeRefuse } from "@/lib/safety";
import type { ApiError } from "@/lib/ui-types";

// Check if OpenAI API key is available
const hasOpenAIKey =
  process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0;

export async function POST(req: Request) {
  let requestHash: string;
  let modelUsed: string;
  let parsedData: { articleText: string; readingLevel: string };
  let effectiveReadingLevel: string;

  try {
    const raw = await req.json();
    const parsed = GenerateReq.safeParse(raw);
    if (!parsed.success) {
      const error: ApiError = {
        message: "Invalid request data",
        code: "BAD_REQUEST",
        issues: formatZodIssues(parsed.error),
      };
      return NextResponse.json(error, { status: 400 });
    }
    const { articleText, readingLevel } = parsed.data;
    // Default to "elementary" (7-10 year olds) if no reading level specified
    effectiveReadingLevel = readingLevel || "elementary";
    parsedData = { articleText, readingLevel: effectiveReadingLevel };

    // If no OpenAI API key is available, return a mock response for development
    if (!hasOpenAIKey) {
      console.log("OpenAI API key not available, returning mock response");

      const mockStory = `Once upon a time, there was a magical place where amazing things happened every day. The story begins with a brave little explorer who discovered something wonderful in the world around them.

This is a mock story generated for development purposes. In a real deployment, this would be a beautifully crafted story based on the article: "${articleText.substring(0, 100)}..."

The little explorer learned that every day brings new adventures and opportunities to learn and grow. They discovered that the world is full of wonder and magic, just waiting to be explored by curious minds.

And so, the adventure continues, with new stories to be told and new discoveries to be made every single day.`;

      const mockResponse: GenerateRes = {
        story: mockStory,
        questions: [
          "What was the most exciting part of the story?",
          "What would you do if you were the little explorer?",
        ],
        meta: {
          readingLevel: effectiveReadingLevel,
          wordCount: mockStory.split(" ").length,
        },
      };

      return NextResponse.json(mockResponse);
    }

    // Safety screening
    const safetyCheck = maybeRefuse(articleText);
    if (safetyCheck.refuse) {
      const error: ApiError = {
        message:
          safetyCheck.reason || "Content not suitable for children's stories",
        code: "BAD_REQUEST",
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Generate request hash for caching
    requestHash = await reqHash(articleText, effectiveReadingLevel);

    // Check cache first
    const cached = get(requestHash);
    if (cached) {
      const response = NextResponse.json(cached);
      response.headers.set("X-Cache", "HIT");
      response.headers.set("X-Model", modelUsed);
      response.headers.set("X-Request", requestHash);
      return response;
    }

    // Build prompts using external templates
    const systemPrompt = loadPrompt("system.story", {
      readingLevel: effectiveReadingLevel,
      articleText,
    });
    const userPrompt = loadPrompt("user.story", {
      readingLevel: effectiveReadingLevel,
      articleText,
    });

    // Create OpenAI client with retry logic
    const client = createClient({
      model: process.env.MODEL_NAME || "gpt-4o",
      temperature: 0.7,
      maxTokens: 1000,
    });

    modelUsed = process.env.MODEL_NAME || "gpt-4o";

    // Call OpenAI API with retry logic
    const completion = await client.chatCompletionsCreate({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const generatedContent = completion.choices[0]?.message?.content;
    if (!generatedContent) {
      throw new Error("No content generated from OpenAI");
    }

    // Parse JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(generatedContent);
    } catch (parseError) {
      // If JSON parsing fails, try to extract story and create questions
      parsedResponse = {
        story: generatedContent,
        questions: [
          "What lesson did you learn from this story?",
          "How can you apply this lesson in your own life?",
        ],
      };
    }

    // Validate response structure
    const validatedResponse = GenerateRes.parse(parsedResponse);

    // Add metadata
    const wordCount = validatedResponse.story.split(/\s+/).length;
    const responseWithMeta = {
      ...validatedResponse,
      meta: {
        readingLevel: effectiveReadingLevel,
        wordCount,
      },
    };

    // Post-check validation
    postCheck(responseWithMeta, effectiveReadingLevel);

    // Cache the result
    try {
      set(requestHash, responseWithMeta);
    } catch (cacheError) {
      console.warn("Failed to cache result:", cacheError);
    }

    // Return response with headers
    const response = NextResponse.json(responseWithMeta);
    response.headers.set("X-Cache", "MISS");
    response.headers.set("X-Model", modelUsed);
    response.headers.set("X-Request", requestHash);
    return response;
  } catch (error: any) {
    console.error("Error generating story:", error);

    // Handle post-check validation errors with retry
    if (
      (error.message && error.message.includes("word count")) ||
      error.message.includes("questions")
    ) {
      try {
        // Retry once with corrective system prompt
        const correctivePrompt =
          loadPrompt("system.story", {
            readingLevel: effectiveReadingLevel,
            articleText: parsedData.articleText,
          }) +
          "\n\nIMPORTANT: Ensure the story word count fits the reading level and include exactly 2 discussion questions.";

        const client = createClient({
          model: process.env.MODEL_NAME || "gpt-4o",
          temperature: 0.5, // Lower temperature for more consistent output
          maxTokens: 1000,
        });

        const retryCompletion = await client.chatCompletionsCreate({
          messages: [
            { role: "system", content: correctivePrompt },
            {
              role: "user",
              content: loadPrompt("user.story", {
                readingLevel: effectiveReadingLevel,
                articleText: parsedData.articleText,
              }),
            },
          ],
        });

        const retryContent = retryCompletion.choices[0]?.message?.content;
        if (retryContent) {
          const retryParsed = JSON.parse(retryContent);
          const retryValidated = GenerateRes.parse(retryParsed);
          const wordCount = retryValidated.story.split(/\s+/).length;
          const retryResponse = {
            ...retryValidated,
            meta: { readingLevel: effectiveReadingLevel, wordCount },
          };

          postCheck(retryResponse, effectiveReadingLevel);
          set(requestHash, retryResponse);

          const response = NextResponse.json(retryResponse);
          response.headers.set("X-Cache", "MISS");
          response.headers.set("X-Model", modelUsed);
          response.headers.set("X-Request", requestHash);
          return response;
        }
      } catch (retryError) {
        console.error("Retry also failed:", retryError);
      }
    }

    // Handle specific OpenAI errors
    if (error.status === 401) {
      const apiError: ApiError = {
        message: "Invalid OpenAI API key",
        code: "INTERNAL_ERROR",
      };
      return NextResponse.json(apiError, { status: 401 });
    }

    if (error.status === 429) {
      const apiError: ApiError = {
        message: "Rate limit exceeded. Please try again later.",
        code: "RATE_LIMITED",
      };
      return NextResponse.json(apiError, { status: 429 });
    }

    if (error.status >= 500) {
      const apiError: ApiError = {
        message: "OpenAI service is currently unavailable",
        code: "INTERNAL_ERROR",
      };
      return NextResponse.json(apiError, { status: 503 });
    }

    // Generic error response
    const apiError: ApiError = {
      message: "Unable to generate story at this time. Please try again.",
      code: "INTERNAL_ERROR",
    };
    const response = NextResponse.json(apiError, { status: 500 });
    response.headers.set("X-Cache", "BYPASS");
    return response;
  }
}

// Handle unsupported HTTP methods
export async function GET() {
  const error: ApiError = {
    message: "Method not allowed. Use POST to generate a story.",
    code: "BAD_REQUEST",
  };
  return NextResponse.json(error, { status: 405 });
}

export async function PUT() {
  const error: ApiError = {
    message: "Method not allowed. Use POST to generate a story.",
    code: "BAD_REQUEST",
  };
  return NextResponse.json(error, { status: 405 });
}

export async function DELETE() {
  const error: ApiError = {
    message: "Method not allowed. Use POST to generate a story.",
    code: "BAD_REQUEST",
  };
  return NextResponse.json(error, { status: 405 });
}
