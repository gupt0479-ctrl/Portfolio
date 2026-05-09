---
inclusion: auto
---

# Coding Standards

## TypeScript
- Strict mode enabled — no `any` types unless absolutely necessary
- Use `type` imports for type-only imports: `import type { X } from "y"`
- Prefer interfaces for component props, types for unions/intersections
- All Sanity types come from `@/sanity/types` — never define them manually
- Run `pnpm typegen` after any Sanity schema change

## React & Next.js
- Server Components by default — only add `"use client"` when needed (hooks, event handlers, browser APIs)
- Use `async` server components for data fetching with `sanityFetch`
- Colocate GROQ queries in the component that uses them, or in `src/sanity/lib/queries.ts` for shared queries
- Use `defineQuery()` from `next-sanity` for all GROQ queries (enables typegen)
- Path aliases: `@/*` maps to `./src/*`

## Component Patterns
- Section components go in `src/components/sections/`
- UI primitives go in `src/components/ui/` (managed by shadcn)
- Three.js components go in `src/components/three/`
- Name files PascalCase for components: `HeroSection.tsx`
- Export components as named exports, not default (except pages)
- Keep components focused — extract sub-components when a file exceeds ~200 lines

## Sanity Schema Changes
After modifying any file in `src/sanity/schemaTypes/`:
1. Run `pnpm typegen` to regenerate types
2. Run `pnpm typecheck` to verify nothing broke
3. Update relevant GROQ queries if fields changed

## Formatting & Linting
- Biome handles both formatting and linting — never use ESLint or Prettier
- 2-space indentation
- Run `pnpm lint` to check, `pnpm format` to auto-fix
- Biome config is in `biome.json` at project root

## Git Practices
- Keep commits atomic and descriptive
- Don't commit `.env.local`, `node_modules`, `.next`, or generated types

## Imports
- Use path aliases: `@/components/...`, `@/sanity/...`, `@/hooks/...`, `@/lib/...`
- Biome auto-organizes imports — don't manually sort
