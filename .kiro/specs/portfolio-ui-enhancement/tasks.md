# Implementation Plan: Portfolio UI Enhancement

## Overview

Transform the portfolio from a functional but visually basic site into a premium cosmic command-center aesthetic. Implementation follows the 7-phase design structure: Foundation → First Impression → Core Sections → Interaction Sections → Supporting Sections → Portfolio Lab → Verification. Each phase leaves the site in a buildable, visually coherent state.

## Tasks

- [x] 1. Foundation — Global Design System & CometCard
  - [x] 1.1 Add cosmic CSS custom properties and utility classes to globals.css
    - Add `.dark` block CSS custom properties: `--cosmic-violet`, `--cosmic-cyan`, `--cosmic-green`, `--cosmic-surface`, `--cosmic-surface-dark`, `--cosmic-border`, `--cosmic-glow`
    - Add `.cosmic-card` class with dark translucent gradient background (opacity 0.72–0.82), violet/cyan border glow, inner highlight, 16px backdrop blur
    - Add `.cosmic-card--dark` variant with higher opacity (0.82–0.88) and reduced border brightness
    - Add `.float-btn` class with perpetual floating appearance at rest (translateY -1px, spatial shadow, violet border glow), hover (perspective rotateX 6deg, translateY -4px, scale 1.03), and active (compress) states
    - Add `.section-kicker` class with monospace font, 0.75rem size, 0.05em letter-spacing, muted cyan-blue color
    - Add `.orbit-chip` class with signal dot (via `::before`), dark background, subtle border, category color via `--chip-color` custom property
    - Add `.section-backdrop` pseudo-element class for text-heavy sections (radial dark gradient behind content)
    - Add reduced-motion media query to disable blob morphing, pulse effects, deployment dot trails, and connector pulse animations
    - Add keyframes: `blob-morph-chaotic`, `blob-morph-forming`, `blob-morph-stable`, `pulse-travel`, `pulse-glow`, `blink`, `deploy-dot`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 17.3_

  - [x] 1.2 Add variant prop to CometCard component
    - Add `variant` prop with values `default`, `dark`, and `subtle` to `src/components/ui/comet-card.tsx`
    - `default`: cosmic-card background, glare opacity 0.5
    - `dark`: cosmic-card--dark background, glare opacity 0.35
    - `subtle`: cap rotateDepth at 6, glare opacity 0.25
    - Reduce hover scale from 1.05 to 1.02 for `dark` and `subtle` variants
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 1.3 Write property tests for CometCard variant system
    - **Property 2: Telemetry card completeness** — verify variant prop correctly applies background classes and glare opacity values
    - **Validates: Requirements 2.1–2.5**

- [x] 2. Checkpoint — Verify foundation builds
  - Ensure `pnpm typecheck` and `pnpm build` pass. Ask the user if questions arise.

