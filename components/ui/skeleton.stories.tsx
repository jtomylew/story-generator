import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton } from './skeleton'

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'text', 'circular'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    className: 'h-4 w-[250px]',
  },
}

export const Text: Story = {
  args: {
    variant: 'text',
    className: 'h-4 w-[200px]',
  },
}

export const Circular: Story = {
  args: {
    variant: 'circular',
    className: 'h-12 w-12',
  },
}

export const CardSkeleton: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Skeleton variant="circular" className="h-12 w-12" />
      <div className="space-y-2">
        <Skeleton variant="text" className="h-4 w-[250px]" />
        <Skeleton variant="text" className="h-4 w-[200px]" />
      </div>
    </div>
  ),
}

export const StoryCardSkeleton: Story = {
  render: () => (
    <div className="w-[350px] space-y-3">
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[150px]" />
      <Skeleton className="h-20 w-full" />
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  ),
}

export const FormSkeleton: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <Skeleton className="h-4 w-[100px]" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-4 w-[120px]" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-32" />
    </div>
  ),
}
