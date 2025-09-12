import type { Meta, StoryObj } from "@storybook/react";
import { StoryForm } from "./StoryForm";

const meta: Meta<typeof StoryForm> = {
  title: "Patterns/StoryForm",
  component: StoryForm,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    isSubmitting: {
      control: { type: "boolean" },
    },
    defaultText: {
      control: { type: "text" },
    },
    defaultLevel: {
      control: { type: "select" },
      options: ["preschool", "early-elementary", "elementary"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: (req) => console.log("Form submitted:", req),
  },
};

export const WithDefaultText: Story = {
  args: {
    defaultText:
      "This is a sample news article about a local community garden that brings neighbors together.",
    defaultLevel: "elementary",
    onSubmit: (req) => console.log("Form submitted:", req),
  },
};

export const Submitting: Story = {
  args: {
    isSubmitting: true,
    onSubmit: (req) => console.log("Form submitted:", req),
  },
};
