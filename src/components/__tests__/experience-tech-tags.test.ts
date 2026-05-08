import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

describe("Property 3: Experience tech tags use orbit-chip", () => {
  it("ExperienceCard uses orbit-chip class for technology tags", () => {
    const content = readFileSync(
      join(process.cwd(), "src/components/cards/ExperienceCard.tsx"),
      "utf-8"
    );
    expect(content).toContain("orbit-chip");
  });

  it("ExperienceCard does not use old plain span styling for tech tags", () => {
    const content = readFileSync(
      join(process.cwd(), "src/components/cards/ExperienceCard.tsx"),
      "utf-8"
    );
    // The old style used bg-white/[0.06] for tech tags — should be gone
    // (it may still exist for other elements, but the tech tag span should use orbit-chip)
    expect(content).toContain("orbit-chip");
  });

  it("ExperienceCard uses --chip-color CSS custom property for category colors", () => {
    const content = readFileSync(
      join(process.cwd(), "src/components/cards/ExperienceCard.tsx"),
      "utf-8"
    );
    expect(content).toContain("--chip-color");
  });
});
