// `import "vitest"` (not just `declare module`) is required here so TypeScript treats this block
// as an augmentation of vitest's real matcher types rather than a shadowing ambient redeclaration
// that would wipe out `describe`/`it`/`expect`/etc. for every consumer of the "vitest" module. See
// the sibling `jest-axe.d.ts` for why that file must NOT use this same pattern.
import "vitest";

interface JestAxeMatchers<R = unknown> {
  toHaveNoViolations(): R;
}

declare module "vitest" {
  // An empty body extending the matcher interface is the required shape for TypeScript's
  // declaration merging with vitest's real `Assertion`/`AsymmetricMatchersContaining` interfaces —
  // a `type` alias would not merge, so the emptiness this lint rule flags is intentional here.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion<T = unknown> extends JestAxeMatchers<T> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends JestAxeMatchers {}
}
