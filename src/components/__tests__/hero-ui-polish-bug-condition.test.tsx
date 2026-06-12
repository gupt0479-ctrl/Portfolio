/**
 * Bug Condition Exploration Tests — Hero UI Polish Deficiencies
 *
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 1.12**
 *
 * These tests encode the EXPECTED (fixed) behavior. They MUST FAIL on
 * the current unfixed code — failure confirms the bugs exist.
 *
 * DO NOT fix the code or the tests when they fail.
 */

import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock motion/react — passthrough components for jsdom rendering
vi.mock("motion/react", () => {
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

  const MotionP = React.forwardRef(
    (
      {
        children,
        className,
        style,
        initial: _initial,
        animate: _animate,
        transition: _transition,
        ...rest
      }: React.ComponentPropsWithRef<"p"> & {
        initial?: unknown;
        animate?: unknown;
        transition?: unknown;
      },
      ref: React.Ref<HTMLParagraphElement>,
    ) => (
      <p ref={ref} className={className} style={style} {...rest}>
        {children}
      </p>
    ),
  );
  MotionP.displayName = "MotionP";

  const MotionH1 = React.forwardRef(
    (
      {
        children,
        className,
        style,
        initial: _initial,
        animate: _animate,
        transition: _transition,
        ...rest
      }: React.ComponentPropsWithRef<"h1"> & {
        initial?: unknown;
        animate?: unknown;
        transition?: unknown;
      },
      ref: React.Ref<HTMLHeadingElement>,
    ) => (
      <h1 ref={ref} className={className} style={style} {...rest}>
        {children}
      </h1>
    ),
  );
  MotionH1.displayName = "MotionH1";

  return {
    motion: {
      div: MotionDiv,
      span: MotionSpan,
      p: MotionP,
      h1: MotionH1,
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

// Mock the sidebar provider for ProfileImage
vi.mock("@/components/ui/sidebar", () => ({
  useSidebar: () => ({ toggleSidebar: () => {}, open: false }),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { fill: _fill, priority: _priority, ...rest } = props;
    // biome-ignore lint: test mock
    return <img {...(rest as any)} />;
  },
}));

// Mock CometCard — simple passthrough to detect wrapping
vi.mock("@/components/ui/comet-card", () => ({
  CometCard: ({
    children,
    variant,
  }: {
    children: React.ReactNode;
    variant?: string;
  }) => (
    <div data-testid="comet-card" data-variant={variant}>
      {children}
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Bug Condition Exploration — Hero UI Polish Deficiencies", () => {
  // -------------------------------------------------------------------------
  // 1. globals.css .float-btn INCLUDES cosmic-float animation (1.1, 1.12)
  // -------------------------------------------------------------------------
  describe("CSS: .float-btn cosmic-float animation", () => {
    const globalsPath = path.resolve(__dirname, "../../../src/app/globals.css");
    const css = fs.readFileSync(globalsPath, "utf-8");

    it("globals.css .float-btn rule INCLUDES cosmic-float animation", () => {
      // Extract the .float-btn rule block
      const floatBtnMatch = css.match(/\.float-btn\s*\{[^}]*\}/s);
      expect(floatBtnMatch).not.toBeNull();
      const floatBtnRule = floatBtnMatch![0];
      // Expected: the .float-btn rule should contain an animation referencing cosmic-float
      expect(floatBtnRule).toMatch(/animation[^;]*cosmic-float/);
    });

    it("globals.css HAS @keyframes cosmic-float defined", () => {
      expect(css).toMatch(/@keyframes\s+cosmic-float/);
    });
  });

  // -------------------------------------------------------------------------
  // 2. ProfileImage does NOT render orbit chips (1.2, 1.3)
  // -------------------------------------------------------------------------
  describe("ProfileImage: no orbit chips", () => {
    it("does NOT render 'Next.js' orbit chip", async () => {
      const { ProfileImage } = await import(
        "@/components/sections/ProfileImage"
      );
      render(
        <ProfileImage imageUrl="/test.jpg" firstName="Test" lastName="User" />,
      );
      // Expected behavior: "Next.js" should NOT be in the DOM
      expect(screen.queryByText("Next.js")).not.toBeInTheDocument();
    });

    it("does NOT render 'AI/ML' orbit chip", async () => {
      const { ProfileImage } = await import(
        "@/components/sections/ProfileImage"
      );
      render(
        <ProfileImage imageUrl="/test.jpg" firstName="Test" lastName="User" />,
      );
      // Expected behavior: "AI/ML" should NOT be in the DOM
      expect(screen.queryByText("AI/ML")).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // 3. ProfileImage does NOT render online status bar (1.4)
  // -------------------------------------------------------------------------
  describe("ProfileImage: no online status bar", () => {
    it("does NOT render 'Online' text", async () => {
      const { ProfileImage } = await import(
        "@/components/sections/ProfileImage"
      );
      render(
        <ProfileImage imageUrl="/test.jpg" firstName="Test" lastName="User" />,
      );
      // Expected behavior: "Online" text should NOT be in the DOM
      expect(screen.queryByText("Online")).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // 4. HeroContent does NOT render technology line (1.5)
  // -------------------------------------------------------------------------
  describe("HeroContent: no technology line", () => {
    it("does NOT render 'NEXT.JS • SANITY • 3D • TYPESCRIPT'", async () => {
      // Mock dependencies for HeroContent
      vi.mock("@/hooks/useIridescentEffect", () => ({
        useIridescentEffect: () => ({ ref: { current: null } }),
      }));
      vi.mock("../ui/layout-text-flip", () => ({
        LayoutTextFlip: () => <span>animated text</span>,
      }));

      const { HeroContent } = await import("@/components/sections/HeroContent");

      const mockProfile = {
        _id: "test",
        _type: "profile" as const,
        _createdAt: "",
        _updatedAt: "",
        _rev: "",
        firstName: "Test",
        lastName: "User",
        shortBio: "A test bio",
        headlineStaticText: "I build",
        headlineAnimatedWords: ["systems"],
        headlineAnimationDuration: 2600,
        socialLinks: { github: "https://github.com/test" },
        email: "test@test.com",
        location: "Test City",
        availability: "Available",
      };

      render(
        <HeroContent
          profile={mockProfile as any}
          profileImageUrl="/test.jpg"
        />,
      );

      // Expected behavior: Technology line should NOT be present
      expect(
        screen.queryByText("NEXT.JS • SANITY • 3D • TYPESCRIPT"),
      ).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // 5. HeroTerminal is NOT inside AboutSection (1.6)
  // -------------------------------------------------------------------------
  describe("AboutSection: no HeroTerminal", () => {
    it("AboutSection source does NOT import HeroTerminal", () => {
      const aboutPath = path.resolve(
        __dirname,
        "../../../src/components/sections/AboutSection.tsx",
      );
      const source = fs.readFileSync(aboutPath, "utf-8");
      // Expected behavior: AboutSection should NOT import HeroTerminal
      expect(source).not.toMatch(/import\s*\{?\s*HeroTerminal\s*\}?\s*from/);
    });
  });

  // -------------------------------------------------------------------------
  // 6. HeroTerminal does NOT display outdated content (1.7)
  // -------------------------------------------------------------------------
  describe("HeroTerminal: updated content", () => {
    it("does NOT display 'ai & data systems engineer'", async () => {
      const { HeroTerminal } = await import("@/components/HeroTerminal");
      render(<HeroTerminal />);
      // Expected behavior: outdated content should NOT be present
      expect(
        screen.queryByText("anant.gupta — ai & data systems engineer"),
      ).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // 7. AboutSection bio and telemetry ARE wrapped in CometCard (1.8)
  // -------------------------------------------------------------------------
  describe("AboutSection: CometCard wrapping", () => {
    it("AboutSection source imports CometCard", () => {
      const aboutPath = path.resolve(
        __dirname,
        "../../../src/components/sections/AboutSection.tsx",
      );
      const source = fs.readFileSync(aboutPath, "utf-8");
      // Expected behavior: AboutSection SHOULD import CometCard
      expect(source).toMatch(/import.*CometCard.*from/);
    });
  });

  // -------------------------------------------------------------------------
  // 8. HeroTerminal uses CometCard wrapper (1.9)
  // -------------------------------------------------------------------------
  describe("HeroTerminal: CometCard wrapping", () => {
    it("HeroTerminal source imports CometCard", () => {
      const terminalPath = path.resolve(
        __dirname,
        "../../../src/components/HeroTerminal.tsx",
      );
      const source = fs.readFileSync(terminalPath, "utf-8");
      // Expected behavior: HeroTerminal SHOULD import CometCard
      expect(source).toMatch(/import.*CometCard.*from/);
    });
  });

  // -------------------------------------------------------------------------
  // 9. Terminal prompt elements HAVE terminal-glow class (1.10)
  // -------------------------------------------------------------------------
  describe("HeroTerminal: terminal-glow on prompts", () => {
    it("prompt elements have 'terminal-glow' class", async () => {
      const { HeroTerminal } = await import("@/components/HeroTerminal");
      const { container } = render(<HeroTerminal />);
      // Expected behavior: prompt <p> elements should have terminal-glow class
      const glowElements = container.querySelectorAll(".terminal-glow");
      expect(glowElements.length).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------------------
  // 10. Terminal title bar dots CONTAIN text symbols (1.11)
  // -------------------------------------------------------------------------
  describe("HeroTerminal: window control symbols", () => {
    it("title bar dots contain text symbols (×, −, ⬜)", async () => {
      const { HeroTerminal } = await import("@/components/HeroTerminal");
      render(<HeroTerminal />);
      // Expected behavior: dots should have window control symbols
      expect(screen.queryByText("×")).toBeInTheDocument();
      expect(screen.queryByText("−")).toBeInTheDocument();
      expect(screen.queryByText("⬜")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // 11. globals.css .float-btn HAS animation property (1.12)
  // -------------------------------------------------------------------------
  describe("CSS: .float-btn animation property", () => {
    it(".float-btn CSS rule has animation property referencing cosmic-float", () => {
      const globalsPath = path.resolve(
        __dirname,
        "../../../src/app/globals.css",
      );
      const css = fs.readFileSync(globalsPath, "utf-8");
      const floatBtnMatch = css.match(/\.float-btn\s*\{[^}]*\}/s);
      expect(floatBtnMatch).not.toBeNull();
      const floatBtnRule = floatBtnMatch![0];
      // Expected behavior: should have `animation` property with cosmic-float
      expect(floatBtnRule).toMatch(/animation\s*:/);
    });
  });
});