- [x] 3. First Impression — Hero, Buttons, Card Surfaces
  - [x] 3.1 Create useActiveSection hook
    - Create `src/hooks/useActiveSection.ts` with IntersectionObserver tracking all section IDs
    - Return the currently visible section ID for header active state highlighting
    - _Requirements: 3.3_

  - [x] 3.2 Update HeaderScrolling with cosmic-card background, active section, and mobile menu
    - Replace `bg-[#07070d]/85` with `cosmic-card` background class
    - Add violet/cyan bottom border glow
    - Integrate `useActiveSection` hook to highlight the active nav link (increased opacity + persistent violet underline)
    - Add mobile hamburger button with `aria-label="Open navigation"` that opens a Radix Sheet
    - Mobile sheet: cosmic-card background, full-width nav links, close button, focus trap
    - Replace ModeToggle with dark-mode-locked indicator (moon icon, tooltip)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 3.3 Create HeroTerminal component
    - Create `src/components/HeroTerminal.tsx` as a client component
    - Render cosmic-card surface with terminal title bar dots (red, yellow, green) and path label `~/anant`
    - Display three static terminal command-output pairs: `$ whoami`, `$ stack --top`, `$ status` with staggered entrance animations
    - Add orbiting chips (Next.js, Rust, LLMs) positioned above the terminal
    - _Requirements: 4.4, 4.5, 4.6_

  - [x] 3.4 Update HeroContent with kicker, float-btn CTAs, social glow, and terminal fallback
    - Add section-kicker `// hi, I'm` above the tech stack label
    - Replace inline `cta3dStyle` with `.float-btn` class on all CTA buttons
    - Apply `.float-btn` styling to social icon buttons (micro variant — just lift + glow)
    - Conditionally render `<HeroTerminal />` when `profileImageUrl` is null instead of empty space
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 3.5 Write property test for hero terminal fallback
    - **Property 1: Hero terminal fallback rendering**
    - Verify that when profileImageUrl is null, HeroTerminal renders with `$ whoami`, `$ stack --top`, `$ status`
    - **Validates: Requirement 4.4**

  - [x] 3.6 Apply .float-btn and cosmic-card site-wide
    - Replace `bg-white/[0.02]` card surfaces with `cosmic-card` class across all section components
    - Apply `.float-btn` to all existing buttons that currently use inline 3D hover styles
    - Apply `.section-backdrop` to About, Experience, Skills, Education, Certifications, Blog, Contact sections
    - Do NOT apply `.section-backdrop` to Hero section
    - _Requirements: 1.1, 1.3, 1.8, 17.4, 19.3, 19.4_

  - [x] 3.7 Write property test for section backdrop application
    - **Property 15: Section backdrop application**
    - Verify About, Experience, Skills, Education, Certifications, Blog, Contact have section-backdrop; Hero does not
    - **Validates: Requirements 17.4, 19.4**

- [x] 4. Checkpoint — Verify first impression builds
  - Ensure `pnpm typecheck` and `pnpm build` pass. Ask the user if questions arise.

- [x] 5. Core Sections — Experience & Projects
  - [x] 5.1 Rebuild Experience timeline with flex-aligned dots and darker cards
    - Add section-kicker `// trajectory` to ExperienceSection
    - Replace hardcoded `left-[-5px] top-[28px]` dot positioning with flex layout that naturally aligns dots with card content
    - Implement vertical rail with violet gradient and row-aligned dots using flexbox
    - Update ExperienceCard to use CometCard with `variant="dark"` and reduced rotateDepth (3)
    - Replace `bg-white/[0.02]` card background with cosmic-card--dark styling
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 5.2 Add sweeping light hover effect and orbit-chip tags to ExperienceCard
    - Add a diagonal gradient sweep animation on hover (600ms, slides across card surface)
    - Replace plain technology tag spans with `.orbit-chip` class and category-appropriate `--chip-color` values
    - _Requirements: 6.4, 6.5_

  - [x] 5.3 Write property test for experience tech tags
    - **Property 3: Experience tech tags use orbit-chip**
    - Verify each technology tag in experience cards has the orbit-chip CSS class
    - **Validates: Requirement 6.5**

  - [x] 5.4 Rebuild Projects carousel with spatial layout and transitions
    - Add section-kicker `// build log` to the Projects section in PortfolioContent
    - Rebuild ProjectsSlider layout: large center card flanked by two dimmed (opacity 0.35), slightly blurred (blur 1px), floating side cards (260px width, scale 0.88)
    - Position arrow buttons vertically centered beside the center card (not inline with cards)
    - Style arrows as `.float-btn` with 44px hit area
    - Replace simple fade transition with directional spring slide (AnimatePresence with direction-aware variants)
    - Track navigation direction state for enter/exit animations
    - _Requirements: 7.2, 7.3, 7.4, 7.8_

  - [x] 5.5 Add case-note box, orbit-chip tags, and orbit pagination to center project card
    - Center card always shows: title, tagline, tech chips (orbit-chip), and case-note inner panel (dark box with project metadata)
    - On hover: expand to reveal action buttons (View Live, Source) with smooth height animation
    - Replace plain pagination dots with glowing orbit dots (active = elongated pill 24×6px with glow, inactive = 6×6px circles)
    - _Requirements: 7.5, 7.6, 7.7_

  - [x] 5.6 Write property test for center project card content
    - **Property 4: Center project card always shows required content**
    - Verify center card renders title, tagline, orbit-chip tech tags, and case-note panel without hover
    - **Validates: Requirement 7.5**

