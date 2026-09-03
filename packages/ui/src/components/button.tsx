import * as React from "react";
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

// Composition-over-custom (DESIGN_SYSTEM_CHARTER.md §4): all interaction/keyboard/focus/ARIA
// behavior below comes from React Aria Components' `Button` — this file only adds the visual
// (token/cva) layer on top via its render-prop state (`data-hovered`, `data-pressed`,
// `data-focus-visible`, `data-disabled`, `data-pending`). No hand-written event handlers.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-[color,background-color,border-color,box-shadow,opacity] outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-background data-[disabled]:pointer-events-none data-[disabled]:opacity-[var(--opacity-disabled)]",
  {
    variants: {
      variant: {
        solid:
          "bg-primary text-primary-foreground data-[hovered]:bg-primary-hover data-[pressed]:bg-primary-pressed",
        outline:
          "border border-input bg-background text-foreground data-[hovered]:bg-muted data-[pressed]:bg-secondary",
        ghost: "bg-transparent text-foreground data-[hovered]:bg-muted data-[pressed]:bg-secondary",
        destructive:
          "bg-destructive text-destructive-solid-foreground data-[hovered]:bg-destructive-hover data-[pressed]:bg-destructive-pressed",
      },
      size: {
        sm: "h-[var(--size-control-sm)] px-3",
        md: "h-[var(--size-control-md)] px-4",
        lg: "h-[var(--size-control-lg)] px-6",
      },
    },
    defaultVariants: { variant: "solid", size: "md" },
  },
);

export interface ButtonProps
  extends Omit<AriaButtonProps, "children" | "className">, VariantProps<typeof buttonVariants> {
  /** Visible button label. Icon-only actions belong in an IconButton. */
  children: React.ReactNode;
  /** Decorative icon rendered before the label. */
  leadingIcon?: React.ReactNode;
  /** Decorative icon rendered after the label. */
  trailingIcon?: React.ReactNode;
  className?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, className, leadingIcon, size, trailingIcon, variant, ...props },
  ref,
): React.ReactElement {
  return (
    <AriaButton ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {(renderProps) => (
        <>
          <span
            data-slot="button-content"
            className={cn(
              "inline-flex items-center justify-center gap-2",
              renderProps.isPending && "sr-only",
            )}
          >
            {leadingIcon ? (
              <span data-slot="button-leading-icon" className="flex shrink-0" aria-hidden="true">
                {leadingIcon}
              </span>
            ) : null}
            <span data-slot="button-label">{children}</span>
            {trailingIcon ? (
              <span data-slot="button-trailing-icon" className="flex shrink-0" aria-hidden="true">
                {trailingIcon}
              </span>
            ) : null}
          </span>
          {renderProps.isPending ? (
            <span
              data-slot="button-loading-content"
              className="inline-flex items-center gap-2"
              aria-hidden="true"
            >
              <span
                data-slot="button-spinner"
                className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
              />
              <span data-slot="button-loading-label">Loading…</span>
            </span>
          ) : null}
        </>
      )}
    </AriaButton>
  );
});
