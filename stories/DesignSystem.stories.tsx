import type { Meta, StoryObj } from "@storybook/react";
// import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Spinner, Skeleton, Badge, Alert, AlertDescription, AlertTitle } from './ui'

const meta: Meta = {
  title: "Design System/Overview",
  parameters: {
    layout: "padded",
  },
};

export default meta;

export const Overview: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Design System Overview</h1>
        <p className="text-muted-foreground">
          This page is being updated after subframe sync. Components will be
          restored soon.
        </p>
      </div>
    </div>
  ),
};
