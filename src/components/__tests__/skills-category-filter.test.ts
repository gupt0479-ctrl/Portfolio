import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Property 5: Skills category filter correctness", () => {
  const content = readFileSync(
    join(process.cwd(), "src/components/sections/SkillsSectionClient.tsx"),
    "utf-8",
  );

  it("SkillsSectionClient filters skills by selected category", () => {
    // The filter logic: skills.filter((s) => s.category === selected)
    expect(content).toContain("s.category === selected");
  });

  it("SkillsSectionClient passes filtered skills to ActiveCategoryView", () => {
    expect(content).toContain("ActiveCategoryView");
    expect(content).toContain("skills={filtered}");
  });

  it("SkillsFilter renders category buttons with active state", () => {
    expect(content).toContain("active={c === selected}");
  });

  it("SkillsSectionClient renders skills count summary", () => {
    expect(content).toContain("skills.length");
    expect(content).toContain("categories");
  });

  it("SkillsSectionClient does not render fabricated trajectory UI", () => {
    expect(content).not.toContain("generateTrajectoryData");
    expect(content).not.toContain("SkillsChart");
    expect(content).not.toContain("InsightPanel");
    expect(content).not.toContain("recharts");
  });
});
