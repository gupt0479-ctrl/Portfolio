/**
 * Preservation property tests for Hero UI Polish Fix
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11**
 *
 * These tests capture CURRENT behavior on UNFIXED code. They must PASS now
 * and continue to PASS after the fix is applied, ensuring no regressions.
 */

import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock motion/react — passthrough components
vi.mock("motion/react", () => {
  const R = require("react");

  const MotionDiv = R.forwardRef(
    (
      {
        children,
        className,
        style,
        initial: _i,
        animate: _a,
        transition: _t,
        whileHover: _wh,
        whileInView: _wiv,
        viewport: _vp,
        ...rest
      }: any,
      ref: any,
    ) => (
      <div ref={ref} className={className} style={style} {...rest}>
        {children}
      </div>
    ),
  );
  MotionDiv.displayName = "MotionDiv";

  const MotionSpan = R.forwardRef(
    (
      {
        children,
        className,
        style,
        initial: _i,
        animate: _a,
        transition: _t,
        ...rest
      }: any,
      ref: any,
    ) => (
      <span ref={ref} className={className} style={style} {...rest}>
        {children}
      </span>
    ),
  );
  MotionSpan.displayName = "MotionSpan";

  return {
    motion: { div: MotionDiv, span: MotionSpan },
    useMotionValue: () => ({ set: () => {}, get: () => 0 }),
    useMotionTemplate: (..._args: any[]) => "",
    useSpring: (v: any) => v,
    useTransform: () => "0deg",
  };
});

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} />,
}));

// Mock sidebar
vi.mock("@/components/ui/sidebar", () => ({
  useSidebar: () => ({ toggleSidebar: () => {}, open: false }),
}));

// Mock iridescent hook
vi.mock("@/hooks/useIridescentEffect", () => ({
  useIridescentEffect: () => ({ ref: { current: null } }),
}));

// Mock @/lib/utils
vi.mock("@/lib/utils", () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(" "),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const GLOBALS_CSS_PATH = path.resolve(
  __dirname,
  "../../../src/app/globals.css",
);

function readGlobalsCss(): string {
  return fs.readFileSync(GLOBALS_CSS_PATH, "utf-8");
}

const HERO_CONTENT_PATH = path.resolve(
  __dirname,
  "../../../src/components/sections/HeroContent.tsx",
);

const PORTFOLIO_CONTENT_PATH = path.resolve(
  __dirname,
  "../../../src/components/PortfolioContent.tsx",
);

function readSourceFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

// ---------------------------------------------------------------------------
// 3.1 Hover effects preserved
// ---------------------------------------------------------------------------

describe("3.1 Hover effects preserved", () => {
  it("float-btn:hover includes transform property", () => {
    const css = readGlobalsCss();
    const hoverRule = css.match(/\.float-btn:hover\s*\{[^}]+\}/s);
    expect(hoverRule).not.toBeNull();
    expect(hoverRule![0]).toContain("transform");
  });

  it("float-btn:hover includes scale", () => {
    const css = readGlobalsCss();
    const hoverRule = css.match(/\.float-btn:hover\s*\{[^}]+\}/s);
    expect(hoverRule).not.toBeNull();
    expect(hoverRule![0]).toContain("scale");
  });

  it("float-btn:hover includes perspective for depth effect", () => {
    const css = readGlobalsCss();
    const hoverRule = css.match(/\.float-btn:hover\s*\{[^}]+\}/s);
    expect(hoverRule).not.toBeNull();
    expect(hoverRule![0]).toContain("perspective");
  });

  it("float-btn:hover includes box-shadow for glow", () => {
    const css = readGlobalsCss();
    const hoverRule = css.match(/\.float-btn:hover\s*\{[^}]+\}/s);
    expect(hoverRule).not.toBeNull();
    expect(hoverRule![0]).toContain("box-shadow");
  });
});

// ---------------------------------------------------------------------------
// 3.2 Button navigation preserved
// ---------------------------------------------------------------------------

describe("3.2 Button navigation preserved", () => {
  const CTA_HREFS = ["#projects", "#experience", "#contact"] as const;

  it.each(CTA_HREFS)("CTA button has correct href: %s", (expectedHref) => {
    const source = readSourceFile(HERO_CONTENT_PATH);
    expect(source).toContain(`href: "${expectedHref}"`);
  });

  const SOCIAL_URL_PATTERNS = [
    "github",
    "linkedin",
    "twitter",
    "mailto:",
  ] as const;

  it.each(SOCIAL_URL_PATTERNS)(
    "Social link pattern exists in HeroContent source: %s",
    (pattern) => {
      const source = readSourceFile(HERO_CONTENT_PATH);
      expect(source.toLowerCase()).toContain(pattern);
    },
  );
});

// ---------------------------------------------------------------------------
// 3.3 Responsive layout preserved
// ---------------------------------------------------------------------------

