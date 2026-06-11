# Design Document — Sanity Render Alignment

## Overview

This document specifies the exact code changes needed to align Sanity CMS content with the Next.js rendering layer (Phases A–H). All file references are verified against the live source tree. Phases I/J (Studio content migration) and K (verification) are out of code scope and covered only by the verification commands.

### Guiding Principles

- Smallest safe diff that fully wires each field. No restructuring of working UI.
- All target fields are already present in the Sanity schema and the generated types (`src/sanity/types/index.ts`). Only three inline section queries need new field selections.
- Reuse existing UI primitives: `orbit-chip`, `cosmic-card`, `float-btn`, `CometCard`, `next/image` + `urlFor`.
- Preserve every string asserted by the source-text property tests under `src/components/__tests__/` (all changes are additive).
- No new dependencies. Tailwind utilities only. Dark-mode visuals preserved.
- Optional fields render conditionally (`field && (...)`) so missing CMS data never produces empty UI.

## Architecture

Content flow is unchanged:

```
Sanity → sanityFetch() → GROQ (defineQuery) → server section → client card
```

Three changed queries are **inline** `defineQuery` blocks living beside their section component:
- `EDUCATION_SECTION_QUERY` — `EducationSection.tsx`
- `CERTS_SECTION_QUERY` — `CertificationsSection.tsx`
- `ACHIEVEMENTS_SECTION_QUERY` — `AchievementsSection.tsx`

These sections cast results to the generated **document** types (`Education`, `Certification`, `Achievement`) rather than `*_QUERYResult`, so the new field selections are already type-safe. `pnpm typegen` is still run after query edits per project policy.

### Key Architectural Decisions

- All rendering changes are additive — no existing behavior is removed or altered.
- No new routes, layouts, or data-fetching patterns introduced.
- BlogSection gate uses a parallel fetch inside the component to avoid prop-drilling through PortfolioContent.
- Site logo OG metadata lives in the `(portfolio)` route-group layout, not the root layout.

## Components and Interfaces

### Phase A — AboutTelemetry stat pass-through

**File:** `src/components/AboutTelemetry.tsx`

**Problem:** `CANONICAL_READOUTS` + `findStat` keyword-match Sanity labels against fixed canonical terms. With the user's real labels, 3 of 4 stats fall back to hardcoded defaults.

**Approach:** Remove `CANONICAL_READOUTS`, the `CanonicalReadout` type, and `findStat`. Render `stats[]` directly in order, capped at 4, using `stat.label`/`stat.value` verbatim. Pick an icon by index from a fixed icon ring. Keep `TelemetryCard`, `SPARKLINE_BARS`, and the grid wrapper untouched.

**Detail:**
- Keep imports `Cpu, Layers, Microscope, TrendingUp` — reused as the index icon ring `const STAT_ICONS = [Layers, Cpu, TrendingUp, Microscope]`.
- New render body:
  ```tsx
  const items = (stats ?? [])
    .filter((s) => (s.value ?? "").trim().length > 0)
    .slice(0, 4)
  if (!items.length) return null
  ```
  Map `items` → `TelemetryCard` with `Icon={STAT_ICONS[i % STAT_ICONS.length]}`, `label={stat.label ?? ""}`, `value={stat.value ?? ""}`, keyed by `` `${stat.label}-${i}` ``.
- `TelemetryCard` props/markup unchanged.

**Risk:** Empty `stats[]` now renders nothing (previously showed 4 hardcoded defaults). This is intended — defaults were misleading. Studio must populate `profile.stats[]` (Phase J.4).

---

### Phase B — ExperienceCard queried-but-unused fields

**File:** `src/components/cards/ExperienceCard.tsx` (client component)

All fields already fetched by `EXPERIENCE_QUERY` (`queries.ts`). No query change.

**New imports:**
- `import Image from "next/image"`
- `import { urlFor } from "@/sanity/lib/image"`
- `import { ExternalLink } from "lucide-react"`

**Helper:**
```tsx
const EMPLOYMENT_LABELS: Record<string, string> = {
  "full-time": "Full-time", "part-time": "Part-time",
  contract: "Contract", freelance: "Freelance", internship: "Internship",
}
```

**B.1 companyLogo** — Render a 40×40 rounded logo to the left of the position/company block:
```tsx
{experience.companyLogo && (
  <Image
    src={urlFor(experience.companyLogo).width(80).height(80).url()}
    alt={experience.company ? `${experience.company} logo` : "Company logo"}
    width={40} height={40}
    className="size-10 shrink-0 rounded-lg object-contain bg-white/[0.04] border border-white/10 p-1"
  />
)}
```

**B.2 employmentType** — Pill beside the position title:
```tsx
{experience.employmentType && (
  <span className="orbit-chip">{EMPLOYMENT_LABELS[experience.employmentType] ?? experience.employmentType}</span>
)}
```

