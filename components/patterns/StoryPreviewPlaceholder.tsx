'use client'

// import { Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton, Button, Spinner, Badge } from '@/components/ui'

interface StoryPreviewPlaceholderProps {
  isLoading?: boolean
  hasError?: boolean
  className?: string
}

export function StoryPreviewPlaceholder({ isLoading = false, hasError = false, className }: StoryPreviewPlaceholderProps) {
  if (hasError) {
    return (
      <div className={`border border-red-200 rounded-lg p-6 bg-red-50 ${className}`}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-red-800 flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            Error Generating Story
          </h3>
          <p className="text-sm text-red-600">
            Something went wrong while creating your story
          </p>
        </div>
        <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
          Try Again
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`border rounded-lg p-6 ${className}`}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            Crafting Your Story...
          </h3>
          <p className="text-sm text-muted-foreground">
            Our story weavers are working their magic
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-[150px] bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-[200px] bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-[180px] bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`border rounded-lg p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-2xl">📖</span>
          Generated Story
        </h3>
        <p className="text-sm text-muted-foreground">
          Your magical story will appear here
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-[150px] bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-[200px] bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-[180px] bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}