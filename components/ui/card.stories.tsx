import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
import { Button } from './button'

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
}

export const Simple: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardContent className="pt-6">
        <p>Simple card with just content.</p>
      </CardContent>
    </Card>
  ),
}

export const WithHeader: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Story Card</CardTitle>
        <CardDescription>This is a story card for our story generator app.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Once upon a time, there was a magical story generator that could turn news articles into wonderful children's stories...</p>
      </CardContent>
    </Card>
  ),
}

export const Interactive: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Interactive Card</CardTitle>
        <CardDescription>This card has interactive elements.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Click the buttons below to interact with this card.</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Continue</Button>
      </CardFooter>
    </Card>
  ),
}