**B.3 achievements (max 2)** — Below the responsibilities `<ul>`:
```tsx
const achievements = (experience.achievements ?? [])
  .filter((a): a is string => typeof a === "string" && a.trim().length > 0)
  .slice(0, 2)
```
```tsx
{achievements.length > 0 && (
  <ul className="mt-3 space-y-1.5 text-sm">
    {achievements.map((a) => (
      <li key={a} className="flex gap-2 text-emerald-300/85">
        <span className="shrink-0 text-emerald-400/60">★</span>
        <span className="font-sans leading-relaxed">{a}</span>
      </li>
    ))}
  </ul>
)}
```

**B.4 companyWebsite** — Wrap company name in external link when set:
```tsx
{experience.companyWebsite ? (
  <a href={experience.companyWebsite} target="_blank" rel="noopener noreferrer"
     className="text-white/70 mt-1 font-sans inline-flex items-center gap-1.5 hover:text-white transition-colors">
    {experience.company}
    <ExternalLink className="size-3.5 text-white/35" aria-hidden />
  </a>
) : (
  <p className="text-white/70 mt-1 font-sans">{experience.company}</p>
)}
```

**B.5 description** — No UI change (intentional — duplicates responsibilities). Documented only.

---

### Phase C — Education logo + description

**Files:** `src/components/sections/EducationSection.tsx`, `src/components/EducationFlowchart.tsx`

**C.1 Query** — Add `logo` to `EDUCATION_SECTION_QUERY` projection:
```
_id, institution, degree, fieldOfStudy, startDate, endDate, current, description, gpa, logo
```

**C.2 FlowchartItem interface** — Extend with:
```tsx
description?: string | null
logo?: Education["logo"] | null
```

**C.3 Render logo** — Replace the glyph with the logo when present:
```tsx
{edu.logo ? (
  <Image src={urlFor(edu.logo).width(96).height(96).url()}
    alt={edu.institution ? `${edu.institution} logo` : "Institution logo"}
    width={48} height={48}
    className="size-12 rounded-full object-contain" />
) : (
  <span className="text-white/20 text-xs font-mono">{icon}</span>
)}
```

**C.4 Render description** — After GPA pill:
```tsx
{edu.description && (
  <p className="text-xs text-white/45 mt-2 font-sans leading-relaxed line-clamp-3">
    {edu.description}
  </p>
)}
```

---

### Phase D — Certifications expiryDate + credentialId

**File:** `src/components/sections/CertificationsSection.tsx`

**D.1 Query** — Add `expiryDate` to projection:
```
_id, name, issuer, issueDate, expiryDate, credentialId, credentialUrl, logo, description,
skills[]->{ _id, name, category }
```

**D.2 Render expiryDate:**
```tsx
{cert.expiryDate && (
  <p className="text-xs text-white/35 mt-0.5 font-mono">
    Expires {new Date(cert.expiryDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
  </p>
)}
```

**D.3 Render credentialId:**
```tsx
{cert.credentialId && (
  <p className="text-[11px] text-white/35 mt-1 font-mono break-all">
    ID: {cert.credentialId}
  </p>
)}
```

---

### Phase E — Achievements issuer

**File:** `src/components/sections/AchievementsSection.tsx`

**E.1 Query** — Add `issuer`:
```
_id, title, description, date, type, issuer, featured, url
```

**E.2 Render issuer:**
```tsx
{item.issuer && (
  <p className="mt-0.5 text-xs text-white/35 font-sans">{item.issuer}</p>
)}
```

---

### Phase F — Projects coverImage

**File:** `src/components/three/ProjectsSlider.tsx` → `ProjectCard`

**F.1 Imports** — Add `import Image from "next/image"` and `import { urlFor } from "@/sanity/lib/image"`.

**F.2 Cover image at top of card:**
```tsx
{project.coverImage && (
  <div className="relative h-40 w-full overflow-hidden rounded-t-xl border-b border-white/[0.06]">
    <Image
      src={urlFor(project.coverImage).width(600).height(280).url()}
      alt={title}
      fill
      sizes="(max-width: 768px) 100vw, 600px"
      className="object-cover"
    />
  </div>
)}
```

**F.3** — When no `coverImage`, the existing header-only layout is unchanged.

---

### Phase G — Gate blog on showBlog + siteLogo OG

**Files:** `src/components/sections/BlogSection.tsx`, `src/app/(portfolio)/layout.tsx`

**G.1 Gate:**
```tsx
import { SITE_SETTINGS_QUERY } from "@/sanity/lib/queries"
const [{ data: posts }, { data: settings }] = await Promise.all([
  sanityFetch({ query: BLOG_SECTION_QUERY }),
  sanityFetch({ query: SITE_SETTINGS_QUERY }),
])
if (settings?.showBlog === false) return null
```

