import * as React from "react";
import {
  Button,
  FieldError,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select as AriaSelect,
  SelectValue,
  Text,
  type SelectProps as AriaSelectProps,
} from "react-aria-components";
import { cn } from "../lib/utils";

// Composition-over-custom (DESIGN_SYSTEM_CHARTER.md §4): this file composes React Aria
// Components' `Select` + `Button` + `Popover` + `ListBox` primitives — the open/close, keyboard
// navigation (Arrow keys, type-ahead, Home/End), selection, and label/description/error
// aria-* wiring all come from those primitives. Nothing here writes its own keydown handler,
// focus-trap, or ARIA attribute.

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" {...props}>
      <path d="m4 6 4 4 4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface SelectOption {
  id: string;
  label: string;
  isDisabled?: boolean;
}

export interface SelectProps<T extends SelectOption = SelectOption> extends Omit<
  AriaSelectProps<T>,
  "children" | "className"
> {
  /** Visible field label. */
  label?: string;
  /** Helper text shown below the control, associated via aria-describedby. */
  description?: string;
  /** Validation message shown (and associated) only while `isInvalid` is true. */
  errorMessage?: string;
  /** Options rendered as the listbox's items. */
  items: readonly T[];
  placeholder?: string;
  className?: string;
}

export function Select<T extends SelectOption = SelectOption>({
  className,
  description,
  errorMessage,
  items,
  label,
  placeholder = "Select an option",
  ...props
}: SelectProps<T>): React.ReactElement {
  return (
    <AriaSelect className={cn("flex w-full flex-col gap-1.5", className)} {...props}>
      {label ? <Label className="text-sm font-medium text-foreground">{label}</Label> : null}
      <Button
        className={cn(
          "flex h-[var(--size-control-md)] w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-sm text-foreground transition-[color,background-color,border-color,box-shadow,opacity] outline-none",
          "data-[hovered]:bg-muted data-[pressed]:bg-secondary",
          "data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-background",
          "data-[invalid]:border-invalid-border",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-[var(--opacity-disabled)]",
        )}
      >
        <SelectValue className="truncate data-[placeholder]:text-muted-foreground">
          {({ selectedText }) => selectedText || placeholder}
        </SelectValue>
        <ChevronDownIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      </Button>
      {description ? (
        <Text slot="description" className="text-xs text-muted-foreground">
          {description}
        </Text>
      ) : null}
      <FieldError className="text-xs text-invalid-border">{errorMessage}</FieldError>
      <Popover
        className="w-[--trigger-width] rounded-md border border-border bg-card p-1 text-card-foreground shadow-md outline-none"
        offset={4}
      >
        <ListBox
          items={items}
          className="flex max-h-64 flex-col gap-0.5 overflow-auto outline-none"
        >
          {(item) => (
            <ListBoxItem
              id={item.id}
              textValue={item.label}
              isDisabled={item.isDisabled}
              className={cn(
                "flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm text-foreground outline-none",
                "data-[focused]:bg-muted data-[hovered]:bg-muted",
                "data-[selected]:bg-secondary data-[selected]:font-medium",
                "data-[disabled]:pointer-events-none data-[disabled]:opacity-[var(--opacity-disabled)]",
              )}
            >
              {item.label}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}
