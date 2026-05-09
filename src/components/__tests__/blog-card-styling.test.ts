import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Property 10: Blog card styling and category chips
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5
 *
 * Static code analysis tests that verify BlogFeed.tsx uses the correct
 * CSS classes and components for blog card styling.
 */
describe("Property 10: Blog card styling and category chips", () => {
  const content = readFileSync(
    join(process.cwd(), "src/components/BlogFeed.tsx"),
    "utf-8",
  );

  it("Blog cards use cosmic-card styling", () => {
    expect(content).toContain("cosmic-card");
  });

  it("Blog category labels use orbit-chip class", () => {
    expect(content).toContain("orbit-chip");
  });

  it("GitHub pinned card has violet left border", () => {
    expect(content).toContain("border-l-violet-500");
  });

  it("GitHub Visit button has magnetic hover effect", () => {
    expect(content).toContain("MagneticButton");
  });

  it("Blog cards use float-btn for hover effect", () => {
    expect(content).toContain("float-btn");
  });
});
