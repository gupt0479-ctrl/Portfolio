# Orby / RB: Scroll Companion Concept

## What Orby Is

Orby is a tiny astronaut companion that lives near the bottom-right of the portfolio. He is not another chatbot and he is not an input surface. He is a small, expressive 3D buddy that helps visitors notice the Portfolio Lab, then quietly wanders through the page as they scroll.

The goal is to make the portfolio feel alive without distracting from the content. Orby should feel like a little space explorer moving through the same dark, cosmic environment as the rest of the site. He introduces himself once, points people toward the Portfolio Lab, and then becomes a scroll-linked companion that travels across the bottom of the screen.

Working name:

- Public name: **Orby**
- Short/internal nickname: **RB**
- Personality: curious, playful, helpful, slightly chaotic, never noisy, quirky replies

## Current Portfolio Context

The portfolio now has a static **Portfolio Lab** in the right off-canvas sidebar. The floating launcher is in `src/components/SidebarToggle.tsx` and sits at the bottom-right of the viewport. The global layout renders the sidebar and launcher from `src/app/layout.tsx`.

The visual system already has:

- A dark space-like 3D background.
- A floating Portfolio Lab button with a violet glow.
- Scroll-driven page sections.
- A technical, AI-forward portfolio tone.

Orby should attach to that existing system instead of becoming a separate mascot layer. His first job is to make the Portfolio Lab obvious and memorable.

## Experience Summary

When the landing screen first opens:

1. Orby appears near the bottom-right of the screen, just left of the Portfolio Lab button.
2. He lightly bounces in place, as if floating in low gravity.
3. A small speech cloud appears with typed text:
   - `Hi, I'm Orby. I bounce around this little corner of space.`
4. This intro lasts about five seconds.
5. Orby then points an arrow with it's hand toward the Portfolio Lab button.
6. A second cloud appears:
   - `Want the shortcut? The lab knows the lore.`
   - Alternate copy: `Tap the lab. It has the evidence files.`
   - Alternate copy: `Know more about Anant through AI. I found the cool button.`

As the user scrolls:

1. Orby becomes tied to scroll progress.
2. At 0% scroll, he starts near the bottom-right.
3. As scroll progress increases, he travels toward the bottom-left.
4. He bounces, rotates slightly, and drifts as if moving through space.
5. Near the end of the page, he exits off the left side.
6. Just before disappearing off the left edge, he smiles and waves goodbye.
7. He then loops back from the right side near the end state back to the left side of the portfolio lab button. Where it started from.
8. If the user scrolls back upward, Orby reverses naturally and re-enters from the right, eventually returning to his intro position near the Portfolio Lab button.

Orby should never block important content, buttons, form fields, or the Portfolio Lab itself. If it is in the way of the user's cursor then it quickly floats away from the hover.

## Personality Rules

Orby should feel like a tiny space guide, not a customer-support bot.

He should be:

- Brief: one short sentence at a time.
- Playful: quirky, curious, a little proud of finding the Lab.
- Helpful: points to the Portfolio Lab and frames it as useful.
- Pop-up messages: Should appear at certain points described below
- Non-intrusive: no click-to-chat behavior, no repeated popups every few seconds.

He should not:

- Ask the user for input.
- Become a second AI assistant.
- Cover page content.
- Repeat the intro on every tiny scroll movement.

## Visual Direction

Orby should appear 3D, even if the first version is implemented with CSS/Three.js primitives.

Desired appearance:

- Tiny astronaut body with a rounded helmet.
- Reflective glass visor.
- Small backpack or oxygen tank.
- Radio in one of his hands that he puts close to his mouth to speak, indicating that it's about to say something.
- Stubby arms and legs.
- Floating idle bounce.
- Subtle wave animation.
- Soft violet/cyan rim light to match the Portfolio Lab and space background.
- Small cloud bubble that feels like a hologram or vapor puff.
- Floating Arrow indicator that points cleanly to the Portfolio Lab button.

The character should feel lightweight and high-performance. It should not require a huge model download for the first version.

## Motion Specification

Orby has two animation systems:

### 1. Local Character Animation

