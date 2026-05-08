import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

// Recursively get all .tsx and .ts files in a directory
function getAllSourceFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory() && !entry.startsWith(".") && entry !== "node_modules") {
      files.push(...getAllSourceFiles(fullPath));
    } else if (entry.endsWith(".tsx") || entry.endsWith(".ts")) {
      files.push(fullPath);
    }
  }
  return files;
}

const BANNED_STRINGS = [
  "AI Twin",
  "Chat with Anant",
  "Chat with AI Twin",
  "ChatKit",
  "Built in the dark",
  "Tired of chatting",
  "I'm a real person",
];

// Files to exclude from the check:
// - This test file itself
// - ChatKit implementation files kept in repo per spec (task 11.5: "Keep ChatKit files in the
//   repo but remove from visible UI") — these are not rendered in the visible UI
const EXCLUDED_FILES = [
  "banned-text.test.ts",
  // ChatKit implementation files — kept in repo but not rendered in visible UI
  "src/components/chat/Chat.tsx",
  "src/components/chat/ChatWrapper.tsx",
  "src/lib/config.ts",
  "src/app/actions/create-session.ts",
];

/**
 * Property 11: Banned text exclusion across all components
 *
 * Validates: Requirements 16.1, 16.2, 16.3, 16.4, 16.5
 *
 * Verifies that no visible UI source file contains banned strings such as
 * "AI Twin", "Chat with Anant", "ChatKit" branding, "Tired of chatting",
 * "I'm a real person", or "Built in the dark".
 *
 * ChatKit implementation files (Chat.tsx, ChatWrapper.tsx, config.ts,
 * create-session.ts) are excluded because they are kept in the repo per
 * spec task 11.5 but are not rendered in the visible UI.
 */
describe("Property 11: Banned text exclusion across all components", () => {
  const srcDir = join(process.cwd(), "src");
  const allFiles = getAllSourceFiles(srcDir).filter(
    (f) => !EXCLUDED_FILES.some((excluded) => f.endsWith(excluded))
  );

  for (const bannedString of BANNED_STRINGS) {
    it(`No source file contains "${bannedString}"`, () => {
      const violations: string[] = [];
      for (const file of allFiles) {
        const content = readFileSync(file, "utf-8");
        if (content.includes(bannedString)) {
          // Get relative path for cleaner error messages
          const relativePath = file.replace(process.cwd() + "/", "");
          violations.push(relativePath);
        }
      }
      if (violations.length > 0) {
        throw new Error(
          `Found "${bannedString}" in: ${violations.join(", ")}`
        );
      }
    });
  }
});
