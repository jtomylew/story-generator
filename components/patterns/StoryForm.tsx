// @subframe/sync-disable
"use client";

import { useState, useEffect, useCallback } from "react";
import type { GenerateReq, ReadingLevel } from "@/lib/types";
import { Button, TextArea, Select, Card } from "@/components";

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
    <Card>
      <Card.Header>
        <Card.Title>Create Your Story</Card.Title>
      </Card.Header>
      <Card.Content>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* News Article Input */}
          <div className="space-y-2">
            <TextArea
              label="News Article"
              error={!!error}
              helpText={error || `${articleText.length} characters`}
              className="w-full"
            >
              <TextArea.Input
                value={articleText}
                onChange={(e) => setArticleText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste a news article here and watch it transform into a magical story..."
                className="h-40 resize-none"
                disabled={isSubmitting}
                aria-describedby={error ? "articleText-error" : undefined}
                aria-invalid={error ? "true" : "false"}
              />
            </TextArea>
          </div>

          {/* Reading Level Selection */}
          <div className="space-y-2">
            <Select
              label="Reading Level"
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
              variant="brand-primary"
              size="large"
              loading={isSubmitting}
              className="min-w-[200px]"
            >
              {isSubmitting ? "Weaving..." : "Weave Story"}
            </Button>
          </div>
        </form>
      </Card.Content>
    </Card>
  );
}
