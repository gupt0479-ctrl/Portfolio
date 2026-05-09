/**
 * Property tests for HeroTerminal fallback rendering
 *
 * **Validates: Requirements 4.4, 4.5, 4.6**
 *
 * Property 1: Hero terminal fallback rendering — verifies that HeroTerminal
 * renders the expected terminal commands, title bar path, and orbiting chips.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HeroTerminal } from "../HeroTerminal";

// Mock motion/react so that motion.div and motion.span render as plain
// div/span elements in jsdom. This avoids animation-related issues while
// still rendering the correct text content that the tests need to inspect.
vi.mock("motion/react", () => {
  const React = require("react");

  // Passthrough motion.div — renders a <div> with all props forwarded.
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

  // Passthrough motion.span — renders a <span> with all props forwarded.
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
    motion: {
      div: MotionDiv,
      span: MotionSpan,
    },
  };
});

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
  // 1.5 Renders all three orbiting chips: Next.js, Rust, LLMs
  // -------------------------------------------------------------------------
  it("renders the Next.js orbiting chip", () => {
    render(<HeroTerminal />);
    expect(screen.getByText("Next.js")).toBeInTheDocument();
  });

  it("renders the Rust orbiting chip", () => {
    render(<HeroTerminal />);
    expect(screen.getByText("Rust")).toBeInTheDocument();
  });

  it("renders the LLMs orbiting chip", () => {
    render(<HeroTerminal />);
    expect(screen.getByText("LLMs")).toBeInTheDocument();
  });
});
