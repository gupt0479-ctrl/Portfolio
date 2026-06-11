# Implementation Plan: Portfolio Lab Orby Redesign

## Overview

This plan implements Orby — a CSS astronaut scroll companion — and redesigns the Portfolio Lab panel from static Q&A to a chat-first interface with a "coming soon" response surface. The implementation is split into sequential phases: prerequisites, hooks, character rendering, speech/arrow, root state machine, lab chat redesign, mounting/integration, and quality gates.

## Tasks

- [x] 1. Phase 0 — Prerequisites
  - [x] 1.1 `src/components/PortfolioContent.tsx`: Verify `id="projects"` exists on the Projects section element
    - Confirm the section element has `id="projects"` attribute
    - Verify `id="blog"` and `id="contact"` also exist on their respective sections
    - If any are missing, add them with the correct attribute
    - **Done when:** All three section IDs (`projects`, `blog`, `contact`) are present and findable via `document.getElementById`
    - _Requirements: 11.1, 11.2, 11.3_

- [x] 2. Phase 1 — Hooks (no UI, just logic)
  - [x] 2.1 `src/components/orby/useScrollProgress.ts`: Create RAF-throttled scroll progress hook
    - Export `useScrollProgress(): number` returning 0–1
    - Use a single `requestAnimationFrame` loop to calculate `window.scrollY / (scrollHeight - viewportHeight)`
    - Clamp output to [0, 1]
    - Clean up RAF on unmount via `cancelAnimationFrame`
    - Include `clamp` and `lerp` helper functions as named exports
    - **Done when:** Hook compiles, returns 0 at top of page, 1 at bottom, uses RAF (no scroll event listener)
    - _Requirements: 8.1, 8.6_

  - [x] 2.2 `src/components/orby/useTypedText.ts`: Create char-by-char typing hook
    - Export `useTypedText(text: string, speed?: number, enabled?: boolean): { displayText: string; isComplete: boolean }`
    - Default speed: 30 chars/second
    - Uses `setInterval(1000/speed)` to increment character index when `enabled` is true
    - Returns full text immediately if reduced motion is detected
    - Resets index when `text` changes
    - Clean up interval on unmount
    - **Done when:** Hook compiles, types text incrementally, signals completion, handles text changes
    - _Requirements: 8.1, 6.5_

  - [x] 2.3 `src/components/orby/useOrbyState.ts`: Create stub that returns `'intro'` always
    - Export the `OrbyState` type union and `OrbyStateResult` interface
    - Export `useOrbyState(): OrbyStateResult`
    - Return hardcoded: `{ state: 'intro', speechText: null, showArrow: false, position: { x: 0, y: 0, rotation: 0 } }`
    - This is a stub — full implementation happens in Phase 4
    - **Done when:** Hook compiles, exports correct types, returns valid stub data
    - _Requirements: 7.1_

