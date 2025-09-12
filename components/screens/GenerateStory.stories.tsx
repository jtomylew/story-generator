import type { Meta, StoryObj } from "@storybook/react";
import { GenerateStory } from "./GenerateStory";

const meta: Meta<typeof GenerateStory> = {
  title: "Screens/GenerateStory",
  component: GenerateStory,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: { type: "text" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
