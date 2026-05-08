import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

describe("Property 9: Achievement type labels use orbit-chip", () => {
  const content = readFileSync(
    join(process.cwd(), "src/components/sections/AchievementsSection.tsx"),
    "utf-8"
  );

  it("Achievement type labels use orbit-chip class", () => {
    expect(content).toContain("orbit-chip");
  });

  it("Achievement type is conditionally rendered when present", () => {
    expect(content).toContain("item.type");
    expect(content).toContain("item.type ?");
  });

  it("Achievement section wraps ledger in CometCard with subtle variant", () => {
    expect(content).toContain('variant="subtle"');
    expect(content).toContain("CometCard");
  });

  it("Achievement section has glowing rail", () => {
    expect(content).toContain("absolute left-6");
  });

  it("Achievement rows have rail dots that glow on hover", () => {
    expect(content).toContain("group-hover:bg-violet-500/60");
  });
});
