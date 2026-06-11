---
inclusion: fileMatch
fileMatchPattern: "src/components/orby/**/*"
---

# Orby Scroll Companion — Implementation Guide

Reference spec: `ORBY.md` at project root.

## What Orby Is

A tiny decorative astronaut that floats near the bottom-right on first load, briefly introduces the Portfolio Lab, then roams left-to-right across the bottom viewport as the user scrolls. He is **not** interactive, **not** a chatbot, and **not** an input surface.

## File Structure

```
src/components/orby/
├── Orby.tsx              # Root wrapper: state machine, scroll binding, reduced-motion gate
├── OrbyCharacter.tsx     # Visual character (CSS 3D layers or Three.js mini canvas)
├── OrbySpeechCloud.tsx   # Typed text bubble + arrow pointer
├── useScrollProgress.ts  # Hook: returns normalized 0–1 scroll progress
├── useTypedText.ts       # Hook: typed-text animation with cleanup
├── orby.constants.ts     # Copy bank, timing values, breakpoints
└── orby.types.ts         # OrbyState union, config types
```

## State Machine

States are derived from scroll progress + time since mount + sidebar open state + `prefers-reduced-motion`.

```
intro → pointing → roaming → exitingLeft → returningRight → goodbye
                                                               ↓
                                                         (reducedMotion — static fallback at any point)
```

Transitions:
- `intro`: 0–5 s after mount, scroll < 5%.
- `pointing`: after intro ends, scroll < 10%.
- `roaming`: scroll 10%–85%.
- `exitingLeft`: scroll 85%–95%.
- `returningRight`: scroll 95%–99%.
- `goodbye`: scroll ≥ 99%.
- `reducedMotion`: always, when media query matches.

When the Portfolio Lab sidebar is open, suppress speech clouds and reduce bounce amplitude.

## Positioning & Layout Rules

- Orby lives in a `fixed` container with `pointer-events: none` and `aria-hidden="true"`.
- X position: interpolated from ~`right: 80px` (near Lab button) at 0% scroll to `left: -80px` (off-screen) at 85%.
- Y position: stays in the lower 18–28% of viewport height with a sine-wave bob.
- Size: 56–72px on mobile, 72–88px on desktop.
- Z-index: below modals/sidebar overlay, above page content (`z-40` range).
- Must never overlap the Portfolio Lab toggle button or obscure interactive elements.

## Animation Constraints

- Use CSS custom properties or `transform` for all positional animation — no layout-triggering properties.
- Idle bounce: `translateY` with a slow ease-in-out loop.
- Scroll travel: driven by `useScrollProgress` mapped to `translateX`.
- Helmet glint: a pseudo-element highlight sweep on a CSS animation.
- Keep all animations `will-change: transform, opacity` and GPU-composited.
- Total added JS bundle for Orby should be < 8 KB gzipped (excluding Three.js if shared).

## Reduced Motion

When `prefers-reduced-motion: reduce` matches:
- Show a static Orby near the Portfolio Lab button (no travel, no bounce).
- Show one static hint cloud for 4 seconds, then hide.
- No typed-text animation — show the full string immediately.

## Accessibility

- Entire Orby tree: `aria-hidden="true"`.
- Speech clouds: no `role="alert"`, no live regions.
- No focusable elements inside Orby.
- `pointer-events: none` on all Orby DOM.

## Styling Rules

- Use Tailwind utilities. No separate CSS file unless a `@keyframes` block is needed in `globals.css`.
- Match the existing cosmic palette: violet/cyan rim light, dark translucent surfaces.
- Speech cloud: frosted glass look consistent with `.cosmic-card--subtle`.
- Arrow pointer: simple CSS triangle or SVG arrow in violet/cyan.

## Performance Budget

- No heavy GLB model in V1. CSS 3D layers or shared Three.js primitives only.
- Lazy-load Orby after the hero section is visible (intersection observer or `requestIdleCallback`).
- If using a dedicated Three.js canvas, keep it tiny (< 120×120 CSS px) and limit to 30 fps.

## Integration Point

Render `<Orby />` from `src/app/layout.tsx` alongside or inside the provider tree near `SidebarToggle`. It needs to know:
- Whether the sidebar is open (from `SidebarProvider` context or a prop).
- Scroll progress (its own hook, not from an existing section observer).

## Build Order (recommended)

1. Static character near Lab button (CSS 3D placeholder).
2. Intro cloud with typed text.
3. Arrow pointing to Lab button + hint cloud.
4. `useScrollProgress` hook.
5. Scroll-linked X travel (roaming state).
6. Exit-left, return-right, goodbye sequence.
7. Reduced-motion gate.
8. Polish: helmet glint, micro-rotation, sine bob.
9. (Future) Upgrade to Three.js mini model or optimized GLB.

## Do Not

- Make Orby clickable or focusable.
- Add AI generation or API calls.
- Reintroduce chatbot framing or ChatKit references.
- Block the Portfolio Lab button or any form field.
- Add dependencies beyond what already exists in the project.
- Download external assets on first load — inline SVGs or CSS shapes only for V1.
