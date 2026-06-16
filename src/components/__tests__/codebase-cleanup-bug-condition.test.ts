/**
 * Bug Condition Exploration Test — Codebase Cleanup
 *
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.10, 1.11, 1.13, 1.14, 1.15, 1.16**
 *
 * Property 1: Bug Condition — Dead Code, Duplicates, and Defects Exist
 *
 * This test encodes the EXPECTED (correct) behavior. Each assertion checks that
 * a defect condition does NOT exist. On unfixed code, these assertions FAIL —
 * proving the bugs exist. After the fix, they PASS — confirming the bugs are resolved.
 *
 * CRITICAL: This test MUST FAIL on unfixed code. Failure confirms the bugs exist.
 * DO NOT attempt to fix the test or the code when it fails.
 */

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../../..");

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.resolve(ROOT, relativePath));
}

function readFileContent(relativePath: string): string {
  return fs.readFileSync(path.resolve(ROOT, relativePath), "utf-8");
}

describe("Bug Condition: Dead Code, Duplicates, and Defects Exist", () => {
  it("src/proxy.ts is the active Clerk middleware proxy", () => {
    // Requirement 1.2: proxy.ts must exist as the active Next.js/Clerk bridge
    // Expected: src/proxy.ts exports a proxy function and config matcher
    const content = readFileContent("src/proxy.ts").trim();
    expect(content).toContain("export async function proxy");
    expect(content).toContain("export const config");
  });

  it("src/sanity/lib/serverClients.ts does NOT exist (duplicate server client removed)", () => {
    // Requirement 1.3: Two duplicate Sanity server clients with inconsistent token validation
    // Expected: Only server-client.ts should exist with proper validation
    expect(fileExists("src/sanity/lib/serverClients.ts")).toBe(false);
  });

  it("src/sanity/lib/server-client.ts contains assertValue (proper token validation)", () => {
    // Requirement 1.3: server-client.ts silently uses undefined token
    // Expected: server-client.ts should validate token with assertValue
    const content = readFileContent("src/sanity/lib/server-client.ts");
    expect(content).toContain("assertValue");
    expect(content).toContain("export function getServerClient");
    expect(content).not.toContain("new Proxy");
    expect(content).not.toContain("export const serverClient");
  });

  it("CHAT_PROFILE_QUERY is NOT exported from queries.ts (dead query removed)", () => {
    // Requirement 1.8: Dead query from removed ChatKit feature
    // Expected: Only actively used queries should exist
    const content = readFileContent("src/sanity/lib/queries.ts");
    expect(content).not.toContain("CHAT_PROFILE_QUERY");
  });

  it("EducationFlowchart.tsx does NOT contain STATIC_FALLBACKS (no hardcoded fake data)", () => {
    // Requirement 1.10: Pads with hardcoded fake entries instead of rendering real data
    // Expected: Render only real data without padding
    const content = readFileContent("src/components/EducationFlowchart.tsx");
    expect(content).not.toContain("STATIC_FALLBACKS");
  });

  it("Footer.tsx contains getFullYear() (dynamic year, not hardcoded)", () => {
    // Requirement 1.11: Hardcoded © 2026 instead of dynamic year
    // Expected: Use new Date().getFullYear() for current year
    const content = readFileContent("src/components/Footer.tsx");
    expect(content).toContain("getFullYear()");
  });

  it("page.tsx does NOT contain <main (no nested main elements)", () => {
    // Requirement 1.7: Nested <main> elements — invalid HTML
    // Expected: Only PortfolioContent.tsx should have <main>
    const content = readFileContent("src/app/(portfolio)/page.tsx");
    expect(content).not.toContain("<main");
  });

  it("ProjectsSlider.tsx imports from motion/react not framer-motion", () => {
    // Requirement 1.6: Imports from framer-motion while all other files use motion/react
    // Expected: Consistent use of motion/react across all files
    const content = readFileContent("src/components/three/ProjectsSlider.tsx");
    expect(content).not.toContain('from "framer-motion"');
    expect(content).toContain('from "motion/react"');
  });

  it("StudioClient.tsx does NOT override console.error (no error suppression)", () => {
    // Requirement 1.15: Suppresses all console errors to hide a prop warning
    // Expected: No console.error override; real errors should be visible
    const content = readFileContent(
      "src/app/studio/[[...tool]]/StudioClient.tsx",
    );
    expect(content).not.toContain("console.error");
  });

  it("BlogFeed.tsx does NOT use next/link for blog posts (no broken links)", () => {
    // Requirement 1.14: Links to /blog/${slug} but no route exists
    // Expected: Blog cards are display-only without broken navigation
    const content = readFileContent("src/components/BlogFeed.tsx");
    expect(content).not.toContain("next/link");
  });

  it("useIridescentEffect.ts lives in src/hooks/ (consolidated hook directory)", () => {
    // Requirement 1.13: Hooks split across src/hooks/ and src/lib/hooks/
    // Expected: All hooks consolidated in single src/hooks/ directory
    expect(fileExists("src/hooks/useIridescentEffect.ts")).toBe(true);
    expect(fileExists("src/lib/hooks/useIridescentEffect.ts")).toBe(false);
  });

  it("MEMORY.md references Claude documentation, not stale cursor path", () => {
    // Requirement 1.16: MEMORY.md must reference Claude-specific documentation
    // Expected: Points to .claude/CLAUDE.md, CLAUDE.md, AGENTS.md — not the old .cursor path
    const content = readFileContent("MEMORY.md");
    expect(content).toContain(".claude/CLAUDE.md");
    expect(content).not.toContain(".cursor/MEMORY/ecc-setup-guide.md");
  });
});