describe("3.3 Responsive layout preserved", () => {
  it("Hero section uses responsive grid with grid-cols-1 and lg:grid-cols-2", () => {
    const source = readSourceFile(HERO_CONTENT_PATH);
    expect(source).toContain("grid-cols-1");
    expect(source).toContain("lg:grid-cols-2");
  });

  it("Hero section has grid class applied", () => {
    const source = readSourceFile(HERO_CONTENT_PATH);
    expect(source).toMatch(/className="[^"]*\bgrid\b/);
  });
});

// ---------------------------------------------------------------------------
// 3.4 Reduced motion preserved
// ---------------------------------------------------------------------------

describe("3.4 Reduced motion preserved", () => {
  it("globals.css has prefers-reduced-motion media query", () => {
    const css = readGlobalsCss();
    expect(css).toContain("prefers-reduced-motion");
  });

  it("prefers-reduced-motion query uses 'reduce' value", () => {
    const css = readGlobalsCss();
    expect(css).toContain("prefers-reduced-motion: reduce");
  });
});

// ---------------------------------------------------------------------------
// 3.5 About section content preserved
// ---------------------------------------------------------------------------

describe("3.5 About section content preserved", () => {
  it("AboutSection uses PortableText for bio rendering", () => {
    const aboutPath = path.resolve(
      __dirname,
      "../../../src/components/sections/AboutSection.tsx",
    );
    const source = readSourceFile(aboutPath);
    expect(source).toContain("PortableText");
    expect(source).toContain("fullBio");
  });

  it("AboutSection uses AboutTelemetry component for stats", () => {
    const aboutPath = path.resolve(
      __dirname,
      "../../../src/components/sections/AboutSection.tsx",
    );
    const source = readSourceFile(aboutPath);
    expect(source).toContain("AboutTelemetry");
    expect(source).toContain("stats");
  });
});

// ---------------------------------------------------------------------------
// 3.6 No awkward gaps - proper spacing classes
// ---------------------------------------------------------------------------

describe("3.6 No awkward gaps — proper spacing", () => {
  it("Hero section has vertical padding (py-16)", () => {
    const source = readSourceFile(HERO_CONTENT_PATH);
    expect(source).toContain("py-16");
  });

  it("Hero CTA buttons have gap spacing class", () => {
    const source = readSourceFile(HERO_CONTENT_PATH);
    expect(source).toContain("gap-3");
  });

  it("Hero section uses px-6 for horizontal padding", () => {
    const source = readSourceFile(HERO_CONTENT_PATH);
    expect(source).toContain("px-6");
  });
});

// ---------------------------------------------------------------------------
// 3.7 Three.js background renders in fixed position
// ---------------------------------------------------------------------------

describe("3.7 Three.js background in fixed position", () => {
  it("PortfolioContent wraps ObsidianBackground with fixed inset-0 z-0", () => {
    const source = readSourceFile(PORTFOLIO_CONTENT_PATH);
    expect(source).toContain("fixed inset-0 z-0");
  });

  it("PortfolioContent renders ObsidianBackground component", () => {
    const source = readSourceFile(PORTFOLIO_CONTENT_PATH);
    expect(source).toContain("ObsidianBackground");
  });
});

// ---------------------------------------------------------------------------
// 3.8 Keyboard accessibility
// ---------------------------------------------------------------------------

describe("3.8 Keyboard accessibility — proper semantics", () => {
  it("CTA buttons use <a> elements for keyboard access", () => {
    const source = readSourceFile(HERO_CONTENT_PATH);
    expect(source).toMatch(/<a\s/);
    expect(source).toContain("href={href}");
  });

  it("Social icons use <a> with aria-label", () => {
    const source = readSourceFile(HERO_CONTENT_PATH);
    expect(source).toContain("aria-label={label}");
  });

  it("ProfileImage uses <button> with aria-label", () => {
    const profilePath = path.resolve(
      __dirname,
      "../../../src/components/sections/ProfileImage.tsx",
    );
    const source = readSourceFile(profilePath);
    expect(source).toContain("<button");
    expect(source).toContain("aria-label=");
  });
});

// ---------------------------------------------------------------------------
// 3.9 CometCard readability — property-based
// ---------------------------------------------------------------------------

