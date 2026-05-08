# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js development server |
| `pnpm build` | Build for production (runs typegen, typecheck, then next build) |
| `pnpm start` | Start Next.js production server |
| `pnpm lint` | Run Biome formatter/linter |
| `pnpm format` | Format code with Biome |
| `pnpm typegen` | Generate Sanity types from schema |
| `pnpm typecheck` | Run TypeScript compiler |

## Architecture

### Stack
- **Framework**: Next.js 16.1.1 (App Router)
- **UI**: React 19.2.3 with Tailwind CSS v4
- **Styling**: shadcn/ui + Radix UI primitives
- **3D Graphics**: Three.js with `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- **CMS**: Sanity (v4.22.0) with live content API
- **Auth**: Clerk (@clerk/nextjs)

### Project Structure
- `src/app/` - Next.js App Router pages (main page, studio)
- `src/components/` - Reusable React components
  - `components/sections/` - Portfolio section components (Hero, About, Experience, Projects, etc.)
  - `components/three/` - Three.js canvas components (ObsidianBackground, ProjectsSlider)
  - `components/chat/` - AI ChatKit components (ChatWrapper, Chat)
  - `components/ui/` - shadcn/ui components
- `src/sanity/` - Sanity configuration
  - `lib/` - Client setup and queries (`queries.ts`, `live.ts`, `client.ts`)
  - `schemaTypes/` - Sanity document schemas
  - `types/` - Auto-generated TypeScript types from schema
  - `structure.ts` - Sanity Studio navigation structure

### Key Patterns

1. **Sanity Integration**: Uses `sanityFetch` from `next-sanity/live` for live content updates. Render `<SanityLive />` in layout for auto-updates.

2. **Type Safety**: Schema-driven development with `sanity schema extract` and `sanity typegen generate` for type safety.

3. **Styling**: Tailwind utilities only - no separate CSS files unless existing pattern.

4. **Sidebar**: Uses Radix-based sidebar component with `SidebarProvider` context. Collapsible with offcanvas behavior.

5. **Chat Feature**: OpenAI ChatKit React integrated as sidebar chat with workflow-based AI responses.

6. **Theme**: Dark mode default with `next-themes` provider.
