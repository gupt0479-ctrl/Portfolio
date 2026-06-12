# Hero UI Polish Fix — Bugfix Design

## Overview

The Hero section of the portfolio suffers from four visual/UX deficiencies: interactive elements lack ambient motion (appearing flat against the cosmic Three.js background), unnecessary badges and status indicators create visual clutter, the terminal component is misplaced inside the About Me section instead of serving as a visual bridge, and the terminal content is outdated. This fix adds subtle floating animations to interactive elements, removes the identified clutter elements, repositions the terminal between Hero and About Me, and updates its content to reflect the current professional identity — all while preserving existing hover effects, navigation, responsiveness, reduced-motion support, keyboard accessibility, and the Three.js background.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the visual deficiency — Hero interactive elements render without floating animation, clutter badges/status are present, terminal is inside AboutSection, and terminal content is outdated
- **Property (P)**: The desired behavior — elements float with cosmic suspended-in-space motion, clutter is removed, terminal bridges Hero→About, content is current
- **Preservation**: Existing hover effects, button navigation, responsiveness, `prefers-reduced-motion` respect, keyboard accessibility, Three.js background rendering, and About Me content integrity must remain unchanged
- **HeroContent**: The client component in `src/components/sections/HeroContent.tsx` that renders the Hero's left column (greeting, headline, CTA buttons, social icons) and right column (profile image)
- **ProfileImage**: The client component in `src/components/sections/ProfileImage.tsx` that renders the profile card with orbit chips and an online status indicator
- **HeroTerminal**: The client component in `src/components/HeroTerminal.tsx` that renders a terminal-style card with command/output lines and orbiting chips
- **PortfolioContent**: The server component in `src/components/PortfolioContent.tsx` that orchestrates section ordering on the page

## Bug Details

### Bug Condition

The bug manifests across four independent conditions that collectively reduce the Hero section's visual polish and spatial cohesion with the Three.js cosmic aesthetic.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type HeroRenderState
  OUTPUT: boolean

  RETURN (input.interactiveElements.animation === "none" AND input.context === "idle")
         OR input.renderedBadges.includes("Next.js")
         OR input.renderedBadges.includes("AI/ML")
         OR input.onlineStatusBar.visible === true
         OR input.technologyLine.visible === true
         OR input.terminal.parentSection === "about"
         OR input.terminal.content !== EXPECTED_TERMINAL_CONTENT
         OR input.aboutMeBoxes.hasCometCard === false
         OR input.terminal.hasCometCard === false
         OR input.terminal.driftAnimation === "none"
         OR input.terminal.promptGlow === false
         OR input.terminal.windowSymbols === false
         OR input.buttons.globalFloatAnimation === false
