// @subframe/sync-disable
"use client";

import { useState, useEffect, useCallback } from "react";
import type { GenerateReq } from "@/lib/types";
import { Button, TextArea, Card } from "@/components";

interface StoryFormProps {
  onSubmit: (req: GenerateReq) => void;
  isSubmitting?: boolean;
  defaultText?: string;
}

export function StoryForm({
  onSubmit,
  isSubmitting = false,
  defaultText = "",
}: StoryFormProps) {
  const [articleText, setArticleText] = useState(defaultText);
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

      onSubmit({ articleText: articleText.trim() });
    },
    [articleText, canSubmit, onSubmit],
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
              {isSubmitting
                ? "Generating your awesome story..."
                : "Weave Story"}
            </Button>
          </div>
        </form>
      </Card.Content>
    </Card>
  );
}
