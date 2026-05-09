# Portfolio UI Enhancement - Source Of Truth

## 1. Purpose

This document is the source of truth for the portfolio UI refactor. It captures the actual design intent, current UI issues, taste direction, priorities, and acceptance criteria for future agents or engineers working on the site.

The goal is not to build a generic portfolio template. The portfolio should feel like a premium cosmic AI command center: dark, spatial, technical, readable, interactive, and charismatic. The Three.js background should remain part of the identity, but the interface layered over it must feel deliberate rather than unfinished glass.

The standout feature should be the AI / Portfolio Lab. It should not be a basic chatbot, should not require visitors to sign in, and should not cost money per visitor interaction. For v1, it should be a deterministic interactive lab that lets visitors explore Anant's work through evidence, modes, proof packs, and curated responses.

## 2. Current UI Problems

### Post-Implementation QA Review — April 2026

The current implementation is directionally better, but the UI is not ready to treat as finished. The build passes, but several areas still miss the experience target:

- The landing-screen image does not render. The hero must either correctly render the Sanity/profile image or intentionally render the terminal fallback. A blank/missing image area is not acceptable.
- The bottom-right Portfolio Lab launcher button still needs polish. It should read as a premium fixed action, not just a generic icon button.
- The `// scan report` telemetry cards are too bland. The four cards need richer left/right composition instead of centered stat blocks.
- The `// build log` project area uses transaction/log language, but it is unclear where those build logs come from. Every build-log/case-note item needs visible provenance.
- The Skills graph metrics are wrong, especially values around 75%. The graph must not invent confidence/mastery percentages. It needs explicit x-axis/y-axis labels and a hand-authored dataset for every plotted point.
- The `// origins` spheres are not deformed enough. The stage cards should appear in the right/left/middle alternating order, while the blobs should visibly evolve from chaotic to stable.
- The `// uplink` links do not work reliably and need safe placeholders for every unavailable link.
- The header and footer are still not acceptable. The footer should be redesigned again, and the header needs to feel useful, premium, and stable.
- Dark mode does not work as an actual theme switch. Either fully support it or remove/lock the toggle.
- Portfolio Lab is still too static. The Builder section in particular does not feel functional enough.

These notes override checked-off task status. A completed checklist item is not actually complete if the rendered UI still has one of the issues above.

### Global Problems

- Buttons across the site feel flat at rest. Several buttons only become dimensional on hover through inline styles, but the desired feel is that every button is already floating in space before the cursor touches it.
- Cards are inconsistent. Some are too shiny, while many current cards use `bg-white/[0.02]` and become almost invisible over the Three.js background.
- The page has strong sections, but they do not yet feel like one cohesive design system.
- Several components use one-off hover styles instead of shared utilities.
- The portfolio has too many generic surfaces: plain stat rows, plain card grids, a generic bar chart, and a conventional chatbot sidebar.
- Visible copy still references "AI Twin" and "Chat with AI Twin"; the desired framing is "Portfolio Lab" or "AI Lab".

### Repo-Specific Current State

- `src/components/sections/HeroContent.tsx` uses an inline `cta3dStyle()` helper. CTAs have no floating default state and secondary buttons use `font-medium`, which feels too bold.
- `HeroContent.tsx` only renders `ProfileImage` when `profileImageUrl` exists. When no image is available, the right side of the hero disappears instead of becoming a designed feature.
- `src/components/sections/AboutSection.tsx` renders a centered heading, generic subheading, PortableText body, and a plain stats grid under a border. This is one of the blandest sections.
- `src/components/sections/ExperienceSection.tsx` uses a single absolute line and timeline dots hardcoded with `left-[-5px] top-[28px]`, causing alignment problems.
- `src/components/cards/ExperienceCard.tsx` uses `CometCard rotateDepth={4}` but wraps content in `bg-white/[0.02]`, so the card surface is too transparent.
- `src/components/three/ProjectsSlider.tsx` is the weakest section. Side cards are cramped (`w-[220px] max-h-48`), arrows sit inline in a way that compresses the layout, transitions are simple fades, and the active card feels empty until hover.
- `src/components/sections/SkillsSectionClient.tsx` uses a horizontal Recharts `BarChart`, which feels like a generic dashboard widget rather than a premium portfolio interaction.
- Skills category buttons currently filter content, but they do not have memorable interactions or a strong relationship to the chart.
- `src/components/sections/EducationSection.tsx` is a plain grid of `EducationEntry` cards. The desired direction is a floating life-form flowchart.
- `src/components/sections/CertificationsSection.tsx` uses plain card content and muted default text styles, making credentials feel less premium than intended.
- `src/components/sections/AchievementsSection.tsx` has the right general ledger direction but needs stronger floating treatment and a more intentional glowing rail.
- `src/components/BlogFeed.tsx` has a good GitHub pinned-card direction, but the GitHub URL is still a placeholder and all cards need darker, more readable surfaces.
- `src/components/ContactPanel.tsx` still says "Tired of chatting to my AI Twin?" and "I'm a real person. Reach out directly." The card is too wide and not centered enough around the email.
- `src/components/Footer.tsx` still says "Built in the dark. Shipped with intention.", which must be removed.
- `src/components/SidebarToggle.tsx` still uses Clerk sign-in and "Chat with AI Twin" copy.
- `src/components/app-sidebar.tsx` still renders `ChatWrapper`, so the visible sidebar is still ChatKit-based.
- `src/app/layout.tsx` metadata still mentions "AI Twin".

