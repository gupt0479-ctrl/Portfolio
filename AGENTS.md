# AGENTS.md

This is the canonical Codex project brief for this repository. Read it before making changes.

## Product Context

This is Anant Gupta's public portfolio and professional brand site. It is not a generic starter app. Changes should make the portfolio clearer, more polished, more credible, more accessible, or easier to maintain.

The current visual direction is a dark cosmic command-center portfolio:

- Space-like Three.js background.
- Sticky orbital navigation with active section state.
- Deterministic Portfolio Lab in the right sidebar.
- Floating buttons, cosmic cards, section kickers, orbit chips, and readable dark section backdrops.
- No visible "AI Twin", "Chat with Anant", ChatKit branding, or chatbot framing.

`ORBY.md` contains a future scroll companion concept. It is not implemented yet. Treat it as a product spec, not current code.

## Stack

- Next.js 16.1.1 App Router with React 19.2.3.
- TypeScript, strict mode, path alias `@/*` to `src/*`.
- Tailwind CSS v4 through `src/app/globals.css`; no Tailwind v3 config.
- shadcn/ui and Radix primitives in `src/components/ui/`.
- Three.js through `@react-three/fiber`, `@react-three/drei`, and `@react-three/postprocessing`.
- Sanity v4 with `next-sanity` live content API.
- Clerk guards private routes and Sanity Studio access.
- Vitest 4 with jsdom for focused component/property tests.
- Biome for linting/formatting. Do not introduce ESLint or Prettier.
- pnpm is the package manager.

## Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Next.js development server |
| `pnpm build` | Production build; runs `pnpm typegen`, `pnpm typecheck`, then `next build` |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run Biome checks |
| `pnpm format` | Format with Biome |
| `pnpm typegen` | Extract Sanity schema and regenerate generated Sanity types |
| `pnpm typecheck` | Run TypeScript compiler |
| `pnpm test` | Run Vitest test suite |
| `pnpm test:watch` | Run Vitest in watch mode |

Prefer targeted verification while iterating, then run broader checks before handing off:

- Component/data-only changes: `pnpm test`, `pnpm typecheck`.
- Schema/query changes: `pnpm typegen`, `pnpm typecheck`, and relevant tests.
- Broad UI or routing changes: `pnpm test`, `pnpm typecheck`, `pnpm build`.
- Pure style changes still need visual/manual QA at mobile and desktop widths.

## Project Structure

- `codex/CODEX_MAX_CAPACITY_PLAN.md` - Codex CLI/App operating plan and multi-agent work distribution.
- `codex/skills/` - Repo source for project-specific Codex skills. Install with `bash codex/install-skills.sh`.
- `codex/hooks/` - Repeatable pre-task, verification, security-audit, and context-snapshot scripts.
- `codex/mcp/README.md` - Safe Codex MCP setup notes using environment variables instead of committed secrets.
- `src/app/` - App Router pages, layout, global CSS, draft-mode API routes, Sanity Studio route.
- `src/components/sections/` - Main portfolio sections.
- `src/components/three/` - Three.js background and projects carousel.
- `src/components/lab/` - Portfolio Lab panel, evidence cards, proof pack.
- `src/components/ui/` - shadcn/Radix UI primitives and CometCard.
- `src/components/cards/` - Reusable section cards.
- `src/hooks/` - UI hooks such as active section, mobile state, scroll visibility, tilt, mouse position.
- `src/lib/` - Utilities, Portfolio Lab static data, local NDJSON content adapter.
- `src/sanity/lib/` - Sanity client, live fetch wrapper, image helper, server clients, shared GROQ queries.
- `src/sanity/schemaTypes/` - Sanity document schemas.
- `src/sanity/types/index.ts` - generated Sanity types. Never edit manually.
- `Data/` - NDJSON seed/local fallback content and import scripts.
- `.kiro/specs/portfolio-ui-enhancement/` - completed design/spec/task archive for the current UI overhaul.
- `.cursor/` and `.kiro/` - other-agent context. Use as reference, but keep Codex guidance in this file.

