import type { Meta, StoryObj } from '@storybook/react'
import { GenerateStoryScreen } from './GenerateStoryScreen'

const meta: Meta<typeof GenerateStoryScreen> = {
  title: 'Screens/GenerateStoryScreen',
  component: GenerateStoryScreen,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    isLoading: {
      control: { type: 'boolean' },
    },
    hasError: {
      control: { type: 'boolean' },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    isLoading: false,
    hasError: false,
  },
}

export const Loading: Story = {
  args: {
    isLoading: true,
    hasError: false,
  },
}

export const Error: Story = {
  args: {
    isLoading: false,
    hasError: true,
  },
}

export const LoadingWithError: Story = {
  args: {
    isLoading: true,
    hasError: true,
  },
}