- [x] 6. Checkpoint — Verify core sections build
  - Ensure `pnpm typecheck` and `pnpm build` pass. Ask the user if questions arise.

- [x] 7. Interaction Sections — Skills & Education
  - [x] 7.1 Replace Skills bar chart with multi-line trajectory graph
    - Add section-kicker `// capability matrix` to SkillsSection
    - Generate synthetic trajectory data from skill percentages and years of experience
    - Replace horizontal BarChart with Recharts LineChart showing multi-line progression (2021–2026)
    - X-axis: years, Y-axis: Familiarity/Applied Depth (Low → High)
    - One line per category with designated colors (AI/ML green, Backend blue, Frontend violet, DevOps pink, Data Systems orange, Soft Skills gray)
    - Hover a line: highlight it (opacity 1, stroke-width 3), dim others (opacity 0.2), show tooltip with category name, direction, and top skills
    - Click a line: select that category in the filter
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 7.2 Add unique category button effects and insight panel
    - Implement unique hover interactions per category: AI/ML (pulse glow), Backend (terminal cursor blink), Frontend (shimmer sweep), DevOps/Tools (deployment dots trail), Data Systems (animated tick bars), Soft Skills (subtle bounce)
    - Add insight panel below category buttons that updates with selected category summary
    - Wire category button clicks to both filter the skill grid and highlight the corresponding chart line
    - _Requirements: 8.4, 8.5, 8.6_

  - [x] 7.3 Write property test for skills category filter
    - **Property 5: Skills category filter correctness**
    - Verify that selecting a category shows only skills from that category
    - **Validates: Requirement 8.4**

  - [x] 7.4 Create EducationFlowchart component
    - Create `src/components/EducationFlowchart.tsx` as a client component
    - Add section-kicker `// origins` to EducationSection
    - Replace the card grid with a vertical flowchart of organic blob shapes
    - Blob variants: `stable` (college, near-perfect sphere with glow), `forming` (high school, less deformed), `amoeba` (middle school, most deformed)
    - Implement CSS border-radius animations for blob morphing
    - Add dotted glowing connectors between stages with traveling light pulse animation
    - Text panel beside each blob (desktop) or below (mobile): degree, field, institution, dates, GPA
    - Respect `prefers-reduced-motion` — disable blob morphing and connector pulse when enabled
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 7.5 Wire EducationFlowchart into EducationSection
    - Replace the grid of EducationEntry cards with the new EducationFlowchart component
    - Pass sorted education items (most recent first) to the flowchart
    - Ensure mobile layout stacks vertically with shorter connectors
    - _Requirements: 9.2, 9.5_

  - [x] 7.6 Write property tests for education flowchart
    - **Property 6: Education flowchart blob variant ordering** — verify most recent gets `stable`, oldest gets `amoeba`
    - **Property 7: Education text panel field completeness** — verify degree always shown, optional fields shown when present
    - **Validates: Requirements 9.3, 9.5**

- [x] 8. Checkpoint — Verify interaction sections build
  - Ensure `pnpm typecheck` and `pnpm build` pass. Ask the user if questions arise.

