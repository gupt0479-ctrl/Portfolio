# Implementation Plan — Sanity Render Alignment

## Overview

Code phases A–H wire missing Sanity CMS fields into the Next.js rendering layer. Each task lists file, change type, and implementation detail. Phases I/J (Studio content) are out of code scope; Phase K is verification.

## Tasks

- [x] 1. Phase A — AboutTelemetry stat pass-through
  - File: `src/components/AboutTelemetry.tsx` · Change: refactor
  - Remove `CANONICAL_READOUTS`, `CanonicalReadout` type, and `findStat`. Add `STAT_ICONS = [Layers, Cpu, TrendingUp, Microscope]`. Render `stats[]` directly: filter to non-empty `value`, `slice(0, 4)`, map to `TelemetryCard` with index-based icon; return `null` when empty. Keep `TelemetryCard` and `SPARKLINE_BARS` unchanged.
  - _Requirements: Phase A_

- [x] 2. Phase B — Wire ExperienceCard fields
  - File: `src/components/cards/ExperienceCard.tsx` · Change: edit (add imports + render)
  - Add imports: `next/image`, `urlFor`, `ExternalLink`. Add `EMPLOYMENT_LABELS` map and `achievements` (max 2) derivation.
  - [x] 2.1 B.1 companyLogo — render optional 40×40 logo (`urlFor(...).width(80).height(80)`) left of the header block.
  - [x] 2.2 B.2 employmentType — render `orbit-chip` pill beside `<h3>` position title when set.
  - [x] 2.3 B.3 achievements — render up to 2 teal-accent bullets below responsibilities `<ul>`.
  - [x] 2.4 B.4 companyWebsite — wrap company name in external `<a>` (new tab, `ExternalLink` icon, aria) when set; plain `<p>` otherwise.
  - [x] 2.5 B.5 description — no UI change (documented decision).
  - _Requirements: Phase B.1–B.5_

- [x] 3. Phase C — Education logo + description
  - [x] 3.1 C.1 — File: `src/components/sections/EducationSection.tsx` · Change: query. Add `logo` to `EDUCATION_SECTION_QUERY` projection.
  - [x] 3.2 C.2 — File: `src/components/EducationFlowchart.tsx` · Change: types. Extend `FlowchartItem` with `description?: string | null` and `logo?: Education["logo"] | null`.
  - [x] 3.3 C.3 — File: `src/components/EducationFlowchart.tsx` · Change: render. Add `next/image` + `urlFor` imports; render `logo` inside the blob when present, else keep glyph.
  - [x] 3.4 C.4 — File: `src/components/EducationFlowchart.tsx` · Change: render. Render `description` as a 3-line-clamped paragraph after the GPA pill.
  - _Requirements: Phase C.1–C.4_

- [x] 4. Phase D — Certifications expiryDate + credentialId
  - File: `src/components/sections/CertificationsSection.tsx`
  - [x] 4.1 D.1 — Change: query. Add `expiryDate` to `CERTS_SECTION_QUERY` projection.
  - [x] 4.2 D.2 — Change: render. Add "Expires Month Year" line below issueDate when `expiryDate` set.
  - [x] 4.3 D.3 — Change: render. Add monospace `ID: {credentialId}` under the title when set.
  - _Requirements: Phase D.1–D.3_

- [x] 5. Phase E — Achievements issuer
  - File: `src/components/sections/AchievementsSection.tsx`
  - [x] 5.1 E.1 — Change: query. Add `issuer` to `ACHIEVEMENTS_SECTION_QUERY` projection.
  - [x] 5.2 E.2 — Change: render. Add muted `issuer` line below the title/type row when set.
  - _Requirements: Phase E.1–E.2_

- [x] 6. Phase F — Projects coverImage
  - File: `src/components/three/ProjectsSlider.tsx` (`ProjectCard`)
  - [x] 6.1 F.1 — Change: imports. Add `next/image` + `urlFor`.
  - [x] 6.2 F.2 — Change: render. Add optional cover image area at top of card (`urlFor(...).width(600).height(280)`, `fill`, `object-cover`).
  - [x] 6.3 F.3 — Change: behavior. Keep header-only layout when no `coverImage`.
  - _Requirements: Phase F.1–F.3_

- [x] 7. Phase G — Site settings: gate blog + siteLogo OG
  - [x] 7.1 G.1 — File: `src/components/sections/BlogSection.tsx` · Change: data + gate. Fetch `SITE_SETTINGS_QUERY` in parallel; `return null` when `settings?.showBlog === false`.
  - [x] 7.2 G.2 — File: `src/app/(portfolio)/layout.tsx` · Change: metadata. Add `urlFor` import; include `siteLogo` as OG/twitter image when set.
  - _Requirements: Phase G.1–G.2_

- [x] 8. Phase H — Skills graph decision (Option 2: keep current)
  - File: `src/components/sections/SkillsSectionClient.tsx` · Change: comment only
  - Add a top-of-file comment documenting the intentional removal of the 3D sphere and the intentionally-unused `percentage`/`yearsOfExperience`/`tone` fields. No behavior change.
  - _Requirements: Phase H.1–H.2_

- [x] 9. Phase K — Verify
  - Run `pnpm typegen && pnpm typecheck && pnpm test && pnpm build`. Fix any failures. Perform section-by-section visual QA at mobile and desktop widths.
  - _Requirements: Phase K.1–K.2_

## Task Dependency Graph

```json
{
  "waves": [
    {
      "wave": 1,
      "tasks": [1, 2, 3, 4, 5, 6, 7, 8],
      "description": "All rendering phases (A–H) are independent and can run in parallel"
    },
    {
      "wave": 2,
      "tasks": [9],
      "description": "Verification depends on all rendering phases being complete"
    }
  ]
}
```

Tasks 1–8 are independent of each other and can be executed in any order or in parallel. Task 9 (verification) depends on all preceding tasks being complete.

## Notes

- Phases I and J (Sanity Studio content migration and seed replacement) are out of scope for code tasks. They require manual Studio edits.
- All rendering changes are additive — no existing behavior is broken.
- The design decision for Phase H was Option 2 (keep current pill grid, document removal).
- After running all tasks, a full `pnpm build` confirms the project compiles cleanly.
