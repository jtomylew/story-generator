// @subframe/sync-disable
"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { GenerateReq } from "@/lib/types";
import type { RequestState, ApiError } from "@/lib/ui-types";
import {
  StoryForm,
  StoryOutput,
  Page,
  SectionHeader,
  NavTabs,
} from "@/components";

const navigationTabs = [
  { label: "News Feed", href: "/" },
  { label: "Paste Article", href: "/paste" },
];

function PasteContent() {
  const searchParams = useSearchParams();
  const [requestState, setRequestState] = useState<RequestState>({
    status: "idle",
  });

  // Check for pre-generated story data from URL params
  useEffect(() => {
    const storyParam = searchParams.get("story");
    if (storyParam) {
      try {
        const storyData = JSON.parse(decodeURIComponent(storyParam));

        // Map the story data to the expected format
        const res = {
          story: storyData.story,
          ageBand: "elementary",
          newsSummary: storyData.title,
          sourceHash: "",
          model: "gpt-4o",
          safety: { flagged: false, reasons: [] },
          cached: false,
          createdAt: new Date().toISOString(),
        };

        const req = {
          articleText: storyData.story,
          readingLevel: "elementary" as const,
        };

        setRequestState({ status: "success", req, res });
      } catch (error) {
        console.error("Failed to parse story data:", error);
      }
    }
  }, [searchParams]);

  // Clean up in-flight requests on unmount
  useEffect(() => {
    return () => {
      // AbortController cleanup is handled in handleSubmit
    };
  }, []);

  const handleSubmit = useCallback(async (req: GenerateReq) => {
    // Cancel any in-flight request
    const abortController = new AbortController();

    setRequestState({ status: "loading", req });

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
        signal: abortController.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        // Map non-OK responses to ApiError shape
        const error: ApiError = {
          message: data.message || "An error occurred",
          code:
            data.code ||
            (response.status === 400
              ? "BAD_REQUEST"
              : response.status === 429
                ? "RATE_LIMITED"
                : "INTERNAL_ERROR"),
          issues: data.issues,
        };

        setRequestState({ status: "error", req, error });
        return;
      }

      // Map successful response to GenerateRes shape
      const res = {
        story: data.story,
        ageBand: req.readingLevel || "elementary",
        newsSummary: data.originalNewsStory,
        sourceHash: "", // TODO: implement hash generation
        model: process.env.MODEL_NAME || "gpt-4o",
        safety: { flagged: false, reasons: [] }, // TODO: implement safety checks
        cached: false,
        createdAt: new Date().toISOString(),
      };

      setRequestState({ status: "success", req, res });
    } catch (err: any) {
      if (err.name === "AbortError") {
        // Request was cancelled, don't update state
        return;
      }

      const error: ApiError = {
        message: err.message || "Network error occurred",
        code: "INTERNAL_ERROR",
      };

      setRequestState({ status: "error", req, error });
    }
  }, []);

  const resetForm = () => {
    setRequestState({ status: "idle" });
  };

  // Check if we have a pre-generated story (coming from news article)
  const hasGeneratedStory = searchParams.get("story") !== null;

  return (
    <div className="space-y-6">
      <NavTabs tabs={navigationTabs} className="mb-6" />

      {/* Only show StoryForm if we don't have a pre-generated story */}
      {!hasGeneratedStory && (
        <StoryForm
          onSubmit={handleSubmit}
          isSubmitting={requestState.status === "loading"}
        />
      )}

      <StoryOutput state={requestState} onReset={resetForm} />
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
        <div className="h-32 bg-neutral-200 rounded animate-pulse" />
        <div className="h-64 bg-neutral-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function PastePage() {
  return (
    <div className="min-h-screen bg-background">
      <Page>
        <SectionHeader
          title="Story Weaver"
          description="Transform news into magical tales for young minds"
        />

        <Suspense fallback={<LoadingFallback />}>
          <PasteContent />
        </Suspense>
      </Page>
    </div>
  );
}
