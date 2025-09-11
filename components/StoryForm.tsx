// @subframe/sync-disable
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GenerateReq, ReadingLevel } from '@/lib/types';
import { Button } from '@/components/ui';
// import { Select } from '@/components/ui';

interface StoryFormProps {
  onSubmit: (req: GenerateReq) => void;
  isSubmitting?: boolean;
  defaultText?: string;
  defaultLevel?: ReadingLevel;
}

export default function StoryForm({ 
  onSubmit, 
  isSubmitting = false, 
  defaultText = '', 
  defaultLevel = 'elementary' 
}: StoryFormProps) {
  const [articleText, setArticleText] = useState(defaultText);
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>(defaultLevel);
  const [error, setError] = useState<string>('');

  // Client-side validation mirroring Zod schema
  const isValid = articleText.length >= 50;
  const canSubmit = isValid && !isSubmitting;

  // Update error message based on validation
  useEffect(() => {
    if (articleText.length > 0 && articleText.length < 50) {
      setError('Provide at least a full paragraph of article text.');
    } else {
      setError('');
    }
  }, [articleText]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit) return;

    onSubmit({ articleText: articleText.trim(), readingLevel });
  }, [articleText, readingLevel, canSubmit, onSubmit]);

  // Hotkey: Ctrl/Cmd+Enter submits when valid
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && canSubmit) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [canSubmit, handleSubmit]);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* News Article Input */}
          <div className="lg:col-span-2">
            <label 
              htmlFor="articleText" 
              className="block text-lg font-semibold text-fg mb-4 flex items-center gap-2"
            >
              <span className="text-2xl">📰</span>
              News Article
            </label>
            <textarea
              id="articleText"
              value={articleText}
              onChange={(e) => setArticleText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste a news article here and watch it transform into a magical story..."
              className={`w-full h-40 p-6 border-2 rounded-xl focus:ring-4 focus:border-blue-400 bg-white/90 resize-none text-fg placeholder-muted-foreground motion-medium shadow-inner ${
                error ? 'border-red-300 focus:ring-red-300' : 'border-blue-200 focus:ring-blue-300'
              }`}
              disabled={isSubmitting}
              aria-describedby={error ? 'articleText-error' : undefined}
              aria-invalid={error ? 'true' : 'false'}
            />
            {error && (
              <p id="articleText-error" className="text-red-600 text-sm mt-2" role="alert">
                {error}
              </p>
            )}
          </div>

          {/* Reading Level Selection */}
          <div className="space-y-6">
            <div>
              <label 
                htmlFor="readingLevel" 
                className="block text-lg font-semibold text-fg mb-4 flex items-center gap-2"
              >
                <span className="text-2xl">🎯</span>
                Reading Level
              </label>
              <select
                id="readingLevel"
                value={readingLevel}
                onChange={(e) => setReadingLevel(e.target.value as ReadingLevel)}
                className="w-full p-4 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-400 bg-white/90 text-fg motion-medium shadow-inner"
                disabled={isSubmitting}
              >
                <option value="preschool">👶 Preschool (ages 3-5)</option>
                <option value="early-elementary">🎒 Early Elementary (ages 5-7)</option>
                <option value="elementary">📖 Elementary (ages 7-10)</option>
              </select>
              <p className="text-sm text-muted mt-3 leading-relaxed">
                Choose the perfect reading level for your young audience
              </p>
            </div>

            {/* Generate Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={!canSubmit}
                variant="brand-primary"
                size="large"
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold text-lg rounded-xl motion-medium transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Weaving Magic...</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">✨</span>
                    <span>Weave Story</span>
                  </>
                )}
              </Button>
            </div>

            {/* Character Counter */}
            <div className="text-center">
              <div className="text-sm text-muted">
                <span className="font-semibold">{articleText.length}</span> characters
                {articleText.length >= 50 && (
                  <span className="text-green-600 ml-2">✓</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
