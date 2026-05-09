# Codebase Cleanup Bugfix Design

## Overview

The portfolio codebase has accumulated 16 distinct defects from rapid AI-assisted development: exposed secrets, duplicate/dead files, unused dependencies, invalid HTML, hardcoded fallbacks, broken links, console suppression, and documentation drift. This design formalizes the bug condition as "any file, dependency, import, or code pattern that violates the single-responsibility, no-dead-code, or correctness principles documented in the requirements." The fix is a systematic sweep that removes dead code, consolidates duplicates, corrects markup, and updates documentation — all while preserving the working portfolio behavior.

## Glossary

- **Bug_Condition (C)**: Any of the 16 defect conditions identified in the requirements — dead files, duplicate modules, unused dependencies, invalid HTML, hardcoded fallbacks, broken links, console suppression, or stale documentation
- **Property (P)**: After the fix, the codebase contains no dead code, no duplicate modules, no unused dependencies, valid HTML structure, dynamic content, working links, no console suppression, and accurate documentation
- **Preservation**: All existing user-facing behavior — section rendering, navigation, animations, auth, Studio access, Portfolio Lab, responsive layout, and passing tests — remains unchanged
- **`proxy.ts` (root)**: Next.js 16 middleware using a `respondWith` hack to bridge Clerk middleware with the new proxy API
- **`src/proxy.ts`**: Standard Clerk middleware export with `clerkMiddleware()` and route matchers
- **`server-client.ts`**: Sanity server client in `src/sanity/lib/` without token validation (silently uses `undefined`)
- **`serverClients.ts`**: Sanity server client in `src/sanity/lib/` with `assertValue` token validation
- **`localContent.ts`**: Server-only module that maps GROQ query strings to local NDJSON data loaders

## Bug Details

### Bug Condition

The bug manifests across 16 independent defect categories. The codebase contains files, dependencies, imports, and code patterns that are either dead (never used), duplicated (conflicting implementations), incorrect (invalid HTML, broken links, hardcoded values), or misleading (console suppression, stale docs).

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type CodebaseArtifact (file, dependency, import, code pattern, or documentation)
  OUTPUT: boolean
  
  RETURN input.isTrackedSecret
         OR input.isDuplicateModule
         OR input.isDeadFile
         OR input.isUnusedDependency
         OR input.isDuplicateLibrary
         OR input.isInvalidHTML
         OR input.isDeadQuery
         OR input.isUnusedImport
         OR input.isHardcodedFallback
         OR input.isHardcodedYear
         OR input.isAmbiguousQueryMatch
         OR input.isSplitHookDirectory
         OR input.isBrokenLink
         OR input.isConsoleSuppression
         OR input.isStaleDocReference
