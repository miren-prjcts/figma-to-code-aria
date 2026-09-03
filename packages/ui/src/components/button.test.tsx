import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it.each([
    ["solid", ["bg-primary", "text-primary-foreground"]],
    ["outline", ["border", "border-input", "bg-background"]],
    ["ghost", ["bg-transparent", "text-foreground"]],
    ["destructive", ["bg-destructive", "text-destructive-solid-foreground"]],
  ] as const)("renders the %s variant", (variant, classes) => {
    render(<Button variant={variant}>Action</Button>);

    const button = screen.getByRole("button", { name: "Action" });
    expect(button).toHaveClass(...classes);
  });

  it.each([
    ["sm", "h-[var(--size-control-sm)]"],
    ["md", "h-[var(--size-control-md)]"],
    ["lg", "h-[var(--size-control-lg)]"],
  ] as const)("renders the %s size", (size, expectedClass) => {
    render(<Button size={size}>Action</Button>);

    expect(screen.getByRole("button", { name: "Action" })).toHaveClass(expectedClass);
  });

  it("defaults to a non-submit button", () => {
    render(<Button>Action</Button>);

    expect(screen.getByRole("button", { name: "Action" })).toHaveAttribute("type", "button");
  });

  it("supports disabled interaction via isDisabled", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();

    render(
      <Button isDisabled onPress={onPress}>
        Action
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Action" });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders decorative leading and trailing icons without changing the accessible name", () => {
    render(
      <Button
        leadingIcon={<svg data-testid="leading-icon" />}
        trailingIcon={<svg data-testid="trailing-icon" />}
      >
        Continue
      </Button>,
    );

    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
    expect(screen.getByTestId("leading-icon").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("trailing-icon").parentElement).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("prevents activation while pending, shows a leading spinner and 'Loading…', and retains the accessible name", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();

    render(
      <Button isPending onPress={onPress}>
        Save changes
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Save changes" });
    expect(button).toHaveAttribute("data-pending");
    expect(button.querySelector('[data-slot="button-content"]')).toHaveClass("sr-only");

    const loadingContent = button.querySelector('[data-slot="button-loading-content"]');
    expect(loadingContent).toHaveAttribute("aria-hidden", "true");
    expect(loadingContent).toHaveTextContent("Loading…");
    expect(button.querySelector('[data-slot="button-spinner"]')).toHaveClass(
      "animate-spin",
      "motion-reduce:animate-none",
    );

    await user.click(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("forwards its ref to the native button", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Action</Button>);

    expect(ref.current).toBe(screen.getByRole("button", { name: "Action" }));
  });

  it("has no axe violations", async () => {
    const { container } = render(<Button>Action</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