- [x] 3. Phase 2 — Character (pure CSS, no state)
  - [x] 3.1 `src/components/orby/OrbyModel.tsx`: Create static astronaut structure
    - `"use client"` component
    - Build helmet (32px circle, gradient, violet rim glow), visor (24×16 rounded rect, cyan gradient, glint pseudo-element), body (28×32 rounded rect, light gradient), arms (8×20 each, right arm holds radio), legs (8×14 each), backpack (14×20, behind body, cyan border glow), radio (6×10 on right arm)
    - Use Tailwind utilities and inline styles for gradients/shadows matching design spec exactly
    - Accept props: `className?: string`, `pose?: 'idle' | 'wave' | 'pointing'`, `speaking?: boolean`
    - Wrap in a relative container with the `.orby-wrapper` glow aura
    - Add `aria-hidden="true"` on the wrapper
    - **Done when:** Component renders a visible astronaut shape with all body parts, no animations yet
    - _Requirements: 10.4, 10.5, 8.1, 8.2_

  - [x] 3.2 `src/components/orby/OrbyModel.tsx`: Add idle float + micro-rotation animation
    - Import `motion` from `"motion/react"`
    - Wrap the astronaut in a `motion.div` with idle animation: `y: [0, -6, 0]` loop (2.5s), `rotate: [-2, 2, -2]` loop (3.5s)
    - Both animations use `repeat: Infinity`, `ease: "easeInOut"`
    - Only apply when `pose === 'idle'`
    - **Done when:** Astronaut gently bobs and rotates when `pose="idle"`
    - _Requirements: 6.1, 6.4, 8.6_

  - [x] 3.3 `src/components/orby/OrbyModel.tsx`: Add arm wave animation
    - When `pose === 'wave'`, animate right arm with `rotate: [0, -25, 0, -25, 0]` over 1.2s
    - Apply transform-origin at shoulder position
    - **Done when:** Right arm waves back and forth when `pose="wave"`
    - _Requirements: 10.1_

  - [x] 3.4 `src/components/orby/OrbyModel.tsx`: Add pointing pose
    - When `pose === 'pointing'`, rotate right arm to -45deg (pointing downward-right toward lab button area)
    - Static held position, no animation loop
    - **Done when:** Right arm holds a pointing angle when `pose="pointing"`
    - _Requirements: 10.1_

  - [x] 3.5 `src/components/orby/OrbyModel.tsx`: Add helmet glint sweep CSS animation
    - Add a pseudo-element (or child div) on the visor that sweeps a white highlight from left to right
    - CSS keyframe animation: `translateX(-100%)` → `translateX(100%)` over 3s, infinite, with a 5s delay between sweeps
    - Use Tailwind's `@keyframes` in a `<style>` jsx tag or inline keyframes via Framer Motion
    - **Done when:** A subtle light sweep crosses the visor periodically
    - _Requirements: 10.4_

- [x] 4. Phase 3 — Speech and Arrow
  - [x] 4.1 `src/components/orby/OrbySpeechCloud.tsx`: Create bubble shape with AnimatePresence entry/exit
    - `"use client"` component
    - Accept props: `text: string | null`, `visible: boolean`, `className?: string`
    - Render the speech cloud div with tail triangle (CSS pseudo or child div)
    - Use styles from design spec: dark bg `rgba(15,15,30,0.92)`, violet border, backdrop blur, 11px font
    - Wrap in `AnimatePresence` from `"motion/react"` with variants: initial `{ opacity: 0, scale: 0.85, y: 8 }`, animate `{ opacity: 1, scale: 1, y: 0 }`, exit `{ opacity: 0, scale: 0.9, y: -4 }`
    - Position above parent (absolute, bottom: calc(100% + 8px))
    - Add `aria-hidden="true"`
    - **Done when:** Cloud appears/disappears with smooth animation when `visible` toggles, renders text content
    - _Requirements: 10.4, 10.5, 8.6_

  - [x] 4.2 `src/components/orby/OrbySpeechCloud.tsx`: Integrate useTypedText hook for typed text display
    - Import and use `useTypedText(text, 30, visible)` inside the component
    - Display `displayText` instead of raw `text` prop
    - Show blinking cursor `|` while `!isComplete`
    - Hide cursor after typing completes
    - If reduced motion: show full text immediately (useTypedText handles this internally)
    - **Done when:** Text types in char-by-char when cloud appears, cursor blinks during typing
    - _Requirements: 6.5, 8.6_

  - [x] 4.3 `src/components/orby/OrbyArrow.tsx`: Create static arrow pointing toward lab button
    - `"use client"` component
    - Accept props: `orbyPosition: { x: number; y: number }`, `visible: boolean`
    - Calculate angle via `Math.atan2(dy, dx)` from Orby position to lab button center (`window.innerWidth - 48`, `window.innerHeight - 48`)
    - Render a 40px line with gradient and arrowhead (CSS triangle)
    - Apply rotation via inline `transform: rotate(${angle}deg)`
    - Wrap in `AnimatePresence` for enter/exit
    - Add `aria-hidden="true"`, `pointer-events: none`
    - Hidden on mobile (`< 768px`)
    - **Done when:** Arrow renders at correct angle pointing toward bottom-right lab button, only visible when `visible=true`
    - _Requirements: 8.1, 10.5_

