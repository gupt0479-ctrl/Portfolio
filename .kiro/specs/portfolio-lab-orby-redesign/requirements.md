# Requirements Document

## Introduction

The Portfolio Lab sidebar currently uses hardcoded Q&A responses rendered from static data in `lab-data.ts`. This redesign removes that static logic and replaces it with a chat-first interface where Orby — a tiny astronaut companion — serves as the primary conversational surface. No AI backend exists yet; the goal is a polished "coming soon" experience that feels intentional and alive, not broken or incomplete. Orby is promoted from a decorative scroll companion concept to the messenger interface of the Portfolio Lab panel.

## Glossary

- **Portfolio_Lab**: The right off-canvas sidebar panel opened by the SidebarToggle button, currently rendering modes, chips, and static responses
- **Chat_Input_Bar**: A persistent text input and send button anchored at the bottom of the Portfolio Lab panel
- **Chat_Thread**: A scrollable area in the Portfolio Lab panel displaying a history of user-submitted messages
- **Orby**: A small animated astronaut character rendered within the Portfolio Lab panel that serves as the conversational reply surface
- **Speech_Cloud**: A small animated bubble or cloud element attached to Orby that displays text responses
- **Thinking_State**: An animation state where Orby's Speech Cloud pulses to indicate processing
- **Idle_Animation**: Orby's default ambient behavior when no message interaction is active — floating gently and occasionally nudging toward the Chat Input Bar
- **Coming_Soon_Response**: The friendly placeholder text Orby displays after the thinking delay, communicating that the feature is actively being built
- **Cosmic_UI**: The dark space-themed visual system using `.cosmic-card` variants, Tailwind utilities, `cn()`, and existing design tokens

## Requirements

### Requirement 1: Remove Hardcoded Q&A Logic

**User Story:** As a developer, I want all static Q&A responses removed from Portfolio Lab, so that the panel is ready for a real conversational interface without legacy dead code.

#### Acceptance Criteria

1. WHEN the Portfolio Lab panel renders, THE Portfolio_Lab SHALL NOT display mode selector buttons, static chips, or pre-written response cards
2. WHEN the Portfolio Lab panel renders, THE Portfolio_Lab SHALL NOT import or reference LAB_CHIPS, LAB_RESPONSES, or the mode-based chip/response rendering logic
3. THE Portfolio_Lab SHALL retain the panel header with title ("// portfolio lab") and close button functionality
4. THE Portfolio_Lab SHALL retain the Escape key handler for closing the panel

### Requirement 2: Chat Input Bar

**User Story:** As a visitor, I want a chat input bar at the bottom of the Portfolio Lab panel, so that I can type messages to interact with Orby.

#### Acceptance Criteria

1. THE Chat_Input_Bar SHALL render as a persistent element anchored at the bottom of the Portfolio Lab panel
2. THE Chat_Input_Bar SHALL contain a text input field and a send button
3. WHEN a user presses Enter while the text input has non-empty content, THE Chat_Input_Bar SHALL submit the message
4. WHEN a user clicks the send button while the text input has non-empty content, THE Chat_Input_Bar SHALL submit the message
5. WHEN a message is submitted, THE Chat_Input_Bar SHALL clear the text input field
6. THE Chat_Input_Bar SHALL use Cosmic_UI design tokens including `.cosmic-card` variants, Tailwind utilities, and `cn()` for class merging
7. WHEN the text input is empty, THE Chat_Input_Bar SHALL disable the send button visually and functionally
8. THE Chat_Input_Bar SHALL include a placeholder text that invites interaction (e.g., "Say something to Orby...")

### Requirement 3: Chat Thread Display

**User Story:** As a visitor, I want to see my previously sent messages in a scrollable thread, so that I have context of my interaction history.

#### Acceptance Criteria

1. WHEN a message is submitted via the Chat_Input_Bar, THE Chat_Thread SHALL append the user's message to the visible thread
2. THE Chat_Thread SHALL display only user-submitted messages with no AI reply text bubbles in the thread
3. THE Chat_Thread SHALL be scrollable when messages exceed the visible area
4. WHEN a new message is added, THE Chat_Thread SHALL auto-scroll to the most recent message
5. THE Chat_Thread SHALL render each user message with consistent styling using Cosmic_UI design tokens
6. WHILE no messages have been submitted, THE Chat_Thread SHALL display an empty state that feels inviting rather than broken

### Requirement 4: Orby Messenger Animation — Thinking State

**User Story:** As a visitor, I want Orby to visually react when I send a message, so that the interface feels responsive and alive.

#### Acceptance Criteria

1. WHEN a message is submitted, THE Orby SHALL transition from Idle_Animation to Thinking_State
2. WHILE in Thinking_State, THE Orby SHALL display a Speech_Cloud that pulses or animates as a thinking indicator
3. WHILE in Thinking_State, THE Orby SHALL NOT display a loading spinner
4. THE Thinking_State SHALL last between 1.5 and 2.5 seconds before transitioning to the response state
5. WHILE in Thinking_State, THE Orby SHALL animate toward the edge of the Portfolio Lab panel as if responding to the user

### Requirement 5: Orby Messenger Animation — Response State

**User Story:** As a visitor, I want Orby to deliver a friendly "coming soon" message after thinking, so that I understand the feature is being built rather than broken.

#### Acceptance Criteria

1. WHEN Thinking_State completes, THE Orby Speech_Cloud SHALL resolve to display the Coming_Soon_Response text
2. THE Coming_Soon_Response SHALL communicate that the feature is actively being built in a friendly, non-error tone (e.g., "Still warming up! This feature is actively being built — check back soon.")
3. THE Speech_Cloud SHALL be the only reply surface — no AI reply text SHALL appear in the Chat_Thread
4. WHEN the Coming_Soon_Response is displayed, THE Orby SHALL hold the response for a visible duration before returning to Idle_Animation
5. THE Coming_Soon_Response SHALL NOT resemble an error message, fallback state, or system failure

