# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Dead Code, Duplicates, and Defects Exist
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the 16 defect conditions exist
  - **Scoped PBT Approach**: Write structural assertions that check for the absence of each defect condition
  - Test file: `src/components/__tests__/codebase-cleanup-bug-condition.test.ts`
  - Assert `src/proxy.ts` does NOT exist (currently it does — bug)
  - Assert `src/sanity/lib/serverClients.ts` does NOT exist (currently it does — bug)
  - Assert `src/sanity/lib/server-client.ts` contains `assertValue` (currently it doesn't — bug)
  - Assert `CHAT_PROFILE_QUERY` is NOT exported from queries.ts (currently it is — bug)
  - Assert `EducationFlowchart.tsx` does NOT contain `STATIC_FALLBACKS` (currently it does — bug)
  - Assert `Footer.tsx` contains `getFullYear()` (currently it has hardcoded 2026 — bug)
  - Assert `page.tsx` does NOT contain `<main` (currently it does — bug)
  - Assert `ProjectsSlider.tsx` imports from `motion/react` not `framer-motion` (currently wrong — bug)
  - Assert `StudioClient.tsx` does NOT override `console.error` (currently it does — bug)
  - Assert `BlogFeed.tsx` does NOT use `next/link` for blog posts (currently it does — bug)
  - Assert `useIridescentEffect.ts` lives in `src/hooks/` (currently in `src/lib/hooks/` — bug)
  - Assert `MEMORY.md` references `.cursor/MEMORY/ecc-setup-guide.md` (currently wrong path — bug)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bugs exist)
  - Document counterexamples found to understand root cause
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.10, 1.11, 1.13, 1.14, 1.15, 1.16_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Portfolio Behavior Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Test file: `src/components/__tests__/codebase-cleanup-preservation.test.ts`
  - Observe: PortfolioContent renders all 11 sections in correct order on unfixed code
  - Observe: `sanityFetch` query matching returns correct data types for known queries
  - Observe: EducationFlowchart renders items correctly (with real data, ignoring padding)
  - Observe: Footer renders with copyright text
  - Observe: ProjectsSlider exports and renders with motion animations
  - Write property-based tests:
    - For all valid education item arrays (0-10 items), EducationFlowchart renders exactly that many items
    - For all known GROQ query strings, `getLocalDataForQuery` returns the correct data type
    - Footer always renders a copyright year
    - ProjectsSlider animation variants are correctly defined
  - Verify tests pass on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.7, 3.8_

- [x] 3. Group 1: Secret Protection (verify only)

  - [x] 3.1 Verify `.mcp.json` is gitignored and not tracked
    - Confirm `.mcp.json` is listed in `.gitignore`
    - Confirm `.mcp.json` is not in the git index (`git ls-files .mcp.json` returns empty)
    - Confirm `.mcp.example.json` exists with placeholder values
    - _Bug_Condition: isBugCondition(input) where input.isTrackedSecret = true_
    - _Expected_Behavior: Secret file is gitignored and removed from tracking_
    - _Preservation: No changes needed — already done_
    - _Requirements: 2.1_

- [x] 4. Group 2: Proxy Consolidation

  - [x] 4.1 Delete `src/proxy.ts`
    - Remove the duplicate middleware file
    - Root `proxy.ts` is the correct Next.js 16 proxy convention file
    - Verify no imports reference `src/proxy.ts` (grep for it)
    - _Bug_Condition: isBugCondition(input) where input.isDuplicateModule = true (two proxy files)_
    - _Expected_Behavior: Only root `proxy.ts` exists with Next.js 16 proxy pattern_
    - _Preservation: Clerk auth continues to protect /studio and non-public routes_
    - _Requirements: 2.2_

  - [x] 4.2 Run `pnpm typecheck` to verify no broken imports
    - _Requirements: 2.2, 3.8_

