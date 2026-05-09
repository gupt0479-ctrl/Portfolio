# Data Overview

`Data/` is the local Sanity fallback and seed-content folder for Anant Gupta's portfolio. In development, `sanityFetch` prefers these NDJSON files unless `PORTFOLIO_CONTENT_SOURCE=sanity` is set.

## Runtime Fallback Files

These files are read by `src/lib/localContent.ts`:

| File | Purpose |
| --- | --- |
| `profile.ndjson` | Singleton profile for hero, about, and contact projections |
| `siteSettings.ndjson` | Singleton site metadata/settings |
| `navigation.ndjson` | Header/navigation links |
| `skills.ndjson` | Skills and categories |
| `experience.ndjson` | Experience timeline data |
| `education.ndjson` | Education section data |
| `projects.ndjson` | Projects carousel data |
| `certifications.ndjson` | Certifications and skill references |
| `achievements.ndjson` | Achievement cards |
| `blog.ndjson` | Blog-section cards |

## Non-Runtime Seed/Reference Files

- `GROQ-EXAMPLES.md`, `README.md`, and import scripts are operational references for Sanity data work.

## Current Profile Snapshot

- Name: Anant Gupta
- Focus: AI and data systems engineering, full-stack development, Rust/Python data workflows, and LLM applications
- Location: Minneapolis, MN, USA
- Singleton ID: `singleton-profile`

## Maintenance Rules

- Keep `profile.ndjson` aligned with the live portfolio identity; do not reintroduce generic placeholder profiles.
- When a GROQ query adds fields, update both `src/lib/localContent.ts` and the matching NDJSON file.
- Keep skill references resolvable through `skills.ndjson`; projects, experience, and certifications depend on those references.
- Do not commit real secrets, API tokens, or private contact submissions.
- Prefer environment-driven dataset names in scripts instead of hardcoding a Sanity dataset.
