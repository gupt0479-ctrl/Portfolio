# Requirements Document

## Introduction

This document defines the formal requirements for the Portfolio UI Enhancement feature. The portfolio is a personal developer portfolio built with Next.js 16.1.1 (App Router), React 19.2.3, Tailwind CSS v4, Sanity v4.22.0, and Three.js. The enhancement transforms the site from a functional but visually basic portfolio into a premium cosmic command-center aesthetic with a deterministic Portfolio Lab replacing the existing ChatKit chatbot.

Requirements are derived from the approved technical design document and the UI intent source of truth (`ui-enhancement.md`). Each requirement follows EARS (Easy Approach to Requirements Syntax) patterns and INCOSE quality standards.

## Glossary

- **Portfolio_Site**: The Next.js portfolio web application served to visitors
- **Global_Design_System**: The shared set of CSS utility classes (`.cosmic-card`, `.float-btn`, `.section-kicker`, `.orbit-chip`) and CometCard variants that provide visual consistency across all sections
- **CometCard**: The existing 3D tilt card component (`src/components/ui/comet-card.tsx`) that tracks cursor position and applies rotation, translation, and glare effects
- **Cosmic_Card**: A CSS utility class providing a dark translucent card surface with violet/cyan border glow, inner highlight, and backdrop blur — replacing the current `bg-white/[0.02]` transparent surfaces
- **Float_Button**: A CSS utility class (`.float-btn`) that gives buttons a perpetual floating appearance at rest with spatial shadow, lift, and border glow, plus enhanced 3D hover effects
- **Section_Kicker**: A monospace code-comment label (e.g., `// hi, I'm`) displayed above section headings to reinforce the developer terminal aesthetic
- **Orbit_Chip**: A small tag pill (`.orbit-chip`) with a category-colored signal dot, used for technology tags and skill labels
- **Section_Backdrop**: A CSS pseudo-element applied to text-heavy sections that creates a local dark radial gradient behind content, ensuring readability over the Three.js background
- **ObsidianBackground**: The existing Three.js scene (`ObsidianBackgroundCanvas.tsx`) with fibonacci sphere, torus ring, stars, and magnetic cursor interaction
- **HeroTerminal**: A new floating terminal module component that renders static developer info lines when no profile image is available
- **Telemetry_Card**: A small cosmic-card panel in the About section that displays a stat value with icon, label, and sparkline dots — replacing the plain stats grid
- **Trajectory_Graph**: A multi-line Recharts `LineChart` replacing the bar chart in Skills, showing skill category progression over time
- **Education_Flowchart**: A vertical flowchart component replacing the Education grid, using organic CSS blob shapes that evolve from chaotic (middle school) to stable (college)
- **Portfolio_Lab**: A deterministic interactive panel replacing the ChatKit chatbot sidebar, with four exploration modes and static response data — no API costs, no auth gate
- **Evidence_Card**: A card component inside the Portfolio Lab that displays a claim with description, tags, and a link to the relevant portfolio section
- **Proof_Pack**: A client-side text summary generator in the Portfolio Lab that copies a formatted portfolio summary to the clipboard
- **Lab_Mode**: One of four exploration lenses in the Portfolio Lab: Recruiter, Builder, Research, or Skeptic
- **Reduced_Motion**: The `prefers-reduced-motion` CSS media query and corresponding behavior that disables non-essential animations for users who request it
- **Visitor**: Any person viewing the portfolio site in a web browser

## Requirements

### Requirement 1: Global Design System Utilities

**User Story:** As a visitor, I want all cards, buttons, and labels across the portfolio to share a consistent cosmic visual language, so that the site feels like one cohesive design system rather than a collection of mismatched components.

#### Acceptance Criteria

1. THE Global_Design_System SHALL provide a `.cosmic-card` CSS class that renders a dark translucent card surface with a linear gradient background (opacity 0.72–0.82), violet/cyan border glow, inner highlight, and 16px backdrop blur
2. THE Global_Design_System SHALL provide a `.cosmic-card--dark` CSS variant with higher opacity (0.82–0.88) and reduced border brightness for sections where the Three.js background is visually intense
3. THE Global_Design_System SHALL provide a `.float-btn` CSS class that gives buttons a perpetual floating appearance at rest with translateY(-1px), spatial shadow, and violet border glow
4. WHEN a visitor hovers over a Float_Button, THE Float_Button SHALL apply a perspective rotation (rotateX 6deg), upward translation (-4px), slight scale increase (1.03), and intensified glow
5. WHEN a visitor presses a Float_Button, THE Float_Button SHALL compress downward (translateY 0, scale 0.98) with reduced shadow to provide tactile feedback
6. THE Global_Design_System SHALL provide a `.section-kicker` CSS class that renders monospace text at 0.75rem with 0.05em letter-spacing in a muted cyan-blue color
7. THE Global_Design_System SHALL provide an `.orbit-chip` CSS class that renders a small pill with a category-colored signal dot, dark background, and subtle border
8. THE Global_Design_System SHALL provide a `.section-backdrop` CSS pseudo-element that creates a radial dark gradient behind text-heavy sections to ensure readability over the ObsidianBackground
9. THE Global_Design_System SHALL define CSS custom properties for cosmic accent colors (violet, cyan, green) and surface/border/glow values under the `.dark` selector