- [x] 9. Supporting Sections — Certifications, Achievements, Blog, Contact, Footer
  - [x] 9.1 Polish Certifications with darker cards and holographic accent
    - Add section-kicker `// credentials` to CertificationsSection
    - Apply CometCard `variant="dark"` to certification cards
    - Add holographic corner accent (radial gradient pseudo-element in top-right corner)
    - Ensure each card displays: issuer badge area, title, issuer name, date, View Credential link
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 9.2 Write property test for certification card elements
    - **Property 8: Certification card required elements**
    - Verify title, issuer, date, and View Credential link (when URL present) are rendered
    - **Validates: Requirement 10.3**

  - [x] 9.3 Wrap Achievements in floating ledger with glowing rail
    - Wrap entire achievement list in a single CometCard with `variant="subtle"`
    - Add vertical glowing rail on left side with row-aligned dots
    - Hover effect: brighten left rail dot, apply subtle violet background tint
    - Replace type labels with `.orbit-chip` styling
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 9.4 Write property test for achievement orbit-chip labels
    - **Property 9: Achievement type labels use orbit-chip**
    - Verify achievements with non-null type field render orbit-chip class
    - **Validates: Requirement 11.4**

  - [x] 9.5 Darken Blog cards and add magnetic hover
    - Add section-kicker `// uplink` to BlogSection
    - Replace `bg-white/[0.02]` card surfaces with `cosmic-card` class on all blog/resource cards
    - Apply `cosmic-card` with violet left border to GitHub pinned card
    - Replace category labels with `.orbit-chip` class
    - Add magnetic hover effect to GitHub "Visit →" button (slight pull toward cursor)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [x] 9.6 Write property test for blog card styling
    - **Property 10: Blog card styling and category chips**
    - Verify cards use cosmic-card styling and category labels use orbit-chip
    - **Validates: Requirements 12.3, 12.4**

  - [x] 9.7 Restructure Contact section with new heading and centered layout
    - Add section-kicker `// uplink` to ContactSection
    - Change heading to `Let's build something`
    - Change subheading to `Internships, collaborations, or just to say hi.`
    - Reduce card width to `max-w-md`, center layout
    - Center email as visual focus with Copy and Open Mail buttons styled as `.float-btn`
    - Render social buttons (GitHub, LinkedIn, Instagram, Twitter/X, Website, Email) as centered floating circles with `.float-btn`
    - Remove all "AI Twin", "I'm a real person" text
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [x] 9.8 Replace Footer completely
    - Replace entire Footer component with three-column layout
    - Left: `</>` developer glyph in mono text
    - Center: floating Back to top button with `.float-btn` styling and ArrowUp icon
    - Right: `© 2026 Anant Gupta · building in public`
    - Add subtle top border gradient (transparent → violet/20 → transparent)
    - Set background to transparent
    - Remove "Built in the dark. Shipped with intention." text
    - Ensure back-to-top button is keyboard accessible
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 10. Checkpoint — Verify supporting sections build
  - Ensure `pnpm typecheck` and `pnpm build` pass. Ask the user if questions arise.

- [x] 11. Portfolio Lab — Replace ChatKit
  - [x] 11.1 Create lab data module with static responses
    - Create `src/lib/lab-data.ts` with types: `LabMode`, `LabChip`, `EvidenceItem`, `LabResponse`
    - Define `LAB_CHIPS` record with suggested chips for each mode (Recruiter, Builder, Research, Skeptic)
    - Define `LAB_RESPONSES` record with deterministic static responses including headings, summaries, and evidence items
    - Each evidence item includes title, description, optional sectionLink (e.g., `#experience`), tags, and optional source URL
    - _Requirements: 15.4, 15.5, 15.9_

  - [x] 11.2 Create PortfolioLab component and sub-components
    - Create `src/components/lab/PortfolioLab.tsx` — main lab panel with mode state, chip display, response area
    - Create `src/components/lab/LabMode.tsx` — mode selector tabs (Recruiter, Builder, Research, Skeptic)
    - Create `src/components/lab/EvidenceCard.tsx` — evidence card with title, description, tags, and section link anchor
    - Create `src/components/lab/ProofPack.tsx` — proof pack generator button that copies formatted portfolio summary to clipboard
    - Lab panel has cosmic-card background, no ChatKit branding, no API calls
    - _Requirements: 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9_

  - [x] 11.3 Write property tests for Portfolio Lab
    - **Property 12: Portfolio Lab mode-chip mapping** — verify each mode displays correct chips with non-empty labels and valid response keys
    - **Property 13: Portfolio Lab response completeness** — verify chip clicks show heading, summary, and at least one EvidenceCard with correct section links
    - **Validates: Requirements 15.4, 15.5, 15.6**

  - [x] 11.4 Restyle SidebarToggle as Portfolio Lab launcher
    - Remove Clerk `SignInButton` and `useUser` auth gate
    - Replace `MessageSquare` icon with a beaker/terminal icon
    - Change tooltip to `Ask the lab, not my sleep schedule.`
    - Change `aria-label` to `Open Portfolio Lab`
    - Apply `.float-btn` styling with subtle idle pulse animation
    - Remove all "AI Twin" and "Chat with" text
    - _Requirements: 15.1, 15.2, 15.8, 16.6_

  - [x] 11.5 Wire AppSidebar to render PortfolioLab instead of ChatWrapper
    - Replace `ChatWrapper` import and render with `PortfolioLab` in `src/components/app-sidebar.tsx`
    - Keep ChatKit files in the repo but remove from visible UI
    - _Requirements: 15.8_

  - [x] 11.6 Write property test for banned text exclusion
    - **Property 11: Banned text exclusion across all components**
    - Verify rendered output does not contain "AI Twin", "Chat with Anant", "ChatKit" branding, "Tired of chatting", "I'm a real person", "Built in the dark"
    - **Validates: Requirements 16.1, 16.2, 16.3, 16.4, 16.5**

