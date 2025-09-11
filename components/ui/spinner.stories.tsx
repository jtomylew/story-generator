import type { Meta, StoryObj } from '@storybook/react'
import { Spinner } from './spinner'

const meta: Meta<typeof Spinner> = {
  title: 'UI/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    size: 'md',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
  },
}

export const Medium: Story = {
  args: {
    size: 'md',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
  },
}

export const WithText: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Spinner size="sm" />
      <span>Loading...</span>
    </div>
  ),
}

export const InButton: Story = {
  render: () => (
    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md">
      <Spinner size="sm" />
      <span>Loading</span>
    </button>
  ),
}

export const Centered: Story = {
  render: () => (
    <div className="flex items-center justify-center h-32">
      <Spinner size="lg" />
    </div>
  ),
}
