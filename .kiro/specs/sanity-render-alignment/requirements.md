---
name: Sanity Render Alignment
overview: Audit every Sanity field against GROQ queries and UI components, fix schema drift causing Studio errors, and wire missing fields so the landing page reflects CMS content instead of hardcoded or orphaned data.
todos:
  - id: fix-about-telemetry-matching
    content: "Fix AboutTelemetry stat matching: replace keyword matching with direct pass-through of Sanity stats"
    status: pending
  - id: experience-card-fields
    content: Render companyLogo, employmentType, achievements (max 2), companyWebsite in ExperienceCard
    status: pending
  - id: education-logo-description
    content: Add logo to EDUCATION_SECTION_QUERY and render it + description in EducationFlowchart
    status: pending
  - id: certs-expiry-credentialid
    content: Add expiryDate to CERTS_SECTION_QUERY; render expiryDate and credentialId in CertificationsSection
    status: pending
  - id: achievements-issuer
    content: Add issuer to ACHIEVEMENTS_SECTION_QUERY and render below title in AchievementsSection
    status: pending
  - id: projects-coverimage
    content: Render coverImage in ProjectCard using next/image + urlFor
    status: pending
  - id: skills-graph
    content: Decide fate of skills graph — restore Three.js sphere viz or document intentional removal
    status: pending
  - id: site-settings-gate
    content: Gate BlogSection on siteSettings.showBlog; use siteLogo in header or OG image
    status: pending
  - id: schema-drift-migration
    content: "Sanity content: migrate current→tenure on experience, featured→visibility on projects, remove color from skills"
    status: pending
  - id: replace-seed-content
    content: "Studio: replace 6 seed projects, remove fake certs, fill profile.stats with real KPI labels"
    status: pending
  - id: verify-build-qa
    content: Run typegen/typecheck/test/build + section-by-section visual QA
    status: pending
isProject: false
---

# Requirements Document

> This document contains the requirements for aligning Sanity CMS content with the website rendering layer.
> All file:line references are verified against the live source tree.

---

## Introduction

This document outlines the requirements for auditing and fixing the alignment between Sanity CMS content and the Next.js website rendering layer. The goal is to ensure all Sanity fields are properly queried and rendered, fixing schema drift and connecting CMS data that is currently being ignored or bypassed.

### Problem Statement

The portfolio website has several issues where Sanity content is either:
- Fetched but not rendered (orphaned data)
- Hardcoded in components (bypassing CMS)
- Affected by schema drift (old fields still in Studio)

### Objectives

1. Fix the AboutTelemetry component to show real Sanity stats
2. Wire all queried-but-unused fields in ExperienceCard
3. Add missing fields to queries and render them
4. Gate blog section on site settings
5. Clean up schema drift in Sanity content
6. Replace seed content with real data

---

## Glossary

| Term | Definition |
|------|------------|
| **GROQ** | Sanity's query language for fetching content |
| **sanityFetch** | Wrapper function in `src/sanity/lib/live.ts` that fetches content with local fallback |
| **Schema drift** | When Studio shows yellow warnings due to legacy fields that no longer exist in the schema |
| **Singleton** | A Sanity document type with a fixed ID (e.g., `singleton-profile`) |
| **Portable Text** | Sanity's rich text format |
| **urlFor** | Helper function to generate image URLs from Sanity assets |
| **P0/P1/P2/P3/P4/P5** | Priority levels (P0 = highest) |

---

## Requirements

### How content flows

```
Sanity CMS
  └─ sanityFetch() [src/sanity/lib/live.ts]
       └─ GROQ query [src/sanity/lib/queries.ts or inline defineQuery]
            └─ Section component [src/components/sections/]
                 └─ Card / sub-component renders fields (or ignores them)
```

A field can be **missing** at any of three layers:
1. **Schema** has it, **query** doesn't fetch it — field never reaches the component
2. **Query** fetches it, **component** ignores it — data arrives but is thrown away
3. **Component** hardcodes the value — Sanity is bypassed entirely

---

### Phase A — Fix AboutTelemetry Stat Matching (P0 - Highest Priority)

**File:** `src/components/AboutTelemetry.tsx`

