/**
 * Property tests for CometCard variant system
 *
 * **Validates: Requirements 2.1–2.5**
 *
 * Property 2: Telemetry card completeness — verifies that the `variant` prop
 * correctly applies background classes and glare opacity values.
 */

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CometCard } from "../comet-card";

// Mock motion/react so that motion.div renders as a plain div in jsdom.
// This avoids animation-related issues while still rendering the correct
// className and style props that the tests need to inspect.
vi.mock("motion/react", () => {
  const React = require("react");

  // A simple passthrough component that renders a <div> with all props forwarded.
  const MotionDiv = React.forwardRef(
    (
      {
        children,
        className,
        style,
        onMouseMove,
        onMouseLeave,
        initial: _initial,
        whileHover: _whileHover,
        transition: _transition,
        ...rest
      }: React.ComponentPropsWithRef<"div"> & {
        initial?: unknown;
        whileHover?: unknown;
        transition?: unknown;
      },
      ref: React.Ref<HTMLDivElement>,
    ) => (
      // biome-ignore lint/a11y/noStaticElementInteractions: Test mock forwards motion pointer handlers to a plain div so CometCard behavior can be inspected in jsdom.
      <div
        ref={ref}
        role="presentation"
        className={className}
        style={style}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        {...rest}
      >
        {children}
      </div>
    ),
  );
  MotionDiv.displayName = "MotionDiv";

  // Minimal motion value / spring / transform stubs that return plain objects
  // compatible with the style prop.
  const makeMotionValue = (initial: number) => ({
    get: () => initial,
    set: vi.fn(),
  });

  return {
    motion: { div: MotionDiv },
    useMotionValue: (v: number) => makeMotionValue(v),
    useSpring: (v: unknown) => v,
    useTransform: (_v: unknown, _from: unknown, to: unknown[]) => to[0],
    useMotionTemplate: (strings: TemplateStringsArray, ...values: unknown[]) =>
      strings.reduce((acc, str, i) => acc + str + (values[i] ?? ""), ""),
  };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderCard(
  props: Partial<React.ComponentProps<typeof CometCard>> = {},
) {
  return render(
    <CometCard {...props}>
      <span data-testid="child">content</span>
    </CometCard>,
  );
}

/**
 * Returns the inner motion.div (the one that carries the variant class).
 * The outer wrapper is a plain <div> with `perspective-distant transform-3d`.
 */
function getInnerCard(container: HTMLElement): HTMLElement {
  // The outer div has class "perspective-distant transform-3d".
  // Its first child is the motion.div with the variant class.
  const outer = container.firstElementChild as HTMLElement;
  return outer.firstElementChild as HTMLElement;
}

/**
 * Returns the glare overlay div (second child of the inner card).
 */
function getGlareOverlay(container: HTMLElement): HTMLElement {
  const inner = getInnerCard(container);
  // The glare div is the last child of the inner card (after children).
  const children = Array.from(inner.children);
  return children[children.length - 1] as HTMLElement;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CometCard variant system — Property 2: Telemetry card completeness", () => {
  // -------------------------------------------------------------------------
  // 2.1 default variant → cosmic-card class (not cosmic-card--dark)
  // -------------------------------------------------------------------------
  it('variant="default" applies cosmic-card class to the card root', () => {
    const { container } = renderCard({ variant: "default" });
    const inner = getInnerCard(container);

    expect(inner).toHaveClass("cosmic-card");
    expect(inner).not.toHaveClass("cosmic-card--dark");
  });

  // -------------------------------------------------------------------------
  // 2.2 dark variant → cosmic-card--dark class
  // -------------------------------------------------------------------------
  it('variant="dark" applies cosmic-card--dark class to the card root', () => {
    const { container } = renderCard({ variant: "dark" });
    const inner = getInnerCard(container);

    expect(inner).toHaveClass("cosmic-card--dark");
    expect(inner).not.toHaveClass("cosmic-card");
  });

  // -------------------------------------------------------------------------
  // 2.3 subtle variant → cosmic-card--subtle class (not cosmic-card--dark)
  // -------------------------------------------------------------------------
  it('variant="subtle" applies cosmic-card--subtle class (not cosmic-card--dark)', () => {
    const { container } = renderCard({ variant: "subtle" });
    const inner = getInnerCard(container);

    expect(inner).toHaveClass("cosmic-card--subtle");
    expect(inner).not.toHaveClass("cosmic-card--dark");
  });

  // -------------------------------------------------------------------------
  // 2.4 no variant prop → defaults to "default" behavior (cosmic-card class)
  // -------------------------------------------------------------------------
  it("omitting variant defaults to default behavior (cosmic-card class)", () => {
    const { container } = renderCard();
    const inner = getInnerCard(container);

    expect(inner).toHaveClass("cosmic-card");
    expect(inner).not.toHaveClass("cosmic-card--dark");
  });

  // -------------------------------------------------------------------------
  // 2.5 subtle + rotateDepth=20 → component renders without error
  //     (effectiveRotateDepth is capped at 6 internally)
  // -------------------------------------------------------------------------
  it('variant="subtle" with rotateDepth={20} renders without error and accepts the prop', () => {
    // If the cap logic throws or the component crashes, this test will fail.
    expect(() =>
      renderCard({ variant: "subtle", rotateDepth: 20 }),
    ).not.toThrow();

    const { container } = renderCard({ variant: "subtle", rotateDepth: 20 });
    const inner = getInnerCard(container);

    // The card should still render with the correct variant class.
    expect(inner).toHaveClass("cosmic-card--subtle");
  });

  // -------------------------------------------------------------------------
  // Glare opacity values per variant (Requirements 2.1–2.3)
  // -------------------------------------------------------------------------
  it('variant="default" glare overlay has opacity 0.5', () => {
    const { container } = renderCard({ variant: "default" });
    const glare = getGlareOverlay(container);

    expect(glare.style.opacity).toBe("0.5");
  });

  it('variant="dark" glare overlay has opacity 0.35', () => {
    const { container } = renderCard({ variant: "dark" });
    const glare = getGlareOverlay(container);

    expect(glare.style.opacity).toBe("0.35");
  });

  it('variant="subtle" glare overlay has opacity 0.25', () => {
    const { container } = renderCard({ variant: "subtle" });
    const glare = getGlareOverlay(container);

    expect(glare.style.opacity).toBe("0.25");
  });
});