END FUNCTION
```

### Examples

- `.mcp.json` tracked in git exposes `bb7145f6...` Obsidian API token → should be gitignored (already done, file deleted)
- `proxy.ts` (root) AND `src/proxy.ts` both exist → only one should remain
- `framer-motion` in package.json AND `motion` in package.json → only `motion` should remain
- `src/app/page.tsx` has `<main>` AND `PortfolioContent.tsx` has `<main>` → nested `<main>` elements in DOM
- `BlogFeed.tsx` links to `/blog/${slug}` → no `/blog/[slug]` route exists, links are broken
- Footer shows `© 2026` → should show current year dynamically
- `EducationFlowchart` pads with "Delhi Public School" entries → should render only real data

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- All 11 portfolio sections render in correct order (Hero → Footer)
- Clerk authentication protects `/studio` and non-public routes
- `sanityFetch` returns correct data from Sanity or falls back to local NDJSON
- Three.js background and ProjectsSlider animations display correctly
- Portfolio Lab sidebar functions with all four modes without sign-in
- Active shadcn/ui components (tooltip, dialog, separator, slot) continue working
- All existing tests pass (with updates only for tests referencing removed dead code)
- Production build completes with no type errors
- Navigation links scroll to correct sections
- Mobile responsiveness is maintained
- Sanity Studio loads at `/studio` for authenticated users
- Skills chart renders correctly

**Scope:**
All inputs that do NOT involve the 16 defect conditions should be completely unaffected by this fix. This includes:
- User interactions (clicks, scrolls, keyboard navigation)
- Data fetching and rendering pipelines
- Authentication flows
- Animation and visual effects
- Content management through Sanity Studio

## Hypothesized Root Cause

Based on the bug description, the root causes are:

1. **Rapid AI-assisted development**: Multiple AI agents (Cursor, Codex, Kiro, Claude) added files and dependencies without coordinating cleanup, leading to duplicates and dead code

2. **Incomplete feature removal**: ChatKit was removed but its queries (`CHAT_PROFILE_QUERY`), components (`Socials.tsx`, `chat/`), and dependencies (`styled-components`) were left behind

3. **Library migration drift**: Migration from `framer-motion` to `motion` was incomplete — `ProjectsSlider.tsx` still imports from `framer-motion`

4. **Copy-paste middleware**: Two proxy files exist because Next.js 16 changed the middleware API and both the old (`src/proxy.ts`) and new (`proxy.ts`) patterns were kept

5. **Defensive over-engineering**: `EducationFlowchart` pads to 3 items and `StudioClient` suppresses console errors as workarounds rather than proper fixes

6. **Documentation neglect**: `MEMORY.md` references moved files, README was updated but still contains stale agent-specific references

## Correctness Properties

Property 1: Bug Condition - Dead Code and Duplicates Removed

_For any_ codebase artifact where the bug condition holds (isBugCondition returns true), the fixed codebase SHALL have that artifact removed, consolidated, or corrected such that no dead files exist, no duplicate modules conflict, no unused dependencies inflate the bundle, HTML is valid, links resolve, content is dynamic, and documentation is accurate.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15, 2.16**

Property 2: Preservation - Existing Behavior Unchanged

_For any_ input where the bug condition does NOT hold (isBugCondition returns false), the fixed codebase SHALL produce exactly the same user-facing behavior as the original codebase, preserving all section rendering, authentication, data fetching, animations, navigation, responsiveness, and test results.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12**

## Fix Implementation

### Changes Required

The fix is organized into 10 logical groups, ordered by dependency to avoid breaking imports during the process.

**Group 1: Secret Protection (Requirement 2.1)**

- **File**: `.gitignore`
- **Status**: Already done — `.mcp.json` is listed in `.gitignore` and the file has been removed from tracking
- **Verification**: Confirm `.mcp.json` is not in the git index

**Group 2: Proxy Consolidation (Requirement 2.2)**

- **Decision**: Keep `proxy.ts` (root) — this is the file Next.js 16 actually loads via its proxy convention. The root-level `proxy.ts` uses the Next.js 16 proxy pattern with `respondWith` which is required for the current Next.js version.
- **Action**: Delete `src/proxy.ts`
- **Rationale**: Next.js 16.1.1 uses the root `proxy.ts` export convention. The `src/proxy.ts` standard middleware pattern is for older Next.js versions. The root proxy already protects non-public routes via Clerk.

**Group 3: Server Client Consolidation (Requirement 2.3)**

- **File**: `src/sanity/lib/server-client.ts`
- **Action**: Add `assertValue` token validation from `serverClients.ts` into `server-client.ts`, then delete `serverClients.ts`
- **Rationale**: `server-client.ts` is imported by the contact form action and has the richer configuration (stega, perspective). Adding token validation makes it the single authoritative server client.
- **Specific Changes**:
  1. Add `assertValue` helper function to `server-client.ts`
  2. Wrap `process.env.SANITY_SERVER_API_TOKEN` with `assertValue`
  3. Delete `src/sanity/lib/serverClients.ts`
  4. Update any imports of `serverClients.ts` to use `server-client.ts`

**Group 4: Dead File Deletion (Requirement 2.4)**

- **Files to delete** (in dependency order — leaf files first):
  1. `src/components/Socials.tsx` (if exists)
  2. `src/components/chat/` (entire directory)
  3. `src/hooks/useMousePosition.ts`
  4. `src/hooks/useTilt.ts`
  5. `src/components/DarkModeToggle.tsx`
  6. `src/components/EducationEntry.tsx` (if exists)
  7. `src/components/ContactForm.tsx` (if exists)
  8. `src/components/DisableDraftMode.tsx`
  9. `src/components/ui/world-map.tsx` (if exists)
  10. `src/components/ui/chart.tsx` (if exists)
  11. `src/components/ui/spinner.tsx` (if exists)
  12. `src/components/ui/card.tsx` (if exists)
  13. `src/components/ui/dropdown-menu.tsx` (if exists)

**Group 5: Unused Dependency Removal (Requirements 2.5, 2.6)**

- **Action**: `pnpm remove framer-motion styled-components @tabler/icons-react dotted-map groq radix-ui react-intersection-observer`
- **Pre-check**: Verify none of these are imported in source (grep for each)
- **Note**: `@radix-ui/react-dropdown-menu` can also be removed since `dropdown-menu.tsx` is dead code

**Group 6: Motion Library Migration (Requirement 2.6)**

- **File**: `src/components/three/ProjectsSlider.tsx`
- **Change**: Update import from `import { AnimatePresence, motion } from "framer-motion"` to `import { AnimatePresence, motion } from "motion/react"`
- **Rationale**: All other files already use `motion/react`. The API is identical.

**Group 7: HTML and Markup Fixes (Requirements 2.7, 2.11)**

- **File**: `src/app/page.tsx`
- **Change**: Remove the `<main>` wrapper, render `<PortfolioContent />` directly (or wrap in a `<div>`)
- **Rationale**: `PortfolioContent.tsx` already has `<main className="relative z-10 min-h-screen text-white">` — the semantic landmark should exist only once
- **Specific Change**:
  ```tsx
  // Before
  export default async function Home() {
    return (
      <main className="min-h-screen bg-transparent text-white">
        <PortfolioContent />
      </main>
    );
  }
  
  // After
  export default async function Home() {
    return <PortfolioContent />;
  }
  ```

- **File**: `src/components/Footer.tsx`
- **Change**: Replace hardcoded `© 2026` with `© ${new Date().getFullYear()}`
- **Note**: Footer is a client component, so `new Date().getFullYear()` runs on the client at render time

**Group 8: Dead Query and Unused Import Removal (Requirements 2.8, 2.9)**

- **File**: `src/sanity/lib/queries.ts`
- **Change**: Remove `CHAT_PROFILE_QUERY` export
- **File**: `src/lib/localContent.ts`
- **Change**: Remove `getLocalChatProfile` function and `CHAT_PROFILE_QUERYResult` type import (if no longer used)
- **Note on Requirement 2.9**: The `Legend` import from recharts is NOT present in the current `SkillsSectionClient.tsx`. The unused `Legend` exists only in the dead `chart.tsx` file which is being deleted in Group 4. No action needed for 2.9 beyond dead file deletion.

**Group 9: Component Logic Fixes (Requirements 2.10, 2.12, 2.14, 2.15)**

- **File**: `src/components/EducationFlowchart.tsx`
- **Changes**:
  1. Remove `STATIC_FALLBACKS` array entirely
  2. Remove the padding loop (`for (let i = sorted.length; i < 3; ...)`)
  3. Render `sorted` directly — if 1 or 2 items, render 1 or 2 blobs gracefully
  4. Adjust `BLOB_SIZES`, `BLOB_COLORS`, `BLOB_ICONS` indexing to use `Math.min(i, items.length - 1)` or similar safe access

- **File**: `src/lib/localContent.ts`
- **Change in `getLocalDataForQuery`**: The current implementation returns the full profile for any query containing `_type == "profile"`. This works correctly because:
  - `AboutSection` uses `PROFILE_QUERY` which contains `_type == "profile"`
  - `ContactSection` uses a `CONTACT_QUERY` that also contains `_type == "profile"`
  - The TypeScript types handle narrowing at the call site
  - However, for correctness, add a more specific check: if the query contains `email` and `socialLinks` field selection (contact-specific fields), route to `getLocalContactProfile()` instead
  - **Specific logic**: Check for `"email"` in the query projection to distinguish contact queries from full profile queries

- **File**: `src/components/BlogFeed.tsx`
- **Change**: Replace `<Link href={href}>` with a non-navigating wrapper (e.g., a `<div>` or `<article>`) since no `/blog/[slug]` route exists. Alternatively, link to `#blog` section anchor.
- **Decision**: Remove the `<Link>` wrapper and use a `<div>` with the same styling. The blog cards become display-only until a blog detail page is created. Keep the card structure for future reactivation.

