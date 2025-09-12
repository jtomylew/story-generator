// @subframe/sync-disable
"use client";

import { useState, useEffect, useCallback } from "react";
import type { GenerateReq } from "@/lib/types";
import type { RequestState, ApiError } from "@/lib/ui-types";
import { StoryForm, StoryOutput } from "@/components";

export default function Home() {
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
        ageBand: req.readingLevel,
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">✨</span>
              </div>
              Story Weaver
              <span className="text-2xl text-blue-500">✨</span>
            </h1>
            <p className="text-lg text-gray-600 font-medium">
              Transform news into magical tales for young minds
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <StoryForm
          onSubmit={handleSubmit}
          isSubmitting={requestState.status === "loading"}
        />

        <StoryOutput state={requestState} onReset={resetForm} />
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg text-gray-600 font-medium flex items-center justify-center gap-2">
            <span className="text-blue-500">✨</span>
            Weaving stories that spark imagination and wonder
            <span className="text-blue-500">✨</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
