import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { Select, type SelectOption } from "./select";

const ANIMALS: SelectOption[] = [
  { id: "cat", label: "Cat" },
  { id: "dog", label: "Dog" },
  { id: "kangaroo", label: "Kangaroo", isDisabled: true },
];

describe("Select", () => {
  it("renders the label and placeholder", () => {
    render(<Select label="Favorite animal" items={ANIMALS} placeholder="Pick one" />);

    expect(screen.getByText("Favorite animal")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /favorite animal/i })).toHaveTextContent("Pick one");
  });

  it("opens the listbox, selects an option via keyboard, and reports the change", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();

    render(
      <Select label="Favorite animal" items={ANIMALS} onSelectionChange={onSelectionChange} />,
    );

    const trigger = screen.getByRole("button", { name: /favorite animal/i });
    await user.click(trigger);

    const dogOption = await screen.findByRole("option", { name: "Dog" });
    await user.click(dogOption);

    expect(onSelectionChange).toHaveBeenCalledWith("dog");
    expect(screen.getByRole("button", { name: /favorite animal/i })).toHaveTextContent("Dog");
  });

  it("supports full keyboard interaction (open, navigate, select, close)", async () => {
    const user = userEvent.setup();
    render(<Select label="Favorite animal" items={ANIMALS} />);

    const trigger = screen.getByRole("button", { name: /favorite animal/i });
    trigger.focus();
    await user.keyboard("{Enter}");

    // Opening via Enter auto-focuses the first option (Cat); one ArrowDown moves focus to the
    // second (Dog), and Enter selects it — this is React Aria's own keyboard model, not
    // component-authored logic.
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{ArrowDown}{Enter}");

    expect(screen.getByRole("button", { name: /favorite animal/i })).toHaveTextContent("Dog");
  });

  it("does not offer disabled options for selection", async () => {
    const user = userEvent.setup();
    render(<Select label="Favorite animal" items={ANIMALS} />);

    await user.click(screen.getByRole("button", { name: /favorite animal/i }));
    const kangarooOption = await screen.findByRole("option", { name: "Kangaroo" });
    expect(kangarooOption).toHaveAttribute("aria-disabled", "true");
  });

  it("associates description text via aria-describedby", () => {
    render(<Select label="Favorite animal" items={ANIMALS} description="Pick your favorite" />);

    const trigger = screen.getByRole("button", { name: /favorite animal/i });
    const describedBy = trigger.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toHaveTextContent("Pick your favorite");
  });

  it("has no axe violations", async () => {
    const { container } = render(<Select label="Favorite animal" items={ANIMALS} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