### Requirement 2: CometCard Variant System

**User Story:** As a visitor, I want large cards (experience, contact, achievements) to feel dimensional without appearing warped, so that the 3D tilt effect enhances rather than distracts from content readability.

#### Acceptance Criteria

1. THE CometCard SHALL accept a `variant` prop with values `default`, `dark`, and `subtle`
2. WHEN the variant is `default`, THE CometCard SHALL apply the Cosmic_Card background with glare opacity 0.5
3. WHEN the variant is `dark`, THE CometCard SHALL apply the `.cosmic-card--dark` background with glare opacity 0.35
4. WHEN the variant is `subtle`, THE CometCard SHALL cap rotateDepth at 6 and apply glare opacity 0.25
5. WHEN the variant is `dark` or `subtle`, THE CometCard SHALL reduce hover scale from 1.05 to 1.02

### Requirement 3: Header and Navigation

**User Story:** As a visitor, I want a floating orbital navigation bar with active section highlighting and mobile access, so that I can navigate all portfolio sections from any scroll position on any device.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL render a sticky header with Cosmic_Card background, violet/cyan bottom border glow, and backdrop blur
2. THE Header SHALL display navigation links for Home, About, Experience, Projects, Skills, Education, Certifications, Blog, and Contact
3. WHEN a visitor scrolls through the page, THE Header SHALL highlight the currently visible section link with increased text opacity and a persistent violet underline
4. THE Header SHALL provide an accessible mobile sheet menu triggered by a hamburger button with `aria-label="Open navigation"`
5. WHEN the mobile menu is open, THE Header SHALL trap keyboard focus inside the sheet and allow closing via a close button or Escape key
6. THE Header SHALL replace the theme toggle with a dark-mode-locked indicator since the site does not support light mode

### Requirement 4: Hero Section

**User Story:** As a visitor, I want the hero section to make a strong first impression with floating buttons, a developer terminal fallback, and clear identity information, so that I immediately understand who Anant is and what he builds.

#### Acceptance Criteria

1. THE Hero Section SHALL display a Section_Kicker with the text `// hi, I'm` above the tech stack label
2. THE Hero Section SHALL render all CTA buttons (View Projects, View Experience, Contact) with the Float_Button class so they appear floating at rest
3. THE Hero Section SHALL render all social icon buttons with Float_Button styling including subtle hover glow
4. WHEN no profile image URL is available, THE Hero Section SHALL render a HeroTerminal component in the right grid column instead of leaving the space empty
5. THE HeroTerminal SHALL display three static terminal command-output pairs: `$ whoami`, `$ stack --top`, and `$ status` with staggered entrance animations
6. THE HeroTerminal SHALL render inside a Cosmic_Card surface with terminal title bar dots (red, yellow, green) and a path label

### Requirement 5: About Section

**User Story:** As a visitor, I want the About section to present developer stats as visually engaging telemetry readouts, so that the section feels like a system dashboard rather than a plain text page.

#### Acceptance Criteria

1. THE About Section SHALL display a Section_Kicker with the text `// scan report`
2. THE About Section SHALL replace the plain stats grid with up to four Telemetry_Card components arranged in a 2×2 grid
3. WHEN a Telemetry_Card is rendered, THE Telemetry_Card SHALL display an icon, a large stat value, a label, and animated sparkline dots
4. WHEN a visitor hovers over a Telemetry_Card, THE Telemetry_Card SHALL intensify its border glow and slightly scale the value text

### Requirement 6: Experience Section

**User Story:** As a visitor, I want the experience timeline to have properly aligned dots, darker readable cards, and a distinctive hover effect, so that the section communicates professional progression clearly.

#### Acceptance Criteria

