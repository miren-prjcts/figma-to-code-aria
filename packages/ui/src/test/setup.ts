import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { toHaveNoViolations } from "jest-axe";
import { afterEach, expect } from "vitest";

// Registers `toHaveNoViolations()` for use with `axe(container)` results — see
// `packages/ui/src/test/jest-axe.d.ts` for why `jest-axe` (not `vitest-axe`) was chosen.
expect.extend(toHaveNoViolations);

// jsdom does not implement matchMedia. Default every query — most relevantly
// `(prefers-reduced-motion: reduce)` — to "matches: true" so tests are deterministic and
// synchronous by default (no real timers needed to observe motion-dependent UI). Tests that
// specifically exercise the animated (non-reduced-motion) path override `window.matchMedia`
// for that one test and restore it afterward.
if (typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) =>
    ({
      matches: true,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList) as typeof window.matchMedia;
}

// React Aria Components' overlay/collection primitives (Select, Popover, ListBox — anything with
// press/hover/drag interactions or an open/close overlay) drive their pointer handling through
// PointerEvent and the Pointer Capture API, and open-state scrolling through scrollIntoView. jsdom
// implements none of these. Earlier `figma-to-code` never needed this block because its components
// were plain native elements with hand-written mouse/keyboard handlers, not React Aria primitives.
// Without these polyfills, Select/Popover interaction tests fail on a missing DOM API rather than
// on real component behavior — a well-documented friction point in React Aria's own testing docs.
if (typeof window.PointerEvent === "undefined") {
  class PointerEventPolyfill extends MouseEvent implements PointerEvent {
    readonly pointerId: number;
    readonly width: number;
    readonly height: number;
    readonly pressure: number;
    readonly tangentialPressure: number;
    readonly tiltX: number;
    readonly tiltY: number;
    readonly twist: number;
    readonly pointerType: string;
    readonly isPrimary: boolean;
    readonly altitudeAngle: number;
    readonly azimuthAngle: number;

    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 0;
      this.width = params.width ?? 1;
      this.height = params.height ?? 1;
      this.pressure = params.pressure ?? 0;
      this.tangentialPressure = params.tangentialPressure ?? 0;
      this.tiltX = params.tiltX ?? 0;
      this.tiltY = params.tiltY ?? 0;
      this.twist = params.twist ?? 0;
      this.pointerType = params.pointerType ?? "mouse";
      this.isPrimary = params.isPrimary ?? true;
      this.altitudeAngle = params.altitudeAngle ?? Math.PI / 2;
      this.azimuthAngle = params.azimuthAngle ?? 0;
    }

    getCoalescedEvents(): PointerEvent[] {
      return [];
    }

    getPredictedEvents(): PointerEvent[] {
      return [];
    }
  }
  window.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent;
}

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

afterEach(() => {
  cleanup();
});
