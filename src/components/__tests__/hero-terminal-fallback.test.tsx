/**
 * Property tests for HeroTerminal fallback rendering
 *
 * **Validates: Requirements 4.4, 4.5, 4.6**
 *
 * Property 1: Hero terminal fallback rendering — verifies that HeroTerminal
 * renders the expected terminal commands, title bar path, and window symbols.
 *
 * Updated to reflect hero-ui-polish-fix: orbiting chips removed,
 * terminal content updated, CometCard wrapper added, window symbols added.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HeroTerminal } from "../HeroTerminal";

// Mock motion/react: use importOriginal to keep useMotionValue, useTransform,
// useMotionTemplate, useSpring intact (needed by CometCard), but override
// motion.div and motion.span to render as plain elements in jsdom.
vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();
  const React = require("react");

  const MotionDiv = React.forwardRef(
    (
      {
        children,
        className,
        style,
        initial: _initial,
        animate: _animate,
        transition: _transition,
        whileHover: _whileHover,
        ...rest
      }: React.ComponentPropsWithRef<"div"> & {
        initial?: unknown;
        animate?: unknown;
        transition?: unknown;
        whileHover?: unknown;
      },
      ref: React.Ref<HTMLDivElement>,
    ) => (
      <div ref={ref} className={className} style={style} {...rest}>
        {children}
      </div>
    ),
  );
  MotionDiv.displayName = "MotionDiv";

  const MotionSpan = React.forwardRef(
    (
      {
        children,
        className,
        style,
        initial: _initial,
        animate: _animate,
        transition: _transition,
        ...rest
      }: React.ComponentPropsWithRef<"span"> & {
        initial?: unknown;
        animate?: unknown;
        transition?: unknown;
      },
      ref: React.Ref<HTMLSpanElement>,
    ) => (
      <span ref={ref} className={className} style={style} {...rest}>
        {children}
      </span>
    ),
  );
  MotionSpan.displayName = "MotionSpan";

  return {
    ...actual,
    motion: {
      ...actual.motion,
      div: MotionDiv,
      span: MotionSpan,
    },
  };
});

// Mock the iridescent effect hook used by CometCard
vi.mock("@/hooks/useIridescentEffect", () => ({
  useIridescentEffect: () => ({ ref: { current: null } }),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("HeroTerminal — Property 1: Hero terminal fallback rendering", () => {
  // -------------------------------------------------------------------------
  // 1.1 Renders the $ whoami command
  // -------------------------------------------------------------------------
  it("renders the $ whoami terminal command", () => {
    render(<HeroTerminal />);
    expect(screen.getByText("$ whoami")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // 1.2 Renders the $ stack --top command
  // -------------------------------------------------------------------------
  it("renders the $ stack --top terminal command", () => {
    render(<HeroTerminal />);
    expect(screen.getByText("$ stack --top")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // 1.3 Renders the $ status command
  // -------------------------------------------------------------------------
  it("renders the $ status terminal command", () => {
    render(<HeroTerminal />);
    expect(screen.getByText("$ status")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // 1.4 Renders the terminal title bar path ~/anant
  // -------------------------------------------------------------------------
  it("renders the terminal title bar path ~/anant", () => {
    render(<HeroTerminal />);
    expect(screen.getByText("~/anant")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // 1.5 Renders updated terminal output content
  // -------------------------------------------------------------------------
  it("renders the updated whoami output", () => {
    render(<HeroTerminal />);
    expect(
      screen.getByText("anant.gupta — AI Engineer & Agentic Systems Builder"),
    ).toBeInTheDocument();
  });

  it("renders the updated stack output", () => {
    render(<HeroTerminal />);
    expect(
      screen.getByText("rust · typescript · python · postgres · agents"),
    ).toBeInTheDocument();
  });

  it("renders the updated status output", () => {
    render(<HeroTerminal />);
    expect(
      screen.getByText(
        "shipping → agentic systems · research · product engineering",
      ),
    ).toBeInTheDocument();
  });
});
