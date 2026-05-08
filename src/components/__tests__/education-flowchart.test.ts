import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

describe("Education Flowchart — Property 6 & 7", () => {
  const content = readFileSync(
    join(process.cwd(), "src/components/EducationFlowchart.tsx"),
    "utf-8"
  );

  describe("Property 6: Education flowchart blob variant ordering", () => {
    it("BLOB_VARIANTS array starts with stable (most recent)", () => {
      // The first element should be "stable" for the most recent education
      expect(content).toContain('"stable"');
      // stable should appear before forming and amoeba in the variants array
      const stableIdx = content.indexOf('"stable"');
      const formingIdx = content.indexOf('"forming"');
      const amoebaIdx = content.indexOf('"amoeba"');
      expect(stableIdx).toBeLessThan(formingIdx);
      expect(formingIdx).toBeLessThan(amoebaIdx);
    });

    it("BLOB_VARIANTS array ends with amoeba (oldest)", () => {
      expect(content).toContain('"amoeba"');
    });

    it("Items are sorted most-recent-first by startDate", () => {
      expect(content).toContain("startDate");
      expect(content).toContain("localeCompare");
    });

    it("Blob variant is assigned by index (0=stable, 1=forming, 2+=amoeba)", () => {
      expect(content).toContain("BLOB_VARIANTS[Math.min(i, 2)]");
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
