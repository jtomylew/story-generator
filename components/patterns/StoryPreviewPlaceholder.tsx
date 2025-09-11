'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'

interface StoryPreviewPlaceholderProps {
  isLoading?: boolean
  hasError?: boolean
  className?: string
}

export function StoryPreviewPlaceholder({ 
  isLoading = false, 
  hasError = false, 
  className 
}: StoryPreviewPlaceholderProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Spinner size="sm" />
            Creating Your Story
          </CardTitle>
          <CardDescription>
            Our magical weavers are crafting a special tale just for you...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Badge variant="secondary">Preschool</Badge>
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="flex justify-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (hasError) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-destructive">Oops! Something went wrong</CardTitle>
          <CardDescription>
            We encountered an error while generating your story
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
            <p className="text-sm text-destructive">
              Please try again or contact support if the problem persists.
            </p>
          </div>
          <Button 
            variant="outline" 
            className="w-full transition-all duration-[var(--motion-medium)] ease-[var(--ease-out)]"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Your Magical Story</CardTitle>
        <CardDescription>
          Generated stories will appear here
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Badge variant="secondary">Reading Level</Badge>
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex gap-2 pt-4">
          <Button 
            disabled 
            className="flex-1 transition-all duration-[var(--motion-medium)] ease-[var(--ease-out)]"
          >
            Copy Story
          </Button>
          <Button 
            variant="outline" 
            disabled 
            className="flex-1 transition-all duration-[var(--motion-medium)] ease-[var(--ease-out)]"
          >
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
