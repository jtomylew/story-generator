'use client'

import { StoryFormPlaceholder } from '@/components/patterns/StoryFormPlaceholder'
import { StoryPreviewPlaceholder } from '@/components/patterns/StoryPreviewPlaceholder'

interface GenerateStoryScreenProps {
  isLoading?: boolean
  hasError?: boolean
  className?: string
}

export function GenerateStoryScreen({ 
  isLoading = false, 
  hasError = false, 
  className 
}: GenerateStoryScreenProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-4 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Story Weaver
          </h1>
          <p className="text-lg text-gray-600">
            Transform news into magical children's stories
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">Input</h2>
            <StoryFormPlaceholder isLoading={isLoading} />
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">Output</h2>
            <StoryPreviewPlaceholder 
              isLoading={isLoading} 
              hasError={hasError} 
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>Built with Next.js, TypeScript, and Tailwind CSS</p>
        </div>
      </div>
    </div>
  )
}
