# Implementation Plan

## Overview

Fix Hero section UI polish deficiencies: add global floating animations to all .float-btn elements, remove visual clutter (badges, status bar, tech line), reposition terminal as a bridge between Hero and About Me with CometCard depth + broad drift animation, update terminal content with glow and window symbols, and wrap About Me boxes in CometCard. Uses bug condition methodology with exploration tests before fix, preservation tests to prevent regressions, and verification after implementation.

## Tasks

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Hero UI Polish Deficiencies
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the 12 bug conditions exist
  - **Scoped PBT Approach**: For each deterministic bug condition, write focused assertions that confirm the deficiency
  - Test file: `src/components/__tests__/hero-ui-polish-bug-condition.test.tsx`
  - Test that `.float-btn` CSS selector in globals.css does NOT include `cosmic-float` animation (confirms 1.1, 1.12)
  - Test that `ProfileImage` renders "Next.js" and "AI/ML" orbit chips (confirms 1.2, 1.3)
  - Test that `ProfileImage` renders online status bar with "Online" text (confirms 1.4)
  - Test that `HeroContent` renders "NEXT.JS • SANITY • 3D • TYPESCRIPT" technology line (confirms 1.5)
  - Test that `HeroTerminal` is imported and rendered inside `AboutSection` (confirms 1.6)
  - Test that `HeroTerminal` displays outdated content "ai & data systems engineer" (confirms 1.7)
  - Test that `AboutSection` bio and telemetry are NOT wrapped in CometCard (confirms 1.8)
  - Test that `HeroTerminal` uses plain `cosmic-card` class with no CometCard wrapper (confirms 1.9)
  - Test that terminal prompt elements lack `terminal-glow` class (confirms 1.10)
  - Test that terminal title bar dots contain no text symbols (confirms 1.11)
  - Test that `globals.css` `.float-btn` rule has no `animation` property referencing `cosmic-float` (confirms 1.12)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bugs exist)
  - Document counterexamples found to understand root cause
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 1.12_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Behavior Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Test file: `src/components/__tests__/hero-ui-polish-preservation.test.tsx`
  - Observe: `float-btn` class has hover styles (scale, glow, transform) on unfixed code (3.1)
  - Observe: CTA buttons have correct href attributes (`#projects`, `#experience`, `#contact`) on unfixed code (3.2)
  - Observe: Social icons have correct external URL patterns on unfixed code (3.2)
  - Observe: Hero section uses responsive grid (`grid-cols-1 lg:grid-cols-2`) on unfixed code (3.3)
  - Observe: globals.css has `prefers-reduced-motion` media query on unfixed code (3.4)
  - Observe: About section renders bio and telemetry content correctly on unfixed code (3.5)
  - Observe: No awkward gaps - content has proper spacing classes on unfixed code (3.6)
  - Observe: ObsidianBackground renders in fixed position behind content on unfixed code (3.7)
  - Observe: All interactive elements have proper `a` or `button` semantics for keyboard access on unfixed code (3.8)
  - Write property-based test: for all CTA buttons, href values match valid section anchors (3.2)
  - Write property-based test: for all social links, href values are valid URLs or mailto links (3.2)
  - Write property-based test: `float-btn` class includes hover transform rules in CSS (3.1)
  - Write property-based test: responsive grid classes remain on Hero section (3.3)
  - Write property-based test: `prefers-reduced-motion` media query exists and disables animations (3.4)
  - Write property-based test: About section renders without terminal dependency (3.5)
  - Write property-based test: interactive elements use `<a>` or `<button>` with accessible attributes (3.8)
  - Write property-based test: CometCard with variant="subtle" does not break text readability (no overflow/clip issues) (3.9)
  - Write property-based test: terminal drift animation stays within reasonable bounds (40-60px range does not exceed container) (3.10)
  - Write property-based test: float-btn elements retain click/navigation behavior regardless of animation (3.11)
  - Verify test passes on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11_