## 3. Global UI Rules

### Visual Direction

- The site should feel like a floating portfolio command center inside space.
- Use dark translucent surfaces, not fully transparent glass.
- Violet, cyan, and green should be signal accents, not a one-note purple theme.
- The background should feel alive, but content readability wins over background visibility.
- Cards should feel like floating slabs or instruments, not empty panes.
- Buttons should feel physical, raised, and spatial at rest.
- Microinteractions should feel useful and memorable, not random.

### Implementation Rules

- Use the repo's existing Next.js App Router, Sanity, Tailwind v4, shadcn/Radix, Motion, Recharts, and Three.js patterns.
- Keep Sanity GROQ queries at the top of section server components, matching the current pattern.
- Prefer reusable global utilities in `src/app/globals.css` over repeated inline styles.
- Keep `CometCard` as the shared 3D card primitive, but add variants so large cards do not warp too aggressively.
- Avoid adding fake Lovable/demo content. Use real Anant content from Sanity or deterministic local lab data.
- Do not create Vite files, `src/pages`, `index.html`, or a Tailwind config that does not belong to this repo.
- Respect `prefers-reduced-motion` for animated blobs, pulsing lines, chart effects, and motion-heavy hover effects.
- Hover states must not cause layout jumps.
- Every icon-only button needs an accessible label.
- Text must not overlap or overflow on mobile, tablet, desktop, or wide desktop.

## 4. Component Requirements

### Global CSS Utilities

Important files:
- `src/app/globals.css`
- `src/components/ui/comet-card.tsx`
- `src/lib/hooks/useIridescentEffect.ts`

Required utilities:

- `.cosmic-card`: default dark translucent card surface with readable opacity, violet/cyan border glow, inner highlight, and backdrop blur.
- `.cosmic-card--dark`: darker surface for sections where the background sphere is visually intense.
- `.cosmic-card--subtle`: restrained version for large low-motion slabs.
- `.float-btn`: every button should float at rest with a small lift, spatial shadow, and border glow.
- `.section-kicker`: code-comment section labels like `// scan report`.
- `.orbit-chip`: small tag pill with category-colored signal dot.
- Section backdrop utility for text-heavy sections, so the Three.js background never ruins contrast.

Acceptance criteria:

- Repeated inline 3D button styles are replaced or reduced.
- Cards are no longer invisible over the background.
- The UI reads as one system across sections.
- Reduced motion disables non-essential animations.

### CometCard

Current state:
- `CometCard` has default `rotateDepth=17.5`, `translateDepth=20`, hover scale `1.05`, and glare opacity `0.65`.
- This works for small cards but feels too aggressive for large cards like experience, contact, and achievements.

Required direction:

- Add variants: `default`, `dark`, and `subtle`.
- Cap tilt for `subtle` cards.
- Reduce hover scale for large card variants.
- Reduce glare opacity by variant.
- Keep the cursor-tracking glare, but avoid washing out text.

Acceptance criteria:

- Experience and contact cards feel dimensional without appearing warped.
- Certifications can still have stronger comet behavior.
- All card variants preserve readable contrast.