**Problem:** The component uses a 4-slot canonical system with keyword matching that causes 3 of 4 stats to show hardcoded defaults even when Sanity has real values.

**Current broken behavior:**
| Canonical label | Match terms | Sanity label (user data) | Matches? |
|---|---|---|---|
| Projects Built | `["project"]` | "Side Quests" | ❌ falls back to "10+" |
| Technologies | `["tech", "language", "tool", "stack"]` | "Technologies Mastered" | ✅ → shows "30+" |
| Currently Learning | `["learn", "studying", "current"]` | "Years Experience" | ❌ falls back to "Rust · LLMs" |
| Research Focus | `["research", "focus", "interest"]` | "Client Satisfaction" | ❌ falls back to "AI Systems" |

**Requirement:** 
- Remove the canonical fixed-label system (CANONICAL_READOUTS, findStat function)
- Render `profile.stats[]` directly in order, using whatever `label` and `value` Sanity provides
- Keep the same TelemetryCard UI but don't force specific canonical slots
- Show up to 4 cards from `profile.stats[]` in order
- Use index-based icons instead of keyword-based matching

**Prerequisite Sanity content action (out of scope for code):**
- Update `profile.stats[]` in Studio to exactly the 4 items you want displayed

---

### Phase B — Wire Queried-but-Unused Experience Fields (P1)

**File:** `src/components/cards/ExperienceCard.tsx`

All 5 missing fields are already fetched by `EXPERIENCE_QUERY` — no query changes needed.

#### B.1 — companyLogo
- Add `next/image` + `urlFor()` beside company name
- Small logo (32×32 or 40×40)
- Make it optional (only render if logo exists)

#### B.2 — employmentType
- Add pill ("Internship", "Contract", "Full-time", "Part-time", "Freelance") next to position title

#### B.3 — achievements[]
- Add up to 2 achievement bullets below responsibilities
- Style differently from responsibilities (e.g., bold metric text in teal)

#### B.4 — companyWebsite
- Wrap company name in `<a>` tag, or add a link icon that links to companyWebsite
- Make it open in new tab

#### B.5 — description
- Do NOT render long description in card (it duplicates responsibilities)
- Keep in Studio as internal note only — no UI change needed

---

### Phase C — Education Logo + Description (P2)

**Files:** `src/components/sections/EducationSection.tsx`, `src/components/EducationFlowchart.tsx`

#### C.1 — Add logo to query
- Add `logo` to `EDUCATION_SECTION_QUERY` in EducationSection.tsx (currently line 6)

#### C.2 — Update FlowchartItem interface
- Extend interface to include `logo` and `description`

#### C.3 — Render logo
- Render `logo` with `next/image` inside the blob shape (replace or augment the icon glyph)
- Make it optional

#### C.4 — Render description
- Render `description` as a short paragraph below GPA in the text panel

---

### Phase D — Certifications: expiryDate + credentialId (P2)

**File:** `src/components/sections/CertificationsSection.tsx`

#### D.1 — Add expiryDate to query
- Add `expiryDate` to `CERTS_SECTION_QUERY` (currently absent)

#### D.2 — Render expiryDate
- Render as "Expires Month Year" in small text below issueDate
- Only show when expiryDate is set

#### D.3 — Render credentialId
- Render as monospace small text under the title
- Only show when credentialId is set

---

### Phase E — Achievements: issuer (P2)

**File:** `src/components/sections/AchievementsSection.tsx`

#### E.1 — Add issuer to query
- Add `issuer` to `ACHIEVEMENTS_SECTION_QUERY`

#### E.2 — Render issuer
- Render `issuer` as muted text below title in each achievement row

---

### Phase F — Projects Cover Image (P3)

**File:** `src/components/three/ProjectsSlider.tsx` → `ProjectCard`

#### F.1 — Add image imports
- Import `next/image` + `urlFor`

#### F.2 — Add coverImage display
- Add a `coverImage` display area at top of `ProjectCard`
- Visible for center card at minimum
- Use `next/image` with `urlFor(project.coverImage).width(600).height(280).url()`

#### F.3 — Make optional
- If no image, keep the card header-only layout

---

### Phase G — Site Settings: Gate Blog + Logo (P4)

