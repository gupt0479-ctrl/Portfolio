---
name: "source-command-typecheck"
description: "Sync Sanity types then run TypeScript strict check — reach zero errors"
---

# source-command-typecheck

Use this skill when the user asks to run the migrated source command `typecheck`.

## Command Template

# /typecheck

## Steps (run in order)

```bash
pnpm typegen 2>&1     # mandatory first — regenerates src/sanity/types/index.ts from schema
pnpm typecheck 2>&1   # TypeScript strict — capture all errors at once
```

## Fix in This Order

1. **Sanity type mismatch** → re-run `pnpm typegen`, check `src/sanity/schemaTypes/` for recent changes
2. **Missing import** → `@/*` alias maps to `src/*` — verify path
3. **`'use client'` violation** → add directive at top of file, or extract interactive logic to a hook
4. **Three.js SSR error** → `next/dynamic(() => import('@/components/three/...'), { ssr: false })`
5. **Clerk `auth()` in client** → move auth check to Server Component or Route Handler
6. **`await` missing on params/searchParams** → Next.js 16 — these are Promises
7. **General type error** → fix the type — never `as any` or `@ts-ignore`

## Verify

```bash
pnpm typecheck   # must exit 0
```

## If Still Failing

Delegate to ECC's specialist for complex cascading errors:
```
Spawn everything-Codex:build-error-resolver
```

It makes minimal diffs — no architecture changes, just fixes the type errors.