### Header / Navigation

Important files:
- `src/components/HeaderScrolling.tsx`
- `src/components/DarkModeToggle.tsx`
- `src/components/ui/sheet.tsx`

Current state:
- Sticky header appears after scroll.
- Header has desktop nav only; no mobile menu.
- Nav has hover underline but no active section state.
- Theme toggle is present even though the site is primarily dark.

Required direction:

- Make the header feel like a floating orbital nav bar using cosmic surfaces.
- Add Home, About, Experience, Projects, Skills, Education, Certifications, Blog, Contact.
- Add active section highlighting.
- Add an accessible mobile sheet menu.
- Dark mode currently does not work as a real theme switch. Do not leave a broken toggle in the header.
- If light mode is not fully supported, replace the theme toggle with a polished dark-mode-locked indicator rather than leaving a misleading control.
- The header must be redesigned until it feels like part of the command-center interface, not a thin generic nav strip.

Acceptance criteria:

- Header feels integrated with the cosmic theme.
- Mobile users can navigate all sections.
- Active section is visible while scrolling.
- Header adjusts cleanly when the sidebar/lab is open.
- There is no misleading theme toggle. It is either a working theme switch or a locked dark-mode status indicator.

### Hero

Important files:
- `src/components/sections/HeroSection.tsx`
- `src/components/sections/HeroContent.tsx`
- `src/components/sections/ProfileImage.tsx`
- New planned component: `src/components/HeroTerminal.tsx`

Current state:
- Good foundation: dark starfield, name, animated headline, CTAs, social icons, location, availability.
- CTA buttons only become dimensional on hover.
- Profile image is missing, so the right side can disappear.
- Bio can make the hero feel text-heavy.
- Current QA issue: the landing-screen image does not render correctly.

Required direction:

- Keep the current hero layout. Do not wrap the whole hero in a giant card.
- Add kicker: `// hi, I'm`.
- Keep `Anant Gupta` large and elegant.
- Keep the animated headline.
- Shorten visible bio if needed; full bio belongs in About.
- Make all CTAs and social buttons `.float-btn`.
- Remove overly bold CTA styling.
- If no profile image exists, render a floating terminal module instead of leaving the space empty.
- Terminal lines:
  - `$ whoami`
  - `anant.gupta - ai & data systems engineer`
  - `$ stack --top`
  - `rust · typescript · python · postgres · llms`
  - `$ status`
  - `shipping -> research/agents · ui/ux · data pipelines`
- Fix the image pipeline before polishing the fallback:
  - If Sanity has `profileImage`, it must render on the landing screen.
  - If Sanity/local data has no image, the HeroTerminal must intentionally fill the right column.
  - Do not render a broken image, empty right column, or invisible image shell.

Acceptance criteria:

- Hero looks complete even without a profile image.
- Hero image renders when a valid image exists.
- Missing image state is visually intentional, not a rendering failure.
- Buttons float at rest and shimmer on hover.
- Social buttons feel like small floating objects.
- Hero content does not feel crowded on mobile.

### About

Important files:
- `src/components/sections/AboutSection.tsx`
- New planned component: `src/components/AboutTelemetry.tsx`

Current state:
- About uses a generic heading, generic subheading, PortableText, and plain stat numbers.
- Current QA issue: the four `// scan report` cards below the content are too bland and too centered. They need real left-side and right-side content.

Required direction:

- Add kicker: `// scan report`.
- Keep the main text centered and readable.
- Replace the plain stats row with telemetry cards.
- Use four readout cards:
  - Projects Built
  - Technologies
  - Currently Learning
  - Research Focus
- Each telemetry card needs an icon, value, label, tiny sparkline/orbit mark, hover glow, and dark card surface.
- Each telemetry card must use a left/right layout:
  - Left side: icon, label, one-line explanation, source hint.
  - Right side: value, sparkline/orbit mark, tiny status label.
  - Example: left `Projects Built · shipped and maintained work`, right `5+ · from Sanity profile stats`.
  - Example: left `Technologies · stack breadth`, right `15+ · from skills index`.
- If the hero terminal does not fit in Hero, About can host the terminal as part of a two-panel area.

Acceptance criteria:

- The area below the bio becomes memorable.
- Stats no longer look like plain headings.
- Telemetry cards do not look empty; every card has balanced left/right information.
- The section still respects Sanity `fullBio` and `stats`.

