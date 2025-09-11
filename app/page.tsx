'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GenerateReq } from '@/lib/types';
import type { RequestState, ApiError } from '@/lib/ui-types';
import StoryForm from '@/components/StoryForm';
import StoryOutput from '@/components/StoryOutput';

export default function Home() {
  const [requestState, setRequestState] = useState<RequestState>({ status: 'idle' });

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
          message: data.message || 'An error occurred',
          code: data.code || (response.status === 400 ? 'BAD_REQUEST' : 
                response.status === 429 ? 'RATE_LIMITED' : 
                'INTERNAL_ERROR'),
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

    } catch (err: any) {
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

  const resetForm = () => {
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
        <StoryForm 
          onSubmit={handleSubmit}
          isSubmitting={requestState.status === 'loading'}
        />
        
        <StoryOutput 
          state={requestState}
          onReset={resetForm}
        />
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