### Requirement 6: Orby Idle Animation

**User Story:** As a visitor, I want Orby to have ambient behavior when idle, so that the panel feels alive even before I interact with it.

#### Acceptance Criteria

1. WHILE no message interaction is active, THE Orby SHALL float gently within the Portfolio Lab panel using subtle animation
2. WHILE in Idle_Animation, THE Orby SHALL occasionally nudge toward the Chat_Input_Bar to invite interaction
3. WHILE the user scrolls or hovers near the Portfolio Lab panel, THE Orby SHALL react subtly with minor movement or expression changes
4. THE Idle_Animation SHALL use CSS animations or Framer Motion only — no Three.js unless already used for Orby rendering
5. THE Idle_Animation SHALL respect `prefers-reduced-motion` by reducing or disabling movement

### Requirement 7: Orby State Machine

**User Story:** As a developer, I want Orby's behavior managed by a clear state machine, so that transitions between idle, thinking, and responding states are predictable and maintainable.

#### Acceptance Criteria

1. THE Orby SHALL implement states: idle, thinking, and responding
2. WHEN a message is submitted, THE Orby SHALL transition from idle to thinking
3. WHEN the thinking duration elapses, THE Orby SHALL transition from thinking to responding
4. WHEN the response display duration elapses, THE Orby SHALL transition from responding to idle
5. IF a new message is submitted while Orby is in responding state, THEN THE Orby SHALL transition back to thinking

### Requirement 8: Visual Consistency and Technical Constraints

**User Story:** As a developer, I want all new components to follow the existing technical standards, so that the codebase remains consistent and maintainable.

#### Acceptance Criteria

1. THE Portfolio_Lab SHALL use TypeScript strict mode for all new components
2. THE Portfolio_Lab SHALL use `cn()` from `@/lib/utils` for all conditional class merging
3. THE Portfolio_Lab SHALL use Tailwind CSS utilities only, with no new custom CSS unless extending `globals.css`
4. THE Portfolio_Lab SHALL NOT include any `console.log` statements in production code
5. THE Portfolio_Lab SHALL NOT implement any API route, LLM call, or backend logic
6. THE Orby animations SHALL use CSS animations or Framer Motion only
7. IF Three.js is used for Orby rendering, THEN THE Orby component SHALL be wrapped in `next/dynamic` with `{ ssr: false }`
8. THE Portfolio_Lab SHALL pass `pnpm typecheck`, `pnpm lint`, and `pnpm build` without errors

### Requirement 9: No Error States

**User Story:** As a visitor, I want the experience to feel complete and polished, so that I never see error messages or broken states during interaction.

#### Acceptance Criteria

1. THE Portfolio_Lab SHALL NOT render any error messages, fallback error text, or failure states visible to the user
2. THE Portfolio_Lab SHALL NOT produce console errors during normal interaction
3. WHEN a user submits any text, THE Orby SHALL always respond with the Coming_Soon_Response after the thinking delay — no conditional failures
4. THE interaction flow SHALL feel like intentional design at every step, not a degraded or incomplete experience

### Requirement 10: Orby Personality Preservation

**User Story:** As a product owner, I want Orby to retain the personality described in ORBY.md, so that the messenger role feels consistent with the broader character concept.

#### Acceptance Criteria

1. THE Orby SHALL maintain the personality traits: curious, playful, helpful, slightly chaotic, never noisy
2. THE Coming_Soon_Response copy SHALL be brief (one short sentence), playful, and non-corporate
3. THE Orby SHALL NOT behave like a customer-support bot or generic chatbot
4. THE Orby visual design SHALL use soft violet/cyan rim lighting to match the Cosmic_UI and space background
5. THE Orby SHALL be rendered with `aria-hidden="true"` as the character is decorative

### Requirement 11: Section-Triggered One-Shot Messages

**User Story:** As a visitor, I want Orby to comment on specific portfolio sections as I scroll past them, so that the character feels aware of the content and adds context that the page itself doesn't provide.

#### Acceptance Criteria

1. WHEN the Projects section (`#projects`) enters the viewport at `threshold: 0.3`, THE Orby SHALL transition to `section-comment` state and display the `projects-links` copy from ORBY.md, which references `github.com/gupta-builds` as the canonical source of live project links
2. WHEN the Blog section (`#blog`) enters the viewport at `threshold: 0.3`, THE Orby SHALL transition to `section-comment` state and display the `blog-coming` copy from ORBY.md, communicating that a blog is being built and the link will appear in that section
3. WHEN the Contact section (`#contact`) enters the viewport, THE Orby SHALL display the `goodbye-cta` copy from ORBY.md before transitioning to `exitingLeft` — this message serves as Orby's parting word before leaving the screen
4. EACH section-triggered message SHALL fire at most once per browser session — a `useRef`-backed `Set<string>` SHALL track which section IDs have already triggered
5. WHEN a section message has already been shown, THE Orby SHALL NOT re-display it if the user scrolls back up and the section re-enters the viewport
6. THE `section-comment` state SHALL pause Orby's scroll-progress travel, display the Speech_Cloud for approximately 3 seconds, then return to `roaming`
7. THE section message copy SHALL be one sentence, non-corporate, and consistent with Orby's personality (brief, playful, slightly sardonic, never a marketing popup)
8. WHEN `prefers-reduced-motion` is active, section-triggered messages SHALL still display as static clouds without animation
9. THE IntersectionObserver for each section SHALL be disconnected once its message has fired, to avoid unnecessary background observation
