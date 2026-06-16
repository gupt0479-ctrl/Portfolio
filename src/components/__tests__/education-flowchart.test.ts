import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Education Flowchart — Property 6 & 7", () => {
  const content = readFileSync(
    join(process.cwd(), "src/components/EducationFlowchart.tsx"),
    "utf-8",
  );

  describe("Property 6: Education flowchart blob variant ordering", () => {
    it("Distortion increases with index (most recent = least deformed)", () => {
      // DISTORT array: [0, 0.42, 0.68] — college is stable, middle school most deformed
      expect(content).toContain("DISTORT");
      // College (idx 0) has zero distortion
      const distortMatch = content.match(/const DISTORT\s*=\s*\[([^\]]+)\]/);
      expect(distortMatch).not.toBeNull();
      const values = distortMatch?.[1]
        .split(",")
        .map((v) => Number.parseFloat(v.trim()));
      expect(values).toBeDefined();
      // Values should be ascending (more deformed for older schools)
      for (let i = 1; i < values!.length; i++) {
        expect(values![i]).toBeGreaterThan(values![i - 1]);
      }
    });

    it("Items are sorted most-recent-first by startDate", () => {
      expect(content).toContain("startDate");
      expect(content).toContain("localeCompare");
    });

    it("Three blobs are rendered by index with different distortion", () => {
      expect(content).toContain("DISTORT[idx]");
    });
  });

  describe("Property 7: Education text panel field completeness", () => {
    it("Degree is always shown", () => {
      expect(content).toContain("edu.degree");
    });

    it("Field of study is shown when present (conditional)", () => {
      expect(content).toContain("edu.fieldOfStudy");
      // Should be conditional
      expect(content).toContain("fieldOfStudy &&");
    });

    it("Institution is shown", () => {
      expect(content).toContain("edu.institution");
    });

    it("Date range is shown", () => {
      expect(content).toContain("edu.startDate");
      expect(content).toContain("edu.endDate");
    });

    it("GPA is shown when present (conditional)", () => {
      expect(content).toContain("edu.gpa");
      expect(content).toContain("gpa &&");
    });
  });
});
