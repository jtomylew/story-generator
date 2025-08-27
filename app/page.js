'use client';

import { useState } from 'react';

export default function Home() {
  const [newsStory, setNewsStory] = useState('');
  const [readingLevel, setReadingLevel] = useState('Elementary (ages 7-10)');
  const [generatedStory, setGeneratedStory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateStory = async () => {
    if (!newsStory.trim()) {
      setError('Please enter a news story first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setGeneratedStory('');

    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          newsStory: newsStory.trim(),
          readingLevel: readingLevel
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate story');
      }

      setGeneratedStory(data.story);
      // You could also store the reading level if needed for display
    } catch (err) {
      setError(err.message || 'An error occurred while generating the story');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Story Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Transform news articles into magical allegorical stories for children
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* News Article Input */}
            <div>
              <label htmlFor="newsStory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                News Article
              </label>
              <textarea
                id="newsStory"
                value={newsStory}
                onChange={(e) => setNewsStory(e.target.value)}
                placeholder="Paste a news article here..."
                className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Reading Level Selection */}
            <div>
              <label htmlFor="readingLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Reading Level
              </label>
              <select
                id="readingLevel"
                value={readingLevel}
                onChange={(e) => setReadingLevel(e.target.value)}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
              >
                <option value="Preschool (ages 3-5)">Preschool (ages 3-5)</option>
                <option value="Early Elementary (ages 5-7)">Early Elementary (ages 5-7)</option>
                <option value="Elementary (ages 7-10)">Elementary (ages 7-10)</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Select the appropriate reading level for your audience
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {newsStory.length} characters
            </div>
            <button
              onClick={handleGenerateStory}
              disabled={isLoading || !newsStory.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Story
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 dark:text-red-400 font-medium">Error</span>
            </div>
            <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
          </div>
        )}

        {/* Generated Story Display */}
        {generatedStory && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Generated Story</h2>
            </div>
            
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border-l-4 border-blue-500">
                <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                  {generatedStory}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedStory);
                  // You could add a toast notification here
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Story
              </button>
              
              <button
                onClick={() => {
                  setNewsStory('');
                  setReadingLevel('Elementary (ages 7-10)');
                  setGeneratedStory('');
                  setError('');
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Start Over
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Creating your magical story...
              </span>
            </div>
            <p className="text-center text-gray-500 dark:text-gray-400 mt-2">
              This may take a few moments
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
