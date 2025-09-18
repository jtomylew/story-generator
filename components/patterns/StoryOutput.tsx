// @subframe/sync-disable
"use client";

import { useState } from "react";
import type { RequestState } from "@/lib/ui-types";
import { Button, Card, SkeletonText, Toolbar } from "@/components";
import { reqHash } from "@/lib/hash";

interface StoryOutputProps {
  state: RequestState;
  onReset: () => void;
}

export function StoryOutput({ state, onReset }: StoryOutputProps) {
  const [showToast, setShowToast] = useState(false);
  const [saveState, setSaveState] = useState<
    "idle" | "loading" | "saved" | "error"
  >("idle");

  const handleCopyStory = async () => {
    if (state.status !== "success") return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(state.res.story);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = state.res.story;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Failed to copy story:", error);
      // Could add error toast here if needed
    }
  };

  const handleSaveStory = async () => {
    if (state.status !== "success") return;

    setSaveState("loading");

    try {
      const articleHash = await reqHash(
        state.req.articleText,
        state.req.readingLevel || "elementary",
      );

      const response = await fetch("/api/stories/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          articleHash,
          readingLevel: state.req.readingLevel || "elementary",
          story: state.res.story,
        }),
      });

      if (response.ok) {
        setSaveState("saved");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        setSaveState("error");
      }
    } catch (error) {
      console.error("Failed to save story:", error);
      setSaveState("error");
    }
  };

  // Idle state - nothing to render
  if (state.status === "idle") {
    return null;
  }

  // Loading state
  if (state.status === "loading") {
    return (
      <Card>
        <Card.Header>
          <Card.Title>Creating Your Story</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Our magical weavers are crafting a special tale just for you...
            </p>
            <div className="space-y-3">
              <SkeletonText size="header" />
              <SkeletonText />
              <SkeletonText />
              <SkeletonText />
              <SkeletonText />
              <SkeletonText />
            </div>
          </div>
        </Card.Content>
      </Card>
    );
  }

  // Error state
  if (state.status === "error") {
    return (
      <Card className="border-destructive">
        <Card.Header>
          <Card.Title className="text-destructive">Oops!</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-3">
          <p className="text-sm text-muted-foreground">{state.error.message}</p>
          {state.error.code && (
            <p className="text-xs text-muted-foreground">
              Error code: {state.error.code}
            </p>
          )}
          {state.error.issues && (
            <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
              {JSON.stringify(state.error.issues, null, 2)}
            </pre>
          )}
        </Card.Content>
        <Card.Footer>
          <Button onClick={onReset} variant="destructive-primary" size="small">
            Retry
          </Button>
        </Card.Footer>
      </Card>
    );
  }

  // Success state
  if (state.status === "success") {
    return (
      <div className="space-y-6">
        <Card>
          <Card.Header>
            <Card.Title>Your Magical Story</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap">{state.res.story}</div>
            </div>
          </Card.Content>
          <Card.Footer>
            <Toolbar className="w-full justify-center">
              <Button
                onClick={handleSaveStory}
                variant="neutral-secondary"
                size="small"
                icon="💾"
                disabled={saveState === "loading" || saveState === "saved"}
                loading={saveState === "loading"}
              >
                {saveState === "saved" ? "Saved" : "Save Story"}
              </Button>
              <Button
                onClick={handleCopyStory}
                variant="neutral-secondary"
                size="small"
                icon="📋"
              >
                Share Story
              </Button>
              <Button
                onClick={onReset}
                variant="brand-primary"
                size="small"
                icon="🔄"
              >
                Start New Story
              </Button>
            </Toolbar>
          </Card.Footer>
        </Card>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md flex items-center gap-2">
              <span>✅</span>
              <span className="text-sm font-medium">
                {saveState === "saved" ? "Story saved!" : "Story copied!"}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
