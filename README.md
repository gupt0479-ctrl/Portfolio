# Anant Gupta Portfolio

Dark cosmic command-center portfolio built with Next.js, React, Tailwind CSS v4, Sanity, Clerk, Three.js, and a deterministic Portfolio Lab sidebar.

## Stack

- Next.js 16.1.1 App Router
- React 19.2.3
- TypeScript
- Tailwind CSS v4
- shadcn/ui + Radix UI
- Three.js / React Three Fiber
- Sanity v4 with `next-sanity` live content
- Clerk auth for protected routes and Studio access
- Vitest + Testing Library
- Biome for linting and formatting

## Setup

Install dependencies:

```bash
pnpm install
```

Create `.env.local` with the required public Sanity values and private tokens:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=...
NEXT_PUBLIC_SANITY_API_VERSION=...
SANITY_SERVER_API_TOKEN=...
SANITY_API_TOKEN=...

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

Do not commit `.env.local`, `.mcp.json`, or local MCP tokens.

## Development

```bash
pnpm dev
```

The app runs at `http://localhost:3000`.

In development, `sanityFetch` prefers local NDJSON content from `Data/` unless `PORTFOLIO_CONTENT_SOURCE=sanity` is set. This keeps most UI work unblocked when Sanity is unavailable.

## Content

Primary content lives in Sanity schemas under `src/sanity/schemaTypes/`.

Local fallback content lives in `Data/*.ndjson` and is normalized by `src/lib/localContent.ts`.

After schema changes:

```bash
pnpm typegen
pnpm typecheck
```

Never edit `src/sanity/types/index.ts` by hand.

## Verification

```bash
pnpm test
pnpm typecheck
pnpm build
```

`pnpm lint` runs Biome. If Sanity CLI cannot write to `~/.config/sanity` during `pnpm build` in a sandbox, rerun the build with permission outside the sandbox.

## Deployment

The site deploys to Vercel. Push to the main branch to trigger a production build. Ensure all required environment variables are configured in the Vercel project settings.

Required environment variables for production:
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_API_VERSION`
- `SANITY_SERVER_API_TOKEN`
- `SANITY_API_TOKEN`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