- [x] 5. Group 3: Server Client Consolidation

  - [x] 5.1 Add `assertValue` to `src/sanity/lib/server-client.ts`
    - Copy `assertValue` helper function from `serverClients.ts`
    - Wrap `process.env.SANITY_SERVER_API_TOKEN` with `assertValue("Missing environment variable: SANITY_SERVER_API_TOKEN")`
    - _Bug_Condition: isBugCondition(input) where input.isDuplicateModule = true (two server clients)_
    - _Expected_Behavior: Single server client with token validation that throws on missing token_
    - _Preservation: sanityFetch and server actions continue to work with valid token_
    - _Requirements: 2.3_

  - [x] 5.2 Delete `src/sanity/lib/serverClients.ts`
    - Remove the duplicate server client file
    - Update any imports of `serverClients` to use `server-client` instead
    - _Requirements: 2.3_

  - [x] 5.3 Run `pnpm typecheck` to verify no broken imports
    - _Requirements: 2.3, 3.8_

- [x] 6. Group 4: Dead File Deletion

  - [x] 6.1 Delete dead component files
    - Delete `src/components/Socials.tsx` (if exists)
    - Delete `src/components/chat/` directory (if exists)
    - Delete `src/components/DarkModeToggle.tsx`
    - Delete `src/components/EducationEntry.tsx` (if exists)
    - Delete `src/components/ContactForm.tsx` (if exists)
    - Delete `src/components/DisableDraftMode.tsx`
    - _Bug_Condition: isBugCondition(input) where input.isDeadFile = true_
    - _Expected_Behavior: No dead component files exist in the repository_
    - _Preservation: No active imports reference these files_
    - _Requirements: 2.4_

  - [x] 6.2 Delete dead hook files
    - Delete `src/hooks/useMousePosition.ts`
    - Delete `src/hooks/useTilt.ts`
    - Verify no active imports reference these hooks
    - _Requirements: 2.4_

  - [x] 6.3 Delete dead UI component files
    - Delete `src/components/ui/world-map.tsx` (if exists)
    - Delete `src/components/ui/chart.tsx` (if exists)
    - Delete `src/components/ui/spinner.tsx` (if exists)
    - Delete `src/components/ui/card.tsx` (if exists)
    - Delete `src/components/ui/dropdown-menu.tsx` (if exists)
    - _Requirements: 2.4_

  - [x] 6.4 Run `pnpm typecheck` to verify no broken imports after deletions
    - _Requirements: 2.4, 3.8_

- [x] 7. Group 5: Unused Dependency Removal

  - [x] 7.1 Verify no source imports exist for target packages
    - Grep codebase for imports of: `styled-components`, `@tabler/icons-react`, `dotted-map`, `groq`, `radix-ui`, `react-intersection-observer`
    - Note: `framer-motion` will be removed after Group 6 migration
    - Note: `@radix-ui/react-dropdown-menu` can be removed since `dropdown-menu.tsx` is dead (deleted in Group 4)
    - _Requirements: 2.5_

  - [x] 7.2 Remove unused dependencies
    - Run: `pnpm remove framer-motion styled-components @tabler/icons-react dotted-map groq radix-ui react-intersection-observer @radix-ui/react-dropdown-menu`
    - _Bug_Condition: isBugCondition(input) where input.isUnusedDependency = true_
    - _Expected_Behavior: Only actively imported packages remain in package.json_
    - _Preservation: All active components continue to function_
    - _Requirements: 2.5, 2.6_

  - [x] 7.3 Run `pnpm install` and verify lockfile is clean
    - _Requirements: 2.5_

- [x] 8. Group 6: Motion Library Migration

  - [x] 8.1 Update `ProjectsSlider.tsx` import from `framer-motion` to `motion/react`
    - Change: `import { AnimatePresence, motion } from "framer-motion"` → `import { AnimatePresence, motion } from "motion/react"`
    - The API surface is identical between the two packages
    - _Bug_Condition: isBugCondition(input) where input.isDuplicateLibrary = true_
    - _Expected_Behavior: All animation imports use `motion/react` consistently_
    - _Preservation: ProjectsSlider animations display correctly (same API)_
    - _Requirements: 2.6, 3.4_

  - [x] 8.2 Run `pnpm typecheck` to verify motion/react types resolve
    - _Requirements: 2.6, 3.8_

