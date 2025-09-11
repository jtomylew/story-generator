'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

interface StoryFormPlaceholderProps {
  isLoading?: boolean
  className?: string
}

export function StoryFormPlaceholder({ isLoading = false, className }: StoryFormPlaceholderProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Spinner size="sm" />
            Generating Story...
          </CardTitle>
          <CardDescription>
            Our magical weavers are crafting your story
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Story Generator Form</CardTitle>
        <CardDescription>
          Paste a news article and select a reading level to generate a magical story
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Button 
          disabled 
          className="w-full transition-all duration-[var(--motion-medium)] ease-[var(--ease-out)]"
        >
          Generate Story
        </Button>
      </CardContent>
    </Card>
  )
}
