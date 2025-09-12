// @subframe/sync-disable
"use client";

import type { RequestState } from "@/lib/ui-types";
import { Button } from "@/components";

interface StoryOutputProps {
  state: RequestState;
  onReset: () => void;
}

export function StoryOutput({ state, onReset }: StoryOutputProps) {
  // Idle state - nothing to render
  if (state.status === "idle") {
    return null;
  }

  // Loading state
  if (state.status === "loading") {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 mb-8 animate-fade-in">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mb-6">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-2xl font-bold text-fg mb-2">
            Creating Your Story
          </h3>
          <p className="text-muted text-lg">
            Our magical weavers are crafting a special tale just for you...
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div
              className="w-3 h-3 bg-green-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (state.status === "error") {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8 animate-fade-in">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <h3 className="text-red-800 font-semibold text-lg">Oops!</h3>
            <p className="text-red-700 mt-1">{state.error.message}</p>
            {state.error.code && (
              <p className="text-red-600 text-sm mt-1">
                Error code: {state.error.code}
              </p>
            )}
            {state.error.issues && (
              <pre className="text-xs text-red-600 mt-2 bg-red-100 p-2 rounded overflow-auto">
                {JSON.stringify(state.error.issues, null, 2)}
              </pre>
            )}
          </div>
          <Button
            onClick={onReset}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg motion-default"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Success state
  if (state.status === "success") {
    return (
      <div className="animate-fade-in">
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl shadow-2xl border-2 border-orange-200 p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">📖</span>
            <h2 className="text-3xl font-bold text-fg">Your Magical Story</h2>
            <span className="text-3xl">✨</span>
          </div>

          {/* Storybook Page */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-orange-300 p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <div className="text-fg leading-relaxed text-lg md:text-xl">
                <div className="whitespace-pre-wrap font-serif">
                  {state.res.story}
                </div>
              </div>
            </div>

            {/* Storybook Decoration */}
            <div className="mt-8 pt-6 border-t-2 border-orange-200">
              <div className="flex items-center justify-center gap-4 text-orange-600">
                <span className="text-2xl">❦</span>
                <span className="text-sm font-serif italic">The End</span>
                <span className="text-2xl">❦</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => {
              navigator.clipboard.writeText(state.res.story);
              // You could add a toast notification here
            }}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl motion-medium transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          >
            <span className="text-xl">📋</span>
            <span>Copy Story</span>
          </Button>

          <Button
            onClick={onReset}
            variant="brand-primary"
            size="large"
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl motion-medium transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          >
            <span className="text-xl">🔄</span>
            <span>Start New Story</span>
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