- [x] 9. Group 7: HTML and Markup Fixes

  - [x] 9.1 Remove `<main>` wrapper from `src/app/page.tsx`
    - Change from wrapping `<PortfolioContent />` in `<main>` to rendering it directly
    - `PortfolioContent.tsx` already has the semantic `<main>` element
    - Result: `export default async function Home() { return <PortfolioContent />; }`
    - _Bug_Condition: isBugCondition(input) where input.isInvalidHTML = true (nested <main>)_
    - _Expected_Behavior: Exactly one <main> element in the document hierarchy_
    - _Preservation: All sections render in correct order, layout unchanged_
    - _Requirements: 2.7, 3.3_

  - [x] 9.2 Replace hardcoded year in `src/components/Footer.tsx`
    - Change `© 2026` to `© {new Date().getFullYear()}`
    - Footer is a client component so `new Date().getFullYear()` runs at render time
    - _Bug_Condition: isBugCondition(input) where input.isHardcodedYear = true_
    - _Expected_Behavior: Footer displays current year dynamically_
    - _Preservation: Footer layout and styling unchanged_
    - _Requirements: 2.11_

- [x] 10. Group 8: Dead Query and Unused Import Removal

  - [x] 10.1 Remove `CHAT_PROFILE_QUERY` from `src/sanity/lib/queries.ts`
    - Delete the entire `CHAT_PROFILE_QUERY` export (dead code from removed ChatKit)
    - _Bug_Condition: isBugCondition(input) where input.isDeadQuery = true_
    - _Expected_Behavior: Only actively used queries exist in queries.ts_
    - _Preservation: All active queries (PROFILE, NAVIGATION, PROJECTS, etc.) unchanged_
    - _Requirements: 2.8_

  - [x] 10.2 Remove `getLocalChatProfile` and `CHAT_PROFILE_QUERYResult` from `src/lib/localContent.ts`
    - Delete the `getLocalChatProfile` function
    - Remove `CHAT_PROFILE_QUERYResult` from the type import
    - _Requirements: 2.8, 2.9_

  - [x] 10.3 Run `pnpm typegen && pnpm typecheck` to verify query removal is clean
    - _Requirements: 2.8, 3.8_

- [x] 11. Group 9: Component Logic Fixes

  - [x] 11.1 Fix `EducationFlowchart.tsx` — remove hardcoded fallbacks
    - Remove `STATIC_FALLBACKS` array entirely
    - Remove the padding loop (`for (let i = sorted.length; i < 3; ...)`)
    - Render `sorted` directly — if 1 or 2 items, render 1 or 2 blobs gracefully
    - Use `Math.min(i, 2)` for safe `BLOB_SIZES`, `BLOB_COLORS`, `BLOB_ICONS` indexing (already done)
    - _Bug_Condition: isBugCondition(input) where input.isHardcodedFallback = true_
    - _Expected_Behavior: Renders only real data without padding with fake entries_
    - _Preservation: Real education items render correctly with blob styling_
    - _Requirements: 2.10, 3.3_

  - [x] 11.2 Fix `BlogFeed.tsx` — remove broken links
    - Replace `<Link href={href}>` wrapper with a non-navigating `<div>` or `<article>`
    - Remove `import Link from "next/link"` (no longer needed)
    - Keep card structure and styling for future reactivation when `/blog/[slug]` route is created
    - _Bug_Condition: isBugCondition(input) where input.isBrokenLink = true_
    - _Expected_Behavior: Blog cards are display-only, no broken navigation_
    - _Preservation: Blog card visual appearance unchanged_
    - _Requirements: 2.14_

  - [x] 11.3 Fix `StudioClient.tsx` — remove console suppression
    - Remove the entire `useEffect` that overrides `console.error`
    - Remove `import { useEffect } from "react"`
    - Result: Component simply renders `<NextStudio config={config} />`
    - _Bug_Condition: isBugCondition(input) where input.isConsoleSuppression = true_
    - _Expected_Behavior: No console.error suppression; real errors are visible_
    - _Preservation: Sanity Studio loads and functions correctly_
    - _Requirements: 2.15, 3.11_

  - [x] 11.4 Fix `localContent.ts` — improve query matching for contact vs profile
    - Add a more specific check: if query contains `"email"` in the field projection AND `_type == "profile"`, route to `getLocalContactProfile()` instead of `getLocalProfile()`
    - Move the contact-specific check BEFORE the generic profile check in `getLocalDataForQuery`
    - _Bug_Condition: isBugCondition(input) where input.isAmbiguousQueryMatch = true_
    - _Expected_Behavior: Contact queries return contact-specific data, profile queries return full profile_
    - _Preservation: Both AboutSection and ContactSection receive correct data_
    - _Requirements: 2.12, 3.2_

  - [x] 11.5 Run `pnpm typecheck` and `pnpm test` to verify component fixes
    - Update any existing tests that reference removed code (e.g., education flowchart padding tests)
    - _Requirements: 3.7, 3.8_

