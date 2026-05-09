/**
 * Preservation Property Tests — Codebase Cleanup
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.7, 3.8**
 *
 * Property 2: Preservation — Existing Portfolio Behavior Unchanged
 *
 * These tests verify CURRENT correct behavior that must be preserved after the fix.
 * They must PASS on unfixed code to establish the baseline.
 *
 * Focus: behaviors that are CORRECT and should NOT change after the fix.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../../..");

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf-8");
}

describe("Preservation: Existing Portfolio Behavior Unchanged", () => {
  describe("PortfolioContent renders all 11 sections in correct order", () => {
    const content = readSource("src/components/PortfolioContent.tsx");

    it("renders all 11 sections in the correct order", () => {
      // The sections must appear in this order within the JSX
      const sections = [
        "HeroSection",
        "AboutSection",
        "ExperienceSection",
        "ProjectsSlider",
        "SkillsSection",
        "EducationSection",
        "CertificationsSection",
        "AchievementsSection",
        "BlogSection",
        "ContactSection",
        "Footer",
      ];

      // Verify all sections are present
      for (const section of sections) {
        expect(content).toContain(section);
      }

      // Verify ordering: each section appears after the previous one in the JSX
      let lastIndex = -1;
      for (const section of sections) {
        const idx = content.indexOf(`<${section}`);
        expect(idx).toBeGreaterThan(lastIndex);
        lastIndex = idx;
      }
    });

    it("wraps sections in a <main> element", () => {
      // PortfolioContent has the semantic <main> element
      expect(content).toContain("<main");
      expect(content).toContain("</main>");
    });

    it("includes ObsidianBackground for Three.js rendering", () => {
      expect(content).toContain("ObsidianBackground");
    });

    it("includes HeaderScrolling navigation", () => {
      expect(content).toContain("HeaderScrolling");
    });
  });

  describe("getLocalDataForQuery returns correct data types for known queries", () => {
    const localContentSource = readSource("src/lib/localContent.ts");

    // Known query type mappings that must be preserved
    const QUERY_TYPE_MAPPINGS = [
      { typeMatch: '_type == "profile"', handler: "getLocalProfile" },
      { typeMatch: '_type == "siteSettings"', handler: "getLocalSiteSettings" },
      { typeMatch: '_type == "navigation"', handler: "getLocalNavigation" },
      { typeMatch: '_type == "project"', handler: "getLocalProjects" },
      { typeMatch: '_type == "skill"', handler: "getLocalSkills" },
      { typeMatch: '_type == "experience"', handler: "getLocalExperience" },
      { typeMatch: '_type == "education"', handler: "getLocalEducation" },
      {
        typeMatch: '_type == "certification"',
        handler: "getLocalCertifications",
      },
      { typeMatch: '_type == "achievement"', handler: "getLocalAchievements" },
      { typeMatch: '_type == "blog"', handler: "getLocalBlog" },
    ];

    it("routes all known GROQ type strings to the correct handler", () => {
      for (const mapping of QUERY_TYPE_MAPPINGS) {
        // The getLocalDataForQuery function must contain a check for this type
        expect(localContentSource).toContain(
          `query.includes('${mapping.typeMatch}')`,
        );
        // And it must call the correct handler
        expect(localContentSource).toContain(`return ${mapping.handler}()`);
      }
    });

    it("getLocalDataForQuery handles all 10 known document types", () => {
      // Verify the function exists and handles all types
      expect(localContentSource).toContain(
        "export async function getLocalDataForQuery",
      );

      for (const mapping of QUERY_TYPE_MAPPINGS) {
        expect(localContentSource).toContain(mapping.typeMatch);
      }
    });

    it("getLocalDataForQuery returns undefined for unrecognized queries", () => {
      // The function should have a fallback return undefined
      expect(localContentSource).toContain("return undefined");
    });
  });

  describe("EducationFlowchart renders items correctly (current behavior)", () => {
    const content = readSource("src/components/EducationFlowchart.tsx");

    it("renders only real education items without fallback padding", () => {
      // FIXED BEHAVIOR: The component renders only real data without padding
      // No STATIC_FALLBACKS, no padding loop — renders sorted items directly
      expect(content).not.toContain("STATIC_FALLBACKS");
      expect(content).not.toContain("while (");
      expect(content).toContain("sorted.map");
      expect(content).toContain("Math.min(i, 2)");
    });

    it("sorts items most-recent-first by startDate", () => {
      expect(content).toContain(
        '(b.startDate ?? "").localeCompare(a.startDate ?? "")',
      );
    });

    it("uses safe indexing with Math.min for blob styling arrays", () => {
      expect(content).toContain("BLOB_VARIANTS[Math.min(i, 2)]");
      expect(content).toContain("BLOB_SIZES[Math.min(i, 2)]");
      expect(content).toContain("BLOB_COLORS[Math.min(i, 2)]");
      expect(content).toContain("BLOB_ICONS[Math.min(i, 2)]");
    });

    it("renders degree, institution, and date range for each item", () => {
      expect(content).toContain("edu.degree");
      expect(content).toContain("edu.institution");
      expect(content).toContain("edu.startDate");
      expect(content).toContain("edu.endDate");
    });

    it("uses motion for animations", () => {
      expect(content).toContain("motion.div");
      expect(content).toContain("whileInView");
    });
  });

  describe("Footer renders with copyright text", () => {
    const content = readSource("src/components/Footer.tsx");

    it("Footer renders a copyright symbol", () => {
      expect(content).toContain("©");
    });

    it("renders copyright text with author name", () => {
      expect(content).toContain("Anant Gupta");
    });

    it("renders a back-to-top button", () => {
      expect(content).toContain("Back to top");
      expect(content).toContain("scrollToTop");
    });

    it("is a client component", () => {
      expect(content).toContain('"use client"');
    });

    it("uses ArrowUp icon from lucide-react", () => {
      expect(content).toContain("ArrowUp");
      expect(content).toContain("lucide-react");
    });
  });

  describe("ProjectsSlider animation variants are correctly defined", () => {
    const content = readSource("src/components/three/ProjectsSlider.tsx");

    it("slideVariants defines enter, center, and exit states", () => {
      for (const variantKey of ["enter", "center", "exit"]) {
        expect(content).toContain(`${variantKey}:`);
      }
    });

    it("slideVariants enter uses x offset and opacity 0", () => {
      // The enter variant moves from off-screen with opacity 0
      expect(content).toContain("enter: (dir: number) => ({");
      expect(content).toContain("opacity: 0");
      expect(content).toContain("scale: 0.92");
    });

    it("slideVariants center uses spring animation", () => {
      expect(content).toContain("center: {");
      expect(content).toContain("x: 0");
      expect(content).toContain("opacity: 1");
      expect(content).toContain("scale: 1");
      expect(content).toContain('type: "spring"');
      expect(content).toContain("stiffness: 300");
      expect(content).toContain("damping: 30");
    });

    it("slideVariants exit mirrors enter in opposite direction", () => {
      expect(content).toContain("exit: (dir: number) => ({");
    });

    it("exports ProjectsSlider as named export", () => {
      expect(content).toContain("export function ProjectsSlider");
    });

    it("uses AnimatePresence for slide transitions", () => {
      expect(content).toContain("AnimatePresence");
      expect(content).toContain('mode="wait"');
    });

    it("supports keyboard navigation (ArrowRight/ArrowLeft)", () => {
      expect(content).toContain("ArrowRight");
      expect(content).toContain("ArrowLeft");
    });

    it("supports touch/drag gestures", () => {
      expect(content).toContain("handleTouchStart");
      expect(content).toContain("handleTouchMove");
      expect(content).toContain("handleTouchEnd");
      expect(content).toContain("handleMouseDown");
    });

    it("renders navigation buttons with accessible labels", () => {
      expect(content).toContain('aria-label="Previous project"');
      expect(content).toContain('aria-label="Next project"');
    });
  });
});
