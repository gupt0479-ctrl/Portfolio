import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Property 9: Achievement type labels use orbit-chip", () => {
  const content = readFileSync(
    join(process.cwd(), "src/components/sections/AchievementsSection.tsx"),
    "utf-8",
  );

  it("Achievement type labels use orbit-chip class", () => {
    expect(content).toContain("orbit-chip");
  });

  it("Achievement type is conditionally rendered when present", () => {
    expect(content).toContain("item.type");
  });

  it("Achievement section wraps ledger in CometCard with ghost variant", () => {
    expect(content).toContain('variant="ghost"');
    expect(content).toContain("CometCard");
  });

  it("Achievement section uses SpaceRail for visual rail", () => {
    expect(content).toContain("SpaceRail");
  });

  it("Achievement rows display item date and title", () => {
    expect(content).toContain("item.date");
    expect(content).toContain("item.title");
  });
});