### Experience

Important files:
- `src/components/sections/ExperienceSection.tsx`
- `src/components/cards/ExperienceCard.tsx`

Current state:
- Timeline line is a single absolute div.
- Dots are hardcoded and misalign visually.
- Cards are too glassy.

Required direction:

- Add kicker: `// trajectory`.
- Rebuild the timeline as a flex-aligned rail and card row system.
- Dots should align naturally with the card title row or visual card center.
- Use dark comet-card variants with less tilt.
- Add a unique hover effect: sweeping light, signal bar, border pulse, or mouse-tracked highlight.
- Technology tags should use `.orbit-chip`.

Acceptance criteria:

- Timeline dots feel intentionally placed.
- Cards are darker and readable.
- Hover effect is visible but not distracting.
- Date, location, role, company, bullets, and tech tags remain clear.

### Projects

Important files:
- `src/components/three/ProjectsSlider.tsx`

Current state:
- Side cards are small, clipped, dim, and cramped.
- Arrows compress the carousel layout.
- Transition is a basic fade.
- Active card feels too empty before hover.
- Current QA issue: the project area reads like a transaction/build log, but the source of each log entry is unclear.

Required direction:

- Add kicker at the Projects section level: `// build log`.
- Rebuild the carousel around a large active card and two floating side cards.
- Side cards should be visible, dimmed, slightly blurred, and floating in space.
- Arrows should sit vertically centered beside the main card, not on top of or inside the cramped card layout.
- Active card should always show title, tagline, tech chips, and a case-note inner panel.
- Hover can reveal additional details and action buttons, but the card must not look empty before hover.
- Add spatial slide transitions with direction awareness.
- Style pagination as glowing orbit dots.
- Keep keyboard arrows and swipe support.
- Add provenance to every case-note/build-log panel:
  - Show `Source: Sanity project` when the data comes from Sanity.
  - Show `Source: Data/projects.ndjson` when local fallback data is used.
  - Show the project `_id` or slug in small monospace text.
  - Show which fields are powering the card: `title`, `tagline`, `technologies`, `liveUrl`, `githubUrl`.
  - Avoid unexplained words like `transaction` unless the UI also explains what the transaction represents.
- If links are absent, show disabled placeholders:
  - `Live demo pending`
  - `Source pending`
  - These placeholders must not navigate to `#`, empty strings, or broken routes.

Stretch:
- Add a Three.js or CSS "string pull" / particle tether visual during carousel transitions.

Acceptance criteria:

- Projects no longer look like the weakest section.
- Center card is the clear focus.
- Side cards feel spatial, not broken or clipped.
- Live and Source links work when present.
- Every build-log/case-note item explains where its information came from.
- Missing project links are explicit placeholders, not broken anchors.

### Skills

Important files:
- `src/components/sections/SkillsSection.tsx`
- `src/components/sections/SkillsSectionClient.tsx`

Current state:
- Skills chart is a horizontal bar chart.
- Buttons filter categories but feel visually weak.
- Skill pills have some iridescent hover behavior but the section lacks a strong concept.
- Current QA issue: the trajectory graph currently generates synthetic percentage-like values from skill percentages, which creates misleading points such as 75%. The user wants explicit x/y data points for every plotted category.

Required direction:

- Add kicker: `// capability matrix`.
- Replace the bar chart with a multi-line trajectory graph.
- X-axis label must be visible: `Year`.
- Y-axis label must be visible: `Applied Depth`.
- Y-axis should use qualitative ticks, not mastery claims:
  - `0`: `Aware`
  - `25`: `Learning`
  - `50`: `Building`
  - `75`: `Shipping`
  - `100`: `Leading`
- Do not claim mastery or overstate expertise.
- Lines should represent categories such as AI/ML, Data Systems, Backend, Frontend, DevOps/Tools, Soft Skills.
- Hovering a line highlights it, dims others, and shows a tooltip with category, direction, and related skills.
- Clicking a category button filters skills and highlights the chart line.
- Add an insight panel that updates with the selected category.
- Each category button gets a unique interaction:
  - AI/ML: pulse/glow.
  - Backend: terminal cursor blink.
  - Frontend: shimmer sweep.
  - DevOps/Tools: deployment dots/trail.
  - Data Systems: animated tick bars.
  - Soft Skills: subtle bounce or wave.