- [x] 3. Implement the hero UI polish fix

  - [x] 3.1 Update `src/app/globals.css` — Add cosmic-float keyframe, cosmic-drift keyframe, terminal-glow class, and reduced-motion overrides
    - Add `@keyframes cosmic-float` with subtle Y-axis translation (~3-4px) and slight opacity variation over 5s ease-in-out infinite
    - Apply `animation: cosmic-float 5s ease-in-out infinite` and `animation-delay: var(--float-delay, 0ms)` directly to the `.float-btn` selector (makes it global across ALL portfolio sections)
    - Ensure `.float-btn:hover` pauses or smoothly blends animation (`animation-play-state: paused` or transform override)
    - Add `@keyframes cosmic-drift` with figure-8/lissajous pattern: 6-8 waypoints spanning ~40-60px in X and Y over 18s
    - Add `.cosmic-drift` utility class applying `animation: cosmic-drift 18s ease-in-out infinite`
    - Add `.terminal-glow` class with `text-shadow: 0 0 6px rgba(103, 232, 249, 0.5), 0 0 12px rgba(167, 139, 250, 0.3)`
    - Add `prefers-reduced-motion: reduce` overrides to disable cosmic-float on `.float-btn`, disable `.cosmic-drift` animation
    - _Bug_Condition: input.interactiveElements.animation === "none" AND input.buttons.globalFloatAnimation === false AND input.terminal.driftAnimation === "none" AND input.terminal.promptGlow === false_
    - _Expected_Behavior: All .float-btn elements animate with cosmic-float globally, terminal drifts with cosmic-drift, prompts glow with terminal-glow_
    - _Preservation: Existing hover effects (scale, glow, transform) on .float-btn must continue to work; prefers-reduced-motion must disable new animations_
    - _Requirements: 2.1, 2.9, 2.10, 2.12, 3.1, 3.4, 3.11_

  - [x] 3.2 Update `src/components/sections/HeroContent.tsx` — Remove tech line, add staggered float delays
    - Delete the `<motion.p>` block rendering "NEXT.JS • SANITY • 3D • TYPESCRIPT" (the one with `text-xs font-medium tracking-[0.2em] text-white/60`)
    - Optionally add `style={{ '--float-delay': 'Xms' } as React.CSSProperties}` on CTA button wrappers and social icon links for staggered animation (e.g., 0ms, 200ms, 400ms)
    - No need to add `cosmic-float` class manually — buttons already use `float-btn` which gets the animation globally from CSS
    - _Bug_Condition: input.technologyLine.visible === true_
    - _Expected_Behavior: Technology line is removed, elements float with staggered delays_
    - _Preservation: Layout spacing remains balanced after removal (no awkward whitespace gaps); responsive grid intact_
    - _Requirements: 2.5, 3.3, 3.6_

  - [x] 3.3 Update `src/components/sections/ProfileImage.tsx` — Remove orbit chips and online status bar
    - Delete the `ORBIT_CHIPS` constant array
    - Delete the `<div className="absolute -top-3 -left-3 z-10 flex gap-1.5">` block that renders orbit chips
    - Delete the `<div className="absolute top-4 right-4 flex items-center gap-2 ...">` block that renders the availability/online status indicator
    - _Bug_Condition: input.renderedBadges.includes("Next.js") OR input.renderedBadges.includes("AI/ML") OR input.onlineStatusBar.visible === true_
    - _Expected_Behavior: No orbit chips or online status bar rendered_
    - _Preservation: Profile image button, hover overlay, sidebar toggle behavior unchanged_
    - _Requirements: 2.2, 2.3, 2.4, 3.6_

  - [x] 3.4 Update `src/components/HeroTerminal.tsx` — Update content, remove orbiting chips, wrap in CometCard, add drift, glow, and window symbols
    - Update `TERMINAL_LINES` content:
      - `$ whoami` → `"anant.gupta — AI Engineer & Agentic Systems Builder"`
      - `$ stack --top` → `"rust · typescript · python · postgres · agents"`
      - `$ status` → `"shipping → agentic systems · research · product engineering · ui/ux"`
    - Delete `ORBITING_CHIPS` array and its render block (`<div className="absolute -top-3 -right-3 ...">`)
    - Import `CometCard` from `@/components/ui/comet-card`
    - Wrap the terminal `<div className="cosmic-card ...">` inside `<CometCard variant="dark" rotateDepth={5} translateDepth={8}>`
    - Add `cosmic-drift` class to the outermost `<motion.div>` for broad floating/drifting motion
    - Add `terminal-glow` class to prompt `<p>` elements (the ones rendering `$ whoami`, `$ stack --top`, `$ status`)
    - Replace empty title bar dot `<span>` elements with window control symbols:
      - Red dot: add `×` text content, style with `text-[7px] leading-none text-white/60 flex items-center justify-center`, add `aria-hidden="true"`
      - Yellow dot: add `−` text content, same styling, add `aria-hidden="true"`
      - Green dot: add `⬜` text content, same styling, add `aria-hidden="true"`
    - Add centering and max-width styling for standalone bridge placement
    - _Bug_Condition: input.terminal.content !== EXPECTED_TERMINAL_CONTENT OR input.terminal.hasCometCard === false OR input.terminal.driftAnimation === "none" OR input.terminal.promptGlow === false OR input.terminal.windowSymbols === false_
    - _Expected_Behavior: Terminal displays updated content, wrapped in CometCard dark, drifts broadly, prompts glow, dots have symbols_
    - _Preservation: Terminal readability maintained at all drift positions; Three.js background unaffected_
    - _Requirements: 2.7, 2.9, 2.10, 2.11, 3.7, 3.10_

  - [x] 3.5 Update `src/components/sections/AboutSection.tsx` — Remove terminal, wrap bio and telemetry in CometCard
    - Remove `import { HeroTerminal } from "@/components/HeroTerminal"`
    - Remove the `<div className="mt-10 flex justify-center"><HeroTerminal /></div>` block
    - Add `import { CometCard } from "@/components/ui/comet-card"`
    - Wrap the `<div className="prose prose-lg dark:prose-invert max-w-none">` bio block with `<CometCard variant="subtle" rotateDepth={4} translateDepth={6}>` and add `p-6` padding to inner content
    - Wrap the `<AboutTelemetry stats={profile.stats} />` component with `<CometCard variant="subtle" rotateDepth={4} translateDepth={6}>` with appropriate margin-top spacing
    - _Bug_Condition: input.terminal.parentSection === "about" OR input.aboutMeBoxes.hasCometCard === false_
    - _Expected_Behavior: Terminal removed from About, bio and telemetry each wrapped in CometCard subtle with depth/tilt/glare_
    - _Preservation: About section content renders correctly without terminal; bio text readability, stats display, telemetry rendering preserved with no visual conflicts from tilt/glare_
    - _Requirements: 2.6, 2.8, 3.5, 3.9_

  - [x] 3.6 Update `src/components/PortfolioContent.tsx` — Insert terminal as bridge between Hero and About
    - Add `import { HeroTerminal } from "@/components/HeroTerminal"`
    - Insert a centered wrapper between `<HeroSection />` and `<AboutSection />`:
      ```tsx
      <div className="relative z-10 flex justify-center py-8">
        <HeroTerminal />
      </div>
      ```
    - _Bug_Condition: input.terminal.parentSection !== "bridge" (terminal is not positioned between Hero and About)_
    - _Expected_Behavior: Terminal appears in DOM after Hero and before About Me, horizontally centered, acting as visual bridge_
    - _Preservation: Section ordering and spacing unchanged for all other sections; Three.js background visible behind terminal_
    - _Requirements: 2.6, 3.5, 3.7_

  - [x] 3.7 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Hero UI Polish Deficiencies Fixed
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms all 12 bug conditions are fixed)
    - Verify: `.float-btn` in CSS has cosmic-float animation (2.1, 2.12)
    - Verify: No orbit chips "Next.js" or "AI/ML" rendered (2.2, 2.3)
    - Verify: No online status bar rendered (2.4)
    - Verify: No technology line rendered (2.5)
    - Verify: Terminal is in bridge position between Hero and About (2.6)
    - Verify: Terminal content is updated (2.7)
    - Verify: About Me boxes wrapped in CometCard (2.8)
    - Verify: Terminal wrapped in CometCard with drift (2.9)
    - Verify: Terminal prompts have glow (2.10)
    - Verify: Terminal dots have window symbols (2.11)
    - Verify: All float-btn elements get cosmic-float globally (2.12)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12_

  - [x] 3.8 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Behavior Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm: Hover effects on float-btn preserved (3.1)
    - Confirm: Button navigation and social link destinations intact (3.2)
    - Confirm: Responsive layout preserved (3.3)
    - Confirm: prefers-reduced-motion respected for new animations (3.4)
    - Confirm: About section content renders correctly post-terminal-removal (3.5)
    - Confirm: No awkward spacing gaps from removed elements (3.6)
    - Confirm: Three.js background renders correctly (3.7)
    - Confirm: Keyboard accessibility maintained (3.8)
    - Confirm: CometCard on About Me boxes doesn't break readability (3.9)
    - Confirm: Terminal drift stays within bounds (3.10)
    - Confirm: Global float-btn click behavior unaffected (3.11)

