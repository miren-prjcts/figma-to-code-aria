import type { Meta, StoryObj } from "@storybook/react";
import { Select, type SelectOption } from "@repo/ui";

const ANIMALS: SelectOption[] = [
  { id: "cat", label: "Cat" },
  { id: "dog", label: "Dog" },
  { id: "kangaroo", label: "Kangaroo" },
  { id: "koala", label: "Koala", isDisabled: true },
];

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
  args: {
    label: "Favorite animal",
    items: ANIMALS,
  },
};
export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {};

export const WithDescription: Story = {
  args: { description: "Pick the animal you like most." },
};

export const Invalid: Story = {
  args: { isInvalid: true, errorMessage: "Please choose an animal." },
};

export const Disabled: Story = { args: { isDisabled: true } };