This animation runs continuously while Orby is visible:

- Idle bounce: slow vertical movement.
- Micro rotation: slight tilt left/right.
- Helmet glint: subtle highlight sweep.
- Arm wave: only during the goodbye moment or the first pointer moment.
- Pointing pose: active while directing attention to the Portfolio Lab button.

### 2. Scroll-Progress Animation

This animation maps page scroll to Orby's screen position.

Scroll progress:

- `0%`: Orby is near bottom-right, just left of the Portfolio Lab button.
- `5%`: Intro cloud fades away.
- `8%`: Portfolio Lab pointer cloud appears briefly.
- `10% - 85%`: Orby travels from right to left across the lower viewport.
- `85% - 95%`: Orby exits off the left edge.
- `95% - 100%`: Orby loops back from the right, waves goodbye, smiles, and leaves.

### 3. Section-Triggered Messages

As Orby roams, certain sections entering the viewport trigger a one-shot `section-comment`. Orby briefly pauses, shows the speech cloud with section-specific copy, holds it for ~3 seconds, then resumes roaming. Each fires at most once per page session.

Trigger mapping (IntersectionObserver, `threshold: 0.3`):

| Section | Trigger element ID | Copy key |
|---------|-------------------|----------|
| Projects | `#projects` | `projects-links` |
| Blog / Reading | `#blog` | `blog-coming` |
| Contact | `#contact` | `goodbye-cta` |

The `goodbye-cta` message fires before Orby transitions to `exitingLeft`, effectively becoming his parting word before he leaves the screen.

Implementation note: use a `Set<string>` stored in a `useRef` to track which section IDs have already fired. Disconnect the observer for a section once its message has been shown.

Recommended path:

- X position: interpolates from right to left based on scroll progress.
- Y position: stays in the lower 18-28% of viewport height with a sine-wave bob.
- Rotation: small oscillation based on velocity and bob phase.
- Scale: tiny, around `56px-88px` depending on viewport.

On mobile, Orby should be smaller and should stay above bottom navigation/button areas.

## Interaction Rules

Orby is not clickable. It escapes when the user hovers over it.

Required pointer behavior:

- `pointer-events: none` on Orby's wrapper.
- Speech cloud and arrow should also be non-interactive.
- The Portfolio Lab button remains fully clickable.
- Orby must not interfere with text selection, links, forms, or scroll.

Accessibility:

- Orby is decorative after the initial visual hint.
- Use `aria-hidden="true"` for the visual character.
- Do not expose typed decorative speech as repeated screen-reader announcements.
- Respect `prefers-reduced-motion`.

Reduced-motion behavior:

- Disable bounce, travel, and wave.
- Show a static Orby near the Portfolio Lab button.
- Show one static hint cloud for a short time or not at all.

## Implementation Direction

Create a new component family:

- `src/components/orby/Orby.tsx`
- `src/components/orby/OrbyModel.tsx`
- `src/components/orby/OrbySpeechCloud.tsx`
- `src/components/orby/useScrollProgress.ts`
- `src/components/orby/useTypedText.ts`

Render Orby from `src/app/layout.tsx` or inside the existing provider tree near `SidebarToggle`, because he needs to visually coordinate with the Portfolio Lab launcher.

Recommended first implementation:

- Use CSS/HTML for the speech cloud and arrow.
- Use CSS transforms for the scroll path.
- Use a lightweight CSS or Three.js mini model for Orby.
- Avoid downloading a heavy GLB model until the motion and placement feel right.

Possible 3D approaches:

1. **CSS 3D first**
   - Fastest and easiest to tune.
   - Build Orby from layered divs, gradients, shadows, and transforms.
   - Good enough if the visor, rim lighting, and bounce are polished.

2. **Three.js mini scene**
   - More visually impressive.
   - Use simple spheres/capsules for helmet, body, arms, legs, backpack.
   - Render in a tiny transparent canvas fixed to the viewport.
   - Keep it low-poly and avoid heavy postprocessing.

3. **GLB model later**
   - Best final polish.
   - Use a custom optimized astronaut model under 100-200KB.
   - Only add this after the scroll behavior is validated.

