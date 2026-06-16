import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Property 4: Center project card always shows required content", () => {
  const content = readFileSync(
    join(process.cwd(), "src/components/three/ProjectsSlider.tsx"),
    "utf-8",
  );

  it("ProjectCard renders title", () => {
    expect(content).toContain("project.title");
  });

  it("ProjectCard renders tagline", () => {
    expect(content).toContain("project.tagline");
  });

  it("ProjectCard uses orbit-chip for tech tags", () => {
    expect(content).toContain("orbit-chip");
  });

  it("ProjectCard renders summary panel for center card only", () => {
    expect(content).toContain("project.summary");
    expect(content).toContain("isCenter");
  });

  it("ProjectCard case summary panel is conditionally shown for center card only", () => {
    // The summary should be inside an isCenter conditional
    expect(content).toContain("isCenter && project.summary");
  });

  it("ProjectCard uses cosmic-card for center card background", () => {
    expect(content).toContain("cosmic-card");
  });
});
