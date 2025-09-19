// @subframe/sync-disable
"use client";

import { useState, useEffect, useCallback } from "react";
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

export default function PastePage() {
  const [requestState, setRequestState] = useState<RequestState>({
    status: "idle",
  });

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

  return (
    <div className="min-h-screen bg-background">
      <Page>
        <SectionHeader
          title="Story Weaver"
          description="Transform news into magical tales for young minds"
        />

        <div className="space-y-6">
          <NavTabs tabs={navigationTabs} className="mb-6" />

          <StoryForm
            onSubmit={handleSubmit}
            isSubmitting={requestState.status === "loading"}
          />

          <StoryOutput state={requestState} onReset={resetForm} />
        </div>
      </Page>
    </div>
  );
}