**Files:** `src/components/sections/BlogSection.tsx`, `src/app/(portfolio)/layout.tsx`

#### G.1 — Gate BlogSection on showBlog
- Pass `showBlog` from `SITE_SETTINGS_QUERY` to `BlogSection` (or fetch it inside BlogSection)
- If `showBlog === false`, return `null` from BlogSection

#### G.2 — Use siteLogo in OG image (optional enhancement)
- Use `siteLogo` in `generateMetadata()` for the OG image

---

### Phase H — Skills Graph Decision (P4)

**File:** `src/components/sections/SkillsSection.tsx` → `SkillsSectionClient.tsx`

#### H.1 — Evaluate options
The skills graph/sphere visualization is **completely absent** — not hidden, not broken, not there.

**Option 1 (restore):** Build a new Three.js/R3F skills graph component that positions skill nodes as a 3D sphere. Wire it to Sanity `percentage` + `category` fields.

**Option 2 (keep current):** The current category-chip + pill grid is clean and functional. Document that the graph was removed intentionally.

#### H.2 — Decision requirement
- Document which option was chosen
- If Option 1: implement the Three.js/R3F skills graph
- If Option 2: add a comment documenting intentional removal

---

### Phase I — Schema Drift Migration (Content - Out of Code Scope)

**Location:** Sanity Studio

#### I.1 — Experience documents
- `unset current`
- Set `tenure: "current"` or `"past"` per record based on current value

#### I.2 — Project documents
- `unset featured`
- Set `visibility: "featured"` or `"standard"` per record based on featured value

#### I.3 — Skill documents
- `unset color` on all skill documents

---

### Phase J — Replace Seed Content (Content - Out of Code Scope)

**Location:** Sanity Studio

#### J.1 — Projects
- Replace 6 seed projects with real ML/engineering projects

#### J.2 — Certifications
- Remove fake certifications not actually held

#### J.3 — Blog
- Replace blog resources with real content

#### J.4 — Profile stats
- Fill `profile.stats[]` with correct labels matching what you want rendered

---

### Phase K — Verify

#### K.1 — Run verification commands
```bash
pnpm typegen
pnpm typecheck
pnpm test
pnpm build
```

#### K.2 — Visual QA
- Open each section side-by-side with Studio
- Verify all fields render as expected

---

## Permanently Hardcoded Elements (By Design — Do Not Change)

| Component | What is hardcoded | Reason |
|---|---|---|
| `HeroTerminal.tsx` | Terminal lines, orbiting chips | Pure design element / personal brand |
| `HeroContent.tsx:111` | "NEXT.JS • SANITY • 3D • TYPESCRIPT" subtitle | Stack callout, intentional |
| `HeroContent.tsx:25` | CTA buttons (View Projects, View Experience, Contact) | Just nav anchors, no CMS field needed |
| `BlogFeed.tsx:7` | GitHub pinned card (URL + description) | Intentional permanent link |
| `Footer.tsx` | Name, tagline, copyright | Fine as-is |
| `HeaderScrolling.tsx:136` | "Anant." logo mark | Intentional — no need for Sanity field |

---

## Priority Summary

| Priority | Phase | Fix | Effort |
|---|---|---|---|
| P0 | A | Fix AboutTelemetry to show real Sanity stats | 20 min |
| P0 | J | Fix seed projects in Studio | 30 min |
| P1 | B.1 | Wire companyLogo on ExperienceCard | 20 min |
| P1 | B.2 | Wire employmentType on ExperienceCard | 10 min |
| P1 | B.3 | Wire achievements on ExperienceCard | 20 min |
| P2 | D | Add expiryDate to certs query + render | 15 min |
| P2 | D | Render credentialId in certs | 10 min |
| P2 | E | Add issuer to achievements query + render | 15 min |
| P2 | C | Add logo to education query + render | 30 min |
| P2 | C | Render education description | 15 min |
| P3 | F | Render project coverImage | 30 min |
| P4 | G | Gate blog on showBlog | 15 min |
| P4 | H | Skills graph (restore or document removal) | 2–4 hrs or 0 |
| P5 | I | Schema drift migration | 30 min |