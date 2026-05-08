import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

/**
 * Property 14: Icon-only button accessibility
 *
 * Validates: Requirements 14.1 – 14.8
 *
 * Static code analysis: every icon-only interactive element must carry an
 * aria-label so screen-reader users understand its purpose.
 */

function readSrc(relativePath: string): string {
  return readFileSync(join(process.cwd(), "src", relativePath), "utf-8");
}

describe("Property 14: Icon-only button accessibility", () => {
  it("ProjectsSlider carousel arrows have aria-label", () => {
    const content = readSrc("components/three/ProjectsSlider.tsx");
    expect(content).toContain('aria-label="Previous project"');
    expect(content).toContain('aria-label="Next project"');
  });

  it("ProjectsSlider pagination dots have aria-label", () => {
    const content = readSrc("components/three/ProjectsSlider.tsx");
    expect(content).toContain('aria-label={`Go to project ${idx + 1}`}');
  });

  it("SidebarToggle (Portfolio Lab launcher) has aria-label", () => {
    const content = readSrc("components/SidebarToggle.tsx");
    expect(content).toContain('aria-label="Open Portfolio Lab"');
  });

  it("Footer back-to-top button has aria-label", () => {
    const content = readSrc("components/Footer.tsx");
    expect(content).toContain('aria-label="Back to top"');
  });

  it("HeaderScrolling hamburger button has aria-label", () => {
    const content = readSrc("components/HeaderScrolling.tsx");
    expect(content).toContain('aria-label="Open navigation"');
  });

  it("HeaderScrolling close button has aria-label", () => {
    const content = readSrc("components/HeaderScrolling.tsx");
    expect(content).toContain('aria-label="Close navigation"');
  });

  it("HeroContent social icon buttons have aria-label", () => {
    const content = readSrc("components/sections/HeroContent.tsx");
    expect(content).toContain("aria-label={label}");
  });

  it("ContactPanel social buttons have aria-label", () => {
    const content = readSrc("components/ContactPanel.tsx");
    expect(content).toContain("aria-label={label}");
  });
});