1. THE Experience Section SHALL display a Section_Kicker with the text `// trajectory`
2. THE Experience Section SHALL render timeline dots using flexbox alignment with the card content rather than hardcoded pixel offsets
3. THE Experience Section SHALL render experience cards using CometCard with the `dark` variant and reduced rotateDepth
4. WHEN a visitor hovers over an experience card, THE Experience_Card SHALL display a sweeping diagonal light effect that slides across the card surface
5. THE Experience_Card SHALL render technology tags using the Orbit_Chip class with category-appropriate signal dot colors

### Requirement 7: Projects Carousel

**User Story:** As a visitor, I want the projects carousel to feel spatial and premium with a clear center focus, visible side cards, and smooth directional transitions, so that projects are the visual highlight of the portfolio.

#### Acceptance Criteria

1. THE Projects Section SHALL display a Section_Kicker with the text `// build log`
2. THE Projects Carousel SHALL render a large center card flanked by two dimmed, slightly blurred, floating side cards on desktop viewports
3. THE Projects Carousel SHALL position arrow buttons vertically centered beside the center card, not inline with or on top of the card content
4. WHEN a visitor navigates between projects, THE Projects Carousel SHALL animate the transition with a directional spring slide (entering from the direction of navigation) rather than a simple fade
5. THE center project card SHALL always display the project title, tagline, technology chips (using Orbit_Chip), and a case-note inner panel without requiring hover
6. WHEN a visitor hovers over the center project card, THE center card SHALL expand to reveal action buttons (View Live, Source) with a smooth height animation
7. THE Projects Carousel SHALL render pagination as glowing orbit dots where the active dot is an elongated pill shape and inactive dots are small circles
8. THE Projects Carousel SHALL support keyboard arrow navigation and touch swipe gestures

### Requirement 8: Skills Section

**User Story:** As a visitor, I want the skills section to present capabilities as an interactive trajectory graph with memorable category interactions, so that the section feels like a capability matrix rather than a generic dashboard widget.

#### Acceptance Criteria

1. THE Skills Section SHALL display a Section_Kicker with the text `// capability matrix`
2. THE Skills Section SHALL replace the horizontal bar chart with a Trajectory_Graph showing multi-line progression over a timeline (2021–2026)
3. WHEN a visitor hovers over a line in the Trajectory_Graph, THE Trajectory_Graph SHALL highlight that line, dim all other lines, and display a tooltip with the category name, direction, and top skills
4. WHEN a visitor clicks a category button, THE Skills Section SHALL filter the skill grid to that category and highlight the corresponding line in the Trajectory_Graph
5. THE Skills Section SHALL render each category button with a unique hover interaction: AI/ML (pulse glow), Backend (terminal cursor blink), Frontend (shimmer sweep), DevOps/Tools (deployment dots trail), Data Systems (animated tick bars), Soft Skills (subtle bounce)
6. THE Skills Section SHALL display an insight panel below the category buttons that updates with a summary when a category is selected

### Requirement 9: Education Section

**User Story:** As a visitor, I want the education section to present academic stages as an organic flowchart with evolving shapes, so that the section is visually distinct from all other card-based sections.

#### Acceptance Criteria

1. THE Education Section SHALL display a Section_Kicker with the text `// origins`
2. THE Education Section SHALL replace the card grid with an Education_Flowchart component that renders education stages as organic blob shapes connected by dotted glowing connectors
3. THE Education_Flowchart SHALL render the most recent education (college) as a near-perfect glowing sphere, earlier stages as progressively more deformed amoeba-like shapes
4. THE Education_Flowchart SHALL render dotted glowing connectors between stages with a traveling light pulse animation
5. THE Education_Flowchart SHALL display text (degree, field, institution, dates, GPA) beside each blob on desktop and below each blob on mobile, with a dark backing panel for readability
6. WHILE the visitor has `prefers-reduced-motion` enabled, THE Education_Flowchart SHALL disable blob morphing animations and connector pulse animations

### Requirement 10: Certifications Section

**User Story:** As a visitor, I want certifications to feel like premium credentials floating in space, so that professional qualifications are presented with appropriate visual weight.

#### Acceptance Criteria

1. THE Certifications Section SHALL display a Section_Kicker with the text `// credentials`
2. THE Certifications Section SHALL render certification cards using CometCard with the `dark` variant
3. WHEN a certification card is rendered, THE card SHALL display an issuer badge area, certification title, issuer name, date, and a View Credential action link
4. THE Certifications Section SHALL apply a subtle holographic corner accent (radial gradient) to the top-right corner of each certification card

### Requirement 11: Achievements Section

