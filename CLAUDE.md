# CLAUDE.md

Claude Code should treat `AGENTS.md` as the canonical project brief. This file is a short compatibility guide for Claude-specific sessions and should not override Codex project guidance.

## Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Next.js development server |
| `pnpm build` | Run typegen, typecheck, and production build |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run Biome checks |
| `pnpm format` | Format with Biome |
| `pnpm typegen` | Regenerate Sanity schema/types |
| `pnpm typecheck` | Run TypeScript |
| `pnpm test` | Run Vitest |

## Current Architecture

- Next.js 16 App Router with React 19, TypeScript, Tailwind CSS v4, pnpm, Biome, and Vitest.
- Sanity Studio is mounted at `/studio` and protected by Clerk.
- The public portfolio page renders the dark cosmic command-center experience with Three.js background, orbital navigation, portfolio sections, and the deterministic Portfolio Lab sidebar.
- There is no active ChatKit, chatbot, AI Twin, or `components/chat/` feature. Do not reintroduce that framing in visible UI.
- Content reads should go through `sanityFetch`; development falls back to `Data/*.ndjson` unless `PORTFOLIO_CONTENT_SOURCE=sanity` is set.
- Local MCP and agent settings may contain secrets. Do not print or commit `.env.local`, `.mcp.json`, `.kiro/settings/`, `.claude/`, or local Cursor settings.

## Files To Know

- `AGENTS.md` - canonical repo instructions.
- `proxy.ts` and `src/proxy.ts` - Clerk/Next proxy behavior; verify runtime routing before editing auth.
- `src/components/PortfolioContent.tsx` - page section composition.
- `src/components/lab/` and `src/lib/lab-data.ts` - Portfolio Lab UI and deterministic content.
- `src/lib/localContent.ts` - local NDJSON fallback adapter.
- `src/sanity/schemaTypes/` and `src/sanity/lib/queries.ts` - Sanity schema/query surface.