- **File**: `src/app/studio/[[...tool]]/StudioClient.tsx`
- **Change**: Remove the entire `useEffect` that overrides `console.error`
- **Rationale**: The `disableTransition` warning is a known upstream issue from `next-themes` passing a non-standard prop to the DOM. It doesn't affect functionality and will be fixed upstream. Suppressing console.error masks real errors.
- **Result**: `StudioClient.tsx` becomes simply:
  ```tsx
  "use client";
  import { NextStudio } from "next-sanity/studio";
  import config from "../../../../sanity.config";
  
  export default function StudioClient() {
    return <NextStudio config={config} />;
  }
  ```

**Group 10: Hook Consolidation and Documentation (Requirements 2.13, 2.16)**

- **File**: `src/lib/hooks/useIridescentEffect.ts`
- **Action**: Move to `src/hooks/useIridescentEffect.ts`
- **Update imports** in 4 files:
  - `src/components/three/ProjectsSlider.tsx`
  - `src/components/ContactPanel.tsx`
  - `src/components/sections/HeroContent.tsx`
  - `src/components/sections/SkillsSectionClient.tsx`
- **Change**: `from "@/lib/hooks/useIridescentEffect"` → `from "@/hooks/useIridescentEffect"`
- **Cleanup**: Delete `src/lib/hooks/` directory if empty after move

