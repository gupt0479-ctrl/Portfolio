// src/components/__tests__/portfolio-lab.test.ts
import { describe, expect, it } from "vitest";
import type { LabMode } from "@/lib/lab-data";
import { generateProofPack, LAB_CHIPS, LAB_RESPONSES } from "@/lib/lab-data";

const MODES: LabMode[] = ["Recruiter", "Builder", "Research", "Skeptic"];

describe("Property 12: Portfolio Lab mode-chip mapping", () => {
  for (const mode of MODES) {
    describe(`Mode: ${mode}`, () => {
      it(`has chips defined for ${mode} mode`, () => {
        expect(LAB_CHIPS[mode]).toBeDefined();
        expect(LAB_CHIPS[mode].length).toBeGreaterThan(0);
      });

      it(`all chips in ${mode} mode have non-empty labels`, () => {
        for (const chip of LAB_CHIPS[mode]) {
          expect(chip.label.trim().length).toBeGreaterThan(0);
        }
      });

      it(`all chips in ${mode} mode have valid response keys`, () => {
        for (const chip of LAB_CHIPS[mode]) {
          expect(LAB_RESPONSES[chip.responseKey]).toBeDefined();
        }
      });
    });
  }
});

describe("Property 13: Portfolio Lab response completeness", () => {
  for (const mode of MODES) {
    for (const chip of LAB_CHIPS[mode]) {
      const response = LAB_RESPONSES[chip.responseKey];
      if (!response) continue;

      describe(`Response: ${chip.responseKey}`, () => {
        it("has a non-empty heading", () => {
          expect(response.heading.trim().length).toBeGreaterThan(0);
        });

        it("has a non-empty summary", () => {
          expect(response.summary.trim().length).toBeGreaterThan(0);
        });

        it("has at least one evidence item", () => {
          expect(response.evidence.length).toBeGreaterThan(0);
        });

        it("evidence items with sectionLink have valid anchor format", () => {
          for (const item of response.evidence) {
            if (item.sectionLink) {
              expect(item.sectionLink).toMatch(/^#[a-z-]+$/);
            }
          }
        });
      });
    }
  }
});

describe("generateProofPack", () => {
  for (const mode of MODES) {
    it(`generates non-empty proof pack for ${mode} mode`, () => {
      const pack = generateProofPack(mode);
      expect(pack.trim().length).toBeGreaterThan(0);
      expect(pack).toContain(mode);
    });
  }
});