**User Story:** As a visitor, I want the achievements section to feel like a compact floating ledger with a glowing rail, so that it is visually distinct from card grids while remaining low-effort to scan.

#### Acceptance Criteria

1. THE Achievements Section SHALL wrap the entire achievement ledger in a single CometCard with the `subtle` variant
2. THE Achievements Section SHALL render a vertical glowing rail on the left side of the ledger with row-aligned dots
3. WHEN a visitor hovers over an achievement row, THE row SHALL brighten its left rail dot and apply a subtle violet background tint
4. THE Achievements Section SHALL render type labels using the Orbit_Chip class

### Requirement 12: Blog Section

**User Story:** As a visitor, I want blog and resource cards to be readable over the Three.js background with a prominently featured GitHub pinned card, so that I can discover Anant's writing and open-source work.

#### Acceptance Criteria

1. THE Blog Section SHALL display a Section_Kicker with the text `// uplink`
2. THE Blog Section SHALL render the GitHub pinned card with a Cosmic_Card background, violet left border, and a prominent GitHub icon
3. THE Blog Section SHALL render resource cards with Cosmic_Card backgrounds instead of the current transparent `bg-white/[0.02]` surfaces
4. THE Blog Section SHALL render category labels on resource cards using the Orbit_Chip class
5. WHEN a visitor hovers over the GitHub Visit button, THE button SHALL apply a magnetic hover effect that slightly pulls the button toward the cursor

### Requirement 13: Contact Section

**User Story:** As a visitor, I want the contact section to be direct, professional, and email-centered with floating social buttons, so that reaching out feels effortless.

#### Acceptance Criteria

1. THE Contact Section SHALL display a Section_Kicker with the text `// uplink`
2. THE Contact Section SHALL display the heading `Let's build something` and subheading `Internships, collaborations, or just to say hi.`
3. THE Contact Section SHALL render a centered card (max-width ~md) with the email address as the visual focus
4. THE Contact Section SHALL provide Copy and Open Mail action buttons below the email address, styled as Float_Buttons
5. THE Contact Section SHALL render social buttons (GitHub, LinkedIn, Instagram, Twitter/X, Website, Email) as centered floating circles with Float_Button styling
6. THE Contact Section SHALL NOT display any text referencing "AI Twin", "Chat with Anant", or "I'm a real person"

### Requirement 14: Footer

**User Story:** As a visitor, I want a minimal, clean footer that does not distract from the portfolio content, so that the last impression is professional.

#### Acceptance Criteria

1. THE Footer SHALL render a three-column layout: a `</>` developer glyph on the left, a floating Back to top button in the center, and `© 2026 Anant Gupta · building in public` on the right
2. THE Footer SHALL render a subtle top border gradient from transparent through violet/20 to transparent
3. THE Footer SHALL have a transparent background
4. THE Footer SHALL NOT display the text `Built in the dark. Shipped with intention.`
5. THE Footer back-to-top button SHALL be keyboard accessible and styled as a Float_Button

### Requirement 15: Portfolio Lab

**User Story:** As a visitor, I want to explore Anant's portfolio through an interactive command-center panel with multiple exploration modes, so that I can find relevant evidence about skills, projects, and experience without signing in or waiting for AI responses.

#### Acceptance Criteria

1. THE Portfolio_Lab SHALL be accessible from a bottom-right floating launcher button without requiring Clerk authentication or any sign-in
2. THE Portfolio_Lab launcher SHALL display the tooltip `Ask the lab, not my sleep schedule.` and the accessible label `Open Portfolio Lab`
3. THE Portfolio_Lab SHALL provide four Lab_Modes: Recruiter, Builder, Research, and Skeptic
4. WHEN a visitor selects a Lab_Mode, THE Portfolio_Lab SHALL display mode-specific suggested chip buttons with pre-defined questions
5. WHEN a visitor clicks a suggested chip, THE Portfolio_Lab SHALL display a deterministic static response with a heading, summary, and Evidence_Cards
6. WHEN an Evidence_Card contains a section link, THE Evidence_Card SHALL link to the corresponding portfolio section (e.g., `#experience`, `#skills`)
7. WHEN the Recruiter mode is active, THE Portfolio_Lab SHALL display a Generate Proof Pack button that copies a formatted portfolio summary to the clipboard
8. THE Portfolio_Lab SHALL NOT display any visible ChatKit branding, "AI Twin" text, or chatbot framing
9. THE Portfolio_Lab SHALL NOT make any external API calls for generating responses

### Requirement 16: Copy and Branding Cleanup