- [x] 5. Checkpoint — Verify Phase 0–3 build integrity
  - Ensure all tests pass, ask the user if questions arise.
  - Run `pnpm typecheck` — expect zero errors
  - Verify no `console.log` in new files
  - Verify all imports use `"motion/react"` not `"framer-motion"`

- [x] 6. Phase 4 — Orby.tsx Root (wires state machine to visuals)
  - [x] 6.1 `src/components/orby/useOrbyState.ts`: Implement intro and pointing states with timer-based transitions
    - Replace the stub with real logic
    - On mount: state = `intro`, pick random `INTRO_COPY`, start 5s timer
    - After 5s: state = `pointing`, pick random `LAB_HINT_COPY`, show arrow, start 4s timer
    - After 4s OR scroll > 10%: state = `roaming`
    - Check `prefers-reduced-motion` on mount — if true, return `reducedMotion` state immediately
    - **Done when:** State transitions from intro → pointing → roaming on timers, reduced motion short-circuits
    - _Requirements: 7.1, 7.2, 7.3, 6.5, 11.4_

  - [x] 6.2 `src/components/orby/useOrbyState.ts`: Implement scroll-progress roaming (right→left travel)
    - Import and use `useScrollProgress()`
    - In `roaming` state: calculate X position via `lerp(viewportRight, viewportLeft, scrollClamped)` where scroll 10%–85% maps to 0–1
    - Calculate Y position: `baseY + Math.sin(bobFrequency) * bobAmplitude`
    - Calculate rotation from bob phase + scroll velocity (±8° bob, ±12° velocity)
    - Return position in `OrbyStateResult`
    - **Done when:** Orby travels right-to-left as user scrolls, with sine-wave bob and rotation
    - _Requirements: 8.1, 8.6_

  - [x] 6.3 `src/components/orby/useOrbyState.ts`: Implement section-comment state with IntersectionObserver
    - Create observers for `#projects`, `#blog`, `#contact` with `threshold: 0.3`
    - Use `useRef<Set<string>>` for deduplication — each section fires at most once
    - On intersection: transition to `section-comment`, set `speechText` to appropriate `SECTION_COPY`, disconnect that observer
    - After 3s: return to `roaming`
    - **Done when:** Scrolling past each section triggers one speech cloud, never repeats, observer disconnects
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.9_

  - [x] 6.4 `src/components/orby/useOrbyState.ts`: Implement exitingLeft and returningRight states
    - At scroll 85–95%: state = `exitingLeft`, X translates past `left: -80px`, scale reduces to 0.8
    - At scroll > 95%: state = `returningRight`, X enters from right side, animates toward lab button position, scale returns to 1.0
    - **Done when:** Orby exits left edge at 85–95% scroll, re-enters from right at 95%+
    - _Requirements: 8.1_

  - [x] 6.5 `src/components/orby/useOrbyState.ts`: Implement goodbye state
    - Near 100% scroll during `returningRight`: state = `goodbye`
    - Set pose to `wave`, show goodbye speech cloud
    - If scroll returns < 95%: transition back to `roaming`
    - Contact section `goodbye-cta` fires before `exitingLeft` transition
    - **Done when:** Orby waves and shows goodbye copy near page end, returns to roaming on scroll back
    - _Requirements: 11.3, 10.1_

  - [x] 6.6 `src/components/orby/Orby.tsx`: Create root component with reducedMotion fallback branch
    - `"use client"` component
    - Import `useOrbyState`, `OrbyModel`, `OrbySpeechCloud`, `OrbyArrow`
    - If `state === 'reducedMotion'`: render static Orby near lab button, one static cloud for 5s (opacity fade only), no scroll tracking
    - Wrap entire component in `pointer-events: none` fixed-position container
    - Add `aria-hidden="true"` on root
    - **Done when:** Reduced-motion users see static Orby with brief cloud, no animations
    - _Requirements: 6.5, 10.5, 11.8_

  - [x] 6.7 `src/components/orby/Orby.tsx`: Wire normal-motion states to OrbyModel + OrbySpeechCloud + OrbyArrow
    - Position wrapper via `style={{ transform: translate(x, y) rotate(rotation) }}`
    - Map state to OrbyModel pose: `intro`/`roaming` → `idle`, `pointing` → `pointing`, `goodbye` → `wave`
    - Pass `speechText` and visibility to OrbySpeechCloud
    - Pass `showArrow` and position to OrbyArrow
    - **Done when:** Full viewport Orby experience works — intro → pointing → roaming → section comments → exit → return → goodbye
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.1_

  - [x] 6.8 `src/components/orby/Orby.tsx`: Integrate sidebar-open quieting behavior
    - Import `useSidebar` from `@/components/ui/sidebar`
    - When sidebar is open: hide speech cloud, halve bob amplitude and rotation, shift X position left by sidebar width + 3rem
    - Apply transition `right 220ms cubic-bezier(0.4,0,0.2,1)` for smooth shift
    - **Done when:** Opening sidebar hides cloud, reduces motion, shifts Orby left smoothly
    - _Requirements: 8.1_

  - [x] 6.9 `src/components/orby/Orby.tsx`: Add mobile responsive sizing
    - Apply `clamp(0.67, 1.1vw, 1.22)` scale to wrapper
    - Adjust baseY for mobile: `window.innerHeight * 0.72` vs `0.78` desktop
    - Hide Orby entirely if `innerHeight < 600 && innerWidth < 480`
    - Hide arrow on `< 768px`
    - Reduce speech cloud max-width to 160px on mobile
    - **Done when:** Orby scales correctly across breakpoints, hides on very small viewports
    - _Requirements: 8.1_