- [x] 12. Checkpoint — Verify Portfolio Lab builds
  - Ensure `pnpm typecheck` and `pnpm build` pass. Ask the user if questions arise.

- [x] 13. Verification & Cleanup
  - [x] 13.1 Remove FloatingDock from visible UI
    - Delete `src/components/FloatingDock.tsx` and `src/components/FloatingDockClient.tsx`
    - Remove FloatingDock import and usage from any parent components (check PortfolioContent, layout files)
    - _Requirements: 21.1, 21.2_

  - [x] 13.2 Copy cleanup — remove banned text strings
    - Search `src` directory for: "AI Twin", "Chat with Anant", "Chat with AI Twin", "ChatKit" (visible branding), "Alex Morgan", "Built in the dark", "Tired of chatting"
    - Remove or replace all matches in visible UI code
    - Verify `src/app/layout.tsx` metadata does not reference "AI Twin"
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 20.3_

  - [x] 13.3 Accessibility pass — aria-labels, keyboard nav, focus management
    - Verify all icon-only buttons have `aria-label` attributes (carousel arrows, social icons, Lab launcher, back-to-top)
    - Verify keyboard navigation works for projects carousel (arrow keys) and Portfolio Lab (Escape to close)
    - Verify mobile navigation sheet traps focus when open
    - _Requirements: 17.1, 17.2, 17.5_

  - [x] 13.4 Write property test for icon-only button accessibility
    - **Property 14: Icon-only button accessibility**
    - Verify all icon-only buttons have non-empty aria-label attributes
    - **Validates: Requirement 17.1**

  - [x] 13.5 Run typecheck and build verification
    - Run `pnpm typecheck` — must pass with zero errors
    - Run `pnpm build` — must pass with zero errors
    - _Requirements: 20.1, 20.2_

  - [x] 13.6 Responsive layout verification
    - Verify single-column layouts on mobile (<768px), hidden side project cards, mobile hamburger menu, stacked education blobs
    - Verify two-column grids on tablet (768–1024px)
    - Verify content constrained to `max-w-6xl` on wide viewports
    - Verify Portfolio Lab launcher does not overlap footer on mobile
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

- [x] 14. Final checkpoint — Ensure all tests pass
  - Ensure `pnpm typecheck` and `pnpm build` pass with zero errors. Ask the user if questions arise.

## Stretch Goals (Optional)

- [ ] S1. Three.js "string pull" effect in Projects carousel
  - When projects section is in viewport and user navigates carousel, emit directional force on nearby ring particles in ObsidianBackground
  - _Requirements: 7 (stretch)_

- [ ] S2. Scroll-progress fill in Experience timeline
  - Add a second div inside the timeline rail that grows in height as user scrolls through experience section
  - Color transitions from violet to cyan
  - _Requirements: 6 (stretch)_

- [ ] S3. Blog archive toggle
  - Requires adding `archived: boolean` field to blog Sanity schema
  - Implement client-side "Show all / Hide archived" toggle in BlogFeed
  - _Requirements: 12 (stretch, schema change needed)_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation after each phase
- Property tests validate universal correctness properties from the design document
- The project uses TypeScript (Next.js App Router + React 19) — all code should be TypeScript/TSX
- Build commands: `pnpm typecheck` and `pnpm build`
- Existing patterns to follow: server components fetch via `sanityFetch`, client components for interactivity, Tailwind v4 utilities, Motion for animations
