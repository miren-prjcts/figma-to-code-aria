/**
 * `jest-axe` ships no bundled types, and the community `@types/jest-axe` package pulls in
 * `@types/jest` (stale, and this workspace's `tsconfig.json` deliberately whitelists only
 * `vitest/globals` via its `types` array). This local declaration covers just the surface this
 * package actually uses: `axe(container)` and `expect(...).toHaveNoViolations()`.
 *
 * This file must stay a "script" (no top-level import/export) so the ambient module declaration
 * below is registered globally. The `vitest` matcher augmentation lives in the sibling
 * `vitest-matchers.d.ts` instead, because that one *does* need a top-level `import "vitest"` to
 * merge with (rather than shadow) vitest's real types — mixing the two patterns in one file
 * breaks the ambient declaration here (it becomes module-local and stops resolving).
 */
declare module "jest-axe" {
  export interface AxeResults {
    violations: unknown[];
    [key: string]: unknown;
  }

  export function axe(
    html: Element | string,
    options?: Record<string, unknown>,
  ): Promise<AxeResults>;

  export function configureAxe(options?: Record<string, unknown>): typeof axe;

  export const toHaveNoViolations: {
    toHaveNoViolations(results: AxeResults): { pass: boolean; message: () => string };
  };
}