END FUNCTION
```

### Examples

- **Static buttons**: When the Hero section is idle, the GitHub, LinkedIn, Email social icons and the View Projects, View Experience, Contact CTA buttons sit perfectly still — they should exhibit a subtle continuous floating motion like objects suspended in zero gravity
- **Clutter badges**: Two `orbit-chip` elements ("Next.js" and "AI/ML") render at the top-left of the ProfileImage card, competing for attention with actual content
- **Online status bar**: A green pulsing dot with "Online" text renders at the top-right of the profile image, adding no meaningful value
- **Technology line**: "NEXT.JS • SANITY • 3D • TYPESCRIPT" renders below the `section-kicker`, occupying space without contributing to the narrative
- **Misplaced terminal**: `HeroTerminal` is imported and rendered inside `AboutSection` at the bottom (`mt-10`), rather than serving as a standalone visual transition between Hero and About Me
- **Outdated terminal output**: The `$ whoami` output reads "ai & data systems engineer" and `$ status` reads "shipping → research/agents · ui/ux · data pipelines" — both are stale descriptions
- **Flat About Me boxes**: The bio content block and `<AboutTelemetry>` component render as plain elements with no depth, tilt-on-hover, or holographic glare — they should feel like floating spatial elements
- **Flat terminal card**: The terminal uses `cosmic-card` class but lacks CometCard depth/tilt/glare and has no broader drifting motion — it should float freely in space with a wide figure-8 drift pattern
- **Plain command prompts**: The `$ whoami`, `$ stack --top`, `$ status` prompt lines render as plain `text-cyan-400/70` text with no glow effect — they should have a subtle cyan/violet text-shadow
- **Missing window control symbols**: The title bar dots (red, yellow, green) are plain colored `<span>` circles with no close/minimize/expand symbols inside them
- **Hero-only float animation**: The `cosmic-float` class is only applied manually to Hero section buttons — all `.float-btn` elements across the entire portfolio should receive the floating animation globally via CSS

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Mouse/touch hover effects on Hero buttons (scale, glow, color shifts via `float-btn` class and `IridCTA` iridescent effect) must continue to work exactly as before
- CTA button navigation must continue to scroll to the correct sections (`#projects`, `#experience`, `#contact`)
- Social icon links must continue to navigate to correct external URLs (GitHub, LinkedIn, Twitter/X, Website, Email)
- Hero section layout must remain responsive at all viewport widths (mobile stacks, desktop grid)
- `prefers-reduced-motion` must disable or minimize the new floating animations
- Keyboard focus and tab order must remain functional for all interactive elements
- Three.js `ObsidianBackground` must continue to render behind Hero and terminal without visual conflicts
- About Me section must render its content correctly regardless of terminal being removed from it
- Spacing/layout must remain balanced after removing badges, status bar, and technology line (no awkward whitespace gaps)

**Scope:**
All inputs that do NOT involve the specific render conditions above should be completely unaffected by this fix. This includes:
- All sections below Hero and About Me
- Portfolio Lab sidebar behavior
- Header/navigation scrolling behavior
- All Sanity CMS data fetching and rendering
- Build/type safety

## Hypothesized Root Cause

Based on the bug description, the issues are straightforward implementation gaps rather than logic errors:

1. **No Floating Animation Defined**: The interactive elements use `float-btn` class for hover effects but have no idle-state animation. A CSS `@keyframes` animation with subtle Y-axis oscillation and opacity variation needs to be added to these elements while respecting `prefers-reduced-motion`.

2. **Clutter Elements Explicitly Rendered**: The `ORBIT_CHIPS` array in `ProfileImage.tsx` explicitly renders "Next.js" and "AI/ML" badges. The technology line in `HeroContent.tsx` explicitly renders the "NEXT.JS • SANITY • 3D • TYPESCRIPT" text. The online status bar is an explicit `<div>` block in `ProfileImage.tsx`. These simply need to be removed.

3. **Terminal Misplacement**: `HeroTerminal` is imported and rendered inside `AboutSection.tsx` at the bottom. It needs to be moved to `PortfolioContent.tsx` as a standalone element between `<HeroSection />` and `<AboutSection />`.

4. **Outdated Terminal Content**: The `TERMINAL_LINES` constant in `HeroTerminal.tsx` contains stale professional descriptions. The content needs to be updated to the specified values.

5. **No CometCard on About Me Boxes**: The `AboutSection` renders its bio content and `<AboutTelemetry>` directly without wrapping them in `<CometCard>`. Adding a CometCard wrapper with `variant="subtle"` gives them depth and spatial presence.

6. **No CometCard or Drift on Terminal**: The terminal uses the plain `cosmic-card` CSS class but is not wrapped in the `<CometCard>` component that provides tilt-on-hover and holographic glare. Additionally, no broad drift animation exists — only subtle Y-axis oscillation was planned. A wider figure-8/lissajous drift keyframe needs to be defined.

7. **No Prompt Glow**: The terminal prompt elements (`<p className="text-cyan-400/70">`) have no `text-shadow` property. A `.terminal-glow` CSS class with cyan/violet glow needs to be created and applied.

8. **Plain Window Dots**: The title bar dots are empty `<span>` elements with colored backgrounds. They need text content (×, −, ⬜) styled at ~7px centered within each dot.

