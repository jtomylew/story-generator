import type { Meta, StoryObj } from "@storybook/react";
import { StoryOutput } from "./StoryOutput";

const meta: Meta<typeof StoryOutput> = {
  title: "Patterns/StoryOutput",
  component: StoryOutput,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    onReset: {
      action: "reset",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: {
    state: { status: "idle" },
    onReset: () => console.log("Reset clicked"),
  },
};

export const Loading: Story = {
  args: {
    state: {
      status: "loading",
      req: {
        articleText: "Sample news article text",
        readingLevel: "elementary",
      },
    },
    onReset: () => console.log("Reset clicked"),
  },
};

export const Success: Story = {
  args: {
    state: {
      status: "success",
      req: {
        articleText: "Sample news article text",
        readingLevel: "elementary",
      },
      res: {
        story:
          "Once upon a time, in a magical forest, there lived a brave little rabbit who discovered the power of friendship...",
        ageBand: "elementary",
        newsSummary: "Local community garden brings neighbors together",
        sourceHash: "abc123",
        model: "gpt-4o",
        safety: { flagged: false, reasons: [] },
        cached: false,
        createdAt: new Date().toISOString(),
      },
    },
    onReset: () => console.log("Reset clicked"),
  },
};

export const Error: Story = {
  args: {
    state: {
      status: "error",
      req: {
        articleText: "Sample news article text",
        readingLevel: "elementary",
      },
      error: {
        message: "Failed to generate story. Please try again.",
        code: "INTERNAL_ERROR",
      },
    },
    onReset: () => console.log("Reset clicked"),
  },
};