- Replace generated trajectory math with this explicit v1 dataset. These are narrative applied-depth points, not proficiency percentages:

| Category | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 | Notes |
|---|---:|---:|---:|---:|---:|---:|---|
| Frontend | 10 | 22 | 38 | 55 | 66 | 70 | React/Next.js UI growth; should not exceed `Shipping` yet |
| Backend | 6 | 14 | 26 | 39 | 54 | 64 | APIs, backend logic, Rust/Python service work |
| Data Systems | 4 | 10 | 20 | 34 | 52 | 67 | Data pipelines, PostgreSQL, structured ingestion, BOOM logging |
| AI/ML | 3 | 8 | 18 | 33 | 50 | 62 | LLM APIs, RAG concepts, dataset work, AI integration |
| DevOps/Tools | 5 | 12 | 23 | 35 | 48 | 58 | Git, Linux, deployment, Docker/tooling exposure |
| Soft Skills | 12 | 20 | 32 | 44 | 56 | 63 | Collaboration, writing, mentoring, startup/research teamwork |

- Tooltip copy must make the scale clear. Example: `62 / 100 applied depth · AI/ML · building RAG and LLM-integrated workflows`.
- Do not show a naked `%` suffix unless the UI explicitly says the values are an index, not skill percentage.

Acceptance criteria:

- Skills feels like a capability matrix, not a generic dashboard.
- Buttons do something meaningful on hover and click.
- The graph is visually premium and understandable.
- Every plotted point is traceable to the explicit dataset above.
- The 75 tick is labeled `Shipping`, not treated as a false proficiency score.

### Education

Important files:
- `src/components/sections/EducationSection.tsx`
- `src/components/EducationEntry.tsx`
- New planned component: `src/components/EducationFlowchart.tsx`

Current state:
- Plain two-column grid of comet cards.
- Current QA issue: the spheres/blobs are not deformed enough, and the text panels need to appear in the right, left, middle order.

Required direction:

- Add kicker: `// origins`.
- Replace the grid with a floating life-form flowchart.
- Stages:
  - Top: College, University of Minnesota-Twin Cities, B.S. Computer Science, 2024-2028 expected.
  - Middle: High School.
  - Bottom: Middle School.
- Middle school should be the most deformed amoeba-like shape.
- High school should be more formed.
- College should be almost a perfect glowing sphere.
- Deformation must be visually obvious:
  - College: near-sphere, 5-10% deformation.
  - High school: forming blob, 18-28% deformation.
  - Middle school: amoeba, 35-45% deformation.
- Shapes should use subtle blob animation or CSS morphing.
- Dotted glowing connectors should link the stages.
- A light pulse should travel through the connector.
- Text must remain readable next to or inside dark backing panels.
- Desktop text panel placement must alternate:
  - College/top stage: card on the right.
  - High school/middle stage: card on the left.
  - Middle school/bottom stage: card centered/middle.
- Mobile can stack all cards below their blobs.

Acceptance criteria:

- Education no longer looks like another card grid.
- Flow direction is clear.
- Mobile layout stacks cleanly.
- Blob deformation is visible without needing to inspect CSS.
- The card order is right, left, middle on desktop.

### Certifications

Important files:
- `src/components/sections/CertificationsSection.tsx`

Current state:
- Certification cards use CometCard but content is visually plain and not consistently dark.

Required direction:

- Add kicker: `// credentials`.
- Use darker comet credential cards.
- Each card should include issuer badge/logo area, title, issuer/date, optional tags, and a View Credential action.
- Add subtle holographic corner/ring accent.
- Keep cards compact.

Acceptance criteria:

- Certifications feel like credentials in a premium system.
- Cards are darker and more readable.
- Credential links remain accessible.

### Achievements & Awards

Important files:
- `src/components/sections/AchievementsSection.tsx`

Current state:
- Ledger direction is already closer to desired than other sections.

Required direction:

- Do not add a section kicker unless it helps; cleaner without one is acceptable.
- Wrap the achievement ledger in one subtle floating comet/cosmic slab.
- Add a glowing rail and row dots.
- Keep rows compact: year, title, type chip, one-line description, optional link.
- Avoid emojis.

Acceptance criteria:

