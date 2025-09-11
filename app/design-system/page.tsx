'use client'

import { GenerateStoryScreen } from '@/components/screens/GenerateStoryScreen'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Design System Test Page</h1>
          <p className="text-lg text-muted-foreground">
            Testing our design system components and tokens
          </p>
        </div>

        {/* Component Showcase */}
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button disabled>Disabled</Button>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Badges</h2>
            <div className="flex flex-wrap gap-4">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Loading States</h2>
            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span>Small</span>
              </div>
              <div className="flex items-center gap-2">
                <Spinner size="md" />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <Spinner size="lg" />
                <span>Large</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Skeleton Loading</h2>
            <div className="w-[300px] space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-20 w-full" />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Simple Card</CardTitle>
                  <CardDescription>A basic card component</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This is the card content area.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>With Badge</CardTitle>
                  <CardDescription>Card with status indicator</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Badge variant="success">Active</Badge>
                  <p>This card shows a status badge.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Loading Card</CardTitle>
                  <CardDescription>Card with loading state</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" />
                    <span>Loading...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>

        {/* Full Screen Component */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Generate Story Screen</h2>
          <div className="border rounded-lg overflow-hidden">
            <GenerateStoryScreen />
          </div>
        </section>
      </div>
    </div>
  )
}