## Runtime Architecture

`src/app/layout.tsx` wraps the app with `ClerkProvider`, `ThemeProvider`, `SidebarProvider`, the right-side `AppSidebar`, bottom-right `SidebarToggle`, and `<SanityLive />`.

`src/app/page.tsx` renders `PortfolioContent`, which fetches navigation and projects, renders the fixed Three.js `ObsidianBackground`, and composes the portfolio sections in order:

1. Hero
2. About
3. Experience
4. Projects
5. Skills
6. Education
7. Certifications
8. Achievements
9. Blog
10. Contact
11. Footer

Most sections are server components that fetch with `sanityFetch`. Interactive pieces are client components, for example `HeroContent`, `ProjectsSlider`, `SkillsSectionClient`, `EducationFlowchart`, `PortfolioLab`, and `ContactPanel`.

## Content Flow

Use `sanityFetch` from `src/sanity/lib/live.ts` for content reads. It wraps `next-sanity/live` and provides a local fallback from `Data/*.ndjson`.

Important local-content behavior:

- In development, local NDJSON is preferred unless `PORTFOLIO_CONTENT_SOURCE=sanity`.
- If Sanity returns no usable data or throws, the wrapper falls back to local NDJSON when it recognizes the query.
- `src/lib/localContent.ts` maps known GROQ query strings to local data loaders by checking for `_type == "..."`.
- When adding a new query that should work offline, update `localContent.ts` and add or extend the matching NDJSON file.

Current Sanity configuration:

- Project/dataset/API version come from `src/sanity/env.ts` and environment variables.
- Studio is mounted at `/studio`.
- Singletons use `singleton-profile` and `singleton-site-settings`.
- Shared queries live in `src/sanity/lib/queries.ts`, while some section-local queries live beside their section.
- Use `defineQuery()` for GROQ so typegen can map query results.

After any schema change in `src/sanity/schemaTypes/`:

1. Run `pnpm typegen`.
2. Run `pnpm typecheck`.
3. Update affected GROQ queries and local NDJSON fallback mapping.
4. Do not hand-edit `src/sanity/types/index.ts`.

## UI System

The shared UI vocabulary is defined in `src/app/globals.css`:

- `.cosmic-card`
- `.cosmic-card--dark`
- `.cosmic-card--subtle`
- `.float-btn`
- `.section-kicker`
- `.orbit-chip`
- `.section-backdrop`

Use these instead of rebuilding one-off translucent cards, tag pills, and floating buttons. Keep text-heavy sections readable over the Three.js background with `section-backdrop`.

`CometCard` supports `variant="default" | "dark" | "subtle"`. Use darker/subtle variants for large cards so tilt and glare do not overpower content.

Design constraints:

- Tailwind utilities only unless editing existing global CSS utilities.
- Reuse existing shadcn/Radix primitives and lucide icons.
- Keep dark mode as the default visual experience.
- Preserve semantic HTML, keyboard access, aria labels on icon-only buttons, and reduced-motion behavior.
- Do not add visible instructional copy explaining the interface unless the user explicitly asks.
- Do not reintroduce ChatKit, AI Twin, or chatbot copy into visible UI.

## Portfolio Lab

The sidebar currently renders `PortfolioLab`, not ChatKit. `src/lib/lab-data.ts` contains deterministic modes, chips, responses, evidence, and proof-pack generation.

Portfolio Lab expectations:

- Opens from `SidebarToggle` without Clerk sign-in.
- Four modes: Recruiter, Builder, Research, Skeptic.
- No generation API calls.
- Evidence cards should link to portfolio sections when possible.
- Recruiter mode includes proof-pack copy behavior.

If making the lab more dynamic, preserve the deterministic no-cost baseline unless the user explicitly asks for real AI behavior.

## Authentication And Routing

Clerk is still part of the app. Studio/private route protection is handled by proxy files.