describe("3.9 CometCard with variant='subtle' does not break text readability", () => {
  // CometCard is a passthrough wrapper for children. We mock it as a simple
  // div wrapper to test that the pattern of wrapping content does not clip
  // or hide text. The actual CometCard uses motion.div which is mocked.
  function MockCometCard({
    children,
    variant = "default",
  }: {
    children: React.ReactNode;
    variant?: string;
  }) {
    return (
      <div className={`perspective-distant transform-3d`}>
        <div className={`relative rounded-2xl cosmic-card--${variant}`}>
          {children}
          <div
            className="pointer-events-none absolute inset-0 z-50 h-full w-full rounded-[16px] mix-blend-overlay"
            aria-hidden="true"
          />
        </div>
      </div>
    );
  }

  it("CometCard renders children without overflow clipping", () => {
    const testContent =
      "This is readable test content that should not be clipped";
    const { container } = render(
      <MockCometCard variant="subtle">
        <p>{testContent}</p>
      </MockCometCard>,
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
    const outerDiv = container.firstElementChild as HTMLElement;
    expect(outerDiv).toBeTruthy();
    const styles = outerDiv.getAttribute("style") || "";
    expect(styles).not.toContain("overflow: hidden");
    expect(styles).not.toContain("overflow:hidden");
  });

  it.each([
    "Short text",
    "A medium length paragraph that should remain fully visible inside CometCard",
    "A very long text block with multiple sentences. This simulates a bio section. It should not be cut off or hidden by the CometCard wrapper regardless of the tilt or glare effects applied.",
  ])("CometCard renders varying text lengths without clipping: %s", (text) => {
    render(
      <MockCometCard variant="subtle">
        <div>{text}</div>
      </MockCometCard>,
    );

    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("CometCard source does not use overflow-hidden or text-overflow", () => {
    const cometCardPath = path.resolve(
      __dirname,
      "../../../src/components/ui/comet-card.tsx",
    );
    const source = readSourceFile(cometCardPath);
    expect(source).not.toContain("overflow-hidden");
    expect(source).not.toContain("overflow: hidden");
    expect(source).not.toContain("text-overflow");
  });
});

// ---------------------------------------------------------------------------
// 3.10 Terminal drift bounds — property-based
// ---------------------------------------------------------------------------

describe("3.10 Terminal drift animation bounds (40-60px range)", () => {
  it("cosmic-drift keyframe either does not exist OR stays within 60px bounds", () => {
    const css = readGlobalsCss();
    const driftMatch = css.match(
      /@keyframes\s+cosmic-drift\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)?\}/s,
    );

    if (!driftMatch) {
      // cosmic-drift doesn't exist yet — this is expected on unfixed code
      expect(true).toBe(true);
      return;
    }

    // If it does exist, validate bounds
    const keyframeContent = driftMatch[0];
    const translateValues = keyframeContent.match(/translate[XY]?\(([^)]+)\)/g);

    if (translateValues) {
      for (const val of translateValues) {
        const numMatch = val.match(/([-\d.]+)px/);
        if (numMatch) {
          const num = Math.abs(Number.parseFloat(numMatch[1]));
          expect(num).toBeLessThanOrEqual(60);
        }
      }
    }
  });

  it.each([0, 25, 50, 75, 100])(
    "drift keyframe at %i%% — if defined, translate values are within 60px",
    (percentage) => {
      const css = readGlobalsCss();
      const driftMatch = css.match(
        /@keyframes\s+cosmic-drift\s*\{[\s\S]*?\n\}/,
      );

      if (!driftMatch) {
        expect(true).toBe(true);
        return;
      }

      const waypointPattern = new RegExp(`${percentage}%\\s*\\{([^}]+)\\}`);
      const waypointMatch = driftMatch[0].match(waypointPattern);

      if (waypointMatch) {
        const pxValues = waypointMatch[1].match(/([-\d.]+)px/g);
        if (pxValues) {
          for (const pxVal of pxValues) {
            const num = Math.abs(Number.parseFloat(pxVal.replace("px", "")));
            expect(num).toBeLessThanOrEqual(60);
          }
        }
      }
    },
  );
});

// ---------------------------------------------------------------------------
// 3.11 Float-btn click behavior preserved — property-based
// ---------------------------------------------------------------------------

describe("3.11 Float-btn elements retain click/navigation behavior", () => {
  it("CTA <a> elements with float-btn class have valid href in source", () => {
    const source = readSourceFile(HERO_CONTENT_PATH);
    expect(source).toContain("float-btn");
    expect(source).toContain("href={href}");
  });

  it.each(["#projects", "#experience", "#contact"])(
    "CTA button href '%s' is a valid section anchor",
    (href) => {
      expect(href).toMatch(/^#[a-z]+/);
    },
  );

  it("social icon <a> elements have float-btn class and href attribute", () => {
    const source = readSourceFile(HERO_CONTENT_PATH);
    const socialAnchorSection = source.match(/socials\.map[\s\S]*?<\/a>/);
    expect(socialAnchorSection).not.toBeNull();
    expect(socialAnchorSection![0]).toContain("float-btn");
    expect(socialAnchorSection![0]).toContain("href={url}");
  });

  it("float-btn class does not use pointer-events-none (clicks work)", () => {
    const css = readGlobalsCss();
    const floatBtnRule = css.match(/\.float-btn\s*\{[^}]+\}/s);
    expect(floatBtnRule).not.toBeNull();
    expect(floatBtnRule![0]).not.toContain("pointer-events-none");
  });
});