9. **Float Animation Not Global**: The current plan adds `cosmic-float` class individually to Hero elements. Instead, the `@keyframes cosmic-float` animation should be applied directly to the `.float-btn` selector in globals.css, making it automatic for ALL buttons portfolio-wide that use `float-btn`.

## Correctness Properties

Property 1: Bug Condition - Floating Animation Applied to Interactive Elements

_For any_ Hero render state where the section is idle (no active hover/focus interaction), the interactive elements (social icon buttons, CTA buttons, profile card) SHALL exhibit a continuous subtle floating animation with vertical oscillation creating a suspended-in-space appearance, AND this animation SHALL be disabled when `prefers-reduced-motion: reduce` is active.

**Validates: Requirements 2.1**

Property 2: Bug Condition - Clutter Elements Removed

_For any_ Hero render state, the "Next.js" badge, "AI/ML" badge, online status bar, and "NEXT.JS • SANITY • 3D • TYPESCRIPT" technology line SHALL NOT be present in the rendered DOM.

**Validates: Requirements 2.2, 2.3, 2.4, 2.5**

Property 3: Bug Condition - Terminal Positioned as Bridge

_For any_ page render, the terminal component SHALL appear in the DOM after the Hero section and before the About Me section, horizontally centered, acting as a visual bridge/transition element.

**Validates: Requirements 2.6**

Property 4: Bug Condition - Terminal Content Updated

_For any_ terminal render, the terminal SHALL display exactly: `$ whoami` → "anant.gupta — AI Engineer & Agentic Systems Builder", `$ stack --top` → "rust · typescript · python · postgres · agents", `$ status` → "shipping → agentic systems · research · product engineering · ui/ux".

**Validates: Requirements 2.7**

Property 5: Preservation - Hover Effects and Navigation Unchanged

_For any_ user interaction with Hero interactive elements (hover, click, tap, keyboard), the system SHALL produce the same hover effects (scale, glow, iridescent color shifts) and navigation behavior (correct link destinations) as the original code, preserving all existing interactivity.

**Validates: Requirements 3.1, 3.2, 3.8**

Property 6: Preservation - Responsiveness and Accessibility Unchanged

_For any_ viewport width or user preference configuration, the Hero section layout SHALL remain responsive and readable, SHALL continue to respect `prefers-reduced-motion`, and SHALL maintain keyboard focusability and operability for all interactive elements.

**Validates: Requirements 3.3, 3.4, 3.6**

Property 7: Preservation - Three.js Background and About Me Unaffected

_For any_ page render after the fix, the Three.js `ObsidianBackground` SHALL continue to display correctly behind Hero and terminal, and the About Me section SHALL render its content correctly without the terminal (no layout breakage).

**Validates: Requirements 3.5, 3.7**

Property 8: Bug Condition - About Me Boxes Have CometCard Depth

_For any_ About Me section render, the bio content block and the `<AboutTelemetry>` component SHALL each be wrapped in a `<CometCard variant="subtle" rotateDepth={4} translateDepth={6}>` providing tilt-on-hover depth and holographic glare, AND the wrapped content SHALL remain fully readable with no visual conflicts from the tilt/glare effect.

**Validates: Requirements 2.8, 3.9**

Property 9: Bug Condition - Terminal Has CometCard and Broad Drift

_For any_ terminal render, the terminal SHALL be wrapped in a `<CometCard variant="dark" rotateDepth={5} translateDepth={8}>` providing tilt-on-hover depth AND SHALL exhibit a broad continuous drifting animation (approximately 40-60px horizontal and vertical movement in a figure-8/lissajous pattern over 15-20s), remaining fully readable and within bounds at all points in the drift cycle, AND the drift SHALL be disabled when `prefers-reduced-motion: reduce` is active.

**Validates: Requirements 2.9, 3.10**

Property 10: Bug Condition - Terminal Prompts Have Glow