- Section remains low-effort in content but looks intentional.
- It should feel different from card grids.

### Blog / What I Read Or Do

Important files:
- `src/components/sections/BlogSection.tsx`
- `src/components/BlogFeed.tsx`

Current state:
- Good idea, but cards are too transparent.
- GitHub pinned card has a nice violet rail but still needs polish.
- GitHub URL is a placeholder.
- Current QA issue: uplink links do not work reliably and need placeholders for each unavailable link.

Required direction:

- Add kicker: `// uplink` or `// read log`.
- Heading should remain `What I Read or Do`.
- Subheading should be `Resources, updates and second brain`.
- Keep GitHub as first pinned item.
- Make the GitHub card darker, more premium, and readable.
- Resource cards should use dark cosmic surfaces, category chips, excerpt, date/read time, and open icon.
- Add magnetic hover to the GitHub Visit button if practical.
- Archive toggle is a future schema task; do not fake it without schema support.
- Every link must be validated before rendering as an active anchor.
- Link fallback behavior:
  - GitHub: use the real GitHub profile from Sanity/social links when available; otherwise use a clearly labeled disabled placeholder `GitHub link pending`.
  - Blog/resources with no slug: render `Article pending` as disabled text.
  - External resources with no URL: render `Link pending`.
  - Never render empty anchors, `#`, or broken `/blog/` routes.

Acceptance criteria:

- GitHub pinned card feels intentionally featured.
- Resource cards are readable over the background.
- Placeholder GitHub URL is replaced with real profile data or a known static URL.
- Uplink links either work or show non-clickable placeholders.

### Contact

Important files:
- `src/components/sections/ContactSection.tsx`
- `src/components/ContactPanel.tsx`

Current state:
- Still references "AI Twin".
- Card is wider than desired.
- Email is not centered enough.
- Social buttons are good candidates for global floating button treatment.

Required direction:

- Add kicker: `// uplink`.
- Heading: `Let's build something`
- Subheading: `Internships, collaborations, or just to say hi.`
- Contact card should be smaller, centered, and direct.
- Email should be centered and prominent.
- Buttons below email:
  - Copy
  - Open Mail
- Social buttons should be centered floating circles.
- Include GitHub, LinkedIn, Instagram if available, Twitter/X, Website, and Email.
- Remove "Tired of chatting to my AI Twin?" and "I'm a real person. Reach out directly."

Acceptance criteria:

- Contact feels direct and professional.
- Email is the visual focus.
- Social buttons are accessible and spatial.

### Footer

Important file:
- `src/components/Footer.tsx`

Current state:
- Footer uses a glass background and the sentence `Built in the dark. Shipped with intention.`
- Current QA issue: the footer is still disliked and should be treated as not done.

Required direction:

- Replace the footer completely.
- Left: tasteful developer glyph `</>`.
- Center: floating `Back to top` button.
- Right: `© 2026 Anant Gupta · building in public`.
- Add subtle top border gradient.
- Keep background transparent.
- If this version still feels weak, simplify further:
  - Left: `Anant Gupta`
  - Center: compact back-to-top icon button
  - Right: GitHub / LinkedIn / Email icon links
  - No slogan.
- Avoid clever/cringe copy. Footer should be quiet, clean, and useful.

Acceptance criteria:

- Footer is short, clean, and not cringe.
- Back-to-top remains keyboard accessible.
- Footer provides useful exits or identity without feeling like a decorative afterthought.

### Sidebar / Portfolio Lab

Important files:
- `src/components/SidebarToggle.tsx`
- `src/components/app-sidebar.tsx`
- `src/components/chat/Chat.tsx`
- `src/components/chat/ChatWrapper.tsx`
- New planned files under `src/components/lab/`
- New planned file: `src/lib/lab-data.ts`

Current state:
- Sidebar is a ChatKit chatbot.
- Launcher is gated behind Clerk sign-in.
- Copy says "Chat with AI Twin".
- Current QA issue: the Portfolio Lab now exists but feels too static, and Builder mode does not feel functional enough.

Required direction:

