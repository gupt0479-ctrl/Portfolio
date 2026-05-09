---
inclusion: auto
---

# Portfolio Project Context

## Tech Stack
- Next.js 16.1.1 (App Router, React Compiler enabled)
- React 19.2.3 with Tailwind CSS v4 (no v3 config — uses CSS-native `@theme`)
- shadcn/ui (new-york style) + Radix UI primitives
- Three.js via `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- Sanity CMS v4.22.0 with live content API (`next-sanity`)
- Clerk authentication (`@clerk/nextjs`)
- OpenAI ChatKit React for AI chat sidebar
- Framer Motion / Motion for animations
- Biome for linting and formatting (not ESLint/Prettier)
- pnpm as package manager

## Project Structure
- `src/app/` — Next.js App Router pages and API routes
- `src/components/sections/` — Portfolio section components (Hero, About, Experience, etc.)
- `src/components/three/` — Three.js canvas components (ObsidianBackground, ProjectsSlider)
- `src/components/chat/` — AI ChatKit components
- `src/components/ui/` — shadcn/ui primitives
- `src/components/cards/` — Reusable card components
- `src/sanity/schemaTypes/` — Sanity document schemas (profile, project, skill, experience, education, certifications, achievement, blog, contact, siteSettings, navigation)
- `src/sanity/lib/` — Sanity client, queries, image helpers, live config
- `src/sanity/types/` — Auto-generated TypeScript types from `pnpm typegen`
- `src/hooks/` — Custom React hooks (useMousePosition, useTilt, useShowOnScroll, use-mobile)
- `Data/` — NDJSON seed data and import scripts for Sanity
- `public/` — Static assets

## Key Commands
| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Full build (typegen → typecheck → next build) |
| `pnpm lint` | Biome check |
| `pnpm format` | Biome format --write |
| `pnpm typegen` | Extract Sanity schema + generate TS types |
| `pnpm typecheck` | `tsc --noEmit` |

## Sanity Configuration
- Project ID: `hh1i87hh`
- Dataset: `develop`
- API Version: `2025-01-01`
- Studio mounted at `/studio`
- Singletons: `singleton-profile`, `singleton-site-settings`
- Uses `sanityFetch` from `next-sanity/live` for live content
- GROQ queries defined in `src/sanity/lib/queries.ts`
- Types auto-generated — never edit `src/sanity/types/index.ts` manually

## Obsidian ↔ Sanity Bridge
This portfolio is the hub where Obsidian notes and Sanity CMS talk to each other. The workflow:
1. Write detailed content in Obsidian (project deep-dives, blog drafts, experience notes)
2. Pull structured data from Obsidian into the portfolio
3. Transform and push content to Sanity CMS for rendering
4. The portfolio renders live from Sanity with real-time updates

When working with Obsidian content:
- Use the `obsidian` MCP server to read/search notes
- Use the `sanity` MCP server to create/update Sanity documents
- Map Obsidian frontmatter fields to Sanity schema fields
- Preserve rich text formatting when converting markdown to Portable Text

## Authentication
- Clerk handles auth with publishable key and secret key in `.env.local`
- Sign-in at `/sign-in`, sign-up at `/sign-up`
- Use the `clerk` MCP server for up-to-date SDK patterns

## Styling Rules
- Tailwind CSS v4 only — no separate CSS files unless existing pattern
- Dark mode is default, managed by `next-themes`
- Use `cn()` utility from `@/lib/utils` for conditional classes
- shadcn/ui components live in `src/components/ui/`
- Animations use Framer Motion or the `motion` package
