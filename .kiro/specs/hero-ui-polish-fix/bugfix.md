# Bugfix Requirements Document

## Introduction

The Hero section of the portfolio suffers from four visual/UX issues that reduce its polish and spatial cohesion with the Three.js cosmic aesthetic. Interactive elements feel static and flat rather than suspended in space, unnecessary badges and status indicators create visual clutter, the terminal component is misplaced within a section where it doesn't logically belong, and the terminal content is outdated. These issues collectively diminish the first-impression impact of the portfolio's landing view.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the Hero section is idle (no user interaction) THEN the interactive elements (GitHub button, LinkedIn button, Email button, View Projects button, View Experience button, Contact button, Profile image/card) appear static and flat with no ambient motion or depth cues

1.2 WHEN the Hero section renders THEN a "Next.js" badge is displayed, adding visual clutter that competes with primary content

1.3 WHEN the Hero section renders THEN an "AI/ML" badge is displayed, adding visual clutter that competes with primary content

1.4 WHEN the Hero section renders THEN an online status bar is displayed above the profile image, adding visual clutter without meaningful value

1.5 WHEN the Hero section renders THEN a technology line "NEXT.JS • SANITY • 3D • TYPESCRIPT" is displayed below the greeting, adding visual clutter without meaningful value

1.6 WHEN the page renders THEN the terminal component is positioned inside a section where it does not logically belong, rather than serving as a visual bridge between Hero and About Me

1.7 WHEN the terminal component renders THEN it displays outdated or generic content that does not reflect the user's current professional identity

1.8 WHEN the About Me section renders THEN the content boxes (bio, telemetry stats) appear as flat static elements with no depth or spatial presence

1.9 WHEN the terminal component renders THEN it appears as a flat static card with no CometCard tilt/glare depth effect and no broader floating/drifting motion

1.10 WHEN the terminal component renders THEN the command prompts ($ whoami, $ stack --top, $ status) have no glow effect, appearing as plain text without visual emphasis

1.11 WHEN the terminal title bar renders THEN the colored dots (red, yellow, green) are plain circles with no window control symbols (×, −, ⬜)

1.12 WHEN buttons outside the Hero section render (across all portfolio sections) THEN they do NOT have the cosmic-float floating-in-space animation — only Hero buttons would get it with the current plan

### Expected Behavior (Correct)

2.1 WHEN the Hero section is idle (no user interaction) THEN the interactive elements (GitHub button, LinkedIn button, Email button, View Projects button, View Experience button, Contact button, Profile image/card) SHALL exhibit a continuous subtle floating animation with depth and motion cues, appearing lightweight and suspended in space while remaining cohesive with the Three.js cosmic aesthetic

2.2 WHEN the Hero section renders THEN the "Next.js" badge SHALL NOT be displayed

2.3 WHEN the Hero section renders THEN the "AI/ML" badge SHALL NOT be displayed

2.4 WHEN the Hero section renders THEN the online status bar above the profile image SHALL NOT be displayed

2.5 WHEN the Hero section renders THEN the technology line "NEXT.JS • SANITY • 3D • TYPESCRIPT" below the greeting SHALL NOT be displayed

2.6 WHEN the page renders THEN the terminal component SHALL be positioned directly below the Hero section and directly above the About Me section, horizontally centered, acting as a visual bridge/transition element between the two sections

2.7 WHEN the terminal component renders THEN it SHALL display the following content:
```
$ whoami
anant.gupta — AI Engineer & Agentic Systems Builder
$ stack --top
rust · typescript · python · postgres · agents
$ status
shipping → agentic systems · research · product engineering · ui/ux
```

2.8 WHEN the About Me section renders THEN the content boxes (bio card, telemetry stats) SHALL be wrapped with CometCard effect (variant="subtle", moderate rotateDepth/translateDepth) to provide depth, tilt-on-hover, and holographic glare, appearing as floating spatial elements cohesive with the cosmic Three.js aesthetic

2.9 WHEN the terminal component renders THEN it SHALL be wrapped with CometCard effect AND SHALL exhibit a broader continuous floating/drifting animation (not just subtle Y-axis — it should drift horizontally and vertically within a wider range, approximately spanning half the hero section width while staying centered on screen), creating the appearance of a floating terminal suspended in space

2.10 WHEN the terminal component renders THEN the command prompts ($ whoami, $ stack --top, $ status) SHALL have a subtle cyan/violet text-shadow glow effect, making them visually distinct from the output text and creating a terminal-authentic aesthetic

2.11 WHEN the terminal title bar renders THEN the three colored dots SHALL display proper window control symbols: red dot shows "×" (close), yellow dot shows "−" (minimize), green dot shows "⬜" or a small expand icon (expand) — these are decorative only, no click behavior needed

2.12 WHEN any interactive button renders across ALL portfolio sections (not just Hero) THEN it SHALL exhibit the cosmic-float floating-in-space animation at all times (idle state), creating a consistent spatial feel throughout the entire portfolio

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the user hovers over any Hero interactive element THEN the system SHALL CONTINUE TO apply the existing hover effects (scale, glow, color shifts) as they currently work

3.2 WHEN the user interacts with Hero buttons (click/tap) THEN the system SHALL CONTINUE TO navigate to the correct destinations (GitHub profile, LinkedIn profile, email, Projects section, Experience section, Contact section)

3.3 WHEN the page is viewed on mobile or tablet THEN the Hero section layout SHALL CONTINUE TO be responsive and readable at all viewport widths

3.4 WHEN the user has reduced-motion preferences enabled THEN the Hero section SHALL CONTINUE TO respect prefers-reduced-motion by disabling or minimizing animations

3.5 WHEN the About Me section renders THEN it SHALL CONTINUE TO display its content correctly regardless of the terminal repositioning above it

3.6 WHEN the Hero section renders after badge/status removal THEN the remaining content SHALL be properly spaced with no awkward whitespace gaps where removed elements previously occupied space

3.7 WHEN the Three.js background renders THEN it SHALL CONTINUE TO display correctly behind the Hero section and terminal without visual conflicts

3.8 WHEN keyboard navigation is used THEN the Hero interactive elements SHALL CONTINUE TO be focusable and operable via keyboard

3.9 WHEN the CometCard effect is applied to About Me boxes THEN the existing bio text readability, stats display, and telemetry rendering SHALL CONTINUE TO work correctly with no visual conflicts from the tilt/glare

3.10 WHEN the terminal drifts with broader motion THEN it SHALL remain fully readable at all points in its drift cycle AND SHALL NOT overlap with Hero or About Me section content

3.11 WHEN buttons across all portfolio sections receive cosmic-float THEN their existing click/tap behavior, navigation, and section-specific hover effects SHALL CONTINUE TO work correctly