- Replace visible ChatKit UI with Portfolio Lab.
- Keep ChatKit files only if needed temporarily, but remove them from visible UI.
- Remove Clerk sign-in gate for opening the Lab.
- Keep bottom-right floating launcher.
- Launcher tooltip: `Ask the lab, not my sleep schedule.`
- Lab should feel like a command center, not a chat input.
- Modes:
  - Recruiter: role-fit, proof packs, skills and experience evidence.
  - Builder: project breakdowns and architecture notes.
  - Research: AI/data systems timeline and learning trajectory.
  - Skeptic: claim checker with evidence cards and links.
- Use deterministic static responses in v1.
- Evidence cards should link to page sections.
- Add a proof-pack generator that copies a useful summary to clipboard.
- The Portfolio Lab launcher button still needs polish:
  - It should have a visible hover/focus affordance and stronger relation to the Lab panel.
  - It should not be visually confused with a generic floating utility button.
  - It must remain fixed bottom-right and account for sidebar-open offset.
- Make Builder mode feel functional:
  - Show project-specific chips, not only generic prompts.
  - For each Builder response, include `What was built`, `How it works`, `Tech decisions`, and `Evidence/source`.
  - If no real project detail exists yet, show a clear placeholder: `Architecture notes pending in Sanity`.
  - Do not pretend static content is live AI generation.
- Portfolio Lab can stay deterministic, but it should feel interactive through mode changes, evidence cards, provenance, and useful copy.

Acceptance criteria:

- A visitor can open the Lab without signing in.
- The Lab has memorable interactions and useful content.
- No visible ChatKit or AI Twin copy remains.
- Builder mode answers are project-aware or explicitly marked as pending.
- The Lab should not feel like four static FAQ tabs.

### Floating Dock / Bottom UI

Important files:
- `src/components/FloatingDock.tsx`
- `src/components/FloatingDockClient.tsx`
- `src/components/PortfolioContent.tsx`

Current state:
- The dock appears redundant with improved header navigation.

Required direction:

- Remove it from visible UI unless it is given a clear command-center purpose.
- Bottom-right Portfolio Lab launcher should be the dominant fixed action.
- Avoid overlap with footer and mobile content.

Acceptance criteria:

- No random bottom UI remains.
- Fixed controls do not overlap on mobile.

### Obsidian Background

Important files:
- `src/components/three/ObsidianBackground.tsx`
- `src/components/three/ObsidianBackgroundCanvas.tsx`

Current state:
- Background is already sophisticated and should not be rebuilt unnecessarily.

Required direction:

- Preserve the Three.js identity.
- Improve readability through card surfaces and section backdrops rather than reducing the background too aggressively.
- Hero can stay more open.
- Text-heavy sections need local darkening or stronger card surfaces.
- Respect reduced motion.

Stretch:
- Projects carousel can optionally emit a directional force or tether visual into the background.

Acceptance criteria:

- Background feels premium but never blocks text.
- Mobile performance remains acceptable.

## 5. Priority Order

This refactor should be divided into several implementation tasks. Do not attempt to implement everything in one pass unless explicitly requested.

1. Global design system:
   - Add `.cosmic-card`, `.float-btn`, `.section-kicker`, `.orbit-chip`, reduced-motion rules, and section backdrops.
   - Add `CometCard` variants.

2. Hero and first impression:
   - Floating CTAs and social icons.
   - Kicker.
   - Bio tightening.
   - Fix landing image rendering when a valid profile image exists.
   - Terminal fallback only when profile image is genuinely missing.
   - Polish the Portfolio Lab launcher button so it feels like a premium fixed action.

3. Core card polish:
   - Experience timeline alignment.
   - Dark experience cards.
   - Card hover sweep/mouse effect.

4. Projects carousel:
   - Rebuild layout.
   - Add spatial transitions.
   - Add case-note panel and orbit pagination.
   - Add visible provenance for every build-log/case-note field.
   - Replace broken/missing project links with explicit disabled placeholders.

5. Skills:
   - Replace bar chart with trajectory chart.
   - Replace generated graph math with the explicit applied-depth dataset in this document.
   - Label the x-axis as `Year` and the y-axis as `Applied Depth`.
   - Add interactive category buttons and insight panel.

6. About:
   - Replace plain stat row with telemetry.
   - Redesign the four scan-report cards with left/right content.
   - Add section kicker and optional terminal/mission panel.

7. Education:
   - Replace grid with organic flowchart.
   - Increase blob deformation.
   - Place desktop cards in right, left, middle order.