- [x] 4. Checkpoint - Ensure all tests pass
  - Run `pnpm test` to ensure all tests pass (both exploration and preservation)
  - Run `pnpm typecheck` to ensure no type errors
  - Run `pnpm lint` to ensure Biome compliance (no semicolons, proper formatting)
  - Run `pnpm build` to ensure production build succeeds
  - Manual QA checklist:
    - Verify floating animation visible on buttons at idle state across all sections
    - Verify hover still works (scale, glow, iridescent effect)
    - Verify terminal drifts in broad figure-8 pattern
    - Verify terminal prompts have cyan/violet glow
    - Verify terminal dots show ×, −, ⬜ symbols
    - Verify About Me cards have tilt-on-hover depth
    - Verify no orbit chips, status bar, or tech line visible
    - Verify layout at mobile (375px) and desktop (1280px)
    - Verify prefers-reduced-motion disables all new animations
    - Test keyboard navigation (Tab through buttons)
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Test files should be created under `src/components/__tests__/` following existing project conventions
- Use Vitest with jsdom environment (already configured in `vitest.config.ts`)
- No semicolons in code (Biome enforced)
- Use `pnpm test` for running tests, `pnpm typecheck` for type checking
- The `cosmic-float` animation is applied directly to `.float-btn` selector in globals.css — NOT as a separate class to add to individual elements. This makes it global across all portfolio sections automatically.
- The `cosmic-drift` class provides a broader figure-8 motion (40-60px range, 18s cycle) specifically for the terminal bridge element
- CometCard can be imported and rendered in server component JSX (React Server Components can compose client components as children)
- Terminal bridge positioning must not conflict with Three.js `ObsidianBackground` z-index layering
- Window control symbols (×, −, ⬜) are decorative only — no click behavior, use `aria-hidden="true"`
- The `.terminal-glow` class provides cyan/violet text-shadow for terminal prompt aesthetics