- [x] 7. Checkpoint — Verify Phase 4 build integrity
  - Ensure all tests pass, ask the user if questions arise.
  - Run `pnpm typecheck` — expect zero errors

- [x] 8. Phase 5 — Portfolio Lab Chat Redesign
  - [x] 8.1 `src/components/lab/PortfolioLab.tsx`: Remove hardcoded Q&A logic
    - Remove imports of `LAB_CHIPS`, `LAB_RESPONSES`, mode selector logic, and static response rendering
    - Remove any chip/response mapping iteration
    - Retain panel header with title ("// portfolio lab") and close button
    - Retain Escape key handler for closing
    - **Done when:** PortfolioLab no longer imports from `@/lib/lab-data`, no mode selectors or chips render, header + close still work
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 8.2 `src/components/lab/ChatInputBar.tsx`: Create text input + send button with cosmic UI
    - `"use client"` component
    - Accept props: `onSubmit: (message: string) => void`
    - Render text input with placeholder "Say something to Orby..."
    - Render send button (icon or text)
    - Submit on Enter key (non-empty) or send button click (non-empty)
    - Disable send button when input is empty/whitespace-only
    - Use `cn()`, Tailwind utilities, `.cosmic-card` variant styling
    - Clear input after successful submit
    - **Done when:** Input accepts text, submits on Enter/click, clears after submit, disabled when empty
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 8.3 `src/components/lab/ChatThread.tsx`: Create scrollable message list
    - `"use client"` component
    - Accept props: `messages: Array<{ id: string; text: string; timestamp: number }>`
    - Render user messages only (no AI reply bubbles in thread)
    - Auto-scroll to bottom when new message added (useEffect + scrollIntoView)
    - Show inviting empty state when no messages
    - Use cosmic styling for message bubbles
    - **Done when:** Messages render in scrollable list, auto-scrolls on new message, empty state shows when no messages
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 8.4 `src/components/lab/PanelOrby.tsx`: Create in-panel Orby with idle/thinking/responding states
    - `"use client"` component
    - Accept props: `state: 'idle' | 'thinking' | 'responding'`, `responseText?: string`
    - Render `OrbyModel` with appropriate pose
    - In `idle`: gentle float, occasional nudge toward input area
    - In `thinking`: speech cloud pulses (no loading spinner), Orby animates toward panel edge
    - In `responding`: speech cloud shows `responseText` (Coming_Soon_Response)
    - Use Framer Motion from `"motion/react"` for all animations
    - Add `aria-hidden="true"`
    - **Done when:** Panel Orby visually transitions between idle/thinking/responding with correct animations
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 7.1_

  - [x] 8.5 `src/components/lab/PortfolioLab.tsx`: Wire ChatInputBar + ChatThread + PanelOrby together
    - Manage `messages: ChatMessage[]` state with `useState`
    - Manage `panelOrbyState: 'idle' | 'thinking' | 'responding'` state
    - On submit: add message to thread, transition PanelOrby to `thinking`
    - After 1.5–2.5s random delay: transition to `responding`, show `COMING_SOON_RESPONSE`
    - After ~4s: transition back to `idle`
    - If new message during `responding`: restart `thinking`
    - Generate message IDs via `crypto.randomUUID()` with `Date.now().toString(36)` fallback
    - Layout: PanelOrby at top area, ChatThread in middle (flex-1 overflow-y-auto), ChatInputBar pinned at bottom
    - **Done when:** Full chat flow works — type message → submit → thread shows message → Orby thinks → Orby responds with coming soon → returns to idle
    - _Requirements: 5.1, 5.2, 7.2, 7.3, 7.4, 7.5, 9.1, 9.2, 9.3, 9.4_