_For any_ terminal render, the command prompt lines (`$ whoami`, `$ stack --top`, `$ status`) SHALL have a subtle cyan/violet text-shadow glow effect (`text-shadow: 0 0 6px rgba(103, 232, 249, 0.5), 0 0 12px rgba(167, 139, 250, 0.3)`), making them visually distinct from the output text and creating a terminal-authentic aesthetic.

**Validates: Requirements 2.10**

Property 11: Bug Condition - Terminal Dots Have Window Symbols

_For any_ terminal title bar render, the three colored dots SHALL display proper window control symbols: red dot shows "×" (close), yellow dot shows "−" (minimize), green dot shows "⬜" (expand). These symbols SHALL be decorative only (aria-hidden), styled at approximately 7px font-size, centered within each dot, with white/semi-transparent text color.

**Validates: Requirements 2.11**

Property 12: Bug Condition - All .float-btn Elements Have cosmic-float Globally

_For any_ page render across ALL portfolio sections, every element with the `.float-btn` class SHALL automatically receive the `cosmic-float` floating animation via CSS (applied directly to the `.float-btn` selector in globals.css), with staggered delays via `--float-delay` custom property support, AND this animation SHALL be disabled when `prefers-reduced-motion: reduce` is active, AND existing click/tap/hover behavior SHALL continue to work correctly.

**Validates: Requirements 2.12, 3.11**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `src/app/globals.css`

**Change**: Add floating keyframe animation, drift keyframe, terminal glow, and global float-btn animation

**Specific Changes**:
1. **Add `@keyframes cosmic-float`**: Define a subtle keyframe animation with Y-axis translation (~3-4px) and slight opacity variation over 4-6s with `ease-in-out` timing
2. **Apply `cosmic-float` directly to `.float-btn` selector**: Instead of a separate utility class, add `animation: cosmic-float 5s ease-in-out infinite` and `animation-delay: var(--float-delay, 0ms)` to the `.float-btn` rule itself. This automatically applies the floating animation to ALL buttons across all portfolio sections that use the `float-btn` class
3. **Ensure hover compatibility**: Use `animation-play-state: paused` on `.float-btn:hover` or blend the hover transform smoothly with the animation so hover effects (scale, perspective tilt) don't fight with the keyframe
4. **Add `@keyframes cosmic-drift`**: Define a broader multi-point keyframe (6-8 waypoints) that moves the terminal in a figure-8/lissajous-like pattern over 18s, spanning ~40-60px in both X and Y directions. Example waypoints: `0% { translate: 0 0 }`, `25% { translate: 45px -30px }`, `50% { translate: -20px 40px }`, `75% { translate: -40px -25px }`, `100% { translate: 0 0 }`
5. **Add `.cosmic-drift` utility class**: Apply `animation: cosmic-drift 18s ease-in-out infinite`
6. **Add `.terminal-glow` class**: Apply `text-shadow: 0 0 6px rgba(103, 232, 249, 0.5), 0 0 12px rgba(167, 139, 250, 0.3)` for the cyan/violet prompt glow
7. **Add `@media (prefers-reduced-motion: reduce)` overrides**: Disable `cosmic-float` on `.float-btn`, disable `.cosmic-drift`, within the existing reduced-motion media query block

---

**File**: `src/components/sections/HeroContent.tsx`

**Function**: `HeroContent`