**G.2 siteLogo OG (layout.tsx generateMetadata):**
```tsx
const ogImage = settings?.siteLogo
  ? urlFor(settings.siteLogo).width(1200).height(630).url()
  : undefined
openGraph: { title, description, type: "website", ...(ogImage ? { images: [{ url: ogImage }] } : {}) },
twitter: { card: "summary_large_image", title, description, ...(ogImage ? { images: [ogImage] } : {}) },
```

---

### Phase H — Skills graph decision

**File:** `src/components/sections/SkillsSectionClient.tsx`

**Decision:** Option 2 — keep the current category-chip + pill grid; document intentional removal.

**Rationale:** The existing layout is clean, accessible, responsive, and readable over the Three.js background. A new 3D sphere is a 2–4h feature with motion/readability risk and no new content value.

**Detail:** Add a top-of-file comment:
```tsx
// Skills are rendered as a category-grouped pill grid (SkillsCategoryGrid).
// The earlier Three.js/R3F skills "sphere" visualization was intentionally
// removed in favor of this readable 2D layout (Phase H, Option 2).
// Sanity fields percentage / yearsOfExperience / tone remain available in
// SKILLS_QUERY for a future graph but are intentionally unused here.
```

## Data Models

No new data models are introduced. All fields referenced in this design already exist in the Sanity schema and generated types (`src/sanity/types/index.ts`).

### Queries Modified

| Query | File | Fields Added |
|-------|------|--------------|
| `EDUCATION_SECTION_QUERY` | `EducationSection.tsx` | `logo` |
| `CERTS_SECTION_QUERY` | `CertificationsSection.tsx` | `expiryDate` |
| `ACHIEVEMENTS_SECTION_QUERY` | `AchievementsSection.tsx` | `issuer` |

### Interfaces Modified

| Interface | File | Fields Added |
|-----------|------|--------------|
| `FlowchartItem` | `EducationFlowchart.tsx` | `description?: string \| null`, `logo?: Education["logo"] \| null` |

## Correctness Properties

### Property 1: Additive-only rendering

All changes are additive. No existing rendered content or test assertions are broken. Existing property-based tests must continue to pass without modification.

**Validates: Requirements 1, 2, 3, 4, 5, 6, 7, 8**

### Property 2: Conditional rendering

Every optional field renders only when non-null/non-empty. Missing CMS data never produces empty UI elements. A component receiving `null` or `undefined` for an optional field must render identically to its current behavior.

**Validates: Requirements 2, 3, 4, 5, 6**

### Property 3: Type safety

All fields are already in generated types. After `pnpm typegen`, the TypeScript compiler confirms type correctness with zero errors across the entire project.

**Validates: Requirements 3, 4, 5, 11**

### Property 4: Test preservation

All property-based test strings remain valid — changes only add new UI, never alter existing text. Running `pnpm test` after all changes must produce zero failures.

**Validates: Requirements 11**

## Error Handling

- `urlFor()` is only called when the image field is confirmed non-null (conditional rendering pattern).
- `sanityFetch` already handles fallback to local NDJSON when Sanity is unavailable.
- `BlogSection` gate: if `SITE_SETTINGS_QUERY` fails, `settings` is undefined, and `settings?.showBlog === false` is `false` (falsy), so blog still renders — fail-open behavior.
- Date formatting uses standard `toLocaleDateString` which handles invalid dates gracefully.

## Testing Strategy

### Automated Verification
```bash
pnpm typegen && pnpm typecheck && pnpm test && pnpm build
```

### Manual QA (desktop + mobile widths)
- About stats reflect Studio order
- Experience shows logo/type/achievements/linked company
- Education shows logo + description
- Certs show expiry + credential ID
- Achievements show issuer
- Center project shows cover image
- Blog hides when `showBlog` is false

### Files Changed Summary

| Phase | File | Change |
|---|---|---|
| A | `AboutTelemetry.tsx` | Remove canonical/keyword system; direct stats pass-through |
| B | `cards/ExperienceCard.tsx` | Render companyLogo, employmentType, achievements, companyWebsite |
| C | `sections/EducationSection.tsx` | Add `logo` to query |
| C | `EducationFlowchart.tsx` | Render logo + description; extend `FlowchartItem` |
| D | `sections/CertificationsSection.tsx` | Add `expiryDate` to query; render expiry + credentialId |
| E | `sections/AchievementsSection.tsx` | Add `issuer` to query; render issuer |
| F | `three/ProjectsSlider.tsx` | Render coverImage in ProjectCard |
| G | `sections/BlogSection.tsx` | Gate on `showBlog` |
| G | `app/(portfolio)/layout.tsx` | siteLogo OG image |
| H | `sections/SkillsSectionClient.tsx` | Documenting comment (no behavior change) |
