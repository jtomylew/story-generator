"use client";

import { useState, useCallback } from "react";
import type { GenerateReq } from "@/lib/types";
import type { RequestState, ApiError } from "@/lib/ui-types";
import { StoryForm, StoryOutput } from "@/components";

interface GenerateStoryProps {
  className?: string;
}

export function GenerateStory({ className }: GenerateStoryProps) {
  const [requestState, setRequestState] = useState<RequestState>({
    status: "idle",
  });

  const handleSubmit = useCallback(async (req: GenerateReq) => {
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

      const res = {
        story: data.story,
        ageBand: req.readingLevel,
        newsSummary: data.originalNewsStory,
        sourceHash: "",
        model: process.env.MODEL_NAME || "gpt-4o",
        safety: { flagged: false, reasons: [] },
        cached: false,
        createdAt: new Date().toISOString(),
      };

      setRequestState({ status: "success", req, res });
    } catch (err: any) {
      if (err.name === "AbortError") {
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
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-orange-50 ${className}`}
    >
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-green-600 to-orange-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 flex items-center justify-center gap-3">
              <span className="text-3xl md:text-4xl">📚</span>
              Story Weaver
              <span className="text-3xl md:text-4xl">✨</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 font-medium">
              Transform news into magical tales for young minds
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <StoryForm
          onSubmit={handleSubmit}
          isSubmitting={requestState.status === "loading"}
        />

        <StoryOutput state={requestState} onReset={resetForm} />
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-600 via-green-600 to-orange-500 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-medium">
            ✨ Weaving stories that spark imagination and wonder - test ✨
          </p>
        </div>
      </footer>
    </div>
  );
}