- [x] 9. Checkpoint — Verify Phase 5 build integrity
  - Ensure all tests pass, ask the user if questions arise.
  - Run `pnpm typecheck` — expect zero errors

- [x] 10. Phase 6 — Mount and Integration
  - [x] 10.1 `src/app/layout.tsx`: Add `<Orby />` via next/dynamic after SidebarToggle
    - Import `dynamic` from `"next/dynamic"`
    - Create `const Orby = dynamic(() => import("@/components/orby/Orby"), { ssr: false })`
    - Render `<Orby />` after `<SidebarToggle />` inside the Providers tree
    - **Done when:** Orby renders in the viewport on page load, is not server-rendered
    - _Requirements: 8.7_

  - [x] 10.2 `src/components/orby/Orby.tsx`: Verify pointer-events:none does not block Lab button click
    - Ensure the root fixed container has `pointer-events: none`
    - Confirm SidebarToggle (fixed bottom-6 right-6 z-50) remains clickable
    - If there's overlap, adjust z-index so Orby renders below the toggle's z-50
    - **Done when:** Lab button is fully clickable at all scroll positions with Orby present
    - _Requirements: 8.1, 10.5_

  - [x] 10.3 `src/components/orby/Orby.tsx`: Verify aria-hidden on all Orby elements
    - Root viewport Orby container: `aria-hidden="true"`
    - OrbyModel: `aria-hidden="true"`
    - OrbySpeechCloud: `aria-hidden="true"`
    - OrbyArrow: `aria-hidden="true"`
    - PanelOrby: `aria-hidden="true"`
    - **Done when:** All Orby visual elements are hidden from screen readers
    - _Requirements: 10.5_

