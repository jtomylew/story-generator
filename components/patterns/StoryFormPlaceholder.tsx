'use client'

// import { Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton, Button, Spinner } from '@/components/ui'

interface StoryFormPlaceholderProps {
  isLoading?: boolean
  className?: string
}

export function StoryFormPlaceholder({ isLoading = false, className }: StoryFormPlaceholderProps) {
  if (isLoading) {
    return (
      <div className={`border rounded-lg p-6 ${className}`}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Generating Story...
          </h3>
          <p className="text-sm text-muted-foreground">
            Our magical weavers are crafting your story
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-[100px] bg-gray-200 rounded animate-pulse" />
            <div className="h-32 w-full bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-[120px] bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className={`border rounded-lg p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Story Generator Form</h3>
        <p className="text-sm text-muted-foreground">
          Paste a news article and select a reading level to generate a magical story
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-[100px] bg-gray-200 rounded animate-pulse" />
          <div className="h-32 w-full bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-[120px] bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
        </div>
        <button 
          disabled 
          className="w-full px-4 py-2 bg-gray-300 rounded transition-all duration-300"
        >
          Generate Story
        </button>
      </div>
    </div>
  )
}