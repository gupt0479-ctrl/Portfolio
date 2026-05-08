/**
 * Property 15: Section backdrop application
 *
 * Validates: Requirements 3.7
 *
 * Static code analysis test — reads source files and checks for the
 * presence/absence of the `section-backdrop` class in JSX.
 */
import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

function readSrc(relativePath: string): string {
  return readFileSync(join(process.cwd(), "src", relativePath), "utf-8");
}

describe("Property 15: Section backdrop application", () => {
  // Sections that MUST have section-backdrop
  const sectionsWithBackdrop = [
    "components/sections/AboutSection.tsx",
    "components/sections/ExperienceSection.tsx",
    "components/sections/SkillsSection.tsx",
    "components/sections/EducationSection.tsx",
    "components/sections/CertificationsSection.tsx",
    "components/sections/BlogSection.tsx",
    "components/ContactPanel.tsx",
  ];

  for (const file of sectionsWithBackdrop) {
    it(`${file} has section-backdrop class`, () => {
      const content = readSrc(file);
      expect(content).toContain("section-backdrop");
    });
  }

  it("HeroContent.tsx does NOT have section-backdrop class", () => {
    const content = readSrc("components/sections/HeroContent.tsx");
    expect(content).not.toContain("section-backdrop");
  });
});