**Specific Changes**:
1. **Remove technology line**: Delete the `<motion.p>` block that renders "NEXT.JS • SANITY • 3D • TYPESCRIPT"
2. **No manual `cosmic-float` class needed on buttons**: Since `cosmic-float` is now applied globally via the `.float-btn` CSS selector, CTA buttons and social icons already get the animation automatically through their existing `float-btn` class. Staggered delays can be set via inline `style={{ '--float-delay': 'Xms' } as React.CSSProperties}` on individual elements if desired
3. **Add `cosmic-float` class to profile image container**: Apply floating animation to the `<motion.div>` wrapping the `ProfileImage` component (this element uses `float-btn` already, so it gets it automatically — or add the class if it doesn't)

---

**File**: `src/components/sections/ProfileImage.tsx`

**Function**: `ProfileImage`

**Specific Changes**:
1. **Remove `ORBIT_CHIPS` array and rendering block**: Delete the `ORBIT_CHIPS` constant and the `<div className="absolute -top-3 -left-3 ...">` block that renders the "Next.js" and "AI/ML" badges
2. **Remove online status bar**: Delete the `<div className="absolute top-4 right-4 ...">` block that renders the green dot and "Online" text

---

**File**: `src/components/HeroTerminal.tsx`

**Function**: `HeroTerminal`

**Specific Changes**:
1. **Update `TERMINAL_LINES` content**: Change the output values:
   - `$ whoami` → `"anant.gupta — AI Engineer & Agentic Systems Builder"`
   - `$ stack --top` → `"rust · typescript · python · postgres · agents"`
   - `$ status` → `"shipping → agentic systems · research · product engineering · ui/ux"`
2. **Remove `ORBITING_CHIPS`**: Delete the `ORBITING_CHIPS` array and the orbiting chips render block (these are clutter similar to the profile chips)
3. **Wrap terminal in `<CometCard variant="dark" rotateDepth={5} translateDepth={8}>`**: Import `CometCard` from `@/components/ui/comet-card` and wrap the entire terminal `<div className="cosmic-card ...">` inside it for tilt-on-hover depth and holographic glare
4. **Add `cosmic-drift` class to outer wrapper**: Apply the broad drift animation to the outermost `<motion.div>` so the entire terminal floats in a wide figure-8 pattern
5. **Add `terminal-glow` class to prompt elements**: Apply the `.terminal-glow` CSS class to the `<p className="text-cyan-400/70">` elements that render `$ whoami`, `$ stack --top`, `$ status`
6. **Add window control symbols to title bar dots**: Replace the empty `<span>` dots with spans containing centered symbols:
   - Red dot: `<span className="..." aria-hidden="true">×</span>`
   - Yellow dot: `<span className="..." aria-hidden="true">−</span>`
   - Green dot: `<span className="..." aria-hidden="true">⬜</span>`
   - Style: `text-[7px] leading-none text-white/60 flex items-center justify-center` within each dot
7. **Add centering wrapper styling**: Ensure the terminal renders with horizontal centering when placed as a standalone bridge element

---

**File**: `src/components/sections/AboutSection.tsx`

**Function**: `AboutSection`

**Specific Changes**:
1. **Remove `HeroTerminal` import**: Delete `import { HeroTerminal } from "@/components/HeroTerminal"`
2. **Remove terminal render block**: Delete the `<div className="mt-10 flex justify-center"><HeroTerminal /></div>` block
3. **Import `CometCard`**: Add `import { CometCard } from "@/components/ui/comet-card"` (CometCard is a client component but can be rendered in server component JSX — React Server Components can compose client components as children)
4. **Wrap bio content block in CometCard**: Wrap the `<div className="prose prose-lg dark:prose-invert max-w-none">` block with `<CometCard variant="subtle" rotateDepth={4} translateDepth={6}>` and add appropriate padding (`p-6`) to the inner content
5. **Wrap AboutTelemetry in CometCard**: Wrap the `<AboutTelemetry stats={profile.stats} />` component with `<CometCard variant="subtle" rotateDepth={4} translateDepth={6}>` and add a margin-top for spacing

---

**File**: `src/components/PortfolioContent.tsx`

**Function**: `PortfolioContent`

**Specific Changes**:
1. **Import `HeroTerminal`**: Add `import { HeroTerminal } from "@/components/HeroTerminal"`
2. **Insert terminal between Hero and About Me**: Add a centered wrapper `<div className="relative z-10 flex justify-center py-8">` containing `<HeroTerminal />` between `<HeroSection />` and `<AboutSection />`

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that check for the presence of clutter elements, absence of floating animation classes, terminal content values, and terminal placement within the DOM tree. Run these tests on the UNFIXED code to observe failures.

**Test Cases**:
1. **Static Elements Test**: Assert that Hero interactive elements lack any `cosmic-float` class (will pass on unfixed code, confirming absence)
2. **Clutter Badge Test**: Assert that "Next.js" and "AI/ML" orbit-chips render inside ProfileImage (will pass on unfixed code, confirming clutter)
3. **Online Status Bar Test**: Assert that "Online" status element is present in ProfileImage (will pass on unfixed code, confirming clutter)
4. **Technology Line Test**: Assert that "NEXT.JS • SANITY • 3D • TYPESCRIPT" is rendered (will pass on unfixed code, confirming clutter)
5. **Terminal Placement Test**: Assert that HeroTerminal is rendered inside AboutSection (will pass on unfixed code, confirming misplacement)
6. **Terminal Content Test**: Assert terminal shows outdated content (will pass on unfixed code, confirming stale data)
7. **About Me No CometCard Test**: Assert that bio/telemetry blocks have no CometCard wrapper (will pass on unfixed code, confirming flat appearance)
8. **Terminal No CometCard Test**: Assert that terminal uses plain `cosmic-card` class with no CometCard wrapper (will pass on unfixed code)
9. **Terminal No Drift Test**: Assert that terminal has no `cosmic-drift` class or broad motion keyframe (will pass on unfixed code)
10. **Terminal No Glow Test**: Assert that prompt elements lack `terminal-glow` class (will pass on unfixed code)
11. **Terminal No Window Symbols Test**: Assert that title bar dots contain no text/symbols (will pass on unfixed code)
12. **Non-Global Float Animation Test**: Assert that `.float-btn` elements outside Hero section have no cosmic-float animation (will pass on unfixed code, confirming the animation is not global)

**Expected Counterexamples**:
- Interactive elements have no idle-state animation applied
- Clutter elements are present in the render tree
- Terminal is nested within the About Me section rather than between Hero and About Me
- About Me boxes render flat with no depth/tilt effect
- Terminal has no CometCard or broad drift motion
- Terminal prompts have no glow
- Title bar dots are plain circles with no symbols
- Buttons outside Hero have no floating animation

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := renderHeroFixed(input)
  ASSERT interactiveElements(result).every(el => el.hasClass("cosmic-float"))
  ASSERT NOT result.contains("Next.js" orbit-chip)
  ASSERT NOT result.contains("AI/ML" orbit-chip)
  ASSERT NOT result.contains(onlineStatusBar)
  ASSERT NOT result.contains(technologyLine)
  ASSERT terminal(result).parentElement === bridgeContainer
  ASSERT terminal(result).content === EXPECTED_CONTENT
  ASSERT aboutMeBio(result).parentElement.is(CometCard)
  ASSERT aboutTelemetry(result).parentElement.is(CometCard)
  ASSERT terminal(result).wrappedIn(CometCard variant="dark")
  ASSERT terminal(result).hasClass("cosmic-drift")
  ASSERT terminal(result).prompts.every(p => p.hasClass("terminal-glow"))
  ASSERT terminal(result).dots.red.textContent === "×"
  ASSERT terminal(result).dots.yellow.textContent === "−"
  ASSERT terminal(result).dots.green.textContent === "⬜"
  ASSERT allFloatBtns(result).every(el => computedStyle(el).animation.includes("cosmic-float"))
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT renderOriginal(input).hoverEffects === renderFixed(input).hoverEffects
  ASSERT renderOriginal(input).navigationTargets === renderFixed(input).navigationTargets
  ASSERT renderOriginal(input).responsiveLayout === renderFixed(input).responsiveLayout
  ASSERT renderOriginal(input).keyboardAccess === renderFixed(input).keyboardAccess
  ASSERT renderOriginal(input).threeJsBackground === renderFixed(input).threeJsBackground
  ASSERT renderOriginal(input).aboutMeContent === renderFixed(input).aboutMeContent
  ASSERT aboutMeBioText(renderFixed(input)).isReadable === true
  ASSERT terminalText(renderFixed(input)).isReadableAtAllDriftPoints === true
  ASSERT allFloatBtns(renderFixed(input)).clickBehavior === allFloatBtns(renderOriginal(input)).clickBehavior
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many viewport/interaction combinations automatically
- It catches regressions in hover effects or navigation that manual tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for hover effects, button navigation, and responsive layout, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Hover Effect Preservation**: Verify that `float-btn` class elements continue to apply hover styles (scale, glow)
2. **Navigation Preservation**: Verify CTA buttons link to correct `#` anchors and social icons link to correct external URLs
3. **Responsive Layout Preservation**: Verify grid layout switches from 2-column to 1-column at mobile breakpoints
4. **Keyboard Access Preservation**: Verify all interactive elements remain focusable and operable via Tab/Enter
5. **Reduced Motion Preservation**: Verify `prefers-reduced-motion: reduce` disables the new floating animation, drift animation, and respects existing motion-reduced behaviors
6. **About Me Content Preservation**: Verify About Me section renders bio, stats, and telemetry correctly without terminal
7. **About Me CometCard Readability**: Verify bio text remains fully readable after CometCard wrapping — no text clipping, overflow, or contrast issues from the tilt/glare overlay
8. **Terminal Drift Bounds Preservation**: Verify terminal remains within viewport bounds at all drift animation positions and does not overlap Hero or About Me section content
9. **Global Float-btn Click Preservation**: Verify that buttons in Experience, Projects, Skills, and other sections continue to navigate/operate correctly with the cosmic-float animation active

### Unit Tests

- Test HeroTerminal renders updated content (`$ whoami`, `$ stack --top`, `$ status` with new outputs)
- Test ProfileImage renders without orbit chips and without online status bar
- Test HeroContent renders without technology line
- Test floating animation class is applied to interactive elements
- Test floating animation respects `prefers-reduced-motion`
- Test HeroTerminal is wrapped in CometCard with variant="dark"
- Test HeroTerminal has `cosmic-drift` class on outer wrapper
- Test HeroTerminal prompt elements have `terminal-glow` class
- Test HeroTerminal title bar dots contain window control symbols (×, −, ⬜) with aria-hidden
- Test AboutSection bio block is wrapped in CometCard with variant="subtle"
- Test AboutSection telemetry is wrapped in CometCard with variant="subtle"
- Test `.float-btn` CSS rule includes `cosmic-float` animation (via computed style or class assertion)
- Test `.terminal-glow` class applies correct text-shadow values

### Property-Based Tests

- Generate random profile data and verify Hero renders without clutter elements regardless of content
- Generate random viewport widths and verify responsive layout maintains readability
- Test that all CTA button `href` values point to valid section anchors across many render scenarios
- Generate random terminal drift animation positions (0-100% keyframe progress) and verify terminal bounding box stays within parent container bounds
- Generate random stats arrays for AboutTelemetry and verify CometCard wrapping doesn't break layout regardless of content length
- Generate random sets of `.float-btn` elements across multiple sections and verify all receive the cosmic-float animation with no manual class additions needed

### Integration Tests

- Test full page render order: Hero → Terminal Bridge → About Me (DOM order assertion)
- Test that removing terminal from AboutSection doesn't break About's layout or spacing
- Test that floating animations don't conflict with Three.js background rendering
- Test visual output at mobile (375px), tablet (768px), and desktop (1280px) widths
- Test terminal CometCard tilt-on-hover works correctly when combined with cosmic-drift animation
- Test About Me CometCard tilt-on-hover doesn't interfere with PortableText content rendering or link interactivity
- Test window control symbols render correctly across different browser fonts/platforms
- Test that cosmic-float on `.float-btn` doesn't cause cumulative layout shift (CLS) issues
- Test that cosmic-drift animation pauses correctly when `prefers-reduced-motion` is enabled