**User Story:** As a visitor, I want all visible text to reflect the Portfolio Lab branding and professional tone, so that no outdated chatbot or "AI Twin" references remain.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL NOT display the text `AI Twin` anywhere in the visible UI
2. THE Portfolio_Site SHALL NOT display the text `Chat with Anant` or `Chat with AI Twin` anywhere in the visible UI
3. THE Portfolio_Site SHALL NOT display visible `ChatKit` branding or chatbot framing
4. THE Portfolio_Site SHALL NOT display the text `Tired of chatting to my AI Twin?` or `I'm a real person. Reach out directly.`
5. THE Portfolio_Site SHALL NOT display the text `Built in the dark. Shipped with intention.`
6. THE SidebarToggle component SHALL NOT render a Clerk SignInButton or require authentication to open the Portfolio Lab

### Requirement 17: Accessibility and Reduced Motion

**User Story:** As a visitor using assistive technology or with motion sensitivity, I want the portfolio to be fully navigable via keyboard and to respect my reduced-motion preference, so that the site is usable and comfortable for everyone.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL provide `aria-label` attributes on all icon-only buttons including carousel arrows, social icons, the Portfolio Lab launcher, and the back-to-top button
2. THE Portfolio_Site SHALL support keyboard navigation for the projects carousel (arrow keys), the Portfolio Lab (Escape to close), and all interactive elements (Tab order)
3. WHILE the visitor has `prefers-reduced-motion` enabled, THE Portfolio_Site SHALL disable non-essential CSS animations including blob morphing, pulse effects, deployment dot trails, and connector pulse travel
4. THE Portfolio_Site SHALL apply Section_Backdrop pseudo-elements to text-heavy sections (About, Experience, Skills, Education, Certifications, Blog, Contact) to maintain text readability over the ObsidianBackground
5. THE mobile navigation sheet SHALL trap keyboard focus when open and release focus when closed

### Requirement 18: Responsive Layout

**User Story:** As a visitor on any device, I want the portfolio to render correctly and readably across mobile, tablet, desktop, and wide viewports, so that no content is clipped, overlapping, or broken.

#### Acceptance Criteria

1. WHEN the viewport width is below 768px, THE Portfolio_Site SHALL render single-column layouts, hide side project cards in the carousel, display the mobile hamburger menu, and stack education flowchart blobs vertically
2. WHEN the viewport width is between 768px and 1024px, THE Portfolio_Site SHALL render two-column grids where appropriate and display smaller side project cards
3. THE Portfolio_Site SHALL constrain content width to `max-w-6xl` to prevent stretching on viewports wider than 1280px
4. THE Portfolio_Site SHALL ensure that the fixed Portfolio Lab launcher button does not overlap with footer content or other fixed UI elements on mobile

### Requirement 19: ObsidianBackground Preservation

**User Story:** As a visitor, I want the Three.js background to remain visually premium without blocking text readability, so that the cosmic identity is preserved while content stays accessible.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL preserve the existing ObsidianBackground Three.js scene including the fibonacci sphere, torus ring, stars, magnetic cursor interaction, and scroll-progressive physics
2. THE Portfolio_Site SHALL NOT reduce ObsidianBackground particle counts or modify physics constants to solve readability issues
3. THE Portfolio_Site SHALL use Section_Backdrop CSS and Cosmic_Card surfaces to ensure text readability over the background rather than dimming the background itself
4. THE Hero Section SHALL NOT apply a Section_Backdrop, keeping the background fully visible behind the hero content

### Requirement 20: Build Verification

**User Story:** As a developer, I want the enhanced portfolio to pass TypeScript type checking and production build without errors, so that the changes are safe to deploy.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL pass `pnpm typecheck` (TypeScript compilation with `--noEmit`) without errors after all UI enhancement changes
2. THE Portfolio_Site SHALL pass `pnpm build` (which runs typegen, typecheck, and next build) without errors after all UI enhancement changes
3. WHEN a search is performed for the strings `AI Twin`, `Chat with Anant`, `Chat with AI Twin`, `ChatKit`, `Alex Morgan`, `Built in the dark`, and `Tired of chatting` across the `src` directory, THE search SHALL return zero matches in visible UI code

### Requirement 21: Floating Dock Removal

**User Story:** As a visitor, I want a clean bottom UI with only the Portfolio Lab launcher as the fixed action, so that redundant navigation elements do not clutter the interface.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL remove the FloatingDock and FloatingDockClient components from the visible UI
2. THE Portfolio_Site SHALL render only the Portfolio Lab launcher as a fixed bottom-right element
