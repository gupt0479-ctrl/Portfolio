# CLAUDE.md — Claude's Source of Truth

**Mission:** Zero build errors. Excellent Core Web Vitals. Deploy Anant's portfolio.

`AGENTS.md` is the Codex equivalent brief — read it for full product context. This file takes precedence for all Claude Code sessions.

---

## Quick Commands

| Command | What |
|---------|------|
| `pnpm dev` | Start dev server |
| `pnpm build` | typegen → typecheck → next build |
| `pnpm lint` | Biome check |
| `pnpm format` | Biome format --write |
| `pnpm typegen` | Regenerate Sanity types from schema |
| `pnpm typecheck` | TypeScript strict check (tsc --noEmit) |
| `pnpm test` | Vitest run |
| `pnpm test:watch` | Vitest watch |

---

## Current Stack

- **Framework**: Next.js 16.1.1 App Router, React 19.2.3
- **Language**: TypeScript strict (`@/*` → `src/*`)
- **Styling**: Tailwind CSS v4 via `src/app/globals.css` (no v3 config)
- **CMS**: Sanity v4 + `next-sanity` live content API
- **Auth**: Clerk — guards `/studio` only, public portfolio is open
- **3D**: Three.js via `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- **Lint/Format**: Biome 2.2.0 — never add ESLint or Prettier
- **Package manager**: pnpm
- **Tests**: Vitest 4 + jsdom + @testing-library/react
- **Deploy**: Vercel, auto-deploy on push to `main`

---

## What Does NOT Exist

- No chatbot, AI Twin, ChatKit, or `/api/chatkit` route — do not add these
- No LangChain, OpenAI embedding pipeline, or Supabase pgvector
- No OPENAI_API_KEY dependency in this project

---

## Build Pipeline to Zero Errors

Always run in this order:

```bash
pnpm typegen        # 1. Sync Sanity schema → src/sanity/types/index.ts
pnpm typecheck      # 2. TypeScript strict
pnpm lint           # 3. Biome (fix with pnpm format, then address remaining)
pnpm build          # 4. Full production build
```

Never commit with TypeScript errors or Biome warnings.

---

## ECC Plugin Commands (use these)

The `everything-claude-code` plugin is active. Use these workflows:

| Situation | Command |
|-----------|---------|
| Planning any feature | `/plan` |
| Code just written | `/code-review` |
| Build/type errors | `/build-fix` |
| Before committing | `/verify` |
| Need current docs | `/docs <library>` |
| Testing UI flows | `/e2e` |
| Session ending | `/save-session` |
| Resuming work | `/resume-session` |
| Deploying | `/deploy` |
| Writing tests first | `/tdd` |

---

## ECC Agents — When to Delegate

| Task | Agent |
|------|-------|
| TypeScript / build errors | `everything-claude-code:build-error-resolver` |
| Code quality review | `everything-claude-code:code-reviewer` |
| TypeScript-specific review | `everything-claude-code:typescript-reviewer` |
| Security audit | `everything-claude-code:security-reviewer` |
| Feature planning | `everything-claude-code:planner` |
| Architecture decisions | `everything-claude-code:architect` |
| E2E test generation | `everything-claude-code:e2e-runner` |
| Performance optimization | `vercel:performance-optimizer` |
| Deployment issues | `vercel:deployment-expert` |
| Next.js caching strategy | `vercel:next-cache-components` |

---

## Key Files

| File | Role |
|------|------|
| `src/components/PortfolioContent.tsx` | Page section composition (server) |
| `src/components/sections/` | Hero, About, Experience, Projects, Skills, Education, Certs, Blog, Contact, Footer |
| `src/components/three/` | ObsidianBackground + Graph (Three.js) |
| `src/components/lab/` | Portfolio Lab sidebar panel |
| `src/lib/lab-data.ts` | Lab static/deterministic data |
| `src/lib/localContent.ts` | NDJSON fallback adapter |
| `src/sanity/lib/live.ts` | `sanityFetch()` — the only way to read content |
| `src/sanity/lib/queries.ts` | Shared GROQ queries |
| `src/sanity/schemaTypes/` | Sanity document schemas |
| `src/sanity/types/index.ts` | GENERATED — never edit manually |
| `proxy.ts` / `src/proxy.ts` | Clerk auth proxy — verify which Next.js uses before editing |
| `Data/*.ndjson` | Local dev fallback content |

---

## Content Flow

`sanityFetch()` in `src/sanity/lib/live.ts` is the **only** way to read content.

- **Dev**: NDJSON in `Data/` preferred unless `PORTFOLIO_CONTENT_SOURCE=sanity`
- **Prod**: Live Sanity CMS
- **Adding a new query**: update `src/lib/localContent.ts` + add/extend the matching NDJSON file
- **After any schema change**: `pnpm typegen` → `pnpm typecheck` → update queries → update localContent.ts

---

## UI System Rules

Global CSS utilities (`src/app/globals.css`):
- `.cosmic-card` / `.cosmic-card--dark` / `.cosmic-card--subtle`
- `.float-btn`, `.section-kicker`, `.orbit-chip`, `.section-backdrop`
- `CometCard` component: `variant="default" | "dark" | "subtle"`

Rules:
- Dark cosmic theme is the default — never change this
- `cn()` from `src/lib/utils.ts` for class merging — always use it
- Tailwind utilities only; no custom CSS unless editing globals
- Reuse shadcn/Radix primitives and lucide icons
- Semantic HTML, aria labels on icon-only buttons, reduced-motion support

---

## Performance Rules

- `ObsidianBackground` **must** use `next/dynamic` with `{ ssr: false }`
- Server Components by default; `'use client'` only where interactive
- All images: `next/image` with explicit `width` + `height`
- No `console.log` in production (ECC hooks enforce this)
- Sanity images: use `urlFor()` from `src/sanity/lib/image.ts`

---

## Security Rules

Never print, log, or commit:
- `.env.local`
- `.mcp.json`
- `.kiro/settings/`
- `.claude/` file contents
- Any API token, secret, or key

---

## Slash Commands (this project)

Stored in `.claude/commands/` — invoke with `/command-name` in any session:

| Command | What |
|---------|------|
| `/deploy` | Full pre-deploy checklist + Vercel push |
| `/build-fix` | Fix TypeScript/build errors |
| `/review` | Full code review |
| `/sanity-push` | Push Sanity Studio + schema |
| `/add-project` | Add portfolio project via Sanity |