- [x] 11. Phase 7 — Quality Gate
  - [x] 11.1 Run `pnpm typecheck` → zero errors
    - Run the TypeScript compiler check
    - Fix any type errors in new/modified files
    - **Done when:** `pnpm typecheck` exits with code 0

  - [x] 11.2 Run `pnpm lint` → zero warnings
    - Run Biome linter
    - Fix any lint issues in new/modified files
    - **Done when:** `pnpm lint` exits with code 0

  - [x] 11.3 Run `pnpm build` → successful production build
    - Run the full Next.js production build
    - Fix any build-time errors
    - **Done when:** `pnpm build` exits with code 0, .next output generated

  - [x] 11.4 Manual smoke test checklist
    - Desktop 1440px: Full scroll experience — intro → pointing → roaming → section comments → exit → return → goodbye
    - Tablet 768px: Reduced size Orby, correct positioning
    - Mobile 375px: Smaller Orby, no arrow, correct Y position
    - Sidebar open: Speech cloud hidden, Orby shifts left smoothly
    - `prefers-reduced-motion`: Static Orby, no scroll tracking, static clouds
    - Chat input: Submit with Enter, submit with click, empty/whitespace disables send
    - Panel Orby: idle → thinking pulse → "Still warming up!" → idle
    - Section comments (`#projects`, `#blog`, `#contact`) fire once only
    - Lab button remains clickable at all scroll positions
    - No content blocked by Orby
    - `pointer-events: none` on viewport Orby — user can click through
    - No `console.log` in any new files
    - Framer Motion imported from `"motion/react"` only
    - No imports from `@/lib/lab-data` in redesigned PortfolioLab
    - **Done when:** All manual checks pass

- [x] 12. Property-Based Tests
  - [x] 12.1 Write property test: Non-empty submission always adds message to thread
    - **Property 1: Non-empty submission always adds message to thread**
    - **Validates: Requirements 2.3, 2.4, 3.1**

  - [x] 12.2 Write property test: Input cleared after submission
    - **Property 2: Input cleared after submission**
    - **Validates: Requirements 2.5**

  - [x] 12.3 Write property test: Empty/whitespace input prevents submission
    - **Property 3: Empty/whitespace input prevents submission**
    - **Validates: Requirements 2.7**

  - [x] 12.4 Write property test: Thread contains only user messages
    - **Property 4: Thread contains only user messages**
    - **Validates: Requirements 3.2, 5.3**

  - [x] 12.5 Write property test: Message submission transitions Orby to thinking
    - **Property 5: Message submission transitions Orby to thinking**
    - **Validates: Requirements 4.1, 7.2**

  - [x] 12.6 Write property test: Thinking duration is bounded
    - **Property 6: Thinking duration is bounded**
    - **Validates: Requirements 4.4**

  - [x] 12.7 Write property test: Coming Soon Response always displays after thinking
    - **Property 7: Coming Soon Response always displays after thinking**
    - **Validates: Requirements 5.1, 7.3, 9.3**

  - [x] 12.8 Write property test: Section messages fire at most once
    - **Property 11: Section messages fire at most once per session**
    - **Validates: Requirements 11.4, 11.5**

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation between major phases
- Property tests validate universal correctness properties from the design document
- The design uses TypeScript throughout — all implementation uses strict TypeScript with no `any` or `@ts-ignore`
- Framer Motion must be imported from `"motion/react"` (NOT `"framer-motion"`)
- Use `cn()` from `@/lib/utils` for all class merging
- No Three.js for Orby — pure CSS character
- Copy bank constants are defined in the design document and should be co-located in `useOrbyState.ts` or a shared constants file

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 2, "tasks": ["3.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "3.4", "3.5"] },
    { "id": 4, "tasks": ["4.1"] },
    { "id": 5, "tasks": ["4.2", "4.3"] },
    { "id": 6, "tasks": ["6.1"] },
    { "id": 7, "tasks": ["6.2", "6.3"] },
    { "id": 8, "tasks": ["6.4", "6.5"] },
    { "id": 9, "tasks": ["6.6", "6.7"] },
    { "id": 10, "tasks": ["6.8", "6.9"] },
    { "id": 11, "tasks": ["8.1"] },
    { "id": 12, "tasks": ["8.2", "8.3", "8.4"] },
    { "id": 13, "tasks": ["8.5"] },
    { "id": 14, "tasks": ["10.1"] },
    { "id": 15, "tasks": ["10.2", "10.3"] },
    { "id": 16, "tasks": ["11.1", "11.2"] },
    { "id": 17, "tasks": ["11.3"] },
    { "id": 18, "tasks": ["11.4"] },
    { "id": 19, "tasks": ["12.1", "12.2", "12.3", "12.4", "12.5", "12.6", "12.7", "12.8"] }
  ]
}
```