- **File**: `MEMORY.md`
- **Change**: Fix the file path reference from `[ECC Setup Guide](ecc-setup-guide.md)` to `[ECC Setup Guide](.cursor/MEMORY/ecc-setup-guide.md)`

- **File**: `README.md`
- **Change**: The README has already been updated to describe the real project. Verify it's accurate and remove any remaining stale references. Ensure it covers: project description, tech stack, setup instructions, commands, and deployment notes.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, verify the defects exist on unfixed code (many are structural and can be confirmed by file existence checks), then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Confirm the defects exist BEFORE implementing the fix. This validates our root cause analysis.

**Test Plan**: Run structural checks against the unfixed codebase to confirm each defect condition.

**Test Cases**:
1. **Duplicate proxy check**: Confirm both `proxy.ts` and `src/proxy.ts` exist (will fail on unfixed code — both present)
2. **Duplicate server client check**: Confirm both `server-client.ts` and `serverClients.ts` exist
3. **Nested main check**: Parse `page.tsx` and `PortfolioContent.tsx` to confirm both contain `<main>`
4. **Dead dependency check**: Run `pnpm why framer-motion` to confirm it's installed but only imported in one file
5. **Broken blog link check**: Confirm no `/blog/[slug]` route exists while `BlogFeed.tsx` links to `/blog/${slug}`
6. **Hardcoded year check**: Grep Footer.tsx for literal year string
7. **Console suppression check**: Confirm `StudioClient.tsx` contains `console.error = ` override

**Expected Counterexamples**:
- Both proxy files exist with conflicting route protection logic
- `framer-motion` is in `package.json` but only `ProjectsSlider.tsx` imports it
- DOM would contain `<main><main>` nesting

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed codebase produces the expected behavior.

**Pseudocode:**
```
FOR ALL artifact WHERE isBugCondition(artifact) DO
  result := checkFixedCodebase(artifact)
  ASSERT expectedBehavior(result)
END FOR
```

**Concrete checks:**
- `src/proxy.ts` does not exist
- `src/sanity/lib/serverClients.ts` does not exist
- `server-client.ts` contains `assertValue` and throws on missing token
- No dead files exist in the file system
- `pnpm ls framer-motion` returns empty
- `ProjectsSlider.tsx` imports from `motion/react`
- `page.tsx` does not contain `<main>`
- `CHAT_PROFILE_QUERY` is not exported from queries.ts
- `EducationFlowchart.tsx` does not contain `STATIC_FALLBACKS`
- `Footer.tsx` contains `getFullYear()`
- `BlogFeed.tsx` does not use `<Link>` for blog posts
- `StudioClient.tsx` does not override `console.error`
- `useIridescentEffect.ts` lives in `src/hooks/`
- `MEMORY.md` references `.cursor/MEMORY/ecc-setup-guide.md`

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed codebase produces the same result as the original.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalBehavior(input) = fixedBehavior(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Run the existing test suite on the fixed code and verify all tests pass. Add targeted preservation tests for changed components.

**Test Cases**:
1. **Build preservation**: `pnpm build` completes successfully with no type errors
2. **Test suite preservation**: `pnpm test` passes (update tests that reference deleted files)
3. **Animation preservation**: `ProjectsSlider` renders with `motion/react` imports — same API surface
4. **Auth preservation**: Clerk middleware in root `proxy.ts` still protects routes
5. **Data fetch preservation**: `sanityFetch` with profile queries still returns correct data
6. **Education rendering preservation**: `EducationFlowchart` renders 1-2 real items without crashing
7. **Skills chart preservation**: Chart renders correctly without dead `chart.tsx` file

### Unit Tests

- Test `EducationFlowchart` renders correctly with 0, 1, 2, and 3+ items (no padding)
- Test `Footer` displays current year dynamically
- Test `localContent.ts` query matching distinguishes profile from contact queries
- Test `server-client.ts` throws when `SANITY_SERVER_API_TOKEN` is undefined
- Test `StudioClient` renders without console suppression

### Property-Based Tests

- Generate random education item arrays (0-10 items) and verify `EducationFlowchart` renders exactly that many items without padding
- Generate random query strings and verify `getLocalDataForQuery` returns the correct data type for each
- Generate random dates and verify Footer always shows the current year

### Integration Tests

- Full build succeeds (`pnpm build`) after all changes
- All existing Vitest tests pass after updating imports
- `ProjectsSlider` animation behavior unchanged after `motion/react` migration
- Portfolio sections render in correct order after `<main>` fix
- Sanity Studio loads after `StudioClient` console suppression removal
