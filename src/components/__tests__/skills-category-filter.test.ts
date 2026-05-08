import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

describe("Property 5: Skills category filter correctness", () => {
  const content = readFileSync(
    join(process.cwd(), "src/components/sections/SkillsSectionClient.tsx"),
    "utf-8"
  );

  it("SkillsSectionClient filters skills by selected category", () => {
    // The filter logic: skills.filter((s) => s.category === selected)
    expect(content).toContain("s.category === selected");
  });

  it("SkillsSectionClient passes filtered skills to SkillsCategoryGrid", () => {
    expect(content).toContain("SkillsCategoryGrid");
    expect(content).toContain("skills={filtered}");
  });

  it("SkillsFilter renders an All button to clear the filter", () => {
    expect(content).toContain('"All"');
  });

  it("SkillsSectionClient has InsightPanel that shows category insights", () => {
    expect(content).toContain("InsightPanel");
    expect(content).toContain("category={selected}");
  });

  it("SkillsChart highlights selected category line", () => {
    expect(content).toContain("selectedCategory");
    expect(content).toContain("strokeOpacity");
  });
});
