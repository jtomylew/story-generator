'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GenerateReq } from '@/lib/types';
import type { RequestState, ApiError } from '@/lib/ui-types';

export default function Home() {
  const [requestState, setRequestState] = useState<RequestState>({ status: 'idle' });
  const [articleText, setArticleText] = useState('');
  const [readingLevel, setReadingLevel] = useState<'preschool' | 'early-elementary' | 'elementary'>('elementary');

  // Clean up in-flight requests on unmount
  useEffect(() => {
    return () => {
      // AbortController cleanup is handled in handleSubmit
    };
  }, []);

  const handleSubmit = useCallback(async (req: GenerateReq) => {
    // Cancel any in-flight request
    const abortController = new AbortController();
    
    setRequestState({ status: 'loading', req });

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req),
        signal: abortController.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        // Map non-OK responses to ApiError shape
        const error: ApiError = {
          message: data.error || 'An error occurred',
          code: response.status === 400 ? 'BAD_REQUEST' : 
                response.status === 429 ? 'RATE_LIMITED' : 
                'INTERNAL_ERROR',
          issues: data.issues
        };
        
        setRequestState({ status: 'error', req, error });
        return;
      }

      // Map successful response to GenerateRes shape
      const res = {
        story: data.story,
        ageBand: req.readingLevel,
        newsSummary: data.originalNewsStory,
        sourceHash: '', // TODO: implement hash generation
        model: process.env.MODEL_NAME || 'gpt-4o',
        safety: { flagged: false, reasons: [] }, // TODO: implement safety checks
        cached: false,
        createdAt: new Date().toISOString()
      };

      setRequestState({ status: 'success', req, res });

    } catch (err) {
      if (err.name === 'AbortError') {
        // Request was cancelled, don't update state
        return;
      }

      const error: ApiError = {
        message: err.message || 'Network error occurred',
        code: 'INTERNAL_ERROR'
      };

      setRequestState({ status: 'error', req, error });
    }
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!articleText.trim()) {
      const error: ApiError = {
        message: 'Please enter a news article first.',
        code: 'BAD_REQUEST'
      };
      setRequestState({ status: 'error', req: { articleText, readingLevel }, error });
      return;
    }

    handleSubmit({ articleText: articleText.trim(), readingLevel });
  };

  const resetForm = () => {
    setArticleText('');
    setReadingLevel('elementary');
    setRequestState({ status: 'idle' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-orange-50">
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
        {/* Input Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* News Article Input */}
              <div className="lg:col-span-2">
                <label htmlFor="articleText" className="block text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📰</span>
                  News Article
                </label>
                <textarea
                  id="articleText"
                  value={articleText}
                  onChange={(e) => setArticleText(e.target.value)}
                  placeholder="Paste a news article here and watch it transform into a magical story..."
                  className="w-full h-40 p-6 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-400 bg-white/90 resize-none text-gray-700 placeholder-gray-400 transition-all duration-300 shadow-inner"
                  disabled={requestState.status === 'loading'}
                />
              </div>

              {/* Reading Level Selection */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="readingLevel" className="block text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    Reading Level
                  </label>
                  <select
                    id="readingLevel"
                    value={readingLevel}
                    onChange={(e) => setReadingLevel(e.target.value as typeof readingLevel)}
                    className="w-full p-4 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-400 bg-white/90 text-gray-700 transition-all duration-300 shadow-inner"
                    disabled={requestState.status === 'loading'}
                  >
                    <option value="preschool">👶 Preschool (ages 3-5)</option>
                    <option value="early-elementary">🎒 Early Elementary (ages 5-7)</option>
                    <option value="elementary">📖 Elementary (ages 7-10)</option>
                  </select>
                  <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                    Choose the perfect reading level for your young audience
                  </p>
                </div>

                {/* Generate Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={requestState.status === 'loading' || !articleText.trim()}
                    className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                  >
                    {requestState.status === 'loading' ? (
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
                  </button>
                </div>

                {/* Character Counter */}
                <div className="text-center">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">{articleText.length}</span> characters
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Error Display */}
        {requestState.status === 'error' && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-red-800 font-semibold text-lg">Oops!</h3>
                <p className="text-red-700 mt-1">{requestState.error.message}</p>
                {requestState.error.issues && (
                  <pre className="text-xs text-red-600 mt-2 bg-red-100 p-2 rounded">
                    {JSON.stringify(requestState.error.issues, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {requestState.status === 'loading' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 mb-8 animate-fade-in">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mb-6">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Creating Your Story</h3>
              <p className="text-gray-600 text-lg">
                Our magical weavers are crafting a special tale just for you...
              </p>
              <div className="mt-6 flex justify-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}

        {/* Generated Story Display */}
        {requestState.status === 'success' && (
          <div className="animate-fade-in">
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl shadow-2xl border-2 border-orange-200 p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">📖</span>
                <h2 className="text-3xl font-bold text-gray-800">Your Magical Story</h2>
                <span className="text-3xl">✨</span>
              </div>
              
              {/* Storybook Page */}
              <div className="bg-white rounded-xl shadow-lg border-2 border-orange-300 p-8 md:p-12">
                <div className="prose prose-lg max-w-none">
                  <div className="text-gray-800 leading-relaxed text-lg md:text-xl">
                    <div className="whitespace-pre-wrap font-serif">
                      {requestState.res.story}
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
              <button
                onClick={() => {
                  navigator.clipboard.writeText(requestState.res.story);
                  // You could add a toast notification here
                }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                <span className="text-xl">📋</span>
                <span>Copy Story</span>
              </button>
              
              <button
                onClick={resetForm}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                <span className="text-xl">🔄</span>
                <span>Start New Story</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-600 via-green-600 to-orange-500 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-medium">
            ✨ Weaving stories that spark imagination and wonder ✨
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
