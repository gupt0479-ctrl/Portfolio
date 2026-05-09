# Portfolio UI Enhancement — Technical Design Document

## Overview

This document defines the complete technical design for transforming the current portfolio from a functional but visually basic site into a premium cosmic AI portfolio command center. The design covers every visible component, a new global design system, and the replacement of the OpenAI ChatKit chatbot with a custom-built Portfolio Lab — the standout feature of the entire site.

**Stack**: Next.js 16.1.1 (App Router), React 19.2.3, Tailwind CSS v4, shadcn/ui, Radix UI, Three.js / R3F, Sanity v4.22.0, Clerk, Framer Motion / Motion v12.34.0, Recharts v3.7.0

**Design Direction**: Floating portfolio command center inside space. Cosmic terminal aesthetic, orbital cards, evidence-backed AI lab, intelligent microinteractions, dark translucent surfaces, violet/cyan/green signal accents, tiny delightful details everywhere.

## Source of Truth

This document is the **implementation-facing technical design**. It answers *how* each component should be built, what CSS/TS to write, and which files to touch.

The **user-intent source of truth** is `.kiro/specs/portfolio-ui-enhancement/ui-enhancement.md`. That document owns:
- What the UI should *feel* like and why the current version falls short
- Exact copy, tone, and taste preferences
- Priority ordering (what matters most to the user)
- Acceptance criteria for each section

**Conflict resolution**: When the two documents appear to differ, `ui-enhancement.md` wins on experience, taste, copy, and priorities. This `design.md` wins on implementation approach, file structure, and technical constraints.

**Implementation guidance**: Each section in this document should not only describe the target state but also explain *why the current UI feels wrong* so that implementers can judge their work against the intent, not just a checklist. If a section looks "done" but still feels flat, bland, or disconnected from the cosmic theme, it is not done.

## Refactor Phasing

This overhaul should be implemented in multiple passes. Do not treat the whole design as one monolithic task unless the user explicitly asks for a full implementation sprint. Each phase should leave the site in a buildable, visually coherent state.

### Phase 1 — Foundation (Global Design System + CometCard)
Add `.cosmic-card`, `.float-btn`, `.section-kicker`, `.orbit-chip` to `globals.css`. Add CometCard `variant` prop and reduce tilt for large cards. Add `.section-backdrop` for text readability. Add cosmic CSS custom properties and reduced-motion guards. **No section content changes yet** — this phase only creates the shared vocabulary.

### Phase 2 — First Impression (Hero + Buttons + Card Surfaces)
Update Hero: add kicker, floating CTA buttons, social icon glow, HeroTerminal fallback. Apply `.float-btn` to all existing buttons site-wide. Replace `bg-white/[0.02]` card surfaces with `cosmic-card` across all sections. This phase makes the site feel immediately different on first load.

### Phase 3 — Core Sections (Experience + Projects)
Rebuild Experience timeline with flex-aligned dots, darker cards, sweeping light hover. Rebuild Projects carousel with spatial slide transitions, wider side cards, proper arrow placement, case note inner box, orbit pagination dots.

### Phase 4 — Interaction Sections (Skills + Education)
Replace Skills bar chart with multi-line trajectory graph. Add unique category button effects and insight panel. Replace Education grid with organic blob flowchart and animated connectors.

### Phase 5 — Supporting Sections (Certifications + Achievements + Blog + Contact + Footer)
Polish Certifications with darker cards and holographic accents. Wrap Achievements in a floating ledger card. Darken Blog cards and add magnetic hover. Restructure Contact with new heading/copy and centered layout. Replace Footer entirely.

### Phase 6 — Portfolio Lab (Replace ChatKit)
Build the deterministic Portfolio Lab with 4 modes, evidence cards, proof pack generator. Restyle SidebarToggle as Lab launcher. Remove Clerk auth gate from launcher. Wire AppSidebar to render PortfolioLab instead of ChatWrapper.

### Phase 7 — Verification & Cleanup
Run `pnpm typecheck` and `pnpm build`. Search-and-remove old copy ("AI Twin", "ChatKit", etc.). Remove FloatingDock. Test all sections on mobile/tablet/desktop/wide. Verify keyboard nav, reduced motion, and WCAG contrast.

## Repo Audit Notes

These implementation notes are based on the current repository state and should be kept in mind when applying the design. Each note identifies a specific code pattern that the design intends to replace.

| File | Current State | Why It Feels Wrong | Design Target |
|------|--------------|-------------------|---------------|
| `HeroContent.tsx` | Inline `cta3dStyle()` for CTAs; buttons are flat at rest | Buttons only come alive on hover — feels dead and static in a "space" portfolio | `.float-btn` class with perpetual float + iridescent overlay |
| `AboutSection.tsx` | Plain stats grid under a `border-t` | Generic dashboard look; no personality, no cosmic theme connection | Telemetry cards with icons, sparklines, hover glow |
| `ExperienceSection.tsx` | Hardcoded `left-[-5px] top-[28px]` timeline dots | Dots misalign at different viewports; line feels random, not intentional | Flex-aligned dots with glowing rail and optional scroll progress |
| `ExperienceCard.tsx` | `CometCard rotateDepth={4}`, `bg-white/[0.02]` | Card is nearly invisible — feels like empty glass, not a floating slab | `cosmic-card--dark` variant, reduced tilt, sweeping light hover |
| `EducationEntry.tsx` | Same transparent card surface | Identical to every other section — no visual hierarchy for education stages | Organic blob flowchart with animated connectors |
| `BlogFeed.tsx` | `bg-white/[0.02]` cards, basic 3D hover | Cards disappear into background; GitHub card is decent but could be more premium | `cosmic-card` surfaces, magnetic hover on Visit button |
| `ContactPanel.tsx` | Heading: "Tired of chatting to my AI Twin?" | Cringe copy; card is too wide; social buttons don't pop | New heading, smaller centered card, floating circular social buttons |
| `ProjectsSlider.tsx` | `w-[220px] max-h-48` side cards, inline arrows, simple fade | Cramped layout, buttons on top of cards, no spatial movement, empty center card before hover | Wider side cards, vertically centered arrows, spring slide transitions, case note box |
| `SkillsSectionClient.tsx` | Horizontal Recharts `BarChart` | Looks like a generic admin dashboard, not a portfolio showcase | Multi-line trajectory graph with interactive category effects |
| `SidebarToggle.tsx` | Clerk auth gate, "Chat with AI Twin" tooltip | Visitors must sign in to use the feature; "AI Twin" branding is being replaced | Free-access Portfolio Lab launcher, new tooltip copy |
| `app-sidebar.tsx` | Renders `ChatWrapper` → ChatKit | Visible sidebar is still the paid chatbot UI | Render `PortfolioLab` instead |
| `Footer.tsx` | "Built in the dark. Shipped with intention." | User finds this cringe; layout is unbalanced | Three-column: `</>` glyph, floating back-to-top, copyright |
| `globals.css` | ChatKit overrides, no shared card/button utilities | One-off styles scattered across components | Shared `.cosmic-card`, `.float-btn`, `.section-kicker`, `.orbit-chip` |

---

## Table of Contents

