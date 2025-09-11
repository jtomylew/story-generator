import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Spinner } from './ui/spinner'
import { Skeleton } from './ui/skeleton'
import { Badge } from './ui/badge'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'

const meta: Meta = {
  title: 'Design System/Overview',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const DesignTokens: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Design Tokens</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Colors</CardTitle>
              <CardDescription>Primary color palette</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary"></div>
                <span className="text-sm">Primary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-secondary"></div>
                <span className="text-sm">Secondary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-accent"></div>
                <span className="text-sm">Accent</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spacing</CardTitle>
              <CardDescription>Consistent spacing scale</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <div className="h-2 bg-primary w-2"></div>
                <span className="text-xs">2px</span>
              </div>
              <div className="space-y-1">
                <div className="h-2 bg-primary w-4"></div>
                <span className="text-xs">4px</span>
              </div>
              <div className="space-y-1">
                <div className="h-2 bg-primary w-8"></div>
                <span className="text-xs">8px</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Font scale and weights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs">Extra Small (12px)</div>
              <div className="text-sm">Small (14px)</div>
              <div className="text-base">Base (16px)</div>
              <div className="text-lg">Large (18px)</div>
              <div className="text-xl">Extra Large (20px)</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Motion Tokens</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Durations</CardTitle>
              <CardDescription>Consistent timing for animations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary rounded animate-pulse" style={{ animationDuration: '150ms' }}></div>
                <span className="text-sm">Fast (150ms)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary rounded animate-pulse" style={{ animationDuration: '250ms' }}></div>
                <span className="text-sm">Medium (250ms)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary rounded animate-pulse" style={{ animationDuration: '350ms' }}></div>
                <span className="text-sm">Slow (350ms)</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Easing</CardTitle>
              <CardDescription>Natural motion curves</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">ease-in-out (default)</div>
              <div className="text-sm">ease-out (recommended)</div>
              <div className="text-sm">ease-spring (playful)</div>
              <div className="text-xs text-muted-foreground mt-2">
                Note: All motion tokens respect prefers-reduced-motion and automatically disable animations for accessibility.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  ),
}

export const ComponentLibrary: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Component Library</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Buttons</h3>
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Badges</h3>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Loading States</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span className="text-sm">Small spinner</span>
              </div>
              <div className="flex items-center gap-2">
                <Spinner size="md" />
                <span className="text-sm">Medium spinner</span>
              </div>
              <div className="flex items-center gap-2">
                <Spinner size="lg" />
                <span className="text-sm">Large spinner</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Skeleton Loading</h3>
            <div className="w-[300px] space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Alerts</h3>
            <div className="space-y-2">
              <Alert>
                <AlertTitle>Default Alert</AlertTitle>
                <AlertDescription>This is a default alert message.</AlertDescription>
              </Alert>
              <Alert variant="success">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>Operation completed successfully!</AlertDescription>
              </Alert>
              <Alert variant="warning">
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>Please review your input.</AlertDescription>
              </Alert>
              <Alert variant="error">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Something went wrong. Please try again.</AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
}

export const CompositionGuidelines: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Composition Guidelines</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Atoms (UI Primitives)</CardTitle>
              <CardDescription>Basic building blocks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">• Button</div>
              <div className="text-sm">• Input</div>
              <div className="text-sm">• Spinner</div>
              <div className="text-sm">• Badge</div>
              <div className="text-sm">• Skeleton</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Molecules (Patterns)</CardTitle>
              <CardDescription>Combined components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">• Form fields</div>
              <div className="text-sm">• Search bars</div>
              <div className="text-sm">• Navigation items</div>
              <div className="text-sm">• Loading states</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Screens (Sections)</CardTitle>
              <CardDescription>Complete interfaces</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">• Story form</div>
              <div className="text-sm">• Story output</div>
              <div className="text-sm">• Settings page</div>
              <div className="text-sm">• Dashboard</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Accessibility Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Keyboard Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">• Tab order is logical</div>
              <div className="text-sm">• Focus indicators are visible</div>
              <div className="text-sm">• Skip links for main content</div>
              <div className="text-sm">• Escape key closes modals</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Screen Readers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">• Semantic HTML elements</div>
              <div className="text-sm">• ARIA labels and descriptions</div>
              <div className="text-sm">• Live regions for updates</div>
              <div className="text-sm">• Alt text for images</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  ),
}