8. Supporting sections:
   - Certifications.
   - Achievements.
   - Blog.
   - Fix uplink links and add placeholders for every unavailable URL.

9. Contact and footer:
   - Replace copy.
   - Center email.
   - Redesign the footer again; no slogan, no decorative filler.

10. Portfolio Lab:
   - Replace visible ChatKit UI.
   - Add modes, chips, evidence cards, proof pack.
   - Make Builder mode project-aware and useful, or clearly mark missing architecture notes as pending.

11. Final cleanup:
   - Remove old visible copy.
   - Remove or lock broken theme switching.
   - Verify accessibility, responsive behavior, typecheck, and build.

## 6. Portfolio Lab Source Of Truth

The Portfolio Lab should be the most memorable part of the site. It should not be a paid visitor-facing chatbot, and it should not pretend to be a human twin.

V1 should be deterministic:

- Static/local response data.
- Suggested chips instead of open-ended paid model calls.
- Evidence cards that point visitors to Projects, Skills, Experience, Education, and external links where relevant.
- A proof-pack generator for recruiters.
- A polished command-center interface.
- Deterministic does not mean inert. The panel should feel responsive through mode changes, source-aware evidence cards, useful copy, and project-specific Builder responses.

Lab modes:

- Recruiter: "Can Anant do the role?" with evidence.
- Builder: "How was this built?" with project-specific architecture notes, tech decisions, source links, and clear pending placeholders when real details are not available.
- Research: "What direction is he growing in?" with AI/data systems timeline.
- Skeptic: "Prove it." with claim/evidence pairs.

Launcher:

- Bottom-right floating button.
- Tooltip: `Ask the lab, not my sleep schedule.`
- Accessible label: `Open Portfolio Lab`.
- No Clerk gate.

## 7. Copy Decisions

Final copy:

- Contact heading: `Let's build something`
- Contact subheading: `Internships, collaborations, or just to say hi.`
- Footer left: `</>`
- Footer center: `Back to top`
- Footer right: `© 2026 Anant Gupta · building in public`
- Lab name: `Portfolio Lab`
- Lab launcher tooltip: `Ask the lab, not my sleep schedule.`

Remove visible copy:

- `AI Twin`
- `Chat with AI Twin`
- `Chat with Anant`
- `Tired of chatting to my AI Twin?`
- `I'm a real person. Reach out directly.`
- `Built in the dark. Shipped with intention.`
- Visible `ChatKit` branding or chatbot framing
- Fake demo content such as `Alex Morgan`

## 8. Verification Checklist

Run:

```bash
pnpm typecheck
pnpm build
```

Search cleanup:

```bash
rg "AI Twin|Chat with Anant|Chat with AI Twin|ChatKit|Alex Morgan|Built in the dark|Tired of chatting" src .kiro
```

Visual verification:

- Mobile: 375px width.
- Tablet: 768px width.
- Desktop: 1280px width.
- Wide desktop: 1920px width.

Check:

- Hero image renders when a valid profile image exists.
- Hero still looks complete with the terminal fallback when no profile image exists.
- Every visible button floats at rest.
- Portfolio Lab launcher reads as the primary bottom-right action and not a generic icon button.
- About telemetry replaces the plain stat row and each card has balanced left/right content.
- Experience timeline dots align with cards.
- Projects carousel has spatial transitions and a clear center card.
- Build-log/case-note panels show provenance and do not use unexplained transaction language.
- Live/source/uplink links work when available and render non-clickable placeholders when unavailable.
- Skills chart is a trajectory graph with interactive categories, visible x/y labels, and the explicit dataset from this document.
- The 75 y-axis tick is labeled `Shipping`, not displayed as a naked mastery percentage.
- Education is a flowchart, not a grid, with visibly deformed blobs and right/left/middle desktop card placement.
- Certifications are dark credential cards.
- Achievements remain a compact ledger with a glowing rail.
- Blog cards are readable and GitHub pinned card is polished.
- Contact card is centered and email-first.
- Footer is short, clean, useful, and free of slogans.
- Header is useful, premium, stable, and does not expose a broken theme toggle.
- Portfolio Lab opens without sign-in, no visible ChatKit UI remains, and Builder mode is project-aware or clearly marked pending.
- Reduced motion works.
- Keyboard navigation works for nav, carousel, Lab, and buttons.
- Text remains readable over the Three.js background.