0. [Source of Truth](#source-of-truth)
1. [Global Design System](#1-global-design-system)
2. [Obsidian Background Tuning](#2-obsidian-background-tuning)
3. [Header / Navigation](#3-header--navigation)
4. [Hero Section](#4-hero-section)
5. [About Section](#5-about-section)
6. [Experience Section](#6-experience-section)
7. [Projects Section](#7-projects-section)
8. [Skills Section](#8-skills-section)
9. [Education Section](#9-education-section)
10. [Certifications Section](#10-certifications-section)
11. [Achievements Section](#11-achievements-section)
12. [Blog Section](#12-blog-section)
13. [Contact Section](#13-contact-section)
14. [Footer](#14-footer)
15. [AI / Portfolio Lab](#15-ai--portfolio-lab)
16. [Floating Dock / Bottom UI](#16-floating-dock--bottom-ui)
17. [Accessibility & Responsiveness](#17-accessibility--responsiveness)
18. [Verification Checklist](#18-verification-checklist)

---


## 1. Global Design System

### 1.1 Files Modified
- `src/app/globals.css` — Add new utility classes, update CSS custom properties
- `src/components/ui/comet-card.tsx` — Add `variant` prop, reduce tilt for large cards

### 1.2 New CSS Utility Classes

> **Implementation judgment**: The global design system is done when every card, button, and section label across the site uses these shared utilities instead of one-off inline styles. If you see `bg-white/[0.02]` or inline `cta3dStyle()` anywhere in the rendered UI, the foundation phase is not complete.

#### `.cosmic-card` — Dark Translucent Card Base

**Current Problem**: Cards use `bg-white/[0.02]` which is nearly invisible, making them feel like empty glass over the Three.js background. When made opaque they outshine the background.

**Design**:
```css
.cosmic-card {
  background: linear-gradient(
    135deg,
    rgba(9, 10, 18, 0.72) 0%,
    rgba(14, 16, 28, 0.82) 100%
  );
  border: 1px solid rgba(167, 139, 250, 0.22);
  border-radius: var(--radius-xl);
  backdrop-filter: blur(16px);
  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.04),
    0 0 0 1px rgba(167, 139, 250, 0.06),
    0 4px 24px rgba(0, 0, 0, 0.3);
}

.cosmic-card--dark {
  background: linear-gradient(
    135deg,
    rgba(6, 6, 14, 0.82) 0%,
    rgba(10, 10, 22, 0.88) 100%
  );
  border-color: rgba(167, 139, 250, 0.15);
}
```

**Usage**: Experience cards, education cards, certification cards, contact card, blog cards, achievement ledger. The `--dark` variant is for sections where the Three.js sphere is most visible (experience, certifications).

#### `.float-btn` — Perpetually Floating Buttons

**Current Problem**: Buttons only have a 3D effect on hover via inline `cta3dStyle()`. At rest they look flat and dead. The user wants ALL buttons to appear as if floating in space at all times.

**Design**:
```css
.float-btn {
  position: relative;
  transform: translateY(-1px);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(167, 139, 250, 0.12);
  transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
  will-change: transform;
}

.float-btn:hover {
  transform: perspective(600px) rotateX(6deg) translateY(-4px) scale(1.03);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(167, 139, 250, 0.35),
    0 0 16px rgba(167, 139, 250, 0.1);
}

.float-btn:active {
  transform: translateY(0px) scale(0.98);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}
```

**Cursor-follow sheen**: Implemented via the existing `useIridescentEffect` hook applied as an overlay `<span>` inside each button. The hook already tracks mouse position and renders a rainbow radial gradient — extend it to all `.float-btn` elements.

**Apply to**: Hero CTAs, project View Live / Source buttons, carousel arrows, contact social buttons, AI Lab launcher, footer back-to-top, nav items, skill filter pills.

#### `.section-kicker` — Code-Comment Section Labels

**Current Problem**: Sections have plain headings with no visual personality. The Lovable demo used commented labels that felt like a developer's terminal.

**Design**:
```css
.section-kicker {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  color: rgba(139, 200, 250, 0.55);
  margin-bottom: 0.75rem;
}
```

**Content per section**:
| Section | Kicker |
|---------|--------|
| Hero | `// hi, I'm` |
| About | `// scan report` |
| Experience | `// trajectory` |
| Projects | `// build log` |
| Skills | `// capability matrix` |
| Education | `// origins` |
| Certifications | `// credentials` |
| Blog | `// uplink` |
| Contact | `// uplink` |
| Achievements | *(none — cleaner without)* |

#### `.orbit-chip` — Skill/Tag Pill

**Design**:
```css
.orbit-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  background: rgba(14, 16, 28, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.6);
  transition: border-color 200ms ease, background 200ms ease;
}

.orbit-chip::before {
  content: '';
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--chip-color, rgba(167, 139, 250, 0.7));
}

.orbit-chip:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(14, 16, 28, 0.85);
}
```

**Category colors** (set via `--chip-color`):
- frontend: `#8f7cf7`, backend: `#60a5fa`, ai-ml: `#34d399`, devops: `#f472b6`, database: `#fb923c`, cloud: `#38bdf8`, tools: `#facc15`, soft-skills: `#94a3b8`

### 1.3 CometCard Improvements

**File**: `src/components/ui/comet-card.tsx`

**Current Problems**:
1. Default `rotateDepth=17.5` is too aggressive for large cards (experience, contact)
2. `bg-white/[0.02]` makes cards invisible
3. Glare overlay at `opacity: 0.65` is too bright on some cards
4. No variant system — every card looks the same

**Changes**:

Add a `variant` prop:
```typescript
type CometCardVariant = 'default' | 'dark' | 'subtle';

interface CometCardProps {
  rotateDepth?: number;
  translateDepth?: number;
  variant?: CometCardVariant;
  className?: string;
  children: React.ReactNode;
}
```

**Variant behavior**:
- `default`: Current behavior but with `cosmic-card` background instead of `bg-white/[0.02]`. Glare opacity 0.5.
- `dark`: Uses `cosmic-card--dark`. Glare opacity 0.35. For experience, certifications.
- `subtle`: Minimal tilt (rotateDepth capped at 6), glare opacity 0.25. For large cards like contact, achievement ledger.

**Scale on hover**: Reduce from `1.05` to `1.02` for `dark` and `subtle` variants to prevent large cards from feeling warped.

### 1.4 CSS Custom Properties Updates

Add cosmic accent colors to the `:root` and `.dark` blocks:
```css
.dark {
  --cosmic-violet: rgba(167, 139, 250, 1);
  --cosmic-cyan: rgba(139, 200, 250, 1);
  --cosmic-green: rgba(52, 211, 153, 1);
  --cosmic-surface: rgba(9, 10, 18, 0.72);
  --cosmic-surface-dark: rgba(6, 6, 14, 0.82);
  --cosmic-border: rgba(167, 139, 250, 0.22);
  --cosmic-glow: rgba(167, 139, 250, 0.12);
}
```


---

## 2. Obsidian Background Tuning

### 2.1 Files Modified
- `src/components/three/ObsidianBackgroundCanvas.tsx`

### 2.2 Current State Analysis

The ObsidianBackgroundCanvas is a sophisticated Three.js scene with:
- 2800-point fibonacci sphere (1400 on mobile)
- 2000-point torus ring (1000 on mobile)
- 5500 stars (2750 on mobile)
- Magnetic cursor interaction with facing-side gating
- Scroll-progressive physics (stretchT ramps 0→1 over bottom 60%)
- Camera animation from `[3.5, 2.8, 5.2]` to `[0.4, 0.2, 3.2]`
- Click burst ripple effect
- Already respects `prefers-reduced-motion`

### 2.3 Design Changes

#### Section-Aware Depth
The vignette overlay (already partially implemented as a `radial-gradient` div at z-index 2) needs to be strengthened for text-heavy sections. Add a CSS-based section darkening approach:

**Approach**: Add a `::before` pseudo-element on each `<section>` that has text content, creating a local dark backing:
```css
.section-backdrop {
  position: relative;
}
.section-backdrop::before {
  content: '';
  position: absolute;
  inset: -2rem -4rem;
  background: radial-gradient(
    ellipse 120% 100% at 50% 50%,
    rgba(5, 4, 10, 0.6) 0%,
    transparent 70%
  );
  z-index: -1;
  pointer-events: none;
}
```

Apply `.section-backdrop` to: About, Experience, Skills, Education, Certifications, Blog, Contact sections. Do NOT apply to Hero (keep it open).

#### Particle Count Tuning
No changes to particle counts — current mobile halving is appropriate. The section-backdrop approach handles readability without reducing the visual quality of the sphere.

#### Projects Section Interactivity
> **⚡ STRETCH GOAL** — Not required for first pass. Implement only after Phase 3 carousel rebuild is stable.

When the projects section is in viewport, the Three.js scene could respond to carousel transitions. The approach would be:
- Expose a `sectionInView` ref from PortfolioContent
- When projects section is active and user clicks left/right, emit a brief directional force on nearby ring particles
- This creates the "string pulling" visual the user described

### 2.4 Low-Level: No Changes to Physics Constants
The current tuning constants (PULL_STR, SPRING_K, DAMPING, etc.) are well-calibrated. The section-backdrop CSS approach solves readability without touching the Three.js code.

---

## 3. Header / Navigation

### 3.1 Files Modified
- `src/components/HeaderScrolling.tsx`
- `src/components/DarkModeToggle.tsx`
- `src/app/globals.css` (mobile menu styles)

### 3.2 Current State Analysis

The header is a sticky bar with:
- `Anant.` logo (violet dot)
- 8 nav links (12px, white/45 opacity, violet underline on hover)
- ModeToggle with 3D hover wrapper
- Shows on scroll past 80px
- Adjusts `right` when sidebar is open

**Problems**:
1. No active section indicator
2. Theme toggle may be broken (light mode not fully supported)
3. No mobile menu — nav is `hidden md:flex`
4. Nav links don't have the float-btn effect

### 3.3 High-Level Design

#### Floating Orbital Nav Bar
- Add `cosmic-card` background to the header instead of `bg-[#07070d]/85`
- Add subtle violet/cyan border glow on the bottom edge
- Nav links get `.float-btn` micro-hover (just the lift + glow, no rotation)

#### Active Section State
Implement using `IntersectionObserver`:
```typescript
// New hook: useActiveSection.ts
function useActiveSection(sectionIds: string[]): string | null {
  // Observe each section, return the one with highest intersection ratio
  // Debounce to avoid rapid switching
}
```
Active link styling: `text-white/90` + violet underline always visible (not just on hover) + subtle glow dot.

#### Theme Toggle Resolution
Lock to dark mode. Replace `ModeToggle` with a visual-only "dark mode locked" indicator:
- Small moon icon with a subtle pulse
- Tooltip: "Dark mode — it's a space portfolio"
- No click action (or click shows a brief toast: "Light mode? In space?")

#### Mobile Navigation
Add a hamburger/menu button that opens a Radix `Sheet` (already have `@radix-ui/react-dialog`):
- Sheet slides from right
- Contains all nav links as full-width items
- Same cosmic-card background
- Close button with accessible label
- Trap focus inside sheet when open

### 3.4 Low-Level: Active Section Hook

```typescript
// src/hooks/useActiveSection.ts
"use client";
import { useEffect, useState } from "react";

const SECTION_IDS = [
  "home", "about", "experience", "projects",
  "skills", "education", "certifications", "blog", "contact"
];

export function useActiveSection(): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let best: string | null = null;
        let bestRatio = 0;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            best = entry.target.id;
            bestRatio = entry.intersectionRatio;
          }
        }
        if (best) setActive(best);
      },
      { threshold: [0.1, 0.3, 0.5], rootMargin: "-80px 0px -40% 0px" }
    );

    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return active;
}
```

### 3.5 Low-Level: Mobile Sheet Nav

```typescript
// Inside HeaderScrolling.tsx
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

// In the header JSX, add after the desktop nav:
<div className="md:hidden ml-auto">
  <Sheet>
    <SheetTrigger asChild>
      <button className="float-btn p-2 rounded-lg" aria-label="Open navigation">
        <Menu className="size-5 text-white/70" />
      </button>
    </SheetTrigger>
    <SheetContent side="right" className="cosmic-card border-l border-white/[0.06] w-72">
      <nav className="flex flex-col gap-2 pt-8">
        {items.map((item) => (
          <Link key={item._id} href={item.href}
            className="px-4 py-3 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors">
            {item.title}
          </Link>
        ))}
      </nav>
    </SheetContent>
  </Sheet>
</div>
```

---

## 4. Hero Section

### 4.1 Files Modified
- `src/components/sections/HeroSection.tsx`
- `src/components/sections/HeroContent.tsx`
- `src/components/sections/ProfileImage.tsx` (may be deprecated)
- New: `src/components/HeroTerminal.tsx`

### 4.2 Current State Analysis

The hero has:
- Tech stack label (`NEXT.JS • SANITY • 3D • TYPESCRIPT`)
- Large name (`Anant Gupta`)
- Animated headline via `LayoutTextFlip`
- Short bio paragraph
- 3 CTA buttons with inline 3D hover (View Projects, View Experience, Contact)
- Social icon row (GitHub, LinkedIn, Twitter, Website, Email)
- Location + availability indicator
- Profile image on right (conditionally rendered — currently missing)

**Problems**:
1. No section kicker
2. CTA buttons are bold and only hover-3D (not floating at rest)
3. Social icons are plain circles with no float effect
4. Profile image area is empty when image is missing — wastes half the grid
5. "AI Twin" language in sidebar toggle tooltip
6. Bio may be too long for hero

### 4.3 High-Level Design

#### Layout Change
When `profileImageUrl` is null (current state), replace the right-side image grid cell with a **HeroTerminal** component — a floating dark terminal module that shows quick-glance developer info.

When `profileImageUrl` exists, keep the image but add 1-2 orbiting chips around it.

#### Section Kicker
Add `// hi, I'm` above the tech stack label in cyan/violet-muted.

#### CTA Buttons
- Remove bold font weight from secondary buttons
- Apply `.float-btn` class to all three
- Add `useIridescentEffect` overlay to each for cursor-follow rainbow sheen
- Buttons float at rest (translateY(-1px), subtle shadow)

#### Social Icons
- Apply `.float-btn` styling (smaller scale — just the lift + glow)
- Add subtle hover glow ring

#### Bio Shortening
The `shortBio` field from Sanity is used. If it exceeds ~120 characters, truncate with ellipsis in the component. The full bio lives in About.

### 4.4 Low-Level: HeroTerminal Component

```typescript
// src/components/HeroTerminal.tsx
"use client";
import { motion } from "motion/react";

const TERMINAL_LINES = [
  { prompt: "$ whoami", output: "anant.gupta — ai & data systems engineer" },
  { prompt: "$ stack --top", output: "rust · typescript · python · postgres · llms" },
  { prompt: "$ status", output: "shipping → research/agents · ui/ux · data pipelines" },
];

const ORBITING_CHIPS = ["Next.js", "Rust", "LLMs"];

export function HeroTerminal() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative"
    >
      {/* Terminal window */}
      <div className="cosmic-card rounded-xl p-4 font-mono text-xs max-w-sm">
        {/* Title bar dots */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          <span className="ml-2 text-white/30 text-[10px]">~/anant</span>
        </div>

        {/* Terminal lines */}
        <div className="space-y-2">
          {TERMINAL_LINES.map((line, i) => (
            <motion.div
              key={line.prompt}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.15 }}
            >
              <p className="text-cyan-400/70">{line.prompt}</p>
              <p className="text-white/65 ml-2">{line.output}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Orbiting chips */}
      <div className="absolute -top-3 -right-3 flex gap-1.5">
        {ORBITING_CHIPS.map((chip, i) => (
          <motion.span
            key={chip}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0 + i * 0.1 }}
            className="orbit-chip text-[10px]"
          >
            {chip}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
```

### 4.5 Low-Level: HeroContent Changes

Key modifications to `HeroContent.tsx`:
1. Add kicker `<p className="section-kicker">// hi, I'm</p>` before the tech stack label
2. Replace inline `cta3dStyle` with `.float-btn` class + `useIridescentEffect` overlay
3. Social icons: add `.float-btn` class (micro variant)
4. Conditional right column: `profileImageUrl ? <ProfileImage /> : <HeroTerminal />`
5. Replace "AI Twin" text anywhere in hero scope (none currently, but guard against it)

---

## 5. About Section

### 5.1 Files Modified
- `src/components/sections/AboutSection.tsx`
- New: `src/components/AboutTelemetry.tsx` (client component)

### 5.2 Current State Analysis

The About section has:
- Centered heading "About Me" + subheading
- PortableText bio rendering
- Stats grid: 2x4 with `stat.value` (large) and `stat.label` (small)
- Stats separated by a plain `border-t`

**Problems**:
1. No section kicker
2. Heading/subheading are generic ("Get to know me better")
3. Stats are plain numbers with no visual interest
4. No standout visual area below the bio
5. The section feels disconnected from the cosmic theme

### 5.3 High-Level Design

#### Structure
```
[section-kicker: // scan report]
[heading: About Me]
[subheading: updated]
[PortableText bio — centered, max-w-3xl]
[Two-panel area:]
  [Left: HeroTerminal (if not in hero) OR Mission Telemetry diagram]
  [Right: Telemetry Stats — 4 cards in 2x2 grid]
```

#### Telemetry Stats
Replace the plain stats grid with 4 "telemetry cards" — small cosmic-card panels that look like live system readouts:

Each card has:
- Small icon (from Lucide) top-left
- Large value (e.g., "12+")
- Label below (e.g., "Projects Built")
- Tiny animated sparkline or orbit dot (CSS animation)
- Hover: subtle glow intensifies, value scales up slightly
- Subtle pulsing border on the card

**Four telemetry cards**:
1. **Projects Built** — icon: `Layers`, value from stats or hardcoded
2. **Technologies** — icon: `Cpu`, value from stats
3. **Currently Learning** — icon: `TrendingUp`, value from stats
4. **Research Focus** — icon: `Microscope`, value from stats

### 5.4 Low-Level: AboutTelemetry Component

```typescript
// src/components/AboutTelemetry.tsx
"use client";
import { motion } from "motion/react";
import { Cpu, Layers, Microscope, TrendingUp } from "lucide-react";

const ICONS = { "Projects Built": Layers, "Technologies": Cpu, "Currently Learning": TrendingUp, "Research Focus": Microscope };

interface TelemetryCardProps {
  label: string;
  value: string;
  index: number;
}

function TelemetryCard({ label, value, index }: TelemetryCardProps) {
  const Icon = ICONS[label as keyof typeof ICONS] ?? Layers;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="cosmic-card rounded-xl p-4 group hover:border-[rgba(167,139,250,0.35)] transition-colors"
    >
      <Icon className="size-4 text-violet-400/60 mb-2" />
      <p className="text-2xl font-bold text-white group-hover:scale-105 transition-transform origin-left">
        {value}
      </p>
      <p className="text-xs text-white/40 mt-1 font-sans">{label}</p>
      {/* Sparkline dot */}
      <div className="mt-2 flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="w-1 h-1 rounded-full bg-violet-400/30"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function AboutTelemetry({ stats }: { stats: { label?: string; value?: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-8">
      {stats.slice(0, 4).map((stat, i) => (
        <TelemetryCard
          key={stat.label ?? i}
          label={stat.label ?? ""}
          value={stat.value ?? "—"}
          index={i}
        />
      ))}
    </div>
  );
}
```


---

## 6. Experience Section

### 6.1 Files Modified
- `src/components/sections/ExperienceSection.tsx`
- `src/components/cards/ExperienceCard.tsx`

### 6.2 Current State Analysis

**Timeline**: A single `w-px` div with a linear gradient from violet 50% to violet 10%. Dots are positioned at `left-[-5px] top-[28px]` — hardcoded pixel offsets that misalign with card content at different viewport widths.

**Cards**: CometCard with `rotateDepth={4}` and `bg-white/[0.02]` — nearly invisible background. No mouse-tracking effect beyond the CometCard tilt.

### 6.3 High-Level Design

#### Timeline Rail
Replace the single gradient div with a proper timeline system:
- **Vertical rail**: 2px wide, violet gradient, with a scroll-based progress fill using `IntersectionObserver` or scroll position
- **Dots**: Positioned using flexbox alignment with the card title row, not hardcoded pixel offsets. Each dot is 10px, with a 3px outer ring glow and a soft pulsing animation
- **Progress fill**: A second div inside the rail that grows in height as the user scrolls through the experience section. Color transitions from violet to cyan

> **⚡ STRETCH GOAL** — The scroll-based progress fill is a nice-to-have. The core requirement is properly aligned dots and a clean glowing rail. Add the progress fill only after the base timeline is solid.

#### Cards
- Replace `bg-white/[0.02]` with `cosmic-card--dark` variant
- Reduce CometCard `rotateDepth` from 4 to 3 (large cards need less tilt)
- Add sweeping light effect on hover: a diagonal gradient that slides across the card surface over 600ms
- Add subtle border pulse on hover: border-color transitions to brighter violet

#### Content Hierarchy
- Role (h3, white, semibold) — unchanged
- Company (white/70) — unchanged
- Date: move to a consistent position (top-right on desktop, below company on mobile)
- Location: keep with MapPin icon
- Responsibilities: keep arrow bullets
- Tech tags: use `.orbit-chip` instead of plain spans

### 6.4 Low-Level: Timeline Alignment Fix

```typescript
// In ExperienceSection.tsx, replace the hardcoded dot positioning:

// OLD:
<div className="absolute left-[-5px] top-[28px] z-[1] h-[10px] w-[10px] rounded-full bg-[#8f7cf7]" />

// NEW: Use a flex layout that naturally aligns dot with card
<div className="relative flex gap-6">
  {/* Timeline column */}
  <div className="flex flex-col items-center w-6 shrink-0">
    {/* Connector line (top) */}
    {idx > 0 && <div className="w-0.5 flex-1 bg-gradient-to-b from-violet-500/30 to-violet-500/20" />}
    {/* Dot — naturally centered with the card's first line */}
    <div className="w-2.5 h-2.5 rounded-full bg-violet-500 shrink-0 my-1"
      style={{ boxShadow: "0 0 0 3px rgba(143,124,247,0.2), 0 0 12px rgba(143,124,247,0.35)" }}
    />
    {/* Connector line (bottom) */}
    {idx < shown.length - 1 && <div className="w-0.5 flex-1 bg-gradient-to-b from-violet-500/20 to-violet-500/10" />}
  </div>
  {/* Card */}
  <div className="flex-1 pb-6">
    <ExperienceCard experience={exp} index={idx} />
  </div>
</div>
```

### 6.5 Low-Level: Sweeping Light Effect

Add to ExperienceCard as a pseudo-element or motion div:
```typescript
// Inside ExperienceCard, add after the card content:
<motion.div
  className="pointer-events-none absolute inset-0 z-20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
  style={{
    background: "linear-gradient(105deg, transparent 40%, rgba(167,139,250,0.06) 50%, transparent 60%)",
    backgroundSize: "200% 100%",
  }}
  whileHover={{
    backgroundPosition: ["200% 0%", "-200% 0%"],
    transition: { duration: 0.8, ease: "easeInOut" }
  }}
/>
```

---

## 7. Projects Section

### 7.1 Files Modified
- `src/components/three/ProjectsSlider.tsx` — Complete rebuild

### 7.2 Current State Analysis

**The biggest weak point**. Problems:
1. Side cards are `w-[220px] max-h-48 scale-[0.93] opacity-40` — too small, cramped, clipped
2. Arrow buttons sit inline with cards (on top of the layout), not beside the center card
3. Center card uses `scale-[1.04]` — barely larger than side cards
4. Transition is a simple fade (`opacity: 0, y: 8` → `opacity: 1, y: 0`) — no spatial movement
5. Hover-to-expand uses `max-height` transition — feels janky, card is empty before hover
6. Buttons (View Live, Source) appear inside the expandable area — hidden by default
7. No pagination dots styling (plain white circles)
8. No "string pull" or elastic tether visual

### 7.3 High-Level Design

#### Layout Architecture
```
[section-kicker: // build log]
[heading + subheading]

[← arrow] [left-card (blurred)] [CENTER CARD (large)] [right-card (blurred)] [→ arrow]

[orbit pagination dots]
[counter: 1 / N]
```

#### Side Cards
- Width: 260px (up from 220px)
- No max-height clipping
- Opacity: 0.35
- Scale: 0.88
- `filter: blur(1px)` — subtle blur to push focus to center
- Subtle floating animation: `translateY` oscillates ±4px over 4s (CSS keyframe)
- `pointer-events: none` — clicking side cards does nothing (use arrows)

#### Center Card
- Scale: 1.0 (no artificial scaling — it's naturally larger because it has more content)
- Full `cosmic-card` background
- Always shows: title, tagline, tech chips, and a "case note" inner box
- On hover: expand to show full description + action buttons
- Minimum height: 280px so it never feels empty

#### Case Note Inner Box
A small dark panel inside the center card that shows a project metric or system note:
```
┌─────────────────────────────────┐
│ Title                           │
│ Tagline                         │
│ [chip] [chip] [chip]            │
│                                 │
│ ┌─ case note ─────────────────┐ │
│ │ Built with: Next.js + Sanity│ │
│ │ Status: Live · 2.3k visits  │ │
│ └─────────────────────────────┘ │
│                                 │
│ [View Live]  [Source]  (hover)  │
└─────────────────────────────────┘
```

#### Arrow Buttons
- Position: vertically centered beside the center card using `items-center` on the flex container
- Style: `.float-btn` with rounded-full, larger hit area (44px)
- Not inside the card flow — they're siblings of the card container

#### Transitions
Replace the simple fade with a spatial slide:
```typescript
// AnimatePresence variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
    scale: 0.92,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
    scale: 0.92,
  }),
};
```

Track `direction` state (1 for next, -1 for prev) and pass as `custom` to AnimatePresence.

#### Pagination Dots
Style as glowing orbit dots:
```css
/* Active dot */
.orbit-dot--active {
  width: 24px;
  height: 6px;
  border-radius: 3px;
  background: rgba(167, 139, 250, 0.8);
  box-shadow: 0 0 8px rgba(167, 139, 250, 0.5);
}

/* Inactive dot */
.orbit-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}
```

### 7.4 Low-Level: Rebuilt ProjectCard

```typescript
function ProjectCard({ project, isCenter }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);
  const tags = getTechTags(project);

  return (
    <article
      className={cn(
        "cosmic-card rounded-xl transition-all duration-300",
        isCenter ? "cursor-default" : "pointer-events-none opacity-35 scale-[0.88] blur-[1px]"
      )}
      onMouseEnter={() => isCenter && setHovered(true)}
      onMouseLeave={() => isCenter && setHovered(false)}
    >
      <div className="p-6">
        <h3 className="font-display text-xl font-semibold text-white">{project.title}</h3>
        {project.tagline && (
          <p className="mt-2 text-sm text-white/55 font-sans leading-relaxed">{project.tagline}</p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.map(tag => <span key={tag} className="orbit-chip">{tag}</span>)}
          </div>
        )}

        {/* Case note — always visible on center card */}
        {isCenter && (
          <div className="mt-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[11px] text-white/35 font-mono">case note</p>
            <p className="text-xs text-white/50 mt-1 font-sans">
              {project.category ? `Category: ${project.category}` : ""}
              {project.liveUrl ? " · Live" : ""}
              {project.githubUrl ? " · Open Source" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Expandable detail area */}
      {isCenter && (
        <motion.div
          initial={false}
          animate={{ height: hovered ? "auto" : 0, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="px-6 pb-6 border-t border-white/[0.06] pt-4">
            <div className="flex flex-wrap items-center gap-2">
              {project.liveUrl && <ViewLiveButton href={project.liveUrl} />}
              {project.githubUrl && <SourceButton href={project.githubUrl} />}
            </div>
          </div>
        </motion.div>
      )}
    </article>
  );
}
```

---

## 8. Skills Section

### 8.1 Files Modified
- `src/components/sections/SkillsSection.tsx`
- `src/components/sections/SkillsSectionClient.tsx` — Major rewrite

### 8.2 Current State Analysis

**Chart**: Horizontal `BarChart` from Recharts showing average percentage per category. Functional but visually boring — looks like a generic dashboard widget.

**Filter pills**: Round buttons that filter the category grid. No hover effects beyond color change. No interaction feedback.

**Skill pills**: Have `useIridescentEffect` overlay and 3D hover. Decent but only 2 effects.

### 8.3 High-Level Design

#### Replace Bar Chart with Multi-Line Trajectory Graph

A stock-market-style line chart showing skill progression over time:

**X-axis**: `2021 → 2022 → 2023 → 2024 → 2025 → 2026` (learning progression timeline)
**Y-axis**: `Familiarity / Applied Depth` (0-100 scale, but labeled as Low → High, NOT "Expert")

**Lines** (one per category):
- AI/ML — `#34d399` (green)
- Data Systems — `#fb923c` (orange)
- Backend — `#60a5fa` (blue)
- Frontend — `#8f7cf7` (violet)
- DevOps/Tools — `#f472b6` (pink)
- Soft Skills — `#94a3b8` (gray)

**Data**: Since Sanity skills don't have temporal data, generate synthetic trajectory data based on `yearsOfExperience` and `percentage` fields. Each category gets a line that starts low and curves up to its current average percentage.

**Interactions**:
- Hover a line: highlight it (opacity 1, stroke-width 3), dim others (opacity 0.2), show tooltip with category name + "Current direction: [trending up/stable]" + top 3 skills
- Click a line: same as selecting that category in the filter below

**Implementation**: Use Recharts `LineChart` with `Line` components. Custom tooltip. Custom legend (the category buttons below serve as legend).

#### Category Buttons with Unique Interactions

Each category button does something unique on hover/click:

| Category | Hover Effect | Click Action |
|----------|-------------|--------------|
| AI/ML | Pulse glow (border pulses violet→cyan→violet) | Filter + highlight chart line |
| Backend | Terminal cursor blink (blinking `_` after label) | Filter + highlight chart line |
| Frontend | Shimmer sweep (diagonal light sweep across button) | Filter + highlight chart line |
| DevOps/Tools | Deployment dots trail (3 dots animate left→right) | Filter + highlight chart line |
| Data Systems | Animated tick bars (tiny bar chart icon animates) | Filter + highlight chart line |
| Soft Skills | Subtle bounce (button bounces once on hover) | Filter + highlight chart line |

#### Insight Panel

A small panel below the category buttons that updates with the selected category:
```
┌─ insight ──────────────────────────────────────┐
│ Currently trending toward: AI/data systems     │
│ and retrieval workflows.                       │
│                                                │
│ Top skills: Python, LLM APIs, Prompt Eng.      │
└────────────────────────────────────────────────┘
```

### 8.4 Low-Level: Trajectory Data Generation

```typescript
function generateTrajectoryData(skills: SKILLS_QUERYResult) {
  const years = [2021, 2022, 2023, 2024, 2025, 2026];
  const categories = [...new Set(skills.map(s => s.category ?? "other"))];

  return years.map(year => {
    const point: Record<string, number> = { year };
    for (const cat of categories) {
      const catSkills = skills.filter(s => s.category === cat);
      const avgPct = catSkills.reduce((sum, s) => sum + (s.percentage ?? 0), 0) / (catSkills.length || 1);
      const avgYears = catSkills.reduce((sum, s) => sum + (s.yearsOfExperience ?? 0), 0) / (catSkills.length || 1);

      // Synthetic curve: starts at 10%, grows toward avgPct based on years of experience
      const yearsSince2021 = year - 2021;
      const growthFactor = Math.min(1, yearsSince2021 / Math.max(avgYears, 1));
      const eased = 1 - Math.pow(1 - growthFactor, 2); // ease-out curve
      point[cat] = Math.round(10 + (avgPct - 10) * eased);
    }
    return point;
  });
}
```

### 8.5 Low-Level: Category Button Effects

```typescript
// AI/ML pulse effect
function PulseEffect() {
  return (
    <span className="absolute inset-0 rounded-full animate-pulse-glow pointer-events-none" />
  );
}

// Backend cursor blink
function CursorBlink() {
  return <span className="ml-1 animate-blink text-white/50">_</span>;
}

// Frontend shimmer sweep
function ShimmerSweep() {
  return (
    <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700
        bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </span>
  );
}

// DevOps deployment dots
function DeployDots() {
  return (
    <span className="ml-1.5 flex gap-0.5">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-1 h-1 rounded-full bg-pink-400/60 animate-deploy-dot"
          style={{ animationDelay: `${i * 150}ms` }} />
      ))}
    </span>
  );
}
```

Add corresponding keyframes to `globals.css`:
```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(167,139,250,0.3); }
  50% { box-shadow: 0 0 0 4px rgba(167,139,250,0.1); }
}
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@keyframes deploy-dot {
  0% { transform: translateX(0); opacity: 0.3; }
  50% { opacity: 1; }
  100% { transform: translateX(8px); opacity: 0.3; }
}
```


---

## 9. Education Section

### 9.1 Files Modified
- `src/components/sections/EducationSection.tsx`
- `src/components/EducationEntry.tsx` — Replace with new flowchart component
- New: `src/components/EducationFlowchart.tsx`

### 9.2 Current State Analysis

Plain 2-column grid of CometCard entries. Each card shows degree, field of study, institution, description, GPA. No visual hierarchy between education levels. Looks identical to every other card section.

### 9.3 High-Level Design

#### Life-Form Flowchart Concept

Replace the grid with a vertical flowchart where each education stage is represented by a floating organic shape that evolves from chaotic to stable:

```
        ┌─────────────────┐
        │  🟣 College      │  ← Almost perfect sphere, glowing, stable
        │  (near-perfect)  │
        └────────┬────────┘
                 │ ← Dotted glowing connector with traveling pulse
        ┌────────┴────────┐
        │  🟤 High School  │  ← Less deformed, more formed
        │  (forming)       │
        └────────┬────────┘
                 │
        ┌────────┴────────┐
        │  🔴 Middle School│  ← Most deformed amoeba-like shape
        │  (amoeba)        │
        └─────────────────┘
```

#### Shape Implementation

Use CSS `border-radius` with animated values to create organic blob shapes. No SVG morph needed — CSS is sufficient:

```css
/* Amoeba (middle school) — most deformed */
.edu-blob--amoeba {
  border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
  animation: blob-morph-chaotic 8s ease-in-out infinite;
}

/* Forming (high school) — less deformed */
.edu-blob--forming {
  border-radius: 45% 55% 55% 45% / 48% 52% 48% 52%;
  animation: blob-morph-forming 6s ease-in-out infinite;
}

/* Stable (college) — near-perfect sphere */
.edu-blob--stable {
  border-radius: 48% 52% 50% 50% / 49% 51% 49% 51%;
  animation: blob-morph-stable 10s ease-in-out infinite;
  box-shadow: 0 0 30px rgba(167, 139, 250, 0.15), 0 0 60px rgba(167, 139, 250, 0.05);
}
```

#### Connectors
Dotted vertical lines between shapes with a traveling light pulse:
```css
.edu-connector {
  width: 2px;
  height: 60px;
  background: repeating-linear-gradient(
    to bottom,
    rgba(167, 139, 250, 0.4) 0px,
    rgba(167, 139, 250, 0.4) 4px,
    transparent 4px,
    transparent 8px
  );
  position: relative;
}

.edu-connector::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 12px;
  border-radius: 2px;
  background: rgba(167, 139, 250, 0.8);
  box-shadow: 0 0 8px rgba(167, 139, 250, 0.6);
  animation: pulse-travel 3s ease-in-out infinite;
}

@keyframes pulse-travel {
  0% { top: 0; opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
```

#### Text Placement
Text sits beside each blob shape (right side on desktop, below on mobile) with a dark backing panel for readability:
- Degree name (bold, white)
- Field of study (white/60)
- Institution (white/50)
- Date range (white/40)
- GPA badge (if available)

#### Mobile Layout
Stack vertically with shorter connectors (30px). Blobs shrink to 120px. Text below each blob.

### 9.4 Low-Level: EducationFlowchart Component

```typescript
// src/components/EducationFlowchart.tsx
"use client";
import { motion } from "motion/react";
import type { Education } from "@/sanity/types";

const BLOB_VARIANTS = ["stable", "forming", "amoeba"] as const;
const BLOB_SIZES = ["w-44 h-44", "w-36 h-36", "w-28 h-28"] as const;
const BLOB_COLORS = [
  "bg-gradient-to-br from-violet-500/20 to-cyan-500/10",
  "bg-gradient-to-br from-violet-500/15 to-blue-500/8",
  "bg-gradient-to-br from-violet-500/10 to-pink-500/5",
] as const;

interface Props {
  items: Education[];
}

export function EducationFlowchart({ items }: Props) {
  // Sort: most recent first (college at top)
  const sorted = [...items].sort((a, b) =>
    (b.startDate ?? "").localeCompare(a.startDate ?? "")
  );

  return (
    <div className="flex flex-col items-center gap-0">
      {sorted.map((edu, i) => {
        const variant = BLOB_VARIANTS[Math.min(i, 2)];
        const size = BLOB_SIZES[Math.min(i, 2)];
        const color = BLOB_COLORS[Math.min(i, 2)];

        return (
          <div key={edu._id}>
            {/* Connector (not before first item) */}
            {i > 0 && <div className="edu-connector mx-auto" />}

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="flex flex-col md:flex-row items-center gap-6"
            >
              {/* Blob shape */}
              <div className={`edu-blob--${variant} ${size} ${color} border border-white/10
                flex items-center justify-center shrink-0`}>
                <span className="text-white/20 text-xs font-mono">
                  {i === 0 ? "●" : i === 1 ? "◐" : "◌"}
                </span>
              </div>

              {/* Text panel */}
              <div className="cosmic-card rounded-xl p-4 max-w-xs">
                <h3 className="text-base font-display font-semibold text-white">{edu.degree}</h3>
                {edu.fieldOfStudy && <p className="text-sm text-white/60 mt-0.5">in {edu.fieldOfStudy}</p>}
                <p className="text-sm text-white/50 mt-1">{edu.institution}</p>
                <p className="text-xs text-white/35 mt-1 font-mono">
                  {edu.startDate ? new Date(edu.startDate).getFullYear() : ""} —{" "}
                  {edu.current ? "Present" : edu.endDate ? new Date(edu.endDate).getFullYear() : ""}
                </p>
                {edu.gpa && (
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/15 text-xs text-white/70">
                    GPA: {edu.gpa}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
```

---

## 10. Certifications Section

### 10.1 Files Modified
- `src/components/sections/CertificationsSection.tsx`

### 10.2 Design Changes

> **Why it feels wrong now**: The certification cards use the default CometCard with no background variant, so they're either too shiny or too transparent depending on the Three.js sphere position behind them. They look like "just moving cards" with no personality — the user explicitly called this out. The goal is compact, readable credential cards that feel like official documents floating in space, not generic hover widgets.

- Add kicker: `// credentials`
- Replace bare `<div className="p-6">` card content with `cosmic-card--dark` styling
- Add CometCard `variant="dark"` prop
- Each card structure:
  - Issuer badge/icon area (top-left, small)
  - Certification title (h3, white, semibold)
  - Issuer name + date (white/50, small)
  - Skill tags row using `.orbit-chip` (if skills reference is added to query)
  - "View Credential →" action link styled as `.float-btn` micro variant
  - Subtle holographic corner accent: a small `::after` pseudo-element with a radial gradient in the top-right corner

### 10.3 Low-Level: Holographic Corner Accent

```css
.cert-card::after {
  content: '';
  position: absolute;
  top: -1px;
  right: -1px;
  width: 40px;
  height: 40px;
  border-radius: 0 var(--radius-xl) 0 0;
  background: radial-gradient(
    circle at 100% 0%,
    rgba(167, 139, 250, 0.15) 0%,
    rgba(139, 200, 250, 0.08) 40%,
    transparent 70%
  );
  pointer-events: none;
}
```

---

## 11. Achievements Section

### 11.1 Files Modified
- `src/components/sections/AchievementsSection.tsx`

### 11.2 Current State Analysis

Already has a clean ledger/list style with year, title, type chip, description, external link. The structure is good but needs visual polish.

### 11.3 Design Changes

> **Why it feels wrong now**: The achievements section currently looks like every other card-based section. The user explicitly wants this to be "completely unique" and "different from all the above components that are in cards and next to each other." The ledger/list approach is already partially there, but it needs to float as a single cohesive unit and have its own visual identity (the glowing rail) rather than just being rows with borders.

- **No section kicker** (cleaner without — user's preference)
- Wrap the entire ledger in a single `CometCard` with `variant="subtle"` — the whole section floats as one card
- Add a single vertical glowing rail on the left side (similar to experience timeline but thinner and more subtle)
- Each row gets a subtle hover: `hover:bg-[rgba(167,139,250,0.04)]` (already exists) + left rail dot glows brighter
- Remove any emojis (none currently, but guard against Sanity content)
- Type chip: use `.orbit-chip` styling
- External link icon: add `.float-btn` micro hover

### 11.4 Low-Level: Ledger Rail

```typescript
// Add to each achievement row:
<div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-full bg-violet-500/10 group-hover:bg-violet-500/25 transition-colors" />
<div className="absolute left-[-2px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-violet-500/30 group-hover:bg-violet-500/60 transition-colors" />
```

---

## 12. Blog Section

### 12.1 Files Modified
- `src/components/sections/BlogSection.tsx`
- `src/components/BlogFeed.tsx`

### 12.2 Design Changes

- Add kicker: `// uplink`
- **GitHub pinned card**: Keep the violet left border. Apply `cosmic-card` background. Make "Visit →" a `.float-btn` micro button with magnetic hover (slight pull toward cursor on approach). Add GitHub icon more prominently.
- **Resource cards**: Replace `bg-white/[0.02]` with `cosmic-card`. Add `.orbit-chip` for category. Hover: lift + border glow (already has 3D hover via `card3d` — keep but add border glow).
- **Archive toggle**: Requires adding `archived: boolean` field to blog Sanity schema. Add a client-side toggle: "Show all" / "Hide archived". Default: hide archived. This is a schema change task.

> **⚡ STRETCH GOAL** — The archive toggle requires a Sanity schema migration (`pnpm typegen` after adding the field). Do not block Blog visual improvements on this. Implement the toggle only after the schema field is added in a separate task.

### 12.3 Low-Level: Magnetic Hover for Visit Button

```typescript
// Magnetic hover: button slightly moves toward cursor when cursor is nearby
function MagneticButton({ href, children }: { href: string; children: React.ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.15;
    const dy = (e.clientY - cy) * 0.15;
    setOffset({ x: dx, y: dy });
  };

  const handleMouseLeave = () => setOffset({ x: 0, y: 0 });

  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)`, transition: "transform 200ms ease" }}
      className="float-btn text-xs text-violet-300/90 hover:text-violet-200 font-sans px-3 py-1 rounded-full border border-violet-500/30"
    >
      {children}
    </a>
  );
}
```

---

## 13. Contact Section

### 13.1 Files Modified
- `src/components/sections/ContactSection.tsx`
- `src/components/ContactPanel.tsx`

### 13.2 Design Changes

- Add kicker: `// uplink`
- **Heading**: Change from "Tired of chatting to my AI Twin?" to `Let's build something`
- **Subheading**: `Internships, collaborations, or just to say hi.`
- **Card**: Smaller (`max-w-md` instead of `max-w-xl`), centered, `cosmic-card` background
- **Email**: Centered and prominent. Add "Open Mail" button next to Copy button.
- **Social buttons**: Add Instagram icon. All social buttons pop out as floating circular buttons with `.float-btn` styling. Arrange in a centered row.
- **Remove**: "I'm a real person. Reach out directly." — replace with the subheading above

### 13.3 Low-Level: Updated ContactPanel Structure

```typescript
// Key structural changes:
<section id="contact" className="mx-auto max-w-6xl px-6 py-24">
  <div className="mx-auto max-w-md text-center">
    <p className="section-kicker">// uplink</p>
    <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
      Let's build something
    </h2>
    <p className="mt-2 text-base text-white/45 font-sans">
      Internships, collaborations, or just to say hi.
    </p>
  </div>

  <div className="mx-auto mt-10 max-w-md">
    <CometCard variant="subtle" rotateDepth={8} translateDepth={10}>
      <div className="cosmic-card rounded-xl p-6 text-center">
        {/* Email — centered */}
        <p className="text-lg text-white/85 font-medium">{email}</p>
        <div className="flex justify-center gap-2 mt-3">
          <button className="float-btn ...">Copy</button>
          <a href={`mailto:${email}`} className="float-btn ...">Open Mail</a>
        </div>

        <div className="my-5 border-t border-white/[0.06]" />

        {/* Social buttons — centered floating circles */}
        <div className="flex justify-center gap-3">
          {/* GitHub, LinkedIn, Instagram, Twitter, Website, Email */}
        </div>
      </div>
    </CometCard>
  </div>
</section>
```

---

## 14. Footer

### 14.1 Files Modified
- `src/components/Footer.tsx`

### 14.2 Design Changes

> **Why it feels wrong now**: The user called the current footer "the ugliest thing I have seen in my entire life." The center text ("Built in the dark. Shipped with intention.") reads as cringe. The layout is unbalanced — year on the left, long text in center, tiny back-to-top on right. The footer should be minimal, clean, and aligned — it's the last thing visitors see.

Complete replacement. Current footer has "Built in the dark. Shipped with intention." which the user finds cringe.

**New layout**:
```
[</>]                    [↑ Back to top]                    [© 2026 Anant Gupta · building in public]
```

- **Left**: `</>` developer glyph in `font-mono text-white/20`
- **Center**: Back to top button styled as `.float-btn` with ArrowUp icon
- **Right**: `© 2026 Anant Gupta · building in public` in `text-xs text-white/25`
- **Top border**: Subtle gradient from transparent → violet/20 → transparent
- **Background**: Transparent (`bg-transparent`)

### 14.3 Low-Level: New Footer

```typescript
export function Footer() {
  return (
    <footer className="relative w-full px-6 py-6">
      {/* Top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.2), transparent)" }}
      />

      <div className="mx-auto flex max-w-6xl items-center justify-between">
        {/* Left: developer glyph */}
        <span className="font-mono text-sm text-white/20" aria-hidden>&lt;/&gt;</span>

        {/* Center: back to top */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="float-btn inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-white/40 hover:text-white/70"
        >
          <ArrowUp className="size-3" strokeWidth={1.75} />
          Back to top
        </button>

        {/* Right: copyright */}
        <span className="text-xs text-white/25 font-sans">
          © 2026 Anant Gupta · building in public
        </span>
      </div>
    </footer>
  );
}
```


---

## 15. AI / Portfolio Lab

### 15.1 Files Modified
- `src/components/SidebarToggle.tsx` — Restyle as Portfolio Lab launcher
- `src/components/app-sidebar.tsx` — Replace ChatWrapper with PortfolioLab
- `src/components/chat/Chat.tsx` — Deprecate (keep file, remove from UI)
- `src/components/chat/ChatWrapper.tsx` — Deprecate
- New: `src/components/lab/PortfolioLab.tsx` — Main lab panel
- New: `src/components/lab/LabMode.tsx` — Mode selector
- New: `src/components/lab/EvidenceCard.tsx` — Evidence card linking to sections
- New: `src/components/lab/ProofPack.tsx` — Proof pack generator
- New: `src/lib/lab-data.ts` — Static/deterministic response data

### 15.2 Design Philosophy

> **Why the current chat feels wrong**: The existing sidebar is an OpenAI ChatKit chatbot gated behind Clerk authentication. Visitors must sign in to use it, every interaction costs API money, and the responses are generic LLM output. The user explicitly said: "I do not want to do a basic chatbot... I do not want to pay for the user to chat to my AI twin. I want to be a professional developer and build this AI system myself." The Portfolio Lab should feel like something Anant *built*, not something he *plugged in*.

This is THE standout feature. It should NOT be a chatbot. It's an interactive command center that lets visitors explore Anant's portfolio through different lenses. All responses are static/deterministic — no API calls, no cost per visitor.

### 15.3 High-Level Architecture

```
┌─ Portfolio Lab ──────────────────────────────────┐
│                                                   │
│  [Mode Selector: Recruiter | Builder | Research | Skeptic]  │
│                                                   │
│  ┌─ Content Area ──────────────────────────────┐ │
│  │                                              │ │
│  │  [Suggested chips / questions]               │ │
│  │                                              │ │
│  │  [Evidence cards / response cards]           │ │
│  │                                              │ │
│  │  [Mini skill/project graph]                  │ │
│  │                                              │ │
│  └──────────────────────────────────────────────┘ │
│                                                   │
│  [Generate Proof Pack]                            │
│                                                   │
│  ┌─ Input ─────────────────────────────────────┐ │
│  │ Ask about skills, projects, experience...    │ │
│  └──────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────┘
```

### 15.4 Modes

#### Recruiter Mode
- **Purpose**: Role-fit proof packs, skills evidence, experience highlights
- **Suggested chips**: "Is Anant a good fit for [role]?", "Show me AI/ML experience", "What's his tech stack?", "Leadership examples"
- **Response format**: Evidence cards with section links
- **Special feature**: "Generate Proof Pack" button creates a downloadable text summary

#### Builder Mode
- **Purpose**: Project breakdowns, architecture notes, technical decisions
- **Suggested chips**: "How was this portfolio built?", "Show project architectures", "What's the data pipeline?", "Tech stack decisions"
- **Response format**: Technical cards with code snippets and architecture notes

#### Research Mode
- **Purpose**: AI/data systems timeline, learning trajectory, research interests
- **Suggested chips**: "What's Anant learning now?", "AI research timeline", "Data systems progression", "Future directions"
- **Response format**: Timeline cards, trajectory visualization

#### Skeptic Mode
- **Purpose**: Claim checker with source/evidence cards
- **Suggested chips**: "Prove the AI/ML skills", "Show real project impact", "Verify experience claims", "What's the evidence?"
- **Response format**: Claim → Evidence pairs with links to external sources

### 15.5 Low-Level: Static Response System

```typescript
// src/lib/lab-data.ts

export type LabMode = "recruiter" | "builder" | "research" | "skeptic";

export interface LabChip {
  label: string;
  responseKey: string;
}

export interface EvidenceItem {
  title: string;
  description: string;
  sectionLink?: string; // e.g., "#experience", "#projects"
  tags?: string[];
  source?: string; // external URL for skeptic mode
}

export interface LabResponse {
  heading: string;
  summary: string;
  evidence: EvidenceItem[];
}

export const LAB_CHIPS: Record<LabMode, LabChip[]> = {
  recruiter: [
    { label: "Tech stack overview", responseKey: "recruiter-stack" },
    { label: "AI/ML experience", responseKey: "recruiter-ai" },
    { label: "Leadership examples", responseKey: "recruiter-leadership" },
    { label: "Is Anant a good fit?", responseKey: "recruiter-fit" },
  ],
  builder: [
    { label: "How was this built?", responseKey: "builder-portfolio" },
    { label: "Project architectures", responseKey: "builder-arch" },
    { label: "Tech decisions", responseKey: "builder-decisions" },
  ],
  research: [
    { label: "Current learning", responseKey: "research-current" },
    { label: "AI research timeline", responseKey: "research-ai" },
    { label: "Future directions", responseKey: "research-future" },
  ],
  skeptic: [
    { label: "Prove AI/ML skills", responseKey: "skeptic-ai" },
    { label: "Show project impact", responseKey: "skeptic-impact" },
    { label: "Verify experience", responseKey: "skeptic-experience" },
  ],
};

export const LAB_RESPONSES: Record<string, LabResponse> = {
  "recruiter-stack": {
    heading: "Tech Stack Overview",
    summary: "Full-stack engineer with depth in AI/data systems and modern web.",
    evidence: [
      {
        title: "Frontend",
        description: "React, Next.js, TypeScript, Tailwind CSS, Three.js",
        sectionLink: "#skills",
        tags: ["frontend"],
      },
      {
        title: "Backend & Data",
        description: "Rust, Python, PostgreSQL, data pipelines, LLM APIs",
        sectionLink: "#skills",
        tags: ["backend", "ai-ml"],
      },
      {
        title: "Infrastructure",
        description: "Docker, Linux, Git, CI/CD, cloud deployments",
        sectionLink: "#skills",
        tags: ["devops"],
      },
    ],
  },
  // ... more responses populated from Sanity data at build time or hardcoded
};
```

### 15.6 Low-Level: PortfolioLab Component

```typescript
// src/components/lab/PortfolioLab.tsx
"use client";
import { useState } from "react";
import { LAB_CHIPS, LAB_RESPONSES, type LabMode, type LabResponse } from "@/lib/lab-data";
import { EvidenceCard } from "./EvidenceCard";
import { LabModeSelector } from "./LabMode";
import { ProofPack } from "./ProofPack";

export function PortfolioLab() {
  const [mode, setMode] = useState<LabMode>("recruiter");
  const [activeResponse, setActiveResponse] = useState<LabResponse | null>(null);
  const chips = LAB_CHIPS[mode];

  const handleChipClick = (responseKey: string) => {
    const response = LAB_RESPONSES[responseKey];
    if (response) setActiveResponse(response);
  };

  return (
    <div className="flex flex-col h-full bg-[#07070d]">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-display font-semibold text-white/80">Portfolio Lab</h2>
          <button onClick={/* close sidebar */} className="text-white/30 hover:text-white/60">✕</button>
        </div>
        <LabModeSelector mode={mode} onChange={setMode} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Suggested chips */}
        <div className="flex flex-wrap gap-2">
          {chips.map(chip => (
            <button
              key={chip.responseKey}
              onClick={() => handleChipClick(chip.responseKey)}
              className="float-btn orbit-chip text-xs"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Response area */}
        {activeResponse && (
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white/85">{activeResponse.heading}</h3>
            <p className="text-sm text-white/55">{activeResponse.summary}</p>
            {activeResponse.evidence.map((item, i) => (
              <EvidenceCard key={i} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="p-4 border-t border-white/[0.06]">
        {mode === "recruiter" && <ProofPack />}
      </div>
    </div>
  );
}
```

### 15.7 Low-Level: Launcher Button

Update `SidebarToggle.tsx`:
- Replace `MessageSquare` icon with a custom lab icon (beaker or terminal)
- Tooltip: `Ask the lab, not my sleep schedule.`
- Remove Clerk auth gate — Portfolio Lab is free for everyone
- Replace all "AI Twin" / "Chat with" text
- Keep `.float-btn` styling with a subtle pulse animation when idle

### 15.8 Proof Pack Generator

Client-side only — generates a text summary from the static lab data:

```typescript
// src/components/lab/ProofPack.tsx
export function ProofPack() {
  const generatePack = () => {
    const text = `
ANANT GUPTA — PORTFOLIO PROOF PACK
Generated: ${new Date().toLocaleDateString()}

TECH STACK: React, Next.js, TypeScript, Rust, Python, PostgreSQL, LLM APIs, Docker
EXPERIENCE: [list from Sanity data]
PROJECTS: [list from Sanity data]
EDUCATION: University of Minnesota-Twin Cities, B.S. Computer Science

View full portfolio: [site URL]
    `.trim();

    navigator.clipboard.writeText(text);
    // Show "Copied!" toast
  };

  return (
    <button onClick={generatePack} className="float-btn w-full rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs text-violet-300">
      Generate Proof Pack
    </button>
  );
}
```

---

## 16. Floating Dock / Bottom UI

### 16.1 Files Modified
- `src/components/FloatingDock.tsx`
- `src/components/FloatingDockClient.tsx`
- `src/components/PortfolioContent.tsx` (remove FloatingDock if not used)

### 16.2 Design Decision

The FloatingDockClient renders a bottom-center nav bar that duplicates the header navigation. With the improved header (active section state, mobile menu), this dock is redundant.

**Decision**: Remove the FloatingDock entirely. The header handles all navigation. The bottom-right AI Lab launcher is the only fixed bottom element.

**Mobile overlap prevention**: The AI Lab launcher (`fixed bottom-6 right-6`) and footer must not overlap. The footer has `py-6` padding. The launcher sits above the footer because it's `z-50` and `fixed`. No overlap issue.

---

## 17. Accessibility & Responsiveness

### 17.1 Accessible Names
- All buttons: `aria-label` on icon-only buttons (carousel arrows, social icons, AI Lab launcher, back-to-top)
- Mobile menu: `aria-label="Open navigation"` on hamburger, focus trap inside Sheet
- Carousel: `aria-label="Projects carousel"`, `aria-label="Previous project"`, `aria-label="Next project"`
- AI Lab: `aria-label="Open Portfolio Lab"` on launcher

### 17.2 Keyboard Navigation
- Carousel: Arrow keys already work (keep)
- AI Lab: Escape closes the sidebar (add `onKeyDown` handler)
- Tab order: Ensure all interactive elements are reachable
- Focus visible: Already using `focus-visible:ring-2` pattern

### 17.3 Reduced Motion
- ObsidianBackground: Already respects `prefers-reduced-motion` with reduced drift/pull values
- CSS animations (blob morph, pulse travel, deploy dots): Wrap in `@media (prefers-reduced-motion: no-preference)` — disable animations for users who prefer reduced motion
- Framer Motion: Add `transition={{ duration: reducedMotion ? 0 : 0.5 }}` pattern

```css
@media (prefers-reduced-motion: reduce) {
  .edu-blob--amoeba,
  .edu-blob--forming,
  .edu-blob--stable,
  .edu-connector::after,
  .animate-pulse-glow,
  .animate-deploy-dot {
    animation: none !important;
  }
}
```

### 17.4 Responsive Breakpoints
- **Mobile (<768px)**: Single column layouts, stacked education flowchart, hidden side project cards, hamburger menu, smaller blob shapes
- **Tablet (768-1024px)**: 2-column grids, side project cards visible but smaller
- **Desktop (1024-1280px)**: Full layouts
- **Wide (>1280px)**: `max-w-6xl` container prevents content from stretching

### 17.5 Text Readability
- `.section-backdrop::before` ensures dark backing behind text over Three.js
- All text colors maintain WCAG AA contrast against `cosmic-card` backgrounds
- `cosmic-card` background opacity (0.72-0.88) ensures text is always readable

---

## 18. Verification Checklist

### 18.1 Build Verification
```bash
pnpm typecheck   # TypeScript compilation
pnpm build       # Full production build
```

### 18.2 Content Cleanup
Search and remove all instances of:
- `"AI Twin"` — replace with "Portfolio Lab"
- `"Chat with Anant"` — replace with "Portfolio Lab"
- `"ChatKit"` — remove from visible UI (keep package for now)
- `"Alex Morgan"` — should not exist, but verify
- `"Built in the dark. Shipped with intention."` — removed in footer redesign
- `"Tired of chatting to my AI Twin?"` — replaced in contact section

### 18.3 Visual Testing
Test each section on:
- Mobile (375px width)
- Tablet (768px width)
- Desktop (1280px width)
- Wide (1920px width)

Verify:
- [ ] Hero layout (terminal module or image)
- [ ] About telemetry cards
- [ ] Experience timeline alignment (dots centered with card titles)
- [ ] Projects carousel transitions (spatial slide, not just fade)
- [ ] Skills graph hover/filter interactions
- [ ] Education organic flowchart (blob shapes, connectors)
- [ ] Certifications darker cards with holographic accent
- [ ] Achievements ledger with glowing rail
- [ ] Blog cards with improved contrast
- [ ] Contact centered email + social buttons
- [ ] Footer three-column layout
- [ ] AI Lab open/close and static interactions
- [ ] All buttons float at rest
- [ ] Section kickers visible
- [ ] No text overlap with Three.js background
- [ ] Keyboard navigation works for carousel and AI Lab
- [ ] Reduced motion respected

---

## Component Dependency Graph

```
PortfolioContent.tsx (server)
├── HeaderScrolling.tsx (client) — uses useActiveSection, useShowOnScroll
├── ObsidianBackground (client/dynamic) — Three.js canvas
├── HeroSection.tsx (server)
│   └── HeroContent.tsx (client) — uses HeroTerminal
│       └── HeroTerminal.tsx (client) — new
├── AboutSection.tsx (server)
│   └── AboutTelemetry.tsx (client) — new
├── ExperienceSection.tsx (server)
│   └── ExperienceCard.tsx (client) — uses CometCard(variant="dark")
├── ProjectsSlider.tsx (client) — rebuilt carousel
├── SkillsSection.tsx (server)
│   └── SkillsSectionClient.tsx (client) — rebuilt with LineChart + effects
├── EducationSection.tsx (server)
│   └── EducationFlowchart.tsx (client) — new, replaces EducationEntry
├── CertificationsSection.tsx (server) — uses CometCard(variant="dark")
├── AchievementsSection.tsx (server) — wrapped in CometCard(variant="subtle")
├── BlogSection.tsx (server)
│   └── BlogFeed.tsx (client) — uses MagneticButton
├── ContactSection.tsx (server)
│   └── ContactPanel.tsx (client) — restructured
└── Footer.tsx (client) — rebuilt

AppSidebar.tsx (server)
└── PortfolioLab.tsx (client) — new, replaces ChatWrapper
    ├── LabModeSelector.tsx (client) — new
    ├── EvidenceCard.tsx (client) — new
    └── ProofPack.tsx (client) — new

SidebarToggle.tsx (client) — restyled as Lab launcher

globals.css — new utilities: .cosmic-card, .float-btn, .section-kicker, .orbit-chip, blob keyframes
comet-card.tsx — variant prop added
```

---

## New Files Summary

| File | Type | Purpose |
|------|------|---------|
| `.kiro/specs/portfolio-ui-enhancement/ui-enhancement.md` | Documentation | UI intent source of truth — owns taste, priorities, copy, acceptance criteria |
| `src/components/HeroTerminal.tsx` | Client | Floating terminal module for hero |
| `src/components/AboutTelemetry.tsx` | Client | Telemetry stat cards |
| `src/components/EducationFlowchart.tsx` | Client | Organic blob flowchart |
| `src/components/lab/PortfolioLab.tsx` | Client | Main lab panel |
| `src/components/lab/LabMode.tsx` | Client | Mode selector tabs |
| `src/components/lab/EvidenceCard.tsx` | Client | Evidence card with section links |
| `src/components/lab/ProofPack.tsx` | Client | Proof pack generator |
| `src/lib/lab-data.ts` | Shared | Static lab response data |
| `src/hooks/useActiveSection.ts` | Client | Active section detection |

## Deprecated Files

| File | Action |
|------|--------|
| `src/components/chat/Chat.tsx` | Keep file, remove from visible UI |
| `src/components/chat/ChatWrapper.tsx` | Keep file, remove from sidebar |
| `src/components/FloatingDock.tsx` | Remove |
| `src/components/FloatingDockClient.tsx` | Remove |
| `src/components/sections/ProfileImage.tsx` | Conditionally used (keep) |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Hero terminal fallback rendering

*For any* profile data where `profileImageUrl` is null or undefined, the Hero Section SHALL render a HeroTerminal component in the right grid column, and the rendered output SHALL contain the terminal command prompts `$ whoami`, `$ stack --top`, and `$ status`.

**Validates: Requirement 4.4**

### Property 2: Telemetry card completeness

*For any* stat object with a `label` and `value` passed to a Telemetry_Card, the rendered output SHALL contain an icon element, the stat value text, the label text, and sparkline dot elements.

**Validates: Requirement 5.3**

### Property 3: Experience tech tags use orbit-chip

*For any* experience entry with a non-empty `technologies` array, each rendered technology tag SHALL have the `orbit-chip` CSS class applied.

**Validates: Requirement 6.5**

### Property 4: Center project card always shows required content

*For any* project displayed as the center card in the carousel, the rendered card SHALL contain the project title, tagline (when present), technology chips using Orbit_Chip styling, and a case-note inner panel — all visible without hover interaction.

**Validates: Requirement 7.5**

### Property 5: Skills category filter correctness

*For any* category selection in the Skills Section, every skill displayed in the filtered grid SHALL belong to the selected category, and no skills from other categories SHALL be visible.

**Validates: Requirement 8.4**

### Property 6: Education flowchart blob variant ordering

*For any* list of education items sorted by start date descending, the blob variant assigned to each item SHALL progress from `stable` (index 0, most recent) through `forming` to `amoeba` (oldest), such that more recent education always receives a more stable shape than older education.

**Validates: Requirement 9.3**

### Property 7: Education text panel field completeness

*For any* education item rendered in the Education_Flowchart, the text panel SHALL display the degree name, and SHALL display the field of study, institution, date range, and GPA when those fields are present in the data.

**Validates: Requirement 9.5**

### Property 8: Certification card required elements

*For any* certification with populated fields, the rendered card SHALL display the certification title, issuer name, issue date, and a View Credential link (when `credentialUrl` is present).

**Validates: Requirement 10.3**

### Property 9: Achievement type labels use orbit-chip

*For any* achievement with a non-null `type` field, the rendered type label SHALL use the `orbit-chip` CSS class.

**Validates: Requirement 11.4**

### Property 10: Blog card styling and category chips

*For any* blog post rendered as a card, the card element SHALL use Cosmic_Card styling (not `bg-white/[0.02]`), and when the post has a `category` field, the category label SHALL use the `orbit-chip` CSS class.

**Validates: Requirements 12.3, 12.4**

### Property 11: Banned text exclusion across all components

*For any* rendered state of the Portfolio_Site, the visible text content SHALL NOT contain the strings "AI Twin", "Chat with Anant", "Chat with AI Twin", "ChatKit" (as visible branding), "Tired of chatting to my AI Twin", "I'm a real person. Reach out directly.", or "Built in the dark. Shipped with intention."

**Validates: Requirements 13.6, 15.8, 16.1, 16.2, 16.3, 16.4, 16.5**

### Property 12: Portfolio Lab mode-chip mapping

*For any* Lab_Mode selection (Recruiter, Builder, Research, Skeptic), the displayed suggested chips SHALL exactly match the pre-defined chip set for that mode in the lab data, and each chip SHALL have a non-empty label and a valid response key.

**Validates: Requirement 15.4**

### Property 13: Portfolio Lab response completeness

*For any* suggested chip click in the Portfolio Lab, the displayed response SHALL contain a non-empty heading, a non-empty summary, and at least one Evidence_Card. When an Evidence_Card has a `sectionLink`, the card SHALL render an anchor element whose href matches the section link value.

**Validates: Requirements 15.5, 15.6**

### Property 14: Icon-only button accessibility

*For any* button rendered on the Portfolio_Site that contains only an icon (no visible text), the button element SHALL have a non-empty `aria-label` attribute.

**Validates: Requirement 17.1**

### Property 15: Section backdrop application

*For any* section in the set {About, Experience, Skills, Education, Certifications, Blog, Contact}, the section element SHALL have the `section-backdrop` CSS class applied. The Hero section SHALL NOT have the `section-backdrop` class.

**Validates: Requirements 17.4, 19.4**