- [x] 12. Group 10: Hook Consolidation and Documentation

  - [x] 12.1 Move `useIridescentEffect.ts` to `src/hooks/`
    - Move `src/lib/hooks/useIridescentEffect.ts` → `src/hooks/useIridescentEffect.ts`
    - Update imports in 4 files:
      - `src/components/three/ProjectsSlider.tsx`: `@/lib/hooks/useIridescentEffect` → `@/hooks/useIridescentEffect`
      - `src/components/ContactPanel.tsx`: `@/lib/hooks/useIridescentEffect` → `@/hooks/useIridescentEffect`
      - `src/components/sections/HeroContent.tsx`: `@/lib/hooks/useIridescentEffect` → `@/hooks/useIridescentEffect`
      - `src/components/sections/SkillsSectionClient.tsx`: `@/lib/hooks/useIridescentEffect` → `@/hooks/useIridescentEffect`
    - Delete `src/lib/hooks/` directory if empty after move
    - _Bug_Condition: isBugCondition(input) where input.isSplitHookDirectory = true_
    - _Expected_Behavior: All hooks consolidated in single `src/hooks/` directory_
    - _Preservation: useIridescentEffect behavior unchanged in all consuming components_
    - _Requirements: 2.13_

  - [x] 12.2 Fix `MEMORY.md` file path reference
    - Change `[ECC Setup Guide](ecc-setup-guide.md)` → `[ECC Setup Guide](.cursor/MEMORY/ecc-setup-guide.md)`
    - _Bug_Condition: isBugCondition(input) where input.isStaleDocReference = true_
    - _Expected_Behavior: Documentation references correct file paths_
    - _Requirements: 2.16_

  - [x] 12.3 Verify README.md accuracy
    - Confirm README describes the real portfolio project (not Next.js starter)
    - Remove any remaining stale agent-specific references if found
    - _Requirements: 2.16_

  - [x] 12.4 Run `pnpm typecheck` to verify hook move is clean
    - _Requirements: 2.13, 3.8_

- [x] 13. Fix implementation — verify bug condition test passes

  - [x] 13.1 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - All Defects Resolved
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior for all 16 defect conditions
    - When this test passes, it confirms all bugs are fixed
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms all defects are resolved)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.10, 2.11, 2.13, 2.14, 2.15, 2.16_

  - [x] 13.2 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Behavior Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.7, 3.8_

- [x] 14. Checkpoint - Full verification
  - Run `pnpm lint` — Biome check passes with no errors
  - Run `pnpm test` — all Vitest tests pass (including new bug condition and preservation tests)
  - Run `pnpm typegen && pnpm typecheck && next build` — full production build succeeds
  - Ensure all tests pass, ask the user if questions arise
  - _Requirements: 3.7, 3.8_