## State Machine

Orby should be implemented as a small state machine:

- `intro`: first page load, says hello.
- `pointing`: points to Portfolio Lab button and shows the Lab hint.
- `roaming`: follows scroll progress with no speech.
- `section-comment`: a visible portfolio section has triggered a one-shot remark; Orby pauses mid-travel, shows the cloud, then resumes roaming.
- `exitingLeft`: disappears off the left edge near the end.
- `returningRight`: re-enters from the right.
- `goodbye`: waves and smiles before leaving.
- `reducedMotion`: static fallback.

The state should be derived from:

- Scroll progress.
- Time since page load.
- Whether the Portfolio Lab is open.
- Which portfolio section is currently in the viewport (via IntersectionObserver).
- Whether a given section comment has already been shown (each fires at most once per session).
- `prefers-reduced-motion`.

If the Portfolio Lab is open, Orby should become quieter:

- Hide the speech cloud.
- Move slightly away from the sidebar.
- Reduce motion intensity.

## Copy Bank

Intro copy:

- `Hi, I'm Orby. I bounce around this little corner of space.`
- `Hey, I'm Orby. I keep watch over the evidence nebula.`
- `I'm Orby. Tiny astronaut, large curiosity.`

Portfolio Lab hint:

- `Want the shortcut? The lab knows the lore.`
- `Tap the lab. It has the evidence files.`
- `Know more about Anant through AI. I found the cool button.`
- `The lab has receipts. I just point at things.`

Section-triggered messages (`projects-links` — shown when Projects section enters view):

- `Fair warning — some of these deploy links are on sabbatical. The real, live collection is at github.com/gupta-builds.`
- `Some of these links have trust issues. Everything that actually shipped lives at github.com/gupta-builds.`
- `Builds evolve. Links don't always keep up. The honest archive is at github.com/gupta-builds.`

Section-triggered messages (`blog-coming` — shown when Blog / Reading section enters view):

- `He's been converting browser tabs into an actual blog. The link appears here once it's live — I'm watching.`
- `Somewhere between 47 open tabs and a blank editor, a blog is coming together. This section holds the link when it drops.`
- `Anant reads a lot. A blog is being assembled from the wreckage. The link lives here when it's ready.`

Section-triggered messages (`goodbye-cta` — shown just before Orby exits left at the Contact section):

- `You orbited the whole thing. Reach out — I've been watching the evidence, and he's worth the message.`
- `Made it to the end of space. That's either curiosity or a broken scroll wheel — either way, go say hi.`
- `Still here after all that? Good instinct. The contact section is right below me — I've done my part.`

Copy rules:
- One sentence per cloud. No exceptions.
- Never sound like a marketing popup, a loading state, or a terms-of-service footer.
- Orby is a tiny space explorer who has been watching — he has opinions, not sales pitches.

## Acceptance Criteria

Orby is successful if:

- On first load, visitors immediately notice the Portfolio Lab button.
- The intro feels charming but ends quickly.
- The scroll movement feels connected to the page, not random.
- Orby never blocks the Portfolio Lab button or main content.
- The page still feels professional and performant.
- Reduced-motion users are respected.
- The feature adds personality without becoming another chatbot.
- Each section-triggered message appears exactly once per session and never replays on re-scroll.
- The Projects comment includes a working link to `github.com/gupta-builds`.
- The goodbye comment fires before Orby exits the screen at the Contact section, feeling like a natural sendoff rather than a random popup.

## Non-Goals

- Orby does not answer questions.
- Orby does not open a chat UI.
- Orby does not use AI generation.
- Orby does not need CMS content in V1.
- Orby does not need a production-grade 3D model in the first pass.

## Recommended Build Order

1. Add a static Orby near the Portfolio Lab button.
2. Add the intro cloud with typed text.
3. Add the arrow and Portfolio Lab hint cloud.
4. Add scroll progress tracking.
5. Add the right-to-left roaming path.
6. Add end-of-scroll exit, return, smile, and wave.
7. Add reduced-motion behavior.
8. Upgrade the character from CSS 3D to a small Three.js model if needed.

