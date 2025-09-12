// @subframe/sync-disable
"use client";

import { useState, useEffect, useCallback } from "react";
import type { GenerateReq, ReadingLevel } from "@/lib/types";
import { Button, TextArea, Select } from "@/components";

interface StoryFormProps {
  onSubmit: (req: GenerateReq) => void;
  isSubmitting?: boolean;
  defaultText?: string;
  defaultLevel?: ReadingLevel;
}

export function StoryForm({
  onSubmit,
  isSubmitting = false,
  defaultText = "",
  defaultLevel = "elementary",
}: StoryFormProps) {
  const [articleText, setArticleText] = useState(defaultText);
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>(defaultLevel);
  const [error, setError] = useState<string>("");

  // Client-side validation mirroring Zod schema
  const isValid = articleText.length >= 50;
  const canSubmit = isValid && !isSubmitting;

  // Update error message based on validation
  useEffect(() => {
    if (articleText.length > 0 && articleText.length < 50) {
      setError("Provide at least a full paragraph of article text.");
    } else {
      setError("");
    }
  }, [articleText]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!canSubmit) return;

      onSubmit({ articleText: articleText.trim(), readingLevel });
    },
    [articleText, readingLevel, canSubmit, onSubmit],
  );

  // Hotkey: Ctrl/Cmd+Enter submits when valid
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && canSubmit) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [canSubmit, handleSubmit],
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* News Article Input */}
        <div>
          <label
            htmlFor="articleText"
            className="block text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">📰</span>
            </div>
            News Article
          </label>
          <TextArea className="w-full">
            <TextArea.Input
              value={articleText}
              onChange={(e) => setArticleText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste a news article here and watch it transform into a magical story..."
              className={`h-40 p-6 border-2 rounded-xl focus:ring-4 focus:border-blue-400 bg-white resize-none text-gray-800 placeholder-gray-400 transition duration-200 ease-in-out ${
                error
                  ? "border-red-300 focus:ring-red-300"
                  : "border-gray-200 focus:ring-blue-300"
              }`}
              disabled={isSubmitting}
              aria-describedby={error ? "articleText-error" : undefined}
              aria-invalid={error ? "true" : "false"}
            />
          </TextArea>
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm text-gray-500">
              {articleText.length} characters
            </div>
            {error && (
              <p
                id="articleText-error"
                className="text-red-600 text-sm"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Reading Level Selection */}
        <div>
          <label
            htmlFor="readingLevel"
            className="block text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🎓</span>
            </div>
            Reading Level
          </label>
          <Select
            value={readingLevel}
            onValueChange={(value) => setReadingLevel(value as ReadingLevel)}
            className="w-full"
            disabled={isSubmitting}
          >
            <Select.Item value="preschool">
              <div className="flex items-center gap-2">
                <span>👶</span>
                <span>Preschool (ages 3-5)</span>
              </div>
            </Select.Item>
            <Select.Item value="early-elementary">
              <div className="flex items-center gap-2">
                <span>🎒</span>
                <span>Early Elementary (ages 5-7)</span>
              </div>
            </Select.Item>
            <Select.Item value="elementary">
              <div className="flex items-center gap-2">
                <span>👥</span>
                <span>Elementary (ages 7-10)</span>
              </div>
            </Select.Item>
          </Select>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={!canSubmit}
            className="px-8 py-4 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 font-semibold text-lg rounded-xl transition duration-200 ease-in-out flex items-center justify-center gap-3 min-w-[200px]"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Weaving...</span>
              </>
            ) : (
              <>
                <span className="text-xl">✨</span>
                <span>Weave Story</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