There are currently two proxy-related files:

- `proxy.ts` at the repository root.
- `src/proxy.ts`.

Verify which one Next.js is actually using before changing auth behavior. Do not casually delete either without checking route behavior and build output.

## MCP And Secrets

Treat `.env.local`, `.mcp.json`, `.kiro/settings/mcp.json`, and Claude/Cursor/Kiro settings as sensitive. Do not print tokens or copy secrets into docs.

Current setup drift to know:

- Codex CLI is installed.
- Codex MCP is configured for Pencil, Obsidian, Sanity, and Clerk.
- Obsidian reads `OBSIDIAN_API_KEY` and `OBSIDIAN_BASE_URL` from the shell environment at runtime.
- Sanity and Clerk MCP entries may require browser/OAuth login before use.
- `.mcp.json` has been replaced by `.mcp.example.json`; keep real MCP secrets untracked.
- `.env.local` is ignored by `.gitignore`; keep it that way.

If the user asks to configure Codex MCPs, prefer environment-variable based setup and avoid committing project-local secrets. Use `codex mcp list` to inspect current Codex servers.

## Codex Project Skills And Hooks

Project skill sources live in `codex/skills/`:

- `portfolio-architecture`
- `portfolio-content-sanity`
- `portfolio-ui-polish`
- `portfolio-verification`

Install or refresh them with `bash codex/install-skills.sh`. Use `codex/hooks/pre-task.sh` at the start of substantial work, `codex/hooks/verify.sh` for quality gates, `codex/hooks/security-audit.sh` before MCP/env/tooling work, and `codex/hooks/context-snapshot.sh` for handoffs.

Read `codex/CODEX_MAX_CAPACITY_PLAN.md` when coordinating work across Codex CLI, Codex App, Cursor, Kiro, and other agents.

## Tests

Vitest tests live under `src/components/__tests__/` and `src/components/ui/__tests__/`. They include property-style checks for:

- CometCard variants.
- Hero terminal fallback.
- Section backdrops.
- Experience/project/achievement/blog chip styling.
- Skills category filtering.
- Education flowchart behavior.
- Portfolio Lab response mapping.
- Banned visible text.
- Icon-only button accessibility.

These tests encode product/design requirements, not just implementation details. Update them deliberately when requirements change.

## Coding Standards

- Server Components by default; add `"use client"` only for hooks, events, browser APIs, or animation libraries that require it.
- Export components as named exports except Next.js pages/layouts and existing default patterns.
- Prefer focused patches over broad rewrites.
- Preserve existing public component APIs unless the task requires changing them.
- Use `import type` for type-only imports.
- Prefer interfaces for component props and types for unions/intersections.
- Use `cn()` from `@/lib/utils` for conditional classes when class logic is non-trivial.
- Biome organizes formatting/imports; do not manually churn imports outside the touched files.
- Do not add dependencies unless necessary and justified.

## Known Risks And Gaps

- `AGENTS.md` used to describe ChatKit as the active sidebar; that is stale. The active product is Portfolio Lab.
- `README.md` is still the default Next.js starter README and does not describe the real project.
- Root `.mcp.json` is intentionally deleted from the working tree and ignored; use `.mcp.example.json` as the template.
- A previous zero-byte `.codex` placeholder was removed; use tracked `codex/` for project setup assets.
- `ORBY.md` is a planned feature spec and may be the next major UI addition.
- `BlogFeed.tsx` contains a TODO for an archive toggle that needs a Sanity schema change.

## Before Handing Off

For code changes, summarize:

- Files changed and why.
- Verification commands run and results.
- Any commands not run.
- Manual QA needed for visual/layout work.
- Security or setup risks discovered, especially around env/MCP config.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- ALWAYS read graphify-out/GRAPH_REPORT.md before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- The installed CLI requires a subcommand. Do not run `graphify .`; use `graphify update .` for the no-cost AST graph refresh, or `graphify extract .` when intentionally running the full extraction pipeline.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
